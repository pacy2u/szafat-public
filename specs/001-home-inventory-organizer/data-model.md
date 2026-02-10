# Data Model: Home Inventory Organizer

**Date**: 2026-02-07 | **Plan**: [plan.md](plan.md) | **Spec**: [spec.md](spec.md)

## Entity Relationship Diagram (textual)

```
User 1──M ApartmentMember M──1 Apartment
                                  │
                            1─────M Room
                                  │
                            1─────M StorageUnit ──── (orphaned → apartment.sieroty)
                                  │
                         ┌────────┼────────┐
                         │        │        │
                    1────M   1────M   1────M
                    Shelf   Drawer    Item (loose)
                      │        │
                 1────M   1────M
                 Item     Item
```

## Entities

### User

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| email | String | Unique, not null | Registration credential |
| passwordHash | String | Not null | bcrypt/argon2 hash |
| name | String | Not null | Display name |
| locale | Enum(PL, EN) | Not null, default EN | FR-037 |
| dateFormat | Enum(DD_MM_YYYY, MM_DD_YYYY) | Not null, default DD_MM_YYYY | FR-038 |
| createdAt | DateTime | Not null | |
| updatedAt | DateTime | Not null | |

### Apartment

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| name | String | Not null | e.g., "Home", "Holiday House" |
| ownerId | UUID | FK → User, not null | Creator/owner (FR-033) |
| createdAt | DateTime | Not null | |
| updatedAt | DateTime | Not null | |

### ApartmentMember

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| apartmentId | UUID | FK → Apartment, not null | |
| userId | UUID | FK → User, not null | |
| joinedAt | DateTime | Not null | |
| | | Unique(apartmentId, userId) | No duplicate memberships |

*Owner is always implicitly a member. ApartmentMember row created on apartment creation for the owner.*

### InviteLink

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| apartmentId | UUID | FK → Apartment, not null | |
| token | String | Unique, not null | Random URL-safe token |
| createdById | UUID | FK → User, not null | Must be apartment owner |
| active | Boolean | Not null, default true | FR-033a: revocable |
| createdAt | DateTime | Not null | |

### Room

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| apartmentId | UUID | FK → Apartment, not null | |
| name | String | Not null | FR-001 |
| sortOrder | Int | Not null, default 0 | Display ordering |
| createdAt | DateTime | Not null | |
| updatedAt | DateTime | Not null | |

### StorageUnit

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| apartmentId | UUID | FK → Apartment, not null | Denormalised for Sieroty queries |
| roomId | UUID | FK → Room, nullable | Null = orphaned (Sieroty) per FR-021 |
| name | String | Not null | FR-002 |
| type | Enum(WARDROBE, FRIDGE) | Not null | Determines behaviour (expiration grouping for FRIDGE) |
| sortOrder | Int | Not null, default 0 | Display ordering |
| createdAt | DateTime | Not null | |
| updatedAt | DateTime | Not null | |

*When `roomId` is null, the unit is in the apartment's Sieroty holding area. No separate Sieroty table needed — it's a query filter (`WHERE roomId IS NULL AND apartmentId = ?`).*

### Shelf

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| storageUnitId | UUID | FK → StorageUnit, not null | FR-003 |
| name | String | Not null | |
| sortOrder | Int | Not null, default 0 | Display ordering |
| createdAt | DateTime | Not null | |
| updatedAt | DateTime | Not null | |

### Drawer

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| storageUnitId | UUID | FK → StorageUnit, not null | FR-003 |
| name | String | Not null | |
| sortOrder | Int | Not null, default 0 | Display ordering |
| createdAt | DateTime | Not null | |
| updatedAt | DateTime | Not null | |

