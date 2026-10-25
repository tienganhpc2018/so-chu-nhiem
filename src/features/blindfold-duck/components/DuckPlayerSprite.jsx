import React from 'react';

/**
 * SPRITE NGƯỜI BỊT MẮT HOẠT HÌNH 3D CỰC KỲ THIỆN CẢM & DỄ THƯƠNG:
 * 1. KHUÔN MẶT THIỆN CẢM, ĐÁNG YÊU: Mắt anime to tròn long lanh, má hồng phúng phính, nụ cười tươi hiền hậu.
 * 2. CHÂN BƯỚC CHẠY BÌNH THƯỜNG NHƯ THẬT NGOÀI ĐỜI:
 *    - Khớp háng xoay tự nhiên (chân trước sải tới, chân sau vung ra sau luân phiên).
 *    - Tay đánh nhịp nhàng so le theo từng bước chạy.
 *    - KHÔNG NHẢY TƯNG TƯNG: Thân trên chỉ nhún nhẹ 2px nhịp bước dậm cát cực kỳ mượt mà.
 * 3. HỖ TRỢ 2 NHÂN VẬT THÂN THIỆN:
 *    - 'girl': Cô Bé Áo Bà Ba hồng đào, bím tóc nơ đỏ, nón lá tre xinh xắn.
 *    - 'boy': Cậu Bé Áo Nâu/Vàng đất khôi ngô, tóc vuốt ngắn năng động.
 */
