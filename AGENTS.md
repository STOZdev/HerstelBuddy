# AGENTS.md — Platform build / RecoveryBuddy

## Doel en status

Dit project ontwikkelt **RecoveryBuddy**, een herstelgerichte, mobiel bruikbare webapp voor cliënten in de specialistische ggz. De app helpt cliënten hun eigen doelen, acties, hulpbronnen en signaleringsplan te gebruiken, passende psycho-educatie en oefeningen te vinden en bestaande Minddistrict-modules te openen. De herstelbuddy ondersteunt navigatie en zelfregie; de behandelaar blijft verantwoordelijk voor klinische beslissingen en opvolging.

De huidige, meest complete codebasis is het project uit `RecoveryBuddy_Minddistrict_mock_project.zip`. Dit is een **uitvoerbare demonstratie** met uitsluitend synthetische gegevens, geen productie-integratie met Minddistrict. Oudere losse bestanden zoals `page(8).tsx` en `RecoveryBuddy(1).tsx` zijn versies ter referentie, geen tweede bron van waarheid. Ga bij elke opdracht eerst na welke werkelijke repository en versie zijn geopend. Als het ZIP-project niet aanwezig is, vraag om de actuele code of werk uitsluitend aan wat beschikbaar is; verzin geen bestandsinhoud.

## Projectstructuur en architectuur

- Stack van de mock: Next.js App Router, React, TypeScript, Zod en Vitest. De UI is in het Nederlands. Controleer `package.json` voordat je commando's of afhankelijkheden aanneemt.
- `app/page.tsx` biedt de ingang; `app/RecoveryBuddyApp.tsx` bevat de bestaande UI. `app/useRecoveryPlan.ts` laadt en bewaart het herstelplan via de eigen API.
- `app/RecoveryBuddy.tsx`, `app/RecoveryBuddyLLM.ts`, `app/BuddyLanguageMapping.ts` en `app/BuddyLibrary.ts` verzorgen buddy-interactie en inhoud. `app/SignaleringsplanModule.tsx`, `app/ActModule.tsx`, `app/MindfulnessModule.tsx` en `app/PsychoeducationLibrary.tsx` bevatten specifieke functies.
- `app/_domain/minddistrict/types.ts` definieert gedeelde contracten; `app/_server/minddistrict/gateway.ts` definieert de serverinterface; `mock-gateway.ts` implementeert de mock. Houd echte leverancierlogica achter deze gateway.
- `app/api/**` is de eigen serverlaag (BFF). De namen van deze routes zijn **geen** bevestigde Minddistrict-endpoints. Browsercode gebruikt de eigen API en krijgt geen service-token of leverancierssecret.
- `app/_server/auth/session.ts` verzorgt de ondertekende mock-sessie; `app/_server/db/mock-store.ts` is een lokale JSON-opslag. `app/mock-minddistrict/**` simuleert het vertrekplatform en de module. `app/_components/MinddistrictModuleLauncher.tsx` verzorgt kiezen, toewijzen, openen en status tonen.
- Behoud deze scheiding bij aanpassingen. Verplaats of hernoem bestaande code alleen als dat de wijziging echt vereist; werk alle imports, routes en documentatie bij.

## Gedrag dat behouden moet blijven

- Dashboard, onboarding, taalniveau, hersteldoelen en acties (doen, oefenen, leren), voltooide acties, psycho-educatie, ACT en mindfulness blijven bruikbaar op desktop én iPhone. Interactieve elementen werken op aanraking en zijn toegankelijk met het toetsenbord.
- Het herstelplan bevat onder meer `mijn verhaal`, `mijn krachtbronnen` en een plek voor de netwerkintake. Het signaleringsplan bevat groen, oranje en rood. De stemming-check-in koppelt groen/geel aan de groene fase, oranje aan oranje en rood aan rood, en toont relevante planacties als opties.
- De buddy geeft begrijpelijke, empathische ondersteuning en concrete vervolgstappen. Normaliseer gewone spanning niet tot een suïcide-alarm; behoud wel een duidelijke route bij expliciete acute onveiligheid. Geen diagnose, risicovoorspelling of autonoom behandeladvies.
- Nieuwe patiënttekst is helder en bij voorkeur op B1-niveau; bied keuzevrijheid, begrijpelijke uitleg en een route naar menselijke hulp. Meertaligheid en instelbaar taalniveau zijn productdoelen, geen reden om stilzwijgend onvertaalde tekst te tonen.
- De mockroute begint op `/mock-minddistrict` met de synthetische patiënt **Sanne de Vries** (`md-patient-synthetic-001`). De patiënt opent RecoveryBuddy, ziet het opgeslagen herstelplan, wijst een toegestane module toe, opent de gesimuleerde Minddistrict-module en keert terug met zichtbare status (`assigned` → `in-progress` → `completed`).

