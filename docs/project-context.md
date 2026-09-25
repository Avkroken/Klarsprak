# Projektkontext

**Senast verifierad:** 2026-09-24

## Ansvar

Klarspråk publicerar källbelagda termer där allmänspråklig betydelse jämförs med institutionell eller juridisk användning.

Systemet har två tydligt skilda flöden:

1. publik läsning av granskade/publicerade termer;
2. submission → review → explicit publicering.

## Runtime

`wrangler.jsonc` definierar:

- Worker: `klarsprak`
- entrypoint: `src/index.js`
- canonical domain: `klarsprak.denied.se`
- IDN-alias via punycode-route
- static assets: `public/`
- Worker-first assetmodell
- D1-binding: `DB -> klarsprak-db-eu`
- Turnstile-hostnames
- persistent observability med query-string-redaction
- log sampling 0.1 och trace sampling 0.01

## Kodansvar

### `src/index.js`

Externa requestpolicyn: canonical host, aliasredirect, adminrouting, SEO/robots och response policy.

### `src/worker.js`

Applikationslogiken: publika termanrop, submissions, review/adminflöden, D1-operationer och asset fallback.

## Data och state

Produktionsbindingen `DB` ska peka på en D1-databas skapad med Cloudflare-jurisdiction `eu`. Repositoryts Worker-kod använder D1 Sessions API för D1-routes; read replication kan därför vara aktiverad på EU-databasen utan att frångå sequential-consistency-kontraktet.

D1 är canonical applikationsstate för publicerade termer och granskningsflödet.

Frontend eller statiska assets får inte bli en alternativ termdatabas.

## Publiceringsmodell

Submission och publicering är separata operationer. Ett inkommet förslag blir inte publikt utan explicit review/publiceringsövergång.

Detta är en funktionell och säkerhetsmässig invariant, inte bara en UI-detalj.

## Package/runtime

Projektet använder JavaScript ES modules och Wrangler.

`package.json` tillhandahåller:

- `npm run dev`
- `npm test`
- `npm run deploy`
- `npm run migrate:production`
- `npm run verify:production`

Repositoryt saknar `package-lock.json`; använd därför `npm install`, inte `npm ci`, tills en låst npm-installationsmodell uttryckligen införs.

## Dokumentationsgräns

Det här dokumentet beskriver repo-specifik current-state som kan verifieras från repositoryts publika kod och konfiguration. Organisationsgemensam governance eller privata driftuppgifter hör inte hemma här.

## Uppdateringskontrakt

Uppdatera denna fil när följande ändras:

- publicerings-/reviewmodell,
- admin- eller API-routes,
- D1-schema eller state ownership,
- canonical host/alias,
- Turnstile-gräns,
- deployment- eller runtimekonfiguration.
