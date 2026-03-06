const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '..', '.env');
let port = 3000; // default

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const portMatch = envContent.match(/^PORT=(\d+)/m);
  if (portMatch) {
    port = parseInt(portMatch[1], 10);
  }
}

// Run Next.js dev server with the port (--no-turbopack bisa dipakai kalau ada error ENOENT manifest)
const useTurbopack = !process.argv.includes('--no-turbopack');
const command = useTurbopack ? `next dev --turbopack -p ${port}` : `next dev -p ${port}`;
console.log(`Starting dev server on port ${port}${useTurbopack ? ' (turbopack)' : ' (webpack)'}...`);
execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });

