# Research: Home Inventory Organizer

**Date**: 2026-02-07 | **Plan**: [plan.md](plan.md)

## R-001: Authentication

**Decision**: Auth.js (NextAuth v5)

**Rationale**: Native Next.js 15 App Router support with middleware-based route protection. Self-hosted, no SaaS dependency. Credentials provider for email/password. Prisma adapter for session/user storage in PostgreSQL. Battle-tested (2M+ weekly npm downloads).

**Alternatives considered**:
- Lucia Auth — deprecated March 2025, not viable.
- Clerk — SaaS dependency, vendor lock-in, ongoing cost. Rejected per constitution principle III (user data belongs to user).

**Key setup**: Credentials provider + Prisma adapter. Middleware in `middleware.ts` for route protection. Server actions for session validation.

---

## R-002: Photo Storage

**Decision**: S3-compatible object storage (Cloudflare R2 preferred, AWS S3 fallback)

**Rationale**: Phone camera photos are 2-5MB each. Storing in PostgreSQL (bytea) would bloat the database and degrade query performance. Local filesystem doesn't scale for cloud deployment. S3-compatible storage is purpose-built for binary assets, cost-effective, and CDN-friendly.

**Thumbnail strategy**:
- On upload: client-side resize to max 1200px (full) + 300px (thumbnail) using browser Canvas API before upload.
- Store two variants per photo: `photos/{itemId}/full.webp` and `photos/{itemId}/thumb.webp`.
- WebP format for ~30% size reduction vs JPEG at comparable quality.
- Signed URLs for private access (photos are not public).

**Upload flow**: Browser → resize client-side → presigned PUT URL from API → upload directly to R2/S3 → save URL in item record.

**Alternatives considered**:
- PostgreSQL bytea — database bloat, slow backups, no CDN. Rejected.
- Local filesystem — not cloud-deployable. Rejected.

---

## R-003: Internationalization (i18n)

**Decision**: next-intl

**Rationale**: Purpose-built for Next.js App Router. Supports both Server and Client Components. Type-safe JSON translations. Zero language data sent to client for server-rendered content. 835K+ weekly downloads, actively maintained.

**Key setup**:
- User language preference stored in DB (User.locale field) + cookie for SSR.
- `getRequestConfig()` in `i18n/request.ts` reads locale from cookie per request.
- `useTranslations()` hook in client components, `getTranslations()` in server components.
- No URL-based locale routing (user preference only).
- Language switcher updates DB + cookie, triggers page revalidation.

**Alternatives considered**:
- react-i18next — works but not optimised for App Router server components. More boilerplate for SSR.
- next-translate — less active maintenance, fewer downloads.

---

## R-004: Drag and Drop

**Decision**: @dnd-kit/core + @dnd-kit/sortable

**Rationale**: Built-in grid support (rectSortingStrategy), touch-friendly with configurable long-press activation, smooth CSS transform animations at 60fps. Actively maintained, React 19 compatible. Fine-grained control for custom grid layouts.

**Touch setup (iPhone Safari)**:
- `TouchSensor` with `activationConstraint: { delay: 250, tolerance: 5 }` — 250ms long-press, 5px movement tolerance to prevent accidental drags.
- `useSortable()` hook with `rectSortingStrategy` for grid positioning.
- CSS transforms via `useSortable()` for smooth animations.

**Alternatives considered**:
- @hello-pangea/dnd — lists only, no built-in grid support. Rejected.
- react-beautiful-dnd — deprecated (Atlassian), no React 19 support. Rejected.

---

## R-005: QR Code Generation & Scanning

**Decision**: `qrcode` (npm) for generation, `html5-qrcode` for scanning

**Rationale**:
- **Generation**: `qrcode` package generates QR codes server-side (for downloadable/printable images) and can render to canvas/data URL. Lightweight, no DOM dependency for server use.
- **Scanning**: `html5-qrcode` wraps the browser MediaDevices API with built-in camera selection, torch control, and mobile-optimised scanning. Well-maintained, supports iPhone Safari.

**QR content format**: URL-based — `https://{domain}/scan/{itemId}`. When scanned with any QR reader (not just the app), it opens the item's location page. When scanned within the app, it navigates directly.

**Alternatives considered**:
- qrcode.react — React-only, can't generate server-side for printable images. Supplementary but not sufficient alone.
- @aspect-build/html5-qrcode — fork, less maintained.

---

## R-006: Web Push Notifications

**Decision**: `web-push` (npm) + Service Worker

**Rationale**: Standard Web Push API via `web-push` package for server-side VAPID key management and push message delivery. Service worker handles push event reception and notification display. No third-party push service needed.

**Key setup**:
- Generate VAPID key pair (stored as env vars).
- Client subscribes via `PushManager.subscribe()` on notification opt-in.
- Store `PushSubscription` in DB (per user per device).
- Server-side cron job or scheduled function checks expiration dates daily, sends push via `web-push.sendNotification()`.
- Service worker `push` event handler displays notification with item name + location.

**iOS Safari limitation**: Web Push supported on iOS 16.4+ (2023) for PWAs added to Home Screen. Must prompt user to "Add to Home Screen" for push to work on iPhone.

**Alternatives considered**:
- Firebase Cloud Messaging (FCM) — adds Google dependency. Rejected per constitution principle III.
- OneSignal — SaaS dependency. Rejected.

---

## R-007: Database ORM

**Decision**: Prisma ORM

**Rationale**: Constitution tech stack specifies Prisma. Excellent TypeScript integration with auto-generated types from schema. Migration management built in. Works seamlessly with Next.js and PostgreSQL.

**Key considerations**:
- Prisma Client for queries with type safety.
- Prisma Migrate for schema evolution.
- Prisma transactions (`$transaction`) for atomic multi-step operations (FR-019: delete with cascading confirmation, FR-021: room delete → orphan storage units).
- Relation queries for hierarchical data (apartment → rooms → units → shelves/drawers → items).

---

## R-008: Offline Caching Strategy

**Decision**: Service worker with Cache API (network-first for API, cache-first for static assets)

**Rationale**: Constitution requires offline-first for common operations. The primary offline use case is browsing inventory (read-heavy). Writes require connectivity for multi-user consistency.

**Strategy**:
- **Static assets**: Cache-first (JS, CSS, images, icons).
- **API reads** (hierarchy, items): Network-first with cache fallback. Cache populated on successful fetches.
- **API writes** (create, update, delete): Network-only. If offline, show "offline" indicator and disable mutation actions.
- **Photos**: Cache thumbnails on first view for offline browsing.

**No offline mutation queue in MVP**: Queueing writes offline introduces conflict complexity (last-write-wins is already the simplest conflict model). Defer to future iteration if offline write demand emerges.

**Alternatives considered**:
- Workbox — useful utility but adds abstraction. Raw Cache API is simpler for this scope.
- IndexedDB for local state — overkill for read-only caching. Defer to future if needed.
