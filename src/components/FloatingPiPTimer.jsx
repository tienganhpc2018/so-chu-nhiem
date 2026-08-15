import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/soundEffects';
import { Timer, X, Play, Pause, RotateCcw, Maximize2 } from 'lucide-react';

export const FloatingPiPTimer = ({ isOpen, onClose, onOpenFullTimer }) => {
  const [totalSeconds, setTotalSeconds] = useState(300);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timerId;
    if (isRunning && totalSeconds > 0) {
      timerId = setInterval(() => {
        setTotalSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerId);
            setIsRunning(false);
            soundFx.playSchoolBell();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [isRunning, totalSeconds]);

  if (!isOpen) return null;

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 text-white rounded-3xl p-4 shadow-2xl border-2 border-purple-500 backdrop-blur-md animate-in slide-in-from-bottom-5 flex items-center space-x-4 max-w-sm">
      
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-black shadow-md">
          <Timer className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase text-purple-300 block">ĐỒNG HỒ NỔI PIP</span>
          <span className="text-2xl font-black font-mono tracking-tight text-white">{formatTime(totalSeconds)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 border-l border-slate-700 pl-3">
        <button
          onClick={() => {
            soundFx.playClick();
            setIsRunning(!isRunning);
          }}
          className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all"
          title={isRunning ? 'Tạm dừng' : 'Bắt đầu'}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onOpenFullTimer?.();
          }}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all"
          title="Mở toàn màn hình"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="p-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl transition-all"
          title="Đóng cửa sổ nổi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
