# Projektkontext

**Senast verifierad:** 2026-09-23

## Ansvar

Klarspråk publicerar källbelagda termer där allmänspråklig betydelse jämförs med institutionell/juridisk användning.

Publikt innehåll läses från D1. Användarförslag går till granskningskö och blir inte publika automatiskt utan explicit godkännande i adminflödet.

## Runtime

`wrangler.jsonc` definierar:

- Worker `klarsprak`
- entrypoint `src/index.js`
- domains `klarsprak.denied.se` och IDN-alias
- assets `public/`
- D1-binding `DB -> klarsprak-db`
- `run_worker_first=true`
- Turnstile-hostnames
- persistent observability med query-string-redaction och begränsad sampling

## Requestmodell

`src/index.js` hanterar routing runt den underliggande appen:

- canonical host/alias,
- admin path rewrite/redirect,
- SEO metadata och robots policy,
- response security/cache policy.

`src/worker.js` hanterar bland annat:

- `GET /api/terms`
- `POST /api/submit`
- admin queue/review
- publicerade termers uppdatering/status
- D1-operationer
- asset fallback

## Publiceringsmodell

Publik startsida beskriver uttryckligen att poster är källbelagda och granskade före publicering. D1 är canonical källa för publicerad termstate.

Förslagsflödet kräver Turnstile och ska förbli separerat från adminens godkännande/publicering.

## Package/runtime

Projektet använder JavaScript ES modules och Wrangler. `package.json` har scripts för dev, test, deploy, remote D1 migration och produktionsverifiering.

`package-lock.json` saknas; använd därför inte `npm ci` som om repositoryt hade ett låst npm-lockfile.

## Uppdateringskontrakt

Uppdatera dokumentationen när publiceringsmodell, admin/API-routes, D1-schema, canonical host, Turnstilegräns eller deploymentmodell ändras.
