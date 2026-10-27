import React from 'react';

/**
 * NHÂN VẬT HOẠT HÌNH 3D PIXAR - CẬU BÉ BỊT MẮT BẮT VỊT (CHUẨN 100% PROMPT THẦY YÊU CẦU):
 * - Conical hat (Nón lá tre) đội nghiêng nhẹ sau gáy.
 * - Khăn đỏ BỊT KÍN MẮT THẬT SỰ (Bright red cloth blindfold tied around his eyes with knot at the side).
 *   TUYỆT ĐỐI KHÔNG BỊT Ở TRÁN MÀ PHỦ KÍN ĐÚNG TẦM MẮT.
 * - Khuôn mặt tròn bầu bĩnh đáng yêu, má hồng (rosy cheeks), miệng cười tươi há to hào hứng (cheerful open-mouth smile).
 * - Áo bà ba nâu mộc mạc tay ngắn xắn gấu (brown rustic ao ba ba style shirt with short rolled sleeves).
 * - Quần ngố xám nâu (grey-brown short trousers).
 * - Dải khăn vải trắng thắt eo (white cloth sash tied at the waist with dangling knot).
 * - Chân trần (bare feet) chạm đất vững vàng có bóng đổ tiếp xúc và vệt gió lướt (motion-speed lines).
 * - Dáng chạy nghiêng người lao về phía trước, hai tay dang rộng với ra bắt vịt (arms outstretched in front to grab).
 * - Sải chân bước chạy tới lui tự nhiên chân thực, KHÔNG NHẢY HÀNG NGANG.
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
        // Lật ngang theo hướng chạy trái/phải
        transform: `translate(-50%, -90%) ${isFacingLeft && !isHoldingDuck ? 'scaleX(-1)' : 'scaleX(1)'}`,
        willChange: 'left, top, transform'
      }}
    >
      {/* 1. Bóng đổ tiếp xúc mặt đất dưới chân (Không lơ lửng) */}
      <div
        className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
        style={{
          width: isHoldingDuck ? '65px' : '58px',
          height: '11px',
          backgroundColor: 'rgba(56, 34, 12, 0.45)',
          filter: 'blur(2.5px)'
        }}
      />

      {/* Vệt gió tốc độ màu trắng dưới chân (Motion speed lines) */}
      {isWalking && !isHoldingDuck && (
        <div className="absolute bottom-3 -left-4 pointer-events-none opacity-70">
          <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
            <path d="M28 2L6 2" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
            <path d="M24 7L2 7" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M20 11L8 11" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* 2. KHỐI NHÂN VẬT SVG PIXAR 3D CHUẨN ĐẸP (140x145px) */}
      <div className={`relative w-35 h-36 flex flex-col items-center transition-transform duration-200 ${isCatching ? 'scale-105' : ''}`}>
        <svg
          width="140"
          height="145"
          viewBox="0 0 140 145"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md overflow-visible"
        >
          <defs>
            {/* Làn da bánh mật / da sáng mịn màng kiểu Pixar */}
            <radialGradient id="pixarSkinGrad" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fff5ea" />
              <stop offset="55%" stopColor="#fedac0" />
              <stop offset="100%" stopColor="#f5aa7c" />
            </radialGradient>

            {/* Khăn đỏ bịt mắt chất liệu lụa bóng 3D */}
            <linearGradient id="blindfoldRedGrad" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="25%" stopColor="#ef4444" />
              <stop offset="70%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>

            {/* Áo bà ba nâu mộc mạc 3D */}
            <radialGradient id="brownAoBaBaGrad" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#a16207" />
              <stop offset="40%" stopColor="#854d0e" />
              <stop offset="85%" stopColor="#713f12" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>

            {/* Quần ngố xám nâu (Grey-brown trousers) */}
            <linearGradient id="greyBrownPants" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="60%" stopColor="#475569" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* Dải khăn trắng thắt lưng */}
            <linearGradient id="whiteSashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Nón lá tre vàng óng 3D */}
            <radialGradient id="pixarHatGrad" cx="50%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#eab308" />
              <stop offset="80%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </radialGradient>
          </defs>

          {/* ============================================================== */}
          {/* TƯ THẾ 1: CHẠY LAO VỀ PHÍA TRƯỚC, BỊT KÍN MẮT, HAI TAY DANG BẮT */}
          {/* ============================================================== */}
          {!isHoldingDuck ? (
            <g className={isWalking ? 'animate-pixar-body' : ''} style={{ transformOrigin: '70px 110px' }}>
              
              {/* NÓN LÁ TRE TRUYỀN THỐNG ĐỘI NGHIÊNG RA SAU ĐẦU */}
              <g transform="translate(32, 18) rotate(-16)">
                <ellipse cx="26" cy="20" rx="26" ry="14" fill="#78350f" opacity="0.25" />
                <path
                  d="M26 2L2 28C2 28 14 34 26 34C38 34 50 28 50 28L26 2Z"
                  fill="url(#pixarHatGrad)"
                  stroke="#a16207"
                  strokeWidth="1.2"
                />
                <circle cx="26" cy="2" r="2.2" fill="#78350f" />
                {/* Vành nón lá đan nan tre */}
                <path d="M8 26C16 30 36 30 44 26" stroke="#ca8a04" strokeWidth="0.8" opacity="0.6" />
              </g>

              {/* DẢI LỤA ĐỎ BUỘC NÚT PHÍA SAU ĐẦU BAY PHẤP PHỚI */}
              <g className="animate-pulse">
                {/* Nút thắt dải lụa bên thái dương */}
                <ellipse cx="51" cy="50" rx="4.5" ry="3.5" fill="#b91c1c" />
                {/* Dải lụa bay dài theo gió */}
                <path d="M48 50C36 48 24 54 14 62C21 63 32 60 42 55Z" fill="url(#blindfoldRedGrad)" />
                <path d="M46 53C35 57 26 68 18 78C26 75 35 68 42 60Z" fill="#b91c1c" />
              </g>

              {/* CHÂN SAU (VUNG RA SAU THEO NHỊP CHẠY TỰ NHIÊN) */}
              <g
                className={isWalking ? 'animate-pixar-leg-back' : ''}
                style={{ transformOrigin: '58px 90px' }}
              >
                {/* Ống quần xám sau */}
                <path d="M54 88L40 106L51 110L62 92Z" fill="url(#greyBrownPants)" />
                {/* Bắp chân & Bàn chân trần sau chạm đẩy cát */}
                <path
                  d="M40 106L32 120C31 123 34 126 39 126C43 126 46 124 47 120L51 110Z"
                  fill="url(#pixarSkinGrad)"
                  stroke="#ea580c"
                  strokeWidth="0.8"
                />
                {/* Các ngón chân trần */}
                <circle cx="33" cy="123" r="2.2" fill="#f97316" />
                <circle cx="37" cy="124" r="2" fill="#f97316" />
              </g>

              {/* THÂN NGƯỜI & ÁO BÀ BA NÂU DÂN DÃ */}
              <g>
                {/* Thân áo bà ba nâu ôm dáng nghiêng tới trước */}
                <path
                  d="M52 64C52 64 62 58 75 60C85 62 92 68 88 83L54 87C49 80 50 70 52 64Z"
                  fill="url(#brownAoBaBaGrad)"
                  stroke="#3b1d0c"
                  strokeWidth="1.2"
                />

                {/* Khăn vải trắng thắt eo (White cloth sash at waist) */}
                <path d="M54 82C62 81 78 81 87 83L86 87C77 85 60 85 53 86Z" fill="url(#whiteSashGrad)" stroke="#cbd5e1" strokeWidth="1" />
                {/* Dải vải buông rủ xuống hông */}
                <path d="M57 85C53 91 50 100 52 106C55 103 59 95 61 87Z" fill="url(#whiteSashGrad)" stroke="#94a3b8" strokeWidth="0.8" />

                {/* Hàng cúc áo bà ba */}
                <circle cx="72" cy="67" r="1.5" fill="#fef08a" />
                <circle cx="70" cy="74" r="1.5" fill="#fef08a" />
                <circle cx="68" cy="80" r="1.5" fill="#fef08a" />

                {/* Tóc cô bé (bím tóc) nếu chọn girl */}
                {isGirl && (
                  <g className="animate-wiggle" style={{ transformOrigin: '50px 72px' }}>
                    <ellipse cx="48" cy="78" rx="4" ry="5.5" fill="#0f172a" />
                    <ellipse cx="49" cy="86" rx="3.5" ry="5" fill="#0f172a" />
                    <ellipse cx="50" cy="94" rx="3" ry="4.5" fill="#0f172a" />
                    <circle cx="50" cy="100" r="3" fill="#ef4444" />
                  </g>
                )}

                {/* ============================================================== */}
                {/* ĐẦU & KHUÔN MẶT: BỊT KÍN MẮT BẰNG KHĂN ĐỎ THẬT SỰ */}
                {/* ============================================================== */}
                <g>
                  {/* Khối đầu tròn bầu bĩnh đáng yêu (Pixar head) */}
                  <circle cx="75" cy="48" r="18.5" fill="url(#pixarSkinGrad)" stroke="#ea580c" strokeWidth="0.8" />

                  {/* Lọn tóc mái đen lấp ló trên trán */}
                  <path d="M60 36C66 30 78 30 84 37C80 34 72 32 66 34Z" fill="#1e293b" />

                  {/* ============================================================ */}
                  {/* ĐÂY LÀ ĐIỂM CỐT LÕI: KHĂN ĐỎ BỊT KÍN MẮT THẬT SỰ (KHÔNG Ở TRÁN) */}
                  {/* Phủ kín từ y=41 đến y=56 (toàn bộ vị trí mắt), uốn lượn 3D mềm mại */}
                  {/* ============================================================ */}
                  <path
                    d="M56 42C64 38 86 38 93 43C94 48 93 54 88 56C82 54 64 54 58 55C54 52 54 45 56 42Z"
                    fill="url(#blindfoldRedGrad)"
                    stroke="#7f1d1d"
                    strokeWidth="1.2"
                  />
                  {/* Đường viền ánh sáng vàng lễ hội phản chiếu trên dải lụa */}
                  <path d="M60 46C68 43 82 43 88 47" stroke="#fecdd3" strokeWidth="1" strokeLinecap="round" opacity="0.8" />

                  {/* Hai đường cong mắt cười híp hóm hỉnh ^ ^ ánh lên trên mặt lụa đỏ */}
                  <path d="M68 48C70 46 73 46 74 48" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.9" />
                  <path d="M78 48C80 46 83 46 84 48" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.9" />

                  {/* Sống mũi nhỏ xinh xắn lộ phía dưới dải bịt mắt */}
                  <circle cx="85" cy="54" r="1.2" fill="#ea580c" opacity="0.8" />

                  {/* HAI GÒ MÁ HỒNG PHÚNG PHÍNH (Rosy cheeks) */}
                  <ellipse cx="83" cy="57" rx="5" ry="3.2" fill="#fb7185" opacity="0.85" />
                  <ellipse cx="68" cy="56" rx="4" ry="2.8" fill="#fb7185" opacity="0.75" />

                  {/* MIỆNG CƯỜI TƯƠI HÁ TO HÀO HỨNG (Cheerful open-mouth smile) */}
                  <path d="M76 58C79 65 87 64 89 58" fill="#9f1239" stroke="#881337" strokeWidth="1" />
                  {/* Răng trắng & Lưỡi hồng xinh xắn */}
                  <path d="M78 59C80 61 85 61 87 59" fill="#ffffff" />
                  <ellipse cx="82.5" cy="62" rx="3" ry="1.6" fill="#f43f5e" />
                </g>
              </g>

              {/* CHÂN TRƯỚC (SẢI BƯỚC TỚI TRƯỚC CHẠM ĐẤT TỰ NHIÊN, KHÔNG NHẢY HÀNG NGANG) */}
              <g
                className={isWalking ? 'animate-pixar-leg-front' : ''}
                style={{ transformOrigin: '72px 88px' }}
              >
                {/* Ống quần xám trước */}
                <path d="M68 86L82 104L93 100L83 85Z" fill="url(#greyBrownPants)" />
                {/* Bắp chân & Bàn chân trần trước dậm vững trên cát */}
                <path
                  d="M82 104L86 119C86 122 91 124 97 124C100 124 102 121 100 117L93 100Z"
                  fill="url(#pixarSkinGrad)"
                  stroke="#ea580c"
                  strokeWidth="0.8"
                />
                {/* Các ngón chân trần */}
                <circle cx="95" cy="122" r="2.4" fill="#f97316" />
                <circle cx="99" cy="122" r="2.1" fill="#f97316" />
              </g>

              {/* HAI TAY DANG RỘNG VỀ PHÍA TRƯỚC BẮT VỊT (ARMS OUTSTRETCHED TO GRAB) */}
              <g
                className={isWalking ? 'animate-pixar-arms' : ''}
                style={{ transformOrigin: '72px 68px' }}
              >
                {/* Tay sau vươn ra trước */}
                <path
                  d="M66 66C74 65 88 64 96 66C99 67 100 70 97 72C92 75 80 76 72 75Z"
                  fill="#713f12"
                />
                {/* Tay áo nâu xắn gấu */}
                <ellipse cx="78" cy="69" rx="3.5" ry="5.5" fill="#451a03" />

                {/* Bàn tay sau mở ngón mò mẫm */}
                <circle cx="98" cy="69" r="4.2" fill="url(#pixarSkinGrad)" stroke="#ea580c" strokeWidth="0.8" />

                {/* Tay trước vươn dài nhất đón bắt */}
                <path
                  d="M74 68C86 67 104 66 114 68C117 69 118 72 115 74C108 79 94 80 82 78Z"
                  fill="url(#brownAoBaBaGrad)"
                  stroke="#3b1d0c"
                  strokeWidth="1"
                />
                {/* Tay áo xắn gấu trước */}
                <ellipse cx="88" cy="72" rx="4" ry="6" fill="#451a03" />

                {/* Bàn tay trước 5 ngón xòe rộng vồ bắt vịt */}
                <path
                  d="M114 67C118 64 124 64 126 67C127 69 123 71 121 72C124 73 126 75 125 78C122 79 119 77 117 76C118 78 117 80 115 80C112 80 111 77 111 74Z"
                  fill="url(#pixarSkinGrad)"
                  stroke="#ea580c"
                  strokeWidth="0.8"
                />
              </g>
            </g>
          ) : (
            // ==============================================================
            // TƯ THẾ 2: CHIẾN THẮNG - ÔM CHÚ VỊT CON VÀO LÒNG CƯỜI HẠNH PHÚC
            // ==============================================================
            <g className="animate-wiggle" transform="translate(70, 72) translate(-70, -72)">
              {/* Nón lá sau đầu */}
              <g transform="translate(70, 24) rotate(-3) translate(-70, -24)">
                <ellipse cx="70" cy="22" rx="30" ry="15" fill="#854d0e" opacity="0.25" />
                <path d="M70 2L36 28C36 28 53 34 70 34C87 34 104 28 104 28L70 2Z" fill="url(#pixarHatGrad)" stroke="#854d0e" strokeWidth="1.2" />
              </g>

              {/* Thân áo nâu */}
              <path
                d="M50 64C50 58 60 55 70 55C80 55 90 58 90 64L88 90C78 92 62 92 52 90Z"
                fill="url(#brownAoBaBaGrad)"
                stroke="#3f220f"
                strokeWidth="1.2"
              />
              <rect x="51" y="84" width="38" height="6" rx="2" fill="url(#whiteSashGrad)" stroke="#cbd5e1" strokeWidth="1" />

              {/* Hai chân đứng vững trên mặt cát */}
              <rect x="54" y="92" width="11" height="15" rx="2" fill="url(#greyBrownPants)" />
              <rect x="75" y="92" width="11" height="15" rx="2" fill="url(#greyBrownPants)" />
              <path d="M54 107L52 121C52 124 58 125 66 125L66 107Z" fill="url(#pixarSkinGrad)" />
              <path d="M86 107L88 121C88 124 82 125 74 125L74 107Z" fill="url(#pixarSkinGrad)" />

              {/* ĐẦU CHÍNH DIỆN: BỊT KÍN MẮT BẰNG KHĂN ĐỎ */}
              <circle cx="70" cy="46" r="19" fill="url(#pixarSkinGrad)" stroke="#ea580c" strokeWidth="0.8" />
              
              {/* Khăn đỏ bịt kín ngang mắt */}
              <path
                d="M50 40C56 36 84 36 90 40C92 45 91 52 88 54C82 52 58 52 52 54C49 52 48 45 50 40Z"
                fill="url(#blindfoldRedGrad)"
                stroke="#7f1d1d"
                strokeWidth="1.2"
              />
              {/* Hai mắt cười híp hóm hỉnh ^ ^ trên khăn */}
              <path d="M58 46C60 44 63 44 65 46" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              <path d="M75 46C77 44 80 44 82 46" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" fill="none" />

              {/* Má hồng phúng phính & Miệng cười há to vui sướng ^^ */}
              <ellipse cx="56" cy="54" rx="4.8" ry="3.2" fill="#fb7185" opacity="0.85" />
              <ellipse cx="84" cy="54" rx="4.8" ry="3.2" fill="#fb7185" opacity="0.85" />
              <path d="M63 56C66 63 74 63 77 56" fill="#9f1239" stroke="#881337" strokeWidth="1" />
              <path d="M65 57C67 59 73 59 75 57" fill="#ffffff" />

              {/* CHÚ VỊT TRẮNG ĐÁNG YÊU ĐƯỢC ÔM TRONG TAY (PIXAR DUCKLING) */}
              <g transform="translate(70, 75) scale(1.1) translate(-70, -75)">
                {/* Thân vịt trắng muốt */}
                <ellipse cx="70" cy="74" rx="16" ry="13" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
                {/* Đầu vịt tròn xoe */}
                <circle cx="79" cy="67" r="9.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                {/* Mắt vịt to tròn ngơ ngác khi bị bế */}
                <circle cx="82" cy="65" r="3.2" fill="#0f172a" />
                <circle cx="83" cy="64" r="1.2" fill="#ffffff" />
                {/* Má hồng của chú vịt */}
                <ellipse cx="80" cy="69" rx="2.5" ry="1.5" fill="#fb7185" opacity="0.8" />
                {/* Mỏ vịt cam há to */}
                <path d="M86 67C92 67 94 69 92 71C89 72 86 71 84 69Z" fill="#f97316" stroke="#c2410c" strokeWidth="0.8" />
                <ellipse cx="66" cy="74" rx="8" ry="5.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />

                {/* Hai tay ôm trọn chú vịt */}
                <path
                  d="M54 68C56 74 61 80 70 80C79 80 84 74 86 68"
                  stroke="url(#brownAoBaBaGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <circle cx="66" cy="80" r="4.2" fill="url(#pixarSkinGrad)" />
                <circle cx="74" cy="80" r="4.2" fill="url(#pixarSkinGrad)" />

                {/* Trái tim yêu thương bung nở */}
                <g className="animate-bounce">
                  <path
                    d="M70 52C67 48 62 49 62 53C62 57 70 61 70 61C70 61 78 57 78 53C78 49 73 48 70 52Z"
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
