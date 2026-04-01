CREATE TABLE IF NOT EXISTS rate_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  requested_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_rate_limits_ip_time ON rate_limits(ip, requested_at);
