import React, { useEffect, useState } from 'react';

/**
 * UfoSaucer.jsx - Đĩa bay UFO thế hệ mới đúng 100% theo ảnh tham chiếu:
 * 1. Mái vòm tròn vòm kính trong suốt phát sáng xanh da trời (Cyan Blue Dome)
 * 2. Vành đĩa bay viền tím xanh (Indigo / Purple Glowing Rim)
 * 3. Hàng đèn LED cyan neon tròn rực rỡ quanh bụng đĩa bay (nhấp nháy xoay tròn)
 * 4. Kích thước vừa vặn (240px - 290px), bay lượn trái - phải tự nhiên trên cao
 * 5. Khi khóa mục tiêu, UFO lướt tới vị trí học sinh và phóng luồng tia sáng hút hình nón rực rỡ
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
      setLightOffset(prev => (prev + 1) % 8);
    }, 160);
    return () => clearInterval(timer);
  }, []);

  // 8 bóng đèn tròn LED Cyan rực sáng quanh bụng UFO chuẩn như ảnh mẫu
  const LED_ITEMS = [
    { cx: 120, cy: 95 },
    { cx: 155, cy: 104 },
    { cx: 195, cy: 109 },
    { cx: 240, cy: 111 },
    { cx: 280, cy: 111 },
    { cx: 325, cy: 109 },
    { cx: 365, cy: 104 },
    { cx: 400, cy: 95 }
  ];

  const currentUfoX = ufoX ?? (containerWidth / 2);
  const currentUfoY = ufoY ?? 110;
  const targetBeamX = targetStudentPos ? targetStudentPos.x : currentUfoX;
  const streetY = (containerHeight * 0.82) || 580;

  // Tọa độ miệng khoang hút ở đáy đĩa bay
  const nozzleX = currentUfoX;
  const nozzleY = currentUfoY + 22;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30">
      
      {/* 1. TIA HÚT TRACTOR BEAM: Chiếu từ miệng UFO di động xuống học sinh trên phố */}
      {isBeaming && isVisible && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          style={{ width: `${containerWidth}px`, height: '100%' }}
        >
          <defs>
            <linearGradient id="ufoBeamGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="25%" stopColor="#22d3ee" stopOpacity="0.65" />
              <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
            </linearGradient>
            <filter id="beamSoftGlow">
              <feGaussianBlur stdDeviation="10" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Tia sáng hình nón kết nối trực tiếp từ cửa đáy UFO di động xuống mặt vỉa hè / đại lộ */}
          <polygon
            points={`
              ${nozzleX - 35}, ${nozzleY}
              ${nozzleX + 35}, ${nozzleY}
              ${targetBeamX + 115}, ${streetY + 30}
              ${targetBeamX - 115}, ${streetY + 30}
            `}
            fill="url(#ufoBeamGradient)"
            filter="url(#beamSoftGlow)"
            className="transition-all duration-300 ease-out"
          />

          {/* Quầng sáng elip rực rỡ trên mặt đường dưới chân cột sáng */}
          <ellipse
            cx={targetBeamX}
            cy={streetY + 14}
            rx="120"
            ry="24"
            fill="#22d3ee"
            opacity="0.45"
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

      {/* 3. ĐỒ HỌA VECTOR SVG ĐĨA BAY UFO CHUẨN 100% THEO ẢNH MẪU */}
      <div
        className="absolute flex flex-col items-center pointer-events-none z-40 transition-opacity duration-500 ease-out"
        style={{
          left: `${currentUfoX}px`,
          top: `${currentUfoY}px`,
          transform: `translate(-50%, -50%) rotate(${ufoTilt}deg)`,
          opacity: isVisible ? 1 : 0
        }}
      >
        <div className="relative w-[230px] sm:w-[270px] md:w-[300px] filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.6)]">
          <svg
            viewBox="0 0 520 180"
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              {/* Gradient vòm kính xanh ngọc trong suốt */}
              <linearGradient id="domeGlassGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
                <stop offset="35%" stopColor="#bae6fd" stopOpacity="0.85" />
                <stop offset="75%" stopColor="#38bdf8" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
              </linearGradient>

              {/* Gradient đĩa bay tím xanh (Indigo Purple Body) */}
              <linearGradient id="ufoPurpleBodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="25%" stopColor="#6366f1" />
                <stop offset="60%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#3730a3" />
              </linearGradient>

              {/* Vành đĩa bên dưới tím sẫm viền cyan */}
              <linearGradient id="ufoUnderRimGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#312e81" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>

            {/* Vòm kính buồng lái màu xanh da trời trong suốt (Glass Dome) */}
            <path
              d="M 195 72 C 195 18, 325 18, 325 72 Z"
              fill="url(#domeGlassGrad)"
              stroke="#e0f2fe"
              strokeWidth="2.5"
            />
            {/* Vệt sáng cong phản chiếu trên vòm kính (Glossy Highlight) */}
            <path
              d="M 215 55 C 225 30, 295 30, 305 55"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.85"
            />
            <circle cx="230" cy="38" r="4" fill="#ffffff" opacity="0.9" />

            {/* Vành đĩa trên màu tím rực rỡ (Upper Purple Saucer Rim) */}
            <ellipse
              cx="260"
              cy="80"
              rx="230"
              ry="32"
              fill="url(#ufoPurpleBodyGrad)"
              stroke="#a5b4fc"
              strokeWidth="2.5"
            />

            {/* Vành đĩa dưới tím sẫm (Lower Bevel Rim) */}
            <path
              d="M 40 82 C 60 120, 460 120, 480 82 C 430 112, 90 112, 40 82 Z"
              fill="url(#ufoUnderRimGrad)"
              stroke="#4338ca"
              strokeWidth="2"
            />

            {/* Bảng đếm số LED điện tử hiển thị tỷ số (ví dụ: 0/2) */}
            <rect
              x="220"
              y="68"
              width="80"
              height="24"
              rx="5"
              fill="#030712"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            <text
              x="260"
              y="85"
              textAnchor="middle"
              fontFamily="monospace, Courier, monospace"
              fontSize="16"
              fontWeight="900"
              fill="#38bdf8"
              style={{ filter: 'drop-shadow(0 0 6px #38bdf8)' }}
            >
              {capturedCount}/{targetCount}
            </text>

            {/* Dãy các bóng đèn LED tròn Cyan neon rực rỡ quanh vành đĩa chuẩn theo ảnh */}
            {LED_ITEMS.map((led, idx) => {
              const isActive = (idx + lightOffset) % 2 === 0;
              return (
                <g key={idx}>
                  {isActive && (
                    <circle
                      cx={led.cx}
                      cy={led.cy}
                      r="12"
                      fill="#22d3ee"
                      opacity="0.55"
                      filter="blur(3px)"
                    />
                  )}
                  <circle
                    cx={led.cx}
                    cy={led.cy}
                    r="7.5"
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    opacity={isActive ? 1 : 0.45}
                  />
                  <circle
                    cx={led.cx - 2}
                    cy={led.cy - 2}
                    r="2"
                    fill="#ffffff"
                    opacity="0.8"
                  />
                </g>
              );
            })}

            {/* Đáy cửa khoang hút ánh sáng */}
            <ellipse
              cx="260"
              cy="114"
              rx="65"
              ry="10"
              fill="#0f172a"
              stroke="#22d3ee"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
