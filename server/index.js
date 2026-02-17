const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const { initDatabase } = require('./db/init');

initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/customers', require('./routes/customers'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/checks', require('./routes/checks'));
app.use('/api/line', require('./routes/line'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/server-info', require('./routes/serverinfo'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║        RebcheckM Server Started          ║');
  console.log('  ╠══════════════════════════════════════════╣');
  console.log(`  ║  Local:   http://localhost:${PORT}          ║`);

  const interfaces = os.networkInterfaces();
  for (const [name, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal) {
        const url = `http://${addr.address}:${PORT}`;
        const pad = ' '.repeat(Math.max(0, 35 - url.length));
        console.log(`  ║  WiFi:    ${url}${pad}║`);
      }
    }
  }

  console.log('  ╠══════════════════════════════════════════╣');
  console.log('  ║  เปิด URL ด้านบนจาก Browser มือถือ       ║');
  console.log('  ║  (มือถือต้องอยู่ WiFi เดียวกัน)            ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
});
