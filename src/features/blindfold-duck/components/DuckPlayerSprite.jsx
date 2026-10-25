import React from 'react';

/**
 * SPRITE NGƯỜI BỊT MẮT 3D HOẠT HÌNH (Hỗ trợ 3 Nhân Vật: Cô Bé, Cậu Bé, Thầy Giáo):
 * 1. MẶT HIỆN RÕ MẮT, MŨI, MIỆNG (Mắt to tròn long lanh, mũi xinh, miệng cười tươi lộ răng trắng).
 * 2. CHÂN TIẾP XÚC SÁT MẶT ĐẤT (Bóng đổ ôm sát bàn chân, sải bước dậm cát chân thực).
 * 3. HƯỚNG MẶT VÀ THÂN ĐỒNG BỘ: Chạy sang phải quay phải, chạy sang trái quay trái.
 * 4. TƯ THẾ ÔM VỊT: Khi bắt được quay chính diện ôm chặt chú vịt vàng vào lòng!
 */
export const DuckPlayerSprite = ({
  x = 0,
  y = 0,
  direction = 'right',
  characterType = 'girl', // 'girl' | 'boy' | 'teacher'
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
        // Khi chạy trái thì lật toàn bộ nhân vật (Mặt + Thân + Chân + Tay) sang trái
        transform: `translate(-50%, -92%) ${isFacingLeft && !isHoldingDuck ? 'scaleX(-1)' : 'scaleX(1)'}`,
        willChange: 'left, top, transform'
      }}
    >
      {/* 1. Bóng đổ tiếp xúc sát mặt đất dưới chân (Không bị lơ lửng) */}
      <div
        className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
        style={{
          width: isHoldingDuck ? '58px' : '52px',
          height: '12px',
          backgroundColor: 'rgba(56, 32, 14, 0.5)',
          filter: 'blur(2px)'
        }}
      />

      {/* 2. KHỐI NHÂN VẬT SVG 3D RÕ NÉT (140x140px) */}
      <div className={`relative w-35 h-35 flex flex-col items-center transition-transform ${isCatching ? 'scale-105' : ''}`}>
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md overflow-visible"
        >
          <defs>
            {/* Gradient da người 3D mịn màng */}
            <radialGradient id="charSkinGrad" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fff2e8" />
              <stop offset="60%" stopColor="#fed7ba" />
              <stop offset="100%" stopColor="#fba36e" />
            </radialGradient>

            {/* Dải lụa đỏ buộc ngang trán */}
            <linearGradient id="silkRibbonRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="40%" stopColor="#ef4444" />
              <stop offset="85%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>

            {/* Nón lá tre 3D */}
            <radialGradient id="hatConeGrad" cx="50%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="45%" stopColor="#fde047" />
              <stop offset="80%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </radialGradient>

            {/* Áo bà ba nâu 3D */}
            <radialGradient id="brownShirt3D" cx="45%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#9c6338" />
              <stop offset="65%" stopColor="#6e3f1e" />
              <stop offset="100%" stopColor="#48240d" />
            </radialGradient>

            {/* Quần ngố nâu sẫm */}
            <linearGradient id="brownPants3D" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4f2d15" />
              <stop offset="100%" stopColor="#2c1607" />
            </linearGradient>

            {/* Tóc đen mượt */}
            <linearGradient id="blackHairSmooth" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
          </defs>

          {/* ============================================================== */}
          {/* TƯ THẾ 1: CHẠY RƯỢT ĐUỔI TRÊN MẶT ĐẤT (MẶT VÀ THÂN CÙNG HƯỚNG) */}
          {/* ============================================================== */}
          {!isHoldingDuck ? (
            <g>
              {/* NÓN LÁ TRE HẤT SAU GÁY (KHÔNG CHE MẶT) */}
              <g transform="translate(36, 26) rotate(-20)">
                <ellipse cx="24" cy="18" rx="22" ry="12" fill="#78350f" opacity="0.3" />
                <path
                  d="M24 2L2 26C2 26 13 30 24 30C35 30 46 26 46 26L24 2Z"
                  fill="url(#hatConeGrad)"
                  stroke="#78350f"
                  strokeWidth="1.2"
                />
                <circle cx="24" cy="2" r="2.2" fill="#78350f" />
              </g>

              {/* TÓC & ĐẶC ĐIỂM NHÂN VẬT: CÔ GÁI (BÍM TÓC) / CẬU BÉ (TÓC NGẮN) / THẦY GIÁO (KÍNH & RẼ NGÔI) */}
              {characterType === 'girl' ? (
                <>
                  <path d="M52 46C46 54 44 68 46 76C48 78 52 78 54 75C56 68 56 56 60 48Z" fill="url(#blackHairSmooth)" />
                  {/* Bím tóc tết rủ nơ đỏ */}
                  <g className="animate-wiggle" style={{ transformOrigin: '54px 72px' }}>
                    <ellipse cx="52" cy="78" rx="4" ry="5.5" fill="url(#blackHairSmooth)" />
                    <ellipse cx="53" cy="86" rx="3.5" ry="5" fill="url(#blackHairSmooth)" />
                    <ellipse cx="54" cy="94" rx="3" ry="4.5" fill="url(#blackHairSmooth)" />
                    <circle cx="54" cy="101" r="2.8" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.8" />
                  </g>
                </>
              ) : characterType === 'boy' ? (
                /* Cậu bé: Tóc ngắn undercut năng động có lọn tóc vuốt cao */
                <>
                  <path d="M48 42C46 50 48 58 54 62C56 62 58 56 58 50Z" fill="url(#blackHairSmooth)" />
                  <path d="M58 35C54 28 62 26 66 32C68 27 75 28 78 33C82 28 89 31 87 37Z" fill="url(#blackHairSmooth)" />
                </>
              ) : (
                /* Thầy giáo: Tóc rẽ ngôi thư sinh lịch lãm */
                <>
                  <path d="M48 44C46 52 49 60 55 63C57 63 59 57 59 51Z" fill="url(#blackHairSmooth)" />
                  <path d="M54 36C62 31 74 31 84 37C82 34 74 33 66 34Z" fill="url(#blackHairSmooth)" />
                </>
              )}

              {/* DẢI LỤA ĐỎ NƠ KHĂN BAY PHÍA SAU ĐẦU */}
              <g className="animate-pulse">
                <path d="M46 48C34 46 24 51 16 58C21 59 30 56 38 52Z" fill="url(#silkRibbonRed)" />
                <path d="M44 51C35 53 26 62 20 70C27 68 34 62 39 56Z" fill="#991b1b" />
              </g>

              {/* CHÂN SAU TIẾP XÚC SÁT MẶT ĐẤT */}
              <g className={isWalking ? 'animate-duck-feet' : ''}>
                <path d="M56 82L44 96L54 100L64 85Z" fill="url(#brownPants3D)" />
                <path d="M44 96L34 106C32 108 34 112 40 112L50 110L54 100Z" fill="url(#charSkinGrad)" stroke="#ea580c" strokeWidth="0.8" />
                <circle cx="33" cy="110" r="2.5" fill="#f97316" />
                <circle cx="38" cy="111" r="2.2" fill="#f97316" />
              </g>

              {/* THÂN ÁO BÀ BA NÂU 3D */}
              <path
                d="M54 62C54 62 62 56 72 58C82 60 90 66 87 80L56 84C50 77 51 68 54 62Z"
                fill="url(#brownShirt3D)"
                stroke="#3f220f"
                strokeWidth="1.2"
              />

              {/* THẮT LƯNG VẢI TRẮNG CÓ DẢI RỦ XUỐNG HÔNG */}
              <path
                d="M56 79C62 78 78 78 86 80L85 85C76 83 60 83 55 84Z"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1.2"
              />
              <path
                d="M58 81C54 87 51 97 54 102C57 99 61 91 62 83Z"
                fill="#f1f5f9"
                stroke="#94a3b8"
                strokeWidth="0.8"
              />

              {/* CHÂN TRƯỚC SẢI BƯỚC CHẠM CÁT VỮNG VÀNG */}
              <g className={isWalking ? 'animate-duck-feet' : ''}>
                <path d="M70 84L80 100L92 98L84 83Z" fill="url(#brownPants3D)" />
                <path d="M80 100L82 114C82 117 87 119 94 119C97 119 99 116 97 112L90 100Z" fill="url(#charSkinGrad)" stroke="#ea580c" strokeWidth="0.8" />
                <circle cx="96" cy="117" r="2.8" fill="#f97316" />
                <circle cx="91" cy="118" r="2.4" fill="#f97316" />
              </g>

              {/* TAY SAU VƯƠN RA TRƯỚC */}
              <path
                d="M68 66C78 64 92 62 100 62C103 62 105 65 102 67C98 70 86 73 76 73Z"
                fill="#543015"
              />
              <circle cx="101" cy="64" r="5" fill="url(#charSkinGrad)" />

              {/* ============================================================== */}
              {/* ĐẦU & KHUÔN MẶT HIỆN RÕ MẮT, MŨI, MIỆNG (THEO ĐÚNG YÊU CẦU THẦY) */}
              {/* ============================================================== */}
              <g>
                {/* Khối đầu tròn 3D */}
                <circle cx="74" cy="48" r="18" fill="url(#charSkinGrad)" stroke="#ea580c" strokeWidth="1" />

                {/* Tóc mái phía trước trán */}
                <path d="M58 42C64 34 82 34 90 42C86 38 74 36 66 38Z" fill="url(#blackHairSmooth)" />

                {/* ĐÔI MẮT ANIME TO TRÒN LONG LANH (THẤY RÕ MẮT) */}
                <ellipse cx="80" cy="47" rx="3.5" ry="4.5" fill="#0f172a" />
                <circle cx="81.2" cy="45.5" r="1.6" fill="#ffffff" />
                <circle cx="79.2" cy="48.5" r="0.8" fill="#ffffff" />

                {/* MẮT SAU (GÓC NGHIÊNG 3/4) */}
                <ellipse cx="69" cy="46" rx="2.5" ry="3.8" fill="#0f172a" />
                <circle cx="70" cy="44.8" r="1.2" fill="#ffffff" />

                {/* KÍNH TRÍ THỨC (NẾU LÀ THẦY GIÁO) */}
                {characterType === 'teacher' && (
                  <g>
                    <ellipse cx="80" cy="47" rx="5.5" ry="5.5" fill="none" stroke="#d97706" strokeWidth="1.2" />
                    <ellipse cx="69" cy="46" rx="4.5" ry="5" fill="none" stroke="#d97706" strokeWidth="1.2" />
                    <line x1="74.5" y1="47" x2="73.5" y2="46.5" stroke="#d97706" strokeWidth="1.2" />
                  </g>
                )}

                {/* LÔNG MÀY CONG XINH */}
                <path d="M76 40C78 38 82 39 84 41" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" />

                {/* MŨI NHỎ XINH XẮN (THẤY RÕ MŨI) */}
                <path d="M84 49C85 50 84.5 51.5 83 51.5" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />

                {/* MÁ HỒNG PHÚNG PHÍNH */}
                <ellipse cx="82" cy="54" rx="4.5" ry="3" fill="#fb7185" opacity="0.85" />

                {/* MIỆNG CƯỜI TƯƠI LỘ RĂNG TRẮNG VÀ LƯỠI HỒNG (THẤY RÕ MIỆNG) */}
                <path d="M78 55C81 60 87 59 89 55" stroke="#9f1239" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M80 56C82 58 86 58 87 56" fill="#ffffff" />
                <circle cx="83.5" cy="58" r="1.5" fill="#f43f5e" />

                {/* DẢI LỤA ĐỎ BUỘC NGANG TRÁN (LÀM ĐIỂM NHẤN LỄ HỘI MÀ VẪN THẤY RÕ MẶT) */}
                <path
                  d="M56 39C62 37 88 37 92 41C92 44 89 46 86 46C80 44 62 44 58 45C55 43 55 40 56 39Z"
                  fill="url(#silkRibbonRed)"
                  stroke="#7f1d1d"
                  strokeWidth="1.2"
                />
              </g>

              {/* TAY TRƯỚC VƯƠN DÀI BẮT VỊT */}
              <g className={isCatching ? 'transform translate-x-3 -translate-y-1' : ''}>
                <path
                  d="M76 69C86 68 102 67 112 68C115 68 116 71 113 73C108 78 94 79 82 78Z"
                  fill="url(#brownShirt3D)"
                />
                {/* Bàn tay 5 ngón xòe mềm mại */}
                <path
                  d="M112 67C116 65 122 65 124 68C125 70 121 72 119 73C122 74 124 76 123 78C120 79 117 77 115 76C116 78 115 80 113 80C110 80 109 77 109 74Z"
                  fill="url(#charSkinGrad)"
                  stroke="#d97706"
                  strokeWidth="0.8"
                />
              </g>
            </g>
          ) : (
            // ==============================================================
            // TƯ THẾ ÔM VỊT CHÍNH DIỆN (CƯỜI HẠNH PHÚC RẠNG RỠ)
            // ==============================================================
            <g className="animate-wiggle" transform="translate(70, 70) translate(-70, -70)">
              {/* Nón lá sau đầu */}
              <g transform="translate(70, 24) rotate(-5) translate(-70, -24)">
                <ellipse cx="70" cy="22" rx="30" ry="15" fill="#854d0e" opacity="0.25" />
                <path d="M70 2L36 28C36 28 53 33 70 33C87 33 104 28 104 28L70 2Z" fill="url(#hatConeGrad)" stroke="#854d0e" strokeWidth="1.2" />
              </g>

              {/* Thân áo bà ba nâu */}
              <path
                d="M50 62C50 56 60 53 70 53C80 53 90 56 90 62L88 88C78 90 62 90 52 88Z"
                fill="url(#brownShirt3D)"
                stroke="#3f220f"
                strokeWidth="1.2"
              />
              <rect x="51" y="82" width="38" height="6" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />

              {/* Hai chân đứng vững trên mặt cát */}
              <rect x="54" y="90" width="11" height="15" rx="2" fill="url(#brownPants3D)" />
              <rect x="75" y="90" width="11" height="15" rx="2" fill="url(#brownPants3D)" />
              <path d="M54 105L52 118C52 121 58 122 66 122L66 105Z" fill="url(#charSkinGrad)" />
              <path d="M86 105L88 118C88 121 82 122 74 122L74 105Z" fill="url(#charSkinGrad)" />

              {/* ĐẦU CHÍNH DIỆN: MẮT MŨI MIỆNG TƯƠI CƯỜI RỰC RỠ */}
              <circle cx="70" cy="46" r="18" fill="url(#charSkinGrad)" stroke="#ea580c" strokeWidth="1" />
              {/* Hai mắt to tròn long lanh */}
              <ellipse cx="62" cy="45" rx="3.5" ry="4.5" fill="#0f172a" />
              <circle cx="63.2" cy="43.5" r="1.6" fill="#ffffff" />
              <ellipse cx="78" cy="45" rx="3.5" ry="4.5" fill="#0f172a" />
              <circle cx="79.2" cy="43.5" r="1.6" fill="#ffffff" />

              {/* Gọng kính vàng trí thức của Thầy Giáo */}
              {characterType === 'teacher' && (
                <g>
                  <circle cx="62" cy="45" r="5.5" fill="none" stroke="#d97706" strokeWidth="1.2" />
                  <circle cx="78" cy="45" r="5.5" fill="none" stroke="#d97706" strokeWidth="1.2" />
                  <line x1="67.5" y1="45" x2="72.5" y2="45" stroke="#d97706" strokeWidth="1.2" />
                </g>
              )}

              {/* Mũi xinh & Má hồng */}
              <path d="M70 48L69 50L71 50" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />
              <ellipse cx="56" cy="52" rx="4.5" ry="3" fill="#fb7185" opacity="0.85" />
              <ellipse cx="84" cy="52" rx="4.5" ry="3" fill="#fb7185" opacity="0.85" />

              {/* Miệng cười há to vui mừng ^^ */}
              <path d="M64 54C66 60 74 60 76 54" stroke="#9f1239" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M66 55C68 58 72 58 74 55" fill="#ffffff" />

              {/* Khăn đỏ trán */}
              <path
                d="M50 40C56 38 84 38 90 40C91 44 90 48 88 49C82 47 58 47 52 49C50 48 49 44 50 40Z"
                fill="url(#silkRibbonRed)"
                stroke="#7f1d1d"
                strokeWidth="1.2"
              />

              {/* CHÚ VỊT VÀNG ĐƯỢC ÔM CHẶT VÀO LÒNG (RẤT HÀI HƯỚC) */}
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
                  stroke="url(#brownShirt3D)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <circle cx="66" cy="78" r="4" fill="url(#charSkinGrad)" />
                <circle cx="74" cy="78" r="4" fill="url(#charSkinGrad)" />

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
