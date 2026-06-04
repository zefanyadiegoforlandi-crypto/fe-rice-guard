const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const certPath = path.join(__dirname, 'localhost.crt');
const keyPath = path.join(__dirname, 'localhost.key');

// Check if cert already exists
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  console.log('Certificate already exists');
  process.exit(0);
}

console.log('Generating self-signed certificate for localhost...');

try {
  execSync(`openssl req -x509 -newkey rsa:2048 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/CN=localhost"`, {
    stdio: 'inherit'
  });
  console.log('Certificate generated successfully!');
} catch (error) {
  console.error('Failed to generate certificate:', error.message);
  console.log('Please install OpenSSL or use ngrok for HTTPS development');
  process.exit(1);
}
