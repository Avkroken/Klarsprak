# AGENTS.md

- Läs [docs/project-context.md](docs/project-context.md), [docs/architecture.md](docs/architecture.md) och [docs/operations.md](docs/operations.md) före materiella ändringar.
- Följ Avkrokens centrala engineering- och dokumentationsstandard i [Avkrokens centrala engineering- och dokumentationsstandard](https://github.com/Avkroken/Avkroken/tree/main/docs/organization).
- Arbeta i separat gren enligt `{agent}/{feature}/{YYYY-MM-DD}/{HH-mm}-{id}`.
- Bevara Worker-first-routingen; den upprätthåller canonical host, adminrouting och response policy.
- Publika förslag får inte bli publicerade utan granskningssteget.
- Kör tester och Wrangler dry-run före merge.
- Lägg aldrig secrets eller känslig admin-/authorizationkonfiguration i repository eller publik dokumentation.
