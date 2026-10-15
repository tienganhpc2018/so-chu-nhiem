import React, { useEffect, useState } from 'react';

export const UfoSaucer = ({
  capturedCount = 0,
  targetCount = 2,
  isBeaming = false,
  targetStudentPos = null, // { x, y } nếu đang khóa mục tiêu
  containerWidth = 1000
}) => {
  // Chu kỳ đổi màu đèn LED viền đĩa bay
  const [lightOffset, setLightOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLightOffset(prev => (prev + 1) % 12);
    }, 180);
    return () => clearInterval(timer);
  }, []);

  const LED_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
    '#f43f5e', '#10b981', '#6366f1', '#d946ef'
  ];

  return (
    <div className="absolute top-2 sm:top-5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20">
      {/* 1. Tia hút khổng lồ chiếu từ đáy đĩa bay xuống mặt đất */}
      <div
        className={`absolute top-20 w-[420px] sm:w-[540px] md:w-[680px] h-[78vh] transition-all duration-700 pointer-events-none origin-top ${
          isBeaming
            ? 'opacity-85 scale-100 filter drop-shadow-[0_0_50px_rgba(34,211,238,0.7)]'
            : 'opacity-40 scale-95'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(34,211,238,0.65) 0%, rgba(16,185,129,0.35) 60%, rgba(34,211,238,0.05) 100%)',
          clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)'
        }}
      >
        {/* Hiệu ứng các hạt ánh sáng chuyển động trong luồng tia */}
        <div className="w-full h-full relative overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-cyan-200 animate-ping opacity-75"
              style={{
                top: `${(i * 13) % 90}%`,
                left: `${25 + ((i * 17) % 50)}%`,
                animationDuration: `${1 + (i % 2)}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* 2. Tia Laser đỏ nhắm bắn mục tiêu (Lock-on Laser Line) */}
      {isBeaming && targetStudentPos && (
        <svg
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[1200px] h-[85vh] pointer-events-none z-30"
          style={{ overflow: 'visible' }}
        >
          {/* Đường laser đỏ bắn từ đĩa bay thẳng vào vị trí học sinh */}
          <line
            x1="600"
            y1="0"
            x2={600 + (targetStudentPos.x - containerWidth / 2)}
            y2={targetStudentPos.y - 40}
            stroke="#ef4444"
            strokeWidth="3"
            strokeDasharray="6,4"
            className="animate-pulse"
          />
          {/* Tâm ngắm đỏ nhấp nháy trên đầu học sinh */}
          <circle
            cx={600 + (targetStudentPos.x - containerWidth / 2)}
            cy={targetStudentPos.y - 40}
            r="16"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
            className="animate-ping"
          />
        </svg>
      )}

      {/* 3. Đĩa bay UFO kim loại hoành tráng (Chính xác theo mẫu tham chiếu) */}
      <div className="relative z-40 flex flex-col items-center animate-bounce-subtle">
        {/* Nắp buồng lái phát sáng dạng vòm xanh lục */}
        <div className="w-24 sm:w-32 h-10 sm:h-12 bg-gradient-to-t from-emerald-500 to-cyan-300 rounded-t-full shadow-[0_0_25px_rgba(52,211,153,0.8)] border-2 border-emerald-300 relative flex items-center justify-center">
          {/* Bóng người ngoài hành tinh nhỏ xíu hoặc đèn buồng lái */}
          <div className="w-5 h-5 rounded-full bg-emerald-900/60 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          </div>
        </div>

        {/* Đĩa kim loại bạc bóng bẩy */}
        <div className="relative w-72 sm:w-96 md:w-[440px] h-16 sm:h-20 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600 rounded-full shadow-2xl border-4 border-slate-300 flex items-center justify-center px-4">
          
          {/* Bảng đồng hồ LED hiển thị tiến độ số lượng học sinh bị tóm: e.g. "0/2" */}
          <div className="z-10 px-5 py-1 sm:py-1.5 rounded-lg bg-black/85 border-2 border-emerald-400/80 shadow-[inset_0_0_12px_rgba(16,185,129,0.7)] flex items-center justify-center">
            <span className="font-mono font-black text-xl sm:text-2xl tracking-widest text-emerald-400 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]">
              {capturedCount}/{targetCount}
            </span>
          </div>

          {/* Dãy 12 đèn LED nhiều màu nhấp nháy viền quanh đĩa bay */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-around px-3 sm:px-6 pointer-events-none">
            {LED_COLORS.map((color, idx) => {
              const isActive = (idx + lightOffset) % 2 === 0;
              return (
                <div
                  key={idx}
                  className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full shadow-md transition-all duration-150"
                  style={{
                    backgroundColor: color,
                    boxShadow: isActive ? `0 0 10px ${color}` : 'none',
                    transform: isActive ? 'scale(1.2)' : 'scale(0.85)',
                    opacity: isActive ? 1 : 0.4
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Cửa xả động cơ phản trọng lực ở đáy */}
        <div className="w-36 sm:w-48 h-3 sm:h-4 bg-gradient-to-r from-cyan-400 via-emerald-300 to-cyan-400 rounded-b-full shadow-[0_0_20px_rgba(34,211,238,0.9)]" />
      </div>
    </div>
  );
};
