const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'rebcheckm.db');

function initDatabase() {
  const fs = require('fs');
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(DB_PATH);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    -- ตารางสถานที่/ลูกค้า
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      contact_person TEXT,
      note TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    -- ตาราง Trip (การเดินทางรายวัน)
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_date TEXT NOT NULL,
      title TEXT,
      note TEXT,
      status TEXT DEFAULT 'in_progress' CHECK(status IN ('in_progress','completed','cancelled')),
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    -- ตาราง Trip Stops (สถานที่ที่แวะในแต่ละ Trip)
    CREATE TABLE IF NOT EXISTS trip_stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      visit_order INTEGER DEFAULT 0,
      arrived_at TEXT,
      departed_at TEXT,
      note TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','arrived','completed','skipped')),
      created_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    -- ตารางเช็ค
    CREATE TABLE IF NOT EXISTS checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_stop_id INTEGER,
      customer_id INTEGER,
      check_number TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      branch TEXT,
      amount REAL NOT NULL,
      check_date TEXT NOT NULL,
      received_date TEXT DEFAULT (date('now','localtime')),
      due_date TEXT,
      payee TEXT,
      status TEXT DEFAULT 'received' CHECK(status IN ('received','deposited','cleared','bounced','cancelled')),
      image_path TEXT,
      note TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (trip_stop_id) REFERENCES trip_stops(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    -- ตาราง LINE Notification Log
    CREATE TABLE IF NOT EXISTS line_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      image_path TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','sent','failed')),
      response TEXT,
      sent_at TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    -- ตารางตั้งค่า
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    -- ใส่ค่า default settings
    INSERT OR IGNORE INTO settings (key, value) VALUES ('line_notify_token', '');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('app_name', 'RebcheckM');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('currency', 'THB');
  `);

  console.log('Database initialized successfully at:', DB_PATH);
  db.close();
}

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase, DB_PATH };
