// Tiny static server for local checks. Usage: node tools/serve.js [folder] [port]
const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = path.resolve(process.argv[2] || 'public');
const port = +(process.argv[3] || 4180);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain', '.ico': 'image/x-icon' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(dir, p);
  if (!file.startsWith(dir)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) {
      return fs.readFile(path.join(dir, '404.html'), (e2, nf) => { res.writeHead(404, { 'content-type': types['.html'] }); res.end(nf || 'Not found'); });
    }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(buf);
  });
}).listen(port, '127.0.0.1', () => console.log('http://127.0.0.1:' + port));
