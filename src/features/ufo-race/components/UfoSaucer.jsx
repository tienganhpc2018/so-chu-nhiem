import React, { useEffect, useState } from 'react';

export const UfoSaucer = ({
  capturedCount = 0,
  targetCount = 2,
  isVisible = false, // Chỉ xuất hiện khi giáo viên bấm Bắt đầu
  isBeaming = false,
  targetStudentPos = null,
  containerWidth = 1000,
  countdownSeconds = null
}) => {
  const [lightOffset, setLightOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLightOffset(prev => (prev + 1) % 12);
    }, 160);
    return () => clearInterval(timer);
  }, []);

  const LED_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
    '#f43f5e', '#10b981', '#6366f1', '#d946ef'
  ];

  return (
    <div
      className={`absolute top-2 sm:top-5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30 transition-all duration-1000 ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : '-translate-y-[260%] opacity-0 scale-50'
      }`}
    >
      {/* 1. Tia hút khổng lồ Tractor Beam từ đáy đĩa bay */}
      <div
        className={`absolute top-24 w-[420px] sm:w-[560px] md:w-[700px] h-[78vh] transition-all duration-700 pointer-events-none origin-top ${
          isBeaming && isVisible
            ? 'opacity-85 scale-y-100 filter drop-shadow-[0_0_60px_rgba(34,211,238,0.8)]'
            : 'opacity-0 scale-y-0'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(34,211,238,0.7) 0%, rgba(16,185,129,0.4) 60%, rgba(34,211,238,0.05) 100%)',
          clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)'
        }}
      >
        {/* Các hạt bụi ánh sáng chuyển động trong tia */}
        <div className="w-full h-full relative overflow-hidden">
          {[...Array(14)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-cyan-200 animate-ping opacity-80"
              style={{
                top: `${(i * 13) % 90}%`,
                left: `${25 + ((i * 17) % 50)}%`,
                animationDuration: `${1 + (i % 2)}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* 2. Tia Laser đỏ khóa mục tiêu */}
      {isBeaming && targetStudentPos && (
        <svg
          className="absolute top-24 left-1/2 -translate-x-1/2 w-[1200px] h-[85vh] pointer-events-none z-35"
          style={{ overflow: 'visible' }}
        >
          <line
            x1="600"
            y1="0"
            x2={600 + (targetStudentPos.x - containerWidth / 2)}
            y2={targetStudentPos.y - 45}
            stroke="#ef4444"
            strokeWidth="3.5"
            strokeDasharray="6,4"
            className="animate-pulse"
          />
          <circle
            cx={600 + (targetStudentPos.x - containerWidth / 2)}
            cy={targetStudentPos.y - 45}
            r="18"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
            className="animate-ping"
          />
        </svg>
      )}

      {/* 3. Thân đĩa bay kim loại UFO */}
      <div className="relative z-40 flex flex-col items-center animate-bounce-subtle">
        
        {/* Buồng lái vòm xanh ngọc */}
        <div className="w-24 sm:w-32 h-10 sm:h-12 bg-gradient-to-t from-emerald-500 to-cyan-300 rounded-t-full shadow-[0_0_30px_rgba(52,211,153,0.9)] border-2 border-emerald-300 relative flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-emerald-950/70 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
          </div>
        </div>

        {/* Đĩa kim loại chính với viền bạc */}
        <div className="relative w-72 sm:w-96 md:w-[440px] h-16 sm:h-20 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-700 rounded-full shadow-2xl border-4 border-slate-300 flex items-center justify-center px-4">
          
          {/* Đồng hồ số LED hiển thị tiến độ (hoặc đếm ngược giây hồi hộp) */}
          <div className="z-10 px-5 py-1 sm:py-1.5 rounded-xl bg-black/90 border-2 border-emerald-400/90 shadow-[inset_0_0_15px_rgba(16,185,129,0.8)] flex items-center space-x-2">
            <span className="font-mono font-black text-xl sm:text-2xl tracking-widest text-emerald-400 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]">
              {capturedCount}/{targetCount}
            </span>
            {countdownSeconds !== null && countdownSeconds > 0 && (
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40 animate-pulse">
                {countdownSeconds}s
              </span>
            )}
          </div>

          {/* Dãy đèn LED 12 màu nhấp nháy viền quanh */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-around px-3 sm:px-6 pointer-events-none">
            {LED_COLORS.map((color, idx) => {
              const isActive = (idx + lightOffset) % 2 === 0;
              return (
                <div
                  key={idx}
                  className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full shadow-md transition-all duration-150"
                  style={{
                    backgroundColor: color,
                    boxShadow: isActive ? `0 0 12px ${color}` : 'none',
                    transform: isActive ? 'scale(1.25)' : 'scale(0.85)',
                    opacity: isActive ? 1 : 0.35
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Cửa khoang hút ở đáy (Nơi học sinh bị hút vào TRONG đĩa bay) */}
        <div className="w-36 sm:w-48 h-4 sm:h-5 bg-gradient-to-r from-cyan-400 via-emerald-300 to-cyan-400 rounded-b-full shadow-[0_0_25px_rgba(34,211,238,0.9)] flex items-center justify-center">
          <div className="w-24 h-2 bg-slate-950/95 rounded-full shadow-inner" />
        </div>

      </div>
    </div>
  );
};
