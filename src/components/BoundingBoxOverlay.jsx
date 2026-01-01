import React from 'react';

/**
 * Component to draw bounding boxes around detected objects.
 * 
 * @param {Object} props
 * @param {Array} props.detections - Array of detection objects from TensorFlow.js
 * @param {number} props.width - Width of the video feed
 * @param {number} props.height - Height of the video feed
 */
const BoundingBoxOverlay = ({ detections, width, height, mirrored = false }) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${mirrored ? 'transform -scale-x-100' : ''}`}
    >
      {detections.map((detection, index) => {
        const [x, y, w, h] = detection.bbox;
        const score = (detection.score * 100).toFixed(1);
        
        // Convert to percentages for responsive scaling
        const leftPct = (x / width) * 100;
        const topPct = (y / height) * 100;
        const widthPct = (w / width) * 100;
        const heightPct = (h / height) * 100;

        return (
          <div
            key={index}
            className="absolute border-2 border-red-500 z-10"
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              width: `${widthPct}%`,
              height: `${heightPct}%`,
            }}
          >
            <span 
              className={`absolute -top-7 left-0 bg-red-500 text-white text-xs px-1 py-0.5 rounded ${mirrored ? 'transform -scale-x-100' : ''}`}
              style={{ display: 'inline-block' }} // Needed for transform to work on span
            >
              Human {score}%
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default BoundingBoxOverlay;
