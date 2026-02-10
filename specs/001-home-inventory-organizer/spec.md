# Feature Specification: Home Inventory Organizer

**Feature Branch**: `001-home-inventory-organizer`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "Build an application that can help me organize my stuff at home in my wardrobes, drawers and fridge. Items in the fridge are grouped by expiration date and can be re-organized by dragging and dropping on the main page. Items in wardrobes or drawers are grouped by their location. Items can be photographed to visualise them. Items can be coded and referenced for easier storage and identification (including QR code, for example to put back item into its location after use). Within each defined wardrobe, drawer or fridge, items are previewed in a tile-like interface. Drawers can be nested in wardrobe. Wardrobes should be also placed in my apartment for quick identification."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Up Home Layout and Storage Locations (Priority: P1)

As a homeowner, I want to define and evolve the rooms in my apartment and place storage units (wardrobes, fridges) within those rooms so I can quickly identify where things are stored based on physical location — even as my home setup changes over time.

I open the app and create my apartment layout by naming rooms (e.g., "Bedroom", "Kitchen", "Hallway"). Within each room, I add storage units such as wardrobes or fridges. Within wardrobes and fridges, I can add shelves and drawers to mirror their real-world internal structure. Each storage unit gets a name and is visually associated with its room. As my home evolves — a new wardrobe arrives, a room is repurposed, or furniture is moved — I can edit the layout: rename rooms, add or remove storage units, and move storage units between rooms.

**Why this priority**: Without a location hierarchy, no items can be organized. This is the foundational data structure the entire app depends on.

**Independent Test**: Can be fully tested by creating rooms, adding wardrobes/fridges, nesting drawers inside wardrobes, and verifying the hierarchy displays correctly. Delivers the core organisational structure.

**Acceptance Scenarios**:

1. **Given** a new user with no data, **When** they create a room named "Kitchen", **Then** the room appears in the apartment overview.
2. **Given** a room exists, **When** the user adds a wardrobe named "Pantry Cabinet" to the Kitchen, **Then** the wardrobe appears under the Kitchen room.
3. **Given** a wardrobe exists, **When** the user adds a drawer named "Top Drawer" inside it, **Then** the drawer appears nested within the wardrobe.
4. **Given** a wardrobe or fridge exists, **When** the user adds a shelf named "Middle Shelf" inside it, **Then** the shelf appears nested within the storage unit.
5. **Given** a room exists, **When** the user adds a fridge named "Main Fridge" to the Kitchen, **Then** the fridge appears under the Kitchen room.
6. **Given** a fridge exists, **When** the user adds a drawer named "Crisper Drawer" inside it, **Then** the drawer appears nested within the fridge.
7. **Given** multiple rooms with storage units, **When** the user views the apartment overview, **Then** all rooms and their storage units are displayed in an organised hierarchy.
8. **Given** a wardrobe exists in the Bedroom, **When** the user moves it to the Hallway, **Then** the wardrobe (and all its shelves, drawers, and items) appears under the Hallway room.
9. **Given** a room named "Guest Room", **When** the user renames it to "Office", **Then** the updated name is reflected in the apartment overview and all navigation.
10. **Given** a new wardrobe is purchased, **When** the user adds it to an existing room, **Then** it appears in the layout alongside existing storage units.

---

### User Story 2 - Add and Browse Items in Storage (Priority: P1)

As a homeowner, I want to add items to my storage locations and browse them in a visual tile-based view so I can see at a glance what is stored where.

I navigate to a specific wardrobe, drawer, or fridge and see all items displayed as visual tiles. I can add a new item by giving it a name and optionally photographing it. Items in wardrobes and drawers are grouped by their location. Items in the fridge are grouped by expiration date. Each tile shows the item's photo (if available) and key details.

**Why this priority**: Core functionality - users need to be able to add and view items. Without this, the app has no practical use.

**Independent Test**: Can be tested by adding items (with and without photos) to a storage location and verifying they appear as tiles with correct grouping.

**Acceptance Scenarios**:

