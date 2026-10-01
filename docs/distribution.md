# Distribution och appbutiker

Klarspråks canonical runtime är fortsatt webbappen på `https://klarsprak.denied.se/`. Repositoryt publicerar nu en PWA-bas med web app manifest, 192/512-ikoner och en service worker.

## Säkerhetsmodell

Service workern är avsiktligt network-only. Den cachear inte HTML, D1-driven termdata, submissions, adminytor eller API-svar. PWA-lagret är därför presentation/distribution och blir inte en ny state owner.

## Microsoft Store

Webbappen är tekniskt förberedd för PWA-paketering: HTTPS, manifest och service worker finns. Store-identitet, Publisher ID och det signerade MSIX-paketet hör till Microsoft Partner Center och ska inte hårdkodas eller fabriceras i repositoryt.

## Google Play

Webbappen kan ligga till grund för en Trusted Web Activity-wrapper. Innan en sådan wrapper kan publiceras måste en riktig Android package identity och signerande certifikatkedja finnas. `.well-known/assetlinks.json` ska inte publiceras med placeholder-fingerprint.

## Apple

Webbappen kan installeras som webbapp via Safari. En faktisk App Store-listning kräver en separat iOS-app/wrapper, bundle identity och Apple-signering. Ingen placeholder-Team ID, bundle ID eller signing credential ska checkas in.

## Portal-länkar

Avkroken-portalen ska bara visa App Store/Google Play/Microsoft Store-länkar efter att respektive listing faktiskt är publicerad och URL:en har verifierats.
