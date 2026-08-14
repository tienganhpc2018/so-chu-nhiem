import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../utils/soundEffects';
import { MascotRobot } from './MascotRobot';
import { X, Mic, MicOff, Volume2, AlertOctagon, ShieldCheck } from 'lucide-react';

export const NoiseMeterModal = ({ isOpen, onClose }) => {
  const [listening, setListening] = useState(false);
  const [volume, setVolume] = useState(0); // 0 -> 100
  const [errorMsg, setErrorMsg] = useState(null);
  const animFrameRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const startListening = async () => {
    try {
      setErrorMsg(null);
      soundFx.playClick();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setVolume(normalized);

        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
      setListening(true);
    } catch (err) {
      console.error('Lỗi kết nối Micro:', err);
      setErrorMsg('Không thể truy cập Microphone. Vui lòng cấp quyền truy cập micro trên trình duyệt.');
      setListening(false);
    }
  };

  const stopListening = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
    }
    setListening(false);
    setVolume(0);
  };

  if (!isOpen) return null;

  const getStatusColor = () => {
    if (volume < 40) return { label: 'Lớp học Yên tĩnh', color: 'text-mint-600', bg: 'bg-mint-500', robot: 'happy' };
    if (volume < 70) return { label: 'Độ ồn Vừa phải', color: 'text-amber-600', bg: 'bg-amber-500', robot: 'thinking' };
    return { label: 'CẢNH BÁO: Quá Ồn Ào!', color: 'text-coral-600 animate-pulse', bg: 'bg-coral-500', robot: 'danger' };
  };

  const status = getStatusColor();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-mint-100 flex flex-col items-center relative">
        
        {/* Close Button */}
        <button
          onClick={() => {
            stopListening();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header & Mascot */}
        <div className="text-center mb-4">
          <div className="inline-flex p-3 bg-mint-50 rounded-full mb-2">
            <MascotRobot mode={status.robot} size={56} />
          </div>
          <h3 className="text-xl font-extrabold text-slate-800 flex items-center justify-center space-x-2">
            <Volume2 className="w-5 h-5 text-mint-600" />
            <span>Đo Độ Ồn Lớp Học Realtime</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Giám sát độ ồn lớp học theo thời gian thực qua Micro</p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="w-full mb-4 p-3 bg-coral-50 border border-coral-200 rounded-2xl text-xs text-coral-700 text-center font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Decibel Display Gauge */}
        <div className="w-full my-4 bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center space-y-4">
          
          <div className="flex items-baseline justify-center space-x-1">
            <span className={`text-6xl font-black ${status.color}`}>
              {listening ? volume : 0}
            </span>
            <span className="text-sm font-bold text-slate-400">dB %</span>
          </div>

          <div className={`text-sm font-extrabold ${status.color}`}>
            {listening ? status.label : 'Micro đang Tắt'}
          </div>

          {/* Progress Bar Gauge */}
          <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden p-0.5 border border-slate-300">
            <div
              className={`h-full rounded-full transition-all duration-100 ${status.bg}`}
              style={{ width: `${listening ? volume : 0}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-1">
            <span>0 dB (Yên lặng)</span>
            <span>50 dB (Thảo luận)</span>
            <span>100 dB (Quá ồn)</span>
          </div>

        </div>

        {/* Action Button */}
        <div className="w-full mt-2">
          {!listening ? (
            <button
              onClick={startListening}
              className="w-full py-3 bg-mint-500 hover:bg-mint-600 text-white font-extrabold text-sm rounded-2xl shadow-mint-glow transition-all flex items-center justify-center space-x-2"
            >
              <Mic className="w-5 h-5" />
              <span>BẬT GIÁM SÁT ĐỘ ỒN</span>
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="w-full py-3 bg-coral-500 hover:bg-coral-600 text-white font-extrabold text-sm rounded-2xl shadow-coral-glow transition-all flex items-center justify-center space-x-2"
            >
              <MicOff className="w-5 h-5" />
              <span>TẮT GIÁM SÁT MICRO</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
