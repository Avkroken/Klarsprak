# AGENTS.md

Den här filen är repositoryts auktoritativa arbetsinstruktion. Live GitHub-konfiguration är verkställande sanning när dokumentation och faktisk enforcement skiljer sig.

## Repository

`klarsprak` är en statisk prototyp på Cloudflare Workers som jämför allmänspråklig betydelse med juridisk och myndighetsmässig användning.

- Frontend ligger i `public/`.
- Backend ligger i `src/worker.js` och använder assets-binding samt D1-binding `DB`.
- Admin-API skyddas med bearer-token mot `ADMIN_TOKEN`.
- Produktionsdeploy ägs av Cloudflare Workers Builds. Production trigger på `main` applicerar återstående D1-migrationer, deployar Workern med Wrangler och kör applikationens produktionsverifiering.
- Cloudflare Workers Builds äger production branch, root directory, watch paths och deploy command. Duplicera inte den kontrollplanslogiken i repo-lokala Node-/shell-wrappers.
- `wrangler.jsonc` äger Worker-bindings, observability och custom domains deklarativt.
- `workers.dev` och Preview URLs är explicit avstängda i `wrangler.jsonc`; produktion ska endast exponeras via deklarerade custom domains om inte en senare PR uttryckligen ändrar policyn.
- Innehållet är pilotmaterial; sakpåståenden och skillnader ska vara källbelagda och juridiskt känsliga ändringar ska flaggas för mänsklig sakkontroll.

## Brancher och pull requests

- Pusha aldrig direkt till `main`.
- Använd en kortlivad branch och öppna en ready PR till `main`.
- Auto-merge får inte aktiveras som ett test av repositoryskyddet. Aktivera det först när live-rulesetet har verifierats, required checks för aktuell HEAD är identifierade, strict/latest-base- och security-enforcement är verifierade, relevanta review-trådar är resolved och inga manuella rulesetåtgärder återstår.
- Om HEAD ändras efter verifiering ska gates och review-state kontrolleras igen innan auto-merge eller merge.
- Live-rulesetet tillåter endast squash merge.
- Repositoryt använder inte merge queue och har ingen obligatorisk återanvändbar branchpool.
- Säkerhetsremediation initieras centralt via GitHubs native funktioner och Skvallerbyttan; fallback-Codex-PR:er använder körningsunika branches under `automation/codex-issue/`.

## Merge-gates

För default branch `main` gäller ett enda aktivt repository-ruleset med följande policy:

- deletion av `main` blockeras
- non-fast-forward/force push blockeras
- PR krävs före merge
- required approvals: `0`
- last-push approval krävs inte
- olösta review-trådar blockerar merge
- required status checks: `validate` och `osv`
- `strict_required_status_checks_policy: true`; PR-HEAD ska verifieras mot aktuell `main`
- Code Scanning merge protection för `CodeQL`: `errors_and_warnings` för code-scanning alerts och `medium_or_higher` för security alerts
- Copilot Code Review har `review_on_push: true`, granskar inte drafts och är rådgivande, inte en required status check
- CodeRabbit är best effort och är inte en required status check
- endast squash merge är tillåten
- inga bypass actors är tillåtna

Trivy är inte konfigurerad som scanner eller merge-gate i repositoryt. Lägg inte till en Trivy-gate utan att en faktisk stabil PR-verifiering först har införts och observerats.

CodeRabbit-status får vara saknad, pending, rate-limited eller misslyckad utan att detta ensamt blockerar merge. Om CodeRabbit faktiskt publicerar relevanta findings eller review-trådar ska de däremot verifieras och hanteras innan merge. Samma princip gäller rådgivande Copilot-feedback.

Alla review-kommentarer och trådar ska läsas och utvärderas. Relevanta findings åtgärdas i samma PR. En tråd markeras resolved först när eventuell nödvändig fix är pushad och verifierad.

Efter varje ny commit ska `validate`, `osv`, Code Scanning och review-state kontrolleras på exakt den nya HEAD-SHA:n. Gamla checkresultat eller reviews får inte användas som bevis för en ny HEAD.

## Innehåll och säkerhet

