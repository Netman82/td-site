export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }
  
  try {
    const { telegram_link } = req.body;
    
    if (!telegram_link) {
      return res.status(400).json({ error: 'telegram_link is required' });
    }
    
    console.log('Requested link:', telegram_link);
    
    // Make request to the external API
    const response = await fetch('https://telegramdownloader.net/proxy.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        telegram_link: telegram_link
      })
    });
    
    // Get the response as text first
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // If not JSON, return the raw response for debugging
      return res.status(500).json({ 
        error: 'External API returned non-JSON response',
        raw_response: responseText.substring(0, 500) // First 500 chars
      });
    }
    
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
