import React from 'react';
import { getShortStudentName } from '../utils/nameHelper';

/**
 * UfoStudentSprite.jsx - Nhân vật học sinh chuẩn theo phong cách ảnh tham chiếu:
 * - Học sinh đồng phục áo sơ mi trắng có cổ, khăn quàng đỏ thắm
 * - Quần soóc xanh tím than (học sinh nam) hoặc váy xòe xếp ly xanh (học sinh nữ)
 * - Mũ lưỡi trai trắng xanh hoặc bím tóc nơ đáng yêu
 * - Khi UFO khóa mục tiêu: đứng quỳ lạy chắp tay xin tha
 * - Khi bị hút: xoay nhào lộn bay vào khoang đĩa bay
 * - Nhãn số thứ tự tròn hoặc nhãn tên sắc nét
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
  scale = 1
}) => {
  const isFacingRight = vx >= 0;
  const fullName = student?.name || student?.full_name || 'Học sinh';
  const displayName = getShortStudentName(fullName, allStudents);
  const studentIndex = student?.seat_col || student?.seat_number || (typeof student?.id === 'number' ? student.id : null);

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
      {/* 1. Bong bóng hội thoại vui nhộn */}
      {speechQuote && !isAbducted && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 pointer-events-none animate-bounce-subtle">
          <div className="relative px-3 py-1 rounded-2xl bg-white text-slate-900 text-[11px] font-black border-2 border-slate-900 shadow-2xl max-w-[220px] text-center leading-tight">
            {speechQuote}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-8 border-t-slate-900" />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-3 border-x-transparent border-t-6 border-t-white" />
          </div>
        </div>
      )}

      {/* 2. Nhãn tên học sinh viền đỏ chữ đỏ nền trắng */}
      {!isAbducted && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap z-40 pointer-events-none">
          <div className="px-2.5 py-0.5 rounded-full bg-white/95 border-2 border-red-500 shadow-md flex items-center justify-center min-w-[48px]">
            <span className="font-black text-[11px] sm:text-xs text-red-600 tracking-wide select-none drop-shadow-xs">
              {displayName}
            </span>
          </div>
        </div>
      )}

      {/* 3. KHUNG XOAY NHÂN VẬT HỌC SINH */}
      <div
        className="relative flex flex-col items-center"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isAbducted ? 'transform 1.6s ease-out' : 'transform 0.25s ease-out'
        }}
      >
        {/* Khung ngắm vàng khi đĩa bay khóa mục tiêu */}
        {isTargeted && (
          <div className="absolute -inset-2.5 border-2 border-amber-400 bg-amber-400/20 rounded-lg animate-pulse pointer-events-none shadow-[0_0_15px_rgba(251,191,36,0.7)]" />
        )}

        {/* THÂN NHÂN VẬT HỌC SINH ĐỒNG PHỤC ÁO TRẮNG KHĂN QUÀNG ĐỎ NHƯ ẢNH THẬT */}
        <div
          className={`relative w-12 sm:w-14 h-18 sm:h-20 flex flex-col items-center ${
            isFacingRight ? 'scale-x-100' : '-scale-x-100'
          }`}
        >
          {/* Đầu / Khuôn mặt hoặc Avatar */}
          <div className="relative w-8 h-8 rounded-full border-2 border-amber-900/30 shadow-sm overflow-hidden bg-amber-100 flex items-center justify-center z-10">
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
                {/* Mắt to tròn phong cách Chibi */}
                <div className="flex items-center space-x-2 mt-2 z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                </div>
                {/* Má hồng */}
                <div className="flex items-center justify-between w-6 -mt-0.5 z-10">
                  <div className="w-1.5 h-0.5 rounded-full bg-rose-400 opacity-80" />
                  <div className="w-1.5 h-0.5 rounded-full bg-rose-400 opacity-80" />
                </div>
                {/* Miệng cười hoặc há hốc kinh ngạc */}
                <div
                  className={`rounded-full bg-rose-600 transition-all ${
                    isTargeted || isAbducted || isFallen ? 'w-2.5 h-2.5 mt-0.5' : 'w-1.5 h-0.5'
                  }`}
                />
              </div>
            )}

            {/* Mũ lưỡi trai trắng xanh cho nam sinh (như ảnh gốc) */}
            {gender === 'male' && !student?.avatar && (
              <div className="absolute -top-1 left-0 right-0 h-3 bg-white border-b-2 border-blue-600 rounded-t-full" />
            )}
          </div>

          {/* Bím tóc hai bên cho nữ sinh (như ảnh gốc) */}
          {gender === 'female' && !student?.avatar && (
            <>
              <div className="absolute -left-1.5 top-2 w-2.5 h-4 bg-slate-900 rounded-full rotate-12" />
              <div className="absolute -right-1.5 top-2 w-2.5 h-4 bg-slate-900 rounded-full -rotate-12" />
            </>
          )}

          {/* ÁO ĐỒNG PHỤC TRẮNG CÓ CỔ VỚI KHĂN QUÀNG ĐỎ THẮM */}
          <div
            className={`relative w-8 bg-white rounded-t-sm border-x border-b border-slate-300 flex flex-col items-center shadow-xs transition-all ${
              isTargeted ? 'h-5' : 'h-6'
            }`}
          >
            {/* Cổ áo trắng */}
            <div className="w-full flex justify-between px-1">
              <div className="w-2 h-1 bg-slate-200 rounded-b-xs" />
              <div className="w-2 h-1 bg-slate-200 rounded-b-xs" />
            </div>

            {/* KHĂN QUÀNG ĐỎ THẮM BUỘC TRƯỚC NGỰC CHUẨN ĐỒNG PHỤC HỌC SINH */}
            <div className="relative -mt-0.5 z-20 flex flex-col items-center">
              <div className="w-3.5 h-1.5 bg-red-600 rounded-sm shadow-xs" />
              {/* Dải đuôi khăn quàng chéo */}
              <div className="w-1.5 h-3 bg-red-600 -mt-0.5 transform -rotate-12 shadow-xs" />
            </div>

            {/* TƯ THẾ QUỲ LẠY XIN THA KHI BỊ KHÓA MỤC TIÊU */}
            {isTargeted ? (
              <div className="absolute -top-1 z-30 flex flex-col items-center animate-bounce">
                <span className="text-base select-none filter drop-shadow-md">🙏</span>
                <span className="text-[7.5px] font-black text-yellow-300 bg-red-950/90 border border-yellow-400/60 px-1 rounded-sm -mt-0.5 whitespace-nowrap shadow-sm">
                  XIN THA!!
                </span>
              </div>
            ) : (
              <>
                {/* Cánh tay áo trắng */}
                <div
                  className={`absolute -left-2 top-0.5 w-2 h-4 bg-white rounded-l-md border-l border-slate-300 transition-transform ${
                    isAbducted ? '-rotate-45 -translate-y-1' : 'rotate-12'
                  }`}
                />
                <div
                  className={`absolute -right-2 top-0.5 w-2 h-4 bg-white rounded-r-md border-r border-slate-300 transition-transform ${
                    isAbducted ? 'rotate-45 -translate-y-1' : '-rotate-12'
                  }`}
                />
              </>
            )}
          </div>

          {/* QUẦN SOÓC XANH HOẶC VÁY XẾP LY XANH ĐỒNG PHỤC */}
          <div className="w-full flex justify-center -mt-0.5">
            {gender === 'female' ? (
              /* Váy xếp ly xanh tím than */
              <div
                className={`w-9 bg-[#1e3a8a] rounded-b-md border border-blue-950 flex justify-around px-0.5 ${
                  isTargeted ? 'h-3' : 'h-4'
                }`}
              >
                <div className="w-0.5 h-full bg-blue-900/60" />
                <div className="w-0.5 h-full bg-blue-900/60" />
                <div className="w-0.5 h-full bg-blue-900/60" />
              </div>
            ) : (
              /* Quần soóc xanh tím than nam */
              <div className="flex items-center space-x-0.5">
                <div className={`w-3.5 bg-[#1e3a8a] rounded-b-xs border border-blue-950 ${isTargeted ? 'h-3' : 'h-4'}`} />
                <div className={`w-3.5 bg-[#1e3a8a] rounded-b-xs border border-blue-950 ${isTargeted ? 'h-3' : 'h-4'}`} />
              </div>
            )}
          </div>

          {/* Đôi chân và giày thể thao trắng */}
          <div className="flex items-center space-x-1 -mt-0.5">
            <div
              className={`bg-[#fed7aa] rounded-b-xs flex flex-col justify-end items-center transition-all ${
                isTargeted ? 'w-2 h-2 rounded-sm' :
                isAbducted ? 'w-2.5 h-4 rotate-12' : 'w-2.5 h-4'
              }`}
            >
              <div className="w-3.5 h-1.5 bg-white border border-slate-400 rounded-full" />
            </div>
            <div
              className={`bg-[#fed7aa] rounded-b-xs flex flex-col justify-end items-center transition-all ${
                isTargeted ? 'w-2 h-2 rounded-sm' :
                isAbducted ? 'w-2.5 h-4 -rotate-12' : 'w-2.5 h-4'
              }`}
            >
              <div className="w-3.5 h-1.5 bg-white border border-slate-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* 4. Huy hiệu số thứ tự tròn màu trắng dưới chân học sinh (như ảnh gốc) */}
        {!isAbducted && (
          <div className="mt-1 w-5 h-5 rounded-full bg-white text-slate-800 text-[10px] font-extrabold flex items-center justify-center border border-slate-300 shadow-sm">
            {studentIndex !== null ? studentIndex : '★'}
          </div>
        )}
      </div>
    </div>
  );
};
