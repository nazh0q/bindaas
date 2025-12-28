// Vercel Serverless Function for sending emails via EmailJS
// This keeps EmailJS credentials secure on the server side

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { first_name, last_name, email, message } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get EmailJS credentials from environment variables
    const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
    const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
    const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
    const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
      console.error('EmailJS credentials not configured');
      console.error('EMAILJS_PUBLIC_KEY:', EMAILJS_PUBLIC_KEY ? 'SET' : 'MISSING');
      console.error('EMAILJS_SERVICE_ID:', EMAILJS_SERVICE_ID ? 'SET' : 'MISSING');
      console.error('EMAILJS_TEMPLATE_ID:', EMAILJS_TEMPLATE_ID ? 'SET' : 'MISSING');
      console.error('EMAILJS_PRIVATE_KEY:', EMAILJS_PRIVATE_KEY ? 'SET' : 'MISSING');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // Prepare template parameters
    // Map to EmailJS template variables:
    // - title: Used in Subject line as "Contact Us: {{title}}"
    // - name: Used in From Name and email content body
    // - email: Used in Reply To field
    // - message: Used in email content body
    // - time: Current timestamp for the email
    const templateParams = {
      title: `${first_name.trim()} ${last_name.trim()}`,
      name: `${first_name.trim()} ${last_name.trim()}`,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim(),
      message: message.trim(),
      time: new Date().toLocaleString('en-US', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      })
    };

    // Call EmailJS API directly
    // Include accessToken (private key) for strict mode
    const requestBody = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: templateParams
    };
    
    // Add private key if available (required for strict mode)
    if (EMAILJS_PRIVATE_KEY) {
      requestBody.accessToken = EMAILJS_PRIVATE_KEY;
    }

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('EmailJS API Error:', errorData);
      console.error('EmailJS Request:', {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY ? `${EMAILJS_PUBLIC_KEY.substring(0, 5)}...` : 'MISSING'
      });
      return res.status(500).json({ 
        error: 'Failed to send email',
        details: errorData 
      });
    }

    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

