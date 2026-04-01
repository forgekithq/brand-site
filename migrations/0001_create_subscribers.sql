CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TEXT NOT NULL DEFAULT (datetime('now')),
  source TEXT NOT NULL DEFAULT 'landing-page'
);

CREATE INDEX idx_subscribers_email ON subscribers(email);
