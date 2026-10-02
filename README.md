# RecoveryBuddy – Minddistrict mock integration

Runnable Next.js/PWA mock-up of the existing RecoveryBuddy interface with a server-side integration boundary for Minddistrict.

## Demonstrated journey

1. Open the simulated Minddistrict environment at `/mock-minddistrict`.
2. The already-created synthetic patient **Sanne de Vries** selects **Open RecoveryBuddy**.
3. A signed, HttpOnly RecoveryBuddy session is created for Minddistrict patient `md-patient-synthetic-001`.
4. RecoveryBuddy retrieves Sanne's persisted recovery plan from its server repository.
5. RecoveryBuddy retrieves an allowlisted mock Minddistrict module catalogue.
6. The patient assigns and launches **Terugvalpreventie: signalen en acties**.
7. The mock module updates its Task-like status from `assigned` to `in-progress` and then `completed`.
8. The patient returns to RecoveryBuddy, where the completed status is visible.

No real patient information or live Minddistrict endpoint is used.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open:

```text
http://localhost:3000/mock-minddistrict
```

For a fresh demonstration, stop the server and remove only:

```text
.data/recoverybuddy-mock.json
```

The file is recreated with the synthetic patient and recovery plan on the next launch.

## Verification

```bash
npm run typecheck
npm test
npm run build
```

## Important files

- `app/RecoveryBuddyApp.tsx`: current RecoveryBuddy UI, retained as the visual baseline.
- `app/useRecoveryPlan.ts`: hydrates and persists goals/actions through the authenticated API.
- `app/_server/auth/session.ts`: signed mock launch session.
- `app/_server/db/mock-store.ts`: JSON-backed mock repository and synthetic seed.
- `app/_server/minddistrict/gateway.ts`: provider-independent integration contract.
- `app/_server/minddistrict/mock-gateway.ts`: allowlisted mock catalogue and Task-like lifecycle.
- `app/_components/MinddistrictModuleLauncher.tsx`: assignment and launch UI.
- `app/api/assignments/*`: internal BFF routes; these are not claimed to be Minddistrict endpoint names.
- `app/mock-minddistrict/*`: simulated external platform and module.
- `app/sw.js/route.ts`: service worker that caches static assets only.

## Production replacement points

The UI and internal API routes should remain stable. Replace:

1. `RECOVERY_AUTH_MODE=mock` with the contracted Minddistrict/Koppeltaal or UMCU OIDC launch.
2. The JSON repository with an approved PostgreSQL repository.
3. `MockMinddistrictGateway` with the sandbox gateway using the supplied OAuth/FHIR/API contract.
4. Mock catalogue identifiers with tenant-specific `ActivityDefinition` or module identifiers.
5. Mock module pages with short-lived Minddistrict launch URLs.
6. Local audit storage with UMCU-approved audit and monitoring destinations.

The real gateway must add token acquisition/rotation, issuer and audience validation, scopes, rate limiting, idempotency, retries, contract validation and webhook/subscription verification as required by the Minddistrict agreement.

## Safety and privacy properties of this mock

- The browser never receives a Minddistrict client secret or service token.
- The patient identity is derived from the server session, not a browser-supplied patient ID.
- Ollama remains server-side.
- Raw buddy messages and module free text are not included in technical/audit logs.
- PWA caching is limited to versioned static assets; APIs and patient-specific pages are network-only.
- Module assignment uses an allowlisted capability rather than an LLM-generated URL or identifier.

The mock login route deliberately accepts only one synthetic patient. It is not a production authentication mechanism.

## PWA, voortgang en herinneringen

RecoveryBuddy kan als PWA op een iPhone worden geplaatst. In **Instellingen** legt de app uit hoe dat in Safari werkt: open de beveiligde app in Safari, kies **Deel → Zet op beginscherm**, en open daarna de app vanaf het beginscherm. De manifest-, standalone-, safe-area- en Apple-touch-iconconfiguratie staan in de repository. iOS-webpush is alleen beschikbaar voor zo'n geïnstalleerde webapp en op HTTPS; `localhost` is uitsluitend geschikt voor lokaal ontwikkelen.

Het herstelplan, inclusief afgeronde acties en herhalingen, wordt al per gevalideerde serversessie in de eigen BFF opgeslagen. Het dashboard toont nu expliciet of de voortgang is geladen, wordt opgeslagen, is opgeslagen of niet kon worden opgeslagen. `GET /api/progress` levert een compacte, afgeleide serverstatus voor een later behandelaarsoverzicht zonder vrije hersteltekst mee te sturen.

Een gebruiker kan in Instellingen een dagelijks tijdstip en tijdzone kiezen. Die voorkeur en een Web Push-abonnement worden uitsluitend via de eigen, geautoriseerde API bij de ingelogde gebruiker opgeslagen. Pushberichten blijven algemeen en bevatten geen doel, symptoom, naam of andere patiëntinhoud. Uitzetten verwijdert het abonnement weer.

### Push in een omgeving inschakelen

1. Deploy de app onder een HTTPS-domein en stel een goedgekeurde, persistente datastore en echte identiteitssessie in. De huidige JSON-opslag en mock-sessie zijn alleen voor de demo.
2. Genereer een eigen VAPID-sleutelpaar met `node scripts/generate-vapid-keys.mjs`. Zet de drie `VAPID_*`-waarden alleen in de serveromgeving; commit ze nooit.
3. Stel een lange, willekeurige `REMINDER_DISPATCH_SECRET` in. Laat een vertrouwde scheduler iedere minuut `POST /api/notifications/dispatch` aanroepen met `Authorization: Bearer <secret>`. De route valideert de secret, gebruikt de opgeslagen tijdzone en voorkomt een dubbele verzending in dezelfde minuut.
4. Laat de patiënt de app op het iPhone-beginscherm installeren, meldingen inschakelen en eventueel een testmelding sturen.

Voor een echte inzet zijn daarnaast privacy/security review, bewaartermijnen voor abonnementen, betrouwbare scheduler-monitoring, incidentafhandeling en de in de AGENTS.md genoemde klinische governance nodig. Web Push vervangt geen crisisroute of klinische opvolging.
