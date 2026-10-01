# Release- och versionsstandard

**Senast verifierad:** 2026-09-27

Det här dokumentet gäller **Klarspråk-repositoryt**. Repositoryts egna dokument, workflows, taggar och GitHub Releases äger release- och versionskontraktet.

## Klassificering

Klarspråk är en **versionsbar produkt**.

Verifierad GitHub Release-historik finns under [GitHub Releases](https://github.com/Avkroken/Klarsprak/releases). Senast verifierade publicerade release är `v1.0.6` från 2026-09-07.

GitHub Release och motsvarande SemVer-tagg är repositoryts officiella versionsankare:

```text
vMAJOR.MINOR.PATCH
```

## Lokal package-version är inte releaseversion

Rootens `package.json` har `private: true` och saknar `version`. Den är därför inte en produktversionskälla.

Inför inte package-version, `version.txt` eller annan parallell versionsfil enbart för releaseautomation. Repositoryts publicerade GitHub Release + SemVer-tagg är versionsankaret tills ett separat versionsarkitekturbeslut ändrar detta.

## Release är inte deployment

En GitHub tagg eller GitHub Release är en versionspunkt, inte en implicit produktionsdeployment.

Klarspråks deployment och databasändringar följer repositoryts operationskontrakt:

- `npm run deploy` kör Wrangler-deploy;
- produktionsmigrationer körs separat via `npm run migrate:production`;
- efter avsedd deployment används `npm run verify:production`.

Releaseautomation får inte implicit köra produktionsmigration eller deployment enbart därför att en release skapas.

## PR-titlar och squash commits

Pull request-titlar ska följa Conventional Commits:

```text
<type>[optional scope][!]: <description>
```

Tillåtna typer:

- `feat`
- `fix`
- `perf`
- `refactor`
- `docs`
- `test`
- `build`
- `ci`
- `chore`
- `revert`

Scope är valfri och ska vara tekniskt relevant, exempelvis `api`, `submission`, `review`, `admin`, `d1`, `seo` eller `deps`.

`!` markerar breaking change:

```text
feat(api)!: replace public term contract
```

`.github/workflows/pr-title.yml` validerar titeln på vanlig `pull_request`. Workflown använder inga secrets, checkar inte ut repositoryt och har `permissions: {}`.

## SemVer

Vid en versionerad repositoryrelease gäller normalt:

- breaking change → **major**;
- `feat` → **minor**;
- `fix` → **patch**;
- `docs`, `test`, `chore`, `ci` och `build` → normalt ingen release ensamma;
- `perf` och `refactor` bedöms efter faktisk användar-, data- eller kompatibilitetseffekt.

Releaseversionen är inte en Worker-version eller deploymenträknare.

## När en release ska ske

Release sker kuraterat, inte på varje merge eller deployment.

En release är motiverad när exempelvis:

- användarsynlig funktionalitet är färdig;
- en fix behöver en officiell versionspunkt;
- publikt API-, termdata- eller publiceringskontrakt ändras;
- flera färdiga ändringar ska samlas till en begriplig produktrelease;
- en breaking förändring kräver ny major-version.

Rent dokumentations-, test-, CI- eller dependencyunderhåll skapar normalt inte en egen produktversion om det saknas konkret konsumenteffekt.

## Release notes

`.github/release.yml` konfigurerar GitHubs genererade release notes-kategorier. Den skapar inte taggar eller GitHub Releases och är inte releaseautomation.

GitHub Releases är den officiella versionerade releasehistoriken som Portalens Changelog får konsumera. Inför inte en separat manuellt underhållen changelog som konkurrerande source of truth.

## Verifiering vid release

Minst ordinarie repository-CI ska vara grön innan en releasepunkt skapas.

Repositoryts verifieringskontrakt finns i [operations.md](operations.md) och omfattar före PR/deploy:

```bash
npm test
npx wrangler d1 migrations apply DB --local
npx wrangler deploy --dry-run
```

Releasearbete som påverkar D1, submission/review, routing eller deployment måste dessutom följa relevanta manuella verifieringspunkter i operationsdokumentet.

En releaseprocess får inte kringgå normala PR-checks eller repositoryskydd.

## Releaseautomation — current state

Repositoryt använder `.github/workflows/release.yml` och de repoägda hjälpskripten under `.github/scripts/` för SemVer-baserad GitHub Release-publicering.

- vanliga pull requests validerar releasekonfigurationen utan publiceringsbehörighet;
- publicering körs endast från `main`;
- automatiskt bumpbeslut bygger på Conventional Commit-information i first-parent-historiken;
- manuella körningar kan välja explicit bump eller prerelease/promotion;
- release-jobbet väntar på repositoryts verifieringschecks innan publicering;
- GitHub Release/tagg är versionspunkten och utlöser inte produktionsmigration eller Worker-deploy;
- publicerade taggar flyttas eller skrivs inte om;
- canonical releasepublication använder standard-`GITHUB_TOKEN` med jobbspecifik least-privilege; endast det valfria rådgivande Copilot-jobbet använder separat read-only `COPILOT_GITHUB_TOKEN`.

Releaseflödet ska faila stängt vid divergerande tagghistorik, saknade releaseankare, failing checks eller osäker promotion. Ändringar i releasearkitekturen ska verifieras i vanlig PR och får inte användas för att försvaga repositoryskydd.

## Prerelease

Prerelease används endast vid konkret behov, exempelvis:

```text
v2.0.0-rc.1
```

Prerelease-status ska markeras i GitHub Release och får inte tolkas som implicit produktionsdeployment.

## Hotfix och rollback

Hotfix utgår normalt från aktuell `main` och använder `fix:` när förändringen är bakåtkompatibel.

Publicerade taggar flyttas eller skrivs inte om. Vid felaktig release:

1. korrigera eller revert:a via vanlig PR;
2. kör relevant verifiering;
3. skapa en ny korrigerande SemVer-version;
4. skapa ny tagg och GitHub Release;
5. kör migration/deployment endast om den korrigerade ändringen faktiskt ska till produktion.

Ingen force-push eller tag history rewrite används.

## Copilot-sammanfattning

Releaseflödet kör den SHA-pinnade `github/copilot-release-notes`-actionen i ett separat read-only-jobb med `contents: read` och `pull-requests: read`. Copilot CLI förinstalleras i exakt version `1.0.90` innan `COPILOT_GITHUB_TOKEN` exponeras, så actionen använder den redan installerade binären i stället för att hämta en flytande CLI-version.

`COPILOT_GITHUB_TOKEN` ska vara en least-privilege fine-grained PAT med `Copilot Requests: Read` och en tokenägare med aktiv Copilot-licens. Workflown skapar eller roterar ingen credential. Om secreten saknas eller Copilot-genereringen misslyckas påverkas inte releaseprocessen.

Copilot-resultatet publiceras endast i GitHub Actions run summary som rådgivande text. Det skrivs inte in i den kanoniska GitHub Release-body:n. SemVer, release-target, required checks och release notes i GitHub Release fortsätter därför att komma enbart från `semantic_release.py`; osäkra eller ofullständiga AI-resultat kan aldrig ändra canonical changelog. Upstream v1.0.3 kan dessutom missa rebase-mergade PR:er; Copilot-resultatet får därför inte användas som bevis på full release-täckning.