### Item

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| name | String | Not null | FR-004 |
| photoUrl | String | Nullable | S3 path to full-size photo |
| thumbnailUrl | String | Nullable | S3 path to thumbnail |
| expirationDate | Date | Nullable | FR-016, only meaningful for fridge items |
| storageUnitId | UUID | FK → StorageUnit, not null | Parent unit (always set) |
| shelfId | UUID | FK → Shelf, nullable | Null = loose in unit (FR-023) |
| drawerId | UUID | FK → Drawer, nullable | Null = loose in unit (FR-023) |
| sortOrder | Int | Not null, default 0 | For fridge drag-and-drop (FR-014) |
| archived | Boolean | Not null, default false | FR-026: soft delete |
| archivedAt | DateTime | Nullable | When archived |
| createdAt | DateTime | Not null | |
| updatedAt | DateTime | Not null | |
| | | Check: NOT (shelfId AND drawerId) | Item on a shelf OR in a drawer, not both |

*An item belongs to exactly one location: loose in a storage unit, on a shelf, or in a drawer. The `shelfId`/`drawerId` fields are mutually exclusive (enforced by check constraint).*

### PushSubscription

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| userId | UUID | FK → User, not null | |
| endpoint | String | Not null | Web Push endpoint URL |
| p256dh | String | Not null | Public key |
| auth | String | Not null | Auth secret |
| createdAt | DateTime | Not null | |
| | | Unique(userId, endpoint) | One subscription per device |

## State Transitions

### Item Lifecycle

```
Active ──(archive)──→ Archived ──(permanent delete)──→ Deleted (hard delete)
  ↑                      │
  └──(restore, future)───┘
```

- **Active → Archived**: Soft delete (FR-026). QR code still scannable, shows historical info.
- **Archived → Deleted**: Permanent delete (FR-026a). Photo removed from S3. QR code becomes invalid.
- Restore (archived → active) is not in spec but the data model supports it trivially.

### StorageUnit Room Assignment

```
Assigned (roomId set) ──(room deleted)──→ Orphaned (roomId = null, Sieroty)
         ↑                                      │
         └──────(reassign to room)──────────────┘
```

## Indexes

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| Item | name | GIN (trigram) | Global search < 1s (SC-009, constitution) |
| Room | name | GIN (trigram) | Global search |
| StorageUnit | name | GIN (trigram) | Global search |
| Shelf | name | GIN (trigram) | Global search |
| Drawer | name | GIN (trigram) | Global search |
| Item | (storageUnitId, archived) | B-tree | Item listing per storage unit |
| Item | (expirationDate) WHERE NOT archived | B-tree partial | Expiration notification query |
| StorageUnit | (apartmentId, roomId) | B-tree | Hierarchy loading + Sieroty filter |
| ApartmentMember | (userId) | B-tree | User's apartments lookup |
| InviteLink | (token) WHERE active | B-tree partial | Invite link lookup |

## Validation Rules

- **Email**: Valid email format, case-insensitive uniqueness.
- **Names** (room, storage unit, shelf, drawer, item): Non-empty, max 100 characters. Duplicate names allowed within same parent (FR: items visually distinguishable by photo/code).
- **Expiration date**: Must be a valid date. No past-date restriction on input (user may be cataloguing existing items).
- **Photo**: Max 5MB upload. Accepted formats: JPEG, PNG, WebP. Client-side resize to max 1200px before upload.
- **Invite token**: 32-byte random, URL-safe base64 encoded.
- **Item location**: Exactly one of: (shelfId, drawerId, neither). Cannot set both shelfId and drawerId.
- **Apartment ownership**: Only the owner (ownerId) can generate/revoke invite links and remove members.

## Cascading Behaviour

| Action | Cascade |
|--------|---------|
| Delete Apartment | Delete all rooms, storage units, shelves, drawers, items, members, invite links |
| Delete Room | Set `roomId = null` on all storage units (orphan to Sieroty) — FR-021 |
| Delete StorageUnit (confirmed) | Delete all shelves, drawers, and archive all items — FR-019 |
| Delete Shelf/Drawer (confirmed) | Archive all contained items — FR-019 |
| Remove ApartmentMember | Delete membership row only. User's account and other apartments unaffected. |
| Permanent delete Item | Hard delete row + remove photos from S3 — FR-026a |
