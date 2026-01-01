/**
 * Service for sending notifications via Backend Proxy.
 *
 * SECURITY UPDATE:
 * We no longer call Telegram API directly from the browser.
 * Instead, we send data to our own backend (/api/notify), which holds the secrets.
 */
class TelegramService {
  constructor() {
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
   * Sends a photo with caption to the backend proxy.
   *
   * @param {Blob} photoBlob - The image blob to send
   * @param {string} caption - The caption text
   * @returns {Promise<boolean>} - True if sent, false if throttled or failed
   */
  async sendPhoto(photoBlob, caption) {
    // Double-check cooldown/pause here to be safe
    if (this.isCooldown()) {
      return false;
    }

    // CRITICAL FIX: Update lastSentTime IMMEDIATELY to prevent race conditions
    this.lastSentTime = Date.now();

    try {
      // Send to our local proxy endpoint
      const url = '/api/notify';
      const formData = new FormData();
      formData.append('photo', photoBlob, 'alert.jpg');
      formData.append('caption', caption);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.lastSentTime = Date.now();
        console.log("Telegram photo sent successfully via proxy.");
        return true;
      } else {
        console.error("Backend Proxy Error:", data.error || data);
        return false;
      }
    } catch (error) {
      console.error("Network Error sending to proxy:", error);
      return false;
    }
  }
}

export const telegramService = new TelegramService();
