-- Add user_id column to nfc_cards table for ownership
ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

-- Create index for faster user-based queries
CREATE INDEX IF NOT EXISTS idx_nfc_cards_user_id ON nfc_cards(user_id);
