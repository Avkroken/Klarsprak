# Dokumentation

Navigationssida för Klarspråks tekniska dokumentation.

## Hitta rätt

| Fråga | Dokument |
| --- | --- |
| Vad ansvarar tjänsten för och vilken runtime gäller? | [Projektkontext](project-context.md) |
| Hur fungerar Worker, assets, D1 och publiceringsflödet? | [Arkitektur](architecture.md) |
| Hur utvecklar, migrerar, verifierar och deployar jag? | [Drift](operations.md) |
| Hur rapporteras säkerhetsproblem? | [SECURITY.md](../SECURITY.md) |

## Systemöversikt

```text
Browser
  |
  v
src/index.js
  |  canonical host / admin routing / SEO / response policy
  v
src/worker.js
  |            \
  |             +--> ASSETS (public/)
  |
  +--> D1 klarsprak-db-eu
        +--> publicerade termer
        +--> submissions / review state
```

## Viktiga flöden

### Läsning

Publika klienter hämtar publicerade termer via API. D1 är source of truth; frontend renderar den data API:t levererar.

### Submission

Användaren skickar ett förslag. Turnstile skyddar den publika ingressen. Förslaget går till review-state och blir inte publikt av sig självt.

### Review/publicering

Adminflödet läser granskningskö och utför explicita stateövergångar för redigering, godkännande, publicering eller arkivering.

## Ändringskarta

- routes/host/SEO → [architecture.md](architecture.md) + [operations.md](operations.md)
- D1-schema/publiceringsstate → migration + [project-context.md](project-context.md)
- submission/review/admin → architecture + säkerhetsrelevant verifiering
- Wrangler bindings/domains → project-context + operations

## Wiki

Om GitHub Wiki används kan den fungera som lättnavigerad presentationsyta. Versionsstyrd Markdown i repositoryt är underlaget; unik current-state ska inte ligga enbart i Wiki.
