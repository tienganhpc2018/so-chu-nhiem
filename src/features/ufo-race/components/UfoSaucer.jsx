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
    // Bên trái bảng số
    { cx: 175, cy: 154, color: '#f97316' }, // Cam
    { cx: 205, cy: 161, color: '#f59e0b' }, // Hổ phách
    { cx: 238, cy: 167, color: '#eab308' }, // Vàng
    { cx: 272, cy: 171, color: '#22c55e' }, // Xanh lá
    { cx: 308, cy: 173, color: '#14b8a6' }, // Xanh ngọc
    // Bên phải bảng số
    { cx: 492, cy: 173, color: '#06b6d4' }, // Cyan
    { cx: 528, cy: 171, color: '#3b82f6' }, // Xanh dương
    { cx: 562, cy: 167, color: '#ec4899' }, // Hồng cánh sen
    { cx: 595, cy: 161, color: '#a855f7' }, // Tím
    { cx: 625, cy: 154, color: '#f43f5e' }  // Đỏ hồng
  ];

  return (
    <div
      className={`absolute top-2 sm:top-5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30 transition-all duration-1000 ease-out ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : '-translate-y-[260%] opacity-0 scale-50'
      }`}
    >
      {/* 1. Tia hút khổng lồ Tractor Beam phóng từ khoang đáy xuống mặt đất (Chuẩn màu Cyan trong ảnh mẫu) */}
      <div
        className={`absolute top-28 w-[460px] sm:w-[620px] md:w-[760px] h-[78vh] transition-all duration-700 pointer-events-none origin-top ${
          isBeaming && isVisible
            ? 'opacity-85 scale-y-100 filter drop-shadow-[0_0_50px_rgba(45,212,191,0.7)]'
            : 'opacity-0 scale-y-0'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(45,212,191,0.7) 0%, rgba(34,211,238,0.4) 50%, rgba(45,212,191,0.02) 100%)',
          clipPath: 'polygon(33% 0%, 67% 0%, 100% 100%, 0% 100%)'
        }}
      >
        {/* Hạt bụi ánh sáng trong tia */}
        <div className="w-full h-full relative overflow-hidden">
          {[...Array(14)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-cyan-100 animate-ping opacity-75"
              style={{
                top: `${(i * 12) % 90}%`,
                left: `${25 + ((i * 17) % 50)}%`,
                animationDuration: `${1 + (i % 2)}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* 2. Tia Laser vàng nhắm thẳng vào mục tiêu (Chuẩn đường laser màu vàng cam trong ảnh Thầy gửi) */}
      {isBeaming && targetStudentPos && (
        <svg
          className="absolute top-28 left-1/2 -translate-x-1/2 w-[1400px] h-[85vh] pointer-events-none z-35"
          style={{ overflow: 'visible' }}
        >
          <line
            x1="700"
            y1="0"
            x2={700 + (targetStudentPos.x - containerWidth / 2)}
            y2={targetStudentPos.y - 45}
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="6,4"
            className="animate-pulse"
          />
          <circle
            cx={700 + (targetStudentPos.x - containerWidth / 2)}
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
      <div className="relative z-40 w-[380px] sm:w-[520px] md:w-[620px] filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.65)] animate-bounce-subtle">
        <svg
          viewBox="0 0 800 240"
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            {/* Gradient cho vòm kính buồng lái màu xanh dương ngọc */}
            <linearGradient id="ufoDomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#258cfb" />
              <stop offset="100%" stopColor="#1e7ddb" />
            </linearGradient>

            {/* Gradient cho vành đĩa bay màu trắng bạc (Upper White Rim) */}
            <linearGradient id="ufoRimGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#f1f5f9" />
              <stop offset="75%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            {/* Gradient cho mặt trong tối màu xám than của đĩa bay (Dark Face) */}
            <linearGradient id="ufoFaceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a5568" />
              <stop offset="50%" stopColor="#374151" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>
          </defs>

          {/* Lớp 1: Vòm buồng lái hình tròn màu xanh ngọc ở phía sau đỉnh */}
          <circle cx="400" cy="115" r="92" fill="url(#ufoDomeGrad)" />
          {/* Phi hành gia / Mắt xanh ngoài hành tinh */}
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

          {/* Lớp 5: Dãy 10 bóng đèn LED nhiều màu bo tròn chạy dọc mép dưới mặt đĩa bay */}
          {LED_ITEMS.map((led, idx) => {
            const isActive = (idx + lightOffset) % 2 === 0;
            return (
              <g key={idx}>
                {/* Vầng sáng tỏa */}
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
                {/* Thân bóng đèn LED tròn */}
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
  );
};
