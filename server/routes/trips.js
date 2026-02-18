const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

// GET /api/trips - ดึงรายการ Trip ทั้งหมด
router.get('/', (req, res) => {
  const db = getDb();
  const { date, status } = req.query;

  let sql = `
    SELECT t.*,
      (SELECT COUNT(*) FROM trip_stops WHERE trip_id = t.id) as stop_count,
      (SELECT COUNT(*) FROM trip_stops WHERE trip_id = t.id AND status = 'completed') as completed_stops,
      (SELECT COALESCE(SUM(c.amount), 0) FROM checks c
       JOIN trip_stops ts ON c.trip_stop_id = ts.id
       WHERE ts.trip_id = t.id) as total_amount,
      (SELECT COUNT(*) FROM checks c
       JOIN trip_stops ts ON c.trip_stop_id = ts.id
       WHERE ts.trip_id = t.id) as check_count
    FROM trips t WHERE 1=1
  `;
  const params = [];

  if (date) {
    sql += ' AND t.trip_date = ?';
    params.push(date);
  }

  if (status) {
    sql += ' AND t.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY t.trip_date DESC, t.created_at DESC';

  const trips = db.prepare(sql).all(...params);
  res.json(trips);
});

// GET /api/trips/:id - ดึงรายละเอียด Trip พร้อม Stops
router.get('/:id', (req, res) => {
  const db = getDb();
  const trip = db.prepare(`
    SELECT t.*,
      (SELECT COALESCE(SUM(c.amount), 0) FROM checks c
       JOIN trip_stops ts ON c.trip_stop_id = ts.id
       WHERE ts.trip_id = t.id) as total_amount
    FROM trips t WHERE t.id = ?
  `).get(req.params.id);

  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const stops = db.prepare(`
    SELECT ts.*, c.name as customer_name, c.address as customer_address, c.phone as customer_phone,
      (SELECT COUNT(*) FROM checks WHERE trip_stop_id = ts.id) as check_count,
      (SELECT COALESCE(SUM(amount), 0) FROM checks WHERE trip_stop_id = ts.id) as checks_amount
    FROM trip_stops ts
    JOIN customers c ON ts.customer_id = c.id
    WHERE ts.trip_id = ?
    ORDER BY ts.visit_order ASC
  `).all(req.params.id);

  trip.stops = stops;
  res.json(trip);
});

// POST /api/trips - สร้าง Trip ใหม่
router.post('/', (req, res) => {
  const db = getDb();
  const { trip_date, title, note } = req.body;

  if (!trip_date) return res.status(400).json({ error: 'Trip date is required' });

  const result = db.prepare(
    'INSERT INTO trips (trip_date, title, note) VALUES (?, ?, ?)'
  ).run(trip_date, title || `เดินทางรับเช็ค ${trip_date}`, note || null);

  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(trip);
});

// PUT /api/trips/:id
router.put('/:id', (req, res) => {
  const db = getDb();
  const { title, note, status } = req.body;

  db.prepare(`
    UPDATE trips SET
      title = COALESCE(?, title),
      note = COALESCE(?, note),
      status = COALESCE(?, status),
      updated_at = datetime('now','localtime')
    WHERE id = ?
  `).run(title || null, note, status || null, req.params.id);

  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
  res.json(trip);
});

// DELETE /api/trips/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM trips WHERE id = ?').run(req.params.id);
  res.json({ message: 'Trip deleted' });
});

// POST /api/trips/:id/stops - เพิ่มสถานที่แวะ
router.post('/:id/stops', (req, res) => {
  const db = getDb();
  const { customer_id, visit_order, note } = req.body;

  if (!customer_id) return res.status(400).json({ error: 'Customer ID is required' });

  const maxOrder = db.prepare(
    'SELECT COALESCE(MAX(visit_order), 0) + 1 as next_order FROM trip_stops WHERE trip_id = ?'
  ).get(req.params.id);

  const result = db.prepare(
    'INSERT INTO trip_stops (trip_id, customer_id, visit_order, note) VALUES (?, ?, ?, ?)'
  ).run(req.params.id, customer_id, visit_order || maxOrder.next_order, note || null);

  const stop = db.prepare(`
    SELECT ts.*, c.name as customer_name, c.address as customer_address
    FROM trip_stops ts
    JOIN customers c ON ts.customer_id = c.id
    WHERE ts.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(stop);
});

// PUT /api/trips/stops/:stopId - อัพเดท Stop
router.put('/stops/:stopId', (req, res) => {
  const db = getDb();
  const { status, arrived_at, departed_at, note, visit_order } = req.body;

  db.prepare(`
    UPDATE trip_stops SET
      status = COALESCE(?, status),
      arrived_at = COALESCE(?, arrived_at),
      departed_at = COALESCE(?, departed_at),
      note = COALESCE(?, note),
      visit_order = COALESCE(?, visit_order)
    WHERE id = ?
  `).run(status || null, arrived_at || null, departed_at || null, note, visit_order || null, req.params.stopId);

  const stop = db.prepare(`
    SELECT ts.*, c.name as customer_name, c.address as customer_address
    FROM trip_stops ts
    JOIN customers c ON ts.customer_id = c.id
    WHERE ts.id = ?
  `).get(req.params.stopId);

  res.json(stop);
});

// DELETE /api/trips/stops/:stopId
router.delete('/stops/:stopId', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM trip_stops WHERE id = ?').run(req.params.stopId);
  res.json({ message: 'Stop deleted' });
});

module.exports = router;
