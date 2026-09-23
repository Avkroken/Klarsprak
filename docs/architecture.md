# Arkitektur

## Översikt

```text
Browser
  |
  v
src/index.js
  |  host/admin/SEO/response policy
  v
src/worker.js
  |           \
  |            +--> Static Assets (public/)
  |
  +--> D1 klarsprak-db
        |
        +--> published_terms
        +--> submissions / review state
```

## Canonical host

IDN-aliaset redirectas till `klarsprak.denied.se`. Worker-first assets krävs för att redirecten och övrig policy inte ska kunna kringgås av direkt asset-serving.

## Public data

`GET /api/terms` levererar publicerade termer från D1. Frontend renderar den state som API:t returnerar; statisk HTML är inte canonical termdatabas.

## Submission/review

Användare skickar förslag via `POST /api/submit`. Admin-API läser granskningskö och kan godkänna, redigera, publicera eller arkivera. Publicering och submission är därför två separata stateövergångar.

## Trust boundaries

- Turnstile skyddar publikt submissionflöde.
- Adminroutes kräver avsedd adminauktorisering.
- D1 innehåller application state.
- Assets är presentation och får inte kunna kringgå Worker-policy.

## SEO och caching

Publika indexerbara sidor får explicit canonical/robots metadata. Admin och övriga icke-publika ytor ska inte oavsiktligt bli indexerbara eller cacheas som publik data.
