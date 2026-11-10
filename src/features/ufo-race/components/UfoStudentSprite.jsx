import React from 'react';
import { getShortStudentName } from '../utils/nameHelper';

/**
 * UfoStudentSprite.jsx - Gán tên và tương tác trực tiếp lên các vị trí học sinh trên ảnh nền gốc:
 * - Khi bình thường: Chỉ hiển thị nhãn tên học sinh gọn gàng, trang nhã (không đè thêm thân robot hay vẽ đè người)
 * - Khi đĩa bay UFO khóa mục tiêu (isTargeted): Khung ngắm laser vàng rực rỡ + hiệu ứng quỳ lạy "🙏 XIN THA!!"
 * - Khi bị hút (isAbducted): Hiệu ứng luồng sáng và nhãn tên xoay nhào lộn hút thẳng vào trong đĩa bay
 * - Bong bóng thoại hiển thị thanh lịch, không che khuất mặt các bạn khác
 */

export const UfoStudentSprite = ({
  student,
  allStudents = [],
  x,
  y,
  vx,
  isTargeted = false,
  isAbducted = false,
  isFallen = false,
  speechQuote = null,
  gender = 'male',
  rotation = 0,
  opacity = 1,
  scale = 1,
  badgeNumber = null
}) => {
  const fullName = student?.name || student?.full_name || 'Học sinh';
  const displayName = getShortStudentName(fullName, allStudents);

  return (
    <div
      className={`absolute select-none pointer-events-none transition-transform duration-200 ${
        isAbducted ? 'z-50' : isTargeted ? 'z-40' : 'z-30'
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
      {/* 1. Bong bóng hội thoại vui nhộn (ngẫu nhiên nói chuyện) */}
      {speechQuote && !isAbducted && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 pointer-events-none animate-bounce-subtle">
          <div className="relative px-2.5 py-1 rounded-2xl bg-white/95 text-slate-900 text-[10px] sm:text-[11px] font-black border-2 border-slate-900 shadow-xl max-w-[200px] text-center leading-tight">
            {speechQuote}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-8 border-t-slate-900" />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-3 border-x-transparent border-t-6 border-t-white" />
          </div>
        </div>
      )}

      {/* 2. KHUNG HIỆU ỨNG & TÊN HỌC SINH TẬN DỤNG HÌNH ẢNH HỌC SINH GỐC */}
      <div
        className="relative flex flex-col items-center"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isAbducted ? 'transform 1.6s ease-out' : 'transform 0.25s ease-out'
        }}
      >
        {/* Khung ngắm Laser vàng phát sáng khi UFO khóa trúng học sinh */}
        {isTargeted && (
          <div className="absolute -inset-4 border-2 border-amber-400 bg-amber-400/20 rounded-2xl animate-pulse pointer-events-none shadow-[0_0_20px_rgba(251,191,36,0.8)] z-10 flex flex-col items-center justify-between p-1">
            <div className="w-full flex justify-between">
              <div className="w-2 h-2 border-t-2 border-l-2 border-amber-300" />
              <div className="w-2 h-2 border-t-2 border-r-2 border-amber-300" />
            </div>
            <div className="w-full flex justify-between">
              <div className="w-2 h-2 border-b-2 border-l-2 border-amber-300" />
              <div className="w-2 h-2 border-b-2 border-r-2 border-amber-300" />
            </div>
          </div>
        )}

        {/* Biểu tượng xin tha khi bị khóa mục tiêu */}
        {isTargeted && (
          <div className="absolute -top-10 z-50 flex flex-col items-center animate-bounce">
            <span className="text-xl filter drop-shadow-md">🙏</span>
            <span className="text-[8px] font-black text-yellow-300 bg-red-950/90 border border-yellow-400 px-1.5 py-0.5 rounded shadow-sm">
              XIN THA!!
            </span>
          </div>
        )}

        {/* NHÃN TÊN HỌC SINH VIỀN ĐỎ CHỮ ĐỎ NỀN TRẮNG CHUẨN XÁC & GỌN GÀNG */}
        {!isAbducted && (
          <div
            className={`transition-all duration-300 flex flex-col items-center ${
              isTargeted ? 'scale-110 -translate-y-2' : ''
            }`}
          >
            <div
              className={`px-2.5 py-0.5 rounded-full flex items-center justify-center gap-1 shadow-md border-2 transition-all ${
                isTargeted
                  ? 'bg-amber-400 border-red-600 text-red-950 font-black scale-105'
                  : 'bg-white/95 border-red-500 text-red-600 font-extrabold'
              }`}
            >
              {/* Huy hiệu số thứ tự nếu có */}
              {badgeNumber !== null && (
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center">
                  {badgeNumber}
                </span>
              )}
              <span className="text-[11px] sm:text-xs tracking-tight select-none">
                {displayName}
              </span>
            </div>

            {/* Mũi tên định vị nhỏ trỏ thẳng xuống học sinh trong ảnh gốc */}
            <div
              className={`w-0 h-0 border-x-4 border-x-transparent border-t-5 transition-colors ${
                isTargeted ? 'border-t-amber-500' : 'border-t-red-500'
              }`}
            />
          </div>
        )}

        {/* Vệt năng lượng xoáy tròn khi học sinh bị hút lên UFO */}
        {isAbducted && (
          <div className="w-12 h-12 rounded-full border-4 border-cyan-300 border-t-transparent animate-spin flex items-center justify-center bg-cyan-400/20 shadow-[0_0_20px_#22d3ee]">
            <span className="text-sm font-black text-white">✨</span>
          </div>
        )}
      </div>
    </div>
  );
};
