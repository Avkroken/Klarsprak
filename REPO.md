# REPO.md

`Klarsprak` är en Cloudflare Workers-prototyp med frontend under `public/`, backend i `src/worker.js`, D1-migreringar i `migrations/` och versionshanterad Worker-konfiguration i `wrangler.jsonc`.

## Invarians

- Faktiska och juridiska påståenden ska ha källstöd; gissa inte.
- Validera opålitlig input server-side.
- Admin-auktorisering verifieras server-side mot `ADMIN_TOKEN`.
- Hemligheter, tokens och credentials får inte hårdkodas eller loggas.
- Produktionsdistribution från `main` hanteras av Cloudflare Workers Builds.
- Schemaändringar använder Wrangler-baserade D1-migreringar.

## GitHub-styrning

- Kanonisk arbets- och reviewpolicy finns i `Avkroken/.github/AGENTS.md`.
- `main` skyddas av det ärvda organisationsrulesetet `main` och repo-rulesetet `required-ci`.
- Required checks på `main` är `validate` och `osv`.
- `dev` är integrationsgren när ett aktivt `dev-pilot`-ruleset finns. Lägg endast required status checks på `dev` när workflows bevisligen producerar exakt de check-namnen för PR mot `dev`.
- Organisationens CodeRabbit-UI är baslinje. Repository-lokal `.coderabbit.yaml` ska endast användas för uttryckligen repo-specifika overrides.

## Validering

Kör `bun run test` för relevanta ändringar. Vid Wrangler- eller D1-ändringar, validera migreringar från tom lokal state och kör `wrangler deploy --dry-run`.
