// Vercel Serverless Function to proxy Google Drive files
// This bypasses Google Drive bandwidth limits by caching and serving via Vercel's CDN
// Usage: /api/proxy-media?fileId=GOOGLE_DRIVE_FILE_ID&type=video (or image)

export default async function handler(req, res) {
  const { fileId, type = 'video' } = req.query;

  if (!fileId) {
    return res.status(400).json({ error: 'fileId parameter is required' });
  }

  try {
    // Google Drive direct download URL
    const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // Fetch the file from Google Drive
    const response = await fetch(driveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MediaProxy/1.0)',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'Failed to fetch file from Google Drive' 
      });
    }

    // Get the content type from the response or set based on type parameter
    let contentType = response.headers.get('content-type');
    if (!contentType) {
      contentType = type === 'video' 
        ? 'video/mp4' 
        : type === 'image' 
        ? 'image/jpeg' 
        : 'application/octet-stream';
    }

    // Get the file buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set headers for caching and content type
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length);
    
    // Cache for 1 year (immutable files)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    // CORS headers (if needed)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    // Send the file
    return res.send(buffer);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

