-- Vik IDE D1 Database Schema
-- SQLite-compatible (Cloudflare D1)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  profile_picture TEXT,
  role TEXT DEFAULT 'student' CHECK(role IN ('student','teacher','admin')),
  streak INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  last_login TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS login_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  remember_me INTEGER DEFAULT 0,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON login_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON login_sessions(token);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK(difficulty IN ('easy','medium','hard')),
  content TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 50,
  author_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons("order");

CREATE TABLE IF NOT EXISTS lesson_completions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_completions_user ON lesson_completions(user_id);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  xp_reward INTEGER DEFAULT 100,
  criteria TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, achievement_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_achievements ON user_achievements(user_id);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  language TEXT DEFAULT 'javascript',
  code TEXT,
  user_id TEXT NOT NULL,
  is_public INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_public ON projects(is_public);

CREATE TABLE IF NOT EXISTS daily_challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT DEFAULT 'easy' CHECK(difficulty IN ('easy','medium','hard')),
  language TEXT DEFAULT 'vik',
  starter_code TEXT,
  solution TEXT,
  xp_reward INTEGER DEFAULT 100,
  date TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_daily_challenges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  completed INTEGER DEFAULT 1,
  code TEXT,
  xp_earned INTEGER DEFAULT 0,
  completed_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, challenge_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES daily_challenges(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  due_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id TEXT PRIMARY KEY,
  ip TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  path TEXT
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits(ip);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ts ON rate_limits(timestamp);

-- WebSocket presence table for real-time features
CREATE TABLE IF NOT EXISTS ws_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  connected_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