1. **Given** a wardrobe exists, **When** the user adds an item named "Winter Jacket" with a photo, **Then** the item appears as a tile in that wardrobe's view showing the photo and name.
2. **Given** a wardrobe with multiple drawers containing items, **When** the user views the wardrobe, **Then** items are grouped by their drawer/location within the wardrobe.
3. **Given** a fridge exists with items that have expiration dates, **When** the user views the fridge, **Then** items are grouped by expiration date (soonest first).
4. **Given** an item without a photo, **When** viewing the tile, **Then** a placeholder image is displayed with the item name.
5. **Given** a storage location with many items, **When** the user scrolls through, **Then** tiles load smoothly and maintain their visual layout.

---

### User Story 3 - Photograph Items for Visual Identification (Priority: P2)

As a homeowner, I want to capture or upload photos of my items so I can visually identify them without opening drawers or wardrobes physically.

I select an item (or create a new one) and use the browser's camera access to take a photo. The photo is saved and displayed as the item's tile image. I can retake or update the photo at any time.

**Why this priority**: Photos significantly improve usability and item recognition but items can still function with just names.

**Independent Test**: Can be tested by taking a photo of an item, verifying it displays on the tile, and updating it with a new photo.

**Acceptance Scenarios**:

1. **Given** the user is adding a new item, **When** they choose to take a photo, **Then** the browser requests camera access and allows them to capture an image.
2. **Given** an item already has a photo, **When** the user chooses to update the photo, **Then** they can take a new photo that replaces the old one.
3. **Given** the user takes a photo, **When** the photo is saved, **Then** it appears as the item's tile thumbnail within 2 seconds.
4. **Given** an item with a photo, **When** the user taps on the tile, **Then** they can view the full-size photo.

---

### User Story 4 - Generate and Scan QR Codes for Items (Priority: P2)

As a homeowner, I want to generate a QR code for each item so I can print it and attach it to the physical item. When I scan the code later, I can instantly see where the item belongs and navigate to its storage location.

I open an item's detail view and generate a QR code. I print or save the code and attach it to the physical item. Later, when I find the item out of place, I scan the QR code with my device and the app shows me the item's assigned storage location so I can put it back.

**Why this priority**: QR codes add significant convenience for locating and returning items but are an enhancement over basic inventory management.

**Independent Test**: Can be tested by generating a QR code for an item, printing it, scanning it with the app, and verifying the correct storage location is displayed.

**Acceptance Scenarios**:

1. **Given** an item exists in a storage location, **When** the user requests a QR code, **Then** a unique QR code is generated for that item.
2. **Given** a QR code has been generated, **When** the user chooses to save or print it, **Then** the QR code is available as a downloadable or printable image.
3. **Given** the user scans a QR code with the app, **When** the code is recognised, **Then** the app displays the item's name, photo, and assigned storage location.
4. **Given** the user scans a QR code, **When** the item's location is shown, **Then** the user can navigate directly to that storage location's view.
5. **Given** the user scans a QR code for an archived item, **When** the scan completes, **Then** the app displays the item's historical information and indicates it has been archived.
6. **Given** the user scans an unrecognised QR code, **When** the scan completes, **Then** the app displays a clear message that the code is not associated with any item.

---

### User Story 5 - Drag and Drop to Reorganise Fridge Items (Priority: P2)

As a homeowner, I want to drag and drop fridge items on the main page to reorganise them by priority or preference, overriding the default expiration-date grouping when needed.

On the fridge view, I see items grouped by expiration date. I can drag an item tile and drop it into a different position to reorder items manually (on mobile, I long-press to initiate drag). The new order is saved and persisted.

**Why this priority**: Enhances fridge management but the default expiration-date grouping already provides good organisation.

**Independent Test**: Can be tested by dragging a fridge item from one position to another and verifying the new order persists after refreshing.

**Acceptance Scenarios**:

1. **Given** a fridge view with items grouped by expiration date, **When** the user drags an item to a new position, **Then** the item moves to the new position with a smooth animation.
2. **Given** the user has reordered items via drag and drop, **When** they leave and return to the fridge view, **Then** the custom order is preserved.
3. **Given** a fridge with items, **When** the user drags an item, **Then** a visual indicator shows where the item will be placed.
4. **Given** the user is dragging an item, **When** they release it in an invalid position, **Then** the item returns to its original position.

---

