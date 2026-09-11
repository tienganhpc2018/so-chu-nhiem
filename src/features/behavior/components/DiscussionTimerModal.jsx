import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Timer, Volume2 } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const DiscussionTimerModal = ({
  isOpen,
  onClose
}) => {
  const [initialSeconds, setInitialSeconds] = useState(60);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            soundFx.playTimerAlarm();
            return 0;
          }
          if (prev <= 5) soundFx.playTick();
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  if (!isOpen) return null;

  const handleTogglePlay = () => {
    soundFx.playClick();
    if (secondsLeft === 0) setSecondsLeft(initialSeconds);
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    soundFx.playClick();
    setIsRunning(false);
    setSecondsLeft(initialSeconds);
  };

  const handleSetPreset = (s) => {
    soundFx.playClick();
    setIsRunning(false);
    setInitialSeconds(s);
    setSecondsLeft(s);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progressPercent = ((initialSeconds - secondsLeft) / initialSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border-4 border-violet-500 rounded-[2.5rem] shadow-2xl p-6 text-white flex flex-col items-center justify-between min-h-[460px]">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-violet-800/60">
          <div className="flex items-center space-x-2">
            <Timer className="w-5 h-5 text-violet-400" />
            <h3 className="text-base font-black text-violet-200">ĐỒNG HỒ THẢO LUẬN 60S</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-2xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Circular Timer Display */}
        <div className="relative w-52 h-52 flex items-center justify-center my-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#1e1b4b"
              strokeWidth="7"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#8b5cf6"
              strokeWidth="7"
              strokeDasharray="276.4"
              strokeDashoffset={276.4 - (276.4 * progressPercent) / 100}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-1000"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-5xl font-black text-violet-200 tracking-tight">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
              {isRunning ? 'Đang đếm ngược' : secondsLeft === 0 ? 'Hết Giờ!' : 'Sẵn sàng'}
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-4 gap-2 w-full">
          {[30, 60, 120, 300].map(sec => (
            <button
              key={sec}
              onClick={() => handleSetPreset(sec)}
              className={`py-2 rounded-xl text-xs font-black transition-all border ${
                initialSeconds === sec
                  ? 'bg-violet-600 text-white border-violet-400 shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {sec < 60 ? `${sec}s` : `${sec / 60}p`}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="mt-4 pt-3 border-t border-slate-800 w-full flex items-center justify-center space-x-3">
          <button
            onClick={handleTogglePlay}
            className={`px-8 py-3 rounded-2xl font-black text-sm shadow-xl flex items-center space-x-2 transition-all transform hover:scale-105 active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>TẠM DỪNG</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>BẮT ĐẦU</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl"
            title="Đặt lại"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