- Varje term ska ha parafraserad allmänspråklig betydelse med källa, institutionell/juridisk användning med primär eller officiell källa, härledd skillnad och tydlig status för juridisk sakkontroll.
- Gissa inte sakskillnader eller juridisk betydelse. Bevara tydlig källproveniens.
- Validera opålitlig input vid server-side boundaries.
- Adminbehörighet ska verifieras server-side mot `ADMIN_TOKEN`; lita inte på Cloudflare Access utan faktisk verifiering.
- Hemligheter, tokens och credentials ska ligga i leverantörernas secret stores och får aldrig hårdkodas eller loggas.
- GitHub Actions ska pinnas till commit-SHA när praktiskt möjligt.

## GitHub Actions och Cloudflare

- `.github/workflows/ci.yml` producerar required context `validate` och kör tester, D1-migrationer från tom lokal databas samt Wrangler dry-run.
- Required `validate` blockerar alla PR:er som fortfarande innehåller `.github/codex-dispatch/issue-*.md`; en remediation-seed får aldrig nå `main`.
- `.github/workflows/osv-scanner.yml` producerar required terminal context `osv`. Ett PR-preflight-jobb blockerar reserverade OSV-resultatvägar som är symboliska länkar, även med eventuella matrix-prefix. Det interna reusable-jobbet `scan-pr / osv-scan` är inte självt required. PR-skanningen ska faila stängt om preflight eller själva scannern inte slutförs.
- Den centrala Skvallerbyttan-dispatchern skapar vid behov en körningsunik remediation-branch, öppnar PR och delegerar fallback-arbetet till Codex; repositoryt ska inte ha en egen security-remediation-dispatcher.
- `.github/workflows/auto-fix-review.yml` får begära Codex-fix för uttryckligen betrodd review-feedback men får inte lösa review-tråden åt implementationen.
- Security alerts hanteras native-first av GitHub och därefter centralt av organisationens Skvallerbyttan-flöde; repositoryt ska inte ha en separat schemalagd Code Scanning-poller.
- GitHub Actions ska inte deploya produktion. Cloudflare Workers Builds är enda normala produktionsdeploykedjan.
- Production trigger ska använda branch `main`, root `/`, tomt build command och avstängda non-production branch builds för produktions-Workern.
- Production trigger ska använda deploy command `bun run migrate:production && bun run deploy && bun run verify:production`.
- Build watch paths ska omfatta `src/**`, `public/**`, `migrations/**`, `scripts/check-production-domain.mjs`, `wrangler.jsonc`, `package.json` och `bun.lock`.
- `migrate:production` ska vara Wranglers native `d1 migrations apply` mot `klarsprak-db --remote`; `deploy` ska vara `wrangler deploy --strict`.
- D1-migrationer körs automatiskt av Cloudflare-triggern före Worker-deploy. Manuell remote-migrering är endast reservväg för felsökning/återställning.
- Branch/SHA-kontroll ska inte dupliceras i deployskript. Workers Builds trigger väljer branch och Cloudflare registrerar buildens Git-metadata.
- Wrangler är source of truth för Worker-routes och publika Worker-ytor. Ändra inte `workers.dev`, Preview URLs eller custom domains endast i Dashboard; motsvarande avsikt ska versionshanteras i `wrangler.jsonc`.
- Ett repo-lokalt script får finnas för applikationsspecifik post-deploy-verifiering när Cloudflare saknar en native health-check primitive, men scriptet får inte bli en parallell deploymentmotor.

## Verifiering

Granska hela diffen mot `main` före PR. Kör `bun run test` och andra relevanta kontroller efter varje push. Vid CI-/Wrangler-ändringar ska D1-migrationer från tom lokal databas och `wrangler deploy --dry-run` fortsatt valideras. Kontrollera att inga secrets, credentials, debugrester eller oavsiktliga genererade filer har lagts till.

När ändringen påverkar Cloudflare runtime, bindings, secrets, routes, D1 eller annan live-konfiguration ska den deployade konfigurationen verifieras efter ändringen. För produktionsändringar innebär det normalt att Workers Builds-runnen för `klarsprak` på den mergade `main`-SHA:n ska vara grön och att `verify:production` har passerat i samma production trigger.

## Svarsformat

**[SKILLS.md](SKILLS.md) styr allt svarsformat. Läs den och följ den i varje svar.**

## Definition of done

En PR-baserad uppgift är klar först när implementationen är färdig, diffen självgranskad, all review-feedback utvärderad, aktuellt live-ruleset är verifierat, required `validate` och `osv` är gröna på exakt final HEAD, Code Scanning merge protection är godkänd, relevanta review-trådar är resolved och PR:n har mergats via tillåten squash merge eller väntar på en legitim verifierad extern gate.