### User Story 6 - Manage Item Expiration Dates in Fridge (Priority: P2)

As a homeowner, I want to set and track expiration dates for fridge items so I can avoid food waste by seeing which items expire soonest.

When adding or editing a fridge item, I set an expiration date. The fridge view automatically groups and sorts items by expiration date, with items expiring soonest displayed first. Items nearing or past their expiration date are visually highlighted.

**Why this priority**: Expiration tracking is a core differentiator for fridge management and directly reduces food waste.

**Independent Test**: Can be tested by adding items with different expiration dates and verifying correct grouping and visual warnings.

**Acceptance Scenarios**:

1. **Given** the user is adding an item to the fridge, **When** they set an expiration date, **Then** the date is saved and displayed on the item tile.
2. **Given** a fridge with items having different expiration dates, **When** the user views the fridge, **Then** items are grouped by expiration date with soonest-expiring items displayed first.
3. **Given** an item's expiration date is within 3 days, **When** viewing the fridge, **Then** the item tile is visually highlighted as expiring soon.
4. **Given** an item's expiration date has passed, **When** viewing the fridge, **Then** the item tile is visually highlighted as expired.
5. **Given** a fridge item without an expiration date, **When** viewing the fridge, **Then** the item appears in a separate "No expiration date" group.

---

### User Story 7 - Register, Log In, and Manage Apartments (Priority: P1)

As a user, I want to create an account, log in, and manage one or more apartments so I can organise my belongings across different locations and access them from any browser.

I register for an account, log in, and create my first apartment. I can later add more apartments (e.g., holiday house). I see an apartment selector to switch between them. I can invite household members to share an apartment by sending them an invitation.

**Why this priority**: Authentication and multi-apartment support are prerequisites for cloud sync and household sharing — core infrastructure.

**Independent Test**: Can be tested by registering, creating two apartments, switching between them, and inviting a household member who then sees the shared apartment.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they register with valid credentials, **Then** an account is created and they are logged in.
2. **Given** a registered user, **When** they log in, **Then** they see their apartment selector with all owned and shared apartments.
3. **Given** a logged-in user, **When** they create a new apartment named "Holiday House", **Then** it appears in the apartment selector alongside existing apartments.
4. **Given** an apartment owner, **When** they generate a shareable invite link, **Then** anyone with the link can join the apartment after registering or logging in.
5. **Given** an apartment owner, **When** they remove a household member, **Then** the member can no longer see or access that apartment.
6. **Given** a user with multiple apartments, **When** they switch apartments, **Then** the selected apartment's full hierarchy loads.

---

### User Story 8 - Search Across All Storage Locations (Priority: P2)

As a homeowner, I want to search for items, rooms, or storage units by name so I can quickly find anything without navigating through the hierarchy.

From any screen, I can access a global search bar. I type a name and the app shows matching results across all locations in the current apartment — items, rooms, storage units, shelves, and drawers. I can tap a result to navigate directly to it.

**Why this priority**: Improves efficiency for larger inventories but the hierarchical navigation already works for smaller setups.

**Independent Test**: Can be tested by adding items to multiple locations and searching for them by name, verifying results link to the correct locations.

**Acceptance Scenarios**:

1. **Given** items exist across multiple storage locations, **When** the user searches for "jacket", **Then** all items containing "jacket" in their name are listed with their full location path.
2. **Given** a room named "Kitchen" exists, **When** the user searches for "Kitchen", **Then** the room appears in results and can be navigated to.
3. **Given** no items match the search query, **When** the user searches, **Then** a "no results found" message is displayed.
4. **Given** search results are displayed, **When** the user selects a result, **Then** they navigate directly to that item or location.

---

### User Story 9 - Receive Expiration Notifications and Bulk Archive (Priority: P3)

As a homeowner, I want to receive notifications when fridge items expire and quickly clear expired items in bulk so I can reduce food waste without manual checking.

The app sends me a notification when a fridge item reaches its expiration date. In the fridge view, I can see all expired items highlighted and use a "clear all expired" action to archive them in one step.

**Why this priority**: Notifications and bulk actions are convenience features that build on the existing expiration highlighting.

**Independent Test**: Can be tested by adding items with past expiration dates, verifying notifications are sent, and using bulk archive to clear them all.

