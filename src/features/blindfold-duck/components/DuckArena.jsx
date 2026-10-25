import React, { useState, useEffect, useRef } from 'react';
import { DuckPlayerSprite } from './DuckPlayerSprite';
import { DuckSprite } from './DuckSprite';
import { duckAudio } from '../services/duckAudio';

/**
 * Giao diện và Vật lý sân chơi BỊT MẮT BẮT VỊT chuẩn 100% theo Ảnh Concept 3D:
 * - Phối cảnh 2.5D làng quê Việt Nam với ánh sáng vàng ấm áp
 * - Chòi đình ngói đỏ cột gỗ nâu ở hậu cảnh trung tâm
 * - Dây cờ tam giác ngũ sắc giăng ngang sinh động
 * - Bù nhìn rơm đội nón lá, kiện rơm vuông, chum vại sành cổ truyền
 * - Hàng rào 2 nan gỗ tròn bao quanh sân cát, cổng gỗ mở phía trước
 * - 9 Chú vịt học sinh chạy vòng quanh sân, vỗ cánh, bong bóng thoại trêu đùa
 * - Cậu bé bịt mắt nón lá áo bà ba chạy rượt đuổi lần theo tiếng kêu quác quác
 */
export const DuckArena = ({
  ducks = [],
  mode = 'quiz',
  difficulty = 'easy',
  targetDuckId = null,
  timeLeft = 20,
  roundDuration = 20,
  onCatchDuck,
  onMissCatch,
  isPaused = false
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 620 });

  // Tâm và bán kính sân đất phối cảnh 2.5D Elip (Chuẩn 100% theo ảnh concept)
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

  // Đàn vịt con học sinh (Chuẩn 9 vịt mỗi lượt chạy như ảnh concept)
  const [duckSprites, setDuckSprites] = useState([]);
  const [nearestDuck, setNearestDuck] = useState(null);
  const [quackingDuckId, setQuackingDuckId] = useState(null);

  const keysPressed = useRef({});
  const animFrameRef = useRef(null);
  const patrolAngleRef = useRef(0);
  const userInteractedRef = useRef(false);
  const userControlTimeoutRef = useRef(null);
  const quackTimerRef = useRef(0);
  const quackingDuckIdRef = useRef(null);
  const spritesRef = useRef([]);
  const hasCaughtRef = useRef(false);

  // Kích thước responsive
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

  // KHỞI TẠO 9 VỊT CHUẨN ĐÚNG THEO VỊ TRÍ VÀ THOẠI CỦA ẢNH THAM CHIẾU
  useEffect(() => {
    if (!ducks || ducks.length === 0) return;

    hasCaughtRef.current = false;
    // Chọn 9 bạn học sinh cho lượt chơi này
    const cohort = ducks.slice(0, 9);

    // Góc xuất phát chuẩn theo 9 vị trí trong ảnh tham chiếu
    // [Trang (góc 7h), Lan Phương (10h), Ngọc Diệp (12h), Duy (2h), Bảo (3h), Minh (4h), Quang (5h), Thảo (6h), Mai (8h)]
    const angles = [
      Math.PI * 0.75,  // 0: Trang
      Math.PI * 1.25,  // 1: Lan Phương ("Thầy ơi em đây này!")
      Math.PI * 1.55,  // 2: Ngọc Diệp ("Hụt rồi!")
      Math.PI * 1.85,  // 3: Duy
      Math.PI * 0.05,  // 4: Bảo ("Em chưa học bài đâu!")
      Math.PI * 0.28,  // 5: Minh
      Math.PI * 0.45,  // 6: Quang (kính tròn)
      Math.PI * 0.58,  // 7: Thảo (mồ hôi)
      Math.PI * 0.88   // 8: Mai (‼️)
    ];

    const initialSprites = cohort.map((d, idx) => {
      const angle = angles[idx % angles.length];
      const rRatio = 0.76 + (idx % 2 === 0 ? 0.06 : -0.05);
      const x = arenaCenter.x + Math.cos(angle) * (arenaRadiusX * rRatio);
      const y = arenaCenter.y + Math.sin(angle) * (arenaRadiusY * rRatio);

      // Lời thoại ban đầu chuẩn theo ảnh
      let quote = null;
      if (idx === 1 || d.name.includes('Phương')) quote = 'Thầy ơi em đây này!';
      else if (idx === 2 || d.name.includes('Diệp')) quote = 'Hụt rồi!';
      else if (idx === 4 || d.name.includes('Bảo')) quote = 'Em chưa học bài đâu!';

      const baseSpeed = 52 + (idx % 3) * 6;

      return {
        duck: d,
        x,
        y,
        angle,
        speed: baseSpeed,
        vx: -Math.sin(angle) * baseSpeed,
        vy: Math.cos(angle) * (baseSpeed * 0.65),
        speechQuote: quote,
        isQuacking: false,
        isCaught: false,
        isScared: false
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
  }, [ducks, dimensions.width, dimensions.height]);

  const allStudentNames = ducks.map(d => d.name || '');

  // Lắng nghe bàn phím W/A/S/D & Phím Cách
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPaused) return;
      keysPressed.current[e.key.toLowerCase()] = true;
      keysPressed.current[e.code] = true;
      userInteractedRef.current = true;

      if (userControlTimeoutRef.current) clearTimeout(userControlTimeoutRef.current);
      userControlTimeoutRef.current = setTimeout(() => {
        userInteractedRef.current = false;
      }, 2500);

      if (e.code === 'Space') {
        e.preventDefault();
        triggerCatch();
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (userControlTimeoutRef.current) clearTimeout(userControlTimeoutRef.current);
    };
  }, [nearestDuck, isPaused]);

  // Nhấp chuột / Chạm vào sân để điều khiển
  const handleArenaClick = (e) => {
    if (isPaused || hasCaughtRef.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const dx = clickX - player.x;
    const dy = clickY - player.y;
    const angle = Math.atan2(dy, dx);
    const dashDistance = Math.min(110, Math.hypot(dx, dy));

    userInteractedRef.current = true;
    if (userControlTimeoutRef.current) clearTimeout(userControlTimeoutRef.current);
    userControlTimeoutRef.current = setTimeout(() => {
      userInteractedRef.current = false;
    }, 2500);

    let newPx = player.x + Math.cos(angle) * dashDistance;
    let newPy = player.y + Math.sin(angle) * dashDistance;

    // Giữ trong sân elip
    const normX = (newPx - arenaCenter.x) / (arenaRadiusX - 35);
    const normY = (newPy - arenaCenter.y) / (arenaRadiusY - 24);
    if (normX * normX + normY * normY > 1) {
      const edgeAngle = Math.atan2(normY, normX);
      newPx = arenaCenter.x + Math.cos(edgeAngle) * (arenaRadiusX - 35);
      newPy = arenaCenter.y + Math.sin(edgeAngle) * (arenaRadiusY - 24);
    }

    setPlayer(p => ({
      ...p,
      x: newPx,
      y: newPy,
      direction: dx >= 0 ? 'right' : 'left',
      isWalking: true
    }));
  };

  // Hành động BẮT VỊT
  const triggerCatch = (forcedDuck = null) => {
    if (hasCaughtRef.current) return;

    setPlayer(p => ({ ...p, isCatching: true }));
    setTimeout(() => setPlayer(p => ({ ...p, isCatching: false })), 400);

    const targetToCatch = forcedDuck || (nearestDuck && nearestDuck.distance <= 95 ? nearestDuck.sprite.duck : null);

    if (targetToCatch) {
      hasCaughtRef.current = true;
      duckAudio.playCatchSuccess();
      setDuckSprites(prev =>
        prev.map(ds => (ds.duck.id === targetToCatch.id ? { ...ds, isCaught: true } : ds))
      );
      onCatchDuck?.(targetToCatch);
    } else {
      duckAudio.playMiss();
      onMissCatch?.();
    }
  };

  // KHI HẾT GIỜ (20S HOẶC 30S): TỰ ĐỘNG BẮT 1 VỊT ĐỂ HỌC SINH TRẢ BÀI
  useEffect(() => {
    if (timeLeft === 0 && !hasCaughtRef.current && !isPaused) {
      const activeSprites = spritesRef.current.filter(s => !s.isCaught);
      if (activeSprites.length > 0) {
        let bestTarget = activeSprites[0].duck;
        let minD = 999999;
        activeSprites.forEach(s => {
          const d = Math.hypot(s.x - player.x, s.y - player.y);
          if (d < minD) {
            minD = d;
            bestTarget = s.duck;
          }
        });
        triggerCatch(bestTarget);
      }
    }
  }, [timeLeft, isPaused]);

  // VÒNG LẶP VẬT LÝ VÀ CHUYỂN ĐỘNG VÒNG QUANH SÂN ĐẤT NÉN (60fps)
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.08);
      lastTime = currentTime;

      if (!isPaused && !hasCaughtRef.current) {
        let px = player.x;
        let py = player.y;
        let newDir = player.direction;
        let isWalking = true;

        // 1. NGƯỜI CHƠI BỊT MẮT DI CHUYỂN
        let dx = 0;
        let dy = 0;
        const keys = keysPressed.current;

        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;

        if (dx !== 0 || dy !== 0) {
          userInteractedRef.current = true;
          const moveSpeed = 195 * dt;
          px += dx * moveSpeed;
          py += dy * moveSpeed;
          newDir = dx < 0 ? 'left' : dx > 0 ? 'right' : player.direction;
        } else if (!userInteractedRef.current) {
          // TỰ ĐỘNG DI CHUYỂN RƯỢT ĐUỔI VỊT (Tự động lùng sục theo âm thanh)
          let targetX = arenaCenter.x;
          let targetY = arenaCenter.y;

          const targetSprite =
            spritesRef.current.find(s => s.duck.id === quackingDuckIdRef.current && !s.isCaught) ||
            (nearestDuck ? nearestDuck.sprite : null);

          if (targetSprite) {
            targetX = targetSprite.x;
            targetY = targetSprite.y;
          }

          const toTargetX = targetX - px;
          const toTargetY = targetY - py;
          const distToTarget = Math.hypot(toTargetX, toTargetY) || 1;

          patrolAngleRef.current += 3.2 * dt;
          const wobbleX = Math.sin(patrolAngleRef.current) * 20;
          const wobbleY = Math.cos(patrolAngleRef.current) * 14;

          const chaseSpeed = 125 * dt;
          px += (toTargetX / distToTarget) * chaseSpeed + wobbleX * dt;
          py += (toTargetY / distToTarget) * (chaseSpeed * 0.7) + wobbleY * dt;

          if (Math.abs(toTargetX) > 2) {
            newDir = toTargetX > 0 ? 'right' : 'left';
          }
        }

        // Giới hạn người chơi trong sân elip
        const normPx = (px - arenaCenter.x) / (arenaRadiusX - 35);
        const normPy = (py - arenaCenter.y) / (arenaRadiusY - 24);
        if (normPx * normPx + normPy * normPy > 1) {
          const edgeAngle = Math.atan2(normPy, normPx);
          px = arenaCenter.x + Math.cos(edgeAngle) * (arenaRadiusX - 35);
          py = arenaCenter.y + Math.sin(edgeAngle) * (arenaRadiusY - 24);
        }

        setPlayer(prev => ({
          ...prev,
          x: px,
          y: py,
          direction: newDir,
          isWalking
        }));

        // 2. ĐÀN VỊT CHẠY VÒNG QUANH VÒNG TRÒN VÀ NÉ TRÁNH NGƯỜI CHƠI (Chuẩn 100% Ảnh)
        const currentList = spritesRef.current;
        let closest = null;
        let minD = 999999;

        const updatedSprites = currentList.map((d1, i) => {
          if (d1.isCaught) return d1;

          const distToPlayer = Math.hypot(d1.x - px, d1.y - py);
          if (distToPlayer < minD) {
            minD = distToPlayer;
            closest = { sprite: d1, distance: distToPlayer };
          }

          // Lực đẩy giữa các vịt để không bao giờ đè lên nhau
          let fx = 0;
          let fy = 0;
          for (let j = 0; j < currentList.length; j++) {
            if (i === j) continue;
            const d2 = currentList[j];
            if (d2.isCaught) continue;
            const diffX = d1.x - d2.x;
            const diffY = d1.y - d2.y;
            const distSq = diffX * diffX + diffY * diffY;
            if (distSq < 3600 && distSq > 0.01) { // Bán kính 60px
              const dist = Math.sqrt(distSq);
              const push = (60 - dist) / 60;
              fx += (diffX / dist) * push * 80;
              fy += (diffY / dist) * push * 60;
            }
          }

          // Chạy quanh vành đai sân theo chiều kim đồng hồ
          let newAngle = d1.angle + (d1.speed / arenaRadiusX) * dt * 0.9;
          let isScared = false;

          // Khi người chơi tới gần: Vịt hoảng sợ bứt tốc chạy né tránh
          if (distToPlayer < 135) {
            isScared = true;
            newAngle += (d1.speed * 1.8 / arenaRadiusX) * dt;
            const awayX = d1.x - px;
            const awayY = d1.y - py;
            const awayDist = Math.hypot(awayX, awayY) || 1;
            fx += (awayX / awayDist) * 160;
            fy += (awayY / awayDist) * 120;
          }

          const rRatio = 0.76 + Math.sin(newAngle * 2 + i) * 0.08;
          let targetX = arenaCenter.x + Math.cos(newAngle) * (arenaRadiusX * rRatio);
          let targetY = arenaCenter.y + Math.sin(newAngle) * (arenaRadiusY * rRatio);

          let newX = d1.x + (targetX - d1.x) * Math.min(3.5 * dt, 0.25) + fx * dt;
          let newY = d1.y + (targetY - d1.y) * Math.min(3.5 * dt, 0.25) + fy * dt;

          const vx = newX - d1.x;

          return {
            ...d1,
            x: newX,
            y: newY,
            vx: vx || d1.vx,
            angle: newAngle,
            isScared,
            isQuacking: d1.duck.id === quackingDuckIdRef.current
          };
        });

        spritesRef.current = updatedSprites;
        setDuckSprites(updatedSprites);
        setNearestDuck(closest);

        // 3. ÂM THANH ĐỊNH VỊ STEREO PANNER KHI VỊT KÊU QUÁC QUÁC
        quackTimerRef.current += dt;
        if (quackTimerRef.current > 1.3) {
          quackTimerRef.current = 0;
          const active = updatedSprites.filter(s => !s.isCaught);
          if (active.length > 0) {
            const pick =
              active.find(s => s.isScared) ||
              active[Math.floor(Math.random() * active.length)];

            if (pick) {
              quackingDuckIdRef.current = pick.duck.id;
              setQuackingDuckId(pick.duck.id);

              const relX = (pick.x - px) / arenaRadiusX;
              const dist = Math.hypot(pick.x - px, pick.y - py);
              duckAudio.playSpatialQuack(relX, dist, arenaRadiusX, Math.floor(Math.random() * 3));

              setTimeout(() => {
                if (quackingDuckIdRef.current === pick.duck.id) {
                  quackingDuckIdRef.current = null;
                  setQuackingDuckId(null);
                }
              }, 600);
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [arenaCenter.x, arenaCenter.y, arenaRadiusX, arenaRadiusY, isPaused]);

  // Luân phiên đổi bong bóng lời thoại trêu đùa của đàn vịt
  useEffect(() => {
    if (isPaused) return;
    const quotes = [
      'Thầy ơi em đây này!',
      'Hụt rồi!',
      'Em chưa học bài đâu!',
      'Quạc quạc né kịp rồi!',
      'Lêu lêu bắt hụt rồi!'
    ];

    const quoteTimer = setInterval(() => {
      setDuckSprites(prev => {
        if (prev.length === 0) return prev;
        const available = prev.filter(s => !s.isCaught);
        if (available.length === 0) return prev;
        const randIdx = Math.floor(Math.random() * available.length);
        const targetId = available[randIdx].duck.id;
        const quote = quotes[Math.floor(Math.random() * quotes.length)];

        return prev.map(s => {
          if (s.duck.id === targetId) {
            return { ...s, speechQuote: quote };
          }
          return s;
        });
      });
    }, 3200);

    return () => clearInterval(quoteTimer);
  }, [isPaused]);

  // 18 Cột gỗ tròn của hàng rào tre uốn quanh sân elip
  const fencePosts = Array.from({ length: 18 }).map((_, i) => {
    const angle = (i / 18) * Math.PI * 2;
    const x = arenaCenter.x + Math.cos(angle) * arenaRadiusX;
    const y = arenaCenter.y + Math.sin(angle) * arenaRadiusY;
    const isFront = y > arenaCenter.y + 40;
    return { x, y, angle, isFront };
  });

  return (
    <div
      ref={containerRef}
      onClick={handleArenaClick}
      className="relative w-full h-full overflow-hidden select-none bg-gradient-to-b from-[#8fbf79] via-[#75ad5e] to-[#5a9c4a] flex items-center justify-center cursor-crosshair"
    >
      {/* ============================================================== */}
      {/* 1. KHÔNG GIAN BỐI CẢNH LÀNG QUÊ VIỆT NAM (CHUẨN 100% ẢNH CONCEPT) */}
      {/* ============================================================== */}

      {/* Cánh đồng & lũy tre xanh mướt phía sau */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[#99c884] via-[#8ebd77] to-transparent pointer-events-none opacity-90" />

      {/* NHÀ CHÒI ĐÌNH LÀNG MÁI NGÓI ĐỎ Ở TRUNG TÂM PHÍA SAU (Chuẩn 100% Ảnh) */}
      <div className="absolute top-3 sm:top-6 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex flex-col items-center filter drop-shadow-xl">
        {/* Mái ngói đỏ đình làng */}
        <div className="relative">
          <div className="w-64 sm:w-96 h-12 sm:h-14 bg-gradient-to-b from-[#c0392b] via-[#d32f2f] to-[#a92323] rounded-t-2xl border-b-4 border-[#7f1d1d] shadow-lg flex items-center justify-center overflow-hidden">
            {/* Vân ngói âm dương đất nung */}
            <div className="w-full h-full opacity-35 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,#fff_10px,#fff_12px)]" />
          </div>
          {/* Đầu đao mái ngói cong vút 2 bên */}
          <div className="absolute -left-4 top-0 w-8 h-8 border-t-5 border-l-5 border-[#b91c1c] rounded-tl-full transform -rotate-15" />
          <div className="absolute -right-4 top-0 w-8 h-8 border-t-5 border-r-5 border-[#b91c1c] rounded-tr-full transform rotate-15" />
        </div>

        {/* 6 Cột gỗ nâu & Sàn gỗ chòi đình */}
        <div className="relative w-56 sm:w-84 h-11 sm:h-13 bg-[#3f2212]/35 flex justify-between items-end px-4 border-b-2 border-[#543018]">
          <div className="w-4 h-11 bg-[#5c351b] rounded-t-xs border-r border-[#3a200f]" />
          <div className="w-4 h-11 bg-[#5c351b] rounded-t-xs border-r border-[#3a200f]" />
          <div className="w-4 h-11 bg-[#5c351b] rounded-t-xs border-r border-[#3a200f]" />
          <div className="w-4 h-11 bg-[#5c351b] rounded-t-xs border-r border-[#3a200f]" />
          <div className="w-4 h-11 bg-[#5c351b] rounded-t-xs border-r border-[#3a200f]" />
          <div className="w-4 h-11 bg-[#5c351b] rounded-t-xs border-r border-[#3a200f]" />
        </div>
      </div>

      {/* DÂY CỜ HỘI TAM GIÁC NGŨ SẮC GIĂNG NGANG PHÍA TRÊN (Chuẩn 100% Ảnh) */}
      <div className="absolute top-12 sm:top-16 inset-x-4 sm:inset-x-16 pointer-events-none z-15 flex justify-between items-center opacity-95">
        {['#2563eb', '#eab308', '#dc2626', '#facc15', '#16a34a', '#ea580c', '#eab308', '#2563eb', '#dc2626', '#16a34a'].map((c, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className="w-0 h-0 border-x-[11px] sm:border-x-[15px] border-x-transparent border-t-[22px] sm:border-t-[30px] filter drop-shadow-xs"
              style={{ borderTopColor: c }}
            />
          </div>
        ))}
      </div>

      {/* GÓC TRÁI: Bù nhìn rơm đội nón lá & Các kiện rơm vuông + đụn rơm (Chuẩn 100% Ảnh) */}
      <div className="absolute top-14 left-2 sm:left-8 pointer-events-none z-10 hidden sm:flex flex-col items-center">
        {/* Nón lá của bù nhìn */}
        <div className="w-0 h-0 border-x-[20px] border-x-transparent border-b-[15px] border-b-[#dfbe84] filter drop-shadow-xs" />
        {/* Khuôn mặt rơm & Cột gỗ áo rơm hồng nâu */}
        <div className="w-8 h-8 rounded-full bg-[#fcd34d] border border-amber-600 flex items-center justify-center text-xs -mt-1">
          🌾
        </div>
        <div className="w-12 h-12 bg-[#b45309]/80 rounded-t-md -mt-1 border border-amber-800" />
        {/* Các kiện rơm rạ vuông xếp chồng */}
        <div className="flex items-end -space-x-1 mt-1">
          <div className="w-16 h-11 bg-gradient-to-b from-[#fcd34d] to-[#d97706] rounded-md border border-amber-700 shadow-md flex items-center justify-center text-[9px] font-black text-amber-950">
            RƠM
          </div>
          <div className="w-14 h-14 bg-gradient-to-b from-[#fcd34d] to-[#b45309] rounded-t-full border border-amber-800 shadow-md" />
        </div>
      </div>

      {/* GÓC PHẢI: Chum vại sành đất nung & Đụn rơm vàng (Chuẩn 100% Ảnh) */}
      <div className="absolute top-18 right-2 sm:right-10 pointer-events-none z-10 hidden sm:flex items-end space-x-2">
        {/* Đụn rơm vàng */}
        <div className="w-18 h-16 bg-gradient-to-b from-[#fcd34d] to-[#b45309] rounded-t-full border border-amber-800 shadow-lg" />
        {/* Chum vại sành đất nung nâu đỏ cổ truyền */}
        <div className="flex flex-col items-center">
          <div className="w-6 h-2 bg-[#451a03] rounded-full shadow-xs" />
          <div className="w-13 h-14 bg-gradient-to-r from-[#78350f] via-[#9a3412] to-[#78350f] rounded-full border-2 border-[#451a03] shadow-xl flex items-center justify-center -mt-1">
            <div className="w-8 h-8 rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      {/* Bụi chuối xanh mướt góc tiền cảnh phía trước (Chuẩn ảnh concept) */}
      <div className="absolute -bottom-6 -left-6 pointer-events-none z-45 text-5xl sm:text-7xl opacity-95 select-none">
        🌿🌾
      </div>
      <div className="absolute -bottom-6 -right-6 pointer-events-none z-45 text-5xl sm:text-7xl opacity-95 select-none">
        🌾🌿
      </div>

      {/* ============================================================== */}
      {/* 2. SÂN ĐẤT NÉN PHỐI CẢNH 2.5D & HÀNG RÀO TRE (CHUẨN 100% ẢNH CONCEPT) */}
      {/* ============================================================== */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
      >
        <defs>
          {/* Màu đất cát mịn màng ấm áp nén chặt (Chuẩn 100% Ảnh) */}
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

        {/* 1. Mặt sân đất nén hình elip phối cảnh 2.5D */}
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

        {/* 2. Vệt cát nhẵn chạy ven vòng tròn */}
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

        {/* 3. HÀNG RÀO 2 TẦNG NAN GỖ/TRE NẰM NGANG BAO QUANH (Chuẩn 100% Ảnh) */}
        {/* Tầng thanh gỗ trên */}
        <ellipse
          cx={arenaCenter.x}
          cy={arenaCenter.y - 16}
          rx={arenaRadiusX}
          ry={arenaRadiusY}
          fill="none"
          stroke="#c99f5d"
          strokeWidth="6.5"
          opacity="0.95"
        />
        {/* Tầng thanh gỗ dưới */}
        <ellipse
          cx={arenaCenter.x}
          cy={arenaCenter.y - 3}
          rx={arenaRadiusX}
          ry={arenaRadiusY}
          fill="none"
          stroke="#b08341"
          strokeWidth="6.5"
          opacity="0.95"
        />

        {/* 4. CÁC CỘT GỖ TRÒN & DÂY THỪNG QUẤN (Chuẩn 100% Ảnh) */}
        {fencePosts.map((post, idx) => (
          <g key={idx}>
            {/* Thân cọc gỗ tròn dựng đứng */}
            <rect
              x={post.x - 5}
              y={post.y - 32}
              width="10"
              height="32"
              rx="3"
              fill="#5a341a"
              stroke="#3a200e"
              strokeWidth="1.5"
            />
            {/* Đỉnh cọc gỗ tròn */}
            <ellipse cx={post.x} cy={post.y - 32} rx="5" ry="2" fill="#784725" />
            {/* Dây thừng bện gai quấn quanh các thanh gỗ */}
            <ellipse cx={post.x} cy={post.y - 16} rx="6" ry="2.5" fill="#dfbe84" />
            <ellipse cx={post.x} cy={post.y - 3} rx="6" ry="2.5" fill="#dfbe84" />
          </g>
        ))}

        {/* 5. CỔNG RÀO GỖ MỞ PHÍA TRƯỚC (Chuẩn 100% Ảnh Tham Chiếu) */}
        <g>
          {/* Cánh cổng gỗ có nan dọc ở đáy vòng tròn */}
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
          <line
            x1={arenaCenter.x - 17}
            y1={arenaCenter.y + arenaRadiusY - 28}
            x2={arenaCenter.x - 17}
            y2={arenaCenter.y + arenaRadiusY}
            stroke="#45240c"
            strokeWidth="1.5"
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
          <line
            x1={arenaCenter.x + 17}
            y1={arenaCenter.y + arenaRadiusY - 28}
            x2={arenaCenter.x + 17}
            y2={arenaCenter.y + arenaRadiusY}
            stroke="#45240c"
            strokeWidth="1.5"
          />
        </g>
      </svg>

      {/* ============================================================== */}
      {/* 3. 9 CHÚ VỊT HỌC SINH CHẠY VÒNG QUANH SÂN (CHUẨN 100% ẢNH CONCEPT) */}
      {/* ============================================================== */}
      {duckSprites.map(sprite => (
        <DuckSprite
          key={sprite.duck.id}
          duck={sprite.duck}
          x={sprite.x}
          y={sprite.y}
          vx={sprite.vx}
          speechQuote={sprite.speechQuote}
          isQuacking={sprite.isQuacking || quackingDuckId === sprite.duck.id}
          isCaught={sprite.isCaught}
          isTarget={targetDuckId === sprite.duck.id}
          isBlurMode={difficulty === 'easy'}
          allNames={allStudentNames}
        />
      ))}

      {/* ============================================================== */}
      {/* 4. CẬU BÉ BỊT MẮT NÓN LÁ ÁO BÀ BA CHẠY ĐUỔI VỊT (CHUẨN ẢNH CONCEPT) */}
      {/* ============================================================== */}
      <DuckPlayerSprite
        x={player.x}
        y={player.y}
        direction={player.direction}
        isWalking={player.isWalking}
        isCatching={player.isCatching}
      />

      {/* ============================================================== */}
      {/* 5. NÚT BẮT VỊT TO NỔI BẬT KHI ĐẾN GẦN CHÚ VỊT */}
      {/* ============================================================== */}
      {nearestDuck && nearestDuck.distance <= 95 && !hasCaughtRef.current && (
        <div
          className="absolute z-50 pointer-events-auto transform -translate-x-1/2"
          style={{ left: `${player.x}px`, top: `${player.y + 50}px` }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerCatch();
            }}
            className="flex items-center space-x-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white font-black text-xs sm:text-sm shadow-2xl shadow-red-500/80 animate-bounce active:scale-95 border-2 border-yellow-300"
          >
            <span className="text-lg">✋</span>
            <span>BẮT VỊT NGAY!</span>
          </button>
        </div>
      )}
    </div>
  );
};
