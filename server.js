#!/usr/bin/env node
/**
 * Local dev server: serves static files + /api/proxy-media (Google Drive proxy).
 * Run: node server.js
 * Then open http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname);

async function proxyMedia(fileId, type, res) {
  const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  try {
    const response = await fetch(driveUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MediaProxy/1.0)' },
    });
    if (!response.ok) {
      res.writeHead(response.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch file from Google Drive' }));
      return;
    }
    let contentType = response.headers.get('content-type');
    if (!contentType) {
      contentType = type === 'video' ? 'video/mp4' : type === 'image' ? 'image/jpeg' : 'application/octet-stream';
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(buffer);
  } catch (err) {
    console.error('Proxy error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

function serveStatic(filePath, res) {
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    res.writeHead(404);
    res.end('Not found');
  });
  stream.on('open', () => {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.otf': 'font/otf',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
    };
    res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
    stream.pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url || '', `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(parsed.pathname);
  const query = Object.fromEntries(parsed.searchParams);

  // API: proxy-media (same behavior as Vercel serverless)
  if (pathname === '/api/proxy-media') {
    const fileId = query.fileId;
    const type = query.type || 'video';
    if (!fileId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'fileId parameter is required' }));
      return;
    }
    await proxyMedia(fileId, type, res);
    return;
  }

  // Static files: resolve path under project root
  let filePath = path.join(ROOT, pathname === '/' ? 'index.html' : pathname);
  if (pathname.endsWith('/')) filePath = path.join(filePath, 'index.html');
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  let stat = await fs.promises.stat(filePath).catch(() => null);
  if (stat?.isDirectory()) filePath = path.join(filePath, 'index.html');
  else if (!stat && !pathname.includes('.')) filePath = path.join(ROOT, pathname + '.html');
  serveStatic(filePath, res);
});

server.listen(PORT, () => {
  console.log(`Local server: http://localhost:${PORT}`);
  console.log('  - Site and assets served from project root');
  console.log('  - /api/proxy-media?fileId=...&type=video works locally');
});