**Acceptance Scenarios**:

1. **Given** a fridge item's expiration date arrives, **When** the date is reached, **Then** the user receives a notification with the item name and location.
2. **Given** multiple expired items in a fridge, **When** the user selects "clear all expired", **Then** all expired items are archived in one action.
3. **Given** expired items have been archived, **When** the user scans their QR codes, **Then** the app shows historical info and indicates the item is archived.

---

### Edge Cases

- What happens when a user deletes a wardrobe that contains drawers with items? All nested drawers and their items should be flagged for confirmation before deletion.
- What happens when a user moves an item to a different storage location? The item's QR code should still point to the correct (updated) location.
- What happens when two items have the same name in the same location? Items are uniquely identified internally; duplicate names are allowed but visually distinguishable by photo or code.
- What happens when a user scans a QR code for an archived item? The app displays the item's historical information (name, photo, last known location) and indicates it has been archived.
- How does the system handle items with no expiration date in the fridge? They are placed in a "No expiration date" group at the end of the list.
- What happens when a drawer is moved from one wardrobe to another? All items within the drawer retain their association and move with it.
- What happens when a storage unit is moved to a different room? All contained items, shelves, and drawers move with it, and QR codes remain valid pointing to the updated location.
- What happens when a user deletes a room that still contains storage units? Storage units become unassigned and are moved to a virtual "Sieroty" (orphans) holding area, where the user can reassign them to another room.
- Can items be placed directly in a wardrobe or fridge without being on a shelf or in a drawer? Yes — items can live "loose" at the top level of a storage unit without requiring a sub-location.
- What happens when a fridge item expires? The item is visually highlighted as expired and the user receives a notification alerting them about the expiration.
- What happens when the user deletes the last room in the apartment? Deletion is allowed — the apartment can be empty, and all storage units move to Sieroty.
- What happens when the user deletes an item that has a printed QR code? Items are soft-deleted (archived) rather than permanently removed, so scanning the QR code later still shows historical information about the item and its last known location.
- Can the global search find rooms and storage units, or only items? The search covers everything — items, rooms, storage units, shelves, and drawers.
- What happens when many expired items pile up in the fridge? The system provides a bulk action (e.g., "clear all expired") to archive multiple expired items at once.
- What happens when two household members edit the same item simultaneously? The most recent save wins, with no conflict resolution in the initial version.
- What happens when the apartment owner removes a household member's access? The member can no longer see or edit that apartment, but their other apartments are unaffected.
- What happens when a user switches between apartments? The app shows an apartment selector and loads the selected apartment's full hierarchy.
- What happens when the apartment owner deletes an entire apartment? All rooms, storage units, shelves, drawers, items, members, and invite links are permanently deleted. The owner must confirm this destructive action.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to define rooms within their apartment (create, rename, delete).
- **FR-002**: System MUST allow users to create storage units (wardrobes, fridges) and assign them to rooms.
- **FR-002a**: System MUST allow users to rename storage units, shelves, and drawers at any time.
- **FR-002b**: System MUST allow users to move storage units between rooms, retaining all nested drawers and items.
- **FR-003**: System MUST allow users to create shelves and drawers and nest them within wardrobes and fridges.
- **FR-004**: System MUST allow users to add items to any storage location (wardrobe, shelf, drawer, or fridge).
- **FR-005**: System MUST display items within a storage location as visual tiles showing the item name and photo (or placeholder).
- **FR-006**: System MUST group items in wardrobes and drawers by their location within the storage unit.
- **FR-007**: System MUST group items in fridges by expiration date, with soonest-expiring items first.
- **FR-008**: System MUST allow users to photograph items using their browser's camera capabilities or upload an existing image from their device, and associate the photo with the item.
- **FR-009**: System MUST allow users to update or replace an item's photo.
- **FR-010**: System MUST generate a unique QR code for each item that encodes the item's identity.
- **FR-011**: System MUST allow users to scan QR codes to identify an item and display its storage location.
- **FR-012**: System MUST allow users to save or print generated QR codes.
- **FR-013**: System MUST support drag-and-drop reordering of items within the fridge view.
- **FR-014**: System MUST persist custom item ordering in the fridge after drag-and-drop changes.
- **FR-015**: System MUST visually highlight fridge items that are expiring soon (within 3 days) or already expired.
- **FR-016**: System MUST allow users to set, edit, and remove expiration dates for fridge items.
- **FR-017**: System MUST display the apartment overview showing all rooms and their contained storage units in a navigable hierarchy.
- **FR-018**: System MUST allow users to move items between storage locations while keeping QR code references valid.
- **FR-019**: System MUST prompt for confirmation before deleting a storage unit, shelf, or drawer that contains items or nested sub-containers.
- **FR-020**: System MUST allow users to move drawers and shelves between storage units, retaining all contained items.
- **FR-021**: When a room is deleted, the system MUST move all its storage units to a virtual "Sieroty" (orphans) holding area rather than deleting them.
- **FR-022**: System MUST allow users to reassign orphaned storage units from "Sieroty" to any existing room.
- **FR-023**: System MUST allow items to be placed directly in a storage unit without requiring a shelf or drawer.
- **FR-024**: System MUST send a browser push notification (via Web Push API / service worker) to the user when a fridge item reaches or passes its expiration date.
- **FR-025**: System MUST provide a global search that allows users to find items, rooms, storage units, shelves, and drawers by name across the entire apartment.
- **FR-026**: System MUST soft-delete (archive) items rather than permanently removing them, so QR codes remain scannable with historical information.
- **FR-026a**: System MUST allow users to permanently delete archived items on demand; permanently deleted items and their associated photos are irrecoverably removed and QR codes become invalid.
- **FR-027**: System MUST provide a bulk action to archive all expired fridge items at once.
- **FR-028**: System MUST allow the user to delete the last room in the apartment, moving its storage units to Sieroty.
- **FR-029**: System MUST allow users to create and manage multiple apartments, each with its own independent hierarchy of rooms, storage units, and items.
- **FR-030**: System MUST allow multiple household members to access and edit the same apartment.
- **FR-031**: System MUST sync all data to the cloud so users can access their inventory from any browser.
- **FR-032**: System MUST require user authentication to access the application.
- **FR-033**: System MUST allow apartment owners to generate a shareable invite link for an apartment; anyone with the link can join after registering or logging in.
- **FR-033a**: System MUST allow apartment owners to revoke an invite link, preventing further use.
- **FR-034**: System MUST allow users to edit item details (name, expiration date) after creation.
- **FR-035**: System MUST allow users to delete storage units, shelves, and drawers (with confirmation when they contain items or nested sub-containers, per FR-019).
- **FR-036**: System MUST support touch-based drag-and-drop (long-press to initiate drag) for mobile devices in the fridge reordering view.
- **FR-037**: System MUST support Polish and English languages from the initial release, with a user-selectable language preference.
- **FR-038**: System MUST default to DD/MM/YYYY date format, with a user setting to switch to US format (MM/DD/YYYY). Date format is independent of language selection.
- **FR-039**: System MUST allow users to export their apartment data (rooms, storage units, items) in a standard format (JSON) for backup purposes.

