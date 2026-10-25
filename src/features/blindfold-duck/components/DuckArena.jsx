import React, { useState, useEffect, useRef } from 'react';
import { DuckPlayerSprite } from './DuckPlayerSprite';
import { DuckSprite } from './DuckSprite';
import { duckAudio } from '../services/duckAudio';

/**
 * GIAO DIỆN & VẬT LÝ SÂN CHƠI 3D BỊT MẮT BẮT VỊT (CHUẨN 100% ẢNH THAM CHIẾU):
 * - Bầu trời xanh dịu, đồi cỏ xanh nhạt với cây xanh đa diện low-poly, rặng tre và chòi đình mái đỏ
 * - Sân cát tròn vàng kem với hàng rào gỗ có gắn các quả cầu đỏ/lồng đèn lễ hội
 * - Thanh trạng thái đỉnh sân: "Đang đuổi theo vịt của [Tên học sinh]..."
 * - Nhân vật CÔ GÁI bịt mắt 3D duyên dáng, áo bà ba nâu, bím tóc tết rủ nơ đỏ, nón lá tre nghiêng
 * - ĐÀN VỊT DI CHUYỂN LIÊN TỤC KHẮP SÂN: Tản đều 360 độ, không bao giờ bị kẹt lại một góc
 */
export const DuckArena = ({
  ducks = [],
  mode = 'random_call',
  targetDuckId = null,
  timeLeft = 20,
  roundDuration = 20,
  showDuckNames = true,
  onCatchDuck,
  onMissCatch,
  isPaused = false
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 620 });

  // Tâm và bán kính sân cát tròn phối cảnh 3D
  const arenaCenter = { x: dimensions.width / 2, y: dimensions.height / 2 + 50 };
  const arenaRadiusX = Math.min(dimensions.width * 0.44, 460);
  const arenaRadiusY = Math.min(dimensions.height * 0.31, 205);

  // Cô gái bịt mắt 3D duyên dáng
  const playerRef = useRef({
    x: arenaCenter.x - 60,
    y: arenaCenter.y + 20,
    direction: 'right',
    isWalking: true,
    isCatching: false,
    isHoldingDuck: false
  });

  const [playerState, setPlayerState] = useState(playerRef.current);

  // Đàn vịt 3D (20-26 con)
  const [duckSprites, setDuckSprites] = useState([]);
  const [caughtDuckObj, setCaughtDuckObj] = useState(null);
  const [cameraZoom, setCameraZoom] = useState({ scale: 1, x: 0, y: 0 });

  const animFrameRef = useRef(null);
  const patrolAngleRef = useRef(0);
  const spritesRef = useRef([]);
  const hasCaughtRef = useRef(false);
  const quackAudioTimerRef = useRef(0);

  // Tìm tên bạn học sinh đang được đuổi theo
  const targetDuckObj = ducks.find(d => d.id === targetDuckId) || ducks[0];
  const targetStudentName = targetDuckObj?.name || 'học sinh';

  // Responsive kích thước
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth || 1000;
        const h = containerRef.current.clientHeight || 620;
        setDimensions({ width: w, height: h });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // KHỞI TẠO ĐÀN VỊT TẢN ĐỀU KHẮP SÂN VÀ DI CHUYỂN LIÊN TỤC
  useEffect(() => {
    if (!ducks || ducks.length === 0) return;

    hasCaughtRef.current = false;
    setCaughtDuckObj(null);
    setCameraZoom({ scale: 1, x: 0, y: 0 });

    playerRef.current = {
      x: arenaCenter.x - 70,
      y: arenaCenter.y + 20,
      direction: 'right',
      isWalking: true,
      isCatching: false,
      isHoldingDuck: false
    };
    setPlayerState({ ...playerRef.current });

    // Khởi tạo 18 - 25 chú vịt
    const flockTargetCount = Math.max(16, Math.min(25, ducks.length));
    const cohort = [];

    for (let i = 0; i < flockTargetCount; i++) {
      const sourceDuck = ducks[i % ducks.length];
      cohort.push({
        ...sourceDuck,
        instanceId: `duck_inst_${sourceDuck.id}_${i}`,
        isTarget: sourceDuck.id === targetDuckId
      });
    }

    // Phân bổ đều khắp 360 độ mặt sân tròn (tránh tập trung vào góc)
    const initialSprites = cohort.map((item, idx) => {
      const angle = (idx / flockTargetCount) * Math.PI * 2;
      const rRatio = 0.35 + ((idx * 5) % 6) * 0.08; // Phân bố từ tâm ra gần biên
      const x = arenaCenter.x + Math.cos(angle) * (arenaRadiusX * rRatio);
      const y = arenaCenter.y + Math.sin(angle) * (arenaRadiusY * rRatio);

      const wanderAngle = Math.random() * Math.PI * 2;
      const baseSpeed = 58 + (idx % 4) * 8;

      return {
        instanceId: item.instanceId,
        duck: item,
        x,
        y,
        vx: Math.cos(wanderAngle) * baseSpeed,
        vy: Math.sin(wanderAngle) * (baseSpeed * 0.7),
        speed: baseSpeed,
        wanderTimer: Math.random() * 2,
        state: 'WALK',
        colorIndex: idx,
        isQuacking: false,
        isCaught: false,
        isTarget: item.isTarget
      };
    });

    spritesRef.current = initialSprites;
    setDuckSprites(initialSprites);
    patrolAngleRef.current = 0;
  }, [ducks, targetDuckId, dimensions.width, dimensions.height]);

  // HÀNH ĐỘNG BẮT VỊT
  const triggerCatch = (forcedDuck = null) => {
    if (hasCaughtRef.current) return;

    let targetToCatch = forcedDuck;
    if (!targetToCatch) {
      if (mode === 'random_call' && targetDuckId) {
        const targetSprite = spritesRef.current.find(s => s.duck.id === targetDuckId);
        targetToCatch = targetSprite ? targetSprite.duck : (spritesRef.current[0]?.duck || ducks[0]);
      } else {
        targetToCatch = spritesRef.current[0]?.duck || ducks[0];
      }
    }

    if (targetToCatch) {
      hasCaughtRef.current = true;
      duckAudio.playCatchSuccess();

      const caughtSprite = spritesRef.current.find(
        s => s.duck.id === targetToCatch.id || s.duck.instanceId === targetToCatch.instanceId
      );

      if (caughtSprite) {
        caughtSprite.isCaught = true;
        caughtSprite.state = 'CAUGHT';
        setCaughtDuckObj(targetToCatch);

        // Cô gái tiến lại ôm vịt
        playerRef.current.x = caughtSprite.x;
        playerRef.current.y = caughtSprite.y + 10;
        playerRef.current.isCatching = false;
        playerRef.current.isHoldingDuck = true;
        setPlayerState({ ...playerRef.current });

        // Camera zoom cận cảnh ngang tầm mặt
        const focusX = (arenaCenter.x - caughtSprite.x) * 0.55;
        const focusY = (arenaCenter.y - caughtSprite.y) * 0.55 + 20;
        setCameraZoom({ scale: 1.45, x: focusX, y: focusY });
      }

      setDuckSprites([...spritesRef.current]);

      setTimeout(() => {
        onCatchDuck?.(targetToCatch);
      }, 1400);
    } else {
      duckAudio.playMiss();
      onMissCatch?.();
    }
  };

  // KHI HẾT THỜI GIAN: TỰ ĐỘNG BẮT ĐÚNG VỊT MỤC TIÊU
  useEffect(() => {
    if (timeLeft === 0 && !hasCaughtRef.current && !isPaused) {
      const targetSprite = spritesRef.current.find(s => s.duck.id === targetDuckId);
      const chosen = targetSprite ? targetSprite.duck : (spritesRef.current[0]?.duck || ducks[0]);
      triggerCatch(chosen);
    }
  }, [timeLeft, isPaused, targetDuckId]);

  // VÒNG LẶP VẬT LÝ VỊT DI CHUYỂN LIÊN TỤC KHẮP SÂN (60FPS)
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.08);
      lastTime = currentTime;

      if (!isPaused && !hasCaughtRef.current && spritesRef.current.length > 0) {
        let p = playerRef.current;

        // 1. CÔ GÁI RƯỢT ĐUỔI VỊT MỤC TIÊU (MẶT VÀ THÂN CÙNG HƯỚNG CHẠY)
        const targetSprite = spritesRef.current.find(s => s.duck.id === targetDuckId) || spritesRef.current[0];
        const targetX = targetSprite ? targetSprite.x : arenaCenter.x;
        const targetY = targetSprite ? targetSprite.y : arenaCenter.y;

        const toTargetX = targetX - p.x;
        const toTargetY = targetY - p.y;
        const distToTarget = Math.hypot(toTargetX, toTargetY) || 1;

        patrolAngleRef.current += 3.5 * dt;
        const huntSpeed = 125 * dt;

        p.x += (toTargetX / distToTarget) * huntSpeed + Math.cos(patrolAngleRef.current) * 1.5;
        p.y += (toTargetY / distToTarget) * (huntSpeed * 0.65) + Math.sin(patrolAngleRef.current) * 1.2;

        if (Math.abs(toTargetX) > 2) {
          p.direction = toTargetX >= 0 ? 'right' : 'left';
        }
        p.isWalking = true;

        // Giữ cô gái trong sân
        const normPx = (p.x - arenaCenter.x) / (arenaRadiusX * 0.82);
        const normPy = (p.y - arenaCenter.y) / (arenaRadiusY * 0.82);
        const distNormP = Math.hypot(normPx, normPy);
        if (distNormP > 1) {
          p.x = arenaCenter.x + (normPx / distNormP) * (arenaRadiusX * 0.82);
          p.y = arenaCenter.y + (normPy / distNormP) * (arenaRadiusY * 0.82);
        }

        setPlayerState({ ...p });

        // 2. VỊT DI CHUYỂN LIÊN TỤC KHẮP SÂN (WANDERING & SEPARATION & FLEE)
        let anyPanic = false;

        spritesRef.current.forEach((sprite, i) => {
          if (sprite.isCaught) return;

          // A. Định kỳ đổi hướng lang thang tự nhiên (Wandering liên tục)
          sprite.wanderTimer -= dt;
          if (sprite.wanderTimer <= 0) {
            sprite.wanderTimer = 1.2 + Math.random() * 1.8;
            const wanderAngle = Math.random() * Math.PI * 2;
            const speed = sprite.state === 'PANIC' ? 120 : sprite.speed;
            sprite.vx = Math.cos(wanderAngle) * speed;
            sprite.vy = Math.sin(wanderAngle) * (speed * 0.65);
          }

          // B. Lực né tránh cô gái khi đến gần
          const distToPlayer = Math.hypot(sprite.x - p.x, sprite.y - p.y);
          if (distToPlayer < 140) {
            sprite.state = 'PANIC';
            anyPanic = true;
            // Đẩy dạt ra xa cô gái
            const fleeAngle = Math.atan2(sprite.y - p.y, sprite.x - p.x);
            sprite.vx = Math.cos(fleeAngle) * 130;
            sprite.vy = Math.sin(fleeAngle) * 90;
          } else {
            sprite.state = 'WALK';
          }

          // C. Lực tách nhau (Separation - vịt tản đều không dồn cục)
          for (let j = 0; j < spritesRef.current.length; j++) {
            if (i !== j && !spritesRef.current[j].isCaught) {
              const other = spritesRef.current[j];
              const dx = sprite.x - other.x;
              const dy = sprite.y - other.y;
              const d = Math.hypot(dx, dy);
              if (d < 50 && d > 0) {
                const push = ((50 - d) / d) * 35 * dt;
                sprite.x += dx * push;
                sprite.y += dy * push;
              }
            }
          }

          // Cập nhật vị trí di chuyển
          sprite.x += sprite.vx * dt;
          sprite.y += sprite.vy * dt;

          // D. Giữ vịt trong hàng rào tre (Uốn lượn mềm mại khi chạm biên, KHÔNG KẸT)
          const normX = (sprite.x - arenaCenter.x) / (arenaRadiusX * 0.85);
          const normY = (sprite.y - arenaCenter.y) / (arenaRadiusY * 0.85);
          const dNorm = Math.hypot(normX, normY);

          if (dNorm > 1) {
            sprite.x = arenaCenter.x + (normX / dNorm) * (arenaRadiusX * 0.85);
            sprite.y = arenaCenter.y + (normY / dNorm) * (arenaRadiusY * 0.85);
            // Rẽ hướng vào trong tâm sân
            const toCenterX = arenaCenter.x - sprite.x;
            const toCenterY = arenaCenter.y - sprite.y;
            const toCenterAngle = Math.atan2(toCenterY, toCenterX);
            sprite.vx = Math.cos(toCenterAngle) * sprite.speed;
            sprite.vy = Math.sin(toCenterAngle) * (sprite.speed * 0.65);
          }
        });

        // Âm thanh nhao nhao khi đàn vịt hoảng loạn
        if (anyPanic && currentTime - quackAudioTimerRef.current > 1800) {
          quackAudioTimerRef.current = currentTime;
          duckAudio.playFlockPanic();
        }

        setDuckSprites([...spritesRef.current]);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPaused, arenaCenter.x, arenaCenter.y, arenaRadiusX, arenaRadiusY, targetDuckId]);

  // CỌC RÀO TRE VÀ LỒNG ĐÈN ĐỎ LỄ HỘI (Chuẩn ảnh tham chiếu)
  const fencePosts = [];
  const postCount = 26;
  for (let i = 0; i < postCount; i++) {
    const angle = (i / postCount) * Math.PI * 2;
    const px = arenaCenter.x + Math.cos(angle) * arenaRadiusX;
    const py = arenaCenter.y + Math.sin(angle) * arenaRadiusY;
    fencePosts.push({ x: px, y: py, angle, hasLantern: i % 3 === 0 });
  }

  const allNames = ducks.map(d => d.name || '');

  return (
    <div
      ref={containerRef}
      onClick={() => triggerCatch()}
      className="relative w-full h-full overflow-hidden select-none cursor-pointer"
      style={{
        background: 'linear-gradient(to bottom, #bbf2f6 0%, #d8f8fa 38%, #dcfce7 42%, #d2f49c 100%)'
      }}
    >
      {/* ============================================================== */}
      {/* 1. THANH TRẠNG THÁI ĐỈNH SÂN: ĐANG ĐUỔI THEO VỊT CỦA... (Chuẩn ảnh) */}
      {/* ============================================================== */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="px-5 py-2 rounded-full bg-[#1b4d3e]/85 backdrop-blur-md text-white border-2 border-white/40 shadow-xl flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs sm:text-sm font-black tracking-wide">
            Đang đuổi theo vịt của {targetStudentName}...
          </span>
        </div>
      </div>

      {/* Container áp dụng hiệu ứng Camera 3D */}
      <div
        className="relative w-full h-full transition-transform duration-700 ease-out"
        style={{
          transform: `scale(${cameraZoom.scale}) translate(${cameraZoom.x}px, ${cameraZoom.y}px)`,
          transformOrigin: `${arenaCenter.x}px ${arenaCenter.y}px`
        }}
      >
        {/* ============================================================== */}
        {/* 2. HẬU CẢNH: CHÒI ĐÌNH MÁI ĐỎ, RẶNG TRE & CÂY XANH LOW-POLY */}
        {/* ============================================================== */}
        {/* Rặng tre xanh cao vút phía sau bên trái */}
        <div className="absolute top-8 left-16 sm:left-40 pointer-events-none z-6 flex items-end space-x-1.5 opacity-90">
          {[140, 160, 180, 150, 170, 165].map((h, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-2.5 bg-[#4ade80] rounded-t-full border-r border-[#22c55e]" style={{ height: `${h}px` }} />
            </div>
          ))}
        </div>

        {/* Chòi đình mái ngói đỏ 4 cột tròn đỏ đậm (Chuẩn ảnh tham chiếu) */}
        <div className="absolute top-12 inset-x-0 pointer-events-none flex flex-col items-center z-7">
          {/* Mái ngói đỏ tam giác dẹt */}
          <div className="relative flex flex-col items-center">
            <div
              className="w-72 sm:w-96 h-14 sm:h-18 bg-gradient-to-b from-[#ef4444] to-[#b91c1c] shadow-2xl border-b-4 border-[#7f1d1d]"
              style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }}
            />
          </div>

          {/* Dây cờ hội ngũ sắc giăng dưới mái */}
          <div className="w-64 sm:w-80 flex justify-between -mt-1 px-4">
            {['#2563eb', '#eab308', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#eab308'].map((c, i) => (
              <div
                key={i}
                className="w-0 h-0 border-x-[8px] sm:border-x-[11px] border-x-transparent border-t-[14px] sm:border-t-[18px]"
                style={{ borderTopColor: c }}
              />
            ))}
          </div>

          {/* 4 Cột trụ đình màu đỏ đậm & Bục gỗ vàng kem */}
          <div className="relative w-64 sm:w-80 h-16 sm:h-20 bg-[#e7d1a2] flex justify-between items-end px-6 border-b-4 border-[#c8a96d] shadow-md">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-5 h-16 sm:h-20 bg-[#991b1b] rounded-t-sm border-r-2 border-[#7f1d1d] shadow-sm" />
            ))}
          </div>
        </div>

        {/* Cây xanh đa diện Low-Poly bên trái và bên phải (Chuẩn ảnh) */}
        <div className="absolute top-10 left-4 sm:left-12 pointer-events-none z-8 flex flex-col items-center">
          {/* Tán cây hình khối đa diện */}
          <div
            className="w-20 sm:w-28 h-20 sm:h-28 bg-[#4ade80] shadow-lg border-2 border-[#22c55e]"
            style={{ clipPath: 'polygon(50% 0%, 90% 25%, 100% 70%, 75% 100%, 25% 100%, 0% 70%, 10% 25%)' }}
          />
          {/* Thân cây nâu */}
          <div className="w-6 h-12 bg-[#78350f] rounded-b-md -mt-2" />
        </div>

        <div className="absolute top-10 right-4 sm:right-12 pointer-events-none z-8 flex flex-col items-center">
          <div
            className="w-20 sm:w-28 h-20 sm:h-28 bg-[#22c55e] shadow-lg border-2 border-[#16a34a]"
            style={{ clipPath: 'polygon(50% 0%, 90% 25%, 100% 70%, 75% 100%, 25% 100%, 0% 70%, 10% 25%)' }}
          />
          <div className="w-6 h-12 bg-[#78350f] rounded-b-md -mt-2" />
        </div>

        {/* ============================================================== */}
        {/* 3. SÂN CÁT TRÒN 3D VÀ HÀNG RÀO TRE CÓ QUẢ CẦU ĐỎ LỄ HỘI */}
        {/* ============================================================== */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
        >
          <defs>
            {/* Màu cát vàng kem ấm áp mịn màng (Chuẩn ảnh tham chiếu) */}
            <radialGradient id="sandYardGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="60%" stopColor="#fef08a" />
              <stop offset="90%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#eab308" />
            </radialGradient>
            <filter id="yardShadow">
              <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#4d7c0f" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Mặt sân cát tròn vàng kem */}
          <ellipse
            cx={arenaCenter.x}
            cy={arenaCenter.y}
            rx={arenaRadiusX}
            ry={arenaRadiusY}
            fill="url(#sandYardGrad)"
            stroke="#ca8a04"
            strokeWidth="5"
            filter="url(#yardShadow)"
          />

          {/* Đường nan gỗ rào trên & dưới */}
          <ellipse
            cx={arenaCenter.x}
            cy={arenaCenter.y - 16}
            rx={arenaRadiusX}
            ry={arenaRadiusY}
            fill="none"
            stroke="#92400e"
            strokeWidth="5"
            opacity="0.9"
          />
          <ellipse
            cx={arenaCenter.x}
            cy={arenaCenter.y - 3}
            rx={arenaRadiusX}
            ry={arenaRadiusY}
            fill="none"
            stroke="#78350f"
            strokeWidth="5"
            opacity="0.9"
          />

          {/* Cọc rào gỗ đứng & CÁC QUẢ CẦU ĐỎ LỄ HỘI (Chuẩn 100% Ảnh) */}
          {fencePosts.map((post, idx) => (
            <g key={idx}>
              {/* Thân cọc gỗ */}
              <rect
                x={post.x - 4}
                y={post.y - 30}
                width="8"
                height="30"
                rx="2"
                fill="#78350f"
                stroke="#451a03"
                strokeWidth="1.2"
              />
              {/* Quả cầu đỏ tròn có núm vàng trên đỉnh cọc (Chuẩn ảnh) */}
              {post.hasLantern && (
                <g>
                  <circle cx={post.x} cy={post.y - 35} r="7" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
                  <circle cx={post.x - 2} cy={post.y - 37} r="2" fill="#ffffff" opacity="0.6" />
                  <circle cx={post.x} cy={post.y - 42} r="1.5" fill="#facc15" />
                </g>
              )}
            </g>
          ))}
        </svg>

        {/* Các mảnh ruy băng / giấy ngũ sắc rải rác trên cát (Chuẩn ảnh) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-4 h-6 bg-purple-400 rounded-xs transform rotate-12 opacity-80" style={{ left: `${arenaCenter.x - 80}px`, top: `${arenaCenter.y + 40}px` }} />
          <div className="absolute w-5 h-4 bg-pink-400 rounded-xs transform -rotate-25 opacity-80" style={{ left: `${arenaCenter.x - 180}px`, top: `${arenaCenter.y - 30}px` }} />
          <div className="absolute w-4 h-5 bg-amber-400 rounded-xs transform rotate-45 opacity-80" style={{ left: `${arenaCenter.x + 140}px`, top: `${arenaCenter.y + 20}px` }} />
        </div>

        {/* ============================================================== */}
        {/* 4. ĐÀN VỊT 3D CHẠY LIÊN TỤC KHẮP SÂN (CHUẨN ẢNH THAM CHIẾU) */}
        {/* ============================================================== */}
        {duckSprites.map(sprite => (
          <DuckSprite
            key={sprite.instanceId}
            duck={sprite.duck}
            x={sprite.x}
            y={sprite.y}
            vx={sprite.vx}
            vy={sprite.vy}
            state={sprite.state}
            colorIndex={sprite.colorIndex}
            isQuacking={sprite.isQuacking}
            isCaught={sprite.isCaught}
            isTarget={sprite.isTarget}
            showName={showDuckNames}
            allNames={allNames}
          />
        ))}

        {/* ============================================================== */}
        {/* 5. CÔ GÁI BỊT MẮT 3D HOẠT HÌNH DUYÊN DÁNG (CHUẨN ẢNH THAM CHIẾU) */}
        {/* ============================================================== */}
        <DuckPlayerSprite
          x={playerState.x}
          y={playerState.y}
          direction={playerState.direction}
          isWalking={playerState.isWalking}
          isCatching={playerState.isCatching}
          isHoldingDuck={playerState.isHoldingDuck}
        />
      </div>

      {/* ============================================================== */}
      {/* 6. NÚT BẮT VỊT DƯỚI ĐÁY SÂN */}
      {/* ============================================================== */}
      {!hasCaughtRef.current && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex items-center space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerCatch();
            }}
            className="flex items-center space-x-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-sm sm:text-base shadow-2xl shadow-red-500/80 animate-bounce active:scale-95 border-2 border-yellow-300"
          >
            <span className="text-xl">✋</span>
            <span>BẮT VỊT NGAY!</span>
          </button>
        </div>
      )}
    </div>
  );
};
