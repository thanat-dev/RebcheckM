const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

// GET /api/customers - ดึงรายชื่อลูกค้าทั้งหมด
router.get('/', (req, res) => {
  const db = getDb();
  const { search, active } = req.query;

  let sql = 'SELECT * FROM customers WHERE 1=1';
  const params = [];

  if (active !== undefined) {
    sql += ' AND is_active = ?';
    params.push(active === 'true' ? 1 : 0);
  }

  if (search) {
    sql += ' AND (name LIKE ? OR address LIKE ? OR contact_person LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  sql += ' ORDER BY name ASC';

  const customers = db.prepare(sql).all(...params);
  res.json(customers);
});

// GET /api/customers/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

// POST /api/customers - สร้างลูกค้าใหม่
router.post('/', (req, res) => {
  const db = getDb();
  const { name, address, phone, contact_person, note } = req.body;

  if (!name) return res.status(400).json({ error: 'Name is required' });

  const result = db.prepare(
    'INSERT INTO customers (name, address, phone, contact_person, note) VALUES (?, ?, ?, ?, ?)'
  ).run(name, address || null, phone || null, contact_person || null, note || null);

  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(customer);
});

// PUT /api/customers/:id - แก้ไขข้อมูลลูกค้า
router.put('/:id', (req, res) => {
  const db = getDb();
  const { name, address, phone, contact_person, note, is_active } = req.body;

  const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Customer not found' });

  db.prepare(`
    UPDATE customers SET
      name = COALESCE(?, name),
      address = COALESCE(?, address),
      phone = COALESCE(?, phone),
      contact_person = COALESCE(?, contact_person),
      note = COALESCE(?, note),
      is_active = COALESCE(?, is_active),
      updated_at = datetime('now','localtime')
    WHERE id = ?
  `).run(
    name || null, address, phone, contact_person, note,
    is_active !== undefined ? (is_active ? 1 : 0) : null,
    req.params.id
  );

  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  res.json(customer);
});

// DELETE /api/customers/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE customers SET is_active = 0, updated_at = datetime(\'now\',\'localtime\') WHERE id = ?').run(req.params.id);
  res.json({ message: 'Customer deactivated' });
});

module.exports = router;
