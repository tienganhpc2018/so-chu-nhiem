import React from 'react';

/**
 * SPRITE CẬU BÉ BỊT MẮT 3D CHUẨN HOẠT HÌNH DÂN GIAN (Tối ưu theo góp ý Thầy):
 * 1. MẶT VÀ THÂN LUÔN HƯỚNG CÙNG CHIỀU VỚI HƯỚNG DI CHUYỂN (Chạy sang phải -> Mặt & thân quay phải; Chạy sang trái -> Mặt & thân quay trái).
 * 2. ĐÔI MẮT CƯỜI HÍP DẠNG CHIBI ^^ ÁNH LÊN TRÊN DẢI LỤA ĐỎ: Tạo biểu cảm hóm hỉnh, tinh nghịch và đáng yêu.
 * 3. PHỐI CẢNH 3D NỔI KHỐI: Đầu tròn 3D, má hồng, miệng cười, áo bà ba nâu ngắn tay, thắt lưng trắng rủ nơ, quần ngố nâu sẫm, chân trần.
 * 4. NÓN LÁ HẤT RA SAU GÁY: Gọn gàng, để lộ toàn bộ khuôn mặt và dải bịt mắt chibi.
 * 5. TƯ THẾ ÔM VỊT: Khi bắt được, quay chính diện ôm trọn chú vịt vàng trước ngực!
 */
