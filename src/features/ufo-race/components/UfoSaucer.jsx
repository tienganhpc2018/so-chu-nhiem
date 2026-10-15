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
    }, 150);
    return () => clearInterval(timer);
  }, []);

  const LED_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
    '#f43f5e', '#10b981', '#6366f1', '#d946ef'
  ];

  return (
    <div
      className={`absolute top-4 sm:top-7 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30 transition-all duration-1000 ease-out ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : '-translate-y-[280%] opacity-0 scale-50'
      }`}
    >
      {/* 1. Tia hút khổng lồ Tractor Beam phóng từ khoang đáy xuống mặt đất */}
      <div
        className={`absolute top-28 w-[440px] sm:w-[580px] md:w-[720px] h-[78vh] transition-all duration-700 pointer-events-none origin-top ${
          isBeaming && isVisible
            ? 'opacity-85 scale-y-100 filter drop-shadow-[0_0_60px_rgba(34,211,238,0.85)]'
            : 'opacity-0 scale-y-0'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(34,211,238,0.75) 0%, rgba(16,185,129,0.4) 55%, rgba(34,211,238,0.02) 100%)',
          clipPath: 'polygon(32% 0%, 68% 0%, 100% 100%, 0% 100%)'
        }}
      >
        {/* Các hạt bụi ánh sáng chuyển động trong luồng tia */}
        <div className="w-full h-full relative overflow-hidden">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-cyan-100 animate-ping opacity-85"
              style={{
                top: `${(i * 11) % 90}%`,
                left: `${22 + ((i * 19) % 56)}%`,
                animationDuration: `${0.9 + (i % 2)}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* 2. Tia Laser đỏ khóa mục tiêu */}
      {isBeaming && targetStudentPos && (
        <svg
          className="absolute top-28 left-1/2 -translate-x-1/2 w-[1200px] h-[85vh] pointer-events-none z-35"
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
            r="20"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
            className="animate-ping"
          />
        </svg>
      )}

      {/* 3. Đĩa bay UFO 3D Kim Loại Thật Sự (Chuẩn ảnh tham chiếu của Thầy) */}
      <div className="relative z-40 flex flex-col items-center filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.7)] animate-bounce-subtle">
        
        {/* Buồng lái vòm kính ngọc bích 3D với ánh sáng lân tinh */}
        <div className="w-28 sm:w-36 h-12 sm:h-14 bg-gradient-to-t from-teal-500/90 via-emerald-400 to-cyan-200 rounded-t-full shadow-[0_0_35px_rgba(45,212,191,0.9)] border-2 border-teal-200 relative flex items-center justify-center overflow-hidden">
          {/* Vệt bóng phản chiếu ánh sáng trên vòm kính (Glass Reflection) */}
          <div className="absolute top-1 left-4 w-12 sm:w-16 h-3 sm:h-4 bg-white/60 rounded-full blur-[1px] rotate-[-15deg]" />
          
          {/* Phi hành gia người ngoài hành tinh / Đèn mắt robot bên trong */}
          <div className="w-6 h-6 rounded-full bg-emerald-950/80 border border-emerald-400 flex items-center justify-center shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping shadow-[0_0_8px_#34d399]" />
          </div>
        </div>

        {/* Đĩa kim loại 3D viền vát cạnh bóng bẩy */}
        <div
          className="relative w-80 sm:w-[440px] md:w-[500px] h-18 sm:h-22 rounded-full flex items-center justify-center px-4"
          style={{
            background: 'linear-gradient(180deg, #f1f5f9 0%, #cbd5e1 20%, #94a3b8 48%, #475569 80%, #1e293b 100%)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.8), inset 0 3px 6px rgba(255,255,255,0.9), inset 0 -4px 8px rgba(0,0,0,0.6)',
            border: '2px solid #e2e8f0'
          }}
        >
          {/* Vạch sáng ánh kim specular highlight chạy ngang thân đĩa bay */}
          <div className="absolute top-2 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-85" />

          {/* Màn hình LED trung tâm: Số lượng học sinh bị tóm e.g. 0/2 */}
          <div className="z-10 px-5 sm:px-6 py-1.5 sm:py-2 rounded-xl bg-black/90 border-2 border-emerald-400/90 shadow-[inset_0_0_15px_rgba(16,185,129,0.85),0_0_15px_rgba(16,185,129,0.3)] flex items-center space-x-2.5">
            <span className="font-mono font-black text-2xl sm:text-3xl tracking-widest text-emerald-400 filter drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]">
              {capturedCount}/{targetCount}
            </span>
            {countdownSeconds !== null && countdownSeconds > 0 && (
              <span className="text-xs sm:text-sm font-mono font-black text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/50 animate-pulse">
                {countdownSeconds}s
              </span>
            )}
          </div>

          {/* Dãy 12 đèn LED hình cầu 3D phát sáng nhấp nháy viền quanh đĩa bay */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-around px-4 sm:px-8 pointer-events-none">
            {LED_COLORS.map((color, idx) => {
              const isActive = (idx + lightOffset) % 2 === 0;
              return (
                <div
                  key={idx}
                  className="w-3 sm:w-4 h-3 sm:h-4 rounded-full shadow-lg transition-all duration-150 border border-white/40"
                  style={{
                    backgroundColor: color,
                    boxShadow: isActive
                      ? `0 0 14px 4px ${color}, inset 0 1px 2px white`
                      : 'inset 0 1px 2px rgba(0,0,0,0.5)',
                    transform: isActive ? 'scale(1.3)' : 'scale(0.85)',
                    opacity: isActive ? 1 : 0.3
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Khoang bụng hút phản trọng lực ở đáy (Nơi học sinh bị hút vào TRONG đĩa bay) */}
        <div
          className="w-40 sm:w-56 h-5 sm:h-6 rounded-b-full flex items-center justify-center -mt-1 shadow-2xl"
          style={{
            background: 'linear-gradient(180deg, #334155 0%, #0f172a 100%)',
            borderBottom: '2px solid #38bdf8'
          }}
        >
          {/* Lỗ khoang hút sâu thẳm phát ánh sáng xanh */}
          <div className="w-28 sm:w-36 h-2.5 bg-black rounded-full shadow-[inset_0_0_8px_rgba(56,189,248,0.8)] border border-cyan-400/40" />
        </div>

      </div>
    </div>
  );
};
