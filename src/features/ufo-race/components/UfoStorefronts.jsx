import React from 'react';

/**
 * UfoStorefronts.jsx - Thiết kế 9 gian hàng phố thị Việt Nam chân thực, sống động, đặc trưng từng loại:
 * 1. TRẠM XE BUÝT: Mái vòm kim loại, bảng điện tử LED chạy tuyến, băng ghế chờ, biển dừng xe buýt.
 * 2. NHÀ SÁCH TUỔI THƠ: Mái ngói dốc, tủ kính sách nhiều tầng truyện tranh, ban công hoa, biển gỗ ấm áp.
 * 3. TIỆM CƠM TẤM ĐÊM: Mái tôn lượn sóng, lò nướng than bốc khói nghi ngút, biển hiệu cam cháy retro, đĩa sườn bì chả.
 * 4. TIỆM BÁNH MÌ GIÒN: Mái bạt sọc đỏ-vàng, xe đẩy tủ kính bánh mì que vàng rụm, ngăn pate chả lụa.
 * 5. QUÁN TRÀ SỮA TRÂN CHÂU: Phong cách mint pastel, mô hình ly trà sữa trân châu khổng lồ có ống hút, đèn neon sáng lấp lánh.
 * 6. TIỆM HỚT TÓC (BARBER SHOP): Cột đèn xoay Barber Pole 3 màu (đỏ-trắng-xanh) xoay liên tục, gương kính viền LED.
 * 7. QUÁN BÚN CHẢ HÀ NỘI: Tường vàng Hội An, mái ngói âm dương rêu phong, mẹt tre sợi bún, vỉ chả nướng than hoa, đèn lồng đỏ.
 * 8. TIỆM KEM TƯƠI Ý: Mái vòm sọc hồng-trắng baby, mô hình kem ốc quế 3 tầng xoắn màu sắc phát sáng trên nóc.
 * 9. CỬA HÀNG ĐIỆN THOẠI: Mặt tiền kính showroom công nghệ cao, đèn neon cyan, bục trưng bày smartphone 5G.
 */