## Integratieregels en gegevensbescherming

1. Behandel alle Minddistrict-contracten, OAuth/OIDC/Koppeltaal/FHIR-profielen, scopes, module-identificaties en launch-URL's als **onbevestigd** totdat de officiële tenantdocumentatie en afspraken beschikbaar zijn. Maak bij echt aansluiten een afzonderlijke adapter en contracttests; presenteer de mock niet als werkende productieverbinding.
2. Leid patiëntidentiteit en tenant af van de gevalideerde serversessie. Vertrouw geen browserparameter voor patiënt-ID, module-ID of rol. Autoriseer iedere read/write en iedere moduleactie op de juiste patiënt en tenant. Gebruik een toegestane capability/modulecatalogus; een LLM mag geen module-ID of URL verzinnen.
3. Bewaar leverancierscredentials alleen server-side. Gebruik voor een echte launch kortlevende, gevalideerde tokens/URL's; controleer issuer, audience, expiry, scopes en retourgedrag volgens het overeengekomen contract. Onderzoek statusupdates, dubbele requests en fouten voordat je voltooiing toont.
4. Houd de mockgegevens synthetisch. Log geen vrije gesprekstekst, symptomen, herstelplaninhoud of secrets in technische telemetry. Beperk auditdata tot wat nodig is, documenteer doel en bewaartermijn, en laat patiëntgebonden API-antwoorden en PWA-cache buiten offline opslag. `.env.local` en `.data/` horen niet in git.
5. De huidige JSON-repository en mock-login zijn alleen voor de demonstratie. Voor echt gebruik zijn goedgekeurde opslag, toegangsbeheer, privacy/security review, klinische governance en een afgesproken Minddistrict-contract nodig. Leg bedoelde werking en eventuele medische hulpmiddelstatus per functie vast voordat functies met klinische beslisimpact worden ingezet.
6. Houd eventuele Ollama/LLM-aanroepen server-side, met tijdslimiet, veilige terugval en controleerbare routering. Verander de deterministische veiligheidsregels niet impliciet door een modelantwoord.

## Werkwijze voor Codex

1. Lees eerst de actuele `README.md`, `package.json`, de relevante componenten en bestaande tests. Meld kort welke aanname je maakt als een oudere losse versie afwijkt van de repository.
2. Werk de gevraagde verandering volledig uit in code en voeg alleen tests toe die een betekenisvol risico afdekken, vooral sessie/autorisatie, patiëntscheiding, modulelevenscyclus en kritieke interacties. Gebruik geen echte patiëntgegevens.
3. Verifieer wijzigingen met `npm run typecheck`, `npm test` en `npm run build` als deze scripts aanwezig zijn; test een aangepaste gebruikersflow ook via de browser wanneer die beschikbaar is. Meld concreet wat is uitgevoerd en wat niet.
4. Controleer bij UI-wijzigingen mobiele bediening, leesbaarheid, foutmeldingen, focus en terugnavigatie. Bij API-wijzigingen controleer je sessie, autorisatie, validatie en foutpaden.
5. Houd de bestaande producttaal Nederlands en behoud herkenbare labels. Leg alleen technische details in ontwikkelaarsdocumentatie vast, niet in patiëntschermen.
6. Benoem bij afronding gewijzigde bestanden, zichtbaar gedrag, verificatie en resterende afhankelijkheden voor echte Minddistrict-integratie. Claim geen goedkeuring, veiligheid of effectiviteit zonder bijbehorend bewijs.

## Lokaal starten

Vanuit de projectroot (waar `package.json` staat): `npm install`, kopieer `.env.example` naar `.env.local`, stel een eigen `MOCK_SESSION_SECRET` van minstens 32 tekens in, start `npm run dev` en open `http://localhost:3000/mock-minddistrict`. Gebruik voor checks `npm run typecheck`, `npm test`, `npm run build`. De mockopslag staat standaard in `.data/recoverybuddy-mock.json`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
