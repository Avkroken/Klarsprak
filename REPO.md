# REPO.md

`Klarsprak` är en Cloudflare Workers-prototyp med frontend under `public/`, backend i `src/worker.js`, D1-migreringar i `migrations/` och versionshanterad Worker-konfiguration i `wrangler.jsonc`.

## Invarians

- Faktiska och juridiska påståenden ska ha källstöd; gissa inte.
- Validera opålitlig input server-side.
- Admin-auktorisering verifieras server-side mot `ADMIN_TOKEN`.
- Hemligheter, tokens och credentials får inte hårdkodas eller loggas.
- Produktionsdistribution från `main` hanteras av Cloudflare Workers Builds.
- Schemaändringar använder Wrangler-baserade D1-migreringar.

## Validering

Kör `bun run test` för relevanta ändringar. Vid Wrangler- eller D1-ändringar, validera migreringar från tom lokal state och kör `wrangler deploy --dry-run`.
