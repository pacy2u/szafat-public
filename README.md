# szafat

A home inventory organizer: keep track of what is stored where — apartments, rooms, furniture, drawers and the items inside them — with search, QR labels, photos and expiration reminders for food.

## Features

- Hierarchy: apartment → room → storage unit → shelf / drawer → item, reorderable with drag and drop
- Fuzzy search across all items (PostgreSQL trigram indexes)
- QR codes for storage units, plus an in-app QR scanner
- Item photos (S3-compatible storage)
- Fridge view with expiration dates and Web Push reminders
- Shared apartments via invite links
- Polish and English UI

## Tech stack

Next.js (App Router), React 19, TypeScript, Prisma + PostgreSQL, Auth.js, next-intl, @dnd-kit, Vitest, Playwright.

## Getting started

Requirements: Node.js 20+, PostgreSQL 16+ (with the `pg_trgm` extension), and an S3-compatible bucket if you want photo uploads.

```bash
npm install
cp .env.example .env.local   # then fill in the values
npx prisma migrate dev
npm run dev                  # http://localhost:3000
```

Generate the VAPID keys for Web Push with `npx web-push generate-vapid-keys`.

Expiration reminders are sent by `POST /api/push/check-expirations`, meant to be called by an external cron job with `Authorization: Bearer $CRON_SECRET`. The endpoint refuses every request when `CRON_SECRET` is not set.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm test` | Unit and integration tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright) |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check |

## Project layout

```
src/app/        pages and API routes
src/components/ React components
src/lib/        auth, db, push, QR, photo helpers
src/messages/   translations (pl, en)
prisma/         schema and migrations
specs/          feature specification and design docs
tests/          unit, integration and e2e tests
```

## License

No license has been granted. The source is public for reference, but all rights are reserved.
