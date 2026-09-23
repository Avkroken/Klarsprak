# Klarspråk

Klarspråk är en Cloudflare Worker-baserad webbplats som jämför dokumenterad allmänspråklig betydelse med dokumenterad myndighets- och rättsanvändning av samma uttryck. Publika termer lagras i D1 och publiceras först efter granskning.

## Runtime

- Worker: `klarsprak`
- entrypoint: `src/index.js`
- canonical domain: `klarsprak.denied.se`
- IDN-alias: `klarspråk.denied.se` via punycode-route
- static assets: `public/`
- D1: `klarsprak-db`
- Cloudflare observability med query-string-redaction

Worker-lagret ligger framför assets för att upprätthålla host-redirect, adminrouting, SEO-/robots-policy och API-flöden.

## Dokumentation

- [Projektkontext](docs/project-context.md)
- [Arkitektur](docs/architecture.md)
- [Drift](docs/operations.md)
- [Avkrokens dokumentationsstandard](https://github.com/Avkroken/.github/blob/main/docs/documentation-standard.md)

## Verifiering

```bash
npm install
npm test
npx wrangler deploy --dry-run
```

Repositoryt saknar `package-lock.json`; central Cloudflare-validering använder därför den avsedda unlocked-installationsvägen i stället för `npm ci`.

## Säkerhet

Admin-/granskningsytor och Turnstile-relaterad runtimekonfiguration ska behandlas som säkerhetsgränser. Secrets får inte läggas i repository eller dokumentation. Rapportera sårbarheter privat enligt [SECURITY.md](SECURITY.md).
