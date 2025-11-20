const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  const { method } = req;
  const { action } = req.query;

  try {
    // WEBHOOK (for Telegram bot)
    if (method === 'POST' && action === 'webhook') {
      console.log('=== TELEGRAM WEBHOOK TRIGGERED ===');
      console.log('Full request body:', JSON.stringify(req.body, null, 2));
      
      const { message } = req.body;
      
      if (message) {
        console.log('Chat ID:', message.chat?.id);
        console.log('User ID:', message.from?.id);
        console.log('Message text:', message.text);
      }
      
      if (message?.text?.startsWith('/start')) {
        const userUuid = message.text.split(' ')[1];
        console.log('Extracted UUID:', userUuid);
        
        if (userUuid) {
          const result = await supabase
            .from('profiles')
            .update({ telegram_chat_id: message.chat.id })
            .eq('id', userUuid);
          
          console.log('Supabase update result:', result);
        }
      }
      return res.status(200).end();
    }

    // CONNECT BOT
    if (method === 'POST' && action === 'connect') {
      const { user_id, chat_id } = req.body;
      const { data, error } = await supabase
        .from('profiles')
        .update({ telegram_chat_id: chat_id })
        .eq('id', user_id)
        .select();

      if (error) throw error;
      return res.status(200).json(data[0]);
    }

    // SEND REMINDER
    if (method === 'POST' && action === 'send') {
      const { user_id, message } = req.body;
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('telegram_chat_id')
        .eq('id', user_id)
        .single();

      if (error || !profile.telegram_chat_id) throw new Error('No Telegram chat ID');

      // Send message using native https module instead of axios
      const https = require('https');
      const postData = JSON.stringify({
        chat_id: profile.telegram_chat_id,
        text: message
      });

      const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Telegram API error: ${res.statusCode}`));
          }
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      return res.status(200).json({ success: true });
    }

    // SET REMINDER TIME
    if (method === 'POST' && action === 'reminder-time') {
      const { user_id, reminder_time, timezone } = req.body;
      const { data, error } = await supabase
        .from('profiles')
        .update({ reminder_time, timezone })
        .eq('id', user_id)
        .select();

      if (error) throw error;
      return res.status(200).json(data[0]);
    }

    return res.status(400).json({ error: 'Invalid action or method' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
