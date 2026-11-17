// Abasthan free Web Service: Komari probe + placeholder page.
// Spawns the komari-agent binary (per-client token from KOMARI_TOKEN env var,
// registered in advance on the panel) and serves the placeholder page on $PORT.
// Agent restarts on exit; SIGTERM kills the child with us.
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const AGENT = path.join(__dirname, 'komari-agent');
const ENDPOINT = 'https://vps.wukongrental.org';
const INDEX = path.join(__dirname, 'index.html');

// The upload/extract step may drop the executable bit; restore it.
try {
  fs.chmodSync(AGENT, 0o755);
} catch (e) {
  console.error('chmod agent failed:', e.message);
}

let agent = null;
let restarts = 0;

function startAgent() {
  if (!process.env.KOMARI_TOKEN) {
    console.error('KOMARI_TOKEN env var is missing; agent cannot connect.');
    return;
  }
  console.log('starting komari-agent (attempt %d)', restarts + 1);
  agent = spawn(
    AGENT,
    ['-e', ENDPOINT, '-t', process.env.KOMARI_TOKEN, '--disable-web-ssh'],
    { stdio: 'inherit' }
  );
  agent.on('exit', (code, signal) => {
    console.log(`komari-agent exited code=${code} signal=${signal}; respawning in 5s`);
    agent = null;
    restarts += 1;
    setTimeout(startAgent, 5000);
  });
  agent.on('error', (err) => {
    console.error('komari-agent spawn error:', err.message);
  });
}

startAgent();

// Placeholder page on / ; plain ok on any other path (health checks / pings).
const port = process.env.PORT || 3000;
http
  .createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
      fs.readFile(INDEX, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error reading index.html\n');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      });
    } else {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('ok');
    }
  })
  .listen(port, () => console.log(`listening on ${port}`));

// Clean shutdown: kill the child when the platform stops us.
process.on('SIGTERM', () => {
  if (agent) agent.kill('SIGTERM');
  process.exit(0);
});
