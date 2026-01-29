-- Add emotion column to user_contents table
ALTER TABLE user_contents ADD COLUMN IF NOT EXISTS emotion VARCHAR(20);

-- Add unique constraint on (user_id, emotion)
ALTER TABLE user_contents ADD CONSTRAINT unique_user_emotion UNIQUE (user_id, emotion);
