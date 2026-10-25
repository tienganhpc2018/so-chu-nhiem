import React, { useState, useEffect, useRef } from 'react';
import { DuckPlayerSprite } from './DuckPlayerSprite';
import { DuckSprite } from './DuckSprite';
import { duckAudio } from '../services/duckAudio';

/**
 * GIAO DIỆN & VẬT LÝ SÂN CHƠI 3D BỊT MẮT BẮT VỊT (Chuẩn 100% Theo Video Tham Chiếu):
 * - CAMERA HẠ THẤP: Nhìn ngang sân thay vì từ trên cao xuống, thấy rõ chòi mái đỏ phía sau và tầm mặt nhân vật
 * - ĐÀN VỊT CHẠY THEO BẦY (Flocking Boids): Đàn vịt 20-30 con tụ lại chạy theo bầy, lượn quanh sân, khi người bắt đến thì cả bầy nhao nhao né tránh
 * - NGƯỜI BẮT DI CHUYỂN LINH HOẠT: Sửa triệt để lỗi đứng im, sải bước chân rượt đuổi dồn bầy vịt khắp sân
 * - ĐẦU HƯỚNG VỀ CAMERA: Luôn thấy rõ khuôn mặt cười và dải lụa đỏ bịt mắt
 * - NÓN LÁ HẤT RA SAU: Nón nhỏ gọn không che trán và mặt
 * - CẬN CẢNH KHI BẮT ĐƯỢC: Camera zoom cận cảnh ngang tầm mặt thấy rõ cảnh ôm vịt vàng trước ngực!
 */
