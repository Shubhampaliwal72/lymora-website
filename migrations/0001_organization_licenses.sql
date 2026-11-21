PRAGMA foreign_keys = ON;
CREATE TABLE licenses (
  id TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL UNIQUE,
  organization_id TEXT NOT NULL UNIQUE,
  organization_name TEXT NOT NULL,
  expires_at INTEGER,
  max_devices INTEGER NOT NULL CHECK(max_devices BETWEEN 1 AND 500),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  created_at INTEGER NOT NULL
);
CREATE TABLE license_devices (
  license_id TEXT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  activated_at INTEGER NOT NULL,
  PRIMARY KEY(license_id, device_id)
);
CREATE TABLE license_requests (
  id TEXT PRIMARY KEY,
  organization_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending','issued','closed')),
  issued_license_id TEXT REFERENCES licenses(id)
);
CREATE TABLE license_rate_limits (
  bucket_hash TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  attempts INTEGER NOT NULL,
  PRIMARY KEY(bucket_hash, window_start)
);
CREATE INDEX license_requests_pending ON license_requests(status, created_at);