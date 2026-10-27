import React, { useEffect, useState } from 'react';

/**
 * UfoSaucer.jsx - Đĩa bay UFO thế hệ mới:
 * 1. Kích thước thu nhỏ thanh thoát (chỉ 220px - 280px), không còn to bè che khuất phố
 * 2. Bay ở trên cao cách xa học sinh bên dưới (khoảng cách > 450px)
 * 3. Di chuyển lượn trái - phải tự nhiên, nghiêng góc theo hướng bay (ufoTilt)
 * 4. Tia hút Tractor Beam và tia Laser tự động hướng từ tọa độ UFO thời gian thực đến học sinh
 * 5. Bảng điểm LED điện tử và 10 đèn LED đa sắc viền thân đĩa bay
 */

export const UfoSaucer = ({
  capturedCount = 0,
  targetCount = 2,
  isVisible = false,
  isBeaming = false,
  targetStudentPos = null,
  containerWidth = 1000,
  containerHeight = 700,
  countdownSeconds = null,
  ufoX = null,
  ufoY = null,
  ufoTilt = 0
}) => {
  const [lightOffset, setLightOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLightOffset(prev => (prev + 1) % 10);
    }, 180);
    return () => clearInterval(timer);
  }, []);

  // 10 màu đèn LED viền quanh đĩa bay
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

  const currentUfoX = ufoX ?? (containerWidth / 2);
  const currentUfoY = ufoY ?? 55;
  const targetBeamX = targetStudentPos ? targetStudentPos.x : currentUfoX;
  const streetY = (containerHeight * 0.84) || 600;

  // Tọa độ miệng khoang hút ở đáy đĩa bay
  const nozzleX = currentUfoX;
  const nozzleY = currentUfoY + 20;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30">
      
      {/* 1. TIA HÚT TRACTOR BEAM: Chiếu từ miệng đĩa bay di động xuống mục tiêu dưới mặt đường */}
      {isBeaming && isVisible && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          style={{ width: `${containerWidth}px`, height: '100%' }}
        >
          <defs>
            <linearGradient id="dynamicBeamGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#22d3ee" stopOpacity="0.55" />
              <stop offset="75%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.04" />
            </linearGradient>
            <filter id="beamSoftGlow">
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Tia sáng hình nón kết nối trực tiếp từ cửa đáy UFO di động xuống mặt đại lộ */}
          <polygon
            points={`
              ${nozzleX - 32}, ${nozzleY}
              ${nozzleX + 32}, ${nozzleY}
              ${targetBeamX + 110}, ${streetY + 35}
              ${targetBeamX - 110}, ${streetY + 35}
            `}
            fill="url(#dynamicBeamGrad)"
            filter="url(#beamSoftGlow)"
            className="transition-all duration-300 ease-out"
          />

          {/* Quầng sáng elip rực rỡ trên mặt đường dưới chân cột sáng */}
          <ellipse
            cx={targetBeamX}
            cy={streetY + 18}
            rx="115"
            ry="24"
            fill="#22d3ee"
            opacity="0.4"
            className="transition-all duration-300 ease-out animate-pulse"
          />
        </svg>
      )}

      {/* 2. Tia Laser vàng khóa mục tiêu từ tâm UFO tới học sinh */}
      {isBeaming && targetStudentPos && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-35"
          style={{ width: `${containerWidth}px`, height: '100%' }}
        >
          <line
            x1={nozzleX}
            y1={nozzleY}
            x2={targetStudentPos.x}
            y2={targetStudentPos.y - 42}
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="6,4"
            className="animate-pulse"
          />
          <circle
            cx={targetStudentPos.x}
            cy={targetStudentPos.y - 42}
            r="16"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            className="animate-ping"
          />
        </svg>
      )}

      {/* 3. ĐỒ HỌA VECTOR SVG ĐĨA BAY UFO THU NHỎ THANH THOÁT, LƯỢN TRÁI PHẢI TRÊN CAO */}
      <div
        className="absolute flex flex-col items-center pointer-events-none z-40 transition-opacity duration-500 ease-out"
        style={{
          left: `${currentUfoX}px`,
          top: `${currentUfoY}px`,
          transform: `translate(-50%, -50%) rotate(${ufoTilt}deg)`,
          opacity: isVisible ? 1 : 0
        }}
      >
        {/* Kích thước đĩa bay nhỏ gọn vừa vặn: w-[210px] sm:w-[250px] md:w-[280px] */}
        <div className="relative w-[210px] sm:w-[250px] md:w-[280px] filter drop-shadow-[0_10px_24px_rgba(0,0,0,0.65)]">
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

            {/* Lớp 2: Vành đĩa bay màu trắng bạc thanh thoát */}
            <ellipse cx="400" cy="130" rx="360" ry="58" fill="url(#ufoRimGrad)" stroke="#e2e8f0" strokeWidth="2" />

            {/* Lớp 3: Mặt đĩa trong màu xám than sắc nét */}
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

            {/* Lớp 5: Dãy 10 bóng đèn LED nhiều màu bo tròn quanh vành đĩa */}
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
            <ellipse cx="400" cy="188" rx="80" ry="7" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.2" opacity="0.9" />
          </svg>
        </div>
      </div>
    </div>
  );
};
