import React from 'react';

/**
 * NHÂN VẬT HỌC SINH BÌNH THƯỜNG - CHẠY BỘ TỰ NHIÊN TRÊN MẶT ĐẤT:
 * 1. DÁNG ĐỨNG THẲNG UPRIGHT: Không nghiêng ngả, không nằm ngang như bơi dưới nước.
 * 2. TAY VUNG CHÂN BƯỚC NHƯ NGƯỜI THẬT:
 *    - Hai cánh tay gập khuỷu tay tự nhiên bên hông, đánh so le theo bước chạy.
 *    - Hai chân bước đi/chạy thẳng đứng dưới hông, dậm vững trên mặt cát.
 * 3. TRANG PHỤC HỌC SINH GỌN GÀNG, GẦN GŨI:
 *    - Áo cộc tay năng động, quần ngố thể thao, khăn đỏ bịt mắt ngang tầm mắt.
 *    - Đứng và chạy hoàn toàn trên mặt đất có bóng đổ ôm sát dưới chân.
 */
export const DuckPlayerSprite = ({
  x = 0,
  y = 0,
  direction = 'right',
  characterType = 'boy', // 'boy' | 'girl'
  isCatching = false,
  isWalking = true,
  isHoldingDuck = false
}) => {
  const isFacingLeft = direction === 'left';
  const isGirl = characterType === 'girl';

  return (
    <div
      className="absolute pointer-events-none select-none z-30 transition-transform duration-75 ease-out"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        // Lật ngang theo hướng di chuyển trái/phải
        transform: `translate(-50%, -92%) ${isFacingLeft && !isHoldingDuck ? 'scaleX(-1)' : 'scaleX(1)'}`,
        willChange: 'left, top, transform'
      }}
    >
      {/* 1. Bóng đổ tiếp xúc mặt đất ngay dưới hai bàn chân */}
      <div
        className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
        style={{
          width: isHoldingDuck ? '56px' : '48px',
          height: '10px',
          backgroundColor: 'rgba(50, 30, 10, 0.45)',
          filter: 'blur(2px)'
        }}
      />

      {/* 2. KHỐI NHÂN VẬT SVG ĐỨNG THẲNG UPRIGHT TỰ NHIÊN (120x135px) */}
      <div className={`relative w-30 h-34 flex flex-col items-center transition-transform duration-150 ${isCatching ? 'scale-105' : ''}`}>
        <svg
          width="120"
          height="135"
          viewBox="0 0 120 135"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md overflow-visible"
        >
          <defs>
            {/* Màu da tự nhiên, khỏe khoắn */}
            <radialGradient id="normalSkin" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fff7ed" />
              <stop offset="65%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fb923c" />
            </radialGradient>

            {/* Dải khăn đỏ bịt mắt */}
            <linearGradient id="blindfoldSilk" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="40%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>

            {/* Áo học sinh: Vàng đất hoặc Nâu ấm thanh lịch */}
            <linearGradient id="shirtStudentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isGirl ? '#fda4af' : '#fbbf24'} />
              <stop offset="60%" stopColor={isGirl ? '#f43f5e' : '#d97706'} />
              <stop offset="100%" stopColor={isGirl ? '#be123c' : '#92400e'} />
            </linearGradient>

            {/* Quần short học sinh sẫm màu */}
            <linearGradient id="shortsDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Nón lá tre */}
            <radialGradient id="hatGrad" cx="50%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#a16207" />
            </radialGradient>
          </defs>

          {/* ============================================================== */}
          {/* TƯ THẾ 1: CHẠY BỘ THẲNG ĐỨNG TỰ NHIÊN NHƯ NGƯỜI NGOÀI ĐỜI */}
          {/* ============================================================== */}
          {!isHoldingDuck ? (
            <g className={isWalking ? 'animate-normal-body' : ''}>
              
              {/* NÓN LÁ ĐỘI RA SAU ĐẦU GỌN GÀNG */}
              <g transform="translate(24, 18) rotate(-12)">
                <ellipse cx="22" cy="18" rx="22" ry="12" fill="#78350f" opacity="0.25" />
                <path
                  d="M22 2L2 24C2 24 12 29 22 29C32 29 42 24 42 24L22 2Z"
                  fill="url(#hatGrad)"
                  stroke="#a16207"
                  strokeWidth="1.2"
                />
                <circle cx="22" cy="2" r="2" fill="#78350f" />
              </g>

              {/* DẢI LỤA ĐỎ NƠ THẮT BAY PHÍA SAU */}
              <g>
                <path d="M42 42C32 40 22 46 16 52C22 53 30 50 38 46Z" fill="url(#blindfoldSilk)" />
                <path d="M40 45C32 48 24 57 18 64C25 62 33 56 38 50Z" fill="#991b1b" />
              </g>

              {/* TAY SAU (GẬP KHUỶU TAY ĐÁNH SAU NHƯ NGƯỜI CHẠY BỘ THẬT) */}
              <g
                className={isWalking ? 'animate-normal-arm-back' : ''}
                style={{ transformOrigin: '50px 58px' }}
              >
                {/* Ống tay áo sau */}
                <path d="M50 56L42 66L47 69L54 58Z" fill="url(#shirtStudentGrad)" />
                {/* Cánh tay gập khuỷu tay đánh nhịp */}
                <path
                  d="M44 67L36 78C35 80 37 83 40 83C43 83 45 81 48 78L49 69Z"
                  fill="url(#normalSkin)"
                  stroke="#ea580c"
                  strokeWidth="0.8"
                />
                {/* Bàn tay nắm nhẹ khi chạy */}
                <circle cx="39" cy="81" r="3.6" fill="url(#normalSkin)" stroke="#ea580c" strokeWidth="0.8" />
              </g>

              {/* CHÂN SAU (BƯỚC CHẠY THẲNG DƯỚI HÔNG, VUNG GÓT TỰ NHIÊN) */}
              <g
                className={isWalking ? 'animate-normal-leg-back' : ''}
                style={{ transformOrigin: '54px 78px' }}
              >
                {/* Ống quần sau */}
                <path d="M48 76L42 92L52 94L56 78Z" fill="url(#shortsDark)" />
                {/* Cẳng chân & Bàn chân sau dậm đẩy mặt đất */}
                <path
                  d="M44 92L40 108C39 111 41 114 46 114C49 114 51 112 51 108L50 93Z"
                  fill="url(#normalSkin)"
                  stroke="#ea580c"
                  strokeWidth="0.8"
                />
                <ellipse cx="43" cy="112" rx="5" ry="2.2" fill="#f97316" />
              </g>

              {/* THÂN NGƯỜI ĐỨNG THẲNG UPRIGHT (KHÔNG BỊ NẰM NGANG) */}
              <g>
                {/* Áo cộc tay học sinh dáng thẳng */}
                <path
                  d="M46 54C46 54 54 48 64 49C74 50 80 56 78 68L48 72C44 66 45 58 46 54Z"
                  fill="url(#shirtStudentGrad)"
                  stroke="#3b1d0c"
                  strokeWidth="1.2"
                />

                {/* Khăn vải trắng thắt eo nhẹ nhàng */}
                <rect x="47" y="70" width="31" height="5" rx="1.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <path d="M49 74C46 78 44 86 46 91C48 88 51 82 52 75Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />

                {/* Tóc cô bé nếu là girl */}
                {isGirl && (
                  <g className="animate-wiggle" style={{ transformOrigin: '44px 62px' }}>
                    <ellipse cx="42" cy="66" rx="3.5" ry="5" fill="#0f172a" />
                    <ellipse cx="43" cy="74" rx="3" ry="4.5" fill="#0f172a" />
                    <circle cx="43" cy="80" r="2.5" fill="#ef4444" />
                  </g>
                )}

                {/* ============================================================== */}
                {/* ĐẦU & KHUÔN MẶT CẬU BÉ HỌC SINH ĐỨNG THẲNG */}
                {/* ============================================================== */}
                <g>
                  {/* Khối đầu tròn đáng yêu */}
                  <circle cx="66" cy="40" r="16.5" fill="url(#normalSkin)" stroke="#ea580c" strokeWidth="0.8" />

                  {/* Tóc mái học sinh gọn gàng */}
                  <path d="M52 30C58 24 72 24 76 30C72 27 64 26 58 28Z" fill="#1e293b" />

                  {/* KHĂN ĐỎ BỊT KÍN NGANG TẦM MẮT (ĐÚNG LUẬT TRÒ CHƠI) */}
                  <path
                    d="M50 34C58 31 76 31 82 35C83 39 82 45 78 47C72 45 58 45 52 46C48 43 48 37 50 34Z"
                    fill="url(#blindfoldSilk)"
                    stroke="#7f1d1d"
                    strokeWidth="1.2"
                  />
                  {/* Hai mắt cười híp hóm hỉnh ^^ trên bề mặt lụa đỏ */}
                  <path d="M59 39C61 37 64 37 65 39" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9" />
                  <path d="M70 39C72 37 75 37 76 39" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9" />

                  {/* Sống mũi nhỏ bên dưới khăn */}
                  <circle cx="75" cy="45" r="1" fill="#ea580c" opacity="0.8" />

                  {/* Má hồng phúng phính */}
                  <ellipse cx="73" cy="48" rx="4.2" ry="2.6" fill="#fb7185" opacity="0.85" />
                  <ellipse cx="58" cy="47" rx="3.5" ry="2.2" fill="#fb7185" opacity="0.75" />

                  {/* Miệng cười tươi hiền lành */}
                  <path d="M68 49C71 54 77 53 79 49" stroke="#9f1239" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                  <path d="M70 50C72 52 75 52 77 50" fill="#ffffff" />
                </g>
              </g>

              {/* CHÂN TRƯỚC (BƯỚC TỚI TRƯỚC CHẠM ĐẤT TỰ NHIÊN) */}
              <g
                className={isWalking ? 'animate-normal-leg-front' : ''}
                style={{ transformOrigin: '66px 78px' }}
              >
                {/* Ống quần trước */}
                <path d="M60 76L70 91L80 89L72 76Z" fill="url(#shortsDark)" />
                {/* Cẳng chân & Bàn chân trước chạm đất vững vàng */}
                <path
                  d="M70 91L73 108C73 111 77 113 83 113C86 113 87 110 86 107L80 91Z"
                  fill="url(#normalSkin)"
                  stroke="#ea580c"
                  strokeWidth="0.8"
                />
                <ellipse cx="80" cy="111" rx="5.5" ry="2.4" fill="#f97316" />
              </g>

              {/* TAY TRƯỚC (GẬP KHUỶU TAY VUNG TRƯỚC NHƯ NGƯỜI CHẠY BỘ) */}
              <g
                className={isWalking ? 'animate-normal-arm-front' : ''}
                style={{ transformOrigin: '65px 56px' }}
              >
                {/* Ống tay áo trước */}
                <path d="M63 56L72 65L77 62L68 54Z" fill="url(#shirtStudentGrad)" />
                {/* Cẳng tay vươn phía trước tự nhiên (hoặc dang ra khi sắp bắt) */}
                <path
                  d={isCatching
                    ? "M73 64C83 62 96 61 104 63C107 64 107 67 104 69C97 73 86 74 76 72Z"
                    : "M73 64L84 72C86 74 88 77 86 80C83 82 80 81 78 78L72 68Z"}
                  fill="url(#normalSkin)"
                  stroke="#ea580c"
                  strokeWidth="0.8"
                />
                {/* Bàn tay xòe tự nhiên */}
                <circle cx={isCatching ? 104 : 85} cy={isCatching ? 65 : 77} r="3.8" fill="url(#normalSkin)" stroke="#ea580c" strokeWidth="0.8" />
              </g>
            </g>
          ) : (
            // ==============================================================
            // TƯ THẾ 2: ĐỨNG THẲNG ÔM CHÚ VỊT VÀO LÒNG (CHIẾN THẮNG)
            // ==============================================================
            <g className="animate-wiggle" transform="translate(60, 68) translate(-60, -68)">
              {/* Nón lá sau đầu */}
              <g transform="translate(60, 20) rotate(-2) translate(-60, -20)">
                <ellipse cx="60" cy="18" rx="26" ry="13" fill="#854d0e" opacity="0.25" />
                <path d="M60 2L30 24C30 24 45 29 60 29C75 29 90 24 90 24L60 2Z" fill="url(#hatGrad)" stroke="#854d0e" strokeWidth="1.2" />
              </g>

              {/* Thân áo đứng thẳng */}
              <path
                d="M44 56C44 50 52 48 60 48C68 48 76 50 76 56L74 78C66 80 54 80 46 78Z"
                fill="url(#shirtStudentGrad)"
                stroke="#3f220f"
                strokeWidth="1.2"
              />
              <rect x="45" y="73" width="30" height="5" rx="1.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />

              {/* Hai chân đứng thẳng đứng trên mặt đất */}
              <rect x="47" y="80" width="10" height="15" rx="2" fill="url(#shortsDark)" />
              <rect x="63" y="80" width="10" height="15" rx="2" fill="url(#shortsDark)" />
              <path d="M47 95L46 112C46 115 51 116 57 116L57 95Z" fill="url(#normalSkin)" />
              <path d="M73 95L74 112C74 115 69 116 63 116L63 95Z" fill="url(#normalSkin)" />

              {/* ĐẦU CHÍNH DIỆN: BỊT KÍN MẮT BẰNG KHĂN ĐỎ */}
              <circle cx="60" cy="38" r="17" fill="url(#normalSkin)" stroke="#ea580c" strokeWidth="0.8" />
              
              {/* Khăn đỏ bịt kín ngang mắt */}
              <path
                d="M42 33C48 30 72 30 78 33C80 37 79 43 76 45C70 43 50 43 44 45C42 43 41 37 42 33Z"
                fill="url(#blindfoldSilk)"
                stroke="#7f1d1d"
                strokeWidth="1.2"
              />
              {/* Hai mắt cười híp ^^ trên khăn */}
              <path d="M49 38C51 36 54 36 56 38" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M64 38C66 36 69 36 71 38" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />

              {/* Má hồng & Miệng cười vui mừng */}
              <ellipse cx="48" cy="46" rx="4" ry="2.6" fill="#fb7185" opacity="0.85" />
              <ellipse cx="72" cy="46" rx="4" ry="2.6" fill="#fb7185" opacity="0.85" />
              <path d="M54 48C57 54 63 54 66 48" fill="#9f1239" stroke="#881337" strokeWidth="0.8" />
              <path d="M56 49C58 51 62 51 64 49" fill="#ffffff" />

              {/* CHÚ VỊT NHỎ ĐÁNG YÊU ĐƯỢC ÔM TRONG TAY */}
              <g transform="translate(60, 68) scale(1.05) translate(-60, -68)">
                {/* Thân vịt trắng/vàng con */}
                <ellipse cx="60" cy="66" rx="14" ry="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
                <circle cx="68" cy="60" r="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <circle cx="71" cy="58" r="2.6" fill="#0f172a" />
                <circle cx="72" cy="57" r="1" fill="#ffffff" />
                <path d="M74 60C79 60 81 62 79 64C77 65 74 64 72 62Z" fill="#f97316" stroke="#c2410c" strokeWidth="0.8" />
                <ellipse cx="56" cy="66" rx="7" ry="4.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />

                {/* Hai cánh tay ôm trọn vịt */}
                <path
                  d="M46 60C48 66 52 71 60 71C68 71 72 66 74 60"
                  stroke="url(#shirtStudentGrad)"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <circle cx="56" cy="71" r="3.6" fill="url(#normalSkin)" />
                <circle cx="64" cy="71" r="3.6" fill="url(#normalSkin)" />
              </g>
            </g>
          )}

        </svg>
      </div>
    </div>
  );
};
