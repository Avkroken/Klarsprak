# Drift

## Lokal verifiering

```bash
npm install
npm test
npx wrangler deploy --dry-run
```

Central Cloudflare CI använder unlocked npm-installation eftersom repositoryt inte har `package-lock.json`.

## D1

Produktionsmigration:

```bash
npm run migrate:production
```

Kör inte manuella schemaändringar som saknar versionsstyrd migration.

## Deployment

`npm run deploy` använder `wrangler deploy --strict`. Dokumentations- och PR-verifiering ska normalt använda test/dry-run och inte implicit deploya.

## Produktionskontroll

`npm run verify:production` kör repositoryts domän-/produktionskontroll. Använd den efter avsedd deployment, inte som ersättning för lokala tester.

## Incidenter

Vid fel i publik termvisning:

1. verifiera Worker-route/canonical host,
2. verifiera D1-read,
3. verifiera att `published_terms`-state är korrekt,
4. kontrollera assets/frontend först därefter.

Vid submissionsproblem: verifiera Turnstile och D1 submission state innan adminflödet ändras.

## Observability

Behåll query-string-redaction och observability-värdena som deklareras i repositoryts Wrangler-konfiguration. Ändringar av loggdestinationer eller tail consumers ska vara explicita och verifierade.
