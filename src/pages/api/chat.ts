import type { NextApiRequest, NextApiResponse } from 'next';

// Define the shape of request body
interface ChatRequestBody {
  message: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request (pre-flight CORS request)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body as ChatRequestBody;
    
    // Call the API following the Anthropic pattern
    const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.SONNAT_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620", // Using Claude 3.5 Sonnet model
        max_tokens: 1024,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('API Error:', errorText);
      return res.status(apiResponse.status).json({ error: errorText });
    }

    const data = await apiResponse.json();
    
    // Extract the response content based on Anthropic API response format
    const content = data.content && data.content[0]?.text || 
                    "Sorry, I couldn't process your request at this time.";
    
    // Return the content to the frontend
    return res.status(200).json({ answer: content });
    
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 