export const UfoStorefronts = () => {
  return (
    <div className="relative w-full h-[52%] max-h-[320px] flex items-end justify-between px-2 sm:px-6 z-10">
      {/* CSS Nhúng cho các hiệu ứng chuyển động chân thực: Cột đèn Barber xoay, khói lò than bốc lên, đèn neon nhấp nháy */}
      <style>{`
        @keyframes ufoBarberPole {
          0% { background-position: 0 0; }
          100% { background-position: 0 60px; }
        }
        .animate-barber-pole {
          background: repeating-linear-gradient(
            -45deg,
            #ef4444,
            #ef4444 8px,
            #ffffff 8px,
            #ffffff 16px,
            #3b82f6 16px,
            #3b82f6 24px,
            #ffffff 24px,
            #ffffff 32px
          );
          background-size: 100% 60px;
          animation: ufoBarberPole 2s linear infinite;
        }

        @keyframes ufoSmoke {
          0% { transform: translateY(0) scale(0.6); opacity: 0.8; }
          50% { transform: translateY(-14px) scale(1.1) translateX(3px); opacity: 0.5; }
          100% { transform: translateY(-28px) scale(1.6) translateX(-4px); opacity: 0; }
        }
        .animate-bbq-smoke-1 {
          animation: ufoSmoke 2.2s ease-out infinite;
        }
        .animate-bbq-smoke-2 {
          animation: ufoSmoke 2.6s ease-out infinite 0.7s;
        }
        .animate-bbq-smoke-3 {
          animation: ufoSmoke 2.0s ease-out infinite 1.3s;
        }

        @keyframes ufoNeonBlink {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px currentColor); }
          50% { opacity: 0.82; filter: drop-shadow(0 0 3px currentColor); }
        }
        .animate-neon-glow {
          animation: ufoNeonBlink 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* 1. TRẠM XE BUÝT HIỆN ĐẠI (Bus Stop) */}
      <div className="relative flex-1 mx-1 h-[78%] flex flex-col justify-end min-w-[70px]">
        {/* Mái che vòm kim loại uốn cong màu xanh kim loại */}
        <div className="relative w-full h-7 bg-gradient-to-r from-sky-600 via-sky-400 to-sky-700 rounded-t-2xl shadow-lg border-b-2 border-sky-300 flex items-center justify-center">
          <div className="text-[9px] font-black tracking-wider text-white uppercase flex items-center space-x-1">
            <span>🚌</span>
            <span className="hidden sm:inline">BUS STOP</span>
          </div>
        </div>

        {/* Thân nhà chờ kính trong suốt & bảng điện tử LED tuyến xe */}
        <div className="relative w-full flex-1 bg-sky-950/40 backdrop-blur-xs border-x-2 border-sky-400/40 flex flex-col justify-between p-1.5 shadow-inner">
          {/* Bảng LED điện tử ma trận màu hổ phách */}
          <div className="w-full py-0.5 px-1 bg-black rounded border border-amber-500/60 flex items-center justify-between overflow-hidden">
            <span className="text-[8px] font-mono font-bold text-amber-400 animate-pulse whitespace-nowrap">
              08: B.THÀNH ⇄ ĐHQG
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          {/* Vách kính dán lộ trình & áp phích giao thông */}
          <div className="my-auto grid grid-cols-2 gap-1 opacity-80">
            <div className="h-9 bg-sky-200/20 rounded border border-sky-300/30 p-0.5 flex flex-col justify-around">
              <div className="w-full h-1 bg-sky-400/60 rounded" />
              <div className="w-3/4 h-1 bg-amber-400/60 rounded" />
              <div className="w-1/2 h-1 bg-emerald-400/60 rounded" />
            </div>
            <div className="h-9 bg-slate-800/40 rounded border border-slate-600/30 flex items-center justify-center text-center">
              <span className="text-[7px] text-sky-200 font-semibold leading-tight">VÉ HSSV 3K</span>
            </div>
          </div>

          {/* Băng ghế chờ kim loại màu bạc & Biển hiệu cột tròn */}
          <div className="w-full flex items-center justify-between pt-1 border-t border-sky-400/30">
            <div className="w-10 sm:w-14 h-2.5 bg-slate-300 rounded shadow-sm border border-slate-400 flex justify-around items-center">
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-xs" />
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-xs" />
            </div>
            {/* Cột biển tròn dừng đón xe buýt */}
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-blue-600 border border-white text-white flex items-center justify-center text-[8px] font-black shadow-md">
                🚏
              </div>
              <div className="w-0.5 h-3 bg-slate-400" />
            </div>
          </div>
        </div>

        {/* Bảng tên dưới chân */}
        <div className="w-full py-1 text-center font-black text-[9px] sm:text-[10px] text-white bg-sky-700 rounded-b-md shadow-md uppercase tracking-wider">
          XE BUÝT
        </div>
      </div>

      {/* 2. NHÀ SÁCH TUỔI THƠ (Bookstore) */}
      <div className="relative flex-1 mx-1 h-[88%] flex flex-col justify-end min-w-[70px]">
        {/* Mái ngói dốc ngói xanh ngọc cổ điển có viền gỗ */}
        <div className="relative w-full h-6 bg-gradient-to-r from-emerald-800 via-emerald-600 to-emerald-900 rounded-t-lg shadow-md border-b-2 border-amber-600 flex items-center justify-center">
          <div className="w-full flex justify-around px-2 opacity-50">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-2 h-4 border-r border-emerald-950/60" />
            ))}
          </div>
          <span className="absolute text-[8px] font-black text-amber-200 tracking-wider">TUỔI THƠ</span>
        </div>

        {/* Tầng 2: Ban công cửa sổ gỗ ấm áp */}
        <div className="relative w-full h-11 bg-amber-50 border-x border-amber-300 flex items-center justify-around px-1.5 pt-1">
          <div className="relative w-6 h-7 bg-amber-200/90 rounded-t-md border border-amber-500/50 flex flex-col items-center justify-end shadow-sm">
            <div className="w-full h-2.5 bg-amber-800/80 rounded-t-xs" />
            {/* Chậu hoa nhỏ ở bậu cửa */}
            <div className="w-5 h-2 bg-rose-500 rounded-full mb-0.5 flex justify-center items-center text-[6px]">
              🌸
            </div>
          </div>
          <div className="relative w-6 h-7 bg-amber-200/90 rounded-t-md border border-amber-500/50 flex flex-col items-center justify-end shadow-sm">
            <div className="w-full h-2.5 bg-amber-800/80 rounded-t-xs" />
            <div className="w-5 h-2 bg-amber-500 rounded-full mb-0.5 flex justify-center items-center text-[6px]">
              🌼
            </div>
          </div>
        </div>

        {/* Tầng 1: Tủ kính lớn trưng bày kệ sách nhiều tầng rực rỡ */}
        <div className="relative w-full flex-1 bg-amber-100/90 border-x border-amber-300 p-1.5 flex flex-col justify-around shadow-inner">
          <div className="w-full h-4 bg-emerald-950/20 rounded border border-emerald-600/30 flex items-center px-1 space-x-1">
            <div className="w-2 h-3 bg-red-500 rounded-xs shadow-xs" title="Conan" />
            <div className="w-2.5 h-3.5 bg-blue-500 rounded-xs shadow-xs" title="Doraemon" />
            <div className="w-2 h-3 bg-amber-500 rounded-xs shadow-xs" />
            <div className="w-2.5 h-3.5 bg-purple-500 rounded-xs shadow-xs" />
            <div className="w-2 h-3 bg-emerald-500 rounded-xs shadow-xs" />
          </div>
          <div className="w-full h-4 bg-emerald-950/20 rounded border border-emerald-600/30 flex items-center px-1 space-x-1">
            <div className="w-2.5 h-3 bg-indigo-500 rounded-xs shadow-xs" />
            <div className="w-2 h-3.5 bg-yellow-500 rounded-xs shadow-xs" />
            <div className="w-2.5 h-3 bg-pink-500 rounded-xs shadow-xs" />
            <div className="w-2 h-3 bg-cyan-500 rounded-xs shadow-xs" />
          </div>
        </div>

        {/* Biển hiệu gỗ cổ điển */}
        <div className="w-full py-1 text-center font-black text-[9px] sm:text-[10px] text-white bg-emerald-700 rounded-b-md shadow-md uppercase tracking-wider flex items-center justify-center space-x-1">
          <span>📚</span>
          <span>NHÀ SÁCH</span>
        </div>
      </div>

      {/* 3. TIỆM CƠM TẤM ĐÊM (Broken Rice Eatery) */}
      <div className="relative flex-1 mx-1 h-[84%] flex flex-col justify-end min-w-[70px]">
        {/* Mái tôn lượn sóng màu nâu cam rỉ sét vintage */}
        <div className="relative w-full h-5 bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 rounded-t-sm shadow-md border-b-2 border-amber-900 flex items-center justify-center overflow-hidden">
          <div className="w-full flex justify-around opacity-60">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-1.5 h-5 bg-black/30" />
            ))}
          </div>
          <span className="absolute text-[8px] font-black text-amber-100 tracking-wider">ĐÊM KHUYA</span>
        </div>

        {/* Đèn lồng đỏ & Biển hiệu gỗ retro */}
        <div className="relative w-full flex-1 bg-orange-50 border-x border-orange-300 p-1.5 flex flex-col justify-between shadow-inner">
          {/* Đèn lồng đỏ treo góc hiên */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-3.5 h-3 rounded-full bg-red-600 border border-amber-300 shadow-sm animate-pulse" />
              <div className="w-0.5 h-1.5 bg-amber-400" />
            </div>
            <div className="text-[8px] font-black text-orange-900 bg-orange-200/80 px-1 py-0.5 rounded border border-orange-400">
              SƯỜN BÌ CHẢ
            </div>
            <div className="flex flex-col items-center">
              <div className="w-3.5 h-3 rounded-full bg-red-600 border border-amber-300 shadow-sm animate-pulse" />
              <div className="w-0.5 h-1.5 bg-amber-400" />
            </div>
          </div>

          {/* Lò nướng than bốc khói nghi ngút đặc trưng Cơm Tấm Sài Gòn */}
          <div className="relative w-full flex items-center justify-around my-1">
            {/* Khói than bốc lên */}
            <div className="absolute -top-6 left-3 pointer-events-none flex space-x-1">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300/70 blur-[1px] animate-bbq-smoke-1" />
              <div className="w-3 h-3 rounded-full bg-slate-400/60 blur-[1px] animate-bbq-smoke-2" />
              <div className="w-2 h-2 rounded-full bg-slate-200/80 blur-[1px] animate-bbq-smoke-3" />
            </div>

            {/* Bếp than inox nướng thịt */}
            <div className="w-9 h-6 bg-slate-800 rounded-sm border border-slate-600 p-0.5 flex flex-col justify-between shadow-md">
              <div className="w-full h-1 bg-red-500 rounded-xs animate-pulse" title="Than hồng" />
              <div className="w-full flex justify-around">
                <div className="w-2 h-2.5 bg-amber-800 rounded-xs" title="Sườn nướng" />
                <div className="w-2 h-2.5 bg-amber-700 rounded-xs" />
              </div>
            </div>

            {/* Tủ kính đựng đĩa chả trứng vàng ươm & bát mỡ hành */}
            <div className="w-8 h-7 bg-amber-200/60 border border-amber-400/80 rounded-xs flex flex-col justify-around p-0.5">
              <div className="w-full h-1.5 bg-yellow-400 rounded-xs" title="Chả trứng vàng" />
              <div className="w-full h-1.5 bg-emerald-500 rounded-xs" title="Mỡ hành tóp mỡ" />
            </div>
          </div>

          {/* Bàn tròn inox & ghế đẩu đỏ */}
          <div className="w-full flex justify-around items-end pt-0.5 border-t border-orange-300">
            <div className="w-3 h-2.5 bg-red-600 rounded-xs" />
            <div className="w-7 h-1.5 bg-slate-300 rounded-full border border-slate-400" />
            <div className="w-3 h-2.5 bg-red-600 rounded-xs" />
          </div>
        </div>

        {/* Biển hiệu dưới chân */}
        <div className="w-full py-1 text-center font-black text-[9px] sm:text-[10px] text-white bg-amber-800 rounded-b-md shadow-md uppercase tracking-wider flex items-center justify-center space-x-1">
          <span>🍖</span>
          <span>CƠM TẤM</span>
        </div>
      </div>

      {/* 4. TIỆM BÁNH MÌ GIÒN (Banh Mi Cart / Bakery) */}
      <div className="relative flex-1 mx-1 h-[80%] flex flex-col justify-end min-w-[70px]">
        {/* Mái bạt che sọc đỏ - vàng tươi rói xòe ra phía trước */}
        <div className="relative w-full h-5 rounded-t-sm shadow-md overflow-hidden flex border-b-2 border-amber-700">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full ${i % 2 === 0 ? 'bg-red-600' : 'bg-yellow-400'}`}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] font-black text-slate-900 bg-white/90 px-1 rounded shadow-xs">
              NÓNG GIÒN
            </span>
          </div>
        </div>

        {/* Thân tủ xe bánh mì inox đặc trưng */}
        <div className="relative w-full flex-1 bg-yellow-50 border-x border-yellow-300 p-1 flex flex-col justify-between shadow-inner">
          {/* Tủ kính đựng bánh mì que vàng rụm */}
          <div className="w-full h-10 bg-amber-100/80 rounded border-2 border-amber-400/70 p-1 flex items-center justify-around">
            {/* Giỏ tre đựng bánh mì que */}
            <div className="flex space-x-0.5 items-end">
              <div className="w-1.5 h-6 bg-amber-500 rounded-full transform -rotate-6 shadow-xs" />
              <div className="w-1.5 h-7 bg-amber-400 rounded-full shadow-xs" />
              <div className="w-1.5 h-6 bg-amber-500 rounded-full transform rotate-6 shadow-xs" />
            </div>

            {/* Các khay đồ chua, dưa leo, pate */}
            <div className="flex flex-col space-y-0.5">
              <div className="w-6 h-2 bg-rose-400 rounded-xs flex items-center justify-center text-[5px] text-white">
                PATE
              </div>
              <div className="w-6 h-2 bg-emerald-500 rounded-xs flex items-center justify-center text-[5px] text-white">
                DƯA LEO
              </div>
              <div className="w-6 h-2 bg-amber-700 rounded-xs flex items-center justify-center text-[5px] text-white">
                CHẢ LỤA
              </div>
            </div>
          </div>

          {/* Khung quảng cáo nhỏ: Bánh mì thịt chả */}
          <div className="w-full py-0.5 bg-red-100 rounded border border-red-300 text-center text-[7px] font-extrabold text-red-700 leading-tight">
            🥖 15K ĐẦY ĐỦ CAY
          </div>
        </div>

        {/* Biển hiệu dưới chân */}
        <div className="w-full py-1 text-center font-black text-[9px] sm:text-[10px] text-slate-900 bg-yellow-400 rounded-b-md shadow-md uppercase tracking-wider flex items-center justify-center space-x-1">
          <span>🥖</span>
          <span>BÁNH MÌ</span>
        </div>
      </div>

      {/* 5. QUÁN TRÀ SỮA TRÂN CHÂU (Boba Milk Tea Hub) */}
      <div className="relative flex-1 mx-1 h-[88%] flex flex-col justify-end min-w-[70px]">
        {/* Điểm nhấn trên nóc: Mô hình ly trà sữa trân châu khổng lồ có ống hút */}
        <div className="relative w-full h-8 flex flex-col items-center justify-end">
          {/* Ly trà sữa 3D */}
          <div className="relative w-7 h-8 bg-amber-100 rounded-b-xl border-2 border-teal-500 shadow-lg flex flex-col justify-between overflow-hidden">
            {/* Lớp nắp cầu trong suốt */}
            <div className="w-full h-2 bg-white/70 border-b border-teal-400" />
            {/* Ống hút cắm chéo */}
            <div className="absolute -top-2 right-1.5 w-1 h-5 bg-teal-500 rounded-full transform rotate-12" />
            {/* Trân châu đen tròn dưới đáy ly */}
            <div className="w-full h-3 bg-teal-900/40 p-0.5 flex justify-around items-end">
              <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
              <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
              <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
            </div>
          </div>
        </div>

        {/* Mái che lượn sóng pastel xanh mint - trắng */}
        <div className="relative w-full h-4 rounded-t-sm shadow-md overflow-hidden flex border-b-2 border-teal-600">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full ${i % 2 === 0 ? 'bg-teal-500' : 'bg-white'}`}
            />
          ))}
        </div>

        {/* Mặt tiền tiệm hiện đại phong cách Đài Loan */}
        <div className="relative w-full flex-1 bg-teal-50/90 border-x border-teal-300 p-1.5 flex flex-col justify-between shadow-inner">
          {/* Đèn Neon phát sáng rực rỡ */}
          <div className="w-full py-0.5 bg-teal-900 rounded text-center border border-teal-400 animate-neon-glow">
            <span className="text-[7.5px] font-black text-cyan-300 tracking-wider">
              100% FRESH TEA
            </span>
          </div>

          {/* Quầy bar kính thấy các bình ủ trà inox */}
          <div className="w-full h-8 bg-teal-200/40 rounded border border-teal-400/60 p-1 flex justify-around items-center">
            <div className="w-2.5 h-6 bg-slate-300 rounded-t-sm border border-slate-400" title="Trà Ô Long" />
            <div className="w-2.5 h-6 bg-slate-400 rounded-t-sm border border-slate-500" title="Trà Lài" />
            <div className="w-2.5 h-6 bg-slate-300 rounded-t-sm border border-slate-400" title="Hồng Trà" />
          </div>
        </div>

        {/* Biển hiệu dưới chân */}
        <div className="w-full py-1 text-center font-black text-[9px] sm:text-[10px] text-white bg-teal-600 rounded-b-md shadow-md uppercase tracking-wider flex items-center justify-center space-x-1">
          <span>🧋</span>
          <span>TRÀ SỮA</span>
        </div>
      </div>

      {/* 6. TIỆM HỚT TÓC (Barber Shop) */}
      <div className="relative flex-1 mx-1 h-[82%] flex flex-col justify-end min-w-[70px]">
        {/* Tường trên phong cách Vintage Retro ốp gạch men đen trắng */}
        <div className="relative w-full h-5 bg-slate-900 rounded-t-md shadow-md border-b-2 border-slate-700 flex items-center justify-between px-1.5">
          <span className="text-[7.5px] font-serif font-black text-amber-400">SINCE 1995</span>
          <span className="text-[8px]">✂️</span>
        </div>

        {/* Thân tiệm với cột đèn xoay Barber Pole 3 màu huyền thoại */}
        <div className="relative w-full flex-1 bg-slate-100 border-x border-slate-400 p-1.5 flex justify-between items-center shadow-inner">
          {/* CỘT ĐÈN XOAY BARBER POLE 3 MÀU ĐẶC TRƯNG XOAY LIÊN TỤC */}
          <div className="relative w-3 sm:w-3.5 h-14 bg-slate-800 rounded-full border-2 border-slate-900 shadow-md overflow-hidden flex flex-col justify-between">
            <div className="w-full h-1.5 bg-amber-400 rounded-t-full" />
            <div className="w-full flex-1 animate-barber-pole" />
            <div className="w-full h-1.5 bg-amber-400 rounded-b-full" />
          </div>

          {/* Cửa kính nhìn thấy ghế cắt tóc da đen viền crom */}
          <div className="flex-1 ml-1.5 h-14 bg-slate-200/80 rounded border border-slate-400 p-1 flex flex-col justify-around items-center">
            {/* Gương tròn có đèn LED viền */}
            <div className="w-6 h-6 rounded-full bg-cyan-100 border-2 border-slate-400 shadow-inner flex items-center justify-center text-[7px] text-slate-400">
              🪞
            </div>
            {/* Ghế cắt tóc Barber */}
            <div className="w-7 h-4 bg-slate-800 rounded-t-md border border-slate-600 flex justify-center items-center">
              <div className="w-3 h-1 bg-red-600 rounded-xs" />
            </div>
          </div>
        </div>

        {/* Biển hiệu dưới chân */}
        <div className="w-full py-1 text-center font-black text-[9px] sm:text-[10px] text-white bg-slate-800 rounded-b-md shadow-md uppercase tracking-wider flex items-center justify-center space-x-1">
          <span>✂️</span>
          <span>HỚT TÓC</span>
        </div>
      </div>

      {/* 7. QUÁN BÚN CHẢ HÀ NỘI (Bun Cha Eatery) */}
      <div className="relative flex-1 mx-1 h-[85%] flex flex-col justify-end min-w-[70px]">
        {/* Mái ngói âm dương rêu phong cổ kính Hà Nội */}
        <div className="relative w-full h-6 bg-gradient-to-r from-stone-800 via-amber-900 to-stone-900 rounded-t-md shadow-md border-b-2 border-stone-950 flex items-center justify-center">
          <div className="w-full flex justify-around px-1 opacity-70">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="w-1.5 h-5 bg-amber-700/60 rounded-b-sm border-r border-black" />
            ))}
          </div>
          <span className="absolute text-[8px] font-serif font-black text-amber-200">PHỐ CỔ</span>
        </div>

        {/* Tường vôi vàng hoài niệm & Mẹt bún tre truyền thống */}
        <div className="relative w-full flex-1 bg-amber-100 border-x border-amber-400/80 p-1.5 flex flex-col justify-between shadow-inner">
          {/* Đèn lồng đỏ Hội An treo rủ */}
          <div className="flex items-center justify-between">
            <div className="w-3 h-3.5 bg-red-600 rounded-full border border-yellow-300 shadow-sm animate-pulse" />
            <span className="text-[7.5px] font-serif font-bold text-amber-900">GIA TRUYỀN</span>
            <div className="w-3 h-3.5 bg-red-600 rounded-full border border-yellow-300 shadow-sm animate-pulse" />
          </div>

          {/* Mẹt tre đựng bún sợi trắng & Bát nước chấm nướng chả than hoa */}
          <div className="w-full h-9 bg-amber-200/50 rounded border border-amber-500/40 p-1 flex justify-around items-center">
            {/* Mẹt tre tròn */}
            <div className="w-7 h-7 rounded-full bg-amber-300 border-2 border-amber-700 flex items-center justify-center shadow-xs">
              <div className="w-4 h-4 rounded-full bg-white border border-slate-300" title="Bún trắng" />
            </div>
            {/* Bát nước mắm chả nướng */}
            <div className="w-6 h-6 rounded-full bg-amber-600/70 border border-amber-800 flex flex-col items-center justify-center text-[6px]">
              🍖
            </div>
          </div>
        </div>

        {/* Biển hiệu dưới chân */}
        <div className="w-full py-1 text-center font-black text-[9px] sm:text-[10px] text-white bg-lime-800 rounded-b-md shadow-md uppercase tracking-wider flex items-center justify-center space-x-1">
          <span>🍜</span>
          <span>BÚN CHẢ</span>
        </div>
      </div>

      {/* 8. QUÁN KEM TƯƠI Ý GELATO (Ice Cream Parlor) */}
      <div className="relative flex-1 mx-1 h-[82%] flex flex-col justify-end min-w-[70px]">
        {/* Điểm nhấn trên nóc: Mô hình Cây kem ốc quế 3 tầng xoắn màu sắc phát sáng */}
        <div className="relative w-full h-8 flex items-center justify-center">
          <div className="relative flex flex-col items-center drop-shadow-[0_4px_6px_rgba(244,63,94,0.4)]">
            {/* 3 viên kem dâu hồng, vani, socola */}
            <div className="w-4 h-4 rounded-full bg-rose-400 border border-rose-300 -mb-1 z-20 shadow-xs" />
            <div className="w-4.5 h-4.5 rounded-full bg-amber-100 border border-amber-200 -mb-1 z-10 shadow-xs" />
            <div className="w-5 h-4.5 rounded-full bg-amber-800 border border-amber-700 z-0 shadow-xs" />
            {/* Bánh ốc quế tam giác */}
            <div className="w-0 h-0 border-x-[7px] border-x-transparent border-t-[12px] border-t-amber-500" />
          </div>
        </div>

        {/* Mái hiên vòm sọc hồng baby - trắng kẹo ngọt */}
        <div className="relative w-full h-4 rounded-t-sm shadow-md overflow-hidden flex border-b-2 border-rose-500">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full ${i % 2 === 0 ? 'bg-rose-400' : 'bg-white'}`}
            />
          ))}
        </div>

        {/* Thân tiệm kem ngọt ngào với tủ kem nhiều vị */}
        <div className="relative w-full flex-1 bg-rose-50 border-x border-rose-300 p-1.5 flex flex-col justify-between shadow-inner">
          <div className="w-full py-0.5 bg-rose-200/80 rounded text-center text-[7.5px] font-black text-rose-800">
            GELATO MÁT LẠNH
          </div>
          {/* Tủ kính cong đựng các khay kem */}
          <div className="w-full h-7 bg-white rounded border border-rose-300 p-0.5 grid grid-cols-4 gap-0.5 shadow-sm">
            <div className="bg-rose-400 rounded-xs" title="Dâu tây" />
            <div className="bg-amber-200 rounded-xs" title="Vani Pháp" />
            <div className="bg-amber-800 rounded-xs" title="Socola Bỉ" />
            <div className="bg-emerald-400 rounded-xs" title="Trà xanh Matcha" />
          </div>
        </div>

        {/* Biển hiệu dưới chân */}
        <div className="w-full py-1 text-center font-black text-[9px] sm:text-[10px] text-white bg-rose-600 rounded-b-md shadow-md uppercase tracking-wider flex items-center justify-center space-x-1">
          <span>🍦</span>
          <span>KEM TƯƠI</span>
        </div>
      </div>

      {/* 9. CỬA HÀNG ĐIỆN THOẠI (Mobile & Tech Hub) */}
      <div className="relative flex-1 mx-1 h-[88%] flex flex-col justify-end min-w-[70px]">
        {/* Mái ốp kim loại nhôm bạc và logo công nghệ cao */}
        <div className="relative w-full h-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-t-md shadow-md border-b-2 border-cyan-400 flex items-center justify-around px-1">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[8px] font-mono font-black text-cyan-300 tracking-wider">5G TECH</span>
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </div>

        {/* Showroom mặt kính hiện đại & Bục trưng bày smartphone phát sáng */}
        <div className="relative w-full flex-1 bg-slate-900/90 border-x border-cyan-500/50 p-1.5 flex flex-col justify-between shadow-inner">
          {/* Biển hiệu LED Neon Cyan */}
          <div className="w-full py-0.5 bg-blue-950/80 rounded border border-cyan-400 text-center animate-neon-glow">
            <span className="text-[7.5px] font-black text-cyan-300">
              SMARTPHONE STORE
            </span>
          </div>

          {/* Bục trưng bày các mô hình Smartphone thế hệ mới */}
          <div className="w-full h-8 bg-slate-800/80 rounded border border-slate-700 p-1 flex justify-around items-end">
            {/* Phone 1 */}
            <div className="w-3 h-5 bg-cyan-400/80 rounded-xs border border-white shadow-[0_0_8px_rgba(34,211,238,0.7)] flex items-center justify-center">
              <div className="w-1.5 h-3 bg-slate-950 rounded-xs" />
            </div>
            {/* Tablet */}
            <div className="w-4.5 h-6 bg-slate-950 rounded-xs border border-cyan-400 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-cyan-900/60 rounded-xs" />
            </div>
            {/* Phone 2 */}
            <div className="w-3 h-5 bg-purple-400/80 rounded-xs border border-white shadow-[0_0_8px_rgba(168,85,247,0.7)] flex items-center justify-center">
              <div className="w-1.5 h-3 bg-slate-950 rounded-xs" />
            </div>
          </div>
        </div>

        {/* Biển hiệu dưới chân */}
        <div className="w-full py-1 text-center font-black text-[9px] sm:text-[10px] text-white bg-blue-700 rounded-b-md shadow-md uppercase tracking-wider flex items-center justify-center space-x-1">
          <span>📱</span>
          <span>ĐIỆN THOẠI</span>
        </div>
      </div>
    </div>
  );
};
