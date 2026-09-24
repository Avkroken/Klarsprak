# Klarspråk

Klarspråk är en Cloudflare Worker-baserad webbplats som jämför dokumenterad allmänspråklig betydelse med dokumenterad myndighets- och rättsanvändning av samma uttryck. Publika termer lagras i D1 och publiceras först efter granskning.

## Snabbstart

```bash
npm install
npm test
npx wrangler deploy --dry-run
```

Lokal utveckling:

```bash
npm run dev
```

## Dokumentation

Börja i **[dokumentationsöversikten](docs/index.md)**.

- [Projektkontext](docs/project-context.md) — runtime, publiceringsmodell och state
- [Arkitektur](docs/architecture.md) — Worker/assets/D1, requestflöden och trust boundaries
- [Drift](docs/operations.md) — utveckling, migration, deployment och felsökning
- [SECURITY.md](SECURITY.md) — säkerhetsrapportering

README är avsiktligt kort; detaljerna ligger under `docs/`.

## Viktiga invariants

- `src/index.js` måste köras före assets så att host-, admin-, SEO- och response-policy inte kan kringgås.
- submission och publicering är separata stateövergångar.
- publikt innehåll kommer från D1; statisk HTML är inte canonical termdatabas.
