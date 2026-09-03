# CI och deploy

Repositoryts required status checks är `validate` och `osv`. Båda styrs av det aktiva organization-level rulesetet `klarsprak` med strict latest-base-verifiering.

`.github/workflows/ci.yml` producerar `validate`, blockerar ofärdiga `.github/codex-dispatch/issue-*.md`-seedfiler, kör projektets tester, applicerar D1-migrationer mot tom lokal Wrangler-state och gör Wrangler dry-run.

`.github/workflows/osv-scanner.yml` producerar repositoryts required terminal context `osv`. PR-flödet är fail-closed: `osv-preflight` verifierar PR-HEAD, `scan-pr` kör den pinnade scannern och terminaljobbet `osv` kräver explicit success från båda.

Organisationens `main`-ruleset kräver dessutom den centrala OSV-workflowen från `Avkroken/.github`. På vanliga pull requests kör den `scan-pr`; i merge queue kör den `scan-merge-group`. Den centrala workflowen är en required workflow, inte en separat organization-level required status check med namnet `scan-pr / osv-scan`.

CodeQL merge protection, review-thread resolution, squash-only och övriga gemensamma merge-regler hanteras centralt av organisationens aktiva rulesets. Repositoryt använder merge queue.

GitHub Actions deployar inte produktion. Cloudflare Workers Builds äger normal production deployment från `main`. `wrangler.jsonc` är source of truth för versionshanterad Worker-konfiguration och runtime-secrets ligger i Cloudflare.
