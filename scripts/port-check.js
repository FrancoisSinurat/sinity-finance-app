/**
 * Cek port yang dipakai (untuk dev app & backend).
 * Jalankan: npm run port
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envPath = path.join(__dirname, '..', '.env');
let appPort = 3000;
let apiPort = 8080;

if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  const m1 = env.match(/^PORT=(\d+)/m);
  const m2 = env.match(/NEXT_PUBLIC_API_BASE_URL=(?:https?:\/\/[^:]+:)?(\d+)/m);
  if (m1) appPort = parseInt(m1[1], 10);
  if (m2) apiPort = parseInt(m2[1], 10);
}

function checkPort(port, label) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const lines = out.trim().split('\n').filter(Boolean);
    console.log(`Port ${port} (${label}): DIPAKAI`);
    lines.forEach((l) => console.log('  ', l.trim()));
    return true;
  } catch (e) {
    console.log(`Port ${port} (${label}): kosong`);
    return false;
  }
}

console.log('Port dari .env: app=' + appPort + ', backend=' + apiPort);
console.log('');
checkPort(appPort, 'Next.js app');
checkPort(apiPort, 'Backend API (sinity-finance-backend)');
