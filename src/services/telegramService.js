/**
 * Service for sending notifications via Telegram Bot API.
 *
 * NOTE: Storing BOT_TOKEN in frontend code (even via environment variables)
 * exposes it to anyone who inspects the application code.
 * This is acceptable ONLY for this specific client-side demo requirement.
 * For production, calls should go through a secure backend proxy.
 */
class TelegramService {
  constructor() {
    this.botToken = import.meta.env.VITE_BOT_TOKEN;
    this.chatId = '1286446058'; // Hardcoded as per requirement
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
    this.lastSentTime = 0;
    this.cooldownMs = 15000; // 15 seconds cooldown
    this.isPaused = false;
  }

  setPaused(paused) {
    this.isPaused = paused;
    console.log(`Telegram notifications ${paused ? 'PAUSED' : 'RESUMED'}`);
  }

  /**
   * Checks if the service is currently in cooldown or paused.
   * @returns {boolean} True if in cooldown or paused
   */
  isCooldown() {
    if (this.isPaused) return true;
    const now = Date.now();
    return (now - this.lastSentTime < this.cooldownMs);
  }

  /**
   * Sends a photo with caption to the configured Telegram chat.
   *
   * @param {Blob} photoBlob - The image blob to send
   * @param {string} caption - The caption text
   * @returns {Promise<boolean>} - True if sent, false if throttled or failed
   */
  async sendPhoto(photoBlob, caption) {
    if (!this.botToken) {
      console.warn("Telegram Bot Token is missing in .env");
      return false;
    }

    // Double-check cooldown/pause here to be safe
    if (this.isCooldown()) {
      return false;
    }

    // CRITICAL FIX: Update lastSentTime IMMEDIATELY to prevent race conditions
    // where multiple detections trigger multiple sends before the first one completes.
    this.lastSentTime = Date.now();

    try {
      const url = `${this.baseUrl}/sendPhoto`;
      const formData = new FormData();
      formData.append('chat_id', this.chatId);
      formData.append('photo', photoBlob, 'alert.jpg');
      formData.append('caption', caption);

      const response = await fetch(url, {
        method: 'POST',
        // Content-Type header is not set manually for FormData,
        // the browser sets it with the boundary automatically.
        body: formData,
      });

      const data = await response.json();

      if (data.ok) {
        this.lastSentTime = Date.now();
        console.log("Telegram photo sent successfully.");
        return true;
      } else {
        console.error("Telegram API Error:", data.description);
        return false;
      }
    } catch (error) {
      console.error("Network Error sending Telegram photo:", error);
      return false;
    }
  }
}

export const telegramService = new TelegramService();
