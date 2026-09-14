import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'ein_database.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'field_officer', 'public'))
    );

    CREATE TABLE IF NOT EXISTS nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pole_name TEXT UNIQUE NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      sensor_type TEXT NOT NULL,
      deployed_date TEXT NOT NULL,
      battery_percent INTEGER NOT NULL,
      signal_strength INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('online', 'offline'))
    );

    CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id INTEGER NOT NULL,
      water_level REAL NOT NULL,
      alert_level TEXT NOT NULL CHECK(alert_level IN ('Safe', 'Watch', 'Warning', 'Critical')),
      cause TEXT NOT NULL,
      confidence_score REAL NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id INTEGER NOT NULL,
      alert_level TEXT NOT NULL CHECK(alert_level IN ('Safe', 'Watch', 'Warning', 'Critical')),
      cause TEXT NOT NULL,
      raised_at TEXT NOT NULL,
      resolved_at TEXT,
      acknowledged_by TEXT,
      status TEXT NOT NULL CHECK(status IN ('active', 'acknowledged', 'resolved')),
      FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS community_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_name TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      description TEXT NOT NULL,
      photo_url TEXT,
      submitted_at TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  console.log('Database tables verified and initialized.');
}
