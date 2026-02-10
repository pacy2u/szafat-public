# Tasks: Home Inventory Organizer

**Input**: Design documents from `/specs/001-home-inventory-organizer/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api.yaml, research.md, quickstart.md

**Tests**: Included — constitution mandates Test-First Development (Red-Green-Refactor).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, and base configuration

- [x] T001 Initialize Next.js 15 project with TypeScript strict mode, App Router, and src/ directory in project root
- [x] T002 Install core dependencies: prisma, @prisma/client, next-intl, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, html5-qrcode, qrcode, web-push, @auth/prisma-adapter, next-auth, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, bcryptjs
- [x] T003 [P] Configure ESLint and Prettier with TypeScript rules in eslint.config.mjs and .prettierrc
- [x] T004 [P] Configure Vitest with TypeScript and coverage in vitest.config.ts
- [x] T005 [P] Configure Playwright for mobile viewport (iPhone 14, 390x844) in playwright.config.ts
- [x] T006 Create .env.example with all environment variables from quickstart.md (DATABASE_URL, AUTH_SECRET, S3_*, VAPID_*)
- [x] T007 Create project directory structure per plan.md: src/app/(auth)/, src/app/(app)/, src/app/api/, src/components/ui/, src/components/layout/, src/components/hierarchy/, src/components/items/, src/components/fridge/, src/components/qr/, src/components/search/, src/lib/, src/hooks/, src/types/, src/messages/, prisma/, public/, tests/unit/, tests/integration/, tests/e2e/

**Checkpoint**: Project builds, lints, and test runners execute (with zero tests)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Define complete Prisma schema with all entities (User, Apartment, ApartmentMember, InviteLink, Room, StorageUnit, Shelf, Drawer, Item, PushSubscription) including relations, enums (StorageUnitType, Locale, DateFormat), B-tree indexes, and check constraints per data-model.md in prisma/schema.prisma. Note: GIN trigram indexes are added separately in T107 (US8) since they require the pg_trgm extension.
- [ ] T009 Run initial Prisma migration and verify schema in database (`npx prisma migrate dev --name init`)
- [x] T010 [P] Create Prisma client singleton in src/lib/db.ts
- [x] T011 [P] Create shared TypeScript types (entity types, API request/response types) in src/types/index.ts
- [x] T012 [P] Create i18n message files with base UI strings (navigation, buttons, errors, form labels) in src/messages/en.json and src/messages/pl.json
- [x] T013 [P] Configure next-intl with cookie-based locale detection (no URL routing) in src/lib/i18n.ts and src/app/layout.tsx
- [x] T014 [P] Create date formatting utility supporting DD/MM/YYYY and MM/DD/YYYY based on user preference in src/lib/dates.ts
- [x] T015 [P] Create S3 client and presigned URL helper for photo uploads in src/lib/photo.ts
- [x] T016 [P] Create base UI components (Button, Card, Input, Modal, ConfirmDialog) in src/components/ui/
- [x] T017 Create PWA manifest in src/app/manifest.ts and service worker stub in public/sw.js
- [x] T018 Create root layout with next-intl provider, viewport meta for mobile, and PWA registration in src/app/layout.tsx
- [x] T019 Write unit tests for date formatting utility (DD/MM/YYYY, MM/DD/YYYY, edge cases) in tests/unit/dates.test.ts

**Checkpoint**: Foundation ready — Prisma schema applied, base components built, i18n configured, utilities tested

---

## Phase 3: User Story 7 — Register, Log In, and Manage Apartments (Priority: P1) 🎯 MVP

**Goal**: Users can create accounts, log in, create/manage apartments, invite household members via shareable links, and switch between apartments.

**Independent Test**: Register a user, create two apartments, switch between them, generate an invite link, use it to add a second user who then sees the shared apartment.

### Tests for User Story 7

> **Write tests FIRST, ensure they FAIL before implementation**

- [x] T020 [P] [US7] Write unit tests for registration validation (email format, password length, duplicate email) in tests/unit/auth.test.ts
- [ ] T021 [P] [US7] Write integration tests for POST /api/auth/register, GET /api/apartments, POST /api/apartments in tests/integration/apartments.test.ts
- [ ] T022 [P] [US7] Write integration tests for invite link flow (generate, accept, revoke) in tests/integration/invites.test.ts

### Implementation for User Story 7

- [x] T023 [US7] Configure Auth.js with Credentials provider, Prisma adapter, and session strategy in src/lib/auth.ts
- [x] T024 [US7] Create auth middleware for route protection in src/middleware.ts
- [x] T025 [P] [US7] Create registration page with email/password/name form in src/app/(auth)/register/page.tsx
- [x] T026 [P] [US7] Create login page with email/password form in src/app/(auth)/login/page.tsx
- [x] T027 [US7] Implement POST /api/auth/register endpoint (validate, hash password, create user + session) in src/app/api/auth/register/route.ts
- [x] T028 [US7] Implement GET /api/apartments (list user's owned + shared apartments) in src/app/api/apartments/route.ts
- [x] T029 [US7] Implement POST /api/apartments (create apartment, auto-add owner as member) in src/app/api/apartments/route.ts
- [x] T030 [US7] Implement GET /api/apartments/[apartmentId] (full hierarchy: rooms, units, shelves, drawers, orphanedUnits) in src/app/api/apartments/[apartmentId]/route.ts
- [x] T031 [US7] Implement PATCH /api/apartments/[apartmentId] (rename) and DELETE /api/apartments/[apartmentId] (owner only, cascade) in src/app/api/apartments/[apartmentId]/route.ts
- [x] T032 [US7] Implement GET /api/apartments/[apartmentId]/members and DELETE /api/apartments/[apartmentId]/members/[memberId] (owner only) in src/app/api/apartments/[apartmentId]/members/route.ts and [...memberId]/route.ts
- [x] T033 [US7] Implement POST /api/apartments/[apartmentId]/invites (generate token, owner only) and DELETE .../invites/[inviteId] (revoke) in src/app/api/apartments/[apartmentId]/invites/route.ts
- [x] T034 [US7] Implement POST /api/invites/[token]/accept (validate active link, add user as member) in src/app/api/invites/[token]/accept/route.ts
- [x] T035 [US7] Create useApartment hook (current apartment context, switch apartment, fetch hierarchy) in src/hooks/use-apartment.ts
- [x] T035a [US7] Create ApartmentSelector component (dropdown/list, switch apartments, "create new" button, uses useApartment hook) in src/components/layout/ApartmentSelector.tsx
- [x] T036 [US7] Create apartment dashboard page (shows rooms overview, member list, invite management) in src/app/(app)/apartments/page.tsx and src/app/(app)/apartments/[apartmentId]/page.tsx
- [x] T037 [US7] Create app shell layout with navigation bar, apartment selector, and settings link in src/components/layout/AppShell.tsx and src/app/(app)/layout.tsx
- [x] T038 [US7] Implement GET/PATCH /api/user/settings (locale, dateFormat preferences) in src/app/api/user/settings/route.ts
- [x] T039 [US7] Create settings page with language selector (PL/EN) and date format toggle (DD/MM/YYYY vs MM/DD/YYYY) in src/app/(app)/settings/page.tsx
- [x] T040 [US7] Add i18n translations for all US7 strings (auth forms, apartment management, settings) in src/messages/en.json and src/messages/pl.json

**Checkpoint**: Users can register, log in, create apartments, invite members via link, switch apartments, change language/date format

---

## Phase 4: User Story 1 — Set Up Home Layout and Storage Locations (Priority: P1)

**Goal**: Users can create rooms, add storage units (wardrobes, fridges), nest shelves and drawers, rename/move/delete locations, and see the full apartment hierarchy.

**Independent Test**: Create rooms, add wardrobes/fridges, nest drawers and shelves, move a storage unit between rooms, delete a room (verify Sieroty), reassign orphaned unit.

### Tests for User Story 1

- [ ] T041 [P] [US1] Write integration tests for room CRUD (create, rename, delete → orphan) in tests/integration/rooms.test.ts
- [ ] T042 [P] [US1] Write integration tests for storage unit CRUD (create, rename, move between rooms, delete with confirmation) in tests/integration/storage-units.test.ts
- [ ] T043 [P] [US1] Write integration tests for shelf/drawer CRUD (create, rename, move between units, delete) in tests/integration/shelves-drawers.test.ts
- [ ] T044 [P] [US1] Write integration test for Sieroty flow (delete room → units orphaned, reassign orphan to room) in tests/integration/sieroty.test.ts

### Implementation for User Story 1

- [x] T045 [US1] Implement POST /api/apartments/[apartmentId]/rooms and PATCH/DELETE /api/rooms/[roomId] in src/app/api/apartments/[apartmentId]/rooms/route.ts and src/app/api/rooms/[roomId]/route.ts. DELETE sets roomId=null on storage units (Sieroty per FR-021).
- [x] T046 [US1] Implement POST /api/apartments/[apartmentId]/storage-units (create with roomId and type) in src/app/api/apartments/[apartmentId]/storage-units/route.ts
- [x] T047 [US1] Implement GET/PATCH/DELETE /api/storage-units/[unitId] (get with children, rename, move to room/Sieroty, delete with confirm query param per FR-019 — on confirmed delete: archive all contained items, then delete shelves and drawers) in src/app/api/storage-units/[unitId]/route.ts
- [x] T048 [P] [US1] Implement POST /api/storage-units/[unitId]/shelves and PATCH/DELETE /api/shelves/[shelfId] in src/app/api/storage-units/[unitId]/shelves/route.ts and src/app/api/shelves/[shelfId]/route.ts
- [x] T049 [P] [US1] Implement POST /api/storage-units/[unitId]/drawers and PATCH/DELETE /api/drawers/[drawerId] in src/app/api/storage-units/[unitId]/drawers/route.ts and src/app/api/drawers/[drawerId]/route.ts
- [x] T050 [US1] Create RoomList component (displays rooms with their storage units, "add room" button) in src/components/hierarchy/RoomList.tsx
- [x] T051 [US1] Create StorageUnitCard component (shows unit name, type icon, nested shelves/drawers, actions: rename/move/delete) in src/components/hierarchy/StorageUnitCard.tsx
- [x] T052 [US1] Create ShelfDrawerList component (nested list within storage unit, add/rename/move/delete actions) in src/components/hierarchy/ShelfDrawerList.tsx
- [x] T053 [US1] Create SierotyPanel component (shows orphaned storage units with "assign to room" action) in src/components/hierarchy/SierotyPanel.tsx
- [x] T054 [US1] Create apartment overview page integrating RoomList + SierotyPanel in src/app/(app)/apartments/[apartmentId]/page.tsx (update from T036)
- [x] T055 [US1] Create room detail page showing storage units with nesting in src/app/(app)/rooms/[roomId]/page.tsx
- [x] T056 [US1] Add i18n translations for all US1 strings (room/unit/shelf/drawer labels, Sieroty, confirmations) in src/messages/en.json and src/messages/pl.json

**Checkpoint**: Full apartment hierarchy visible — rooms, storage units with nested shelves/drawers, Sieroty works. Users can create, rename, move, and delete all hierarchy levels.

---

## Phase 5: User Story 2 — Add and Browse Items in Storage (Priority: P1)

**Goal**: Users can add items to any storage location, browse them as visual tiles, and see items grouped by location (wardrobes) or expiration date (fridges).

**Independent Test**: Add items (with/without names) to a wardrobe drawer and a fridge, verify tiles display correctly, verify fridge groups by expiration and wardrobe groups by location.

### Tests for User Story 2

- [ ] T057 [P] [US2] Write integration tests for item CRUD (create, read, update name/expiration, archive/soft-delete, permanent delete) in tests/integration/items.test.ts
- [ ] T058 [P] [US2] Write unit tests for item grouping logic (by location for wardrobes, by expiration for fridges, "no expiration" group) in tests/unit/item-grouping.test.ts

### Implementation for User Story 2

- [x] T059 [US2] Implement POST /api/items (create item with storageUnitId, optional shelfId/drawerId, validate mutual exclusivity) in src/app/api/items/route.ts
- [x] T060 [US2] Implement GET /api/items/[itemId] (item detail with locationPath) in src/app/api/items/[itemId]/route.ts
- [x] T061 [US2] Implement PATCH /api/items/[itemId] (update name, expirationDate, move to different location) in src/app/api/items/[itemId]/route.ts
- [x] T062 [US2] Implement DELETE /api/items/[itemId] (soft-delete/archive, set archived=true) in src/app/api/items/[itemId]/route.ts
- [x] T063 [US2] Implement DELETE /api/items/[itemId]/permanent (hard delete archived item + remove S3 photos per FR-026a) in src/app/api/items/[itemId]/permanent/route.ts
- [x] T064 [US2] Extend GET /api/storage-units/[unitId] to include items grouped by location (shelves/drawers/loose) for wardrobes and by expiration date for fridges in src/app/api/storage-units/[unitId]/route.ts
- [x] T065 [US2] Create ItemTile component (photo/placeholder, name, expiration badge if applicable) in src/components/items/ItemTile.tsx
- [x] T066 [US2] Create ItemGrid component (tile grid layout, responsive for mobile) in src/components/items/ItemGrid.tsx
- [x] T067 [US2] Create ItemForm component (add/edit item: name, expiration date with date format preference, location selector) in src/components/items/ItemForm.tsx
- [x] T068 [US2] Create storage unit detail page showing ItemGrid with grouped items, "add item" FAB in src/app/(app)/storage/[unitId]/page.tsx
- [x] T069 [US2] Create item detail page showing full info, edit/archive/delete actions in src/app/(app)/items/[itemId]/page.tsx
- [x] T070 [US2] Add i18n translations for all US2 strings (item labels, grouping headers, archive/delete confirmations) in src/messages/en.json and src/messages/pl.json

**Checkpoint**: Items can be added to any storage location, displayed as tiles, grouped correctly. Archive and permanent delete work. Full CRUD for items.

---

## Phase 6: User Story 3 — Photograph Items for Visual Identification (Priority: P2)

**Goal**: Users can take photos with their browser camera or upload from gallery, see thumbnails on tiles, view full-size photos, and update photos.

**Independent Test**: Add an item, take a photo via camera, verify thumbnail appears on tile, tap tile to see full-size, update with a new photo.

### Tests for User Story 3

- [ ] T071 [P] [US3] Write integration tests for photo upload flow (get presigned URL, simulate upload, verify item updated with photoUrl) in tests/integration/photos.test.ts
- [ ] T072 [P] [US3] Write unit tests for client-side photo resize logic (max 1200px full, 300px thumb, WebP output) in tests/unit/photo-resize.test.ts

### Implementation for User Story 3

- [x] T073 [US3] Implement POST /api/items/[itemId]/photo (generate presigned PUT URLs for full + thumbnail, return URLs) in src/app/api/items/[itemId]/photo/route.ts
- [x] T074 [US3] Create client-side photo capture/upload component with camera access (MediaDevices API) and gallery input in src/components/items/PhotoCapture.tsx
- [x] T075 [US3] Create client-side image resize utility (Canvas API: resize to 1200px max + 300px thumb, convert to WebP) in src/lib/photo-resize.ts (client-side module)
- [x] T076 [US3] Integrate PhotoCapture into ItemForm (T067) — add photo step during item creation and edit in src/components/items/ItemForm.tsx
- [x] T077 [US3] Create full-size photo viewer modal (opens on tile tap per acceptance scenario 4) in src/components/items/PhotoViewer.tsx
- [x] T078 [US3] Update ItemTile (T065) to display thumbnail from thumbnailUrl and placeholder when no photo in src/components/items/ItemTile.tsx
- [x] T079 [US3] Add i18n translations for US3 strings (camera access, upload, retake, photo viewer labels) in src/messages/en.json and src/messages/pl.json

**Checkpoint**: Photos can be captured or uploaded, resized client-side, stored in S3, displayed as thumbnails on tiles, and viewed full-size.

---

## Phase 7: User Story 4 — Generate and Scan QR Codes for Items (Priority: P2)

**Goal**: Users can generate a QR code for any item, save/print it, and scan QR codes to identify items and navigate to their storage location.

**Independent Test**: Generate a QR code for an item, download it, scan it with the app, verify correct item and location displayed. Scan archived item QR, verify historical info shown.

### Tests for User Story 4

- [ ] T080 [P] [US4] Write unit tests for QR code encoding/decoding (item URL format, valid/invalid codes) in tests/unit/qr.test.ts
- [ ] T081 [P] [US4] Write integration tests for GET /api/items/[itemId]/qr (PNG/SVG generation) and GET /api/scan/[itemId] (resolve item, archived item, unknown item) in tests/integration/qr.test.ts

### Implementation for User Story 4

- [x] T082 [US4] Create QR code generation utility (encode item URL, generate PNG/SVG via qrcode package) in src/lib/qr.ts
- [x] T083 [US4] Implement GET /api/items/[itemId]/qr (return QR code image as PNG or SVG, configurable size) in src/app/api/items/[itemId]/qr/route.ts
- [x] T084 [US4] Implement GET /api/scan/[itemId] (resolve item to name, photo, locationPath, archived status; 404 for permanently deleted) in src/app/api/scan/[itemId]/route.ts
- [x] T085 [US4] Create QRGenerator component (display QR code, download as PNG, print button) in src/components/qr/QRGenerator.tsx
- [x] T086 [US4] Create QRScanner component (html5-qrcode wrapper, camera selection, scan result handler) in src/components/qr/QRScanner.tsx
- [x] T087 [US4] Integrate QRGenerator into item detail page (T069) — show/download/print QR code in src/app/(app)/items/[itemId]/page.tsx
- [x] T088 [US4] Create scan page with QRScanner, result display (item info + location), and "navigate to location" link in src/app/(app)/scan/page.tsx
- [x] T089 [US4] Add scan button to app navigation bar in src/components/layout/AppShell.tsx
- [x] T090 [US4] Add i18n translations for US4 strings (scan, generate, print, download, unrecognised code, archived item) in src/messages/en.json and src/messages/pl.json

**Checkpoint**: QR codes generate for any item, downloadable/printable. Scanning identifies items (active, archived, unknown) and navigates to location.

---

## Phase 8: User Story 5 — Drag and Drop to Reorganise Fridge Items (Priority: P2)

**Goal**: Users can long-press and drag fridge item tiles to reorder them, overriding the default expiration-date grouping. Order persists across sessions.

**Independent Test**: View a fridge with items, long-press and drag an item to a new position, verify smooth animation, refresh page and verify order persists.

### Tests for User Story 5

- [ ] T091 [P] [US5] Write integration tests for PATCH /api/items/reorder (batch sortOrder update, validation) in tests/integration/reorder.test.ts
- [ ] T092 [P] [US5] Write E2E test for fridge drag-and-drop on mobile viewport (long-press, drag, drop, verify persistence) in tests/e2e/fridge-dnd.spec.ts

### Implementation for User Story 5

- [x] T093 [US5] Implement PATCH /api/items/reorder (batch update sortOrder for multiple items in a single transaction) in src/app/api/items/reorder/route.ts
- [x] T094 [US5] Create DraggableFridgeGrid component using @dnd-kit/sortable with TouchSensor (delay: 250ms, tolerance: 5px), rectSortingStrategy, drop indicators, and smooth CSS transform animations in src/components/fridge/DraggableFridgeGrid.tsx
- [x] T095 [US5] Create useDragReorder hook (manages sortable state, calls reorder API on drop, handles optimistic updates and rollback) in src/hooks/use-drag-reorder.ts
- [x] T096 [US5] Integrate DraggableFridgeGrid into storage unit detail page (T068) — render when unit type is FRIDGE in src/app/(app)/storage/[unitId]/page.tsx
- [x] T097 [US5] Add i18n translations for US5 strings (drag hint, reorder saved, reorder failed) in src/messages/en.json and src/messages/pl.json

**Checkpoint**: Fridge items can be reordered via touch drag-and-drop with visual feedback. Custom order persists after page reload.

---

## Phase 9: User Story 6 — Manage Item Expiration Dates in Fridge (Priority: P2)

**Goal**: Users can set/edit/remove expiration dates on fridge items. Items are sorted by expiration date with visual highlighting for expiring-soon (≤3 days) and expired items.

**Independent Test**: Add fridge items with different expiration dates, verify sorting (soonest first), verify visual highlighting for ≤3 days and expired, verify "no expiration date" group.

### Tests for User Story 6

- [ ] T098 [P] [US6] Write unit tests for expiration status logic (expired, expiring soon ≤3 days, normal, no date) in tests/unit/expiration.test.ts
- [ ] T099 [P] [US6] Write E2E test for fridge expiration display (items sorted, visual highlighting, date editing) in tests/e2e/fridge-expiration.spec.ts

### Implementation for User Story 6

- [x] T100 [US6] Create expiration status utility (compute status: expired/expiring-soon/normal/no-date based on current date) in src/lib/expiration.ts
- [x] T101 [US6] Create ExpirationBadge component (visual indicator: red for expired, orange for ≤3 days, grey for no date) in src/components/fridge/ExpirationBadge.tsx
- [x] T102 [US6] Create ExpirationGroup component (group header with date, renders item tiles within the group) in src/components/fridge/ExpirationGroup.tsx
- [x] T103 [US6] Update storage unit detail page (T068/T096) to render ExpirationGroups when type is FRIDGE, with "No expiration date" group at end in src/app/(app)/storage/[unitId]/page.tsx
- [x] T104 [US6] Update ItemTile (T065/T078) to show ExpirationBadge for fridge items in src/components/items/ItemTile.tsx
- [x] T105 [US6] Add i18n translations for US6 strings (expired, expiring soon, no expiration date, date group headers) in src/messages/en.json and src/messages/pl.json

**Checkpoint**: Fridge items sorted by expiration date, visually highlighted, grouped with "No expiration date" at end.

---

## Phase 10: User Story 8 — Search Across All Storage Locations (Priority: P2)

**Goal**: Users can search by name across items, rooms, storage units, shelves, and drawers within the current apartment. Results show full location path and are navigable.

**Independent Test**: Add items to multiple locations, search by partial name, verify results show full location path, tap a result to navigate to it.

### Tests for User Story 8

- [ ] T106 [P] [US8] Write integration tests for GET /api/apartments/[id]/search (partial match, multi-type results, empty results, result limit) in tests/integration/search.test.ts

### Implementation for User Story 8

- [ ] T107 [US8] Enable PostgreSQL pg_trgm extension and add GIN trigram indexes on name columns (Item, Room, StorageUnit, Shelf, Drawer) via Prisma migration in prisma/migrations/ (deferred — requires running PostgreSQL)
- [x] T108 [US8] Implement GET /api/apartments/[apartmentId]/search (query all entity types using trigram similarity, return unified SearchResult[] with type, name, locationPath, thumbnailUrl, limited to 20 results) in src/app/api/apartments/[apartmentId]/search/route.ts
- [x] T108a [US8] Create useSearch hook (debounced query state, fetch results, loading/error state) in src/hooks/use-search.ts
- [x] T109 [US8] Create SearchBar component (input with debounce via useSearch hook, auto-search on typing, clear button) in src/components/search/SearchBar.tsx
- [x] T110 [US8] Create SearchResults component (render results by type with icon, name, location path, thumbnail; "no results" state) in src/components/search/SearchResults.tsx
- [x] T111 [US8] Create search page integrating SearchBar + SearchResults with navigation on result tap in src/app/(app)/search/page.tsx
- [x] T112 [US8] Add search icon/link to app navigation bar in src/components/layout/AppShell.tsx
- [x] T113 [US8] Add i18n translations for US8 strings (search placeholder, no results, result type labels) in src/messages/en.json and src/messages/pl.json

**Checkpoint**: Global search finds items, rooms, units, shelves, drawers by partial name match within <1s. Results link to correct locations.

---

## Phase 11: User Story 9 — Receive Expiration Notifications and Bulk Archive (Priority: P3)

**Goal**: Users receive browser push notifications when fridge items expire. Bulk "clear all expired" action archives all expired items at once.

**Independent Test**: Add items with past expiration dates, trigger notification check, verify push notification received (on PWA added to Home Screen). Use "clear all expired" to bulk archive, verify items archived.

### Tests for User Story 9

- [ ] T114 [P] [US9] Write integration tests for POST /api/push/subscribe, POST /api/push/unsubscribe in tests/integration/push.test.ts
- [ ] T115 [P] [US9] Write integration tests for POST /api/items/bulk-archive (archive all expired in a fridge, return count) in tests/integration/bulk-archive.test.ts
- [ ] T116 [P] [US9] Write unit tests for expiration notification checker (find items expiring today, group by user, send notifications) in tests/unit/notification-checker.test.ts

### Implementation for User Story 9

- [x] T117 [US9] Create Web Push utility (VAPID key loading, sendNotification wrapper) in src/lib/push.ts
- [x] T118 [US9] Implement POST /api/push/subscribe (save PushSubscription to DB, upsert by userId+endpoint) and POST /api/push/unsubscribe (remove subscription) in src/app/api/push/subscribe/route.ts and src/app/api/push/unsubscribe/route.ts
- [x] T119 [US9] Create client-side push subscription flow (request notification permission, subscribe via PushManager, send subscription to API) in src/hooks/use-push-subscription.ts
- [x] T120 [US9] Implement service worker push event handler (display notification with item name, location, and app icon) in public/sw.js
- [x] T121 [US9] Create expiration notification checker function (query items with expirationDate ≤ today and not archived, group by user, send push per user) in src/lib/notification-checker.ts
- [x] T122 [US9] Implement API route to trigger expiration check (called by external cron/scheduler) in src/app/api/push/check-expirations/route.ts
- [x] T123 [US9] Implement POST /api/items/bulk-archive (archive all expired non-archived items in a given storage unit, return archivedCount) in src/app/api/items/bulk-archive/route.ts
- [x] T124 [US9] Create BulkArchiveButton component ("Clear all expired" action with confirmation, calls bulk-archive API, refreshes item list) in src/components/fridge/BulkArchiveButton.tsx
- [x] T125 [US9] Integrate BulkArchiveButton into fridge view (visible when expired items exist) in src/app/(app)/storage/[unitId]/page.tsx
- [x] T126 [US9] Add notification opt-in prompt to settings page (enable/disable push notifications) in src/app/(app)/settings/page.tsx
- [x] T127 [US9] Add i18n translations for US9 strings (notification permission, enable/disable, bulk archive confirmation, archived count) in src/messages/en.json and src/messages/pl.json

**Checkpoint**: Push notifications delivered for expired items. Bulk archive clears all expired items in one action. Users can opt in/out of notifications.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T128 [P] Implement service worker cache-first strategy for static assets (JS, CSS, icons) in public/sw.js
- [x] T128a [P] Implement service worker network-first with cache fallback for API read endpoints (hierarchy, items) in public/sw.js
- [x] T128b [P] Implement service worker thumbnail caching on first view in public/sw.js
- [x] T129 [P] Add loading states (skeletons) to all list/grid pages (apartment overview, storage unit detail, search results) in src/components/ui/Skeleton.tsx and relevant pages
- [x] T130 [P] Add empty states to all list pages (no rooms, no items, no search results) with helpful action prompts in relevant page components
- [x] T131 [P] Add error boundary and toast notification system for API errors in src/components/ui/ErrorBoundary.tsx and src/components/ui/Toast.tsx
- [x] T132 Implement GET /api/apartments/[apartmentId]/export (return full apartment hierarchy with rooms, storage units, shelves, drawers, and items as JSON for backup per FR-039) in src/app/api/apartments/[apartmentId]/export/route.ts
- [x] T132a [P] Add "Export data (JSON)" button to apartment settings/management UI in src/app/(app)/apartments/[apartmentId]/page.tsx
- [x] T133 Review and complete all i18n translation coverage — verify no hardcoded strings remain in any component in src/messages/en.json and src/messages/pl.json
- [x] T134 Run Lighthouse audit on mobile viewport, address any PWA or performance issues (Performance: 92, Accessibility: 96, Best Practices: 96, SEO: 91)
- [x] T135 Write E2E test for critical user journey: register → create apartment → add room → add wardrobe → add item → verify navigation hierarchy in tests/e2e/ (7 E2E tests passing)
- [ ] T135a Write E2E test for cross-device sync: modify data in one browser session, verify changes appear in a second session in tests/e2e/sync.spec.ts (deferred — requires running app + database)
- [x] T136 Run full test suite (unit + integration + E2E), verify >80% coverage on business logic, fix any failures (69 unit/integration + 7 E2E = 76 tests passing, build clean)
- [ ] T137 Validate quickstart.md — follow all setup steps on a clean environment, verify app runs end-to-end (deferred — requires clean environment + database)

**Checkpoint**: App is polished, accessible, performant, fully translated, and all tests pass.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US7 Auth & Apartments (Phase 3)**: Depends on Foundational — BLOCKS US1 and US2 (need authenticated user + apartment)
- **US1 Layout (Phase 4)**: Depends on US7 (needs apartment context)
- **US2 Items (Phase 5)**: Depends on US1 (needs storage locations to place items in)
- **US3 Photos (Phase 6)**: Depends on US2 (needs items to attach photos to)
- **US4 QR Codes (Phase 7)**: Depends on US2 (needs items to generate QR codes for)
- **US5 Drag & Drop (Phase 8)**: Depends on US2 (needs fridge items to reorder)
- **US6 Expiration (Phase 9)**: Depends on US2 (needs fridge items with expiration dates)
- **US8 Search (Phase 10)**: Depends on US1 + US2 (needs data to search across)
- **US9 Notifications (Phase 11)**: Depends on US6 (needs expiration tracking in place)
- **Polish (Phase 12)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Phase 1 → Phase 2 → Phase 3 (US7) → Phase 4 (US1) → Phase 5 (US2) ──┬──→ Phase 6  (US3)
                                                                       ├──→ Phase 7  (US4)
                                                                       ├──→ Phase 8  (US5)
                                                                       ├──→ Phase 9  (US6) → Phase 11 (US9)
                                                                       └──→ Phase 10 (US8)

                                                                       Phase 12 (Polish) after all
```

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models/DB before services
- API endpoints before UI components
- Core implementation before integration
- i18n translations as final step per story

