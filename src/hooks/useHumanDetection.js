import { useState, useEffect, useRef, useCallback } from 'react';
import { humanDetectionService } from '../services/humanDetectionService';
import { telegramService } from '../services/telegramService';

/**
 * Custom hook to handle human detection logic.
 * Manages model loading state, errors, and the detection loop.
 *
 * @param {React.RefObject<HTMLVideoElement>} videoRef
 * @returns {Object} { detections, isLoading, error }
 */
export const useHumanDetection = (videoRef) => {
  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  // Ref to control the animation frame loop
  const requestRef = useRef();
  // Ref to track if component is mounted to prevent state updates on unmount
  const isMountedRef = useRef(true);

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
    };
  }, [capturedImage]);

  useEffect(() => {
    isMountedRef.current = true;

    const init = async () => {
      try {
        await humanDetectionService.loadModel();
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      isMountedRef.current = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const detectLoop = useCallback(async () => {
    if (!videoRef.current || isLoading || error) {
      requestRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    // Performance optimization: Check if video is playing
    if (videoRef.current.paused || videoRef.current.ended) {
      requestRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const results = await humanDetectionService.detect(videoRef.current);

    // Check for high confidence detections to send notification
    const highConfidenceHuman = results.find(d => d.score > 0.7);

    // Only proceed if high confidence human detected AND not in cooldown
    if (highConfidenceHuman && !telegramService.isCooldown()) {
      const scorePct = (highConfidenceHuman.score * 100).toFixed(1);

      // Capture frame
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            if (isMountedRef.current) {
              setCapturedImage(url);
            }
            await telegramService.sendPhoto(blob, `🚨 Human Detected! Confidence: ${scorePct}%`);
          }
        }, 'image/jpeg', 0.8);
      } catch (err) {
        console.error("Failed to capture frame for notification", err);
      }
    }

    if (isMountedRef.current) {
      setDetections(results);
      requestRef.current = requestAnimationFrame(detectLoop);
    }
  }, [isLoading, error, videoRef]);

  useEffect(() => {
    if (!isLoading && !error) {
      requestRef.current = requestAnimationFrame(detectLoop);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isLoading, error, detectLoop]);

  return { detections, isLoading, error, capturedImage };
};
