import React from 'react';

export const DuckPlayerSprite = ({
  x = 0,
  y = 0,
  direction = 'down', // 'left' | 'right' | 'up' | 'down'
  isCatching = false,
  isWalking = false,
  playerName = 'Bạn (Người Bịt Mắt)'
}) => {
  const isFacingLeft = direction === 'left';
  const isFacingUp = direction === 'up';

  return (
    <div
      className="absolute pointer-events-none select-none z-30 transition-transform duration-75"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* 1. Nhãn tên người chơi */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-40">
        <div className="px-2.5 py-0.5 rounded-full bg-slate-900/90 text-amber-300 border border-amber-400/80 shadow-md flex items-center space-x-1">
          <span className="text-[10px]">🙈</span>
          <span className="font-black text-[11px] tracking-wide">{playerName}</span>
        </div>
      </div>

      {/* 2. Thân nhân vật người chơi dân gian bịt mắt */}
      <div
        className={`relative w-12 h-16 flex flex-col items-center ${
          isFacingLeft ? 'scale-x-[-1]' : 'scale-x-100'
        }`}
      >
        {/* Đầu & Khăn lụa đỏ bịt mắt */}
        <div className="relative w-8 h-8 rounded-full bg-[#fde047] border-2 border-amber-800/40 shadow-sm overflow-visible flex items-center justify-center">
          {/* Tóc */}
          <div className="absolute top-0 w-full h-3 bg-slate-900 rounded-t-full" />

          {/* DẢI KHĂN LỤA ĐỎ BỊT MẮT ĐẶC TRƯNG DÂN GIAN */}
          <div className="absolute top-2.5 -left-1 w-10 h-3 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 rounded-xs shadow-md z-20 flex items-center justify-center">
            {/* Vạt nơ khăn lụa bay phất phới phía sau */}
            <div className="absolute -right-2 top-0 w-2.5 h-4 bg-red-700 rounded-sm transform rotate-25 shadow-xs" />
            <div className="absolute -right-3 top-1 w-2 h-3.5 bg-red-800 rounded-sm transform -rotate-15 shadow-xs" />
            <span className="text-[7.5px] font-black text-amber-200 tracking-tighter">BỊT MẮT</span>
          </div>

          {/* Mũi & Miệng cười tập trung */}
          <div className="absolute bottom-1 w-1.5 h-1 bg-amber-800 rounded-full" />
        </div>

        {/* Thân áo bà ba truyền thống màu xanh lam */}
        <div className="relative w-8 h-6 bg-cyan-700 rounded-t-sm border-x border-b border-cyan-900 flex flex-col items-center shadow-xs">
          {/* Cúc áo */}
          <div className="w-1 h-1 bg-white rounded-full mt-1 opacity-80" />
          <div className="w-1 h-1 bg-white rounded-full mt-1 opacity-80" />

          {/* Hai tay giơ ra phía trước mò mẫm bắt vịt */}
          <div
            className={`absolute -left-3 top-1 w-3.5 h-3.5 bg-[#fde047] rounded-full border border-amber-800/40 shadow-xs transition-all ${
              isCatching
                ? 'translate-x-2 -translate-y-1 scale-125 bg-amber-300'
                : isWalking
                ? 'animate-pulse'
                : ''
            }`}
          >
            <div className="text-[9px] -mt-1 -ml-0.5 select-none">✋</div>
          </div>

          <div
            className={`absolute -right-3 top-1 w-3.5 h-3.5 bg-[#fde047] rounded-full border border-amber-800/40 shadow-xs transition-all ${
              isCatching
                ? '-translate-x-2 -translate-y-1 scale-125 bg-amber-300'
                : isWalking
                ? 'animate-pulse'
                : ''
            }`}
          >
            <div className="text-[9px] -mt-1 -ml-0.5 select-none">✋</div>
          </div>
        </div>

        {/* Quần nâu dân gian & Chân bước đi */}
        <div className="flex items-center space-x-1 -mt-0.5">
          <div
            className={`w-3.5 h-4 bg-amber-950 rounded-b-xs transition-transform ${
              isWalking ? 'translate-y-0.5' : ''
            }`}
          >
            <div className="w-3.5 h-1 bg-slate-800 rounded-full mt-3" />
          </div>
          <div
            className={`w-3.5 h-4 bg-amber-950 rounded-b-xs transition-transform ${
              isWalking ? '-translate-y-0.5' : ''
            }`}
          >
            <div className="w-3.5 h-1 bg-slate-800 rounded-full mt-3" />
          </div>
        </div>
      </div>
    </div>
  );
};
