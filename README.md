<p align="center">
  <img src="client/public/logo360.png" alt="DailyNews360 logo" width="140" height="150" />
</p>

<h1 align="center">DailyNews360</h1>

<p align="center"><em>Every Story. Every Angle.</em></p>

<p align="center">
  <strong>Your world, one feed.</strong> A modern, real-time news aggregator that pulls headlines from multiple trusted sources into one clean, fast, premium interface.
</p>

## Overview

**DailyNews360 — Every Story. Every Angle.** is a full-stack news aggregation platform. It gathers headlines from reputable sources worldwide and presents them in one consistent, responsive, content-first interface with:

- Real-time-feeling updates, ticker, hero stories, trending lists
- Per-category browsing, full-text search, and source attribution
- Optional accounts with bookmarks, interests, reading history and a personalized "For You" feed
- Light & dark editorial themes, polished loading/error/empty states, and strong accessibility

> DailyNews360 does **not** create original journalism. Every story is attributed to its original publisher and linked back to the source.

---


## 🔍 Realistic Magnifying Glass UI

DailyNews360 features a premium, realistic physical magnifying-glass interface designed to visually resemble a real optical magnifying glass.

The glass UI includes:

- Realistic transparent optical lens
- Detailed metallic outer rim with conic-gradient brushed-metal finish
- Inner glass rim and bevel for metal-to-glass transition
- Subtle glass reflections and highlights via radial gradients
- Realistic depth with multi-layer shadows
- Premium dark-walnut cylindrical handle
- Natural metal ferrule connector between lens and handle
- Responsive proportions across desktop, tablet, and mobile
- Minimal editorial styling matching the DailyNews360 newspaper aesthetic

The design aims to feel like a:

> **Real premium optical magnifying glass**

rather than a simple circular digital overlay.


---


## Screenshots

_Coming soon — add screenshots of the homepage, article page, dark mode and mobile layout here._


**Key design decisions**

- **Provider abstraction** — every provider implements a `NewsProvider` interface and returns normalized `NewsArticle` objects. The frontend never sees a provider's raw format.
- **Fallback chain** — `ProviderManager` tries providers in order; a 429 puts a provider on a 60-second cooldown so it's never hammered in a loop.
- **Dedup + ranking** — exact fingerprint dedup plus title-similarity collapse, then a transparent recency/relevance/popularity/interest ranking.
- **Caching** — in-memory TTL cache (top/category 10 min, search 5 min). The `Cache` interface is swappable for Redis later.
- **Graceful degradation** — if all providers fail or the database is down, the API still serves cached results or friendly errors; news browsing never requires an account.

---

## News API Providers

Providers were selected after inspecting the current **News** section of the [Public APIs](https://github.com/public-apis/public-apis) repository. All are free for light/development use.

| Provider | Key | Free tier | HTTPS | CORS | Search | Categories |
| --- | --- | --- | --- | --- | --- | --- |
| **Noozra** (primary) | No | 100 req/day/IP | Yes | Yes | Yes | Yes |
| **GNews** (fallback) | Yes (free) | 100 req/day | Yes | Yes | Yes | Yes |
| **Currents** (optional) | Yes (free) | Limited | Yes | Yes | Yes | Yes |

- **Noozra** needs no key and is CORS-open, so the project runs out of the box. Get one (free) if you want a key for higher limits: <https://noozra.com/api>
- **GNews** — free key from <https://gnews.io/register> (optional; without it the provider is disabled)
- **Currents** — free key from <https://currentsapi.services/en> (optional, disabled by default)

> API keys are **never** exposed to the frontend. They live in server environment variables only. No paid APIs are used.

---

## Getting Start

### 1. Clone & install

```bash
git clone https://github.com/Meetduggar23/DailyNews360.git
cd DailyNews360

npm install          # root tooling
cd server
npm install
cd ../client
npm install
```

### 2. Configure environment

```bash
# from the project root
cp .env.example .env
```

Optional — add a free GNews key to enable the second provider:

```env
NEWS_PROVIDER_GNEWS_API_KEY=your_gnews_key
```

### 3. Set up the database

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

This creates the `dailynews360` database and applies the schema. (Create the database first if your user lacks create privileges:

```bash
psql -U postgres -c "CREATE DATABASE dailynews360;"
```

## Development Commands

Run from the project root:

| Command | Description |
| --- | --- |
| `npm run dev` | Start server + client with hot reload |
| `npm run dev:server` | Server only |
| `npm run dev:client` | Client only |
| `npm run lint` | ESLint for both packages |
| `npm run typecheck` | TypeScript strict checks for both packages |
| `npm run test` | Run unit + API + component tests |
| `npm run build` | Production build (server + client) |
| `npm run prisma:migrate` | Apply a new Prisma migration |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run format` | Prettier formatting |

---

## Production Build

```bash
npm run build

# 1. Build server (emits to server/dist) and client (emits to client/dist)
# 2. Set NODE_ENV=production in server/.env (or the env your host provides)
# 3. Run the compiled server
npm start   # runs: node server/dist/src/index.js
```

In production, serve the built client from `client/dist` with any static host (Nginx, Vercel, Netlify, S3…) and route `/api` requests to the Express server. CORS is locked to `CLIENT_URL` and cookies are sent with `Secure` + `SameSite=Lax`.

---

## Testing

```bash
npm test
```

Covered areas:

- **Unit tests** — news normalization, deduplication, ranking, date formatting, personalization scoring
- **API tests** — news endpoints, search, bookmarks, authentication
- **Component tests** — article cards, bookmark button, filters, search

---

## Security & Privacy

- Passwords are hashed with bcrypt (12 rounds) — never stored in plain text.
- Sessions use signed JWTs in **httpOnly** cookies (Secure in production, SameSite=Lax).
- Helmet security headers, CORS locked to the configured client origin, and rate limiting on all routes.
- Inputs are validated with Zod; query parameters are sanitized.
- API keys are server-side only — nothing is exposed to the browser.
- `.env`, `node_modules` and build outputs are git-ignored; no credentials are committed.
- Anonymous users can browse without an account; anonymous bookmarks live in localStorage only and are merged into the account on sign-in.
- Users can clear reading history and local data anytime from Settings.

---

## Future Improvements

- Redis-backed cache for multi-instance deployments
- WebSocket or SSE push for genuinely live updates
- RSS ingestion for custom source lists
- Thumbnail proxy + image optimization pipeline
- Higher-rate or paid tiers of current providers for production scale
- Deeper personalization models (clearly labeled, opt-in)
- PWA support with offline caching
- i18n for multilingual news

---

<p align="center">
  <strong>DailyNews360 — Your World, Updated Daily.</strong><br />
  News aggregated from third-party sources. Original reporting belongs to respective publishers.
</p>




<p align="center">
  <strong>Made By Meet Duggar</strong><br />
</p>
