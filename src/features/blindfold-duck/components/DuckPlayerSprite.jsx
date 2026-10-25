import React from 'react';

/**
 * SPRITE CẬU BÉ BỊT MẮT BẮT VỊT (Chuẩn 100% Theo Yêu Cầu):
 * - CAMERA HẠ THẤP: Nhìn ngang tầm mắt, thấy rõ toàn bộ dáng người và biểu cảm
 * - ĐẦU LUÔN HƯỚNG VỀ PHÍA CAMERA: Dù thân chạy hướng nào, khuôn mặt cười tươi, má hồng và dải bịt mắt luôn hiện ra
 * - NÓN LÁ HẤT RA SAU: Nón nhỏ gọn nghiêng ra sau gáy, không che trán và mặt
 * - CẢNH ÔM VỊT KHI BẮT ĐƯỢC: Hai tay ôm trọn chú vịt vàng trước ngực, nụ cười rạng rỡ cực kỳ đáng yêu
 * - TRANG PHỤC: Áo bà ba nâu ngắn tay, thắt dây trắng ở eo có đoạn rủ xuống, quần ngố nâu sẫm, chân trần sải bước
 */
export const DuckPlayerSprite = ({
  x = 0,
  y = 0,
  direction = 'right', // 'left' | 'right'
  isCatching = false,
  isWalking = true,
  isHoldingDuck = false // Khi đã bắt được vịt -> chuyển sang tư thế ôm vịt trước ngực
}) => {
  const isFacingLeft = direction === 'left';

  return (
    <div
      className="absolute pointer-events-none select-none z-30 transition-transform duration-75 ease-out"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -85%)',
        willChange: 'left, top'
      }}
    >
      {/* 1. Bóng đổ tiếp xúc mặt đất dưới chân cậu bé */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-6 rounded-full bg-[#38200e]/40 filter blur-xs pointer-events-none"
      />

      {/* 2. Vệt gió hoạt hình (( quanh bước chạy rượt đuổi */}
      {isWalking && !isHoldingDuck && (
        <div
          className={`absolute bottom-4 ${isFacingLeft ? 'right-0' : 'left-0'} pointer-events-none opacity-80`}
          style={{ transform: isFacingLeft ? 'scaleX(-1)' : 'none' }}
        >
          <svg width="26" height="22" viewBox="0 0 26 22" fill="none">
            <path d="M4 6C8 9 14 10 20 8" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
            <path d="M2 13C7 15 13 16 18 14" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
          </svg>
        </div>
      )}

      {/* 3. KHỐI NHÂN VẬT SVG ĐỒNG BỘ 3D */}
      <div className="relative w-32 h-32 flex flex-col items-center">
        <svg
          width="128"
          height="128"
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md overflow-visible"
        >
          <defs>
            {/* Nón lá tre vàng */}
            <linearGradient id="hatBackGrad" x1="64" y1="16" x2="64" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f3dfb2" />
              <stop offset="50%" stopColor="#dfbe84" />
              <stop offset="100%" stopColor="#b48c48" />
            </linearGradient>

            {/* Màu da sáng hồng tự nhiên */}
            <radialGradient id="skinGradFront" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffe7d1" />
              <stop offset="70%" stopColor="#fcd3b2" />
              <stop offset="100%" stopColor="#f3be98" />
            </radialGradient>

            {/* Dải lụa đỏ bịt mắt */}
            <linearGradient id="redRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="40%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>

            {/* Áo bà ba nâu ngắn tay */}
            <linearGradient id="brownShirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8c6239" />
              <stop offset="100%" stopColor="#5c3818" />
            </linearGradient>

            {/* Quần ngố nâu sẫm */}
            <linearGradient id="brownPantsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a3118" />
              <stop offset="100%" stopColor="#2b1a0b" />
            </linearGradient>
          </defs>

          {/* ============================================================== */}
          {/* LỚP 1: NÓN LÁ HẤT RA PHÍA SAU GÁY (KHÔNG CHE MẶT & TRÁN) */}
          {/* ============================================================== */}
          <g transform="translate(64, 40) rotate(-18) translate(-64, -40)">
            {/* Chóp nón nhỏ hơn, ngả hẳn ra sau đầu */}
            <ellipse cx="64" cy="38" rx="26" ry="14" fill="#a16207" opacity="0.3" />
            <path
              d="M64 16L38 42C38 42 51 46 64 46C77 46 90 42 90 42L64 16Z"
              fill="url(#hatBackGrad)"
              stroke="#854d0e"
              strokeWidth="1.2"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"
            />
            {/* Vành nan nón tre */}
            <path d="M52 28C58 30 70 30 76 28" stroke="#78350f" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
            <path d="M44 36C54 39 74 39 84 36" stroke="#78350f" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
            <circle cx="64" cy="16" r="2" fill="#78350f" />
          </g>

          {/* DẢI LỤA NƠ ĐỎ PHẤP PHỚI PHÍA SAU ĐẦU */}
          <g className="animate-pulse" opacity="0.95">
            <path
              d="M48 48C36 46 26 50 18 57C23 58 32 55 40 52Z"
              fill="url(#redRibbonGrad)"
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
            />
            <path
              d="M46 51C37 53 28 60 22 68C29 66 36 61 42 56Z"
              fill="#b91c1c"
            />
          </g>

          {/* ============================================================== */}
          {/* LỚP 2: THÂN NGƯỜI, TAY VÀ CHÂN (XOAY THEO HƯỚNG CHẠY DIRECTION) */}
          {/* ============================================================== */}
          <g
            style={{
              transform: isFacingLeft ? 'scaleX(-1)' : 'scaleX(1)',
              transformOrigin: '64px 64px'
            }}
          >
            {/* CHÂN SAU (BƯỚC CHẠY ĐẨY ĐÀ CHÂN TRẦN) */}
            <g className={isWalking && !isHoldingDuck ? 'animate-duck-feet' : ''}>
              {/* Quần ngố sau */}
              <path d="M52 74L40 86L48 90L58 77Z" fill="url(#brownPantsGrad)" />
              {/* Bắp chân & Bàn chân trần sau chạm đất */}
              <path d="M40 86L32 94C30 96 32 100 37 100L45 98L48 90Z" fill="url(#skinGradFront)" />
              {/* Ngón chân */}
              <circle cx="31" cy="98" r="2.2" fill="#e79c6d" />
            </g>

            {/* CHÂN TRƯỚC (SẢI BƯỚC BAREFOOT) */}
            <g className={isWalking && !isHoldingDuck ? 'animate-duck-feet' : ''}>
              {/* Quần ngố trước */}
              <path d="M62 76L70 90L80 88L73 75Z" fill="url(#brownPantsGrad)" />
              {/* Bắp chân & Bàn chân trần sải bước */}
              <path d="M70 90L72 102C72 105 76 106 82 106C85 106 87 103 85 100L79 90Z" fill="url(#skinGradFront)" />
              <circle cx="84" cy="104" r="2.5" fill="#f4a261" />
              <circle cx="80" cy="105" r="2.2" fill="#f4a261" />
            </g>

            {/* THÂN ÁO BÀ BA NÂU NGẮN TAY */}
            <path
              d="M50 56C50 56 56 52 64 54C72 55 78 60 76 72L50 75C46 69 47 61 50 56Z"
              fill="url(#brownShirtGrad)"
              stroke="#452710"
              strokeWidth="1.2"
            />
            {/* Cổ áo chữ V */}
            <path d="M60 54L62 62L68 55" stroke="#3b1f09" strokeWidth="1.6" strokeLinecap="round" />

            {/* THẮT LƯNG VẢI TRẮNG Ở EO VỚI ĐOẠN DÂY RỦ XUỐNG */}
            <path
              d="M50 71C54 70 68 70 75 72L74 76C67 74 53 74 49 75Z"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            {/* Đoạn dây trắng rủ xuống qua hông */}
            <path
              d="M52 73C48 78 46 86 48 90C51 88 54 81 55 75Z"
              fill="#f1f5f9"
              stroke="#94a3b8"
              strokeWidth="0.8"
            />

            {/* TAY VÀ TƯ THẾ: KHI ÔM VỊT VS KHI ĐANG RƯỢT ĐUỔI CHỘP BẮT */}
            {!isHoldingDuck ? (
              <>
                {/* Tay sau vươn ra trước */}
                <path
                  d="M60 58C68 56 80 54 88 54C91 54 92 57 90 59C87 62 76 65 66 65Z"
                  fill="#69411f"
                />
                <circle cx="89" cy="56" r="4.5" fill="url(#skinGradFront)" />

                {/* Tay trước vươn dài xòe ngón chộp bắt */}
                <g className={isCatching ? 'transform translate-x-3 -translate-y-1' : ''}>
                  <path
                    d="M62 62C70 61 86 60 96 61C99 61 100 64 97 66C93 70 80 71 68 70Z"
                    fill="url(#brownShirtGrad)"
                  />
                  {/* Bàn tay 5 ngón xòe rộng */}
                  <path
                    d="M96 60C100 58 106 58 108 61C109 63 105 65 103 66C106 67 108 69 107 71C104 72 101 70 99 69C100 71 99 73 97 73C94 73 93 70 93 67Z"
                    fill="url(#skinGradFront)"
                    stroke="#d97706"
                    strokeWidth="0.6"
                  />
                </g>
              </>
            ) : null}
          </g>

          {/* ============================================================== */}
          {/* LỚP 3: ĐẦU & KHUÔN MẶT CẬU BÉ (LUÔN QUAY VỀ PHÍA CAMERA / NGƯỜI XEM) */}
          {/* ============================================================== */}
          <g className="filter drop-shadow-sm">
            {/* Khuôn mặt tròn trịa, má bầu bĩnh nhìn chính diện */}
            <circle cx="64" cy="46" r="16" fill="url(#skinGradFront)" stroke="#e29562" strokeWidth="0.8" />

            {/* Tai hai bên */}
            <circle cx="47" cy="46" r="3.5" fill="url(#skinGradFront)" />
            <circle cx="81" cy="46" r="3.5" fill="url(#skinGradFront)" />

            {/* MÁ HỒNG PHÚNG PHÍNH CỰC DỄ THƯƠNG HAI BÊN */}
            <ellipse cx="54" cy="51" rx="4" ry="2.5" fill="#fb7185" opacity="0.8" />
            <ellipse cx="74" cy="51" rx="4" ry="2.5" fill="#fb7185" opacity="0.8" />

            {/* MIỆNG CƯỜI TƯƠI RẠNG RỠ TO TRÒN HẠNH PHÚC */}
            <path
              d="M59 52C61 57 67 57 69 52"
              stroke="#9f1239"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {/* Hàm răng xinh tươi */}
            <path
              d="M60.5 53C62 55 66 55 67.5 53"
              fill="#ffffff"
            />

            {/* KHĂN LỤA ĐỎ BẢN DÀY BỊT MẮT NGANG MẶT */}
            <path
              d="M47 40C52 38 76 38 81 40C82 43 81 47 79 48C74 46 54 46 49 48C47 47 46 43 47 40Z"
              fill="url(#redRibbonGrad)"
              stroke="#7f1d1d"
              strokeWidth="1"
              filter="drop-shadow(0 2px 3px rgba(0,0,0,0.25))"
            />
            {/* Đường nẹp và nếp gấp của dải lụa đỏ */}
            <path d="M50 43C56 41 72 41 78 43" stroke="#fca5a5" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
          </g>

          {/* ============================================================== */}
          {/* LỚP 4: CẢNH ÔM VỊT TRƯỚC NGỰC KHI BẮT ĐƯỢC CHÚ VỊT */}
          {/* ============================================================== */}
          {isHoldingDuck && (
            <g className="animate-wiggle" transform="translate(64, 68) translate(-64, -68)">
              {/* Chú vịt vàng nhỏ ôm gọn trước ngực */}
              <ellipse cx="64" cy="68" rx="14" ry="11" fill="#fde047" stroke="#ca8a04" strokeWidth="1.2" />
              <circle cx="72" cy="62" r="8" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
              {/* Mỏ vịt */}
              <path d="M78 62C83 62 85 64 83 66C81 67 78 66 76 64Z" fill="#f97316" stroke="#c2410c" strokeWidth="0.8" />
              {/* Mắt vịt nhắm tít cười sung sướng ^^ */}
              <path d="M72 60C73 59 75 59 76 60" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
              <ellipse cx="71" cy="63" rx="2" ry="1.2" fill="#f472b6" opacity="0.8" />
              {/* Cánh vịt */}
              <ellipse cx="61" cy="68" rx="7" ry="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />

              {/* HAI CÁNH TAY CẬU BÉ ÔM TRỌN CHÚ VỊT */}
              <path
                d="M50 63C52 68 56 74 64 74C72 74 76 68 78 63"
                stroke="url(#brownShirtGrad)"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Hai bàn tay đan trước bụng vịt */}
              <circle cx="61" cy="74" r="3.5" fill="url(#skinGradFront)" />
              <circle cx="67" cy="74" r="3.5" fill="url(#skinGradFront)" />

              {/* Trái tim yêu thương bay lên */}
              <g className="animate-bounce">
                <path
                  d="M64 50C62 47 58 48 58 51C58 54 64 57 64 57C64 57 70 54 70 51C70 48 66 47 64 50Z"
                  fill="#ef4444"
                />
              </g>
            </g>
          )}

        </svg>
      </div>
    </div>
  );
};
