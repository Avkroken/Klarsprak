// klarsprak Worker: statiska assets + publika termer + granskningsflöde.
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

const PUBLICATION_MAX_LEN = {
  term: 200,
  rattsomrade: 100,
  allmansprak: 4000,
  sprak_kalla_namn: 300,
  sprak_kalla_url: 2000,
  institution: 4000,
  institution_kalla_namn: 300,
  institution_kalla_url: 2000,
  skillnad: 4000,
  notering: 2000,
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

function clean(v) {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function isHttpUrl(v) {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

function validateSubmission(body) {
  if (!body || typeof body !== "object") return "Ogiltig förfrågan.";
  if (!clean(body.term)) return "Term krävs.";
  if (body.term.trim().length > MAX_LEN.term) return `Term får vara max ${MAX_LEN.term} tecken.`;
  if (!clean(body.foreslagen_juridisk_definition) || !clean(body.foreslagen_vardagsbetydelse)) {
    return "Både allmänspråklig betydelse och myndighetens/juridikens användning krävs.";
  }
  for (const [key, max] of Object.entries(MAX_LEN)) {
    if (key === "term") continue;
    const val = body[key];
    if (typeof val === "string" && val.length > max) return `Fältet "${key}" får vara max ${max} tecken.`;
  }
  return null;
}

function validatePublication(p) {
  if (!p || typeof p !== "object") return "Publiceringsdata saknas.";
  const required = [
    "term",
    "rattsomrade",
    "allmansprak",
    "sprak_kalla_namn",
    "sprak_kalla_url",
    "institution",
    "institution_kalla_namn",
    "institution_kalla_url",
    "skillnad",
  ];
  for (const key of required) {
    if (!clean(p[key])) return `Publiceringsfältet "${key}" krävs.`;
  }
  for (const [key, max] of Object.entries(PUBLICATION_MAX_LEN)) {
    if (typeof p[key] === "string" && p[key].length > max) return `Publiceringsfältet "${key}" får vara max ${max} tecken.`;
  }
  if (!isHttpUrl(p.sprak_kalla_url)) return "Språkkällans URL måste börja med http:// eller https://.";
  if (!isHttpUrl(p.institution_kalla_url)) return "Institutionens käll-URL måste börja med http:// eller https://.";
  return null;
}

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

async function isRateLimited(env, ip) {
  if (!ip) return false;
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const row = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM submissions WHERE submitter_ip = ? AND created_at > ?`
  ).bind(ip, since).first();
  return Number(row?.n || 0) >= RATE_LIMIT_MAX;
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
  return !!match && timingSafeEqual(match[1], env.ADMIN_TOKEN);
}

async function handleTerms(env) {
  const [{ results: published }, { results: legacy }] = await Promise.all([
    env.DB.prepare(
      `SELECT id, term, rattsomrade, allmansprak, sprak_kalla_namn, sprak_kalla_url,
              institution, institution_kalla_namn, institution_kalla_url,
              skillnad, notering, published_at, updated_at
         FROM published_terms
        WHERE status = 'published'
        ORDER BY LOWER(term), id`
    ).all(),
    env.DB.prepare(
      `SELECT s.id, s.term, s.foreslagen_vardagsbetydelse, s.foreslagen_juridisk_definition,
              s.foreslagen_exempel, s.foreslaget_rattsomrade, s.reviewed_at
         FROM submissions s
        WHERE s.status = 'approved'
          AND NOT EXISTS (SELECT 1 FROM published_terms p WHERE p.submission_id = s.id)
        ORDER BY LOWER(s.term), s.id`
    ).all(),
  ]);

  const terms = [
    ...published.map((row) => ({
      id: `published:${row.id}`,
      term: row.term,
      rattsomrade: row.rattsomrade,
      allmansprak: row.allmansprak,
      sprakKalla: { namn: row.sprak_kalla_namn, url: row.sprak_kalla_url },
      institution: row.institution,
      institutionKalla: { namn: row.institution_kalla_namn, url: row.institution_kalla_url },
      skillnad: row.skillnad,
      not: row.notering,
      publishedAt: row.published_at,
      updatedAt: row.updated_at,
      source: "published_terms",
    })),
    ...legacy.map((row) => ({
      id: `legacy:${row.id}`,
      term: row.term,
      rattsomrade: row.foreslaget_rattsomrade || "Annat",
      allmansprak: row.foreslagen_vardagsbetydelse,
      institution: row.foreslagen_juridisk_definition,
      kallorOchExempel: row.foreslagen_exempel,
      publishedAt: row.reviewed_at,
      source: "legacy-approved",
    })),
  ];

  return json({ terms }, { headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" } });
}

async function handleSubmit(request, env) {
  let body;
  try { body = await request.json(); } catch { return badRequest("Ogiltig JSON."); }
  const error = validateSubmission(body);
  if (error) return badRequest(error);

  const ip = request.headers.get("CF-Connecting-IP");
  if (await isRateLimited(env, ip)) {
    return json({ error: "För många förslag från samma adress. Försök igen om en stund." }, { status: 429 });
  }

  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO submissions
      (term, foreslagen_juridisk_definition, foreslagen_vardagsbetydelse, foreslagen_exempel,
       foreslaget_rattsomrade, inskickare_namn, inskickare_kommentar, status, created_at, submitter_ip)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
  ).bind(
    body.term.trim(),
    clean(body.foreslagen_juridisk_definition),
    clean(body.foreslagen_vardagsbetydelse),
    clean(body.foreslagen_exempel),
    clean(body.foreslaget_rattsomrade),
    clean(body.inskickare_namn),
    clean(body.inskickare_kommentar),
    now,
    ip || null
  ).run();

  return json({ ok: true, message: "Tack, ditt förslag granskas innan det publiceras." }, { status: 201 });
}

async function handleAdminQueue(request, env) {
  if (!checkAdminAuth(request, env)) return json({ error: "Unauthorized" }, { status: 401 });
  const { results } = await env.DB.prepare(
    `SELECT id, term, foreslagen_juridisk_definition, foreslagen_vardagsbetydelse,
            foreslagen_exempel, foreslaget_rattsomrade, inskickare_namn,
            inskickare_kommentar, created_at
       FROM submissions
      WHERE status = 'pending'
      ORDER BY created_at ASC`
  ).all();
  return json({ submissions: results }, { headers: { "cache-control": "no-store" } });
}

async function handleAdminReview(request, env, id) {
  if (!checkAdminAuth(request, env)) return json({ error: "Unauthorized" }, { status: 401 });
  const submissionId = Number(id);
  if (!Number.isInteger(submissionId) || submissionId <= 0) return badRequest("Ogiltigt id.");

  let body;
  try { body = await request.json(); } catch { return badRequest("Ogiltig JSON."); }
  if (body?.action !== "approve" && body?.action !== "reject") {
    return badRequest('Fältet "action" måste vara "approve" eller "reject".');
  }

  const submission = await env.DB.prepare(
    `SELECT id FROM submissions WHERE id = ? AND status = 'pending'`
  ).bind(submissionId).first();
  if (!submission) return json({ error: "Förslaget hittades inte eller är redan granskat." }, { status: 404 });

  const note = clean(body.note);
  const now = new Date().toISOString();

  if (body.action === "reject") {
    await env.DB.prepare(
      `UPDATE submissions SET status = 'rejected', reviewed_at = ?, reviewer_note = ? WHERE id = ? AND status = 'pending'`
    ).bind(now, note, submissionId).run();
    return json({ ok: true, status: "rejected", published: false });
  }

  const publicationError = validatePublication(body.publication);
  if (publicationError) return badRequest(publicationError);
  const p = body.publication;

  try {
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO published_terms
          (submission_id, term, rattsomrade, allmansprak, sprak_kalla_namn, sprak_kalla_url,
           institution, institution_kalla_namn, institution_kalla_url, skillnad, notering,
           status, published_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)`
      ).bind(
        submissionId,
        clean(p.term),
        clean(p.rattsomrade),
        clean(p.allmansprak),
        clean(p.sprak_kalla_namn),
        clean(p.sprak_kalla_url),
        clean(p.institution),
        clean(p.institution_kalla_namn),
        clean(p.institution_kalla_url),
        clean(p.skillnad),
        clean(p.notering),
        now,
        now
      ),
      env.DB.prepare(
        `UPDATE submissions SET status = 'approved', reviewed_at = ?, reviewer_note = ? WHERE id = ? AND status = 'pending'`
      ).bind(now, note, submissionId),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/unique|constraint/i.test(message)) {
      return json({ error: "En publicerad term med samma normaliserade namn finns redan." }, { status: 409 });
    }
    throw error;
  }

  return json({ ok: true, status: "approved", published: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (url.hostname === CANONICAL_ALIAS_HOST) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }
    if (request.method === "GET" && pathname === "/api/terms") return handleTerms(env);
    if (request.method === "POST" && pathname === "/api/submit") return handleSubmit(request, env);
    if (request.method === "GET" && pathname === "/api/admin/queue") return handleAdminQueue(request, env);
    const reviewMatch = pathname.match(/^\/api\/admin\/review\/([^/]+)$/);
    if (request.method === "POST" && reviewMatch) return handleAdminReview(request, env, reviewMatch[1]);
    return env.ASSETS.fetch(request);
  },
};
