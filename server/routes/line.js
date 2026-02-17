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

// GET /api/line/history - ประวัติการส่ง LINE
router.get('/history', (req, res) => {
  const db = getDb();
  const notifications = db.prepare(
    'SELECT * FROM line_notifications ORDER BY created_at DESC LIMIT 50'
  ).all();
  res.json(notifications);
});

module.exports = router;
