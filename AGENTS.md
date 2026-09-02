# AGENTS.md

Den här filen är repositoryts auktoritativa arbetsinstruktion. Live GitHub-konfiguration är verkställande sanning när dokumentation och faktisk enforcement skiljer sig.

## Repository

`klarsprak` är en statisk prototyp på Cloudflare Workers som jämför allmänspråklig betydelse med juridisk och myndighetsmässig användning. Frontend ligger i `public/`, backend i `src/worker.js`, D1-migrationer i `migrations/` och `wrangler.jsonc` äger versionshanterad Worker-konfiguration.

Cloudflare Workers Builds äger normal produktionsdeploy från `main`. GitHub Actions ska inte deploya produktion eller duplicera Cloudflares kontrollplan.

## Brancher och pull requests

- Pusha aldrig direkt till `main`.
- Använd en kortlivad branch och en ready PR till `main`.
- Auto-merge får aktiveras först när aktuell HEAD uppfyller verifierade live-gates.
- Endast squash merge är tillåtet.
- Kringgå aldrig repositoryskydd.

## Merge-gates

Live organisationsrulesets kräver `validate` och `osv` med strict latest-base-verifiering. Org-rulesetet för `main` kräver 0 approvals, ingen last-push approval, lösta review-trådar och CodeQL merge protection. Copilot och CodeRabbit är rådgivande, men faktiska relevanta findings ska utvärderas och åtgärdas.

Efter varje push ska required checks, Code Scanning och review-state verifieras på exakt aktuell HEAD.

## Innehåll och säkerhet

- Sakskillnader och juridisk betydelse ska vara källbelagda; gissa inte.
- Validera opålitlig input server-side.
- Adminbehörighet ska verifieras server-side mot `ADMIN_TOKEN`.
- Secrets, tokens och credentials får aldrig hårdkodas eller loggas.

## GitHub Actions och Cloudflare

- `.github/workflows/ci.yml` producerar `validate`, blockerar ofärdiga remediation-seedfiler och kör tester, lokala D1-migrationer från tom state samt Wrangler dry-run.
- `.github/workflows/osv-scanner.yml` är repositoryts egen OSV-definition och producerar required terminal context `osv` på pull requests.
- Repositoryts workflows får inte skapa eller uppdatera PR:er eller branches, arma eller genomföra merge, automatisera review, delegera remediation/kodarbete till AI-agenter eller lagra säkerhetsalert-snapshots. De centrala metadata-callers som beskrivs nedan är det enda metadata-only-undantaget och får inte ändra branch, review eller merge-state.
- Security alerts hanteras av GitHubs native säkerhetsfunktioner och kodändringar går genom normala PR-gates.
- GitHub Actions ska pinnas till full commit-SHA.
- Production trigger ska använda branch `main`, root `/`, tomt build command och deploy command `bun run migrate:production && bun run deploy && bun run verify:production`.
- `migrate:production` använder Wranglers native D1 migrations och `deploy` använder `wrangler deploy --strict`.

## Metadata-only AI triage exception

Repositoryägaren har uttryckligen godkänt metadata-only issue triage via GitHub Agentic Workflows. Detta är klassificering, inte coding-agent delegation eller remediation.

- `.github/workflows/metadata-routing.yml` får endast anropa Avkrokens centrala deterministiska metadata-routing för assignee och labels.
- `.github/workflows/issue-classification.yml` får endast trigga på öppnade/återöppnade issues, anropa den SHA-pinnade centrala `issue-classification.lock.yml` och efter lyckad klassificering anropa den SHA-pinnade centrala metadata-routingen.
- AI-delen får läsa det triggande issuet och read-only repositorykontext som behövs för klassificering.
- `gh-aw` safe outputs får endast lägga till exakt en temporär `classification:<difficulty>:<security>`-label från den centrala allowlisten. Den deterministiska routingen konverterar den till kanoniska `difficulty:*` och `security:*` labels och tar bort temporärlabeln.
- Befintliga kanoniska klassificeringslabels tar företräde över AI-output. Malformed eller konfliktande klassificeringsmetadata ska faila stängt till `triage:invalid`.
- Caller-workflowen får endast mappa `COPILOT_GITHUB_TOKEN` explicit till AI-workflowen; `secrets: inherit` är inte tillåtet.
- Workflowen får inte kommentera, assigna coding agents, skapa/ändra branches eller PR:er, reviewa, mergea, deploya eller utföra/föreslå remediation.
- Copilot-auth får komma från organization billing eller GitHub Actions-secreten `COPILOT_GITHUB_TOKEN`. Credentialvärden får aldrig committas, loggas eller kopieras till dokumentation.

Detta undantag ändrar inte Cloudflare-, CI-, security-, review- eller mergepolicyn.

## Verifiering

Granska hela diffen mot `main` före PR. Kör `bun run test` och relevanta kontroller efter ändringar. Vid CI-/Wrangler-ändringar ska D1-migrationer från tom lokal state och `wrangler deploy --dry-run` valideras. Kontrollera att inga secrets, credentials, debugrester eller oavsiktliga filer lagts till.

## Svarsformat

**[SKILLS.md](SKILLS.md) styr allt svarsformat. Läs den och följ den i varje svar.**

## Definition of done

En PR-baserad uppgift är klar först när implementationen är färdig, diffen självgranskad, review-feedback utvärderad, required `validate` och `osv` är gröna på exakt final HEAD, Code Scanning merge protection är godkänd och relevanta review-trådar är resolved.

## PR-scope efter öppning

- PR:ns avsedda scope är fryst efter öppning.
- Fel som orsakas av PR:ns befintliga ändringar rättas i samma PR.
- Ny funktionalitet, opportunistiska refactors och separata förbättringar får en ny branch/PR.
- Efter korrigerande commits ska relevanta tester samt gate- och review-state verifieras på den nya HEAD:en.
