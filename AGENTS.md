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
- Admin-endpoints skyddades tänkt i två lager: Cloudflare Access (Zero
  Trust-app "klarsprak admin (UI + API)", e-postpolicy) vid edgen, och
  Worker-koden med bearer-token mot secreten `ADMIN_TOKEN`.
  **Uppmätt 2026-08-17: bara det andra lagret är aktivt.** `GET /admin`
  svarar 200 utan Access-utmaning — ingen redirect till
  `*.cloudflareaccess.com`, inga `cf-access`-headers. `GET
  /api/admin/queue` svarar däremot korrekt 401, så DATA är skyddat;
  det som ligger öppet är admin-sidans HTML-skal.
  Innan någon lutar sig mot edge-lagret igen: verifiera det med ett
  faktiskt anrop, inte mot den här filen.
- Deploy sker via `.github/workflows/deploy.yml` vid push till main.
- Innehållet i ordboken är AI-genererat och opublicerat — inte juridiskt
  sakgranskat. Ändra gärna presentation/kod, men flagga tydligt om
  sakinnehållet (termer/definitioner) ändras utan mänsklig juridisk granskning.

## Tillåtet
- Ändra kod
- Köra tester
- Öppna ändringsförslag från `dev` till standardgrenen

## Förbjudet
- Skicka ändringar direkt till `main` eller `master`
- Radera grenar
- Stänga av arbetsflöden
- Ändra hemligheter
- Ändra inställningar för GitHub-organisationen

## Krav
- Överlämna kodändringar endast på `dev`
- Alla tester måste godkännas
- Håll varje ändringsförslag avgränsat till en uppgift
- Starta inte en ny koduppgift medan ett ändringsförslag från `dev` är öppet; slutför eller stäng det först
- Ta aldrig med orelaterade ändringar
- Överlämna aldrig inloggningsuppgifter eller andra hemligheter till versionshistoriken
- Tvinga aldrig igenom en skickning
- Skapa ändringsförslag som klara för granskning, aldrig som utkast
- Aktivera automatisk sammanfogning med en metod som tillåts av förrådets regler direkt efter att ändringsförslaget skapats
- Automatisk sammanfogning får slutföras först när alla regelkrav och kontrollkörningar har godkänts
- Om automatisk sammanfogning inte kan aktiveras: rapportera det exakta felet

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
