# Quickstart: Home Inventory Organizer

**Date**: 2026-02-07 | **Plan**: [plan.md](plan.md)

## Prerequisites

- Node.js 20+ (LTS)
- PostgreSQL 16+
- S3-compatible storage account (Cloudflare R2 or AWS S3) for photo uploads

## Setup

```bash
# 1. Clone and install
git clone <repo-url> && cd szafat
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values (see Environment Variables below)

# 3. Set up database
npx prisma migrate dev

# 4. Generate VAPID keys for Web Push
npx web-push generate-vapid-keys
# Copy the output to .env.local (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

# 5. Start development server
npm run dev
# App available at http://localhost:3000
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/szafat

# Auth.js
AUTH_SECRET=<random-32-char-string>
AUTH_URL=http://localhost:3000

# S3-compatible storage (Cloudflare R2 example)
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=<key>
S3_SECRET_ACCESS_KEY=<secret>
S3_BUCKET_NAME=szafat-photos
S3_PUBLIC_URL=https://photos.yourdomain.com

# Web Push (VAPID)
VAPID_PUBLIC_KEY=<public-key>
VAPID_PRIVATE_KEY=<private-key>
VAPID_EMAIL=mailto:admin@yourdomain.com
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Next.js) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run test` | Run unit + integration tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Lint with ESLint |
| `npm run type-check` | TypeScript type checking |
| `npx prisma studio` | Open Prisma database browser |
| `npx prisma migrate dev` | Apply pending migrations |

## Project Structure (key files)

```
src/app/              → Pages and API routes (Next.js App Router)
src/components/       → React components
src/lib/              → Shared utilities (auth, db, push, qr, photo)
src/hooks/            → Custom React hooks
src/messages/         → i18n translation files (en.json, pl.json)
prisma/schema.prisma  → Database schema
public/sw.js          → Service worker (push + caching)
tests/                → Unit, integration, and E2E tests
```

## Development Workflow

1. Write failing test (Vitest or Playwright)
2. Implement minimum code to pass
3. Refactor
4. Run `npm run test` to verify
5. Run `npm run type-check` and `npm run lint` before committing

## Testing Strategy

- **Unit tests** (`tests/unit/`): Models, utilities, date formatting, QR encoding. Use Vitest.
- **Integration tests** (`tests/integration/`): API route handlers with test database. Use Vitest + Prisma test client.
- **E2E tests** (`tests/e2e/`): Critical user journeys (add item, scan QR, drag fridge items). Use Playwright with mobile viewport.
- **Coverage target**: >80% for business logic (constitution requirement).
