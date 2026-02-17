const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

// GET /api/settings
router.get('/', (req, res) => {
  const db = getDb();
  const settings = db.prepare('SELECT * FROM settings').all();
  const obj = {};
  settings.forEach(s => { obj[s.key] = s.value; });
  res.json(obj);
});

// PUT /api/settings
router.put('/', (req, res) => {
  const db = getDb();
  const updates = req.body;

  const stmt = db.prepare(
    "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now','localtime')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now','localtime')"
  );

  const transaction = db.transaction((items) => {
    for (const [key, value] of Object.entries(items)) {
      stmt.run(key, value, value);
    }
  });

  transaction(updates);
  res.json({ message: 'Settings updated' });
});

module.exports = router;
