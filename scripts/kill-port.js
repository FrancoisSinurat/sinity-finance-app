/**
 * Kill proses yang pakai port (baca PORT dari .env, atau pass port: node scripts/kill-port.js 3010).
 * Windows: taskkill /PID <pid> /F
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let port = process.argv[2];
if (!port) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const m = fs.readFileSync(envPath, 'utf8').match(/^PORT=(\d+)/m);
    if (m) port = m[1];
  }
  port = port || '3000';
} else {
  port = String(port).replace(/\D/g, '') || '3000';
}

console.log('Mencari proses di port', port, '...');
let out;
try {
  out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
} catch (e) {
  console.log('Tidak ada proses yang memakai port', port);
  process.exit(0);
}

const lines = out.trim().split('\n').filter((l) => l.includes('LISTENING'));
const pids = new Set();
lines.forEach((l) => {
  const parts = l.trim().split(/\s+/);
  const pid = parts[parts.length - 1];
  if (pid && /^\d+$/.test(pid)) pids.add(pid);
});

if (pids.size === 0) {
  console.log('Tidak ada proses LISTENING di port', port);
  process.exit(0);
}

for (const pid of pids) {
  try {
    execSync(`taskkill /PID ${pid} /F`, { stdio: 'inherit' });
    console.log('Proses', pid, 'dihentikan.');
  } catch (e) {
    console.error('Gagal kill PID', pid, '(coba jalankan terminal as Administrator)');
  }
}
