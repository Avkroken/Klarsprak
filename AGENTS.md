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
3. Öppna PR från arbetsbranchen till `main` som klar för granskning. Auto-merge är tillåtet och får aktiveras när PR:n är redo; GitHub mergar först när alla ruleset-krav är uppfyllda.
4. Lös CI- och reviewproblem på samma branch. Required checks och review-trådar ska vara klara före merge.
5. **Squash merge är den enda tillåtna merge-metoden.** Använd inte merge commits eller rebase merge. Repot är konfigurerat att automatiskt radera head-branchen efter merge.

Skicka aldrig direkt till `main`, kringgå inte rulesets och ändra inte hemligheter eller organisationsinställningar utan uttrycklig instruktion.

## Svarsformat

**Läs [SKILLS.md](SKILLS.md) och följ den i varje svar.** Den är den fullständiga
regeluppsättningen för svarsformat och gäller utan att någon aktiverar den.

Kortversion: led med nästa åtgärd eller resultat, numrera flerstegsarbete, håll
listor korta och ange konkret orsak/fix vid fel. Vid konflikt gäller SKILLS.md.
