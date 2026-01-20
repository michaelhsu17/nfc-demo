-- Rename video_url column to audio_url in nfc_cards table
ALTER TABLE nfc_cards RENAME COLUMN video_url TO audio_url;