### Key Entities

- **User**: A registered person who can own or be invited to one or more apartments. The apartment creator is the owner and can invite/remove members. All household members have equal edit access to rooms, storage units, and items.
- **Apartment**: A top-level container representing a physical location (home, holiday house, etc.). Contains rooms. Can be shared with multiple household members.
- **Room**: A named area within the apartment (e.g., "Kitchen", "Bedroom"). Contains storage units.
- **Storage Unit**: A wardrobe, fridge, or standalone container placed within a room. Can contain nested shelves and drawers.
- **Shelf**: A sub-container within a wardrobe or fridge representing a physical shelf. Contains items.
- **Drawer**: A sub-container within a wardrobe or fridge. Contains items. Cannot exist outside a storage unit.
- **Item**: A physical object stored in a storage location. Has a name, optional photo, optional expiration date (for fridge items), and a unique code/QR reference.
- **QR Code**: A generated visual code linked to a specific item, used for quick identification and location lookup.
- **Sieroty (Orphans)**: A per-apartment virtual holding area for storage units that have been detached from a room (e.g., when a room is deleted). Each apartment has its own Sieroty. Users can reassign orphaned units to existing rooms within the same apartment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can set up their full apartment layout (rooms + storage units) in under 10 minutes.
- **SC-002**: Users can add an item (with name and photo) to a storage location in under 1 minute.
- **SC-003**: Scanning a QR code identifies the correct item and displays its storage location within 3 seconds.
- **SC-004**: Fridge items are automatically sorted by expiration date with visual highlighting for items expiring within 3 days or already expired.
- **SC-005**: Drag-and-drop reordering of fridge items works on mobile devices (touch-based) and the custom order persists across sessions.
- **SC-006**: All items display as recognisable tiles with photos (or placeholders) in a consistent grid layout.
- **SC-007**: All inventory data is accessible from any browser after logging in, with changes synced to the cloud.
- **SC-008**: Apartment hierarchy (rooms, storage units, items) loads completely when switching between apartments.
- **SC-009**: Global search returns relevant results across items, rooms, storage units, shelves, and drawers within 1 second for collections up to 10,000 items.
- **SC-010**: User registration and login flow completes without friction; new users can start organising within 2 minutes of first visit.
- **SC-011**: Expiration notifications are delivered via browser push on or before the item's expiration date.
- **SC-012**: Users can switch between apartments and see the correct, complete data for each apartment independently.

