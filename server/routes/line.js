const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');
const path = require('path');
const fs = require('fs');

async function sendLineNotify(token, message, imagePath) {
  const fetch = (await import('node-fetch')).default;
  const FormData = (await import('form-data')).default;

  const form = new FormData();
  form.append('message', message);

  if (imagePath) {
    const fullPath = path.join(__dirname, '..', imagePath);
    if (fs.existsSync(fullPath)) {
      form.append('imageFile', fs.createReadStream(fullPath));
    }
  }

  const response = await fetch('https://notify-api.line.me/api/notify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      ...form.getHeaders()
    },
    body: form
  });

  return {
    status: response.status,
    data: await response.json()
  };
}

// POST /api/line/send - ส่งข้อความไป LINE
router.post('/send', async (req, res) => {
  const db = getDb();
  const { message, image_path } = req.body;

  const tokenSetting = db.prepare("SELECT value FROM settings WHERE key = 'line_notify_token'").get();
  if (!tokenSetting || !tokenSetting.value) {
    return res.status(400).json({ error: 'LINE Notify Token ยังไม่ได้ตั้งค่า กรุณาตั้งค่าใน Settings' });
  }

  try {
    const result = await sendLineNotify(tokenSetting.value, message, image_path);

    db.prepare(
      'INSERT INTO line_notifications (message, image_path, status, response, sent_at) VALUES (?, ?, ?, ?, datetime(\'now\',\'localtime\'))'
    ).run(message, image_path || null, result.status === 200 ? 'sent' : 'failed', JSON.stringify(result.data));

    res.json({ success: result.status === 200, result: result.data });
  } catch (error) {
    db.prepare(
      'INSERT INTO line_notifications (message, image_path, status, response) VALUES (?, ?, ?, ?)'
    ).run(message, image_path || null, 'failed', error.message);

    res.status(500).json({ error: error.message });
  }
});

