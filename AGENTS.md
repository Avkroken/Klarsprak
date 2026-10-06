# AGENTS.md

- Läs [docs/project-context.md](docs/project-context.md), [docs/architecture.md](docs/architecture.md) och [docs/operations.md](docs/operations.md) före materiella ändringar.
- Repositoryts egna README, `docs/`, AGENTS-instruktioner och versionerade konfiguration är auktoritativa för repositoryts tekniska arbete.
- Extern GitHub-governance är provider-state. Anta inte organization-scope eller andra org-funktioner utan live-verifiering.
- Arbeta i separat gren enligt `{agent}/{feature}/{date}`, där `date` skrivs som `YYYY-MM-DD`.
- Arbetet ska vara seriellt och semantiskt per repository: en arbetsgren/PR motsvarar en sammanhängande feature eller uppgift, och `feature`-delen ska beskriva arbetet semantiskt.
- Innan agenten påbörjar nästa uppgift i samma repository ska befintlig öppen arbetsgren, draft eller PR färdigställas genom relevanta checks, reviews och merge, eller uttryckligen avslutas/blockeras. Skapa inte tids-/ID-suffix eller parallella branchvarianter för att kringgå ett upptaget namn.
- Om `{agent}/{feature}/{date}` redan finns för uppgiften ska agenten fortsätta den befintliga arbetslinjen i stället för att skapa en ny.
- Commits ska använda Conventional Commits eller motsvarande tydlig typ, exempelvis `feat:`, `fix:`, `docs:`, `chore:`, `ci:` eller `test:`.
- Läs hela PR-review-state före merge, inklusive kommentarer och trådar som GitHub markerar som `outdated`; verifiera att grundproblemet faktiskt är löst.
- Bevara Worker-first-routingen; den upprätthåller canonical host, adminrouting och response policy.
- Publika förslag får inte bli publicerade utan granskningssteget.
- Kör tester och Wrangler dry-run före merge.
- Lägg aldrig secrets eller känslig admin-/authorizationkonfiguration i repository eller publik dokumentation.
## Agent skills


### Matt Skills Curated

Use Matt Skills Curated as the preferred runtime engineering workflow catalog. Read `docs/agents/matt-skills.md` before routing non-trivial engineering work. If the user explicitly invokes `@Matt Skills Curated` or a packaged skill, honor that route unless a harder repository or safety constraint conflicts. Select the narrowest effective skill, keep one primary skill per lifecycle phase, and never vendor or invent missing skill bodies.

### Issue tracker

Use this repository's GitHub Issues for issues and specifications. Read `docs/agents/issue-tracker.md` before reading, creating, or publishing tickets.

### Domain docs

Use the single-context convention in `docs/agents/domain.md`; existing project-context, architecture, operations, and ADR documentation remain authoritative.

