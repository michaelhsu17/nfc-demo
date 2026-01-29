-- Add emotion column to nfc_cards table
ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS emotion VARCHAR(20);