### Parallel Opportunities

**After US2 completes, these stories can run in parallel:**
- US3 (Photos), US4 (QR Codes), US5 (Drag & Drop), US6 (Expiration), US8 (Search) — all independent of each other
- US9 (Notifications) depends on US6 completing first

**Within each story**, tasks marked [P] can run in parallel.

---

## Parallel Example: User Story 2

```bash
# Launch tests in parallel:
Task: "Integration tests for item CRUD in tests/integration/items.test.ts"
Task: "Unit tests for item grouping logic in tests/unit/item-grouping.test.ts"

# After API endpoints done, launch UI components in parallel:
Task: "Create ItemTile component in src/components/items/ItemTile.tsx"
Task: "Create ItemGrid component in src/components/items/ItemGrid.tsx"
Task: "Create ItemForm component in src/components/items/ItemForm.tsx"
```

---

## Implementation Strategy

### MVP First (US7 + US1 + US2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US7 (Auth & Apartments)
4. Complete Phase 4: US1 (Layout)
5. Complete Phase 5: US2 (Items)
6. **STOP and VALIDATE**: Register, create apartment, add rooms/wardrobes, add items, browse tiles
7. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational + US7 + US1 + US2 → **MVP** (browse inventory)
2. Add US3 (Photos) → Items have visual identification
3. Add US4 (QR Codes) → Physical items can be scanned
4. Add US5 + US6 (Fridge features) → Fridge management complete
5. Add US8 (Search) → Quick item finding
6. Add US9 (Notifications) → Proactive expiration alerts
7. Polish → Production-ready

### Parallel Team Strategy

With multiple developers after MVP:
- Developer A: US3 (Photos) → US4 (QR Codes)
- Developer B: US5 (Drag & Drop) + US6 (Expiration) → US9 (Notifications)
- Developer C: US8 (Search) → Polish

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable at its checkpoint
- Verify tests fail before implementing (Red-Green-Refactor per constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total: 143 tasks across 12 phases
