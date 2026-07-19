const http = require('http');
const fs   = require('fs');
const path = require('path');
const port = 3000;

http.createServer((req, res) => {
    // Strip query string & decode Arabic characters
    let urlPath = req.url.split('?')[0];
    urlPath = decodeURIComponent(urlPath);

    let fp = '.' + urlPath;

    // Root → index.html
    if (fp === './' || fp === '.') fp = './index.html';
    // Directory → directory/index.html
    else if (fp.endsWith('/')) fp = fp + 'index.html';

    // No extension → try .html, then /index.html
    if (!path.extname(fp)) {
        if      (fs.existsSync(fp + '.html'))        fp = fp + '.html';
        else if (fs.existsSync(fp + '/index.html'))  fp = fp + '/index.html';
    }

    fs.readFile(fp, (err, data) => {
        if (err) {
            console.log('404:', fp);
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not found: ' + urlPath);
            return;
        }
        const types = {
            '.html': 'text/html; charset=utf-8',
            '.js':   'application/javascript',
            '.css':  'text/css',
            '.png':  'image/png',
            '.jpg':  'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.svg':  'image/svg+xml',
            '.mp4':  'video/mp4',
            '.webm': 'video/webm',
            '.ico':  'image/x-icon',
            '.txt':  'text/plain'
        };
        const ct = types[path.extname(fp)] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': ct });
        res.end(data);
    });

}).listen(port, '0.0.0.0', () => {
    console.log('');
    console.log('  ✅ Server running!');
    console.log('  🌐 Main site : http://localhost:' + port);
    console.log('  🔧 Admin     : http://localhost:' + port + '/admin.html');
    console.log('');
});
