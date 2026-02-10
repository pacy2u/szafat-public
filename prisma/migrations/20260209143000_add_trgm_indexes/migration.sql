-- Enable pg_trgm for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN indexes for fast case-insensitive substring search
CREATE INDEX idx_item_name_trgm ON "Item" USING gin (name gin_trgm_ops);
CREATE INDEX idx_room_name_trgm ON "Room" USING gin (name gin_trgm_ops);
CREATE INDEX idx_storage_unit_name_trgm ON "StorageUnit" USING gin (name gin_trgm_ops);
CREATE INDEX idx_shelf_name_trgm ON "Shelf" USING gin (name gin_trgm_ops);
CREATE INDEX idx_drawer_name_trgm ON "Drawer" USING gin (name gin_trgm_ops);
