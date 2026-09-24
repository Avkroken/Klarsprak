# Drift

## Lokal utveckling

```bash
npm install
npm run dev
```

Repositoryt har inget `package-lock.json`, så `npm ci` är inte den verifierade installationsvägen.

## Verifiering före PR/deploy

```bash
npm test
npx wrangler d1 migrations apply DB --local
npx wrangler deploy --dry-run
```

Verifiera dessutom berörda flöden manuellt när ändringen påverkar routing, submission eller admin.

## D1

Produktionsmigrationer körs med:

```bash
npm run migrate:production
```

Regler:

- schemaändringar ska vara versionsstyrda;
- gör inte ad hoc-schemaändringar i produktion;
- verifiera migrationsordning och kompatibilitet med aktuell Worker-kod;
- uppdatera project-context när state ownership eller schemaansvar ändras.

## Deployment

```bash
npm run deploy
```

Deploy använder `wrangler deploy --strict`. Vanlig PR-verifiering ska inte implicit deploya.

Efter avsedd produktiondeploy:

```bash
npm run verify:production
```

## Verifieringsmatris

### Host/routing

Kontrollera canonical host och IDN-alias, inklusive redirect och Worker-first-beteende.

### Publik termläsning

Verifiera att API:t läser publicerad data från D1 och att frontend återger samma state.

### Submission

Verifiera validering, Turnstile och att ett förslag hamnar i review-state utan automatisk publicering.

### Admin/review

Verifiera behörighetsgräns och explicita stateövergångar för godkännande/publicering/arkivering.

### SEO/cache

Verifiera att publika sidor har avsedd canonical/robots metadata och att adminytor inte blir indexerbara eller publikt cacheade.

## Felsökning

### Tom eller felaktig publik termlista

1. host/route,
2. Worker/API,
3. D1-read/publicerad state,
4. frontend.

### Submission misslyckas

1. requestdata,
2. Turnstile,
3. D1-write,
4. serverlogg.

### Adminproblem

Kontrollera auth/route före dataändringar. Försök inte lösa accessproblem genom att göra admin-API mer publikt.

## Observability

Persistent logs/traces är aktiverade med sampling och query-string-redaction. Redaction ska behållas även under felsökning; lägg inte känsliga requestparametrar i loggar.