export const DuckPlayerSprite = ({
  x = 0,
  y = 0,
  direction = 'right',
  characterType = 'girl', // 'girl' | 'boy'
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
        // Khi chạy trái thì lật ngang mượt mà sang trái
        transform: `translate(-50%, -90%) ${isFacingLeft && !isHoldingDuck ? 'scaleX(-1)' : 'scaleX(1)'}`,
        willChange: 'left, top, transform'
      }}
    >
      {/* 1. Bóng đổ tiếp xúc chân thực trên cát */}
      <div
        className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
        style={{
          width: isHoldingDuck ? '64px' : '56px',
          height: '11px',
          backgroundColor: 'rgba(60, 36, 12, 0.45)',
          filter: 'blur(2px)'
        }}
      />

      {/* 2. KHỐI NHÂN VẬT SVG (140x140px) */}
      <div className={`relative w-35 h-35 flex flex-col items-center transition-transform duration-200 ${isCatching ? 'scale-105' : ''}`}>
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md overflow-visible"
        >
          <defs>
            {/* Làn da mịn màng, ấm áp thiện cảm */}
            <radialGradient id="cuteSkinGrad" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fff8f2" />
              <stop offset="65%" stopColor="#fedfc9" />
              <stop offset="100%" stopColor="#f8ba91" />
            </radialGradient>

            {/* Dải lụa đỏ buộc trán lễ hội */}
            <linearGradient id="festiveSilkRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="40%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>

            {/* Áo bà ba Cô Bé: Hồng đào pastel ngọt ngào */}
            <linearGradient id="girlShirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>

            {/* Áo Cậu Bé: Màu vàng đất / hổ phách ấm áp */}
            <linearGradient id="boyShirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>

            {/* Quần ống lụa sẫm màu thanh lịch */}
            <linearGradient id="pantsDarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Nón lá tre vàng óng */}
            <radialGradient id="cuteHatGrad" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#a16207" />
            </radialGradient>

            {/* Tóc đen mượt bóng */}
            <linearGradient id="softBlackHair" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="45%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
          </defs>

          {/* ============================================================== */}
          {/* TƯ THẾ 1: CHẠY BÌNH THƯỜNG TỰ NHIÊN NHƯ NGOÀI ĐỜI */}
          {/* ============================================================== */}
          {!isHoldingDuck ? (
            <g>
              {/* NÓN LÁ ĐEO SAU LƯNG XINH XẮN */}
              <g transform="translate(32, 28) rotate(-18)">
                <ellipse cx="22" cy="18" rx="20" ry="11" fill="#78350f" opacity="0.25" />
                <path
                  d="M22 2L2 24C2 24 12 28 22 28C32 28 42 24 42 24L22 2Z"
                  fill="url(#cuteHatGrad)"
                  stroke="#a16207"
                  strokeWidth="1.2"
                />
                <circle cx="22" cy="2" r="2" fill="#78350f" />
              </g>

              {/* DẢI LỤA ĐỎ PHẤP PHỚI THEO GIÓ */}
              <g className="animate-pulse">
                <path d="M46 47C36 45 26 50 18 57C23 58 32 55 40 51Z" fill="url(#festiveSilkRed)" />
                <path d="M44 50C36 52 28 61 22 68C29 66 36 60 41 55Z" fill="#991b1b" />
              </g>

              {/* TAY SAU (ĐÁNH NHỊP SO LE) */}
              <g
                className={isWalking ? 'animate-human-arm-back' : ''}
                style={{ transformOrigin: '58px 65px' }}
              >
                <path
                  d="M58 64C52 68 46 76 43 83C45 85 49 84 52 80C56 74 61 69 64 66Z"
                  fill={isGirl ? 'url(#girlShirtGrad)' : 'url(#boyShirtGrad)'}
                />
                <circle cx="43" cy="84" r="4.2" fill="url(#cuteSkinGrad)" stroke="#ea580c" strokeWidth="0.8" />
              </g>

              {/* CHÂN SAU (SẢI BƯỚC TỰ NHIÊN VỚI KHỚP HÁNG THỰC) */}
              <g
                className={isWalking ? 'animate-human-leg-back' : ''}
                style={{ transformOrigin: '60px 85px' }}
              >
                {/* Ống quần sau */}
                <path d="M56 83L45 100L55 104L65 86Z" fill="url(#pantsDarkGrad)" />
                {/* Bắp chân & Bàn chân sau chạm đất tự nhiên */}
                <path
                  d="M45 100L38 114C37 116 39 119 44 119C48 119 50 117 51 113L55 104Z"
                  fill="url(#cuteSkinGrad)"
                  stroke="#ea580c"
                  strokeWidth="0.8"
                />
                <ellipse cx="41" cy="117" rx="6" ry="2.5" fill="#f97316" opacity="0.9" />
              </g>

              {/* THÂN NGƯỜI & ĐẦU (NHÚN NHẸ 2PX THEO NHỊP BƯỚC CHẠY) */}
              <g className={isWalking ? 'animate-human-bob' : ''}>
                {/* Thân áo bà ba truyền thống mềm mại */}
                <path
                  d="M52 62C52 62 60 55 72 57C82 59 90 65 86 80L54 84C49 76 50 67 52 62Z"
                  fill={isGirl ? 'url(#girlShirtGrad)' : 'url(#boyShirtGrad)'}
                  stroke="#3b1d0c"
                  strokeWidth="1.2"
                />

                {/* Hàng khuy áo ngọc xinh xắn */}
                <circle cx="70" cy="64" r="1.5" fill="#ffffff" />
                <circle cx="68" cy="71" r="1.5" fill="#ffffff" />
                <circle cx="66" cy="78" r="1.5" fill="#ffffff" />

                {/* Dải thắt lưng vải lụa trắng */}
                <path d="M54 79C61 78 77 78 85 80L84 84C75 82 59 82 53 83Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <path d="M56 81C52 86 50 94 52 99C55 96 58 89 59 82Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.8" />

                {/* TÓC CÔ GÁI (BÍM TÓC XINH) HOẶC CẬU BÉ (TÓC NGẮN GỌN GÀNG) */}
                {isGirl ? (
                  <>
                    <path d="M50 46C44 54 42 66 45 74C47 76 50 75 52 72C54 66 54 56 58 48Z" fill="url(#softBlackHair)" />
                    {/* Bím tóc tết đung đưa có nơ đỏ xinh xắn */}
                    <g className="animate-wiggle" style={{ transformOrigin: '50px 70px' }}>
                      <ellipse cx="48" cy="76" rx="4" ry="5.5" fill="url(#softBlackHair)" />
                      <ellipse cx="49" cy="84" rx="3.5" ry="5" fill="url(#softBlackHair)" />
                      <ellipse cx="50" cy="92" rx="3" ry="4.5" fill="url(#softBlackHair)" />
                      <circle cx="50" cy="98" r="3" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.8" />
                    </g>
                  </>
                ) : (
                  /* Tóc cậu bé: Gọn gàng, lọn tóc mái tinh nghịch */
                  <path d="M48 42C46 50 48 58 54 62C56 62 58 56 58 50Z" fill="url(#softBlackHair)" />
                )}

                {/* ============================================================== */}
                {/* ĐẦU & KHUÔN MẶT CỰC KỲ THIỆN CẢM & DỄ THƯƠNG */}
                {/* ============================================================== */}
                <g>
                  {/* Khuôn mặt bầu bĩnh đáng yêu */}
                  <circle cx="74" cy="47" r="18" fill="url(#cuteSkinGrad)" stroke="#ea580c" strokeWidth="0.8" />

                  {/* Tóc mái trước trán uốn cong mềm mại */}
                  <path d="M58 42C64 34 82 34 90 42C86 38 74 36 66 38Z" fill="url(#softBlackHair)" />

                  {/* ĐÔI MẮT ANIME TO TRÒN LONG LANH RẤT CÓ THIỆN CẢM */}
                  <ellipse cx="80" cy="46" rx="3.8" ry="4.8" fill="#0f172a" />
                  <circle cx="81.5" cy="44.5" r="1.8" fill="#ffffff" />
                  <circle cx="79.2" cy="48" r="0.9" fill="#ffffff" />

                  {/* Mắt sau góc nghiêng */}
                  <ellipse cx="69" cy="45" rx="2.8" ry="4.2" fill="#0f172a" />
                  <circle cx="70.2" cy="43.8" r="1.4" fill="#ffffff" />

                  {/* Lông mày thanh tú hiền hậu */}
                  <path d="M76 39C78 37 83 38 85 40" stroke="#451a03" strokeWidth="1.6" strokeLinecap="round" />

                  {/* Mũi chấm nhỏ xinh xắn */}
                  <circle cx="84" cy="49" r="1.1" fill="#ea580c" opacity="0.8" />

                  {/* GÒ MÁ HỒNG PHÚNG PHÍNH ĐÁNG YÊU */}
                  <ellipse cx="82" cy="53" rx="5" ry="3.2" fill="#fb7185" opacity="0.85" />
                  <ellipse cx="68" cy="52" rx="4" ry="2.8" fill="#fb7185" opacity="0.75" />

                  {/* MIỆNG CƯỜI TƯƠI RẠNG RỠ, THIỆN CẢM */}
                  <path d="M77 54C80 59 86 58 88 54" stroke="#9f1239" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                  <path d="M79 55C81 57.5 84.5 57.5 86.5 55" fill="#ffffff" />
                  <circle cx="82.5" cy="57" r="1.5" fill="#f43f5e" />

                  {/* DẢI LỤA ĐỎ BỊT MẮT TRUYỀN THỐNG TRÊN TRÁN */}
                  <path
                    d="M56 38C62 36 88 36 92 40C92 43 89 45 86 45C80 43 62 43 58 44C55 42 55 39 56 38Z"
                    fill="url(#festiveSilkRed)"
                    stroke="#7f1d1d"
                    strokeWidth="1.2"
                  />
                  <line x1="62" y1="41" x2="86" y2="41" stroke="#fecdd3" strokeWidth="0.8" opacity="0.7" />
                </g>
              </g>

              {/* CHÂN TRƯỚC (SẢI BƯỚC TỰ NHIÊN NGOÀI ĐỜI, SO LE CHÂN SAU) */}
              <g
                className={isWalking ? 'animate-human-leg-front' : ''}
                style={{ transformOrigin: '72px 85px' }}
              >
                {/* Ống quần trước */}
                <path d="M68 83L78 99L89 97L81 83Z" fill="url(#pantsDarkGrad)" />
                {/* Bắp chân & Bàn chân trước chạm cát vững vàng */}
                <path
                  d="M78 99L81 114C81 117 85 119 92 119C95 119 97 116 95 112L89 99Z"
                  fill="url(#cuteSkinGrad)"
                  stroke="#ea580c"
                  strokeWidth="0.8"
                />
                <ellipse cx="90" cy="117" rx="6.5" ry="2.6" fill="#f97316" opacity="0.9" />
              </g>

              {/* TAY TRƯỚC (VƯƠN VỀ PHÍA TRƯỚC BẮT VỊT TỰ NHIÊN) */}
              <g
                className={isWalking ? 'animate-human-arm-front' : ''}
                style={{ transformOrigin: '76px 66px' }}
              >
                <path
                  d="M74 65C84 64 98 63 106 65C109 66 110 69 107 71C102 75 90 76 80 75Z"
                  fill={isGirl ? 'url(#girlShirtGrad)' : 'url(#boyShirtGrad)'}
                />
                {/* Bàn tay 5 ngón xòe ra mò vịt */}
                <path
                  d="M106 64C110 62 116 62 118 65C119 67 115 69 113 70C116 71 118 73 117 75C114 76 111 74 109 73C110 75 109 77 107 77C104 77 103 74 103 71Z"
                  fill="url(#cuteSkinGrad)"
                  stroke="#ea580c"
                  strokeWidth="0.8"
                />
              </g>
            </g>
          ) : (
            // ==============================================================
            // TƯ THẾ 2: ÔM CHÚ VỊT CHÍNH DIỆN (CƯỜI HẠNH PHÚC RẠNG RỠ)
            // ==============================================================
            <g className="animate-wiggle" transform="translate(70, 70) translate(-70, -70)">
              {/* Nón lá sau đầu */}
              <g transform="translate(70, 24) rotate(-4) translate(-70, -24)">
                <ellipse cx="70" cy="22" rx="28" ry="14" fill="#854d0e" opacity="0.25" />
                <path d="M70 2L38 27C38 27 54 32 70 32C86 32 102 27 102 27L70 2Z" fill="url(#cuteHatGrad)" stroke="#854d0e" strokeWidth="1.2" />
              </g>

              {/* Thân áo bà ba */}
              <path
                d="M50 62C50 56 60 53 70 53C80 53 90 56 90 62L88 88C78 90 62 90 52 88Z"
                fill={isGirl ? 'url(#girlShirtGrad)' : 'url(#boyShirtGrad)'}
                stroke="#3f220f"
                strokeWidth="1.2"
              />
              <rect x="51" y="82" width="38" height="6" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />

              {/* Hai chân đứng vững trên mặt cát */}
              <rect x="54" y="90" width="11" height="15" rx="2" fill="url(#pantsDarkGrad)" />
              <rect x="75" y="90" width="11" height="15" rx="2" fill="url(#pantsDarkGrad)" />
              <path d="M54 105L52 118C52 121 58 122 66 122L66 105Z" fill="url(#cuteSkinGrad)" />
              <path d="M86 105L88 118C88 121 82 122 74 122L74 105Z" fill="url(#cuteSkinGrad)" />

              {/* ĐẦU CHÍNH DIỆN: CỰC KỲ DỄ THƯƠNG & RẠNG RỠ */}
              <circle cx="70" cy="46" r="18" fill="url(#cuteSkinGrad)" stroke="#ea580c" strokeWidth="0.8" />
              
              {/* Đôi mắt to tròn long lanh */}
              <ellipse cx="62" cy="45" rx="3.8" ry="4.8" fill="#0f172a" />
              <circle cx="63.5" cy="43.5" r="1.8" fill="#ffffff" />
              <ellipse cx="78" cy="45" rx="3.8" ry="4.8" fill="#0f172a" />
              <circle cx="79.5" cy="43.5" r="1.8" fill="#ffffff" />

              {/* Mũi chấm nhỏ & Má hồng phúng phính */}
              <circle cx="70" cy="49" r="1.1" fill="#ea580c" opacity="0.8" />
              <ellipse cx="56" cy="52" rx="4.8" ry="3.2" fill="#fb7185" opacity="0.85" />
              <ellipse cx="84" cy="52" rx="4.8" ry="3.2" fill="#fb7185" opacity="0.85" />

              {/* Miệng cười há to vui sướng ^^ */}
              <path d="M64 54C66 60 74 60 76 54" stroke="#9f1239" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M66 55C68 58 72 58 74 55" fill="#ffffff" />

              {/* Dải lụa đỏ trán */}
              <path
                d="M50 40C56 38 84 38 90 40C91 44 90 48 88 49C82 47 58 47 52 49C50 48 49 44 50 40Z"
                fill="url(#festiveSilkRed)"
                stroke="#7f1d1d"
                strokeWidth="1.2"
              />

              {/* CHÚ VỊT VÀNG ĐƯỢC ÔM CHẶT VÀO LÒNG */}
              <g transform="translate(70, 72) scale(1.1) translate(-70, -72)">
                <ellipse cx="70" cy="72" rx="15" ry="12" fill="#fde047" stroke="#ca8a04" strokeWidth="1.2" />
                <circle cx="79" cy="65" r="9" fill="#1e293b" stroke="#090d16" strokeWidth="1" />
                {/* Mắt vịt to tròn ngơ ngác khi bị ôm @.@ */}
                <circle cx="81" cy="63" r="3.2" fill="#ffffff" />
                <circle cx="81.5" cy="63" r="1.8" fill="#0f172a" />
                {/* Mỏ vịt há to */}
                <path d="M86 65C91 65 93 67 91 69C89 70 86 69 84 67Z" fill="#f97316" stroke="#c2410c" strokeWidth="0.8" />
                <ellipse cx="67" cy="72" rx="8" ry="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />

                {/* Hai tay ôm trọn chú vịt */}
                <path
                  d="M54 66C56 72 61 78 70 78C79 78 84 72 86 66"
                  stroke={isGirl ? 'url(#girlShirtGrad)' : 'url(#boyShirtGrad)'}
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <circle cx="66" cy="78" r="4" fill="url(#cuteSkinGrad)" />
                <circle cx="74" cy="78" r="4" fill="url(#cuteSkinGrad)" />

                {/* Trái tim yêu thương */}
                <g className="animate-bounce">
                  <path
                    d="M70 50C67 46 62 47 62 51C62 55 70 59 70 59C70 59 78 55 78 51C78 47 73 46 70 50Z"
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