### Visual Design & Appearance

- **VD-001**: The application MUST follow a **minimalist visual style** — clean lines, generous white space, restrained use of colour, inspired by iOS/Apple design language.
- **VD-002**: The colour palette MUST be **neutral** — greys, whites, and blacks as the foundation, with a single accent colour (blue) for interactive elements (buttons, links, active states, selection indicators).
- **VD-003**: The application MUST support **automatic dark mode** — detect the user's system preference (`prefers-color-scheme`) and render the appropriate theme (light or dark) without manual intervention.
- **VD-004**: All cards, buttons, inputs, modals, and tile elements MUST use **rounded corners** (minimum `border-radius: 12px` for cards, `8px` for buttons and inputs).
- **VD-005**: The application MUST include **smooth transition animations** for: page/view navigation, modal open/close, loading states (skeleton shimmer), drag-and-drop movement, and element appearance/disappearance (fade in/out).
- **VD-006**: Typography MUST use a **system font stack** (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`) with clear hierarchy — large bold headings, medium subheadings, regular body text.
- **VD-007**: Item tiles MUST have a **consistent aspect ratio** with the photo filling the tile area and the item name below, maintaining uniform grid alignment.
- **VD-008**: Interactive elements MUST provide **clear visual feedback** — hover states (desktop), active/pressed states (mobile), focus rings for accessibility.
- **VD-009**: Empty states (no items, no rooms, no results) MUST display a **friendly illustration or icon** with a clear call-to-action guiding the user to add content.
- **VD-010**: The navigation MUST use a **bottom tab bar** on mobile (matching iOS conventions) with icon-only tabs and a label underneath.

## Assumptions

- The application is a **responsive, mobile-first web app** optimised for iPhone/mobile Safari. Users will primarily interact via mobile browsers.
- All household members have **equal edit access** to content (rooms, storage, items). The apartment creator is the **owner** and manages membership (invite/remove).
- Data is stored in the **cloud** and synced across devices. Users can access their inventory from any browser.
- A user can manage **multiple apartments** (e.g., home, holiday house, storage unit). Each apartment has its own independent room/storage hierarchy.
- QR codes are printed externally by the user (the app generates the image; the user handles printing).
- Standard item attributes (name, photo, expiration date) are sufficient; custom fields or tags are out of scope.
- The "3 days" threshold for expiration warnings is a sensible default and does not need to be configurable in the initial version.
- User accounts and authentication are required for cloud sync and household sharing, but the specific authentication method is not prescribed.

## Clarifications

### Session 2026-02-07

- Q: How should expiration notifications be delivered? → A: Browser push notifications via Web Push API / service worker.
- Q: Can archived items be permanently deleted? → A: Yes, users can permanently delete archived items on demand; QR codes become invalid.
- Q: What language(s) should the app support? → A: Bilingual from the start — Polish and English, with user-selectable language preference.
- Q: How should household members be invited? → A: Shareable invite link that the owner can share via any channel.
