import React from 'react';

/**
 * NHÂN VẬT CÔ GÁI BỊT MẮT 3D HOẠT HÌNH DUYÊN DÁNG (Chuẩn 100% Ảnh Tham Chiếu):
 * - Cô gái tóc đen mượt dài, có bím tóc tết rủ xuống vai thắt nơ đỏ xinh xắn
 * - Đội nón lá tre Việt Nam hơi nghiêng duyên dáng
 * - Khuôn mặt 3D bầu bĩnh, má hồng đào, miệng cười tươi xinh xắn
 * - Dải lụa đỏ thắm bịt mắt ngang trán
 * - Áo bà ba nâu mộc mạc ngắn tay, thắt lưng vải trắng buộc nơ ngang eo
 * - Hai tay tròn 3D búp bê vươn ra trước quơ quạng tìm bắt vịt
 * - Toàn thân xoay linh hoạt theo hướng di chuyển (trái / phải)
 */
export const DuckPlayerSprite = ({
  x = 0,
  y = 0,
  direction = 'right',
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
        transform: `translate(-50%, -85%) ${isFacingLeft && !isHoldingDuck ? 'scaleX(-1)' : 'scaleX(1)'}`,
        willChange: 'left, top, transform'
      }}
    >
      {/* 1. Bóng đổ tiếp xúc mặt đất dưới chân cô gái */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
        style={{
          width: isHoldingDuck ? '60px' : '54px',
          height: '14px',
          backgroundColor: 'rgba(56, 34, 16, 0.45)',
          filter: 'blur(2.5px)'
        }}
      />

      {/* 2. Khối nhân vật CÔ GÁI 3D DUYÊN DÁNG SVG */}
      <div className={`relative w-36 h-36 flex flex-col items-center transition-transform ${isCatching ? 'scale-105' : ''}`}>
        <svg
          width="144"
          height="144"
          viewBox="0 0 144 144"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md overflow-visible"
        >
          <defs>
            {/* Gradient 3D Nón Lá Tre */}
            <radialGradient id="conicalHatGrad" cx="50%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="45%" stopColor="#fde047" />
              <stop offset="85%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </radialGradient>

            {/* Màu da 3D hồng hào mịn màng của cô gái */}
            <radialGradient id="girlSkinGrad" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fff1e6" />
              <stop offset="65%" stopColor="#fcd7ba" />
              <stop offset="100%" stopColor="#f8ad78" />
            </radialGradient>

            {/* Dải lụa đỏ thắm bịt mắt */}
            <linearGradient id="silkRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="40%" stopColor="#ef4444" />
              <stop offset="80%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>

            {/* Áo bà ba nâu đậm mộc mạc (chuẩn ảnh) */}
            <radialGradient id="girlShirtGrad" cx="45%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#9c6338" />
              <stop offset="65%" stopColor="#6e3f1e" />
              <stop offset="100%" stopColor="#48240d" />
            </radialGradient>

            {/* Váy / Quần ngố nâu sẫm */}
            <linearGradient id="girlPantsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4f2d15" />
              <stop offset="100%" stopColor="#2c1607" />
            </linearGradient>

            {/* Mái tóc đen nhánh mượt mà */}
            <linearGradient id="blackHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
          </defs>

          {/* ============================================================== */}
          {/* TƯ THẾ DI CHUYỂN: CÔ GÁI DUYÊN DÁNG RƯỢT ĐUỔI BẮT VỊT */}
          {/* ============================================================== */}
          {!isHoldingDuck ? (
            <g>
              {/* TÓC ĐEN XÕA PHÍA SAU ĐẦU */}
              <path
                d="M52 46C46 54 44 68 46 76C48 78 52 78 54 75C56 68 56 56 60 48Z"
                fill="url(#blackHairGrad)"
              />

              {/* BÍM TÓC TẾT ĐEN DÀI RỦ XUỐNG VAI (CHUẨN ẢNH THAM CHIẾU) */}
              <g className="animate-wiggle" style={{ transformOrigin: '56px 66px' }}>
                {/* Các đốt bím tóc tết xinh xắn */}
                <ellipse cx="54" cy="74" rx="4.5" ry="5.5" fill="url(#blackHairGrad)" />
                <ellipse cx="55" cy="82" rx="4" ry="5" fill="url(#blackHairGrad)" />
                <ellipse cx="56" cy="90" rx="3.5" ry="4.5" fill="url(#blackHairGrad)" />
                <ellipse cx="57" cy="97" rx="3" ry="4" fill="url(#blackHairGrad)" />
                {/* Đuôi bím tóc */}
                <path d="M56 100C57 104 59 108 58 111C56 108 55 104 56 100Z" fill="#090d16" />
                {/* NƠ ĐỎ THẮT Ở ĐUÔI BÍM TÓC XINH XẮN (Chuẩn ảnh tham chiếu) */}
                <circle cx="57" cy="98" r="2.8" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.8" />
                <path d="M54 96L52 101M60 96L62 101" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* CHÂN SAU (CHÂN TRẦN SẢI BƯỚC NHỊP NHÀNG) */}
              <g className={isWalking ? 'animate-duck-feet' : ''}>
                <path d="M58 84L48 98L56 102L66 88Z" fill="url(#girlPantsGrad)" />
                <path d="M48 98L38 108C36 110 38 114 44 114L53 111L56 102Z" fill="url(#girlSkinGrad)" stroke="#ea580c" strokeWidth="0.8" />
                <circle cx="37" cy="112" r="2.5" fill="#f97316" />
                <circle cx="42" cy="113" r="2.2" fill="#f97316" />
              </g>

              {/* THÂN VÁY / ÁO BÀ BA NÂU DUYÊN DÁNG (Eo thon, tà áo xòe nhẹ) */}
              <path
                d="M58 64C58 64 66 58 76 60C86 62 92 68 89 82L58 86C54 79 55 70 58 64Z"
                fill="url(#girlShirtGrad)"
                stroke="#3f220f"
                strokeWidth="1.2"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"
              />

              {/* THẮT LƯNG VẢI TRẮNG TINH KHÔI NGANG EO CÓ DẢI RỦ XUỐNG */}
              <path
                d="M59 81C65 80 81 80 88 82L87 86C78 84 63 84 58 85Z"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1.2"
              />
              <path
                d="M60 83C56 89 53 98 56 103C59 100 63 93 64 85Z"
                fill="#f1f5f9"
                stroke="#94a3b8"
                strokeWidth="0.8"
              />

              {/* CHÂN TRƯỚC BƯỚC VỀ TRƯỚC CHÂN TRẦN */}
              <g className={isWalking ? 'animate-duck-feet' : ''}>
                <path d="M72 86L82 102L93 100L85 85Z" fill="url(#girlPantsGrad)" />
                <path d="M82 102L84 116C84 119 89 121 96 121C99 121 101 118 99 114L92 102Z" fill="url(#girlSkinGrad)" stroke="#ea580c" strokeWidth="0.8" />
                <circle cx="98" cy="119" r="2.8" fill="#f97316" />
                <circle cx="93" cy="120" r="2.4" fill="#f97316" />
              </g>

              {/* TAY SAU VƯƠN RA TRƯỚC DUYÊN DÁNG */}
              <path
                d="M72 68C80 66 94 64 102 64C105 64 107 67 104 69C100 72 88 75 78 75Z"
                fill="#543015"
              />
              <circle cx="103" cy="66" r="5" fill="url(#girlSkinGrad)" />

              {/* ĐẦU CÔ GÁI 3D TRÒN TRỊA, MÁ BẦU BĨNH DỄ THƯƠNG */}
              <g>
                {/* Khối đầu */}
                <circle cx="76" cy="50" r="18" fill="url(#girlSkinGrad)" stroke="#ea580c" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))" />

                {/* Tóc mái phía trước trán */}
                <path d="M60 44C66 36 84 36 92 44C88 40 76 38 68 40Z" fill="url(#blackHairGrad)" />

                {/* Má hồng đào dễ thương */}
                <ellipse cx="86" cy="56" rx="5" ry="3.5" fill="#fb7185" opacity="0.85" />

                {/* Miệng cười tươi xinh xắn */}
                <path
                  d="M81 58C84 63 90 62 92 58"
                  stroke="#9f1239"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <path d="M83 59C85 61 89 61 90 59" fill="#ffffff" />

                {/* DẢI LỤA ĐỎ THẮM BỊT MẮT DÀY DẶN (Chuẩn ảnh tham chiếu) */}
                <path
                  d="M58 45C64 43 90 43 94 47C94 51 91 54 88 54C82 52 64 52 60 53C57 51 57 48 58 45Z"
                  fill="url(#silkRedGrad)"
                  stroke="#7f1d1d"
                  strokeWidth="1.2"
                  filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))"
                />
                <path d="M64 47C72 45 84 46 91 49" stroke="#fca5a5" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
              </g>

              {/* TAY TRƯỚC VƯƠN RA BẮT VỊT (TAY TRÒN BÚP BÊ 3D) */}
              <g className={isCatching ? 'transform translate-x-3 -translate-y-1' : ''}>
                <path
                  d="M78 71C88 70 104 69 114 70C117 70 118 73 115 75C110 80 96 81 84 80Z"
                  fill="url(#girlShirtGrad)"
                  filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))"
                />
                {/* Bàn tay búp bê 3D xòe ngón mềm mại */}
                <path
                  d="M114 69C118 67 124 67 126 70C127 72 123 74 121 75C124 76 126 78 125 80C122 81 119 79 117 78C118 80 117 82 115 82C112 82 111 79 111 76Z"
                  fill="url(#girlSkinGrad)"
                  stroke="#d97706"
                  strokeWidth="0.8"
                />
              </g>

              {/* NÓN LÁ TRE VIỆT NAM ĐỘI TRÊN ĐẦU (HƠI NGHIÊNG DUYÊN DÁNG NHƯ ẢNH THAM CHIẾU) */}
              <g transform="translate(74, 30) rotate(-8) translate(-74, -30)">
                <ellipse cx="74" cy="28" rx="32" ry="16" fill="#854d0e" opacity="0.3" />
                {/* Khối nón tam giác 3D */}
                <path
                  d="M74 4L34 34C34 34 54 40 74 40C94 40 114 34 114 34L74 4Z"
                  fill="url(#conicalHatGrad)"
                  stroke="#854d0e"
                  strokeWidth="1.5"
                  filter="drop-shadow(0 4px 6px rgba(0,0,0,0.28))"
                />
                {/* Các vành nan tre nón lá */}
                <path d="M60 18C66 21 82 21 88 18" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
                <path d="M48 26C58 30 90 30 100 26" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
                <path d="M40 33C54 38 94 38 108 33" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                {/* Chóp nón */}
                <circle cx="74" cy="4" r="2.5" fill="#78350f" />
              </g>
            </g>
          ) : (
            // ==============================================================
            // TƯ THẾ KHI ĐÃ BẮT ĐƯỢC VỊT: QUAY CHÍNH DIỆN ÔM VỊT VÀNG TRƯỚC NGỰC!
            // ==============================================================
            <g className="animate-wiggle" transform="translate(72, 72) translate(-72, -72)">
              {/* Nón lá sau đầu */}
              <g transform="translate(72, 26) rotate(-5) translate(-72, -26)">
                <ellipse cx="72" cy="24" rx="30" ry="15" fill="#854d0e" opacity="0.25" />
                <path d="M72 4L38 30C38 30 55 35 72 35C89 35 106 30 106 30L72 4Z" fill="url(#conicalHatGrad)" stroke="#854d0e" strokeWidth="1.2" />
              </g>

              {/* Tóc đen xõa hai bên vai */}
              <path d="M48 50C42 60 42 74 44 82C48 84 52 80 54 74C54 64 54 54 56 48Z" fill="url(#blackHairGrad)" />
              <path d="M96 50C102 60 102 74 100 82C96 84 92 80 90 74C90 64 90 54 88 48Z" fill="url(#blackHairGrad)" />

              {/* Bím tóc tết xinh xắn rủ bên phải */}
              <g transform="translate(98, 70)">
                <ellipse cx="0" cy="0" rx="3.5" ry="4.5" fill="url(#blackHairGrad)" />
                <ellipse cx="1" cy="7" rx="3" ry="4" fill="url(#blackHairGrad)" />
                <ellipse cx="2" cy="14" rx="2.5" ry="3.5" fill="url(#blackHairGrad)" />
                <circle cx="2" cy="16" r="2.5" fill="#ef4444" />
              </g>

              {/* Thân áo bà ba nâu */}
              <path
                d="M52 64C52 58 62 55 72 55C82 55 92 58 92 64L90 90C80 92 64 92 54 90Z"
                fill="url(#girlShirtGrad)"
                stroke="#3f220f"
                strokeWidth="1.2"
              />

              {/* Thắt lưng trắng */}
              <rect x="53" y="84" width="38" height="6" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <path d="M72 87C70 92 68 101 70 106C73 103 76 95 76 88Z" fill="#f1f5f9" />

              {/* Hai chân đứng trên cát */}
              <rect x="56" y="92" width="11" height="15" rx="2" fill="url(#girlPantsGrad)" />
              <rect x="77" y="92" width="11" height="15" rx="2" fill="url(#girlPantsGrad)" />
              <path d="M56 107L54 119C54 122 60 123 68 123L68 107Z" fill="url(#girlSkinGrad)" />
              <path d="M88 107L90 119C90 122 84 123 76 123L76 107Z" fill="url(#girlSkinGrad)" />

              {/* Đầu cô gái chính diện */}
              <circle cx="72" cy="48" r="18" fill="url(#girlSkinGrad)" stroke="#ea580c" strokeWidth="1" />
              <ellipse cx="58" cy="54" rx="4.5" ry="3" fill="#fb7185" opacity="0.85" />
              <ellipse cx="86" cy="54" rx="4.5" ry="3" fill="#fb7185" opacity="0.85" />
              <path d="M66 56C68 62 76 62 78 56" stroke="#9f1239" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M68 57C70 60 74 60 76 57" fill="#ffffff" />

              {/* Dải lụa đỏ bịt mắt */}
              <path
                d="M52 42C58 40 86 40 92 42C93 46 92 50 90 51C84 49 60 49 54 51C52 50 51 46 52 42Z"
                fill="url(#silkRedGrad)"
                stroke="#7f1d1d"
                strokeWidth="1.2"
              />

              {/* CHÚ VỊT VÀNG ĐƯỢC CÔ GÁI ÔM TRỌN TRƯỚC NGỰC */}
              <g transform="translate(72, 74) scale(1.1) translate(-72, -74)">
                <ellipse cx="72" cy="74" rx="15" ry="12" fill="#fde047" stroke="#ca8a04" strokeWidth="1.2" />
                <circle cx="81" cy="67" r="9" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
                <path d="M88 67C93 67 95 69 93 71C91 72 88 71 86 69Z" fill="#f97316" stroke="#c2410c" strokeWidth="0.8" />
                <path d="M80 65C81 64 83 64 84 65" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
                <ellipse cx="79" cy="69" rx="2" ry="1.2" fill="#f472b6" opacity="0.8" />
                <ellipse cx="69" cy="74" rx="8" ry="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />

                {/* Hai cánh tay cô gái ôm chặt chú vịt */}
                <path
                  d="M56 68C58 74 63 80 72 80C81 80 86 74 88 68"
                  stroke="url(#girlShirtGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <circle cx="68" cy="80" r="4" fill="url(#girlSkinGrad)" />
                <circle cx="76" cy="80" r="4" fill="url(#girlSkinGrad)" />

                {/* Trái tim yêu thương bay lên */}
                <g className="animate-bounce">
                  <path
                    d="M72 52C69 48 64 49 64 53C64 57 72 61 72 61C72 61 80 57 80 53C80 49 75 48 72 52Z"
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
