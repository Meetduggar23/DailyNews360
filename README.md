<p align="center">
  <img src="client/public/logo360.png" alt="DailyNews360 logo" width="140" height="150" />
</p>

<h1 align="center">DailyNews360</h1>

<p align="center"><em>Every Story. Every Angle.</em></p>

<p align="center">
  <strong>Your world, one feed.</strong> A modern, real-time news aggregator that pulls headlines from multiple trusted sources into one clean, fast, premium interface.
</p>

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [News API Providers](#news-api-providers)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Development Commands](#development-commands)
- [Production Build](#production-build)
- [Testing](#testing)
- [Folder Structure](#folder-structure)
- [Troubleshooting](#troubleshooting)
- [Security & Privacy](#security--privacy)
- [Future Improvements](#future-improvements)

---

## Overview

**DailyNews360 — Every Story. Every Angle.** is a full-stack news aggregation platform. It gathers headlines from reputable sources worldwide and presents them in one consistent, responsive, content-first interface with:

- Real-time-feeling updates, ticker, hero stories, trending lists
- Per-category browsing, full-text search, and source attribution
- Optional accounts with bookmarks, interests, reading history and a personalized "For You" feed
- Light & dark editorial themes, polished loading/error/empty states, and strong accessibility

> DailyNews360 does **not** create original journalism. Every story is attributed to its original publisher and linked back to the source.

---

## Features

- **Breaking-news ticker** — horizontally scrolling, pauses on hover
- **Editorial homepage** — hero story, secondary stories, latest grid, numbered trending, category sections
- **Category pages** — `/category/:category` with sorting, filters, load-more pagination
- **Search** — debounced, with suggestions, category/source/date filters and `⌘/` / `/` keyboard shortcut
- **Article pages** — byline, hero image, content, related news, share & bookmark, clear source attribution with **Read full article at source**
- **Bookmarks** — PostgreSQL for signed-in users, localStorage for anonymous users, graceful merge on login
- **Personalized feed** — `/for-you` built from interests, reading history, bookmarks and recency via a transparent rule-based ranking (not AI)
- **Authentication** — register, login, logout, profile, protected routes, JWT in httpOnly cookies, bcrypt hashing
- **Reading history & trending** — recorded per user, drives the For You feed
- **Dark mode** — a purpose-built dark editorial theme with smooth transitions, persisted locally
- **Mobile-first responsive** layout with a fixed bottom navigation bar
- **Premium UX** — skeleton loaders, toast notifications, image fallbacks, reading progress bar, back-to-top, page transitions
- **Resilient provider architecture** — provider fallback, per-provider rate-limit cooldown, in-memory caching, mock-data dev mode

---

## Screenshots

_Coming soon — add screenshots of the homepage, article page, dark mode and mobile layout here._

---

## Architecture

```
┌──────────────────────────┐        ┌──────────────────────────────────────────┐
│  React + Vite + Tailwind │  HTTP  │  Express + TypeScript                    │
│  TanStack Query + Router │ ─────► │  Routes → Controllers → Services         │
│  Zustand stores          │  JSON  │                                          │
└──────────────────────────┘        │  Auth (JWT cookie)  Bookmarks            │
                                    │  Preferences  History  Personalization    │
                                    │         │                                │
                                    │         ▼                                │
                                    │  NewsService                             │
                                    │   ├─ cache (in-memory TTL)               │
                                    │   ├─ dedupe + ranker                     │
                                    │   └─ ProviderManager                     │
                                    │        ├─ Noozra (no key)                │
                                    │        ├─ GNews (free key)               │
                                    │        └─ Currents (free key)            │
                                    └──────────────┬───────────────────────────┘
                                                   │ Prisma
                                                   ▼
                                              PostgreSQL
```

**Key design decisions**

- **Provider abstraction** — every provider implements a `NewsProvider` interface and returns normalized `NewsArticle` objects. The frontend never sees a provider's raw format.
- **Fallback chain** — `ProviderManager` tries providers in order; a 429 puts a provider on a 60-second cooldown so it's never hammered in a loop.
- **Dedup + ranking** — exact fingerprint dedup plus title-similarity collapse, then a transparent recency/relevance/popularity/interest ranking.
- **Caching** — in-memory TTL cache (top/category 10 min, search 5 min). The `Cache` interface is swappable for Redis later.
- **Graceful degradation** — if all providers fail or the database is down, the API still serves cached results or friendly errors; news browsing never requires an account.

---

## Tech Stack

### Frontend

| Layer | Tools |
| --- | --- |
| Framework | React 18, TypeScript (strict) |
| Build | Vite |
| Routing | React Router v6 |
| Server state | TanStack Query |
| Styling | Tailwind CSS + shadcn-style components (Radix primitives) |
| Icons | Lucide React |
| Animations | Framer Motion |
| Client state | Zustand |

### Backend

| Layer | Tools |
| --- | --- |
| Runtime | Node.js, TypeScript (strict, ESM) |
| Framework | Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (httpOnly cookie) + bcryptjs |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |
| Tests | Vitest + Supertest |

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

## Getting Started

### Prerequisites

- Node.js **20+** and npm
- PostgreSQL **14+** running locally

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

Edit `.env` and set at minimum:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/dailynews360?schema=public
JWT_SECRET=replace-with-a-long-random-string
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

### 4. Run in development

```bash
# from the project root - starts both server (port 5000) and client (port 5173)
npm run dev
```

Open <http://localhost:5173>. The Vite dev server proxies `/api` to the Express server.

---

## Environment Variables

All variables are documented in [`.env.example`](.env.example).

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | no | API port (default `5000`) |
| `NODE_ENV` | no | `development` \| `production` |
| `CLIENT_URL` | no | Allowed CORS origin (default `http://localhost:5173`) |
| `DATABASE_URL` | **yes** | PostgreSQL connection string |
| `JWT_SECRET` | **yes** | Secret used to sign session tokens |
| `AUTH_COOKIE_NAME` | no | Cookie name for the session |
| `NEWS_PROVIDER_NOOZRA_ENABLED` | no | Enable Noozra provider (default `true`) |
| `NEWS_PROVIDER_GNEWS_ENABLED` | no | Enable GNews provider (default `true`) |
| `NEWS_PROVIDER_GNEWS_API_KEY` | no | Free GNews key |
| `NEWS_PROVIDER_CURRENTS_ENABLED` | no | Enable Currents provider (default `false`) |
| `NEWS_PROVIDER_CURRENTS_API_KEY` | no | Free Currents key |
| `USE_MOCK_NEWS` | no | Serve labeled mock data instead of live providers (**dev only**) |
| `NEWS_CACHE_TTL_*` | no | Cache TTLs in seconds |

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

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

## Folder Structure

```
dailynews360/
├── client/                       # React + Vite frontend
│   ├── public/                   # static assets, logo, favicon
│   └── src/
│       ├── components/
│       │   ├── common/           # logo, states, images, share, search
│       │   ├── layout/           # navbar, footer, mobile nav, layout
│       │   ├── news/             # cards, ticker, hero, trending, sections
│       │   └── ui/               # shadcn-style primitives (radix)
│       ├── hooks/                # react-query hooks, app init, SEO meta
│       ├── lib/                  # utils, date formatting
│       ├── pages/                # all routes
│       ├── services/             # API client
│       ├── stores/               # zustand (auth, theme, bookmarks)
│       ├── constants/            # categories, branding, sort options
│       └── types/                # shared types
│
├── server/                       # Express + Prisma backend
│   └── src/
│       ├── config/               # environment config
│       ├── controllers/          # request handlers
│       ├── routes/               # REST routes
│       ├── middleware/           # auth, validation, rate limiting, errors
│       ├── services/
│       │   ├── news/
│       │   │   ├── providers/    # noozra, gnews, currents, mock + manager
│       │   │   ├── normalizer.ts # provider → NewsArticle
│       │   │   ├── dedupe.ts     # fingerprint + title similarity
│       │   │   ├── ranker.ts     # transparent scoring
│       │   │   └── newsService.ts
│       │   ├── personalization.service.ts
│       │   ├── auth.service.ts
│       │   └── ...               # bookmarks, preferences, history
│       ├── lib/                  # prisma, cache, logger
│       └── utils/                # responses, errors
│
├── prisma/
│   └── schema.prisma             # User, UserPreference, Bookmark, ReadingHistory
├── .env.example
├── .gitignore
└── README.md
```

---

## Troubleshooting

| Problem | Solution |
| --- | --- |
| **No news shown / provider errors** | Check you're online. Noozra has a 100 req/day/IP limit — the API shows a friendly error, and the fallback providers kick in. If you're out of quota, wait or add a GNews key. |
| **`P1001: Can't reach database server`** | Start PostgreSQL and check `DATABASE_URL`. News browsing still works; accounts/bookmarks need the DB. |
| **`password authentication failed`** | Set the correct password in `DATABASE_URL` for your Postgres user. |
| **401 on bookmarks/for-you** | You must be signed in. Create an account or log in. |
| **CORS errors in dev** | Ensure `CLIENT_URL` in `.env` matches the Vite port (`http://localhost:5173`). |
| **TypeScript errors** | Run `npm run typecheck` and fix reported files. |
| **Port already in use** | Change `PORT` in `.env` (server) or `server.port` in `client/vite.config.ts`. |

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
