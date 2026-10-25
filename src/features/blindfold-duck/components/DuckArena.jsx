import React, { useState, useEffect, useRef } from 'react';
import { DuckPlayerSprite } from './DuckPlayerSprite';
import { DuckSprite } from './DuckSprite';
import { duckAudio } from '../services/duckAudio';

/**
 * GIAO DIỆN & VẬT LÝ SÂN CHƠI 3D BỊT MẮT BẮT VỊT (Chuẩn 100% Version Gốc):
 * - Phối cảnh 3D Top-down / Isometric nhìn nghiêng 45-60°
 * - Sân đất nén tròn viền hàng rào tre 2 tầng nan gỗ
 * - Chòi đình ngói đỏ, cột gỗ nâu, dây cờ hội ngũ sắc giăng ngang
 * - Bù nhìn rơm đội nón lá, đụn rơm vàng, chum vại sành đất nung
 * - Đàn vịt 20-30 con đủ 8 màu sắc chạy hỗn loạn, tụ lại, tản ra (Flocking / Boids)
 * - Khi người chơi lại gần: Đàn vịt hoảng sợ ('PANIC') quác quác tạt sang hai bên!
 * - Hiệu ứng Camera Zoom & Spotlight rọi vào chú vịt khi bắt được
 */
export const DuckArena = ({
  ducks = [],
  mode = 'random_call', // 'random_call' | 'target' | 'blind_catch'
  targetDuckId = null,
  timeLeft = 20,
  roundDuration = 20,
  showDuckNames = false, // Mặc định ẩn tên để tạo bất ngờ
  onCatchDuck,
  onMissCatch,
  isPaused = false
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 620 });

  // Tâm và bán kính sân đất nén phối cảnh 3D elip
  const arenaCenter = { x: dimensions.width / 2, y: dimensions.height / 2 + 55 };
  const arenaRadiusX = Math.min(dimensions.width * 0.44, 460);
  const arenaRadiusY = Math.min(dimensions.height * 0.33, 215);

  // Người chơi bịt mắt
  const [player, setPlayer] = useState({
    x: arenaCenter.x - 30,
    y: arenaCenter.y,
    direction: 'right',
    isWalking: true,
    isCatching: false
  });

  // Đàn vịt 3D (20-30 con)
  const [duckSprites, setDuckSprites] = useState([]);
  const [nearestDuck, setNearestDuck] = useState(null);
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

  // KHỞI TẠO ĐÀN VỊT 20 - 30 CON ĐỦ MÀU SẮC TRÊN SÂN CHƠI 3D
  useEffect(() => {
    if (!ducks || ducks.length === 0) return;

    hasCaughtRef.current = false;
    setCaughtDuckObj(null);
    setCameraZoom({ scale: 1, x: 0, y: 0 });

    // Số lượng vịt xuất hiện trong sân: ít nhất 18 con, nhiều nhất 32 con
    const flockTargetCount = Math.max(18, Math.min(32, ducks.length));
    const cohort = [];

    // Nạp học sinh thật trước, nếu thiếu thì nhân bản ngẫu nhiên để đủ đàn vịt đông vui
    for (let i = 0; i < flockTargetCount; i++) {
      const sourceDuck = ducks[i % ducks.length];
      cohort.push({
        ...sourceDuck,
        instanceId: `inst_${sourceDuck.id}_${i}`,
        isTarget: sourceDuck.id === targetDuckId
      });
    }

    // Đặt vị trí xuất phát tản đều trên mặt sân đất
    const initialSprites = cohort.map((item, idx) => {
      const angle = (idx / flockTargetCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const rRatio = 0.35 + Math.random() * 0.5; // Tản đều từ giữa ra biên
      const x = arenaCenter.x + Math.cos(angle) * (arenaRadiusX * rRatio);
      const y = arenaCenter.y + Math.sin(angle) * (arenaRadiusY * rRatio);

      const baseSpeed = 48 + (idx % 5) * 8 + Math.random() * 12;
      const moveAngle = Math.random() * Math.PI * 2;

      return {
        instanceId: item.instanceId,
        duck: item,
        x,
        y,
        vx: Math.cos(moveAngle) * baseSpeed,
        vy: Math.sin(moveAngle) * (baseSpeed * 0.65),
        speed: baseSpeed,
        state: 'WALK', // 'WALK' | 'PANIC' | 'CAUGHT'
        colorIndex: idx,
        speechQuote: null,
        isQuacking: false,
        isCaught: false,
        isTarget: item.isTarget
      };
    });

    spritesRef.current = initialSprites;
    setDuckSprites(initialSprites);

    setPlayer({
      x: arenaCenter.x - 20,
      y: arenaCenter.y + 10,
      direction: 'right',
      isWalking: true,
      isCatching: false
    });
    patrolAngleRef.current = 0;
  }, [ducks, targetDuckId, dimensions.width, dimensions.height]);

  // HÀNH ĐỘNG BẮT VỊT (Tự động hoặc khi Thầy bấm nút Bắt)
  const triggerCatch = (forcedDuck = null) => {
    if (hasCaughtRef.current) return;

    setPlayer(p => ({ ...p, isCatching: true }));
    setTimeout(() => setPlayer(p => ({ ...p, isCatching: false })), 500);

    // Xác định chú vịt bị bắt
    let targetToCatch = forcedDuck;
    if (!targetToCatch) {
      if (mode === 'random_call' && targetDuckId) {
        const targetSprite = spritesRef.current.find(s => s.duck.id === targetDuckId);
        targetToCatch = targetSprite ? targetSprite.duck : (nearestDuck?.sprite?.duck || ducks[0]);
      } else {
        targetToCatch = nearestDuck?.sprite?.duck || ducks[0];
      }
    }

    if (targetToCatch) {
      hasCaughtRef.current = true;
      duckAudio.playCatchSuccess();

      // Cập nhật trạng thái bị bắt và dừng đàn vịt
      const caughtSprite = spritesRef.current.find(
        s => s.duck.id === targetToCatch.id || s.duck.instanceId === targetToCatch.instanceId
      );

      if (caughtSprite) {
        caughtSprite.isCaught = true;
        caughtSprite.state = 'CAUGHT';
        setCaughtDuckObj(targetToCatch);

        // Hiệu ứng Camera Zoom Focus vào vị trí chú vịt bị bắt
        const focusX = (arenaCenter.x - caughtSprite.x) * 0.25;
        const focusY = (arenaCenter.y - caughtSprite.y) * 0.25;
        setCameraZoom({ scale: 1.15, x: focusX, y: focusY });
      }

      setDuckSprites([...spritesRef.current]);

      // Sau 1.2s thưởng thức khoảnh khắc bắt được, gửi thông báo hoàn tất
      setTimeout(() => {
        onCatchDuck?.(targetToCatch);
      }, 1200);
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

  // VÒNG LẶP VẬT LÝ VÀ FLOCKING AI (60fps)
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.08);
      lastTime = currentTime;

      if (!isPaused && !hasCaughtRef.current) {
        let px = player.x;
        let py = player.y;

        // 1. NGƯỜI CHƠI BỊT MẮT TỰ ĐỘNG RƯỢT ĐUỔI VỊT
        // Tìm vị trí con vịt mục tiêu (hoặc vịt gần nhất)
        let targetX = arenaCenter.x;
        let targetY = arenaCenter.y;
        const targetSprite =
          spritesRef.current.find(s => s.duck.id === targetDuckId) ||
          (nearestDuck ? nearestDuck.sprite : spritesRef.current[0]);

        if (targetSprite) {
          targetX = targetSprite.x;
          targetY = targetSprite.y;
        }

        const toTargetX = targetX - px;
        const toTargetY = targetY - py;
        const distToTarget = Math.hypot(toTargetX, toTargetY) || 1;

        patrolAngleRef.current += 3.5 * dt;
        const huntSpeed = 115 * dt;

        // Tiến dần về phía mục tiêu với quỹ đạo săn lùng vòng tròn
        px += (toTargetX / distToTarget) * huntSpeed + Math.cos(patrolAngleRef.current) * 1.5;
        py += (toTargetY / distToTarget) * (huntSpeed * 0.65) + Math.sin(patrolAngleRef.current) * 1.2;

        const newDir = toTargetX >= 0 ? 'right' : 'left';

        // Giới hạn người chơi trong sân đất
        const normDx = (px - arenaCenter.x) / (arenaRadiusX * 0.78);
        const normDy = (py - arenaCenter.y) / (arenaRadiusY * 0.78);
        const playerDistNorm = Math.hypot(normDx, normDy);
        if (playerDistNorm > 1) {
          px = arenaCenter.x + (normDx / playerDistNorm) * (arenaRadiusX * 0.78);
          py = arenaCenter.y + (normDy / playerDistNorm) * (arenaRadiusY * 0.78);
        }

        setPlayer(prev => ({
          ...prev,
          x: px,
          y: py,
          direction: newDir,
          isWalking: true
        }));

        // 2. VẬT LÝ FLOCKING & WANDERING CỦA ĐÀN VỊT
        let closestDist = 999999;
        let closestSprite = null;
        let anyPanic = false;

        spritesRef.current.forEach((sprite, i) => {
          if (sprite.isCaught) return;

          // Khoảng cách tới người chơi
          const distToPlayer = Math.hypot(sprite.x - px, sprite.y - py);

          // Cập nhật vịt gần người chơi nhất
          if (distToPlayer < closestDist) {
            closestDist = distToPlayer;
            closestSprite = sprite;
          }

          // A. PHẢN ỨNG HOẢNG SỢ KHI NGƯỜI CHƠI LẠI GẦN (< 140px)
          if (distToPlayer < 140) {
            sprite.state = 'PANIC';
            anyPanic = true;
            // Vector đẩy mạnh ra xa người chơi
            const fleeX = (sprite.x - px) / (distToPlayer || 1);
            const fleeY = (sprite.y - py) / (distToPlayer || 1);
            const fleeSpeed = sprite.speed * 1.85;

            sprite.vx = fleeX * fleeSpeed;
            sprite.vy = fleeY * (fleeSpeed * 0.7);
          } else {
            sprite.state = 'WALK';
            // B. TỰ DO DI CHUYỂN & LƯỢN VÒNG (Wandering)
            if (Math.random() < 0.03) {
              const wanderAngle = Math.random() * Math.PI * 2;
              sprite.vx = Math.cos(wanderAngle) * sprite.speed;
              sprite.vy = Math.sin(wanderAngle) * (sprite.speed * 0.65);
            }
          }

          // C. TÁCH NHAU (Separation để vịt không đè dính vào nhau)
          for (let j = i + 1; j < spritesRef.current.length; j++) {
            const other = spritesRef.current[j];
            const dx = sprite.x - other.x;
            const dy = sprite.y - other.y;
            const d = Math.hypot(dx, dy);
            if (d < 36 && d > 0) {
              const push = (36 - d) * 0.5;
              sprite.x += (dx / d) * push;
              sprite.y += (dy / d) * push;
              other.x -= (dx / d) * push;
              other.y -= (dy / d) * push;
            }
          }

          // Cập nhật tọa độ
          sprite.x += sprite.vx * dt;
          sprite.y += sprite.vy * dt;

          // D. GIỚI HẠN TRONG HÀNG RÀO TRE TRÒN (Rebound khi chạm biên)
          const normX = (sprite.x - arenaCenter.x) / (arenaRadiusX * 0.88);
          const normY = (sprite.y - arenaCenter.y) / (arenaRadiusY * 0.88);
          const dNorm = Math.hypot(normX, normY);

          if (dNorm > 1) {
            sprite.x = arenaCenter.x + (normX / dNorm) * (arenaRadiusX * 0.88);
            sprite.y = arenaCenter.y + (normY / dNorm) * (arenaRadiusY * 0.88);
            // Bật ngược lại hướng vào tâm
            sprite.vx = -sprite.vx * 0.85;
            sprite.vy = -sprite.vy * 0.85;
          }
        });

        // Phát tiếng quác hoảng hốt khi đàn vịt bị rượt đuổi dồn
        if (anyPanic && currentTime - panicAudioTimerRef.current > 1600) {
          panicAudioTimerRef.current = currentTime;
          duckAudio.playFlockPanic();
        }

        setNearestDuck(closestSprite ? { sprite: closestSprite, distance: closestDist } : null);
        setDuckSprites([...spritesRef.current]);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPaused, arenaCenter.x, arenaCenter.y, arenaRadiusX, arenaRadiusY, targetDuckId, mode]);

  // CÁC CỌC HÀNG RÀO TRE BAO QUANH SÂN CHƠI
  const fencePosts = [];
  const postCount = 28;
  for (let i = 0; i < postCount; i++) {
    const angle = (i / postCount) * Math.PI * 2;
    if (angle > Math.PI * 0.44 && angle < Math.PI * 0.56) continue; // Cổng vào phía trước
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
      {/* Container áp dụng hiệu ứng Camera Zoom mượt mà */}
      <div
        className="relative w-full h-full transition-transform duration-700 ease-out"
        style={{
          transform: `scale(${cameraZoom.scale}) translate(${cameraZoom.x}px, ${cameraZoom.y}px)`,
          transformOrigin: `${arenaCenter.x}px ${arenaCenter.y}px`
        }}
      >
        {/* ============================================================== */}
        {/* 1. HẬU CẢNH ĐỒNG QUÊ & CHÒI ĐÌNH TRUNG TÂM (Chuẩn Version Gốc) */}
        {/* ============================================================== */}
        <div className="absolute top-0 inset-x-0 h-44 pointer-events-none flex flex-col items-center z-5">
          {/* Mái ngói đỏ đình làng */}
          <div className="relative mt-2 flex flex-col items-center">
            <div className="w-48 sm:w-72 h-11 sm:h-14 bg-gradient-to-b from-[#dc2626] to-[#991b1b] rounded-t-2xl shadow-lg border-b-3 border-[#7f1d1d]" />
            <div className="absolute -left-4 top-0 w-8 h-8 border-t-4 border-l-4 border-[#b91c1c] rounded-tl-full transform -rotate-15" />
            <div className="absolute -right-4 top-0 w-8 h-8 border-t-4 border-r-4 border-[#b91c1c] rounded-tr-full transform rotate-15" />
          </div>
          {/* Cột gỗ đình làng */}
          <div className="relative w-44 sm:w-64 h-9 bg-[#3f2212]/35 flex justify-between items-end px-3 border-b-2 border-[#543018]">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-3.5 h-9 bg-[#5c351b] rounded-t-xs border-r border-[#3a200f]" />
            ))}
          </div>
        </div>

        {/* DÂY CỜ HỘI NGŨ SẮC GIĂNG NGANG */}
        <div className="absolute top-12 sm:top-14 inset-x-4 sm:inset-x-14 pointer-events-none z-15 flex justify-between items-center opacity-90">
          {['#2563eb', '#eab308', '#dc2626', '#facc15', '#16a34a', '#ea580c', '#eab308', '#2563eb', '#dc2626', '#16a34a'].map((c, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className="w-0 h-0 border-x-[11px] sm:border-x-[14px] border-x-transparent border-t-[20px] sm:border-t-[26px] filter drop-shadow-xs"
                style={{ borderTopColor: c }}
              />
            </div>
          ))}
        </div>

        {/* GÓC TRÁI: Bù nhìn rơm đội nón lá & Kiện rơm vàng */}
        <div className="absolute top-14 left-2 sm:left-8 pointer-events-none z-10 hidden sm:flex flex-col items-center">
          <div className="w-0 h-0 border-x-[18px] border-x-transparent border-b-[14px] border-b-[#dfbe84]" />
          <div className="w-7 h-7 rounded-full bg-[#fcd34d] border border-amber-600 flex items-center justify-center text-xs -mt-1">
            🌾
          </div>
          <div className="w-10 h-10 bg-[#b45309]/80 rounded-t-md -mt-1 border border-amber-800" />
          <div className="w-14 h-9 bg-gradient-to-b from-[#fcd34d] to-[#d97706] rounded-md border border-amber-700 shadow-md flex items-center justify-center text-[8px] font-black text-amber-950 mt-1">
            RƠM
          </div>
        </div>

        {/* GÓC PHẢI: Chum vại sành đất nung & Đụn rơm */}
        <div className="absolute top-16 right-2 sm:right-10 pointer-events-none z-10 hidden sm:flex items-end space-x-2">
          <div className="w-16 h-14 bg-gradient-to-b from-[#fcd34d] to-[#b45309] rounded-t-full border border-amber-800 shadow-lg" />
          <div className="w-11 h-12 bg-gradient-to-r from-[#78350f] via-[#9a3412] to-[#78350f] rounded-full border-2 border-[#451a03] shadow-xl" />
        </div>

        {/* ============================================================== */}
        {/* 2. SÂN ĐẤT HÌNH TRÒN PHỐI CẢNH 3D & HÀNG RÀO TRE */}
        {/* ============================================================== */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
        >
          <defs>
            <radialGradient id="arenaSandGrad3D" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#edd8b6" />
              <stop offset="65%" stopColor="#dfbf8e" />
              <stop offset="90%" stopColor="#cca26d" />
              <stop offset="100%" stopColor="#a37841" />
            </radialGradient>
            <filter id="arenaShadow3D">
              <feDropShadow dx="0" dy="20" stdDeviation="24" floodColor="#1b3612" floodOpacity="0.85" />
            </filter>
          </defs>

          {/* Mặt sân cát elip */}
          <ellipse
            cx={arenaCenter.x}
            cy={arenaCenter.y}
            rx={arenaRadiusX}
            ry={arenaRadiusY}
            fill="url(#arenaSandGrad3D)"
            stroke="#b88f57"
            strokeWidth="6"
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

          {/* Hàng rào 2 nan gỗ tre */}
          <ellipse
            cx={arenaCenter.x}
            cy={arenaCenter.y - 16}
            rx={arenaRadiusX}
            ry={arenaRadiusY}
            fill="none"
            stroke="#c99f5d"
            strokeWidth="6"
            opacity="0.95"
          />
          <ellipse
            cx={arenaCenter.x}
            cy={arenaCenter.y - 3}
            rx={arenaRadiusX}
            ry={arenaRadiusY}
            fill="none"
            stroke="#b08341"
            strokeWidth="6"
            opacity="0.95"
          />

          {/* Cọc rào dựng đứng */}
          {fencePosts.map((post, idx) => (
            <g key={idx}>
              <rect
                x={post.x - 5}
                y={post.y - 30}
                width="10"
                height="30"
                rx="3"
                fill="#5a341a"
                stroke="#3a200e"
                strokeWidth="1.5"
              />
              <ellipse cx={post.x} cy={post.y - 30} rx="5" ry="2" fill="#784725" />
              <ellipse cx={post.x} cy={post.y - 16} rx="6" ry="2.5" fill="#dfbe84" />
              <ellipse cx={post.x} cy={post.y - 3} rx="6" ry="2.5" fill="#dfbe84" />
            </g>
          ))}

          {/* Cổng rào gỗ mở phía trước */}
          <g>
            <rect
              x={arenaCenter.x - 28}
              y={arenaCenter.y + arenaRadiusY - 26}
              width="24"
              height="26"
              rx="2"
              fill="#855027"
              stroke="#45240c"
              strokeWidth="2"
            />
            <rect
              x={arenaCenter.x + 4}
              y={arenaCenter.y + arenaRadiusY - 26}
              width="24"
              height="26"
              rx="2"
              fill="#855027"
              stroke="#45240c"
              strokeWidth="2"
            />
          </g>
        </svg>

        {/* ============================================================== */}
        {/* 3. ĐÀN VỊT 3D CHẠY TÁN LOẠN TRONG SÂN (20-30 CON) */}
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
        {/* 4. CẬU BÉ BỊT MẮT NÓN LÁ ÁO BÀ BA ĐUỔI BẮT VỊT */}
        {/* ============================================================== */}
        <DuckPlayerSprite
          x={player.x}
          y={player.y}
          direction={player.direction}
          isWalking={player.isWalking}
          isCatching={player.isCatching}
        />
      </div>

      {/* ============================================================== */}
      {/* 5. NÚT BẮT VỊT TO NỔI BẬT DƯỚI ĐÁY SÂN CHƠI */}
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
