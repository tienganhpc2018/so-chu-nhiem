import React from 'react';

export const UfoStudentSprite = ({
  student,
  x,
  y,
  vx,
  isTargeted = false,
  isAbducted = false,
  speechQuote = null,
  gender = 'male', // 'male' | 'female'
  rotation = 0
}) => {
  const isFacingRight = vx >= 0;

  return (
    <div
      className={`absolute transition-transform select-none z-30 ${
        isAbducted ? 'transition-all duration-1000 ease-in-out' : ''
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${isTargeted ? 1.15 : 1})`,
        transition: isAbducted ? 'all 1.4s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
      }}
    >
      {/* 1. Bong bóng hội thoại học đường vui nhộn */}
      {speechQuote && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 animate-bounce">
          <div className="relative px-3 py-1.5 rounded-2xl bg-white text-slate-800 text-[11px] font-black border-2 border-slate-900 shadow-xl max-w-[200px] text-center leading-tight">
            {speechQuote}
            {/* Đuôi bong bóng thoại */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-8 border-t-slate-900" />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-3 border-x-transparent border-t-6 border-t-white" />
          </div>
        </div>
      )}

      {/* 2. Nhãn tên học sinh viền đỏ chữ đỏ nền trắng (Đặc trưng chuẩn 100% ảnh Thầy gửi) */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap z-40">
        <div className="px-2.5 py-0.5 rounded-full bg-white border border-red-500 shadow-md flex items-center justify-center">
          <span className="font-extrabold text-[10px] sm:text-[11px] text-red-600 tracking-wide">
            {student.name}
          </span>
        </div>
      </div>

      {/* 3. Khung đỏ nhắm mục tiêu khi đĩa bay khóa bắn (Lock-on Bounding Box) */}
      {isTargeted && (
        <div className="absolute -inset-3 border-2 border-red-500 rounded-lg animate-pulse pointer-events-none flex flex-col justify-between">
          <div className="flex justify-between -mt-1 -mx-1">
            <span className="w-2 h-2 border-t-2 border-l-2 border-red-500" />
            <span className="w-2 h-2 border-t-2 border-r-2 border-red-500" />
          </div>
          <span className="text-[8px] font-mono font-bold text-red-500 text-center bg-black/60 rounded px-1 -mt-4">
            MỤC TIÊU
          </span>
          <div className="flex justify-between -mb-1 -mx-1">
            <span className="w-2 h-2 border-b-2 border-l-2 border-red-500" />
            <span className="w-2 h-2 border-b-2 border-r-2 border-red-500" />
          </div>
        </div>
      )}

      {/* 4. Nhân vật học sinh hoạt hình: Đồng phục áo vàng viền đỏ, quần/váy đỏ */}
      <div
        className={`relative w-12 sm:w-14 h-16 sm:h-18 flex flex-col items-center ${
          isFacingRight ? 'scale-x-100' : '-scale-x-100'
        }`}
      >
        {/* Đầu / Khuôn mặt (hoặc ảnh chân dung thật nếu giáo viên đã gắn) */}
        <div className="relative w-8 h-8 rounded-full border-2 border-amber-800/40 shadow-sm overflow-hidden bg-amber-100 flex items-center justify-center">
          {student.avatar || student.avatar_url ? (
            <img
              src={student.avatar || student.avatar_url}
              alt={student.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            /* Mặt hoạt hình chibi dễ thương */
            <div className="w-full h-full relative flex flex-col items-center justify-center bg-[#fed7aa]">
              {/* Tóc */}
              <div
                className={`absolute top-0 w-full h-3.5 bg-slate-900 ${
                  gender === 'female' ? 'rounded-b-sm' : 'rounded-t-full'
                }`}
              />
              {/* Mắt */}
              <div className="flex items-center space-x-2 mt-2 z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              </div>
              {/* Má hồng */}
              <div className="flex items-center justify-between w-6 -mt-0.5 z-10">
                <div className="w-1 h-0.5 rounded-full bg-rose-400 opacity-80" />
                <div className="w-1 h-0.5 rounded-full bg-rose-400 opacity-80" />
              </div>
              {/* Miệng cười/mở to hốt hoảng khi bị hút */}
              <div
                className={`rounded-full bg-rose-600 transition-all ${
                  isTargeted || isAbducted ? 'w-2 h-2 mt-0.5' : 'w-1.5 h-0.5'
                }`}
              />
            </div>
          )}
        </div>

        {/* Thân: Áo thun vàng rực rỡ với cổ đỏ */}
        <div className="relative w-8 h-6 bg-[#facc15] rounded-t-md border-x border-b border-amber-600 flex flex-col items-center shadow-xs">
          {/* Cổ áo đỏ */}
          <div className="w-3.5 h-1.5 bg-[#dc2626] rounded-b-sm" />
          {/* Tay áo vung vẩy */}
          <div className="absolute -left-1.5 top-0.5 w-2 h-4 bg-[#facc15] rounded-l-md rotate-12" />
          <div className="absolute -right-1.5 top-0.5 w-2 h-4 bg-[#facc15] rounded-r-md -rotate-12" />
        </div>

        {/* Chân / Quần đỏ & Giày thể thao */}
        <div className="flex items-center space-x-1 -mt-0.5">
          {/* Chân trái */}
          <div className="w-3 h-5 bg-[#dc2626] rounded-b-xs flex flex-col justify-end items-center">
            <div className="w-3.5 h-1.5 bg-white border border-slate-400 rounded-full" />
          </div>
          {/* Chân phải */}
          <div className="w-3 h-5 bg-[#dc2626] rounded-b-xs flex flex-col justify-end items-center">
            <div className="w-3.5 h-1.5 bg-white border border-slate-400 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
