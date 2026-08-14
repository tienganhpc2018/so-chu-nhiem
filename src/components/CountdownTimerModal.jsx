import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { MascotRobot } from './MascotRobot';
import { X, Play, Pause, RotateCcw, Timer as TimerIcon, Bell } from 'lucide-react';

export const CountdownTimerModal = ({ isOpen, onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState(300); // Default 5 mins
  const [totalSeconds, setTotalSeconds] = useState(300);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && secondsLeft === 0) {
      setIsActive(false);
      soundFx.playTimerAlarm();
      confetti({
        particleCount: 50,
        spread: 80
      });
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  if (!isOpen) return null;

  const toggleTimer = () => {
    soundFx.playClick();
    setIsActive(!isActive);
  };

  const resetTimer = (newSec = totalSeconds) => {
    soundFx.playClick();
    setIsActive(false);
    setTotalSeconds(newSec);
    setSecondsLeft(newSec);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const percentage = Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-mint-100 flex flex-col items-center relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex p-3 bg-purple-50 rounded-full mb-2">
            <MascotRobot mode={secondsLeft === 0 ? 'celebrate' : 'thinking'} size={52} />
          </div>
          <h3 className="text-xl font-extrabold text-slate-800 flex items-center justify-center space-x-2">
            <TimerIcon className="w-5 h-5 text-purple-600" />
            <span>Đồng Hồ Đếm Ngược Hoạt Động</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý thời gian thảo luận nhóm, kiểm tra 15p & làm bài tập</p>
        </div>

        {/* Preset Time Buttons */}
        <div className="flex items-center space-x-2 my-2">
          {[
            { label: '1 Phút', sec: 60 },
            { label: '3 Phút', sec: 180 },
            { label: '5 Phút', sec: 300 },
            { label: '10 Phút', sec: 600 },
            { label: '15 Phút', sec: 900 }
          ].map(p => (
            <button
              key={p.sec}
              onClick={() => resetTimer(p.sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                totalSeconds === p.sec
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Circular Display */}
        <div className="my-6 relative flex items-center justify-center">
          <div className="w-48 h-48 rounded-full bg-slate-50 border-8 border-mint-100 flex flex-col items-center justify-center shadow-inner">
            <span className="text-5xl font-black text-slate-800 font-mono tracking-wider">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-xs font-bold text-mint-600 mt-1 uppercase tracking-widest">
              {secondsLeft === 0 ? 'HẾT GIỜ!' : isActive ? 'ĐANG ĐẾM NGƯỢC' : 'TẠM DỪNG'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full flex items-center justify-center space-x-3 mt-2">
          <button
            onClick={() => resetTimer()}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors"
            title="Đặt lại đồng hồ"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`flex-1 py-3 rounded-2xl font-extrabold text-white text-base shadow-lg transition-all flex items-center justify-center space-x-2 ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
                : 'bg-mint-500 hover:bg-mint-600 shadow-mint-glow'
            }`}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isActive ? 'TẠM DỪNG' : 'BẮT ĐẦU ĐẾM'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
