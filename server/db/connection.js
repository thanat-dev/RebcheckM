const Database = require('better-sqlite3');
const { DB_PATH, initDatabase } = require('./init');
const fs = require('fs');
const path = require('path');

let db;

function getDb() {
  if (!db) {
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      initDatabase();
    }
    if (!fs.existsSync(DB_PATH)) {
      initDatabase();
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

module.exports = { getDb };
