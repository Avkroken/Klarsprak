// klarsprak Worker: serverar statiska assets (public/) och API för
// community-inlämning + admin-granskning av termförslag.
//
// Routes:
//   POST /api/submit                 publikt, skriver ett förslag med status "pending"
//   GET  /api/admin/queue            skyddat (Bearer ADMIN_TOKEN), listar pending
//   POST /api/admin/review/:id       skyddat (Bearer ADMIN_TOKEN), approve/reject
//   allt annat                       vidarebefordras till ASSETS-binding

// Sajtens kanoniska värdnamn, och IDN-aliaset som pekar hit. Se
// wrangler.jsonc: båda är custom domains på samma Worker.
const CANONICAL_HOST = "klarsprak.denied.se";
const CANONICAL_ALIAS_HOST = "xn--klarsprk-g0a.denied.se";

const MAX_LEN = {
  term: 200,
  foreslagen_juridisk_definition: 4000,
  foreslagen_vardagsbetydelse: 4000,
  foreslagen_exempel: 2000,
  foreslaget_rattsomrade: 100,
  inskickare_namn: 200,
  inskickare_kommentar: 2000,
};

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...(init.headers || {}) },
  });
}

function badRequest(message) {
  return json({ error: message }, { status: 400 });
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function clean(v) {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function validateSubmission(body) {
  if (!body || typeof body !== "object") return "Ogiltig förfrågan.";
  if (!isNonEmptyString(body.term)) return "Term krävs.";
  if (body.term.trim().length > MAX_LEN.term) return `Term får vara max ${MAX_LEN.term} tecken.`;

  const juridisk = clean(body.foreslagen_juridisk_definition);
  const vardag = clean(body.foreslagen_vardagsbetydelse);
  if (!juridisk && !vardag) {
    return "Fyll i minst juridisk definition eller vardagsbetydelse.";
  }

  for (const [key, max] of Object.entries(MAX_LEN)) {
    if (key === "term") continue;
    const val = body[key];
    if (typeof val === "string" && val.length > max) {
      return `Fältet "${key}" får vara max ${max} tecken.`;
    }
  }
  return null;
}

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 timme

async function isRateLimited(env, ip) {
  if (!ip) return false; // kan inte spärra det vi inte kan identifiera
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { results } = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM submissions WHERE submitter_ip = ? AND created_at > ?`
  )
    .bind(ip, since)
    .all();
  return (results[0]?.n ?? 0) >= RATE_LIMIT_MAX;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function checkAdminAuth(request, env) {
  if (!env.ADMIN_TOKEN) return false;
  const auth = request.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  return timingSafeEqual(match[1], env.ADMIN_TOKEN);
}

async function handleSubmit(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Ogiltig JSON.");
  }

  const error = validateSubmission(body);
  if (error) return badRequest(error);

  const ip = request.headers.get("CF-Connecting-IP");
  if (await isRateLimited(env, ip)) {
    return json(
      { error: "För många förslag från samma adress. Försök igen om en stund." },
      { status: 429 }
    );
  }

  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO submissions
      (term, foreslagen_juridisk_definition, foreslagen_vardagsbetydelse, foreslagen_exempel,
       foreslaget_rattsomrade, inskickare_namn, inskickare_kommentar, status, created_at, submitter_ip)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
  )
    .bind(
      body.term.trim(),
      clean(body.foreslagen_juridisk_definition),
      clean(body.foreslagen_vardagsbetydelse),
      clean(body.foreslagen_exempel),
      clean(body.foreslaget_rattsomrade),
      clean(body.inskickare_namn),
      clean(body.inskickare_kommentar),
      now,
      ip || null
    )
    .run();

  return json({ ok: true, message: "Tack, ditt förslag granskas innan det publiceras." }, { status: 201 });
}

async function handleAdminQueue(request, env) {
  if (!checkAdminAuth(request, env)) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const { results } = await env.DB.prepare(
    `SELECT * FROM submissions WHERE status = 'pending' ORDER BY created_at ASC`
  ).all();
  return json({ submissions: results });
}

async function handleAdminReview(request, env, id) {
  if (!checkAdminAuth(request, env)) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const submissionId = Number(id);
  if (!Number.isInteger(submissionId) || submissionId <= 0) {
    return badRequest("Ogiltigt id.");
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Ogiltig JSON.");
  }

  if (body?.action !== "approve" && body?.action !== "reject") {
    return badRequest('Fältet "action" måste vara "approve" eller "reject".');
  }
  const status = body.action === "approve" ? "approved" : "rejected";
  const note = clean(body.note);
  const now = new Date().toISOString();

  const result = await env.DB.prepare(
    `UPDATE submissions SET status = ?, reviewed_at = ?, reviewer_note = ?
     WHERE id = ? AND status = 'pending'`
  )
    .bind(status, now, note, submissionId)
    .run();

  if (!result.meta.changes) {
    return json({ error: "Förslaget hittades inte eller är redan granskat." }, { status: 404 });
  }

  return json({ ok: true, status });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // klarspråk.denied.se (punycode xn--klarsprk-g0a) pekar på samma Worker,
    // men ska inte SERVERA innehållet — två värdnamn för samma sajt splittrar
    // cookies, sessioner och delade länkar, och ger dubbletter i sökindex.
    // 301 till ASCII-namnet, med sökväg och query bevarade.
    if (url.hostname === CANONICAL_ALIAS_HOST) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }

    if (request.method === "POST" && pathname === "/api/submit") {
      return handleSubmit(request, env);
    }
    if (request.method === "GET" && pathname === "/api/admin/queue") {
      return handleAdminQueue(request, env);
    }
    const reviewMatch = pathname.match(/^\/api\/admin\/review\/([^/]+)$/);
    if (request.method === "POST" && reviewMatch) {
      return handleAdminReview(request, env, reviewMatch[1]);
    }

    return env.ASSETS.fetch(request);
  },
};
