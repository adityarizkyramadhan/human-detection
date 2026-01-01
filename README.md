# Human Detection (Privacy-First)

A lightweight, real-time human detection application using TensorFlow.js and COCO-SSD model. Runs entirely in the browser (Client-Side), ensuring zero server costs and maximum privacy.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- NPM

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. Allow camera access when prompted.

### Run via Docker
```bash
docker run -d -p 3000:3000 \
  -e BOT_TOKEN="your-telegram-bot-token" \
  -e CHAT_ID="your-telegram-chat-id" \
  username_dockerhub/human-detection:latest
```

## 🏗 Architecture (Clean Architecture)

This project follows a clean, separation-of-concerns approach:

- **`src/services/`**: Contains `HumanDetectionService`. Handles all TensorFlow.js logic (loading model, inference). Isolate external AI dependencies here.
- **`src/hooks/`**: Contains `useHumanDetection`. A Custom Hook acting as a controller. Manages state (loading, error, results) and the detection loop.
- **`src/components/`**: Pure UI components (`CameraView`, `BoundingBoxOverlay`). They don't know about AI logic, just display data.
- **`src/App.jsx`**: Main composition root.

## 🔒 Privacy & Performance

- **Zero Server Cost**: No backend required.
- **Low Latency**: Detection happens locally on the user's device via WebGL.
- **Privacy**: No video data is ever sent to a server.

## 🛠 Tech Stack
- **Frontend**: React + Vite
- **AI/ML**: TensorFlow.js + COCO-SSD (Lite MobileNet V2)
- **Styling**: Tailwind CSS
