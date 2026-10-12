# szafat

An experiment in **spec-driven vibe coding**: a complete web app built by an AI coding agent (Claude Code) following [GitHub Spec Kit](https://github.com/github/spec-kit), from a one-paragraph idea to a working Next.js app. The goal was to test the Spec Kit workflow itself rather than to ship a product.

The app is a home inventory organizer: it keeps track of what is stored where (apartments, rooms, furniture, drawers and the items inside them), with search, QR labels, photos and expiration reminders for food.

## The Spec Kit experiment

Spec Kit makes the agent write a specification, a plan and a task list before it writes any code. Every artifact from that process is kept in this repo:

| Step | Command | Output |
|---|---|---|
| Project principles | `/speckit.constitution` | [`.specify/memory/constitution.md`](.specify/memory/constitution.md) |
| Specification | `/speckit.specify` | [`spec.md`](specs/001-home-inventory-organizer/spec.md): 9 user stories, 43 functional requirements |
| Clarification | `/speckit.clarify` | the Clarifications section of `spec.md` (push notifications, languages, invites, deletion) |
| Technical plan | `/speckit.plan` | [`plan.md`](specs/001-home-inventory-organizer/plan.md), [`research.md`](specs/001-home-inventory-organizer/research.md), [`data-model.md`](specs/001-home-inventory-organizer/data-model.md), [`contracts/api.yaml`](specs/001-home-inventory-organizer/contracts/api.yaml) |
| Task breakdown | `/speckit.tasks` | [`tasks.md`](specs/001-home-inventory-organizer/tasks.md): 143 tasks grouped by user story |
| Implementation | `/speckit.implement` | `src/`, `prisma/`, `tests/` (about 4,800 lines of app code and 1,200 lines of tests) |

The Spec Kit slash commands are in [`.claude/commands/`](.claude/commands/), and the templates and scripts are in [`.specify/`](.specify/).

### Observations

- **The paperwork paid off for scope.** The spec, data model and API contract kept a fairly large feature set (multi-user apartments, a storage hierarchy, QR codes, photos, push notifications, two languages) consistent across the codebase.
- **"Done" in `tasks.md` does not mean the app works.** 119 of 143 tasks are ticked off, yet manual testing found buttons with no handlers ("Add room", "Add furniture"). They were fixed in follow-up prompts. The push-notification client also calls an API endpoint (`/api/push/vapid-key`) that was never implemented.
- **The agent did not honour the constitution.** The constitution makes test-first development mandatory, but most of the 24 unfinished tasks are test-writing tasks. The agent implemented features and deferred their tests.
- **Spec Kit does not replace verification.** The workflow structures *what* gets built. Whether it actually works still needs to be checked by running the app, linting and reviewing the code.

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
