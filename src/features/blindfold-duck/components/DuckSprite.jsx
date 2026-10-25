import React from 'react';

export const DuckSprite = ({
  duck,
  x = 0,
  y = 0,
  vx = 1,
  speechQuote = null,
  isCaught = false,
  isTarget = false, // Là mục tiêu cần tìm trong Mode 3
  isBlurMode = false // Khi ở chế độ Dễ, hiển thị sương mờ
}) => {
  const isFacingRight = vx >= 0;
  const name = duck?.name || 'Vịt';

  return (
    <div
      className={`absolute pointer-events-none select-none transition-opacity duration-300 ${
        isCaught ? 'z-40 scale-110' : 'z-20'
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        opacity: isCaught ? 1 : isBlurMode ? 0.75 : 1
      }}
    >
      {/* 1. Bong bóng hội thoại kêu gọi người chơi */}
      {speechQuote && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 pointer-events-none">
          <div className="relative px-3 py-1 rounded-2xl bg-amber-50 text-amber-950 text-[10.5px] font-black border-2 border-amber-500 shadow-xl max-w-[200px] text-center leading-tight">
            <span>{speechQuote}</span>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-amber-500" />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-3 border-x-transparent border-t-5 border-t-amber-50" />
          </div>
        </div>
      )}

      {/* 2. Nhãn tên học sinh viền vàng chữ đỏ/nâu đậm */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap z-40">
        <div
          className={`px-2 py-0.5 rounded-full border shadow-md flex items-center space-x-1 ${
            isTarget
              ? 'bg-red-600 text-yellow-200 border-yellow-300 animate-pulse font-black scale-105'
              : 'bg-white/95 text-amber-950 border-amber-500 font-extrabold'
          }`}
        >
          <span className="text-[9.5px]">🦆</span>
          <span className="text-[11px] tracking-wide">{name}</span>
          {isTarget && <span className="text-[9px] bg-yellow-400 text-red-900 px-1 rounded-xs">MỤC TIÊU!</span>}
        </div>
      </div>

      {/* 3. Hiệu ứng bắt trúng: Ngôi sao văng ra 🎉 */}
      {isCaught && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 animate-bounce">
          <span className="text-xl">✨🎉✨</span>
        </div>
      )}

      {/* 4. Hình ảnh chú vịt hoạt hình đội nón lá */}
      <div
        className={`relative w-11 h-11 flex flex-col items-center transition-transform ${
          isFacingRight ? 'scale-x-100' : 'scale-x-[-1]'
        }`}
      >
        {/* Nón lá dân gian nhỏ xinh trên đầu vịt */}
        <div className="relative z-20 w-8 h-4 flex items-center justify-center -mb-1">
          <div className="w-0 h-0 border-x-[14px] border-x-transparent border-b-[10px] border-b-amber-200 filter drop-shadow-xs" />
          <div className="absolute top-1.5 w-6 h-[1.5px] bg-amber-400 opacity-60 rounded-full" />
        </div>

        {/* Đầu vịt vàng rực rỡ */}
        <div className="relative w-6 h-6 rounded-full bg-yellow-400 border border-amber-500 shadow-xs flex items-center justify-center">
          {/* Mắt chớp lém lỉnh */}
          <div className="absolute top-1.5 right-1 w-1.5 h-1.5 rounded-full bg-slate-900 flex items-center justify-center">
            <div className="w-0.5 h-0.5 rounded-full bg-white -mt-0.5 -ml-0.5" />
          </div>

          {/* Má hồng dễ thương */}
          <div className="absolute bottom-1 right-1.5 w-1.5 h-1 rounded-full bg-rose-400/80" />

          {/* Mỏ vịt cam ngộ nghĩnh */}
          <div className="absolute -right-2 top-2.5 w-3 h-2 bg-orange-500 rounded-r-full border-t border-b border-orange-600 shadow-xs" />
        </div>

        {/* Thân vịt mập mạp & Cánh đập vui nhộn */}
        <div className="relative w-8 h-6 bg-yellow-400 rounded-full border border-amber-500 -mt-1.5 shadow-sm flex items-center justify-between px-1">
          {/* Cánh vịt */}
          <div className="w-3.5 h-3 bg-yellow-300 rounded-full border border-amber-400 transform -rotate-12 animate-pulse" />
          {/* Đuôi vịt vểnh lên */}
          <div className="w-2.5 h-2 bg-yellow-400 rounded-t-sm transform rotate-45 -ml-1" />
        </div>

        {/* Chân màng bơi màu cam bước đi */}
        <div className="flex items-center space-x-1 -mt-0.5">
          <div className="w-2.5 h-1 bg-orange-500 rounded-full" />
          <div className="w-2.5 h-1 bg-orange-500 rounded-full" />
        </div>
      </div>
    </div>
  );
};
