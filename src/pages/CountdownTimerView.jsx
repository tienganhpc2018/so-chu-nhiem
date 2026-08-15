import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { FloatingPiPTimer } from '../components/FloatingPiPTimer';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronUp,
  ChevronDown,
  Check,
  Sparkles,
  BellRing,
  ExternalLink,
  BookOpen,
  ShieldAlert
} from 'lucide-react';

export const CountdownTimerView = () => {
  // Sound & Fullscreen state
  const [hasSound, setHasSound] = useState(true);
  const [last10sTick, setLast10sTick] = useState(true);

  // Timepicker spinner state (Hours, Minutes, Seconds)
  const [inputHours, setInputHours] = useState(0);
  const [inputMinutes, setInputMinutes] = useState(5);
  const [inputSeconds, setInputSeconds] = useState(0);

  // Timer running state
  const [totalSeconds, setTotalSeconds] = useState(300); // Default 5 mins (300s)
  const [initialSeconds, setInitialSeconds] = useState(300);
  const [isRunning, setIsRunning] = useState(false);

  // Theme color palette: 'purple' | 'blue' | 'green' | 'orange' | 'pink'
  const [themeColor, setThemeColor] = useState('purple');

  const timerRef = useRef(null);

  // Feature 3: Exam Mode Toggle
  const [isExamMode, setIsExamMode] = useState(false);

  // Sound soundType selection: 'bell' (Tiếng trống trường) | 'alarm' (Tiếng còi)
  const [alarmType, setAlarmType] = useState('bell');

  // Floating PiP Mode State
  const [showPiP, setShowPiP] = useState(false);

  const themeStyles = {
    purple: {
      ring: 'stroke-purple-600',
      bg: 'bg-purple-600 hover:bg-purple-700',
      glow: 'shadow-purple-glow',
      text: 'text-purple-600',
      badge: 'bg-purple-50 text-purple-900 border-purple-200',
      activeBtn: 'bg-purple-600 text-white'
    },
    blue: {
      ring: 'stroke-blue-600',
      bg: 'bg-blue-600 hover:bg-blue-700',
      glow: 'shadow-md',
      text: 'text-blue-600',
      badge: 'bg-blue-50 text-blue-900 border-blue-200',
      activeBtn: 'bg-blue-600 text-white'
    },
    green: {
      ring: 'stroke-emerald-600',
      bg: 'bg-emerald-600 hover:bg-emerald-700',
      glow: 'shadow-md',
      text: 'text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      activeBtn: 'bg-emerald-600 text-white'
    },
    orange: {
      ring: 'stroke-amber-500',
      bg: 'bg-amber-500 hover:bg-amber-600',
      glow: 'shadow-md',
      text: 'text-amber-600',
      badge: 'bg-amber-50 text-amber-900 border-amber-200',
      activeBtn: 'bg-amber-500 text-white'
    },
    pink: {
      ring: 'stroke-pink-500',
      bg: 'bg-pink-500 hover:bg-pink-600',
      glow: 'shadow-md',
      text: 'text-pink-600',
      badge: 'bg-pink-50 text-pink-900 border-pink-200',
      activeBtn: 'bg-pink-500 text-white'
    }
  };

  const currentTheme = themeStyles[themeColor] || themeStyles.purple;

  // Countdown Interval Loop
  useEffect(() => {
    if (isRunning && totalSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTotalSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            if (hasSound) {
              if (alarmType === 'bell') {
                soundFx.playSchoolBell(); // Feature 2: Deep THCS School Drum
              } else {
                soundFx.playTimerAlarm();
              }
              confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 } });
            }
            return 0;
          }

          if (last10sTick && prev <= 10 && hasSound) {
            soundFx.playWheelTick();
          }

          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, totalSeconds, hasSound, last10sTick, alarmType]);

  // Format Total Seconds to HH:MM:SS or MM:SS
  const formatTimeDisplay = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  };

  // Handle Play/Pause
  const handleTogglePlay = () => {
    if (hasSound) soundFx.playClick();
    if (totalSeconds === 0) {
      setTotalSeconds(initialSeconds);
    }
    setIsRunning(!isRunning);
  };

  // Reset Timer
  const handleResetTimer = () => {
    if (hasSound) soundFx.playClick();
    setIsRunning(false);
    setTotalSeconds(initialSeconds);
  };

  // Add / Subtract Seconds (+30s / -30s)
  const handleAdjustSeconds = (amount) => {
    if (hasSound) soundFx.playClick();
    setTotalSeconds(prev => Math.max(0, prev + amount));
    setInitialSeconds(prev => Math.max(0, prev + amount));
  };

  // Apply Spinner HH:MM:SS Time
  const handleApplySpinnerTime = () => {
    if (hasSound) soundFx.playCorrect();
    const calculated = inputHours * 3600 + inputMinutes * 60 + inputSeconds;
    if (calculated <= 0) return;

    setIsRunning(false);
    setTotalSeconds(calculated);
    setInitialSeconds(calculated);
  };

  // Apply Quick Preset Pill
  const handleApplyPreset = (minutes) => {
    if (hasSound) soundFx.playClick();
    const calculated = minutes * 60;
    setInputHours(Math.floor(minutes / 60));
    setInputMinutes(minutes % 60);
    setInputSeconds(0);

    setIsRunning(false);
    setTotalSeconds(calculated);
    setInitialSeconds(calculated);
  };

  // Fullscreen Toggle
  const handleToggleFullscreen = () => {
    if (hasSound) soundFx.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  // Circular SVG ring progress percentage
  const progressPercent = initialSeconds > 0 ? (totalSeconds / initialSeconds) * 100 : 0;
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in select-none">
      
      {/* HEADER BANNER (Screenshot 1) */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-2xl text-white shadow-md ${currentTheme.bg}`}>
              <Timer className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Đồng Hồ Đếm Ngược
            </h2>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Chọn theme màu và bấm bắt đầu. Hết giờ sẽ có chuông báo!
          </p>
        </div>

        {/* Top Action Controls (Screenshot 1) */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* FEATURE 1: PIP WINDOW BUTTON */}
          <button
            onClick={() => {
              soundFx.playClick();
              setShowPiP(true);
            }}
            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-2xl text-xs font-black flex items-center space-x-1.5 shadow-sm"
          >
            <ExternalLink className="w-4 h-4 text-purple-600" />
            <span>Cửa Sổ Nổi (PiP)</span>
          </button>

          {/* FEATURE 2: SCHOOL BELL SELECTOR */}
          <select
            value={alarmType}
            onChange={(e) => setAlarmType(e.target.value)}
            className="bg-purple-50 border border-purple-200 text-purple-900 text-xs font-black px-3 py-2 rounded-2xl outline-none"
          >
            <option value="bell">🥁 Tiếng Trống Trường THCS</option>
            <option value="alarm">🔔 Tiếng Còi Báo Giờ</option>
          </select>

          <button
            onClick={() => {
              soundFx.playClick();
              setHasSound(!hasSound);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-black border transition-all flex items-center space-x-1.5 ${
              hasSound ? 'bg-purple-50 text-purple-900 border-purple-200' : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {hasSound ? <Volume2 className="w-4 h-4 text-purple-600" /> : <VolumeX className="w-4 h-4" />}
            <span>{hasSound ? 'Có âm' : 'Tắt âm'}</span>
          </button>

          <button
            onClick={handleToggleFullscreen}
            className={`px-4 py-2 text-white rounded-2xl text-xs font-black shadow-md transition-all flex items-center space-x-1.5 ${currentTheme.bg}`}
          >
            <Maximize2 className="w-4 h-4" />
            <span>Toàn màn hình</span>
          </button>
        </div>
      </div>

      {/* FEATURE 3: EXAM MODE BANNER */}
      {isExamMode && (
        <div className="p-4 bg-amber-500 text-purple-950 rounded-3xl font-black text-xs shadow-md flex items-center justify-between animate-pulse">
          <span className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-purple-950" />
            <span>📝 ĐANG TRONG GIỜ LÀM BÀI KIỂM TRA TIẾNG ANH — YÊU CẦU HỌC SINH GIỮ TRẬT TỰ TUYỆT ĐỐI!</span>
          </span>
          <span className="bg-purple-950 text-amber-400 px-3 py-1 rounded-full text-[10px] uppercase">
            TỰ ĐỘNG THU BÀI KHI HẾT GIỜ ★
          </span>
        </div>
      )}

      {/* MAIN 2-COLUMN LAYOUT (Screenshots 1 & 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (7 Cols): CIRCULAR COUNTDOWN CLOCK & CONTROLS (Screenshots 1 & 2) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-purple-100 shadow-soft flex flex-col items-center justify-between text-center min-h-[520px] space-y-6">
          
          {/* CIRCULAR STOPWATCH DISPLAY (Screenshots 1 & 2) */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto flex items-center justify-center my-auto">
            
            {/* SVG Ring Progress Bar */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-slate-100 fill-slate-900"
                strokeWidth="7"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className={`fill-none transition-all duration-500 ${currentTheme.ring}`}
                strokeWidth="7"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Time Text & Status Subtitle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="text-4xl sm:text-5xl font-black tracking-tight font-mono">
                {formatTimeDisplay(totalSeconds)}
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-2">
                {isRunning ? 'ĐANG ĐẾM NGƯỢC' : totalSeconds === 0 ? 'HẾT GIỜ ★' : 'SẴN SÀNG'}
              </span>
            </div>

          </div>

          {/* TIMER CONTROLS ROW (Screenshot 1 & 2: -30s | Reset | Play/Pause | +30s) */}
          <div className="w-full space-y-4">
            
            <div className="flex items-center justify-center space-x-3">
              
              <button
                onClick={() => handleAdjustSeconds(-30)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all"
                title="Trừ 30 giây"
              >
                - 30s
              </button>

              <button
                onClick={handleResetTimer}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all"
                title="Làm mới thời gian"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={handleTogglePlay}
                className={`px-8 py-3.5 text-white font-black text-sm uppercase rounded-2xl transition-all shadow-xl flex items-center space-x-2 transform active:scale-95 ${currentTheme.bg} ${currentTheme.glow}`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-white" />
                    <span>Tạm dừng</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white" />
                    <span>Bắt đầu</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleAdjustSeconds(30)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all"
                title="Cộng 30 giây"
              >
                + 30s
              </button>

            </div>

            {/* Bottom 10s Tick Toggle Switch (Screenshot 1 & 2) */}
            <div className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-600">
              <input
                type="checkbox"
                id="tickCheck"
                checked={last10sTick}
                onChange={(e) => setLast10sTick(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded cursor-pointer"
              />
              <label htmlFor="tickCheck" className="cursor-pointer">
                Tiếng tick cuối 10 giây
              </label>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN (5 Cols): SPINNERS, PRESETS & COLOR PALETTE */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CARD 1: THIẾT LẬP THỜI GIAN (HH:MM:SS SPINNERS - Screenshot 1) */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
            <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-sm pb-2 border-b border-slate-100">
              <Timer className="w-4 h-4 text-purple-600" />
              <span>Thiết Lập Thời Gian</span>
            </div>

            {/* 3 Number Spinners: Hours : Minutes : Seconds */}
            <div className="flex items-center justify-center space-x-4 py-2">
              
              {/* Hours Spinner */}
              <div className="flex flex-col items-center space-y-1">
                <button
                  onClick={() => setInputHours(h => Math.min(23, h + 1))}
                  className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-xl font-black text-slate-800">
                  {inputHours}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase">GIỜ</span>
                <button
                  onClick={() => setInputHours(h => Math.max(0, h - 1))}
                  className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xl font-black text-slate-300 pb-5">:</span>

              {/* Minutes Spinner */}
              <div className="flex flex-col items-center space-y-1">
                <button
                  onClick={() => setInputMinutes(m => Math.min(59, m + 1))}
                  className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-xl font-black text-slate-800">
                  {inputMinutes}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase">PHÚT</span>
                <button
                  onClick={() => setInputMinutes(m => Math.max(0, m - 1))}
                  className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xl font-black text-slate-300 pb-5">:</span>

              {/* Seconds Spinner */}
              <div className="flex flex-col items-center space-y-1">
                <button
                  onClick={() => setInputSeconds(s => Math.min(59, s + 1))}
                  className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-xl font-black text-slate-800">
                  {inputSeconds}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase">GIẤY</span>
                <button
                  onClick={() => setInputSeconds(s => Math.max(0, s - 1))}
                  className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

            </div>

            <button
              onClick={handleApplySpinnerTime}
              className={`w-full py-3 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-1.5 ${currentTheme.bg}`}
            >
              <Check className="w-4 h-4" />
              <span>✓ Áp dụng thời gian này</span>
            </button>
          </div>

          {/* CARD 1: PRESET FAST BUTTONS (Feature 3) */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">⚡ Chọn nhanh phút đếm ngược:</span>
              
              {/* Feature 3: 15m Morning Review Preset */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  const totalSec = 15 * 60;
                  setInitialSeconds(totalSec);
                  setTimeLeft(totalSec);
                  setIsRunning(false);
                }}
                className="px-3 py-1 bg-amber-400 text-purple-950 rounded-xl text-xs font-black shadow-xs hover:scale-105 transition-all flex items-center space-x-1"
              >
                <span>🌅 Truy bài đầu giờ (15p: 06:45 - 07:00)</span>
              </button>
            </div>
            
            {/* CARD 2: MẪU NHANH (10 PRESETS GRID - Screenshot 1 & 2) */}
            <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-sm pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Mẫu Nhanh</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { label: '1 phút', min: 1 },
                { label: '3 phút', min: 3 },
                { label: '5 phút', min: 5 },
                { label: '10 phút', min: 10 },
                { label: '15 phút', min: 15 },
                { label: '20 phút', min: 20 },
                { label: '25 phút', min: 25 },
                { label: '30 phút', min: 30 },
                { label: '45 phút', min: 45 },
                { label: '1 giờ', min: 60 }
              ].map(item => (
                <button
                  key={`preset-${item.min}`}
                  onClick={() => handleApplyPreset(item.min)}
                  className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition-all border ${
                    initialSeconds === item.min * 60
                      ? `${currentTheme.bg} text-white border-transparent shadow-sm`
                      : 'bg-slate-50 hover:bg-purple-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* CARD 3: MÀU SẮC ĐỒNG HỒ & CHẾ ĐỘ BÀI THI (PALETTE PICKER - Screenshot 2) */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-800">🧠 Màu sắc đồng hồ</span>
              
              {/* FEATURE 3: EXAM MODE TOGGLE */}
              <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isExamMode}
                  onChange={(e) => setIsExamMode(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span>📝 Chế độ bài thi</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'purple', name: 'Tím 🟣' },
                { id: 'blue', name: 'Xanh 🔵' },
                { id: 'green', name: 'Lá 🟢' },
                { id: 'orange', name: 'Cam 🟠' },
                { id: 'pink', name: 'Hồng 🌸' }
              ].map(color => (
                <button
                  key={color.id}
                  onClick={() => {
                    soundFx.playClick();
                    setThemeColor(color.id);
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border ${
                    themeColor === color.id
                      ? 'bg-purple-600 text-white border-purple-600 shadow-purple-glow font-black'
                      : 'bg-slate-50 hover:bg-purple-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* FEATURE 1: FLOATING PIP TIMER COMPONENT */}
      <FloatingPiPTimer
        isOpen={showPiP}
        onClose={() => setShowPiP(false)}
        onOpenFullTimer={() => setShowPiP(false)}
      />

    </div>
  );
};
