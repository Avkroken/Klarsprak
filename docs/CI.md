# CI och branchflöde

Repositoryt använder endast `dev` och `main`. Arbete görs på `dev`, PR går `dev → main`, och efter merge fast-forwardar `.github/workflows/sync-dev.yml` automatiskt `dev` till `main` utan force-push. Om `dev` innehåller omergat arbete ska synken avbryta.

CI ska inte verifiera samma arbetscommit både som `push` till `dev` och `pull_request`. PR-verifiering hör till PR-eventet; push-verifiering/deploy hör till `main`.

Det här repot har inte en tung flerplattformsmatris som Bastion. Därför ska vi inte införa en komplex impact-motor utan konkret vinst. Fil-/komponentfilter används där ett workflow tydligt bara berör en viss del, medan required checks behåller stabila namn och får inte filtreras bort på workflow-nivå om det kan lämna dem i `Expected/Pending`.

Grundregeln är konservativ: dokumentation/processmetadata ska inte starta dyrt bygg- eller deployarbete, men okänd kod/config ska hellre köra extra verifiering än riskera att relevant CI hoppas över.