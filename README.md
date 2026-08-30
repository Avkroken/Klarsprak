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
- Produktion: Cloudflare Workers Builds triggas från `main` och kör `bun run deploy:production`.
- GitHub Actions används för CI, säkerhetskontroller och remediation — inte för produktionsdeploy.
- Observability är aktiverat i `wrangler.jsonc`.
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

Migrationer ligger i `migrations/`. Produktionskedjan kör dem automatiskt före Worker-deploy:

```sh
wrangler d1 migrations apply klarsprak-db --remote
```

Wrangler registrerar applicerade migrationer i D1 och kör bara återstående filer. Manuell körning är reservväg vid felsökning eller återställning, inte normal deploymetod.

## Utveckling

```sh
bun install
bunx wrangler dev
```

## Deploy

Cloudflare Workers Builds använder:

```sh
bun run deploy:production
```

Kommandot kör i ordning D1-migrationer, `wrangler deploy` och en HTTPS-kontroll av produktionsdomänen.
