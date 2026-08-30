# AGENTS.md

Den här filen är repositoryts auktoritativa arbetsinstruktion. Live GitHub-konfiguration är verkställande sanning när dokumentation och faktisk enforcement skiljer sig.

## Repository

`klarsprak` är en statisk prototyp på Cloudflare Workers som jämför allmänspråklig betydelse med juridisk och myndighetsmässig användning.

- Frontend ligger i `public/`.
- Backend ligger i `src/worker.js` och använder assets-binding samt D1-binding `DB`.
- Admin-API skyddas med bearer-token mot `ADMIN_TOKEN`.
- Produktionsdeploy ägs av Cloudflare Workers Builds. Push till `main` triggar `bun run deploy:production`, som applicerar återstående D1-migrationer, deployar Workern och verifierar produktionsdomänen.
- `wrangler.jsonc` äger Worker-bindings, observability och custom domains deklarativt.
- Innehållet är pilotmaterial; sakpåståenden och skillnader ska vara källbelagda och juridiskt känsliga ändringar ska flaggas för mänsklig sakkontroll.

## Brancher och pull requests

- Pusha aldrig direkt till `main`.
- Använd en kortlivad branch och öppna en ready PR till `main`.
- **Aktivera auto-merge omedelbart när PR:n skapats**, även medan CI eller review pågår.
- Använd inte direkt merge om det inte uttryckligen begärts.
- Live-rulesetet tillåter för närvarande endast squash merge.
- Repositoryt använder inte merge queue och har ingen obligatorisk återanvändbar branchpool.
- Codex-remediation använder körningsunika branches under `automation/codex-issue/`.

## Merge-gates

För `main` gäller för närvarande:

- required status check: `validate`
- olösta review-trådar blockerar merge
- Copilot Code Review körs vid push till PR-grenen
- squash är enda tillåtna merge-metod

Alla review-kommentarer och trådar ska läsas och utvärderas. Relevanta findings åtgärdas i samma PR. En tråd markeras resolved först när eventuell nödvändig fix är pushad och verifierad.

Efter varje ny commit ska relevant CI och review-status kontrolleras igen. När `validate` är grön och alla relevanta review-trådar är resolved ska den redan armerade auto-merge-funktionen föra PR:n till `main`.

Om auto-merge inte sker ska den konkreta blockeraren i live-ruleset, review-state eller repositoryinställning identifieras. Kringgå aldrig repositoryskydd.

## Innehåll och säkerhet

- Varje term ska ha parafraserad allmänspråklig betydelse med källa, institutionell/juridisk användning med primär eller officiell källa, härledd skillnad och tydlig status för juridisk sakkontroll.
- Gissa inte sakskillnader eller juridisk betydelse. Bevara tydlig källproveniens.
- Validera opålitlig input vid server-side boundaries.
- Adminbehörighet ska verifieras server-side mot `ADMIN_TOKEN`; lita inte på Cloudflare Access utan faktisk verifiering.
- Hemligheter, tokens och credentials ska ligga i Cloudflare/GitHub secrets och får aldrig hårdkodas eller loggas.
- GitHub Actions ska pinnas till commit-SHA när praktiskt möjligt.

## GitHub Actions och Cloudflare

- `.github/workflows/ci.yml` producerar required context `validate` och kör tester, D1-migrationer från tom lokal databas samt Wrangler dry-run.
- Required `validate` blockerar alla PR:er som fortfarande innehåller `.github/codex-dispatch/issue-*.md`; en remediation-seed får aldrig nå `main`.
- `.github/workflows/osv-scanner.yml` är kompletterande säkerhetsverifiering och är inte required context i nuvarande ruleset.
- `.github/workflows/codex-issue-remediation.yml` skapar en körningsunik remediation-branch, öppnar PR och armerar auto-merge direkt.
- `.github/workflows/auto-fix-review.yml` får begära Codex-fix för uttryckligen betrodd review-feedback men får inte lösa review-tråden åt implementationen.
- Security alerts hanteras centralt av organisationens Skvallerbyttan-flöde; repositoryt ska inte ha en separat schemalagd Code Scanning-poller.
- GitHub Actions ska inte deploya produktion. Cloudflare Workers Builds är enda normala produktionsdeploykedjan.
- Cloudflares production deploy command ska vara `bun run deploy:production`.
- D1-migrationer körs automatiskt i Cloudflare före Worker-deploy. Manuell remote-migrering är endast reservväg för felsökning/återställning.

## Verifiering

Granska hela diffen mot `main` före PR. Kör `bun run test` och andra relevanta kontroller efter varje push. Vid CI-/Wrangler-ändringar ska D1-migrationer från tom lokal databas och `wrangler deploy --dry-run` fortsatt valideras. Kontrollera att inga secrets, credentials, debugrester eller oavsiktliga genererade filer har lagts till.

När ändringen påverkar Cloudflare runtime, bindings, secrets, routes, D1 eller annan live-konfiguration ska den deployade konfigurationen verifieras efter ändringen. För produktionsändringar innebär det normalt att `Workers Builds: klarsprak` på den mergade `main`-SHA:n ska vara grön.

## Svarsformat

**[SKILLS.md](SKILLS.md) styr allt svarsformat. Läs den och följ den i varje svar.**

## Definition of done

En PR-baserad uppgift är klar först när implementationen är färdig, diffen självgranskad, all review-feedback utvärderad, required `validate` är grön, relevanta review-trådar är resolved och auto-merge har mergat PR:n eller är armerad medan en verifierad extern gate fortfarande väntar.
