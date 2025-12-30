
import React, { useRef, useState, useEffect } from 'react';

interface CameraScannerProps {
    onCapture: (base64: string) => void;
    onClose: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
            });
            setStream(s);
            if (videoRef.current) {
                videoRef.current.srcObject = s;
                setIsReady(true);
            }
        } catch (err) {
            console.error("Camera access failed:", err);
            alert("Please grant camera permissions for Smart Scan.");
            onClose();
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const capture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
                onCapture(base64);
                stopCamera();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-2xl aspect-[3/4] bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />

                {/* Scanning Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-[10%] border-2 border-dashed border-bita-gold/50 rounded-2xl"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-bita-red shadow-[0_0_20px_rgba(212,29,36,1)] animate-scanner"></div>

                    <div className="absolute top-8 left-0 right-0 text-center">
                        <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full border border-white/20">
                            Gemma 3 Vision Engaged
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center space-x-12">
                    <button
                        onClick={onClose}
                        className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all"
                    >
                        ✕
                    </button>

                    <button
                        onClick={capture}
                        disabled={!isReady}
                        className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-90 transition-all group"
                    >
                        <div className="w-20 h-20 rounded-full border-4 border-bita-red flex items-center justify-center">
                            <div className="w-16 h-16 bg-bita-red rounded-full group-hover:scale-95 transition-all"></div>
                        </div>
                    </button>

                    <div className="w-16 h-16"></div> {/* Spacer for symmetry */}
                </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <p className="text-white/40 text-xs font-bold mt-8 tracking-widest uppercase">
                Position invoice within the golden frame
            </p>

            <style>{`
        @keyframes scan {
          0% { transform: translateY(-200%); }
          100% { transform: translateY(200%); }
        }
        .animate-scanner {
          animation: scan 3s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default CameraScanner;
