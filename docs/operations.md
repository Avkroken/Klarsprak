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

## D1 data locality och read replication

Produktionsdatabasen ska skapas med `jurisdiction=eu`. Cloudflare-jurisdiction är creation-time providerkonfiguration och kan inte läggas till på en befintlig D1-databas; replacement görs därför genom verifierad export/import till en ny EU-databas före binding-cutover.

Klarspråks D1-requestväg använder Sessions API. Read replication får därför vara `auto` på EU-databasen; replikerna hålls inom den konfigurerade EU-jurisdictionen.

Produktionsmigrationer ska gå via bindingen:

```bash
npm run migrate:production
```

## Code scanning

Klarspråk använder repositoryägd GitHub CodeQL Advanced Setup via `.github/workflows/codeql.yml` för GitHub Actions och JavaScript/TypeScript. Workflown kör på push/PR mot `main`, merge queue och schemalagd analys. Ändra inte code-scanning-modellen eller required checks som workaround för en failing PR; verifiera provider-state separat när governance berörs.

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

Verifiera validering, Turnstile och att ett förslag hamnar i review-state utan automatisk publicering. Response-CSP ska explicit tillåta `https://challenges.cloudflare.com` för Turnstiles script/frame och ska inte återinföra `'unsafe-inline'` för `script-src`. `script-src` ska innehålla en unik `nonce-...` per response; efter production deploy ska Cloudflares injicerade JavaScript Detection-script bära samma nonce så att det inte blockeras av CSP.

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

## Portable GitHub automation ownership

The repository uses GitHub's current `github.repository` for API routing instead of assuming a fixed account. For GitHub **organizations**, configure the repository or inherited organization Actions variable `AUTO_ASSIGN_USER` to an individual collaborator if automatic assignment is wanted. The organization name is never used as an issue assignee.

Configure the exact trusted principals in Actions variables `TRUSTED_AGENT_USER_LOGIN`, `TRUSTED_AGENT_BOT_LOGIN`, `TRUSTED_DEPENDABOT_LOGIN`, and `TRUSTED_COPILOT_BOT_LOGIN` before enabling autonomous agent post-merge dispatch, bot PR processing and issue delegation. Missing configuration disables only the privileged action; it does not silently authorize other accounts. Provider-independent workflows may still run without those variables.

After a fork or ownership transfer, verify GitHub App installations, GitHub Actions permissions, required independent review, rulesets and external credentials **for the new owner**. Neither a fork nor an ownership transfer grants access to the former owner's accounts. Do not hardcode former account logins into automation scripts.