// POST /api/line/send-daily-summary - ส่งสรุปรายวันไป LINE
router.post('/send-daily-summary', async (req, res) => {
  const db = getDb();
  const { date } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const tokenSetting = db.prepare("SELECT value FROM settings WHERE key = 'line_notify_token'").get();
  if (!tokenSetting || !tokenSetting.value) {
    return res.status(400).json({ error: 'LINE Notify Token ยังไม่ได้ตั้งค่า' });
  }

  const checks = db.prepare(`
    SELECT ch.*, c.name as customer_name
    FROM checks ch
    LEFT JOIN customers c ON ch.customer_id = c.id
    WHERE ch.received_date = ?
    ORDER BY ch.created_at ASC
  `).all(targetDate);

  if (checks.length === 0) {
    return res.json({ success: true, message: 'ไม่มีเช็คในวันที่เลือก' });
  }

  const total = checks.reduce((sum, c) => sum + c.amount, 0);

  let message = `\n📋 สรุปเช็ครับวันที่ ${targetDate}\n`;
  message += `━━━━━━━━━━━━━━━\n`;

  checks.forEach((c, i) => {
    message += `${i + 1}. ${c.customer_name || 'ไม่ระบุ'}\n`;
    message += `   🏦 ${c.bank_name} #${c.check_number}\n`;
    message += `   💰 ${Number(c.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท\n`;
  });

  message += `━━━━━━━━━━━━━━━\n`;
  message += `📊 รวม ${checks.length} ฉบับ = ${total.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท`;

  try {
    const result = await sendLineNotify(tokenSetting.value, message);

    db.prepare(
      'INSERT INTO line_notifications (message, status, response, sent_at) VALUES (?, ?, ?, datetime(\'now\',\'localtime\'))'
    ).run(message, result.status === 200 ? 'sent' : 'failed', JSON.stringify(result.data));

    res.json({ success: result.status === 200, message, result: result.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/line/send-check/:checkId - ส่งเช็คเดี่ยวไป LINE
router.post('/send-check/:checkId', async (req, res) => {
  const db = getDb();

  const tokenSetting = db.prepare("SELECT value FROM settings WHERE key = 'line_notify_token'").get();
  if (!tokenSetting || !tokenSetting.value) {
    return res.status(400).json({ error: 'LINE Notify Token ยังไม่ได้ตั้งค่า' });
  }

  const check = db.prepare(`
    SELECT ch.*, c.name as customer_name
    FROM checks ch
    LEFT JOIN customers c ON ch.customer_id = c.id
    WHERE ch.id = ?
  `).get(req.params.checkId);

  if (!check) return res.status(404).json({ error: 'Check not found' });

  let message = `\n🧾 เช็ครับ\n`;
  message += `━━━━━━━━━━━━━━━\n`;
  message += `📌 ลูกค้า: ${check.customer_name || 'ไม่ระบุ'}\n`;
  message += `🏦 ธนาคาร: ${check.bank_name}\n`;
  message += `#️⃣ เลขที่: ${check.check_number}\n`;
  message += `💰 จำนวน: ${Number(check.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท\n`;
  message += `📅 ลงวันที่: ${check.check_date}\n`;
  if (check.due_date) message += `⏰ ครบกำหนด: ${check.due_date}\n`;
  message += `📋 สถานะ: ${check.status}`;

  try {
    const result = await sendLineNotify(tokenSetting.value, message, check.image_path);

    db.prepare(
      'INSERT INTO line_notifications (message, image_path, status, response, sent_at) VALUES (?, ?, ?, ?, datetime(\'now\',\'localtime\'))'
    ).run(message, check.image_path, result.status === 200 ? 'sent' : 'failed', JSON.stringify(result.data));

    res.json({ success: result.status === 200, result: result.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/line/send-today-plan - ส่งแผนเดินทางวันนี้ (สถานที่ที่ต้องไป) ไป LINE
router.post('/send-today-plan', async (req, res) => {
  const db = getDb();
  const { date } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const tokenSetting = db.prepare("SELECT value FROM settings WHERE key = 'line_notify_token'").get();
  if (!tokenSetting || !tokenSetting.value) {
    return res.status(400).json({ error: 'LINE Notify Token ยังไม่ได้ตั้งค่า' });
  }

  const trips = db.prepare(`
    SELECT t.*, 
      (SELECT COUNT(*) FROM trip_stops WHERE trip_id = t.id) as stop_count
    FROM trips t
    WHERE t.trip_date = ?
    ORDER BY t.created_at ASC
  `).all(targetDate);

  if (trips.length === 0) {
    return res.json({ success: true, message: 'ไม่มีทริปในวันที่เลือก' });
  }

  const allStops = [];
  for (const trip of trips) {
    const stops = db.prepare(`
      SELECT ts.*, c.name as customer_name, c.address as customer_address, c.phone as customer_phone,
        ts.status as stop_status
      FROM trip_stops ts
      JOIN customers c ON ts.customer_id = c.id
      WHERE ts.trip_id = ?
      ORDER BY ts.visit_order ASC
    `).all(trip.id);
    allStops.push({ trip, stops });
  }

  const totalStops = allStops.reduce((sum, t) => sum + t.stops.length, 0);
  if (totalStops === 0) {
    return res.json({ success: true, message: 'ยังไม่มีสถานที่ในทริปวันนี้' });
  }

  const thaiDate = new Date(targetDate + 'T00:00:00').toLocaleDateString('th-TH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  let message = `\n📍 แผนเดินทางรับเช็ค\n`;
  message += `📅 ${thaiDate}\n`;
  message += `━━━━━━━━━━━━━━━\n`;

  let stopNum = 0;
  for (const { trip, stops } of allStops) {
    if (allStops.length > 1) {
      message += `\n🚗 ${trip.title || 'ทริป'}\n`;
    }
    for (const stop of stops) {
      stopNum++;
      const statusIcon = stop.stop_status === 'completed' ? '✅' :
                          stop.stop_status === 'arrived' ? '📌' :
                          stop.stop_status === 'skipped' ? '⏭️' : '⬜';
      message += `${statusIcon} ${stopNum}. ${stop.customer_name}\n`;
      if (stop.customer_address) {
        message += `   📮 ${stop.customer_address}\n`;
      }
      if (stop.customer_phone) {
        message += `   📞 ${stop.customer_phone}\n`;
      }
    }
  }

  message += `━━━━━━━━━━━━━━━\n`;
  message += `📊 รวม ${totalStops} สถานที่`;

  try {
    const result = await sendLineNotify(tokenSetting.value, message);

    db.prepare(
      'INSERT INTO line_notifications (message, status, response, sent_at) VALUES (?, ?, ?, datetime(\'now\',\'localtime\'))'
    ).run(message, result.status === 200 ? 'sent' : 'failed', JSON.stringify(result.data));

    res.json({ success: result.status === 200, message, result: result.data });
  } catch (error) {
    db.prepare(
      'INSERT INTO line_notifications (message, status, response) VALUES (?, ?, ?)'
    ).run(message, 'failed', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/line/send-deposit-status - ส่งสรุปสถานะนำเช็คเข้าธนาคาร (เข้า/ไม่ได้เข้า) ไป LINE
router.post('/send-deposit-status', async (req, res) => {
  const db = getDb();
  const { date } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const tokenSetting = db.prepare("SELECT value FROM settings WHERE key = 'line_notify_token'").get();
  if (!tokenSetting || !tokenSetting.value) {
    return res.status(400).json({ error: 'LINE Notify Token ยังไม่ได้ตั้งค่า' });
  }

  const checks = db.prepare(`
    SELECT ch.*, c.name as customer_name
    FROM checks ch
    LEFT JOIN customers c ON ch.customer_id = c.id
    WHERE ch.received_date = ?
    ORDER BY ch.status ASC, ch.created_at ASC
  `).all(targetDate);

  if (checks.length === 0) {
    return res.json({ success: true, message: 'ไม่มีเช็คในวันที่เลือก' });
  }

  const deposited = checks.filter(c => c.status === 'deposited' || c.status === 'cleared');
  const notDeposited = checks.filter(c => c.status === 'received');
  const bounced = checks.filter(c => c.status === 'bounced');
  const cancelled = checks.filter(c => c.status === 'cancelled');

  const depositedTotal = deposited.reduce((sum, c) => sum + c.amount, 0);
  const notDepositedTotal = notDeposited.reduce((sum, c) => sum + c.amount, 0);
  const allTotal = checks.reduce((sum, c) => sum + c.amount, 0);

  const thaiDate = new Date(targetDate + 'T00:00:00').toLocaleDateString('th-TH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  let message = `\n🏦 สรุปสถานะนำเช็คเข้าธนาคาร\n`;
  message += `📅 ${thaiDate}\n`;
  message += `━━━━━━━━━━━━━━━\n`;

  if (deposited.length > 0) {
    message += `\n✅ นำเข้าธนาคารแล้ว (${deposited.length} ฉบับ)\n`;
    deposited.forEach((c, i) => {
      message += `  ${i + 1}. ${c.customer_name || 'ไม่ระบุ'}\n`;
      message += `     ${c.bank_name} #${c.check_number}\n`;
      message += `     💰 ${Number(c.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท\n`;
    });
    message += `  รวม: ${Number(depositedTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท\n`;
  }

  if (notDeposited.length > 0) {
    message += `\n❌ ยังไม่ได้นำเข้าธนาคาร (${notDeposited.length} ฉบับ)\n`;
    notDeposited.forEach((c, i) => {
      message += `  ${i + 1}. ${c.customer_name || 'ไม่ระบุ'}\n`;
      message += `     ${c.bank_name} #${c.check_number}\n`;
      message += `     💰 ${Number(c.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท\n`;
    });
    message += `  รวม: ${Number(notDepositedTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท\n`;
  }

  if (bounced.length > 0) {
    message += `\n⚠️ เช็คคืน (${bounced.length} ฉบับ)\n`;
    bounced.forEach((c, i) => {
      message += `  ${i + 1}. ${c.customer_name || 'ไม่ระบุ'} - ${c.bank_name} #${c.check_number} - ${Number(c.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท\n`;
    });
  }

  message += `━━━━━━━━━━━━━━━\n`;
  message += `📊 รวมทั้งหมด ${checks.length} ฉบับ = ${Number(allTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท\n`;
  message += `✅ เข้าแล้ว ${deposited.length} | ❌ ยังไม่เข้า ${notDeposited.length}`;
  if (bounced.length > 0) message += ` | ⚠️ คืน ${bounced.length}`;

  try {
    const result = await sendLineNotify(tokenSetting.value, message);

    db.prepare(
      'INSERT INTO line_notifications (message, status, response, sent_at) VALUES (?, ?, ?, datetime(\'now\',\'localtime\'))'
    ).run(message, result.status === 200 ? 'sent' : 'failed', JSON.stringify(result.data));

    res.json({ success: result.status === 200, message, result: result.data });
  } catch (error) {
    db.prepare(
      'INSERT INTO line_notifications (message, status, response) VALUES (?, ?, ?)'
    ).run(message, 'failed', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/line/preview-today-plan - ดูตัวอย่างข้อความแผนเดินทาง (ไม่ส่งจริง)
router.get('/preview-today-plan', (req, res) => {
  const db = getDb();
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const trips = db.prepare(`
    SELECT t.id, t.title, t.status as trip_status
    FROM trips t WHERE t.trip_date = ?
    ORDER BY t.created_at ASC
  `).all(targetDate);

  const tripData = trips.map(trip => {
    const stops = db.prepare(`
      SELECT ts.id, ts.visit_order, ts.status as stop_status,
        c.name as customer_name, c.address as customer_address, c.phone as customer_phone
      FROM trip_stops ts
      JOIN customers c ON ts.customer_id = c.id
      WHERE ts.trip_id = ?
      ORDER BY ts.visit_order ASC
    `).all(trip.id);
    return { ...trip, stops };
  });

  res.json({ date: targetDate, trips: tripData });
});

// GET /api/line/preview-deposit-status - ดูตัวอย่างสรุปสถานะเช็ค (ไม่ส่งจริง)
router.get('/preview-deposit-status', (req, res) => {
  const db = getDb();
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const checks = db.prepare(`
    SELECT ch.id, ch.check_number, ch.bank_name, ch.amount, ch.status, ch.check_date,
      c.name as customer_name
    FROM checks ch
    LEFT JOIN customers c ON ch.customer_id = c.id
    WHERE ch.received_date = ?
    ORDER BY ch.status ASC, ch.created_at ASC
  `).all(targetDate);

  const deposited = checks.filter(c => c.status === 'deposited' || c.status === 'cleared');
  const notDeposited = checks.filter(c => c.status === 'received');
  const bounced = checks.filter(c => c.status === 'bounced');

  res.json({
    date: targetDate,
    deposited,
    not_deposited: notDeposited,
    bounced,
    total_count: checks.length,
    deposited_total: deposited.reduce((s, c) => s + c.amount, 0),
    not_deposited_total: notDeposited.reduce((s, c) => s + c.amount, 0),
  });
});

// GET /api/line/history - ประวัติการส่ง LINE
router.get('/history', (req, res) => {
  const db = getDb();
  const notifications = db.prepare(
    'SELECT * FROM line_notifications ORDER BY created_at DESC LIMIT 50'
  ).all();
  res.json(notifications);
});

module.exports = router;
