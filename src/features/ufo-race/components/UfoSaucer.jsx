import React, { useEffect, useState } from 'react';

export const UfoSaucer = ({
  capturedCount = 0,
  targetCount = 2,
  isVisible = false, // Chỉ xuất hiện khi giáo viên bấm Bắt đầu
  isBeaming = false,
  targetStudentPos = null,
  containerWidth = 1000,
  countdownSeconds = null
}) => {
  const [lightOffset, setLightOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLightOffset(prev => (prev + 1) % 10);
    }, 180);
    return () => clearInterval(timer);
  }, []);

  // 10 màu đèn LED viền quanh đĩa bay chuẩn 100% theo ảnh Thầy gửi
  const LED_ITEMS = [
    { cx: 175, cy: 154, color: '#f97316' }, // Cam
    { cx: 205, cy: 161, color: '#f59e0b' }, // Hổ phách
    { cx: 238, cy: 167, color: '#eab308' }, // Vàng
    { cx: 272, cy: 171, color: '#22c55e' }, // Xanh lá
    { cx: 308, cy: 173, color: '#14b8a6' }, // Xanh ngọc
    { cx: 492, cy: 173, color: '#06b6d4' }, // Cyan
    { cx: 528, cy: 171, color: '#3b82f6' }, // Xanh dương
    { cx: 562, cy: 167, color: '#ec4899' }, // Hồng cánh sen
    { cx: 595, cy: 161, color: '#a855f7' }, // Tím
    { cx: 625, cy: 154, color: '#f43f5e' }  // Đỏ hồng
  ];

  const ufoCenterX = containerWidth / 2;
  const targetBeamX = targetStudentPos ? targetStudentPos.x : ufoCenterX;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30">
      
      {/* 1. TIA HÚT TRACTOR BEAM XOAY ĐỘNG: Luôn chiếu chuẩn xác 100% vào vị trí học sinh */}
      {isBeaming && isVisible && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          style={{ width: `${containerWidth}px`, height: '100%' }}
        >
          <defs>
            <linearGradient id="dynamicBeamGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#22d3ee" stopOpacity="0.5" />
              <stop offset="75%" stopColor="#06b6d4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
            </linearGradient>
            <filter id="beamSoftGlow">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Tia sáng hình nón kết nối trực tiếp từ cửa đáy đĩa bay tới vị trí chân học sinh */}
          <polygon
            points={`
              ${ufoCenterX - 55}, 145
              ${ufoCenterX + 55}, 145
              ${targetBeamX + 165}, 650
              ${targetBeamX - 165}, 650
            `}
            fill="url(#dynamicBeamGrad)"
            filter="url(#beamSoftGlow)"
            className="transition-all duration-700 ease-out"
          />

          {/* Quầng sáng elip chiếu rọi trực tiếp trên mặt đất nơi học sinh đứng */}
          <ellipse
            cx={targetBeamX}
            cy="635"
            rx="160"
            ry="28"
            fill="#22d3ee"
            opacity="0.35"
            className="transition-all duration-700 ease-out animate-pulse"
          />
        </svg>
      )}

      {/* 2. Tia Laser vàng nhắm thẳng từ đĩa bay vào mục tiêu */}
      {isBeaming && targetStudentPos && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-35"
          style={{ width: `${containerWidth}px`, height: '100%' }}
        >
          <line
            x1={ufoCenterX}
            y1={140}
            x2={targetStudentPos.x}
            y2={targetStudentPos.y - 45}
            stroke="#f59e0b"
            strokeWidth="3.5"
            strokeDasharray="6,4"
            className="animate-pulse"
          />
          <circle
            cx={targetStudentPos.x}
            cy={targetStudentPos.y - 45}
            r="18"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            className="animate-ping"
          />
        </svg>
      )}

      {/* 3. ĐỒ HỌA VECTOR SVG ĐĨA BAY UFO CHUẨN XÁC 100% THEO ẢNH THAM CHIẾU */}
      <div
        className={`absolute top-2 sm:top-5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-40 transition-all duration-1000 ease-out ${
          isVisible
            ? 'translate-y-0 opacity-100 scale-100'
            : '-translate-y-[260%] opacity-0 scale-50'
        }`}
      >
        <div className="relative w-[380px] sm:w-[520px] md:w-[620px] filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.65)] animate-bounce-subtle">
          <svg
            viewBox="0 0 800 240"
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              <linearGradient id="ufoDomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#258cfb" />
                <stop offset="100%" stopColor="#1e7ddb" />
              </linearGradient>

              <linearGradient id="ufoRimGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#f1f5f9" />
                <stop offset="75%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>

              <linearGradient id="ufoFaceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4a5568" />
                <stop offset="50%" stopColor="#374151" />
                <stop offset="100%" stopColor="#1f2937" />
              </linearGradient>
            </defs>

            {/* Lớp 1: Vòm buồng lái hình tròn màu xanh ngọc ở phía sau đỉnh */}
            <circle cx="400" cy="115" r="92" fill="url(#ufoDomeGrad)" />
            <circle cx="400" cy="72" r="13" fill="#10b981" />
            <circle cx="400" cy="72" r="7" fill="#047857" />

            {/* Lớp 2: Vành đĩa bay màu trắng bạc thanh thoát (White Lip Rim) */}
            <ellipse cx="400" cy="130" rx="360" ry="58" fill="url(#ufoRimGrad)" stroke="#e2e8f0" strokeWidth="2" />

            {/* Lớp 3: Mặt đĩa trong màu xám than sắc nét (Dark Bevel Face) */}
            <ellipse cx="400" cy="144" rx="320" ry="44" fill="url(#ufoFaceGrad)" />

            {/* Lớp 4: Khung bảng LED điện tử hiển thị tỷ số (ví dụ: 0/2) */}
            <rect
              x="335"
              y="124"
              width="130"
              height="40"
              rx="6"
              fill="#030b14"
              stroke="#10b981"
              strokeWidth="2.5"
            />
            {/* Chữ số LED màu xanh neon sắc nét */}
            <text
              x="400"
              y="152"
              textAnchor="middle"
              fontFamily="monospace, Courier, monospace"
              fontSize="26"
              fontWeight="900"
              fill="#10b981"
              style={{ filter: 'drop-shadow(0 0 6px #10b981)' }}
            >
              {capturedCount}/{targetCount}
            </text>

            {/* Hiển thị số giây đếm ngược nếu có */}
            {countdownSeconds !== null && countdownSeconds > 0 && (
              <g transform="translate(432, 126)">
                <rect width="28" height="15" rx="3" fill="#451a03" stroke="#f59e0b" strokeWidth="1" />
                <text x="14" y="11" textAnchor="middle" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#f59e0b">
                  {countdownSeconds}s
                </text>
              </g>
            )}

            {/* Lớp 5: Dãy 10 bóng đèn LED nhiều màu bo tròn */}
            {LED_ITEMS.map((led, idx) => {
              const isActive = (idx + lightOffset) % 2 === 0;
              return (
                <g key={idx}>
                  {isActive && (
                    <circle
                      cx={led.cx}
                      cy={led.cy}
                      r="12"
                      fill={led.color}
                      opacity="0.55"
                      filter="blur(2px)"
                    />
                  )}
                  <circle
                    cx={led.cx}
                    cy={led.cy}
                    r="7.5"
                    fill={led.color}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    opacity={isActive ? 1 : 0.4}
                  />
                </g>
              );
            })}

            {/* Lớp 6: Cửa khoang hút đáy đĩa bay */}
            <ellipse cx="400" cy="188" rx="80" ry="7" fill="#0f172a" stroke="#22d3ee" strokeWidth="1" opacity="0.8" />
          </svg>
        </div>
      </div>
    </div>
  );
};
