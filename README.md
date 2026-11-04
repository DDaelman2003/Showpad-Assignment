# API Throttling & Rate Limiting Service

Een robuuste, productie-klare TypeScript API die rate-limiting en API-throttling demonstreert. Deze service is gebouwd met **Express** en ondersteunt meerdere rate-limiting algoritmes, flexibele storage-strategieën en authenticatie per client.

---

## Kernfunctionaliteiten

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

## Projectstructuur

```text
api-throttling/
├── src/
│   ├── config/          # Client limieten en tier configuraties
│   ├── middleware/      # Authenticatie middleware
│   ├── rate-limiter/
│   │   ├── algorithms/  # Fixed Window & Token Bucket implementaties
│   │   ├── storage/     # Memory en Redis storage adapters
│   │   └── rateLimiterMiddleware.ts
│   └── app.ts           # Express applicatie setup
├── tests/               # Jest unittests
├── jest.config.js
├── package.json
├── tsconfig.json
├── Dockerfile
└── docker-compose.yml
```