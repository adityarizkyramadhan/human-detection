import React, { useRef, useState, useEffect } from "react";

const CameraView = ({ onVideoReady, width = 640, height = 480 }) => {
  const videoRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width, height, facingMode: "user" },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for metadata to load to ensure dimensions are correct
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            if (onVideoReady) onVideoReady(videoRef);
          };
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setHasPermission(false);
      }
    };

    startWebcam();

    return () => {
      // Cleanup stream
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [width, height, onVideoReady]);

  if (hasPermission === false) {
    return (
      <div className="text-red-500 p-4">
        Camera permission denied or camera not found.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg bg-black">
      {/* Mirror the video for better UX */}
      <video
        ref={videoRef}
        width={width}
        height={height}
        className="block transform -scale-x-100 w-full h-auto"
        playsInline
        muted
      />
      {/* Note: Overlay needs to be mirrored too if we mirror video, or we handle coords.
          TensorFlow detects on the video element directly. If we mirror via CSS, the coords are relative to the original video frame.
          So if we mirror the video visually, the boxes will be drawn correct relative to the video frame,
          BUT if we overlay them on a mirrored element, we need to make sure the overlay container is also mirrored or we flip coordinates.
          Simplest is to wrap both in a div and mirror the container? No, that mirrors text too.
          Better: Mirror the video with CSS. The bbox coordinates from TFJS match the video source.
          If we draw div on top of mirrored video, the div needs to be mirrored too?
          Yes. If video is flipped, left becomes right.
      */}
    </div>
  );
};

export default CameraView;
