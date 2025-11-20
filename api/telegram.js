const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method } = req;
  const { action } = req.query;

  try {
    // WEBHOOK (for Telegram bot)
    if (method === 'POST' && action === 'webhook') {
      const { message } = req.body;
      if (message?.text?.startsWith('/start')) {
        const userUuid = message.text.split(' ')[1];
        if (userUuid) {
          await supabase
            .from('profiles')
            .update({ telegram_chat_id: message.chat.id })
            .eq('id', userUuid);
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

      await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: profile.telegram_chat_id,
        text: message
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
