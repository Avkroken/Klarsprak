# Arkitektur

## Översikt

```text
Browser
  |
  v
Cloudflare route
  |
  v
src/index.js
  |  host / admin / SEO / response policy
  v
src/worker.js
  |              \
  |               +--> ASSETS (public/)
  |
  +--> D1 (DB)
        +--> publicerad termstate
        +--> submission/review-state
```

## Worker-first boundary

`wrangler.jsonc` sätter `assets.run_worker_first=true`. Det är nödvändigt eftersom asset-serving annars kan svara innan Worker-koden hinner tillämpa:

- canonical-host redirect,
- adminrouting,
- SEO/robots-policy,
- security/cache headers.

Att ändra till asset-first är därför en arkitektur- och säkerhetsändring.

## Canonical host

Den publika canonical hosten är `klarsprak.denied.se`. IDN-aliaset finns som separat route och ska canonicaliseras till huvudhosten innan normal rendering.

## Publik läsning

Publik termdata läses från D1 via API. Frontend är presentation och ska inte bära en separat kopia som kan drifta från databasen.

## Submission

`POST /api/submit` representerar publik ingress för förslag.

Flödet ska:

1. validera requesten;
2. upprätthålla Turnstile-gränsen;
3. skriva submission-state;
4. inte publicera posten automatiskt.

## Review och publicering

Adminytan arbetar mot review-state. Godkännande/publicering är explicita stateövergångar. Det gör att:

- inkommet material kan granskas innan det blir publikt;
- publikt termstate förblir skiljt från submissionhistorik;
- frontend inte behöver avgöra vad som är publicerbart.

## Trust boundaries

- **Internet → Worker:** host/routing/response-policy.
- **Publik submission → review state:** Turnstile + server-side validering.
- **Admin → review/publicering:** avsedd adminauktorisering.
- **Worker → D1:** canonical application state.
- **Worker → ASSETS:** presentation, aldrig auktoritet för termdata.

## Caching och indexering

Publika indexerbara sidor får canonical/robots metadata. Admin- och andra icke-publika ytor ska inte bli indexerbara eller cacheas som allmän publik data.

## Failure model

Vid fel i termvisning:

1. verifiera host/Worker-route;
2. verifiera API-response;
3. verifiera D1-read/state;
4. kontrollera frontend/assets sist.

Vid submissionsproblem:

1. requestvalidering;
2. Turnstile;
3. D1-write;
4. review/adminflöde.
