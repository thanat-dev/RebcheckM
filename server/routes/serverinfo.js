const express = require('express');
const router = express.Router();
const os = require('os');

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal) {
        ips.push({
          name: name,
          address: addr.address,
        });
      }
    }
  }

  return ips;
}

// GET /api/server-info
router.get('/', (req, res) => {
  const port = process.env.PORT || 3001;
  const ips = getLocalIPs();

  const urls = ips.map(ip => ({
    interface: ip.name,
    ip: ip.address,
    url: `http://${ip.address}:${port}`,
  }));

  res.json({
    port,
    hostname: os.hostname(),
    platform: os.platform(),
    urls,
    localhost: `http://localhost:${port}`,
  });
});

module.exports = router;
module.exports.getLocalIPs = getLocalIPs;