export const DuckArena = ({
  ducks = [],
  mode = 'random_call',
  targetDuckId = null,
  timeLeft = 20,
  roundDuration = 20,
  showDuckNames = false,
  onCatchDuck,
  onMissCatch,
  isPaused = false
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 620 });

  // Tâm và bán kính sân đất nén (Camera hạ thấp góc nhìn ngang: ry dẹt hơn, sân nằm ở nửa dưới)
  const arenaCenter = { x: dimensions.width / 2, y: dimensions.height / 2 + 75 };
  const arenaRadiusX = Math.min(dimensions.width * 0.44, 460);
  const arenaRadiusY = Math.min(dimensions.height * 0.28, 175); // Hạ thấp góc nhìn

  // Người chơi bịt mắt (Dùng REF để tránh lỗi stale closure đứng im tại chỗ)
  const playerRef = useRef({
    x: arenaCenter.x - 40,
    y: arenaCenter.y + 20,
    direction: 'right',
    isWalking: true,
    isCatching: false,
    isHoldingDuck: false
  });

  const [playerState, setPlayerState] = useState(playerRef.current);

  // Đàn vịt 3D (20-30 con)
  const [duckSprites, setDuckSprites] = useState([]);
  const [caughtDuckObj, setCaughtDuckObj] = useState(null);
  const [cameraZoom, setCameraZoom] = useState({ scale: 1, x: 0, y: 0 });

  const animFrameRef = useRef(null);
  const patrolAngleRef = useRef(0);
  const spritesRef = useRef([]);
  const hasCaughtRef = useRef(false);
  const panicAudioTimerRef = useRef(0);

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

  // KHỞI TẠO ĐÀN VỊT CHẠY THEO BẦY (FLOCKING 20-30 CON)
  useEffect(() => {
    if (!ducks || ducks.length === 0) return;

    hasCaughtRef.current = false;
    setCaughtDuckObj(null);
    setCameraZoom({ scale: 1, x: 0, y: 0 });

    playerRef.current = {
      x: arenaCenter.x - 30,
      y: arenaCenter.y + 20,
      direction: 'right',
      isWalking: true,
      isCatching: false,
      isHoldingDuck: false
    };
    setPlayerState({ ...playerRef.current });

    // Khởi tạo 20 - 30 chú vịt
    const flockTargetCount = Math.max(18, Math.min(30, ducks.length));
    const cohort = [];

    for (let i = 0; i < flockTargetCount; i++) {
      const sourceDuck = ducks[i % ducks.length];
      cohort.push({
        ...sourceDuck,
        instanceId: `inst_${sourceDuck.id}_${i}`,
        isTarget: sourceDuck.id === targetDuckId
      });
    }

    // Đặt đàn vịt xuất phát theo cụm bầy (Flock clusters) ở phía trên bên phải sân
    const initialSprites = cohort.map((item, idx) => {
      const clusterAngle = -0.3 + (idx / flockTargetCount) * 1.8;
      const rRatio = 0.55 + (idx % 3) * 0.12;
      const x = arenaCenter.x + Math.cos(clusterAngle) * (arenaRadiusX * rRatio);
      const y = arenaCenter.y + Math.sin(clusterAngle) * (arenaRadiusY * rRatio);

      const baseSpeed = 62 + (idx % 4) * 8;
      // Ban đầu đàn vịt cùng hướng bơi/chạy quanh vòng tròn
      const moveAngle = clusterAngle + Math.PI / 2;

      return {
        instanceId: item.instanceId,
        duck: item,
        x,
        y,
        vx: Math.cos(moveAngle) * baseSpeed,
        vy: Math.sin(moveAngle) * (baseSpeed * 0.65),
        speed: baseSpeed,
        state: 'WALK',
        colorIndex: idx,
        speechQuote: null,
        isQuacking: false,
        isCaught: false,
        isTarget: item.isTarget
      };
    });

    spritesRef.current = initialSprites;
    setDuckSprites(initialSprites);
    patrolAngleRef.current = 0;
  }, [ducks, targetDuckId, dimensions.width, dimensions.height]);

  // HÀNH ĐỘNG BẮT VỊT (Tự động hoặc khi Thầy bấm nút Bắt)
  const triggerCatch = (forcedDuck = null) => {
    if (hasCaughtRef.current) return;

    // Xác định chú vịt bị bắt
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

        // Đặt vị trí người chơi ngay sát chú vịt để ôm vịt
        playerRef.current.x = caughtSprite.x;
        playerRef.current.y = caughtSprite.y + 10;
        playerRef.current.isCatching = false;
        playerRef.current.isHoldingDuck = true;
        setPlayerState({ ...playerRef.current });

        // CẬN CẢNH KHI BẮT ĐƯỢC: Camera zoom cận cảnh ngang tầm mặt người chơi và vịt!
        const focusX = (arenaCenter.x - caughtSprite.x) * 0.55;
        const focusY = (arenaCenter.y - caughtSprite.y) * 0.55 + 20;
        setCameraZoom({ scale: 1.45, x: focusX, y: focusY });
      }

      setDuckSprites([...spritesRef.current]);

      // Sau 1.4s thưởng thức cảnh ôm vịt hạnh phúc, gửi thông báo hoàn tất
      setTimeout(() => {
        onCatchDuck?.(targetToCatch);
      }, 1400);
    } else {
      duckAudio.playMiss();
      onMissCatch?.();
    }
  };

  // KHI HẾT THỜI GIAN VÒNG CHƠI: TỰ ĐỘNG BẮT ĐÚNG CHÚ VỊT MỤC TIÊU
  useEffect(() => {
    if (timeLeft === 0 && !hasCaughtRef.current && !isPaused) {
      const targetSprite = spritesRef.current.find(s => s.duck.id === targetDuckId);
      const chosen = targetSprite ? targetSprite.duck : (spritesRef.current[0]?.duck || ducks[0]);
      triggerCatch(chosen);
    }
  }, [timeLeft, isPaused, targetDuckId]);

  // VÒNG LẶP VẬT LÝ FLOCKING & RƯỢT ĐUỔI CHUẨN 60FPS
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.08);
      lastTime = currentTime;

      if (!isPaused && !hasCaughtRef.current && spritesRef.current.length > 0) {
        let p = playerRef.current;

        // ==============================================================
        // 1. TÍNH TÂM VÀ VẬN TỐC TRUNG BÌNH CỦA BẦY VỊT (FLOCK CENTER & VELOCITY)
        // ==============================================================
        let flockCenterX = 0;
        let flockCenterY = 0;
        let flockVelX = 0;
        let flockVelY = 0;
        let activeCount = 0;

        spritesRef.current.forEach(s => {
          if (!s.isCaught) {
            flockCenterX += s.x;
            flockCenterY += s.y;
            flockVelX += s.vx;
            flockVelY += s.vy;
            activeCount++;
          }
        });

        if (activeCount > 0) {
          flockCenterX /= activeCount;
          flockCenterY /= activeCount;
          flockVelX /= activeCount;
          flockVelY /= activeCount;
        }

        // ==============================================================
        // 2. NGƯỜI BỊT MẮT RƯỢT ĐUỔI THEO BẦY VỊT (CẬP NHẬT LIÊN TỤC KHÔNG ĐỨNG IM)
        // ==============================================================
        // Mục tiêu rượt: Tiến về phía bầy vịt hoặc chú vịt mục tiêu
        const targetSprite = spritesRef.current.find(s => s.duck.id === targetDuckId);
        const targetX = targetSprite ? targetSprite.x : flockCenterX;
        const targetY = targetSprite ? targetSprite.y : flockCenterY;

        const toTargetX = targetX - p.x;
        const toTargetY = targetY - p.y;
        const distToTarget = Math.hypot(toTargetX, toTargetY) || 1;

        patrolAngleRef.current += 3.8 * dt;
        // Tốc độ chạy rượt đuổi sôi nổi: 135px/s
        const huntSpeed = 135 * dt;

        p.x += (toTargetX / distToTarget) * huntSpeed + Math.cos(patrolAngleRef.current) * 1.8;
        p.y += (toTargetY / distToTarget) * (huntSpeed * 0.65) + Math.sin(patrolAngleRef.current) * 1.4;

        p.direction = toTargetX >= 0 ? 'right' : 'left';
        p.isWalking = true;

        // Giới hạn người chơi trong sân
        const normPx = (p.x - arenaCenter.x) / (arenaRadiusX * 0.82);
        const normPy = (p.y - arenaCenter.y) / (arenaRadiusY * 0.82);
        const distNormP = Math.hypot(normPx, normPy);
        if (distNormP > 1) {
          p.x = arenaCenter.x + (normPx / distNormP) * (arenaRadiusX * 0.82);
          p.y = arenaCenter.y + (normPy / distNormP) * (arenaRadiusY * 0.82);
        }

        // Đồng bộ lên state cho React render chuyển động mượt mà
        setPlayerState({ ...p });

        // ==============================================================
        // 3. THUẬT TOÁN FLOCKING CHO ĐÀN VỊT CHẠY THEO BẦY
        // ==============================================================
        let anyPanic = false;

        spritesRef.current.forEach((sprite, i) => {
          if (sprite.isCaught) return;

          // A. LỰC HÚT VỀ TÂM BẦY (COHESION - Vịt muốn chạy gần bầy vịt)
          const toFlockX = (flockCenterX - sprite.x) * 0.45;
          const toFlockY = (flockCenterY - sprite.y) * 0.45;

          // B. LỰC ĐỒNG HƯỚNG VỚI BẦY (ALIGNMENT - Chạy cùng chiều với bầy vịt)
          const alignX = flockVelX * 0.25;
          const alignY = flockVelY * 0.25;

          // C. LỰC TÁCH NHAU TRÁNH ĐÈ LÊN NHAU (SEPARATION)
          let pushX = 0;
          let pushY = 0;
          for (let j = 0; j < spritesRef.current.length; j++) {
            if (i !== j && !spritesRef.current[j].isCaught) {
              const other = spritesRef.current[j];
              const dx = sprite.x - other.x;
              const dy = sprite.y - other.y;
              const d = Math.hypot(dx, dy);
              if (d < 38 && d > 0) {
                pushX += (dx / d) * (38 - d) * 1.8;
                pushY += (dy / d) * (38 - d) * 1.8;
              }
            }
          }

          // D. LỰC NÉ TRÁNH NGƯỜI CHƠI (PANIC & HERDING)
          const distToPlayer = Math.hypot(sprite.x - p.x, sprite.y - p.y);
          let fleeX = 0;
          let fleeY = 0;

          if (distToPlayer < 155) {
            sprite.state = 'PANIC';
            anyPanic = true;
            // Đẩy mạnh ra xa người chơi
            fleeX = ((sprite.x - p.x) / (distToPlayer || 1)) * 160;
            fleeY = ((sprite.y - p.y) / (distToPlayer || 1)) * 110;
          } else {
            sprite.state = 'WALK';
          }

          // E. CHẠY VÒNG QUANH SÂN (Perimeter circling)
          const angleToCenter = Math.atan2(sprite.y - arenaCenter.y, sprite.x - arenaCenter.x);
          const tangentX = -Math.sin(angleToCenter) * 35;
          const tangentY = Math.cos(angleToCenter) * 22;

          // TỔNG HỢP VẬN TỐC CỦA CHÚ VỊT
          sprite.vx += (toFlockX + alignX + pushX + fleeX + tangentX) * dt;
          sprite.vy += (toFlockY + alignY + pushY + fleeY + tangentY) * dt;

          // Giới hạn tốc độ tối đa
          const currentSpeed = Math.hypot(sprite.vx, sprite.vy);
          const maxSpeed = sprite.state === 'PANIC' ? 140 : 85;
          if (currentSpeed > maxSpeed) {
            sprite.vx = (sprite.vx / currentSpeed) * maxSpeed;
            sprite.vy = (sprite.vy / currentSpeed) * maxSpeed;
          }

          // Cập nhật vị trí
          sprite.x += sprite.vx * dt;
          sprite.y += sprite.vy * dt;

          // F. GIỚI HẠN TRONG HÀNG RÀO TRE
          const normX = (sprite.x - arenaCenter.x) / (arenaRadiusX * 0.88);
          const normY = (sprite.y - arenaCenter.y) / (arenaRadiusY * 0.88);
          const dNorm = Math.hypot(normX, normY);

          if (dNorm > 1) {
            sprite.x = arenaCenter.x + (normX / dNorm) * (arenaRadiusX * 0.88);
            sprite.y = arenaCenter.y + (normY / dNorm) * (arenaRadiusY * 0.88);
            sprite.vx = -sprite.vx * 0.8;
            sprite.vy = -sprite.vy * 0.8;
          }
        });

        // Âm thanh nhao nhao khi đàn vịt hoảng loạn
        if (anyPanic && currentTime - panicAudioTimerRef.current > 1500) {
          panicAudioTimerRef.current = currentTime;
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

  // CỌC RÀO TRE BAO QUANH
  const fencePosts = [];
  const postCount = 28;
  for (let i = 0; i < postCount; i++) {
    const angle = (i / postCount) * Math.PI * 2;
    if (angle > Math.PI * 0.44 && angle < Math.PI * 0.56) continue;
    const px = arenaCenter.x + Math.cos(angle) * arenaRadiusX;
    const py = arenaCenter.y + Math.sin(angle) * arenaRadiusY;
    fencePosts.push({ x: px, y: py, angle });
  }

  const allNames = ducks.map(d => d.name || '');

  return (
    <div
      ref={containerRef}
      onClick={() => triggerCatch()}
      className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#1b3a1a] via-[#2d5526] to-[#122611] select-none cursor-pointer"
    >
      {/* Container có camera zoom ngang tầm mắt */}
      <div
        className="relative w-full h-full transition-transform duration-700 ease-out"
        style={{
          transform: `scale(${cameraZoom.scale}) translate(${cameraZoom.x}px, ${cameraZoom.y}px)`,
          transformOrigin: `${arenaCenter.x}px ${arenaCenter.y}px`
        }}
      >
        {/* ============================================================== */}
        {/* 1. CAMERA HẠ THẤP: CHÒI ĐÌNH MÁI ĐỎ HIỆN RÕ Ở HẬU CẢNH NGANG MẮT */}
        {/* ============================================================== */}
        <div className="absolute top-2 inset-x-0 h-52 pointer-events-none flex flex-col items-center z-5">
          {/* Mái ngói đỏ lớn nhìn ngang */}
          <div className="relative mt-2 flex flex-col items-center">
            <div className="w-56 sm:w-80 h-14 sm:h-16 bg-gradient-to-b from-[#dc2626] to-[#991b1b] rounded-t-3xl shadow-2xl border-b-4 border-[#7f1d1d]" />
            <div className="absolute -left-6 top-0 w-10 h-10 border-t-5 border-l-5 border-[#b91c1c] rounded-tl-full transform -rotate-15" />
            <div className="absolute -right-6 top-0 w-10 h-10 border-t-5 border-r-5 border-[#b91c1c] rounded-tr-full transform rotate-15" />
          </div>
          {/* 6 Cột gỗ đình làng cao ráo */}
          <div className="relative w-52 sm:w-72 h-16 bg-[#3f2212]/40 flex justify-between items-end px-3 border-b-2 border-[#543018]">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-4 h-16 bg-[#5c351b] rounded-t-xs border-r border-[#3a200f]" />
            ))}
          </div>
        </div>

        {/* DÂY CỜ HỘI NGŨ SẮC GIĂNG NGANG */}
        <div className="absolute top-16 sm:top-18 inset-x-4 sm:inset-x-12 pointer-events-none z-15 flex justify-between items-center opacity-90">
          {['#2563eb', '#eab308', '#dc2626', '#facc15', '#16a34a', '#ea580c', '#eab308', '#2563eb', '#dc2626', '#16a34a'].map((c, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className="w-0 h-0 border-x-[12px] sm:border-x-[15px] border-x-transparent border-t-[22px] sm:border-t-[28px] filter drop-shadow-xs"
                style={{ borderTopColor: c }}
              />
            </div>
          ))}
        </div>

        {/* GÓC TRÁI: Bù nhìn rơm & Kiện rơm */}
        <div className="absolute top-20 left-2 sm:left-10 pointer-events-none z-10 hidden sm:flex flex-col items-center">
          <div className="w-0 h-0 border-x-[20px] border-x-transparent border-b-[15px] border-b-[#dfbe84]" />
          <div className="w-8 h-8 rounded-full bg-[#fcd34d] border border-amber-600 flex items-center justify-center text-xs -mt-1">
            🌾
          </div>
          <div className="w-12 h-12 bg-[#b45309]/80 rounded-t-md -mt-1 border border-amber-800" />
          <div className="w-16 h-10 bg-gradient-to-b from-[#fcd34d] to-[#d97706] rounded-md border border-amber-700 shadow-md flex items-center justify-center text-[9px] font-black text-amber-950 mt-1">
            RƠM
          </div>
        </div>

        {/* GÓC PHẢI: Chum vại sành & Đụn rơm */}
        <div className="absolute top-24 right-2 sm:right-12 pointer-events-none z-10 hidden sm:flex items-end space-x-2">
          <div className="w-18 h-16 bg-gradient-to-b from-[#fcd34d] to-[#b45309] rounded-t-full border border-amber-800 shadow-lg" />
          <div className="w-12 h-14 bg-gradient-to-r from-[#78350f] via-[#9a3412] to-[#78350f] rounded-full border-2 border-[#451a03] shadow-xl" />
        </div>

        {/* ============================================================== */}
        {/* 2. SÂN ĐẤT NÉN GÓC NHÌN NGANG & HÀNG RÀO TRE */}
        {/* ============================================================== */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
        >
          <defs>
            <radialGradient id="arenaSandGrad3D" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#edd8b6" />
              <stop offset="65%" stopColor="#dfbf8e" />
              <stop offset="90%" stopColor="#cca26d" />
              <stop offset="100%" stopColor="#a37841" />
            </radialGradient>
            <filter id="arenaShadow3D">
              <feDropShadow dx="0" dy="24" stdDeviation="28" floodColor="#1b3612" floodOpacity="0.88" />
            </filter>
          </defs>

          {/* Mặt sân cát elip góc nhìn ngang */}
          <ellipse
            cx={arenaCenter.x}
            cy={arenaCenter.y}
            rx={arenaRadiusX}
            ry={arenaRadiusY}
            fill="url(#arenaSandGrad3D)"
            stroke="#b88f57"
            strokeWidth="7"
            filter="url(#arenaShadow3D)"
          />

          {/* Vạch cát mòn */}
          <ellipse
            cx={arenaCenter.x}
            cy={arenaCenter.y}
            rx={arenaRadiusX * 0.88}
            ry={arenaRadiusY * 0.88}
            fill="none"
            stroke="#f2e2ca"
            strokeWidth="3.5"
            strokeDasharray="18 10"
            opacity="0.65"
          />

          {/* Hàng rào 2 nan gỗ */}
          <ellipse
            cx={arenaCenter.x}
            cy={arenaCenter.y - 18}
            rx={arenaRadiusX}
            ry={arenaRadiusY}
            fill="none"
            stroke="#c99f5d"
            strokeWidth="6.5"
            opacity="0.95"
          />
          <ellipse
            cx={arenaCenter.x}
            cy={arenaCenter.y - 4}
            rx={arenaRadiusX}
            ry={arenaRadiusY}
            fill="none"
            stroke="#b08341"
            strokeWidth="6.5"
            opacity="0.95"
          />

          {/* Cọc rào dựng đứng */}
          {fencePosts.map((post, idx) => (
            <g key={idx}>
              <rect
                x={post.x - 5}
                y={post.y - 34}
                width="10"
                height="34"
                rx="3"
                fill="#5a341a"
                stroke="#3a200e"
                strokeWidth="1.5"
              />
              <ellipse cx={post.x} cy={post.y - 34} rx="5" ry="2" fill="#784725" />
              <ellipse cx={post.x} cy={post.y - 18} rx="6" ry="2.5" fill="#dfbe84" />
              <ellipse cx={post.x} cy={post.y - 4} rx="6" ry="2.5" fill="#dfbe84" />
            </g>
          ))}

          {/* Cổng rào gỗ mở phía trước */}
          <g>
            <rect
              x={arenaCenter.x - 30}
              y={arenaCenter.y + arenaRadiusY - 28}
              width="26"
              height="28"
              rx="2"
              fill="#855027"
              stroke="#45240c"
              strokeWidth="2"
            />
            <rect
              x={arenaCenter.x + 4}
              y={arenaCenter.y + arenaRadiusY - 28}
              width="26"
              height="28"
              rx="2"
              fill="#855027"
              stroke="#45240c"
              strokeWidth="2"
            />
          </g>
        </svg>

        {/* ============================================================== */}
        {/* 3. ĐÀN VỊT 3D CHẠY THEO BẦY VUI NHỘN (FLOCKING BOIDS) */}
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
            speechQuote={sprite.speechQuote}
            isQuacking={sprite.isQuacking}
            isCaught={sprite.isCaught}
            isTarget={sprite.isTarget}
            showName={showDuckNames || mode === 'target'}
            allNames={allNames}
          />
        ))}

        {/* ============================================================== */}
        {/* 4. CẬU BÉ BỊT MẮT: ĐẦU HƯỚNG VỀ CAMERA, NÓN HẤT RA SAU, SẢI BƯỚC RƯỢT ĐUỔI */}
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
      {/* 5. NÚT BẮT VỊT TO NỔI BẬT DƯỚI ĐÁY */}
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
