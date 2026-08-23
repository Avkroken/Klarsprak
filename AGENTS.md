# klarsprak — AI Agent Guide

Statisk prototyp på Cloudflare Workers som jämför allmänspråklig betydelse med juridisk/myndighetsmässig användning. Skillnader ska vara källbelagda, inte gissade.

## Innehåll och teknik

- Varje term behöver parafraserad allmänspråklig betydelse med källa, institutionell/juridisk användning med primär eller officiell källa, härledd skillnad och tydlig status för juridisk sakkontroll.
- Frontend ligger i `public/`; backend är `src/worker.js` med assets-binding och D1-binding `DB`.
- Admin-API skyddas av bearer-token mot `ADMIN_TOKEN`. Lita inte på Cloudflare Access utan faktisk verifiering.
- Deploy sker via `.github/workflows/deploy.yml` efter push till `main`.
- Innehållet är pilotmaterial. Ändringar av sakinnehåll ska flaggas om de saknar mänsklig juridisk granskning.

## GitHub-arbetsflöde

`main` är den enda långlivade arbetsgrenen. `dev` används inte.

1. Skapa en ny kortlivad branch från aktuell `main` för varje uppgift.
2. Implementera och kör relevanta tester lokalt (`bun run test` och andra kontroller som berör ändringen).
3. Öppna PR från arbetsbranchen till `main` som klar för granskning. Aktivera inte auto-merge.
4. Lös CI- och reviewproblem på samma branch. Required checks och review-trådar ska vara klara före merge.
5. Merge sker med **squash merge**. Använd inte merge commits eller rebase merge. Head-branchen får raderas efter merge.

Skicka aldrig direkt till `main`, kringgå inte rulesets och ändra inte hemligheter eller organisationsinställningar utan uttrycklig instruktion.

## Svarsformat

Led med nästa åtgärd eller resultat. Numrera flerstegsarbete, håll listor korta och ange konkret orsak/fix vid fel.
