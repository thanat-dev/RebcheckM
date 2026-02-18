const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads', 'checks');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `check_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    cb(null, extOk || mimeOk);
  }
});

// GET /api/checks - ดึงรายการเช็คทั้งหมด
router.get('/', (req, res) => {
  const db = getDb();
  const { status, customer_id, date_from, date_to, search } = req.query;

  let sql = `
    SELECT ch.*,
      c.name as customer_name,
      ts.trip_id,
      t.trip_date
    FROM checks ch
    LEFT JOIN customers c ON ch.customer_id = c.id
    LEFT JOIN trip_stops ts ON ch.trip_stop_id = ts.id
    LEFT JOIN trips t ON ts.trip_id = t.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    sql += ' AND ch.status = ?';
    params.push(status);
  }

  if (customer_id) {
    sql += ' AND ch.customer_id = ?';
    params.push(customer_id);
  }

  if (date_from) {
    sql += ' AND ch.check_date >= ?';
    params.push(date_from);
  }

  if (date_to) {
    sql += ' AND ch.check_date <= ?';
    params.push(date_to);
  }

  if (search) {
    sql += ' AND (ch.check_number LIKE ? OR ch.bank_name LIKE ? OR c.name LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  sql += ' ORDER BY ch.created_at DESC';

  const checks = db.prepare(sql).all(...params);
  res.json(checks);
});

// GET /api/checks/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const check = db.prepare(`
    SELECT ch.*, c.name as customer_name, c.address as customer_address
    FROM checks ch
    LEFT JOIN customers c ON ch.customer_id = c.id
    WHERE ch.id = ?
  `).get(req.params.id);
  if (!check) return res.status(404).json({ error: 'Check not found' });
  res.json(check);
});

// POST /api/checks - สร้างเช็คใหม่
router.post('/', upload.single('image'), (req, res) => {
  const db = getDb();
  const {
    trip_stop_id, customer_id, check_number, bank_name, branch,
    amount, check_date, due_date, payee, note, received_date
  } = req.body;

  if (!check_number || !bank_name || !amount || !check_date) {
    return res.status(400).json({ error: 'check_number, bank_name, amount, check_date are required' });
  }

  const image_path = req.file ? `/uploads/checks/${req.file.filename}` : null;

  const result = db.prepare(`
    INSERT INTO checks (trip_stop_id, customer_id, check_number, bank_name, branch, amount, check_date, received_date, due_date, payee, image_path, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    trip_stop_id || null,
    customer_id || null,
    check_number,
    bank_name,
    branch || null,
    parseFloat(amount),
    check_date,
    received_date || new Date().toISOString().split('T')[0],
    due_date || null,
    payee || null,
    image_path,
    note || null
  );

  const check = db.prepare(`
    SELECT ch.*, c.name as customer_name
    FROM checks ch
    LEFT JOIN customers c ON ch.customer_id = c.id
    WHERE ch.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(check);
});

// PUT /api/checks/:id - แก้ไขเช็ค
router.put('/:id', upload.single('image'), (req, res) => {
  const db = getDb();
  const {
    check_number, bank_name, branch, amount, check_date,
    due_date, payee, status, note, customer_id
  } = req.body;

  const existing = db.prepare('SELECT * FROM checks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Check not found' });

  const image_path = req.file ? `/uploads/checks/${req.file.filename}` : existing.image_path;

  db.prepare(`
    UPDATE checks SET
      check_number = COALESCE(?, check_number),
      bank_name = COALESCE(?, bank_name),
      branch = COALESCE(?, branch),
      amount = COALESCE(?, amount),
      check_date = COALESCE(?, check_date),
      due_date = COALESCE(?, due_date),
      payee = COALESCE(?, payee),
      status = COALESCE(?, status),
      note = COALESCE(?, note),
      customer_id = COALESCE(?, customer_id),
      image_path = ?,
      updated_at = datetime('now','localtime')
    WHERE id = ?
  `).run(
    check_number || null, bank_name || null, branch, amount ? parseFloat(amount) : null,
    check_date || null, due_date, payee, status || null, note, customer_id || null,
    image_path, req.params.id
  );

  const check = db.prepare(`
    SELECT ch.*, c.name as customer_name
    FROM checks ch
    LEFT JOIN customers c ON ch.customer_id = c.id
    WHERE ch.id = ?
  `).get(req.params.id);

  res.json(check);
});

// DELETE /api/checks/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  const check = db.prepare('SELECT * FROM checks WHERE id = ?').get(req.params.id);
  if (check && check.image_path) {
    const fullPath = path.join(__dirname, '..', check.image_path);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }
  db.prepare('DELETE FROM checks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Check deleted' });
});

// GET /api/checks/summary/daily - สรุปยอดเช็ครายวัน
router.get('/summary/daily', (req, res) => {
  const db = getDb();
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const summary = db.prepare(`
    SELECT
      COUNT(*) as total_checks,
      COALESCE(SUM(amount), 0) as total_amount,
      COUNT(CASE WHEN status = 'received' THEN 1 END) as received_count,
      COUNT(CASE WHEN status = 'deposited' THEN 1 END) as deposited_count,
      COUNT(CASE WHEN status = 'cleared' THEN 1 END) as cleared_count,
      COUNT(CASE WHEN status = 'bounced' THEN 1 END) as bounced_count
    FROM checks
    WHERE received_date = ?
  `).get(targetDate);

  res.json({ date: targetDate, ...summary });
});

module.exports = router;
