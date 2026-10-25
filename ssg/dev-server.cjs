// Loopback-only preview server with the same API handlers as production.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, 'dist');
const routes = { '/api/pagespeed': require('./api/pagespeed'), '/api/site-analysis': require('./api/site-analysis') };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (routes[url.pathname]) {
      req.query = Object.fromEntries(url.searchParams);
      res.status = code => { res.statusCode = code; return res; };
      res.json = value => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(value)); };
      return await routes[url.pathname](req, res);
    }
    let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end('Bulunamadı'); }
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.wasm': 'application/wasm' };
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream'); fs.createReadStream(file).pipe(res);
  } catch { if (!res.headersSent) res.writeHead(500); res.end('Önizleme hatası'); }
}).listen(Number(process.env.PORT || 4174), '127.0.0.1', () => console.log('Önizleme: http://127.0.0.1:' + (process.env.PORT || 4174)));
