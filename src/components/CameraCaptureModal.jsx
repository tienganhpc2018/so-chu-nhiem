import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Sparkles, SwitchCamera, AlertCircle } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

/**
 * Modal Chụp Ảnh Chân Dung Trực Tiếp Bằng Webcam / Camera Laptop / Điện Thoại:
 * - Khởi động camera trực tiếp từ trình duyệt qua navigator.mediaDevices
 * - Khung hướng dẫn hình oval để học sinh nhìn vào camera
 * - Chế độ chụp ngay hoặc đếm ngược 3.. 2.. 1.. để học sinh cười tươi
 * - Đổi camera trước / sau nếu dùng trên điện thoại hoặc máy tính bảng
 * - Âm thanh tiếng chụp hình giòn giã
 * - Chụp xong tự động chuyển sang công cụ Căn Chỉnh Khuôn Mặt
 */
export const CameraCaptureModal = ({
  isOpen,
  onClose,
  studentName = 'Học sinh',
  onCaptureImage
}) => {
  const [stream, setStream] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' | 'environment'
  const [errorMsg, setErrorMsg] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Khởi động Camera khi mở modal
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  const startCamera = async (mode) => {
    stopCamera();
    setErrorMsg(null);
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: mode
        },
        audio: false
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Lỗi truy cập camera:', err);
      setErrorMsg('Không thể mở camera. Vui lòng cho phép quyền truy cập camera trên trình duyệt của Thầy/Cô!');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCountdown(null);
  };

  // Đổi camera trước / sau
  const handleToggleFacingMode = () => {
    soundFx.playClick();
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  // Đếm ngược 3s & Chụp
  const handleStartCountdown = () => {
    if (countdown !== null) return;
    soundFx.playClick();
    setCountdown(3);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        soundFx.playClick();
      } else {
        clearInterval(interval);
        setCountdown(null);
        takeSnapshot();
      }
    }, 1000);
  };

  // Chụp ảnh từ Video Stream sang Data URL
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    try {
      setIsCapturing(true);
      soundFx.playCorrect();

      const video = videoRef.current;
      const w = video.videoWidth || 1280;
      const h = video.videoHeight || 720;

      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      // Nếu là camera trước (user), lật gương để ảnh chụp tự nhiên như nhìn gương
      if (facingMode === 'user') {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      setTimeout(() => {
        setIsCapturing(false);
        stopCamera();
        onCaptureImage?.(dataUrl);
      }, 300);
    } catch (err) {
      console.error('Lỗi chụp ảnh:', err);
      setIsCapturing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-5 sm:p-6 shadow-2xl border-4 border-amber-400 flex flex-col items-center max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-200">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest block">
                WEBCAM / CAMERA TRỰC TIẾP
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Chụp Chân Dung: {studentName}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Khung hình Video Live Stream */}
        <div className="relative w-full aspect-4/3 bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-200 shadow-inner flex items-center justify-center my-2">
          {errorMsg ? (
            <div className="p-5 text-center text-rose-300 space-y-2">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <p className="text-xs font-bold leading-relaxed">{errorMsg}</p>
              <button
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black transition-all"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'transform scale-x-[-1]' : ''
                }`}
              />

              {/* Khung Oval hướng dẫn đặt khuôn mặt học sinh */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-48 h-60 rounded-[50%] border-2 border-dashed border-amber-300/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] flex items-center justify-center">
                  <span className="text-[10px] font-black text-amber-200 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    Khuôn mặt học sinh
                  </span>
                </div>
              </div>

              {/* Hiệu ứng chớp sáng khi chụp (Camera Flash) */}
              {isCapturing && (
                <div className="absolute inset-0 bg-white animate-fade-out pointer-events-none z-30" />
              )}

              {/* Đếm ngược 3.. 2.. 1.. */}
              {countdown !== null && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                  <span className="text-8xl font-black text-white animate-ping drop-shadow-2xl">
                    {countdown}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Nút đổi camera trước/sau */}
          <button
            type="button"
            onClick={handleToggleFacingMode}
            className="absolute top-3 right-3 p-2.5 rounded-2xl bg-black/50 hover:bg-black/70 text-white border border-white/20 backdrop-blur-xs active:scale-95 transition-all z-20"
            title="Đổi camera trước / sau"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>
        </div>

        {/* Nút Chụp Hình */}
        <div className="w-full pt-3 mt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black active:scale-95 transition-all"
          >
            Hủy Bỏ
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleStartCountdown}
              disabled={countdown !== null || !!errorMsg}
              className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-2xl text-xs font-black shadow-xs flex items-center space-x-1.5 active:scale-95 transition-all"
            >
              <span>⏱️ Đếm 3s</span>
            </button>

            <button
              type="button"
              onClick={takeSnapshot}
              disabled={countdown !== null || !!errorMsg}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-teal-200 flex items-center space-x-2 active:scale-95 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>CHỤP ẢNH NGAY</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
