import React, { useRef, useState, useCallback } from "react";
import CameraView from "./components/CameraView";
import BoundingBoxOverlay from "./components/BoundingBoxOverlay";
import { useHumanDetection } from "./hooks/useHumanDetection";
import { telegramService } from "./services/telegramService";

function App() {
  // We manage the video ref here to pass it to both the view and the hook
  const videoRef = useRef(null);
  // Increase camera size to 800x600 as requested ("agak diperbesar")
  const [dimensions] = useState({ width: 800, height: 600 });
  const [isPaused, setIsPaused] = useState(false);

  // Custom hook encapsulates all the AI logic
  const { detections, isLoading, error, capturedImage } =
    useHumanDetection(videoRef);

  const handleVideoReady = useCallback((ref) => {
    // When CameraView is ready, it gives us the ref back
    videoRef.current = ref.current;
  }, []);

  const togglePause = () => {
    const newState = !isPaused;
    setIsPaused(newState);
    telegramService.setPaused(newState);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      {/* ⚠️ BIG ALERT BANNER */}
      {detections.length > 0 && (
        <div className="w-full max-w-6xl mb-6 bg-red-600 text-white p-4 rounded-lg shadow-lg animate-pulse flex items-center justify-center gap-4 border-4 border-red-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="text-center">
            <h2 className="text-2xl font-bold uppercase">
              Peringatan Keamanan!
            </h2>
            <p className="font-medium text-lg">
              Anda telah memasuki kawasan CCTV. Wajah Anda telah dikirim ke
              pemilik.
            </p>
          </div>
        </div>
      )}

      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Human Detection System
        </h1>
        <p className="text-gray-600 mt-2">
          Real-time • Privacy-Focused • Telegram Integrated
        </p>
        <button
          onClick={togglePause}
          className={`mt-4 px-6 py-2 rounded-full font-bold shadow-md transition-colors ${
            isPaused
              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isPaused
            ? "⏸️ Telegram Notifications PAUSED"
            : "📡 Telegram Notifications ACTIVE"}
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-7xl">
        {/* Left Column: Camera Feed */}
        <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-black">
          <CameraView
            onVideoReady={handleVideoReady}
            width={dimensions.width}
            height={dimensions.height}
          />

          {/* Overlay for detections */}
          {!isLoading && !error && (
            <BoundingBoxOverlay
              detections={detections}
              width={dimensions.width}
              height={dimensions.height}
              mirrored={true}
            />
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 text-white z-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-white mb-4"></div>
              <p className="font-semibold">Loading COCO-SSD Model...</p>
              <p className="text-xs text-gray-300 mt-2">
                First load may take a few seconds
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 text-red-500 z-20 p-6 text-center">
              <p className="font-bold text-lg">System Error</p>
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Right Column: Evidence / Snapshot */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-2 border-b pb-2">
              Status Sistem
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  detections.length > 0
                    ? "bg-red-500 animate-ping"
                    : "bg-green-500"
                }`}
              ></div>
              <span className="text-sm">
                {detections.length > 0 ? "⚠️ ANCAMAN TERDETEKSI" : "✅ AMAN"}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Manusia Terdeteksi: <strong>{detections.length}</strong>
            </p>
          </div>

          {capturedImage ? (
            <div className="bg-white p-4 rounded-xl shadow-lg border border-red-200 animate-in fade-in slide-in-from-right duration-500">
              <h3 className="font-bold text-red-600 mb-2 flex items-center gap-2">
                <span className="text-xl">📸</span> Bukti Terkirim
              </h3>
              <div className="rounded-lg overflow-hidden border-2 border-red-500 relative">
                <img
                  src={capturedImage}
                  alt="Captured Evidence"
                  className="w-full h-auto"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-xs py-1 px-2 text-center bg-opacity-90">
                  Dikirim ke Telegram Pemilik
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Snapshot diambil otomatis saat deteksi &gt; 70%
              </p>
            </div>
          ) : (
            <div className="bg-gray-100 p-8 rounded-xl border-2 border-dashed border-gray-300 text-center text-gray-400">
              <span className="text-4xl mb-2 block">📷</span>
              <p className="text-sm">
                Menunggu deteksi untuk mengambil bukti...
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-8 text-center text-sm text-gray-500">
        &copy; 2026 Human Detection Security System
      </footer>
    </div>
  );
}

export default App;
