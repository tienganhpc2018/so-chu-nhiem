import React from 'react';

/**
 * UfoTrafficLayer.jsx - Hiệu ứng xe cộ chạy liên tục trên lòng đường:
 * - Xe buýt trường học màu vàng (School Bus) chạy làn ngoài từ phải sang trái hoặc từ trái sang phải
 * - Xe ô tô con, xe taxi, xe máy di chuyển 2 chiều sinh động
 * - Khói xe mờ nhẹ phía sau đuôi
 */
export const UfoTrafficLayer = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
      <style>{`
        @keyframes moveBusRight {
          0% { transform: translateX(-180px); }
          100% { transform: translateX(calc(100vw + 200px)); }
        }
        @keyframes moveCarLeft {
          0% { transform: translateX(calc(100vw + 160px)) scaleX(-1); }
          100% { transform: translateX(-180px) scaleX(-1); }
        }
        @keyframes moveScooterRight {
          0% { transform: translateX(-120px); }
          100% { transform: translateX(calc(100vw + 150px)); }
        }
        .anim-school-bus {
          animation: moveBusRight 16s linear infinite;
        }
        .anim-car-left {
          animation: moveCarLeft 13s linear infinite 4s;
        }
        .anim-scooter-right {
          animation: moveScooterRight 11s linear infinite 8s;
        }
      `}</style>

      {/* 1. XE BUÝT VÀNG TRƯỜNG HỌC (SCHOOL BUS CHUẨN THEO ẢNH GỐC THẦY GỬI) */}
      <div className="absolute bottom-2 left-0 anim-school-bus drop-shadow-lg z-20">
        <div className="relative w-36 sm:w-44 h-16 sm:h-20">
          <svg viewBox="0 0 200 90" className="w-full h-full overflow-visible">
            {/* Thân xe buýt vàng rực rỡ */}
            <path
              d="M 10 70 L 10 32 Q 12 18, 30 15 L 155 15 Q 185 15, 192 38 L 195 70 Z"
              fill="#fbbf24"
              stroke="#b45309"
              strokeWidth="2.5"
            />
            {/* Mui xe hơi sẫm */}
            <path
              d="M 10 32 L 192 32 L 195 44 L 10 44 Z"
              fill="#f59e0b"
            />
            {/* Kính lái phía trước */}
            <path
              d="M 158 20 L 186 38 L 186 50 L 158 50 Z"
              fill="#bae6fd"
              stroke="#0284c7"
              strokeWidth="1.5"
            />
            {/* Các ô cửa sổ học sinh */}
            <rect x="22" y="22" width="22" height="24" rx="3" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.2" />
            <rect x="52" y="22" width="22" height="24" rx="3" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.2" />
            <rect x="82" y="22" width="22" height="24" rx="3" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.2" />
            <rect x="112" y="22" width="22" height="24" rx="3" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.2" />

            {/* Bóng học sinh ngồi trên xe buýt */}
            <circle cx="33" cy="34" r="5" fill="#f43f5e" />
            <circle cx="63" cy="34" r="5" fill="#3b82f6" />
            <circle cx="93" cy="34" r="5" fill="#10b981" />
            <circle cx="123" cy="34" r="5" fill="#f59e0b" />

            {/* Vạch kẻ đen bên hông xe buýt */}
            <rect x="10" y="52" width="185" height="4" fill="#1e293b" />
            <rect x="10" y="60" width="185" height="3" fill="#1e293b" />

            {/* Đèn pha phía trước */}
            <circle cx="192" cy="58" r="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            {/* Đèn hậu đỏ phía sau */}
            <rect x="8" y="55" width="3" height="7" rx="1" fill="#ef4444" />

            {/* Gầm xe & Bánh xe */}
            <rect x="15" y="68" width="175" height="5" fill="#0f172a" />
            
            {/* Bánh sau */}
            <g transform="translate(42, 70)">
              <circle cx="0" cy="0" r="14" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
              <circle cx="0" cy="0" r="7" fill="#94a3b8" />
              <circle cx="0" cy="0" r="3" fill="#0f172a" />
            </g>

            {/* Bánh trước */}
            <g transform="translate(160, 70)">
              <circle cx="0" cy="0" r="14" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
              <circle cx="0" cy="0" r="7" fill="#94a3b8" />
              <circle cx="0" cy="0" r="3" fill="#0f172a" />
            </g>
          </svg>
        </div>
      </div>

      {/* 2. XE Ô TÔ CON ĐỎ CHẠY LÀN TRONG NGƯỢC CHIỀU (TỪ PHẢI SANG TRÁI) */}
      <div className="absolute bottom-11 sm:bottom-12 right-0 anim-car-left drop-shadow-md z-12">
        <div className="relative w-28 sm:w-32 h-12 sm:h-14">
          <svg viewBox="0 0 140 60" className="w-full h-full overflow-visible">
            {/* Thân xe ô tô đỏ */}
            <path
              d="M 5 45 L 8 28 Q 12 20, 25 20 L 45 20 L 60 8 Q 65 6, 80 6 L 105 6 Q 115 6, 122 18 L 132 28 L 135 45 Z"
              fill="#ef4444"
              stroke="#991b1b"
              strokeWidth="2"
            />
            {/* Cửa sổ xe kính xanh */}
            <path d="M 62 10 L 80 10 L 80 20 L 52 20 Z" fill="#bae6fd" />
            <path d="M 85 10 L 102 10 L 115 20 L 85 20 Z" fill="#bae6fd" />

            {/* Đèn pha & Đèn hậu */}
            <circle cx="132" cy="34" r="3" fill="#fef08a" />
            <rect x="4" y="32" width="2" height="6" fill="#fbbf24" />

            {/* Bánh xe */}
            <circle cx="32" cy="46" r="10" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            <circle cx="32" cy="46" r="4" fill="#cbd5e1" />
            <circle cx="110" cy="46" r="10" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            <circle cx="110" cy="46" r="4" fill="#cbd5e1" />
          </svg>
        </div>
      </div>

      {/* 3. XE MÁY SCOOTER CHẠY LƯỚT QUA NHANH */}
      <div className="absolute bottom-5 left-0 anim-scooter-right drop-shadow-md z-16">
        <div className="relative w-16 h-12">
          <svg viewBox="0 0 70 50" className="w-full h-full overflow-visible">
            {/* Khung xe xanh ngọc */}
            <path d="M 10 38 L 22 25 L 42 25 L 50 15 L 56 18 L 48 38 Z" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.5" />
            <rect x="20" y="20" width="18" height="6" rx="2" fill="#334155" />
            {/* Người lái chibi đội mũ bảo hiểm */}
            <circle cx="32" cy="10" r="6" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="30" cy="12" r="4" fill="#fed7aa" />
            {/* 2 Bánh xe */}
            <circle cx="14" cy="38" r="7" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="14" cy="38" r="2.5" fill="#cbd5e1" />
            <circle cx="50" cy="38" r="7" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="50" cy="38" r="2.5" fill="#cbd5e1" />
          </svg>
        </div>
      </div>
    </div>
  );
};
