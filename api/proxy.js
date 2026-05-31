export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cookie');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }
  
  try {
    const { telegram_link, cookies } = req.body;
    
    if (!telegram_link) {
      return res.status(400).json({ error: 'telegram_link is required' });
    }
    
    // Clean and prepare cookies
    let cookieHeader = '';
    if (cookies && cookies.trim()) {
      // Remove any whitespace and ensure proper format
      cookieHeader = cookies.trim();
      // Add cf_clearance prefix if missing
      if (!cookieHeader.includes('cf_clearance') && cookieHeader.length > 0) {
        cookieHeader = `cf_clearance=${cookieHeader}`;
      }
    }
    
    console.log('Request for:', telegram_link);
    console.log('Cookie present:', !!cookieHeader);
    
    // Make request to the external API with browser headers
    const response = await fetch('https://telegramdownloader.net/proxy.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9,fa;q=0.8',
        'Origin': 'https://telegramdownloader.net',
        'Referer': 'https://telegramdownloader.net/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Cookie': cookieHeader
      },
      body: new URLSearchParams({
        telegram_link: telegram_link
      })
    });
    
    const responseText = await response.text();
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      return res.status(200).json(data);
    } catch (e) {
      // If not JSON, check if it's a Cloudflare page
      if (responseText.includes('cf_clearance') || responseText.includes('Just a moment') || responseText.includes('Cloudflare')) {
        return res.status(500).json({ 
          error: 'Cloudflare protection detected. Please enter your cf_clearance cookie in the settings below.',
          requires_clearance: true
        });
      }
      return res.status(500).json({ 
        error: 'External API returned non-JSON response',
        preview: responseText.substring(0, 200)
      });
    }
    
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
