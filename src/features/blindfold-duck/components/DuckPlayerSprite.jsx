import React from 'react';

/**
 * Sprite Người Bịt Mắt Bắt Vịt chuẩn phong cách Dân Gian Việt Nam theo Ảnh 2
 * - Nón lá tre truyền thống
 * - Dải khăn lụa đỏ bịt mắt bay phất phới phía sau
 * - Trang phục bà ba nâu, thắt lưng vải trắng
 * - Tư thế chạy lao người về phía trước, 2 tay vươn ra chộp bắt vịt
 * - Vệt bụi đất hoạt hình khi bước chạy
 */
export const DuckPlayerSprite = ({
  x = 0,
  y = 0,
  direction = 'right', // 'left' | 'right' | 'up' | 'down'
  isCatching = false,
  isWalking = true,
  playerName = 'Bạn (Người Bịt Mắt)'
}) => {
  const isFacingLeft = direction === 'left';

  return (
    <div
      className="absolute pointer-events-none select-none z-30 transition-transform duration-100 ease-out"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -85%) ${isFacingLeft ? 'scaleX(-1)' : 'scaleX(1)'}`
      }}
    >
      {/* 1. Nhãn tên người chơi luôn nằm ngang chuẩn */}
      <div
        className="absolute -top-12 left-1/2 whitespace-nowrap z-50 pointer-events-none"
        style={{ transform: `translateX(-50%) ${isFacingLeft ? 'scaleX(-1)' : 'scaleX(1)'}` }}
      >
        <div className="px-3 py-0.5 rounded-full bg-slate-900/90 text-amber-300 border border-amber-400 shadow-lg flex items-center space-x-1.5 backdrop-blur-xs">
          <span className="text-xs">🙈</span>
          <span className="font-black text-xs tracking-wide">{playerName}</span>
        </div>
      </div>

      {/* 2. Toàn bộ cơ thể người chơi theo phong cách 3D hoạt hình dân gian (Ảnh 2) */}
      <div className="relative w-20 h-24 flex flex-col items-center">
        {/* NÓN LÁ DÂN GIAN VIỆT NAM (Đội trên đầu) */}
        <div className="relative z-30 -mb-2 filter drop-shadow-md">
          {/* Hình nón lá */}
          <div className="w-0 h-0 border-x-[28px] border-x-transparent border-b-[20px] border-b-[#d7ba89] transform rotate-[-3deg]" />
          {/* Các nan tre viền nón */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-[#bfa26f] opacity-80" />
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-[#bfa26f] opacity-80" />
          {/* Chóp nón */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-1 bg-[#a6824b] rounded-t-full" />
        </div>

        {/* ĐẦU & KHĂN LỤA ĐỎ BỊT MẮT RỘNG */}
        <div className="relative z-20 w-11 h-11 rounded-full bg-[#fbd38d] border border-[#d69e2e] shadow-sm flex items-center justify-center -mt-1">
          {/* Tóc đen hai bên */}
          <div className="absolute top-0 w-full h-3 bg-slate-900 rounded-t-full" />

          {/* DẢI KHĂN LỤA ĐỎ BỊT MẮT BẢN TO (Chuẩn 100% Ảnh 2) */}
          <div className="absolute top-2.5 -left-1.5 w-14 h-4 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 rounded-xs shadow-md z-30 flex items-center justify-center">
            {/* Vạt nơ lụa đỏ bay phất phới phía sau đầu */}
            <div className="absolute -left-3.5 top-0.5 w-4 h-2.5 bg-red-700 rounded-sm transform -rotate-15 shadow-xs animate-pulse" />
            <div className="absolute -left-5 top-1.5 w-3.5 h-2 bg-red-800 rounded-sm transform rotate-10 shadow-xs" />
            {/* Chữ BỊT MẮT vàng nhỏ xíu */}
            <span className="text-[7.5px] font-black text-amber-200 tracking-tighter">BỊT MẮT</span>
          </div>

          {/* Mũi & Miệng cười tập trung */}
          <div className="absolute bottom-2 left-6 w-2 h-1.5 bg-amber-800/80 rounded-full" />
          <div className="absolute bottom-1 left-5 w-3 h-1 bg-rose-600 rounded-b-full" />
        </div>

        {/* THÂN ÁO BÀ BA NÂU & THẮT LƯNG VẢI TRẮNG (Chuẩn 100% Ảnh 2) */}
        <div className="relative z-10 w-12 h-9 bg-[#6b4c35] rounded-t-md border-t border-[#8c6547] flex flex-col items-center shadow-md">
          {/* Cổ áo & vạt áo chéo */}
          <div className="w-4 h-2 bg-[#4a3323] rounded-b-sm" />

          {/* ĐAI LƯNG VẢI TRẮNG BUỘC GỌN PHÍA SAU LƯNG (Theo Ảnh 2) */}
          <div className="absolute bottom-0 w-full h-2.5 bg-[#f1f5f9] border-y border-slate-300 flex items-center justify-start pl-1">
            {/* Dải nơ trắng buông rủ */}
            <div className="w-1.5 h-3 bg-slate-200 rounded-b-xs transform rotate-12 shadow-xs" />
          </div>

          {/* CÁNH TAY ÁO BÀ BA NÂU VƯƠN VỀ PHÍA TRƯỚC VỒ BẮT VỊT */}
          {/* Tay phải (xa hơn) */}
          <div
            className={`absolute -right-3 top-2 w-7 h-3.5 bg-[#5e3f28] rounded-full transform rotate-[-15deg] shadow-sm origin-left transition-all ${
              isCatching ? 'scale-x-125 rotate-[-5deg]' : ''
            }`}
          >
            {/* Bàn tay da giơ 5 ngón vồ bắt */}
            <div className="absolute -right-2 -top-0.5 w-3.5 h-4 bg-[#fbd38d] rounded-md border border-[#d69e2e] flex items-center justify-center">
              <span className="text-[10px] select-none">✋</span>
            </div>
          </div>

          {/* Tay trái (gần hơn) */}
          <div
            className={`absolute -right-1 top-4 w-8 h-4 bg-[#6b4c35] rounded-full transform rotate-[-25deg] shadow-md origin-left z-20 transition-all ${
              isCatching ? 'scale-x-130 rotate-[-10deg]' : ''
            }`}
          >
            {/* Bàn tay da giơ 5 ngón vồ bắt */}
            <div className="absolute -right-2.5 -top-0.5 w-4 h-4.5 bg-[#fbd38d] rounded-md border border-[#d69e2e] flex items-center justify-center">
              <span className="text-[11px] select-none">✋</span>
            </div>
          </div>
        </div>

        {/* QUẦN NÂU XẮN GẤU & 2 CHÂN CHẠY LAO VỀ PHÍA TRƯỚC (Chuẩn Ảnh 2) */}
        <div className="relative w-12 h-6 flex justify-center items-start -mt-0.5 z-10">
          {/* Chân sau (bước sải đẩy đà) */}
          <div
            className={`absolute left-1 top-0 w-4 h-6 bg-[#4a3323] rounded-sm transform rotate-[-35deg] origin-top transition-transform ${
              isWalking ? 'rotate-[-45deg]' : ''
            }`}
          >
            {/* Gấu quần xắn */}
            <div className="absolute bottom-1 w-full h-1 bg-[#6b4c35]" />
            {/* Bàn chân trần chạm đất */}
            <div className="absolute -bottom-1 -left-1 w-4 h-2 bg-[#fbd38d] rounded-full" />
          </div>

          {/* Chân trước (khuỵu gối bước tới) */}
          <div
            className={`absolute right-2 top-0 w-4 h-6 bg-[#5e3f28] rounded-sm transform rotate-[25deg] origin-top transition-transform ${
              isWalking ? 'rotate-[35deg]' : ''
            }`}
          >
            {/* Gấu quần xắn */}
            <div className="absolute bottom-1 w-full h-1 bg-[#6b4c35]" />
            {/* Bàn chân trần lao tới */}
            <div className="absolute -bottom-1 -right-1 w-4 h-2 bg-[#fbd38d] rounded-full" />
          </div>
        </div>

        {/* VỆT BỤI ĐẤT PHÍA SAU CHÂN (Tạo cảm giác đang chạy hăng say) */}
        {isWalking && (
          <div className="absolute -bottom-1 -left-3 flex items-center space-x-1 opacity-70 pointer-events-none">
            <div className="w-2.5 h-1.5 bg-[#d7ba89] rounded-full animate-ping" />
            <div className="w-3.5 h-2 bg-[#c49a5b] rounded-full blur-[0.5px]" />
          </div>
        )}
      </div>
    </div>
  );
};
