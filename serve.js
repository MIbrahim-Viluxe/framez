const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let pathname = url.pathname;
  
  if (pathname === '/') pathname = '/index.html';
  
  let filePath = path.join(process.cwd(), pathname);
  const ext = path.extname(filePath);
  
  if (!ext && !pathname.endsWith('/')) {
    const htmlPath = filePath + '.html';
    if (fs.existsSync(htmlPath)) {
      filePath = htmlPath;
    }
  }

  const currentExt = path.extname(filePath);
  const mimeType = MIME_TYPES[currentExt] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`[SERVER ERROR] ${req.method} ${pathname} -> `, err);
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('404: File Not Found');
      } else {
        res.writeHead(500);
        res.end('500: Internal Server Error - ' + err.message);
      }
      return;
    }
    res.writeHead(200, { 
        'Content-Type': mimeType,
        'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
});

server.listen(3002, () => {
  console.log('FrameZ Studio Dev Server started!');
  console.log('URL: http://localhost:3002');
});
