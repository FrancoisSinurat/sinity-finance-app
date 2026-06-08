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

// Run Next.js start with the port
const command = `next start -p ${port}`;
console.log(`Starting production server on port ${port}...`);
execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });

