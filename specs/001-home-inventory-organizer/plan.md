# Implementation Plan: Home Inventory Organizer

**Branch**: `001-home-inventory-organizer` | **Date**: 2026-02-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-home-inventory-organizer/spec.md`

## Summary

A responsive, mobile-first PWA for organising household items across apartments, rooms, and storage units (wardrobes, fridges, drawers, shelves). Built with Next.js (App Router) + TypeScript full-stack, PostgreSQL for multi-user cloud sync, and Prisma ORM. Key capabilities: hierarchical location management, tile-based item browsing with photos, QR code generation/scanning, fridge expiration tracking with drag-and-drop reordering, multi-apartment/multi-user support with shareable invite links, browser push notifications, and bilingual (PL/EN) UI.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, no `any` in production)
**Primary Dependencies**: Next.js 15 (App Router), React 19, Prisma ORM, Auth.js (NextAuth v5), next-intl, @dnd-kit/core, html5-qrcode, qrcode (npm), web-push
**Storage**: PostgreSQL (relational hierarchy, multi-user); S3-compatible object storage for photos (Cloudflare R2 or AWS S3)
**Testing**: Vitest (unit + integration), Playwright (E2E), Testing Library (component)
**Target Platform**: Progressive Web App (PWA) — mobile-first, optimised for iPhone/Safari
**Project Type**: web (single Next.js project — frontend + API in one)
**Performance Goals**: Search < 1s for 10k items (constitution), page loads < 200ms incremental (constitution), QR scan to result < 3s (spec SC-003)
**Constraints**: Add item < 3 taps/clicks (constitution), offline read via service worker caching, mutations require network (offline mutation queue deferred)
**Scale/Scope**: Small household scale (1-10 users per apartment, up to 10k items per apartment, ~15 screens)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. User-First Simplicity

- **"Add item < 3 taps"**: ✅ Navigate to storage → tap "+" → enter name → save. Photo optional.
- **"Search < 1s for 10k items"**: ✅ PostgreSQL full-text search with GIN index on item/room/unit names. SC-009 targets 2s but constitution requires 1s — design to 1s.
- **"No documentation needed"**: ✅ Hierarchical navigation mirrors physical layout. Guided apartment setup on first login.

### II. Test-First Development

- **"Tests before implementation"**: ✅ Vitest for unit/integration, Playwright for E2E. Task ordering will enforce test-first per feature slice.
- **"Coverage > 80% business logic"**: ✅ Vitest coverage configured for models, services, and API handlers.

### III. Data Integrity & Privacy

- **"Locally-first"**: ⚠️ TENSION — Spec requires cloud sync as primary. **Resolution**: Source of truth is cloud (PostgreSQL), but service worker caches apartment data locally for offline reads. Aligns with constitution's allowance of PostgreSQL "if multi-user sync is needed" — multi-user is a core requirement.
- **"Atomic operations"**: ✅ Prisma transactions for multi-step operations (move item, delete room → orphan storage units).
- **"No telemetry without consent"**: ✅ No analytics planned.
- **"Exportable backups"**: ⚠️ Not in spec. **Resolution**: Add JSON export endpoint as a low-priority future consideration. Not blocking for MVP.

### IV. Progressive Enhancement

- **"Zero-config basic inventory"**: ⚠️ TENSION — Auth required before use. **Resolution**: Auth is a one-time prerequisite (registration + first apartment creation), not a per-action barrier. After initial setup, core inventory functions work immediately.
- **"Offline-first common operations"**: ⚠️ TENSION — Cloud-first by spec. **Resolution**: Service worker caches hierarchy + item data for offline browsing (search, browse). Mutations (add, edit, delete) require network connectivity in the initial version — offline mutation queue deferred to reduce complexity. Read-heavy use case (browsing inventory) works offline.
- **"No feature > 200ms load increase"**: ✅ Code splitting via Next.js dynamic imports. Lazy-load QR scanner, drag-and-drop, and photo capture only when needed.

### Gate Result: PASS (with justified tensions)

All tensions documented in Complexity Tracking below. No blocking violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-home-inventory-organizer/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.yaml         # OpenAPI 3.1 spec
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Public auth routes
│   │   ├── login/
│   │   └── register/
│   ├── (app)/                  # Authenticated routes
│   │   ├── apartments/         # Apartment selector + CRUD
│   │   ├── rooms/              # Room views
│   │   ├── storage/            # Storage unit views (wardrobe, fridge)
│   │   ├── items/              # Item detail + edit
│   │   ├── scan/               # QR scanner page
│   │   ├── search/             # Global search
│   │   └── settings/           # User preferences (language, date format)
│   ├── api/                    # API route handlers
│   │   ├── apartments/
│   │   ├── rooms/
│   │   ├── storage-units/
│   │   ├── shelves/
│   │   ├── drawers/
│   │   ├── items/
│   │   ├── search/
│   │   ├── invites/
│   │   └── push/
│   ├── layout.tsx
│   └── manifest.ts             # PWA manifest
├── components/
│   ├── ui/                     # Base components (Button, Card, Input, etc.)
│   ├── layout/                 # AppShell, Nav, ApartmentSelector
│   ├── hierarchy/              # Room/StorageUnit/Shelf/Drawer tree
│   ├── items/                  # ItemTile, ItemGrid, ItemForm
│   ├── fridge/                 # FridgeView, ExpirationGroup, DragDrop
│   ├── qr/                     # QRGenerator, QRScanner
│   └── search/                 # SearchBar, SearchResults
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── auth.ts                 # Auth.js config
│   ├── push.ts                 # Web Push helpers
│   ├── qr.ts                   # QR generation/encoding
│   ├── photo.ts                # Photo upload/resize utilities
│   └── dates.ts                # Date formatting (DD/MM/YYYY vs MM/DD/YYYY)
├── hooks/                      # Custom React hooks
│   ├── use-apartment.ts
│   ├── use-search.ts
│   └── use-drag-reorder.ts
├── types/                      # Shared TypeScript types
│   └── index.ts
└── messages/                   # i18n translation files
    ├── en.json
    └── pl.json

prisma/
├── schema.prisma
└── migrations/

public/
├── sw.js                       # Service worker (push + caching)
└── icons/                      # PWA icons

tests/
├── unit/                       # Vitest unit tests
├── integration/                # Vitest API/DB integration tests
└── e2e/                        # Playwright E2E tests
```

