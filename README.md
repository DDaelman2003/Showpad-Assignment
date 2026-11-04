# API Throttling & Rate Limiting Service

Een robuuste, productie-klare TypeScript API die rate-limiting en API-throttling demonstreert. Deze service is gebouwd met **Express** en ondersteunt meerdere rate-limiting algoritmes, flexibele storage-strategieën en authenticatie per client.

---

## 🚀 Kernfunctionaliteiten

- **Twee Verschillende Endpoints & Algoritmes:**
  - `GET /foo`: Maakt gebruik van het **Fixed Window** algoritme (telt het aantal requests binnen een vast tijdvenster per client).
  - `GET /bar`: Maakt gebruik van het **Token Bucket** algoritme (vult geleidelijk tokens aan op basis van verstreken tijd, wat burst-traffic toestaat).
- **Flexibele Storage Strategieën:**
  - **In-Memory Storage** (standaard, snel en eenvoudig voor lokale tests).
  - **Redis Storage** (persistent en gedistribueerd, in te schakelen via een HTTP-header).
- **Client Authenticatie & Tiers:**
  - Elk verzoek vereist een `Authorization: bearer <clientId>` header.
  - Ondersteuning voor meerdere clients met verschillende limieten (bijv. `client-tier-basic` vs. `client-tier-premium`).
- **Geautomatiseerde Tests:** Volledige testsuite geschreven in **Jest** en **Supertest**.

---

## 🔍 Handleiding voor Code Reviewers

Beste reviewer, bedankt voor het evalueren van deze opdracht! Om je te helpen snel door de codebase te navigeren en de functionaliteit te verifiëren, vind je hieronder een gerichte handleiding.

### 1. Waar te beginnen (Architectuur & Code Review)
De codebase is modulair opgezet volgens het **Strategy Pattern** om maximale flexibiliteit en scheiding van verantwoordelijkheden te garanderen:
- **Algoritmes (`src/rate-limiter/algorithms/`):** Hier vind je de schone implementaties van het *Fixed Window* (`fixedWindow.ts`) en *Token Bucket* (`tokenBucket.ts`) algoritme die de limietlogica afhandelen.
- **Storage Adapters (`src/rate-limiter/storage/`):** De opslaglaag is ontkoppeld via een interface (`storageStrategy.ts`). Bekijk `memoryStorage.ts` voor in-memory tracking en `redisStorage.ts` voor de Redis-integratie.
- **Middleware (`src/rate-limiter/rateLimiterMiddleware.ts` & `src/middleware/auth.ts`):** Hier wordt de client-authenticatie afgehandeld en worden de gekozen storage- en algoritme-strategieën dynamisch gekoppeld aan de routes.

### 2. Geautomatiseerde Tests Uitvoeren
De unittests valideren zowel de correcte werking binnen limieten (status `200 OK`) als het afvangen van overschrijdingen (status `429 Too Many Requests`), inclusief authenticatiechecks.

Voer de tests uit via:
```bash
cd api-throttling
npm install
npm test

```

### 3. Handmatig Evaluatieplan (cURL)

Start de applicatie lokaal of via Docker (zie installatie-instructies hieronder) en voer de volgende scenario's uit:

#### Scenario A: Fixed Window limiet bereiken op `/foo`

De `client-tier-basic` heeft een strikte limiet van 3 requests per venster. Stuur 4 snelle verzoeken achter elkaar:

```bash
curl -i -H "Authorization: bearer client-tier-basic" http://localhost:3000/foo
curl -i -H "Authorization: bearer client-tier-basic" http://localhost:3000/foo
curl -i -H "Authorization: bearer client-tier-basic" http://localhost:3000/foo
curl -i -H "Authorization: bearer client-tier-basic" http://localhost:3000/foo

```

* **Verwacht resultaat:** De eerste 3 verzoeken retourneren `200 OK`, het 4e verzoek retourneert `429 Too Many Requests` (`{"error":"rate limit exceeded"}`).

#### Scenario B: Premium Client testen

```bash
curl -i -H "Authorization: bearer client-tier-premium" http://localhost:3000/foo

```

* **Verwacht resultaat:** `200 OK` (hogere limiet tier).

#### Scenario C: Redis Storage activeren

Indien de applicatie draait via Docker Compose, kun je expliciet aangeven dat de counters in Redis moeten worden opgeslagen via een HTTP-header:

```bash
curl -i -H "Authorization: bearer client-tier-basic" -H "x-storage-type: redis" http://localhost:3000/foo

```

---

## 🛠️ Projectstructuur

```text
api-throttling/
├── src/
│   ├── config/          # Client limieten en tier configuraties
│   ├── middleware/      # Authenticatie middleware
│   ├── rate-limiter/
│   │   ├── algorithms/  # Fixed Window & Token Bucket implementaties
│   │   ├── storage/     # Memory en Redis storage adapters
│   │   └── rateLimiterMiddleware.ts
│   ├── routes/          # /foo en /bar route handlers
│   └── app.ts           # Express applicatie setup
├── tests/               # Jest unittests
├── jest.config.js
├── package.json
├── tsconfig.json
├── Dockerfile
└── docker-compose.yml

```

---

## 📋 Installatie & Starten

### Optie 1: Lokaal draaien (Node.js)

1. Zorg dat je in de `api-throttling` map staat:
```bash
cd api-throttling

```


2. Installeer de afhankelijkheden:
```bash
npm install

```


3. Start in development modus:
```bash
npm run dev

```



### Optie 2: Draaien via Docker & Docker Compose (Inclusief Redis)

Start zowel de applicatie als een Redis-container in één keer op:

```bash
cd api-throttling
docker compose up --build

```

De API is nu bereikbaar op `http://localhost:3000`.

```