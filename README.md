# klarsprak

Prototyp-webbplats som jämför **allmänspråklig betydelse** med **myndighets-/juridisk användning** av samma ord och uttryck. Syftet är att synliggöra när offentliga institutioner använder vanliga svenska ord som tekniska termer, bevisnivåer eller beslutströsklar.

Live: **klarsprak.denied.se**

## Innehållsmodell

Varje publicerad post ska ha fyra delar:

1. **Ordbokens betydelse** — en kort parafras av en redovisad språkkälla, i första hand Svenska Akademiens ordböcker eller annan etablerad källa.
2. **Institutionens användning** — en kort parafras av lag, förarbete, domstol eller myndighet.
3. **Skillnaden** — endast det som faktiskt kan härledas ur de två källorna.
4. **Källor** — minst en språkkälla och en institutionell/rättslig källa som besökaren kan kontrollera.

Den tidigare modellen med fältet **"vad människor tror"** används inte längre på den publika sidan. Sådana påståenden kräver empiriskt underlag om människors faktiska uppfattningar och ska inte genereras av AI.

## Status

**Opublicerat/pilot.** De fem poster som visas på startsidan har explicita källhänvisningar men är fortfarande inte juridiskt sakkontrollerade. Äldre AI-genererade poster har tagits bort från den publika listan tills de kan byggas om enligt modellen ovan.

## Teknik

- Frontend: statiska HTML-filer i `public/`, inline CSS+JS, ingen build-process.
- Backend: Cloudflare Worker i `src/worker.js`.
- Assets-binding: `public/`.
- D1-binding: `DB` mot `klarsprak-db`.
- Produktion: Cloudflare Workers Builds äger build trigger och produktionsdeploy från `main`.
- GitHub Actions används för PR-validering, säkerhetskontroller och remediation — inte för produktionsdeploy.
- `wrangler.jsonc` är source of truth för Worker-konfiguration, bindings, routes, observability och publika Worker-ytor.
- `workers.dev` och Worker Preview URLs är explicit avstängda; produktion exponeras endast via deklarerade custom domains.

## Inlämning och granskning

Besökare kan föreslå en term via `POST /api/submit`. Formuläret efterfrågar nu:

- allmänspråklig betydelse,
- myndighets-/juridisk användning,
- källor och exempel,
- rättsområde,
- frivilligt namn/kommentar.

Backend använder av bakåtkompatibilitet fortfarande databasfälten `foreslagen_vardagsbetydelse`, `foreslagen_juridisk_definition` och `foreslagen_exempel`. Fältnamnen är interna legacy-namn; den publika och administrativa presentationen följer den nya modellen.

Förslag sparas i D1-tabellen `submissions` med status `pending`. Inget publiceras automatiskt. `POST /api/submit` är IP-baserat rate-begränsat till högst fem inlägg per rullande timme när `CF-Connecting-IP` finns.

`/admin.html` visar granskningskön. Admin-API:t kräver `Authorization: Bearer <ADMIN_TOKEN>`. Token sparas endast i `sessionStorage` i admin-UI:t.

## Cloudflare Access

Worker-tokenen är det verifierade aktiva skyddet för admin-API:t. Cloudflare Access har tidigare varit tänkt som ett extra edge-lager, men får inte antas vara aktivt utan faktisk kontroll. Se `AGENTS.md`.

## Domän

`wrangler.jsonc` äger custom domains deklarativt:

- `klarsprak.denied.se`
- `xn--klarsprk-g0a.denied.se` (`klarspråk.denied.se`)

Worker-koden redirectar IDN-aliaset till den kanoniska hosten. Cloudflare-buildtokenen måste därför ha den begränsade routebehörighet som Wrangler behöver för dessa custom domains.

`workers_dev: false` och `preview_urls: false` ligger i samma Wrangler-konfiguration, så en normal deploy ska inte skapa någon parallell publik `workers.dev`- eller preview-yta.

## Databas

Migrationer ligger i `migrations/`. Produktionskedjan applicerar återstående D1-migrationer före Worker-deploy med Wranglers native migrationskommando:

```sh
bun run migrate:production
```

Det motsvarar `wrangler d1 migrations apply klarsprak-db --remote`. Wrangler registrerar applicerade migrationer i D1 och kör bara återstående filer. Manuell körning är reservväg vid felsökning eller återställning, inte normal deploymetod.

## Utveckling

```sh
bun install
bunx wrangler dev
```

## Cloudflare Workers Builds

Cloudflares production trigger är den enda normala produktionskedjan. Den ska ha följande inställningar:

- Production branch: `main`
- Root directory: `/`
- Build command: tomt
- Non-production branch builds: avstängt för produktions-Workern
- Deploy command:

```sh
bun run migrate:production && bun run deploy && bun run verify:production
```

- Build watch paths: `src/**`, `public/**`, `migrations/**`, `scripts/check-production-domain.mjs`, `wrangler.jsonc`, `package.json`, `bun.lock`

Kommandona är avsiktligt atomära. `migrate:production` kör Wrangler D1 migrations, `deploy` kör `wrangler deploy --strict`, och `verify:production` verifierar den deployade applikationen. Det finns ingen repo-lokal `deploy:production`-orkestrerare: ordningsföljd, production branch, root directory och watch paths ägs av Cloudflare Workers Builds.

`--strict` gör att en normal produktionsdeploy inte tyst accepterar inkompatibel runtime-konfiguration som har ändrats separat i Dashboard. Ändringar av Worker-konfiguration ska i stället versionshanteras i `wrangler.jsonc`.

Produktionsverifieringen kontrollerar den kanoniska domänen, den D1-backade terms-API:n och IDN-redirecten. Den är applikationsverifiering efter deploy och ersätter inte Cloudflares egen build/deploy-status.
