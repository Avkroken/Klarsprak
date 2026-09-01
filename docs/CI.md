# CI och branchflöde

`main` är default branch. Varje ändring görs på en kortlivad branch och går via en ready PR till `main`. Squash merge är den enda tillåtna merge-metoden.

## Live merge-enforcement

Organisationens aktiva rulesets är verkställande sanning. Vid senaste verifieringen gäller för default branch:

- pull request krävs;
- 1 approval krävs;
- stale approvals avfärdas efter push;
- senaste pushen måste godkännas av någon annan än den som gjorde den;
- relevanta review-trådar måste vara resolved;
- deletion och non-fast-forward/force push blockeras;
- inga bypass actors är konfigurerade;
- endast squash merge är tillåtet.

Required status checks är:

- `validate`
- `osv`

Båda körs med `strict_required_status_checks_policy: true`, så verifieringen måste gälla exakt aktuell PR-HEAD mot aktuell `main`.

Org-rulesetet `main` använder dessutom CodeQL Code Scanning merge protection med `medium_or_higher` för security alerts och `errors_and_warnings` för övriga alerts. Samma org-ruleset refererar fortfarande till Regelverkets `.github/workflows/osv-scanner.yml` som central required workflow; det är organisationsnivå och måste ändras separat när den centrala OSV-kopplingen tas bort.

## Repository-CI

`.github/workflows/ci.yml` producerar `validate`. Den kör projektets tester, applicerar D1-migrationerna mot tom lokal Wrangler-state och gör en Wrangler dry-run. Workflowen verifierar repositoryts kod och Cloudflare-konfiguration men skapar eller uppdaterar inte branches/PR:er, armerar inte auto-merge och innehåller inget Codex-remediationprotokoll.

`.github/workflows/osv-scanner.yml` producerar required terminal context `osv` på pull requests. PR-flödet är avsiktligt fail-closed:

- `osv-preflight` checkar ut PR-HEAD och blockerar reserverade OSV-resultatvägar som är symboliska länkar;
- `scan-pr` använder den pinnade fail-closed revision som valts för att inte acceptera ofullständiga scannerkörningar;
- terminaljobbet `osv` kräver explicit `success` från både preflight och PR-scanner.

Scanning på `main`, schema och manual används för kompletterande rapportering och är inte den terminala PR-gaten.

## Code Scanning

GitHubs Code Scanning merge protection används för `CodeQL`:

- code-scanning alerts: `errors_and_warnings`
- security alerts: `medium_or_higher`

Trivy är inte konfigurerad i repositoryt och är därför inte en merge-gate.

## Review

Copilot Code Review och CodeRabbit är rådgivande och inte required status checks. Quota-, rate-limit- eller tillgänglighetsproblem blockerar inte ensamt merge. Faktiska relevanta findings ska däremot utvärderas, och relevanta review-trådar måste vara resolved före merge.

## Deploy

GitHub Actions deployar inte produktion. Cloudflare Workers Builds äger normal production deployment från `main`. `wrangler.jsonc` är source of truth för versionshanterad Worker-konfiguration och runtime-secrets ligger i Cloudflare, inte i GitHub Actions eller repositoryfiler.
