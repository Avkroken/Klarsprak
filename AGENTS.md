# klarsprak — AI Agent Guide

Statisk prototyp på Cloudflare Workers som jämför allmänspråklig betydelse med juridisk/myndighetsmässig användning. Skillnader ska vara källbelagda, inte gissade.

## Innehåll och teknik

- Varje term behöver parafraserad allmänspråklig betydelse med källa, institutionell/juridisk användning med primär eller officiell källa, härledd skillnad och tydlig status för juridisk sakkontroll.
- Frontend ligger i `public/`; backend är `src/worker.js` med assets-binding och D1-binding `DB`.
- Admin-API skyddas av bearer-token mot `ADMIN_TOKEN`. Lita inte på Cloudflare Access utan faktisk verifiering.
- Deploy sker via `.github/workflows/deploy.yml` efter push till `main`.
- Innehållet är pilotmaterial. Ändringar av sakinnehåll ska flaggas om de saknar mänsklig juridisk granskning.

## GitHub-arbetsflöde

Arbete sker via tillfälliga arbetsgrenar och pull requests till `main`. Arbetsgrenar får använda repo- eller agentvalda namn som `claude/*`, `codex/*`, `feature/*`, `fix/*` eller motsvarande; de återanvändbara `work/feature`, `work/fix` och `work/chore` får fortfarande användas men är inte obligatoriska.

1. Implementera och kör relevanta tester lokalt (`bun run test` och andra kontroller som berör ändringen).
2. Pusha arbetsgrenen och öppna en ready PR till `main`.
3. **Aktivera auto-merge omedelbart efter att PR:n skapats**, även medan CI eller review fortfarande pågår.
4. Required CI-checkar och olösta review-trådar är merge-blockerare. Läs och utvärdera alltid alla review-kommentarer; relevanta fynd ska åtgärdas i samma PR innan tråden markeras resolved.
5. Efter varje ny commit ska både CI och review-status kontrolleras igen. När required CI är grönt och alla review-trådar är resolved ska den redan armerade auto-merge-funktionen/merge-kön föra PR:n till `main`. Om det inte sker, identifiera exakt kvarvarande blockerare. **Squash merge är den enda tillåtna merge-metoden.**

`.github/workflows/pr-watchdog.yml` bevakar alla lokala branches utom `main`, merge-köns `gh-readonly-queue/*`, den interna permanenta state-branchen `automation/pr-watchdog-state` och uttryckligen konfigurerade permanenta undantag. När en branch med unika commits först observeras utan öppen PR sparar watchdoggen dess HEAD och `firstSeen` beständigt på state-branchen. Samma oPR:ade HEAD i mer än 60 minuter får en ready PR till `main` och squash auto-merge armeras. HEAD-byte startar en ny grace-period; en öppen PR eller branch utan unika commits tar bort state. Exakt samma HEAD öppnas inte på nytt om den redan har behandlats i en stängd PR. Watchdoggen avgör inte om arbetet är önskvärt eller mergebart; CI, review och merge-gates gör det.

`.github/workflows/sync-pool.yml` får synka uttryckliga återanvändbara slots, men `work/*` med egna commits och utan öppen PR ska lämnas helt orörda så watchdoggens first-seen-period inte påverkas. Sync-poolen får aldrig resetta godtyckliga agent- eller arbetsgrenar.

Skicka aldrig direkt till `main`, kringgå inte branch protection/rulesets, required checks, review resolution eller merge queue och ändra inte hemligheter eller organisationsinställningar utan uttrycklig instruktion.

## Svarsformat

**[SKILLS.md](SKILLS.md) styr allt svarsformat. Läs den och följ den i varje svar.**

SKILLS.md har företräde framför den här filen och framför varje annan formuleringsanvisning i repot. Sammanfatta den inte, återge den inte i kortform och väg den inte mot andra skrivelser — det är den filen som gäller.
