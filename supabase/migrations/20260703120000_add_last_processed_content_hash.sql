-- Add content hash column to journals table.
-- Used by the journal memory extraction pipeline to implement idempotency:
-- extraction is skipped if the stored hash matches the current content hash.
-- NULL means the entry has never been processed.
ALTER TABLE journals
  ADD COLUMN IF NOT EXISTS last_processed_content_hash TEXT DEFAULT NULL;
