
import React, { useRef, useState, useCallback } from 'react';
import { analyzeFridgeImage } from '../services/geminiService';

interface FridgeScannerProps {
  onScanComplete: (ingredients: string[]) => void;
}

const FridgeScanner: React.FC<FridgeScannerProps> = ({ onScanComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;
    setIsAnalyzing(true);
    setError(null);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      const base64 = dataUrl.split(',')[1];

      try {
        const ingredients = await analyzeFridgeImage(base64);
        onScanComplete(ingredients);
      } catch (err) {
        setError("AI failed to recognize ingredients. Try again.");
      } finally {
        setIsAnalyzing(false);
        // Stop camera
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setIsCameraActive(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center">
      <div className="mb-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          📸
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Scan Your Fridge</h2>
        <p className="text-slate-500 mt-2">Take a photo of your open fridge to discover recipes.</p>
      </div>

      {isCameraActive ? (
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-6 group">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 border-2 border-emerald-500/50 pointer-events-none animate-pulse"></div>
          <button
            onClick={captureAndAnalyze}
            disabled={isAnalyzing}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-8 py-3 rounded-full font-bold shadow-2xl hover:bg-emerald-50 transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? "Analyzing..." : "Capture Photo"}
          </button>
        </div>
      ) : (
        <button
          onClick={startCamera}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all text-lg"
        >
          Open Camera
        </button>
      )}

      {error && <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>}
    </div>
  );
};

export default FridgeScanner;
