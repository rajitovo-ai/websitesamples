const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5173;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // CORS zodat iframes/previews soepel werken
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  let url = decodeURIComponent(req.url).split('?')[0];
  if (url === '/' || url === '/index.html') {
    serveFile(res, path.join(ROOT, 'index.html'));
    return;
  }

  const target = path.join(ROOT, url);
  // Voorkom path traversal
  if (!target.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(target, (err, stats) => {
    if (!err && stats.isDirectory()) {
      const index = path.join(target, 'index.html');
      fs.access(index, fs.constants.F_OK, (err2) => {
        if (!err2) {
          serveFile(res, index);
        } else {
          res.writeHead(404).end('Not found');
        }
      });
    } else {
      serveFile(res, target);
    }
  });
});

server.listen(PORT, () => {
  console.log(`KIMI websites server running at http://localhost:${PORT}`);
});
