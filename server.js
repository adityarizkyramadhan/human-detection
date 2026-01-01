import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app (dist folder)
app.use(express.static(path.join(__dirname, 'dist')));

// Multer setup for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Proxy Endpoint for Telegram Notifications
 * Receives: photo (file), caption (text)
 * Sends to: Telegram Bot API
 */
app.post('/api/notify', upload.single('photo'), async (req, res) => {
  try {
    const botToken = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID || '1286446058'; // Fallback to hardcoded ID if not in env

    if (!botToken) {
      console.error('BOT_TOKEN is missing in server environment');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No photo provided' });
    }

    // Construct FormData for Telegram
    // Note: In Node 18+, global FormData and fetch are available.
    // However, appending a buffer directly to standard FormData is tricky.
    // We construct a Blob from the buffer.
    const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });

    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', fileBlob, 'alert.jpg');
    formData.append('caption', req.body.caption || 'Alert from Human Detection System');

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.ok) {
      console.log('Notification sent successfully to Telegram');
      res.json({ success: true, data });
    } else {
      console.error('Telegram API Error:', data);
      res.status(502).json({ error: 'Failed to send to Telegram', details: data });
    }

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Handle React Routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
