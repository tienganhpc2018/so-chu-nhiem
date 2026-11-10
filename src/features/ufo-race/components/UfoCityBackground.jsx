import React, { useState } from 'react';
import { UfoTrafficLayer } from './UfoTrafficLayer';

/**
 * UfoCityBackground.jsx - Bối cảnh chuẩn 100% theo ảnh tham chiếu Thầy gửi:
 * 1. Bức ảnh phố cổ Hội An bên sông lung linh hoàng hôn:
 *    - Dãy nhà cổ mái ngói rêu phong, tường vàng nghệ đặc trưng
 *    - Mái hiên sọc nhiều màu, cửa sổ gỗ xanh, đèn lồng đỏ treo ấm áp
 *    - Cây hoa anh đào / hoa giấy hồng nở rực rỡ bên hiên nhà
 *    - Hoàng hôn rực rỡ trên dòng sông hoài niệm với ngọn tháp cổ phía xa
 * 2. Vỉa hè đi bộ lát đá rộng rãi sạch đẹp có lan can đá hoa cương
 * 3. Lòng đường nhựa có vạch sang đường ngựa vằn (Zebra Crosswalk) và vạch đứt vàng
 * 4. Xe buýt trường học vàng rực rỡ và xe cộ chạy 2 chiều sinh động (UfoTrafficLayer)
 */

export const UfoCityBackground = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 flex flex-col justify-between">
      
      {/* 1. ẢNH NỀN PHỐ CỔ VÀNG HOÀNG HÔN THẬT 100% NHƯ ẢNH THAM CHIẾU */}
      {!imgError ? (
        <div className="absolute inset-0 z-0">
          <img
            src="/images/ufo/ufo_street_background.jpg"
            alt="UFO Street Background"
            className="w-full h-full object-cover object-bottom"
            onError={() => setImgError(true)}
          />
          {/* Lớp phủ dịu nhẹ tạo chiều sâu cho học sinh và đĩa bay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
        </div>
      ) : (
        /* Fallback nếu ảnh không nạp được */
        <div className="absolute inset-0 bg-gradient-to-b from-[#f97316] via-[#f43f5e] to-[#6366f1]" />
      )}

      {/* 2. HIỆU ỨNG VẠCH KẺ ĐƯỜNG DẠ QUANG & VẠCH NGỰA VẰN TRÊN MẶT ĐƯỜNG */}
      <div className="absolute bottom-0 left-0 right-0 h-28 sm:h-32 pointer-events-none z-10 flex flex-col justify-end">
        {/* Vạch ngựa vằn sang đường (Zebra Crosswalk) ở giữa đường */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 sm:w-60 h-20 flex justify-around opacity-90 pointer-events-none">
          {[...Array(6)].map((_, zIdx) => (
            <div key={zIdx} className="w-4 sm:w-5 h-full bg-white/95 rounded-xs shadow-sm transform skew-x-[-12deg]" />
          ))}
        </div>

        {/* Vạch sơn vàng đứt quãng phân cách làn đường */}
        <div className="absolute bottom-11 w-full flex justify-around opacity-80 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-10 sm:w-16 h-2 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.7)]" />
          ))}
        </div>

        {/* Vùng sân khấu ánh sáng hình elip - Điểm đáp của tia hút UFO */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[70%] max-w-4xl h-14 bg-gradient-to-r from-cyan-400/10 via-emerald-400/25 to-cyan-400/10 rounded-[100%] blur-sm border border-cyan-400/30 shadow-[0_0_35px_rgba(34,211,238,0.4)] pointer-events-none" />
      </div>

      {/* 3. LỚP XE CỘ CHẠY TRÊN LÒNG ĐƯỜNG (XE BUÝT VÀNG, Ô TÔ, XE MÁY) */}
      <UfoTrafficLayer />

      {/* 4. BANNER HƯỚNG DẪN Ở ĐÁY MÀN HÌNH CHUẨN THEO ẢNH: "Bấm vào đây hoặc nút Bắt đầu!" */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-25 pointer-events-none">
        <div className="px-5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-600/70 shadow-lg text-white font-title font-extrabold text-xs sm:text-sm tracking-wide flex items-center gap-1.5">
          <span>👉</span>
          <span>Bấm vào đây hoặc nút Bắt đầu!</span>
        </div>
      </div>

    </div>
  );
};
