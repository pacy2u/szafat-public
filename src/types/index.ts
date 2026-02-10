import type {
  Apartment,
  Room,
  StorageUnit,
  Shelf,
  Drawer,
  Item,
  User,
  ApartmentMember,
  InviteLink,
  PushSubscription,
  StorageUnitType,
  Locale,
  DateFormat,
} from '@prisma/client';

export type {
  Apartment,
  Room,
  StorageUnit,
  Shelf,
  Drawer,
  Item,
  User,
  ApartmentMember,
  InviteLink,
  PushSubscription,
  StorageUnitType,
  Locale,
  DateFormat,
};

// API request/response types

export interface CreateApartmentRequest {
  name: string;
}

export interface CreateRoomRequest {
  name: string;
}

export interface CreateStorageUnitRequest {
  name: string;
  type: StorageUnitType;
  roomId: string;
}

export interface CreateShelfRequest {
  name: string;
}

export interface CreateDrawerRequest {
  name: string;
}

export interface CreateItemRequest {
  name: string;
  storageUnitId: string;
  shelfId?: string | null;
  drawerId?: string | null;
  expirationDate?: string | null;
}

export interface UpdateItemRequest {
  name?: string;
  expirationDate?: string | null;
  storageUnitId?: string;
  shelfId?: string | null;
  drawerId?: string | null;
  sortOrder?: number;
}

export interface ReorderItemsRequest {
  items: Array<{ id: string; sortOrder: number }>;
}

export interface BulkArchiveRequest {
  storageUnitId: string;
}

export interface BulkArchiveResponse {
  archivedCount: number;
}

export interface SearchResult {
  type: 'item' | 'room' | 'storage_unit' | 'shelf' | 'drawer';
  id: string;
  name: string;
  locationPath: string;
  thumbnailUrl: string | null;
}

export interface PhotoUploadUrls {
  uploadUrl: string;
  photoUrl: string;
  thumbnailUploadUrl: string;
  thumbnailUrl: string;
}

export interface ApartmentWithHierarchy extends Apartment {
  rooms: RoomWithUnits[];
  orphanedUnits: StorageUnitWithChildren[];
}

export interface RoomWithUnits extends Room {
  storageUnits: StorageUnitWithChildren[];
}

export interface StorageUnitWithChildren extends StorageUnit {
  shelves: Shelf[];
  drawers: Drawer[];
  items?: Item[];
}

export interface MemberInfo {
  id: string;
  userId: string;
  name: string;
  email: string;
  joinedAt: Date;
}

export interface UserSettings {
  locale: Locale;
  dateFormat: DateFormat;
}
