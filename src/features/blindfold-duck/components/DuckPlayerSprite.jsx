import React from 'react';

/**
 * Sprite Cậu Bé Bịt Mắt Bắt Vịt chuẩn 100% theo Ảnh Concept 3D:
 * - Nón lá tre vàng ấm, chóp nhọn, nan nón tròn
 * - Khăn lụa đỏ thắm bịt mắt với dải nơ đỏ bay phấp phới phía sau
 * - Bộ bà ba nâu mộc mạc, thắt lưng vải trắng buộc nơ
 * - Quần lửng nâu, chân trần sải bước chạy về phía trước
 * - Hai tay vươn dài ra trước với 5 ngón xòe rộng tư thế chộp bắt vịt
 * - Các vệt gió chuyển động hoạt hình (( quanh chân và tay
 * - Má hồng, miệng cười tập trung
 */
export const DuckPlayerSprite = ({
  x = 0,
  y = 0,
  direction = 'right', // 'left' | 'right'
  isCatching = false,
  isWalking = true
}) => {
  const isFacingLeft = direction === 'left';

  return (
    <div
      className="absolute pointer-events-none select-none z-30 transition-transform duration-75 ease-out"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -85%) ${isFacingLeft ? 'scaleX(-1)' : 'scaleX(1)'}`
      }}
    >
      {/* 1. Bóng đổ tiếp xúc mặt đất dưới chân (Contact Shadow) */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-7 rounded-full bg-[#3d2613]/35 filter blur-xs pointer-events-none"
      />

      {/* 2. Các vệt gió hoạt hình (( quanh bước chạy (Chuẩn hình ảnh) */}
      <div className="absolute -left-6 bottom-4 pointer-events-none select-none opacity-80">
        <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
          <path d="M4 6C8 9 14 10 20 8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
          <path d="M2 14C7 16 13 17 18 15" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
          <path d="M6 21C10 22 15 22 19 20" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      </div>

      {/* 3. Vệt gió phía trên mũ và trước tay chộp */}
      <div className="absolute -top-3 left-6 pointer-events-none select-none opacity-85">
        <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
          <path d="M2 10C8 3 16 3 20 8" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>

      {/* 4. Hình ảnh cậu bé 3D phong cách hoạt hình dân gian */}
      <div
        className={`relative w-28 h-28 flex flex-col items-center transition-transform ${
          isCatching ? 'scale-105' : ''
        }`}
      >
        <svg
          width="112"
          height="112"
          viewBox="0 0 112 112"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md"
        >
          <defs>
            {/* Gradient cho Nón Lá */}
            <linearGradient id="hatGrad" x1="56" y1="12" x2="56" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f3dfb2" />
              <stop offset="45%" stopColor="#dfbe84" />
              <stop offset="100%" stopColor="#ba975a" />
            </linearGradient>
            {/* Gradient da người */}
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffdfc4" />
              <stop offset="100%" stopColor="#f3be98" />
            </linearGradient>
            {/* Khăn đỏ bịt mắt */}
            <linearGradient id="redSilkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            {/* Áo bà ba nâu */}
            <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8c6239" />
              <stop offset="100%" stopColor="#674421" />
            </linearGradient>
            {/* Quần lửng nâu sẫm */}
            <linearGradient id="pantsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a3118" />
              <stop offset="100%" stopColor="#32200f" />
            </linearGradient>
          </defs>

          {/* DẢI LỤA ĐỎ PHÍA SAU ĐẦU (NƠ KHĂN BAY TRONG GIÓ) */}
          <g className="animate-pulse" opacity="0.95">
            <path
              d="M34 46C24 45 16 48 10 54C14 55 22 52 28 50Z"
              fill="url(#redSilkGrad)"
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
            />
            <path
              d="M32 48C25 50 18 56 14 63C19 62 25 57 29 53Z"
              fill="#b91c1c"
            />
          </g>

          {/* CHÂN SAU (CHÂN PHẢI BƯỚC ĐẨY ĐÀ BAREFOOT) */}
          <g transform={isWalking ? "rotate(-12 36 82)" : "rotate(-5 36 82)"}>
            {/* Ống quần sau */}
            <path d="M38 68L28 78L36 82L44 71Z" fill="url(#pantsGrad)" />
            {/* Bắp chân & Bàn chân trần sau chạm cát */}
            <path d="M28 78L22 84C20 86 21 89 25 89L32 87L36 82Z" fill="url(#skinGrad)" />
            <circle cx="21" cy="87" r="2" fill="#e79c6d" opacity="0.6" />
          </g>

          {/* THÂN MÌNH ÁO BÀ BA NÂU (Nghiêng người về phía trước) */}
          <path
            d="M42 54C42 54 48 50 58 52C66 53 72 58 70 68L44 72C40 66 40 58 42 54Z"
            fill="url(#shirtGrad)"
            stroke="#533719"
            strokeWidth="1"
          />

          {/* CỔ ÁO & VẠT ÁO */}
          <path d="M54 52L56 59L61 53" stroke="#422912" strokeWidth="1.5" strokeLinecap="round" />

          {/* THẮT LƯNG VẢI TRẮNG BUỘC GỌN (Chuẩn ảnh concept) */}
          <path
            d="M44 68C48 67 60 67 68 69L67 73C59 71 47 71 43 72Z"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="1"
          />
          {/* Nơ thắt lưng trắng rủ xuống */}
          <path
            d="M46 70C43 74 41 80 43 83C45 81 48 76 48 71Z"
            fill="#e2e8f0"
          />

          {/* CHÂN TRƯỚC (CHÂN TRÁI BƯỚC VỀ TRƯỚC BAREFOOT) */}
          <g transform={isWalking ? "rotate(10 56 74)" : "rotate(0 56 74)"}>
            {/* Ống quần trước */}
            <path d="M50 70L58 84L68 83L62 70Z" fill="url(#pantsGrad)" />
            {/* Bắp chân & Bàn chân trần sải bước */}
            <path d="M58 84L60 94C60 97 64 98 70 98C73 98 75 96 73 93L67 84Z" fill="url(#skinGrad)" />
            {/* Ngón chân trần */}
            <circle cx="72" cy="96" r="2.2" fill="#f4a261" />
            <circle cx="68" cy="97" r="1.8" fill="#f4a261" />
          </g>

          {/* ĐẦU CẬU BÉ VÀ KHUÔN MẶT */}
          <circle cx="56" cy="44" r="14" fill="url(#skinGrad)" />

          {/* Má hồng phúng phính & Miệng cười */}
          <ellipse cx="64" cy="48" rx="3.5" ry="2" fill="#fb7185" opacity="0.75" />
          <path
            d="M62 51C64 54 67 53 68 51"
            stroke="#9f1239"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* KHĂN LỤA ĐỎ BỊT MẮT BẢN DÀY (Chuẩn 100% Ảnh tham chiếu) */}
          <path
            d="M42 39C46 38 64 39 70 42C70 45 68 48 66 49C60 47 46 46 41 47C39 44 40 41 42 39Z"
            fill="url(#redSilkGrad)"
            stroke="#7f1d1d"
            strokeWidth="0.8"
            filter="drop-shadow(0 2px 3px rgba(0,0,0,0.25))"
          />
          {/* Nếp gấp dải khăn đỏ */}
          <path d="M46 42C53 41 62 42 67 44" stroke="#fca5a5" strokeWidth="1" strokeLinecap="round" opacity="0.8" />

          {/* CÁNH TAY SAU (TAY TRÁI VƯƠN RA CHỘP BẮT VỊT) */}
          <g className={isCatching ? "transform translate-x-2" : ""}>
            <path
              d="M58 55C66 54 78 52 86 52C88 52 90 54 89 56C87 59 78 62 68 62Z"
              fill="#744a25"
            />
            {/* Bàn tay 5 ngón xòe ra chộp bắt */}
            <path
              d="M86 51C90 49 96 49 98 52C99 54 96 56 94 57C96 58 98 60 97 62C95 63 92 61 90 60C91 62 90 64 88 64C86 64 85 61 85 58Z"
              fill="url(#skinGrad)"
              stroke="#d97706"
              strokeWidth="0.5"
            />
          </g>

          {/* CÁNH TAY TRƯỚC (TAY PHẢI VƯƠN DÀI XÒE NGÓN BẮT) */}
          <g className={isCatching ? "transform translate-x-3" : ""}>
            <path
              d="M60 58C68 58 82 56 90 57C92 57 93 60 91 62C88 66 77 68 66 66Z"
              fill="url(#shirtGrad)"
            />
            {/* Bàn tay 5 ngón trước xòe ra */}
            <path
              d="M89 56C93 54 100 54 102 57C103 59 99 61 97 62C100 63 102 65 101 67C99 68 95 66 93 65C94 67 93 69 91 69C88 69 87 66 87 63Z"
              fill="url(#skinGrad)"
              stroke="#d97706"
              strokeWidth="0.6"
            />
          </g>

          {/* NÓN LÁ TRE DÂN GIAN VIỆT NAM (ĐỘI CHÉO TRÊN ĐẦU) */}
          <g transform="rotate(-6 56 30)">
            {/* Khối nón tam giác 3D */}
            <path
              d="M56 12L24 40C24 40 40 45 56 45C72 45 88 40 88 40L56 12Z"
              fill="url(#hatGrad)"
              stroke="#a16207"
              strokeWidth="1.2"
              filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))"
            />
            {/* Các vành nan nón tre tròn đồng tâm */}
            <path d="M48 20C52 21 60 21 64 20" stroke="#78350f" strokeWidth="1" strokeLinecap="round" opacity="0.65" />
            <path d="M40 28C48 30 64 30 72 28" stroke="#78350f" strokeWidth="1" strokeLinecap="round" opacity="0.65" />
            <path d="M32 35C44 38 68 38 80 35" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
            {/* Chóp nón lá */}
            <circle cx="56" cy="12" r="2.5" fill="#78350f" />
          </g>
        </svg>
      </div>
    </div>
  );
};
