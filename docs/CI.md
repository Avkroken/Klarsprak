# CI och branchflöde

`main` är den enda långlivade arbetsgrenen. Varje ändring görs på en kortlivad branch och går via PR till `main`. Auto-merge används inte; merge-metoden är squash.

PR-verifiering hör till `pull_request`; deploy och annan efter-merge-körning hör till `main`.

Det required `validate`-jobbet kör `bun run test`, applicerar alla D1-migrationer mot en tom lokal databas och gör en Wrangler dry-run. En regressionssvit som finns i repot men inte körs av `validate` är inte fullt integrerad i CI.

Repot behöver ingen generell impact-motor. Required checks ska ha stabila namn och får inte filtreras bort på workflow-nivå om det kan lämna dem i `Expected/Pending`. Vid osäker påverkan körs hellre extra verifiering än för lite.
