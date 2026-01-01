import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

/**
 * Service responsible for loading the COCO-SSD model and performing object detection.
 * Follows the Clean Architecture principle by encapsulating the external library logic.
 */
class HumanDetectionService {
  constructor() {
    this.model = null;
    // Singleton instance model loading promise to handle concurrent calls if any
    this.loadPromise = null;
  }

  /**
   * Loads the COCO-SSD model.
   * Uses a singleton pattern to ensure the model is loaded only once.
   */
  async loadModel() {
    if (this.model) return;

    if (!this.loadPromise) {
      this.loadPromise = cocoSsd.load({
        base: 'lite_mobilenet_v2' // Use lite version for "Lightweight" & "Low Latency"
      }).then(model => {
        this.model = model;
        this.loadPromise = null;
      }).catch(err => {
        this.loadPromise = null;
        throw new Error(`Failed to load model: ${err.message}`);
      });
    }

    await this.loadPromise;
  }

  /**
   * Detects humans in the given video element.
   * @param {HTMLVideoElement} videoElement
   * @returns {Promise<Array>} Array of detections filtered for 'person' class.
   */
  async detect(videoElement) {
    if (!this.model) {
      throw new Error("Model is not loaded yet. Call loadModel() first.");
    }

    // Safety check for video readiness
    if (!videoElement || videoElement.readyState !== 4) {
      return [];
    }

    try {
      const predictions = await this.model.detect(videoElement);
      // Filter only for 'person' class to satisfy the requirement
      return predictions.filter(prediction => prediction.class === 'person');
    } catch (error) {
      console.error("Detection error:", error);
      // In a real scenario, we might want to throw or handle this gracefully.
      // Returning empty array keeps the UI running.
      return [];
    }
  }
}

// Export a singleton instance
export const humanDetectionService = new HumanDetectionService();
