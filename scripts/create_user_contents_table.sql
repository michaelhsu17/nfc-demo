-- Create user_contents table for storing multiple images/videos per user
CREATE TABLE IF NOT EXISTS user_contents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_url VARCHAR(500) NOT NULL,
  content_type VARCHAR(10) NOT NULL CHECK (content_type IN ('image', 'video')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster user-based queries
CREATE INDEX IF NOT EXISTS idx_user_contents_user_id ON user_contents(user_id);
