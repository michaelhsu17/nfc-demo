-- Add viewer_open_id and viewer_user_id columns to nfc_cards table
ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS viewer_open_id VARCHAR(255);
ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS viewer_user_id VARCHAR(255);
