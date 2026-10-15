import React from 'react';
import { getShortStudentName } from '../utils/nameHelper';

export const UfoStudentSprite = ({
  student,
  allStudents = [],
  x,
  y,
  vx,
  isTargeted = false,
  isAbducted = false,
  isFallen = false, // Ngã nhào trên đường
  speechQuote = null,
  gender = 'male',
  rotation = 0,
  opacity = 1,
  scale = 1
}) => {
  const isFacingRight = vx >= 0;
  const fullName = student?.name || student?.full_name || 'Học sinh';
  const displayName = getShortStudentName(fullName, allStudents);

  return (
    <div
      className={`absolute select-none pointer-events-none ${
        isAbducted ? 'z-20' : isTargeted ? 'z-40' : 'z-30'
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        opacity: opacity,
        transform: `translate(-50%, -50%) scale(${scale})`,
        transition: isAbducted
          ? 'top 1.6s cubic-bezier(0.25, 0.9, 0.35, 1), left 1.6s cubic-bezier(0.25, 0.9, 0.35, 1), transform 1.6s ease-out, opacity 1.4s ease-in'
          : 'none'
      }}
    >
      {/* 1. Bong bóng hội thoại học đường: Luôn thăng bằng nằm ngang trên đầu, KHÔNG GIẬT LẮC */}
      {speechQuote && !isAbducted && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 pointer-events-none">
          <div className="relative px-3 py-1.5 rounded-2xl bg-white text-slate-900 text-[11px] font-black border-2 border-slate-900 shadow-2xl max-w-[220px] text-center leading-tight">
            {speechQuote}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-8 border-t-slate-900" />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-3 border-x-transparent border-t-6 border-t-white" />
          </div>
        </div>
      )}

      {/* 2. Nhãn tên học sinh viền đỏ chữ đỏ nền trắng: LUÔN NẰM NGANG, ĐỨNG YÊN DI CHUYỂN MƯỢT MÀ THEO HS, KHÔNG GIẬT */}
      {!isAbducted && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap z-40 pointer-events-none">
          <div className="px-2.5 py-0.5 rounded-full bg-white border-2 border-red-500 shadow-md flex items-center justify-center min-w-[50px]">
            <span className="font-black text-[11px] sm:text-xs text-red-600 tracking-wide select-none drop-shadow-xs">
              {displayName}
            </span>
          </div>
        </div>
      )}

      {/* 3. KHUNG XOAY NHÂN VẬT HỌC SINH: Nghiêng, ngã, nhào lộn, lơ lửng trong không trung */}
      <div
        className="relative flex flex-col items-center"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isAbducted ? 'transform 1.6s ease-out' : 'transform 0.25s ease-out'
        }}
      >
        {/* Khung ngắm vàng khi đĩa bay khóa mục tiêu */}
        {isTargeted && (
          <div className="absolute -inset-2.5 border-2 border-amber-400 bg-amber-400/15 rounded-lg animate-pulse pointer-events-none shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
        )}

        {/* Thân nhân vật học sinh đồng phục áo vàng viền đỏ, quần/váy đỏ */}
        <div
          className={`relative w-12 sm:w-14 h-16 sm:h-18 flex flex-col items-center ${
            isFacingRight ? 'scale-x-100' : '-scale-x-100'
          }`}
        >
          {/* Đầu / Khuôn mặt hoặc ảnh thật */}
          <div className="relative w-8 h-8 rounded-full border-2 border-amber-800/40 shadow-sm overflow-hidden bg-amber-100 flex items-center justify-center">
            {student?.avatar || student?.avatar_url ? (
              <img
                src={student.avatar || student.avatar_url}
              alt={displayName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
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
              {/* Miệng: há hốc kinh ngạc khi bị hút hoặc nhào lộn */}
              <div
                className={`rounded-full bg-rose-600 transition-all ${
                  isTargeted || isAbducted || isFallen ? 'w-2.5 h-2.5 mt-0.5' : 'w-1.5 h-0.5'
                }`}
              />
            </div>
          )}
        </div>

        {/* Thân: Áo thun vàng rực rỡ với cổ đỏ */}
        <div className={`relative w-8 bg-[#facc15] rounded-t-md border-x border-b border-amber-600 flex flex-col items-center shadow-xs transition-all ${
          isTargeted ? 'h-5' : 'h-6'
        }`}>
          <div className="w-3.5 h-1.5 bg-[#dc2626] rounded-b-sm" />

          {/* TƯ THẾ QUỲ LẠY CHẮP TAY XIN THA LIA LỊA (Chuẩn yêu cầu của Thầy) */}
          {isTargeted ? (
            <div className="absolute -top-1 z-30 flex flex-col items-center animate-bounce">
              <span className="text-base select-none filter drop-shadow-md">🙏</span>
              <span className="text-[7.5px] font-black text-yellow-300 bg-red-950/90 border border-yellow-400/60 px-1 rounded-sm -mt-0.5 whitespace-nowrap shadow-sm">
                XIN THA!!
              </span>
            </div>
          ) : (
            <>
              {/* Tay áo vung vẩy bình thường hoặc hốt hoảng khi nhào lộn */}
              <div
                className={`absolute -left-2 top-0.5 w-2 h-4 bg-[#facc15] rounded-l-md transition-transform ${
                  isAbducted ? '-rotate-45 -translate-y-1' : 'rotate-12'
                }`}
              />
              <div
                className={`absolute -right-2 top-0.5 w-2 h-4 bg-[#facc15] rounded-r-md transition-transform ${
                  isAbducted ? 'rotate-45 -translate-y-1' : '-rotate-12'
                }`}
              />
            </>
          )}
        </div>

        {/* Chân: Quỳ gối khi bị khóa mục tiêu, hoặc quần đỏ & giày thể thao */}
        <div className="flex items-center space-x-1 -mt-0.5">
          <div
            className={`bg-[#dc2626] rounded-b-xs flex flex-col justify-end items-center transition-all ${
              isTargeted ? 'w-3 h-2.5 rounded-sm' :
              isAbducted ? 'w-3 h-5 rotate-12' : 'w-3 h-5'
            }`}
          >
            <div className="w-3.5 h-1.5 bg-white border border-slate-400 rounded-full" />
          </div>
          <div
            className={`bg-[#dc2626] rounded-b-xs flex flex-col justify-end items-center transition-all ${
              isTargeted ? 'w-3 h-2.5 rounded-sm' :
              isAbducted ? 'w-3 h-5 -rotate-12' : 'w-3 h-5'
            }`}
          >
            <div className="w-3.5 h-1.5 bg-white border border-slate-400 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
