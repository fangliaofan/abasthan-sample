// Minimal static file server: serves index.html, nothing else.
// Dependency-free; listens on $PORT (Abasthan injects it) or 3000.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = http.createServer((req, res) => {
  if (req.url !== '/' && req.url !== '/index.html') {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found\n');
    return;
  }
  fs.readFile(INDEX, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading index.html\n');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`abasthan-sample listening on port ${PORT}`);
});