**Structure Decision**: Single Next.js project (no monorepo). Frontend pages and API route handlers colocated in `src/app/`. This is the simplest viable structure for a full-stack Next.js app, avoids premature separation, and aligns with constitution principle I (simplicity).

## Complexity Tracking

> Constitution tensions justified:

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Cloud-primary instead of local-first (Principle III) | Multi-user household sharing requires a shared data source. Spec FR-030/FR-031 mandate cloud sync + multi-user. | Pure local-first (e.g., SQLite + CRDT sync) adds massive complexity for conflict resolution, far exceeding the "simplicity" principle. PostgreSQL is the constitution's own fallback for multi-user. |
| Auth required before use (Principle IV) | Cloud sync and household sharing require user identity. Spec FR-032 mandates authentication. | Anonymous local-only mode would fragment the data model and require a migration path when users eventually sign up. One-time auth is minimal friction. |
| Exportable backups (Principle III) | Required by constitution. Added as FR-039 and task in Polish phase. | JSON export is straightforward — single API endpoint per apartment. |
| Offline mutations deferred (Principle IV) | Constitution says "add items" should work offline. Offline mutation queue adds significant complexity (conflict resolution, sync logic). | Network-only mutations in MVP. Offline reads (browse, search cached data) cover the primary offline use case. Offline writes deferred to future iteration. |
