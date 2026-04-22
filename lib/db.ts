import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DATABASE_URL ?? path.join(process.cwd(), "data", "axiomgarden.db");

// Ensure data directory exists in dev
if (!DB_PATH.startsWith("/app/data")) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    username    TEXT UNIQUE NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at  INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS plants (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    template_index  INTEGER NOT NULL,
    angle_variation REAL NOT NULL,
    color           TEXT NOT NULL,
    planted_at      INTEGER NOT NULL DEFAULT (unixepoch()),
    position        INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS checkins (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date        TEXT NOT NULL,
    plant_id    TEXT REFERENCES plants(id),
    created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(user_id, date)
  );
`);

export default db;
