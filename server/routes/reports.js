const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

// GET /api/reports/dashboard - ข้อมูลหน้า Dashboard
router.get('/dashboard', (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const todaySummary = db.prepare(`
    SELECT
      COUNT(*) as total_checks,
      COALESCE(SUM(amount), 0) as total_amount
    FROM checks WHERE received_date = ?
  `).get(today);

  const todayTrips = db.prepare(`
    SELECT COUNT(*) as count FROM trips WHERE trip_date = ?
  `).get(today);

  const pendingChecks = db.prepare(`
    SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as amount
    FROM checks WHERE status = 'received'
  `).get();

  const monthStart = today.substring(0, 7) + '-01';
  const monthlySummary = db.prepare(`
    SELECT
      COUNT(*) as total_checks,
      COALESCE(SUM(amount), 0) as total_amount
    FROM checks WHERE received_date >= ? AND received_date <= ?
  `).get(monthStart, today);

  const recentChecks = db.prepare(`
    SELECT ch.*, c.name as customer_name
    FROM checks ch
    LEFT JOIN customers c ON ch.customer_id = c.id
    ORDER BY ch.created_at DESC LIMIT 5
  `).all();

  const statusCounts = db.prepare(`
    SELECT status, COUNT(*) as count, COALESCE(SUM(amount), 0) as amount
    FROM checks GROUP BY status
  `).all();

  res.json({
    today: {
      date: today,
      checks: todaySummary.total_checks,
      amount: todaySummary.total_amount,
      trips: todayTrips.count
    },
    pending: pendingChecks,
    monthly: monthlySummary,
    recent_checks: recentChecks,
    status_summary: statusCounts
  });
});

// GET /api/reports/monthly - สรุปรายเดือน
router.get('/monthly', (req, res) => {
  const db = getDb();
  const { year, month } = req.query;
  const now = new Date();
  const y = year || now.getFullYear();
  const m = month || String(now.getMonth() + 1).padStart(2, '0');
  const startDate = `${y}-${m}-01`;
  const endDate = `${y}-${m}-31`;

  const dailySummary = db.prepare(`
    SELECT
      received_date as date,
      COUNT(*) as check_count,
      COALESCE(SUM(amount), 0) as total_amount
    FROM checks
    WHERE received_date >= ? AND received_date <= ?
    GROUP BY received_date
    ORDER BY received_date ASC
  `).all(startDate, endDate);

  const bankSummary = db.prepare(`
    SELECT
      bank_name,
      COUNT(*) as check_count,
      COALESCE(SUM(amount), 0) as total_amount
    FROM checks
    WHERE received_date >= ? AND received_date <= ?
    GROUP BY bank_name
    ORDER BY total_amount DESC
  `).all(startDate, endDate);

  const customerSummary = db.prepare(`
    SELECT
      c.name as customer_name,
      COUNT(*) as check_count,
      COALESCE(SUM(ch.amount), 0) as total_amount
    FROM checks ch
    LEFT JOIN customers c ON ch.customer_id = c.id
    WHERE ch.received_date >= ? AND ch.received_date <= ?
    GROUP BY ch.customer_id
    ORDER BY total_amount DESC
  `).all(startDate, endDate);

  const total = db.prepare(`
    SELECT COUNT(*) as total_checks, COALESCE(SUM(amount), 0) as total_amount
    FROM checks WHERE received_date >= ? AND received_date <= ?
  `).get(startDate, endDate);

  res.json({
    period: { year: y, month: m },
    total,
    daily: dailySummary,
    by_bank: bankSummary,
    by_customer: customerSummary
  });
});

module.exports = router;
