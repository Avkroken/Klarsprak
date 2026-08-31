# CI och branchflöde

`main` är default branch. Varje ändring görs på en kortlivad branch och går via en ready PR till `main`. Squash merge är den enda tillåtna merge-metoden.

## Live merge-enforcement

Repositoryt har ett enda aktivt ruleset för default branch. Det blockerar deletion och non-fast-forward/force push, kräver PR, har inga bypass actors och använder 0 generella approvals. Last-push approval krävs inte, men alla relevanta review-trådar måste vara resolved före merge.

Required status checks är:

- `validate`
- `osv`

Båda körs med `strict_required_status_checks_policy: true`. Resultat från en äldre HEAD eller en PR som inte är uppdaterad mot aktuell `main` får därför inte användas som mergebevis.

`validate` kör `bun run test`, applicerar alla D1-migrationer mot en tom lokal databas och gör en Wrangler dry-run. Det blockerar även ofärdiga Codex-remediation-seeds.

`osv` är terminaljobbet för dependency scanning. Ett separat `osv-preflight` i samma workflow kontrollerar PR-checkouten och blockerar reserverade OSV-resultatvägar som är symboliska länkar, även med eventuella matrix-prefix. Det underliggande reusable-jobbet `scan-pr / osv-scan` är en implementationdetalj och är inte required. Terminaljobbet failar om preflight eller scannerkörningen inte slutförs med success.

## Code Scanning

GitHubs Code Scanning merge protection används för verktyget `CodeQL`:

- code-scanning alerts: `errors_and_warnings`
- security alerts: `medium_or_higher`

Trivy är inte konfigurerad i repositoryt och är därför inte en merge-gate.

## Review

Copilot Code Review använder `review_on_push: true`, undantar drafts och är rådgivande. Quota- eller tillgänglighetsproblem för Copilot blockerar inte merge i sig.

CodeRabbit är best effort och är inte en required status check. Saknad, pending, rate-limited eller misslyckad CodeRabbit-status blockerar inte merge i sig. Om CodeRabbit faktiskt lämnar relevanta findings eller review-trådar ska de verifieras, åtgärdas när de är giltiga och lösas först efter verifierad fix.

## Auto-merge

Auto-merge får inte armeras som ett test av GitHubs skydd. Aktivera det först när live-rulesetet är verifierat, required checks för aktuell HEAD är identifierade, strict- och security-enforcement är verifierade, relevanta review-trådar är resolved och inga manuella rulesetåtgärder återstår. Om HEAD ändras ska verifieringen göras om.

PR-verifiering hör till `pull_request`; deploy och annan efter-merge-körning hör till `main`. GitHub Actions deployar inte produktion. Cloudflare Workers Builds äger production deployment.