export const DuckPlayerSprite = ({
  x = 0,
  y = 0,
  direction = 'right', // 'left' | 'right'
  isCatching = false,
  isWalking = true,
  isHoldingDuck = false
}) => {
  const isFacingLeft = direction === 'left';

  return (
    <div
      className="absolute pointer-events-none select-none z-30 transition-transform duration-75 ease-out"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        // Khi chạy trái thì lật toàn bộ nhân vật (Mặt + Thân + Tay + Chân) quay sang trái
        transform: `translate(-50%, -85%) ${isFacingLeft && !isHoldingDuck ? 'scaleX(-1)' : 'scaleX(1)'}`,
        willChange: 'left, top, transform'
      }}
    >
      {/* 1. Bóng đổ tiếp xúc mặt đất dưới chân (Contact Shadow 3D) */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
        style={{
          width: isHoldingDuck ? '56px' : '52px',
          height: '14px',
          backgroundColor: 'rgba(56, 32, 14, 0.45)',
          filter: 'blur(2.5px)'
        }}
      />

      {/* 2. Vệt gió hoạt hình (( quanh bước chạy rượt đuổi */}
      {isWalking && !isHoldingDuck && (
        <div className="absolute -left-6 bottom-4 pointer-events-none opacity-85 select-none">
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
            <path d="M4 6C8 9 14 10 20 8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
            <path d="M2 14C7 16 13 17 18 15" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
            <path d="M6 21C10 22 15 22 19 20" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
          </svg>
        </div>
      )}

      {/* 3. KHỐI NHÂN VẬT 3D CHIBI (Kích thước lớn 136x136 rõ nét) */}
      <div className={`relative w-34 h-34 flex flex-col items-center transition-transform ${isCatching ? 'scale-105' : ''}`}>
        <svg
          width="136"
          height="136"
          viewBox="0 0 136 136"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-lg overflow-visible"
        >
          <defs>
            {/* Gradients 3D đổ bóng khối nón lá tre */}
            <linearGradient id="hat3DGrad" x1="40" y1="18" x2="80" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="35%" stopColor="#fde047" />
              <stop offset="70%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>

            {/* Gradient màu da 3D hồng hào phúng phính */}
            <radialGradient id="skin3DGrad" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fff1e6" />
              <stop offset="60%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fba36e" />
            </radialGradient>

            {/* Dải lụa đỏ bịt mắt dày dặn */}
            <linearGradient id="redSilk3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="35%" stopColor="#ef4444" />
              <stop offset="75%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>

            {/* Áo bà ba nâu đậm 3D mộc mạc */}
            <radialGradient id="shirt3DGrad" cx="45%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#a26c3f" />
              <stop offset="65%" stopColor="#784725" />
              <stop offset="100%" stopColor="#4e2c14" />
            </radialGradient>

            {/* Quần ngố nâu sẫm 3D */}
            <linearGradient id="pants3DGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#543317" />
              <stop offset="100%" stopColor="#2e190b" />
            </linearGradient>

            {/* Ánh sáng phát quang cho mắt cười chibi ^^ */}
            <filter id="chibiGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#ffffff" floodOpacity="0.9" />
              <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="#fef08a" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* ============================================================== */}
          {/* TƯ THẾ 1: ĐANG CHẠY RƯỢT ĐUỔI (MẶT VÀ THÂN CÙNG HƯỚNG DI CHUYỂN) */}
          {/* ============================================================== */}
          {!isHoldingDuck ? (
            <g>
              {/* NÓN LÁ HẤT RA SAU GÁY (NGHIÊNG NHẸ PHÍA SAU ĐẦU, KHÔNG CHE MẶT) */}
              <g transform="translate(32, 28) rotate(-22)">
                <ellipse cx="26" cy="18" rx="22" ry="12" fill="#78350f" opacity="0.35" />
                <path
                  d="M26 2L4 26C4 26 15 30 26 30C37 30 48 26 48 26L26 2Z"
                  fill="url(#hat3DGrad)"
                  stroke="#78350f"
                  strokeWidth="1.2"
                  filter="drop-shadow(0 3px 5px rgba(0,0,0,0.3))"
                />
                {/* Vành nan tre */}
                <path d="M14 14C18 16 34 16 38 14" stroke="#78350f" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
                <path d="M8 22C16 25 36 25 44 22" stroke="#78350f" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
                <circle cx="26" cy="2" r="2.2" fill="#78350f" />
              </g>

              {/* DẢI LỤA ĐỎ NƠ KHĂN BAY TRONG GIÓ PHÍA SAU ĐẦU */}
              <g className="animate-pulse">
                <path
                  d="M44 48C30 46 18 51 8 60C14 61 24 57 34 53Z"
                  fill="url(#redSilk3D)"
                  filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
                />
                <path
                  d="M42 51C31 53 20 62 14 72C21 70 30 63 36 57Z"
                  fill="#991b1b"
                />
              </g>

              {/* CHÂN PHẢI BƯỚC SAU ĐẨY ĐÀ (CHÂN TRẦN CHẠM CÁT) */}
              <g className={isWalking ? 'animate-duck-feet' : ''}>
                <path d="M54 78L40 92L50 97L62 82Z" fill="url(#pants3DGrad)" />
                <path d="M40 92L30 102C28 104 30 108 36 108L46 106L50 97Z" fill="url(#skin3DGrad)" stroke="#ea580c" strokeWidth="0.8" />
                {/* Ngón chân trần */}
                <circle cx="29" cy="106" r="2.5" fill="#f97316" />
                <circle cx="34" cy="107" r="2.2" fill="#f97316" />
              </g>

              {/* THÂN MÌNH ÁO BÀ BA NÂU 3D (HƯỚNG VỀ PHÍA TRƯỚC THEO CHIỀU CHẠY) */}
              <path
                d="M52 58C52 58 60 52 70 54C80 56 88 62 85 76L54 80C48 73 49 64 52 58Z"
                fill="url(#shirt3DGrad)"
                stroke="#3f220f"
                strokeWidth="1.2"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"
              />
              {/* Nẹp cổ áo bà ba */}
              <path d="M66 54L69 64L76 56" stroke="#2e190b" strokeWidth="1.8" strokeLinecap="round" />

              {/* THẮT LƯNG VẢI TRẮNG BUỘC GỌN Ở EO CÓ NƠ DÂY RỦ XUỐNG */}
              <path
                d="M54 75C60 74 76 74 84 76L83 81C74 79 58 79 53 80Z"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1.2"
              />
              {/* Đoạn dây vải trắng rủ xuống hông */}
              <path
                d="M56 77C51 83 48 93 51 98C54 95 58 87 59 79Z"
                fill="#f1f5f9"
                stroke="#94a3b8"
                strokeWidth="0.9"
              />

              {/* CHÂN TRÁI BƯỚC TRƯỚC SẢI BƯỚC BAREFOOT */}
              <g className={isWalking ? 'animate-duck-feet' : ''}>
                <path d="M68 80L78 96L90 94L82 79Z" fill="url(#pants3DGrad)" />
                <path d="M78 96L80 110C80 113 85 115 92 115C95 115 97 112 95 108L88 96Z" fill="url(#skin3DGrad)" stroke="#ea580c" strokeWidth="0.8" />
                <circle cx="94" cy="113" r="2.8" fill="#f97316" />
                <circle cx="89" cy="114" r="2.4" fill="#f97316" />
              </g>

              {/* TAY SAU VƯƠN RA TRƯỚC */}
              <path
                d="M66 62C76 60 90 58 98 58C101 58 103 61 100 63C96 66 84 69 74 69Z"
                fill="#543015"
              />
              <circle cx="99" cy="60" r="5" fill="url(#skin3DGrad)" />

              {/* ĐẦU CẬU BÉ 3D TRÒN TRỊA CÙNG HƯỚNG VỚI CHIỀU CHẠY */}
              <g>
                <circle cx="70" cy="46" r="17" fill="url(#skin3DGrad)" stroke="#ea580c" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))" />

                {/* Má hồng phúng phính bên má hướng chạy */}
                <ellipse cx="80" cy="52" rx="4.5" ry="3" fill="#fb7185" opacity="0.85" />

                {/* NỤ CƯỜI RẠNG RỠ VUI VẺ */}
                <path
                  d="M75 54C78 59 84 58 86 54"
                  stroke="#9f1239"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
                {/* Răng trắng xinh */}
                <path d="M77 55C79 57 83 57 84 55" fill="#ffffff" />

                {/* DẢI LỤA ĐỎ BỊT MẮT BẢN DÀY (ÔM QUANH ĐẦU HƯỚNG VỀ PHÍA TRƯỚC) */}
                <path
                  d="M53 41C58 39 84 39 88 43C88 47 85 50 82 50C76 48 58 48 54 49C52 47 52 44 53 41Z"
                  fill="url(#redSilk3D)"
                  stroke="#7f1d1d"
                  strokeWidth="1.2"
                  filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))"
                />
                {/* Nếp gấp dải khăn */}
                <path d="M58 43C65 41 78 42 85 45" stroke="#fca5a5" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />

                {/* ============================================================== */}
                {/* ĐÔI MẮT CƯỜI HÍP DẠNG CHIBI ^^ ÁNH LÊN TRÊN DẢI LỤA ĐỎ */}
                {/* ============================================================== */}
                <g filter="url(#chibiGlow)">
                  {/* Mắt trái ^ */}
                  <path
                    d="M66 45C68.5 41 72 41 74 45"
                    stroke="#ffffff"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Mắt phải ^ (nhìn về hướng chạy) */}
                  <path
                    d="M77 45C79.5 41 83 41 85 45"
                    stroke="#ffffff"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Điểm nhấn vàng kim lấp lánh */}
                  <circle cx="70" cy="41" r="0.8" fill="#fef08a" />
                  <circle cx="81" cy="41" r="0.8" fill="#fef08a" />
                </g>
              </g>

              {/* TAY TRƯỚC VƯƠN DÀI XÒE NGÓN BẮT VỊT (HƯỚNG VỀ PHÍA TRƯỚC) */}
              <g className={isCatching ? 'transform translate-x-3 -translate-y-1' : ''}>
                <path
                  d="M72 65C82 64 98 63 108 64C111 64 112 67 109 69C104 74 90 75 78 74Z"
                  fill="url(#shirt3DGrad)"
                  filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))"
                />
                {/* Bàn tay 5 ngón xòe ra chộp bắt */}
                <path
                  d="M108 63C112 61 118 61 120 64C121 66 117 68 115 69C118 70 120 72 119 74C116 75 113 73 111 72C112 74 111 76 109 76C106 76 105 73 105 70Z"
                  fill="url(#skin3DGrad)"
                  stroke="#d97706"
                  strokeWidth="0.8"
                />
              </g>
            </g>
          ) : (
            // ==============================================================
            // TƯ THẾ 2: KHI ĐÃ BẮT ĐƯỢC VỊT -> QUAY CHÍNH DIỆN ÔM VỊT TRƯỚC NGỰC!
            // ==============================================================
            <g className="animate-wiggle" transform="translate(68, 68) translate(-68, -68)">
              {/* Nón lá hất sau đầu */}
              <g transform="translate(44, 20) rotate(-15)">
                <ellipse cx="24" cy="16" rx="20" ry="11" fill="#78350f" opacity="0.3" />
                <path d="M24 2L4 24C4 24 14 27 24 27C34 27 44 24 44 24L24 2Z" fill="url(#hat3DGrad)" stroke="#78350f" strokeWidth="1" />
              </g>

              {/* Dải nơ khăn đỏ hai bên */}
              <path d="M42 46C30 45 22 52 16 60C22 59 32 55 40 52Z" fill="url(#redSilk3D)" />
              <path d="M94 46C106 45 114 52 120 60C114 59 104 55 96 52Z" fill="url(#redSilk3D)" />

              {/* Thân áo bà ba nâu nhìn chính diện */}
              <path
                d="M48 60C48 55 58 52 68 52C78 52 88 55 88 60L86 86C76 88 60 88 50 86Z"
                fill="url(#shirt3DGrad)"
                stroke="#3f220f"
                strokeWidth="1.2"
              />

              {/* Thắt lưng vải trắng buộc nơ */}
              <rect x="49" y="80" width="38" height="6" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <path d="M68 83C66 88 64 97 66 102C69 99 72 91 72 84Z" fill="#f1f5f9" />

              {/* Hai chân đứng vững vàng trên cát */}
              <rect x="52" y="88" width="12" height="14" rx="2" fill="url(#pants3DGrad)" />
              <rect x="72" y="88" width="12" height="14" rx="2" fill="url(#pants3DGrad)" />
              <path d="M52 102L50 114C50 117 56 118 64 118L64 102Z" fill="url(#skin3DGrad)" />
              <path d="M84 102L86 114C86 117 80 118 72 118L72 102Z" fill="url(#skin3DGrad)" />

              {/* ĐẦU CHÍNH DIỆN CẬU BÉ VỚI NỤ CƯỜI TÍT MẮT ^^ */}
              <circle cx="68" cy="44" r="18" fill="url(#skin3DGrad)" stroke="#ea580c" strokeWidth="1" />
              {/* Hai má hồng */}
              <ellipse cx="54" cy="50" rx="4.5" ry="3" fill="#fb7185" opacity="0.85" />
              <ellipse cx="82" cy="50" rx="4.5" ry="3" fill="#fb7185" opacity="0.85" />

              {/* Miệng cười thật to mừng rỡ */}
              <path d="M62 52C64 58 72 58 74 52" stroke="#9f1239" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M64 53C66 56 70 56 72 53" fill="#ffffff" />

              {/* Khăn đỏ bịt mắt ngang trán */}
              <path
                d="M48 38C54 36 82 36 88 38C89 42 88 46 86 47C80 45 56 45 50 47C48 46 47 42 48 38Z"
                fill="url(#redSilk3D)"
                stroke="#7f1d1d"
                strokeWidth="1.2"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"
              />

              {/* ĐÔI MẮT CHIBI ^^ CƯỜI HÍP TRÊN DẢI LỤA ĐỎ */}
              <g filter="url(#chibiGlow)">
                <path d="M55 42C58 38 62 38 64 42" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M72 42C74 38 78 38 81 42" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              {/* CHÚ VỊT VÀNG HOẠT HÌNH ĐƯỢC ÔM CHẶT TRƯỚC NGỰC */}
              <g transform="translate(68, 70) scale(1.1) translate(-68, -70)">
                <ellipse cx="68" cy="70" rx="15" ry="12" fill="#fde047" stroke="#ca8a04" strokeWidth="1.2" />
                <circle cx="77" cy="63" r="9" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
                <path d="M84 63C89 63 91 65 89 67C87 68 84 67 82 65Z" fill="#f97316" stroke="#c2410c" strokeWidth="0.8" />
                {/* Mắt vịt nhắm tít vui sướng ^^ */}
                <path d="M76 61C77 60 79 60 80 61" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
                <ellipse cx="75" cy="65" rx="2" ry="1.2" fill="#f472b6" opacity="0.8" />
                <ellipse cx="65" cy="70" rx="8" ry="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />

                {/* HAI CÁNH TAY CẬU BÉ ÔM TRỌN CHÚ VỊT */}
                <path
                  d="M52 64C54 70 59 76 68 76C77 76 82 70 84 64"
                  stroke="url(#shirt3DGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <circle cx="64" cy="76" r="4" fill="url(#skin3DGrad)" />
                <circle cx="72" cy="76" r="4" fill="url(#skin3DGrad)" />

                {/* Trái tim yêu thương bay lên */}
                <g className="animate-bounce">
                  <path
                    d="M68 48C65 44 60 45 60 49C60 53 68 57 68 57C68 57 76 53 76 49C76 45 71 44 68 48Z"
                    fill="#ef4444"
                  />
                </g>
              </g>
            </g>
          )}

        </svg>
      </div>
    </div>
  );
};
