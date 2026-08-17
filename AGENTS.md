# klarsprak — AI Agent Guide

Statisk prototyp-webbplats (Cloudflare Worker med assets-binding) som visar en
ordbok där juridiska/myndighetstermer översätts till vardagssvenska, med gapet
mellan vad allmänheten tror och vad termen faktiskt betyder. Komplement till
politiker.denied.se. Live på klarsprak.denied.se.

## Conventions

- Frontend är statiska HTML-filer (`public/index.html`, `public/admin.html`,
  inline CSS+JS), ingen build-process.
- Backend är en riktig Worker (`src/worker.js`) som hanterar `/api/submit`,
  `/api/admin/queue`, `/api/admin/review/:id` och annars vidarebefordrar till
  assets-bindingen.
- Worker-namn: `klarsprak`. Config i `wrangler.jsonc` (assets-binding +
  D1-binding `DB` mot databasen `klarsprak-db`).
- Admin-endpoints skyddas i två lager: Cloudflare Access (Zero Trust-app
  "klarsprak admin (UI + API)", e-postpolicy) blockerar vid edgen, och
  Worker-koden kräver därutöver bearer-token mot secreten `ADMIN_TOKEN`.
- Deploy sker via `.github/workflows/deploy.yml` vid push till main.
- Innehållet i ordboken är AI-genererat och opublicerat — inte juridiskt
  sakgranskat. Ändra gärna presentation/kod, men flagga tydligt om
  sakinnehållet (termer/definitioner) ändras utan mänsklig juridisk granskning.

## Allowed
- Committa på dev
- Skapa arbetsgrenar för PR:er (`claude/*`)
- Modify code
- Run tests
- Open PRs

## Forbidden
- Push directly to main/master
- Merge PRs på eget initiativ (be uttryckligen så är det okej)
- Ta bort grenar
- Disable workflows
- Modify secrets
- Change GitHub org settings

## Requirements
- All tests must pass
- Keep PRs focused
- Never include unrelated changes
- Never commit credentials
- Never force push

## Svarsformat

Regeluppsättningen kommer från plugin:et `i-have-adhd`. Den laddas inte i
alla sessioner (t.ex. inte i Claude Code på webben), så den står här —
det här är källan som gäller oavsett var agenten kör.

Form:

- Led med åtgärden eller kommandot, inte med bakgrunden
- Numrera flerstegsprocesser, ett avgränsat steg per rad
- Max fem punkter per lista
- Hoppa över inledningar, sammanfattningar och avslutningsfraser
- Långa förklaringar bara på begäran

Innehåll:

- Säg uttryckligen vad som är gjort och vad som återstår
- Ange konkreta tidsuppskattningar
- Visa vad som fungerar efter en ändring, inte bara att den är gjord
- Vid fel: var, varför och hur det åtgärdas — kortfattat
- Avsluta med ett nästa steg som tar under två minuter
