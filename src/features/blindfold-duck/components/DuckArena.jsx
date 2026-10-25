import React, { useState, useEffect, useRef } from 'react';
import { DuckPlayerSprite } from './DuckPlayerSprite';
import { DuckSprite } from './DuckSprite';
import { DUCK_SPEECH_QUOTES } from '../data/defaultDuckData';
import { duckAudio } from '../services/duckAudio';

/**
 * Giao diện và Vật lý sân chơi BỊT MẮT BẮT VỊT chuẩn 100% theo Ảnh 2:
 * - Góc nhìn 2.5D phối cảnh sân đất tròn elip nén chặt
 * - Hàng rào tre 2 tầng uốn cong bao quanh, cột gỗ buộc thừng, cổng rào phía trước
 * - Chòi đình mái ngói đỏ, dây cờ ngũ sắc phấp phới, kiện rơm, chum vại, bụi chuối
 * - ĐÀN VỊT CHẠY LIÊN TỤC VÀ TẢN RA KHẮP SÂN, không bị dồn cục, né tránh người chơi
 * - NGƯỜI BỊT MẮT DI CHUYỂN THEO, lần theo tiếng kêu quác quác định vị không gian
 * - ĐỒNG HỒ ĐẾM NGƯỢC 20S / 30S: Hết giờ tự động tóm 1 vịt để học sinh lên trả bài!
 */
export const DuckArena = ({
  ducks = [],
  mode = 'quiz', // 'free' | 'quiz' | 'target' | 'time_trial'
  difficulty = 'easy', // 'easy' | 'blindfold'
  targetDuckId = null,
  timeLeft = 20,
  roundDuration = 20,
  onCatchDuck,
  onMissCatch,
  isPaused = false
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 960, height: 600 });

  // Tâm và bán kính sân đất phối cảnh 2.5D Elip (Ảnh 2)
  const arenaCenter = { x: dimensions.width / 2, y: dimensions.height / 2 + 45 };
  const arenaRadiusX = Math.min(dimensions.width * 0.44, 450);
  const arenaRadiusY = Math.min(dimensions.height * 0.35, 230);

  // Người chơi bịt mắt
  const [player, setPlayer] = useState({
    x: arenaCenter.x,
    y: arenaCenter.y,
    direction: 'right',
    isWalking: true,
    isCatching: false
  });

  // Đàn vịt trắng học sinh
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

  // Cập nhật kích thước responsive
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth || 960;
        const h = containerRef.current.clientHeight || 600;
        setDimensions({ width: w, height: h });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Khởi tạo vị trí đàn vịt trắng PHÂN BỐ TỰ NHIÊN KHẮP LÒNG SÂN (Không dồn ở mép!)
  useEffect(() => {
    if (!ducks || ducks.length === 0) return;

    hasCaughtRef.current = false;
    const initialSprites = ducks.map((d, idx) => {
      // Dùng tỉ lệ vàng để rải đều đàn vịt khắp bề mặt sân đất nén elip
      const phi = 1.618033988749895;
      const theta = idx * 2 * Math.PI * (phi - 1) + (Math.random() * 0.3);
      // Bán kính từ 20% đến 80% (không bao giờ bị kẹt ở rìa mép)
      const rRatio = 0.22 + 0.58 * Math.sqrt((idx + 0.5) / ducks.length);
      const x = arenaCenter.x + Math.cos(theta) * (arenaRadiusX * rRatio);
      const y = arenaCenter.y + Math.sin(theta) * (arenaRadiusY * rRatio);

      const moveAngle = Math.random() * Math.PI * 2;
      const baseSpeed = 48 + (idx % 4) * 8;

      return {
        duck: d,
        x,
        y,
        vx: Math.cos(moveAngle) * baseSpeed,
        vy: Math.sin(moveAngle) * (baseSpeed * 0.65),
        speed: baseSpeed,
        speechQuote: null,
        isQuacking: false,
        isCaught: false,
        isScared: false
      };
    });

    spritesRef.current = initialSprites;
    setDuckSprites(initialSprites);
    setPlayer({
      x: arenaCenter.x - 25,
      y: arenaCenter.y,
      direction: 'right',
      isWalking: true,
      isCatching: false
    });
    patrolAngleRef.current = 0;
  }, [ducks, dimensions.width, dimensions.height]);

  // Danh sách họ tên đầy đủ để tự động phát hiện và xử lý trùng tên
  const allStudentNames = ducks.map(d => d.name || '');

  // Lắng nghe bàn phím W/A/S/D, Mũi tên & Phím Cách
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

      // Phím cách: BẮT VỊT
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
    const dashDistance = Math.min(100, Math.hypot(dx, dy));

    userInteractedRef.current = true;
    if (userControlTimeoutRef.current) clearTimeout(userControlTimeoutRef.current);
    userControlTimeoutRef.current = setTimeout(() => {
      userInteractedRef.current = false;
    }, 2500);

    let newPx = player.x + Math.cos(angle) * dashDistance;
    let newPy = player.y + Math.sin(angle) * dashDistance;

    // Giữ trong sân elip
    const normX = (newPx - arenaCenter.x) / (arenaRadiusX - 30);
    const normY = (newPy - arenaCenter.y) / (arenaRadiusY - 22);
    if (normX * normX + normY * normY > 1) {
      const edgeAngle = Math.atan2(normY, normX);
      newPx = arenaCenter.x + Math.cos(edgeAngle) * (arenaRadiusX - 30);
      newPy = arenaCenter.y + Math.sin(edgeAngle) * (arenaRadiusY - 22);
    }

    setPlayer(p => ({
      ...p,
      x: newPx,
      y: newPy,
      direction: dx >= 0 ? 'right' : 'left',
      isWalking: true
    }));
  };

  // Hành động BẮT VỊT (Chộp 2 tay về phía trước)
  const triggerCatch = (forcedDuck = null) => {
    if (hasCaughtRef.current) return;

    setPlayer(p => ({ ...p, isCatching: true }));
    setTimeout(() => setPlayer(p => ({ ...p, isCatching: false })), 400);

    const targetToCatch = forcedDuck || (nearestDuck && nearestDuck.distance <= 85 ? nearestDuck.sprite.duck : null);

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

  // KHI HẾT GIỜ (20S HOẶC 30S): TỰ ĐỘNG BẮT 1 CHÚ VỊT ĐỂ HỌC SINH ĐÓ TRẢ BÀI
  useEffect(() => {
    if (timeLeft === 0 && !hasCaughtRef.current && !isPaused) {
      // Tìm chú vịt gần người chơi nhất hoặc 1 chú vịt bất kỳ chưa bị bắt
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

        // Lao tới bắt chú vịt đó!
        triggerCatch(bestTarget);
      }
    }
  }, [timeLeft, isPaused]);

  // VÒNG LẶP VẬT LÝ FLOCKING VÀ ÂM THANH 3D ĐỊNH VỊ (60fps)
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
          // Điều khiển trực tiếp bởi người dùng
          userInteractedRef.current = true;
          const moveSpeed = 195 * dt;
          px += dx * moveSpeed;
          py += dy * moveSpeed;
          newDir = dx < 0 ? 'left' : dx > 0 ? 'right' : player.direction;
        } else if (!userInteractedRef.current) {
          // TỰ ĐỘNG DI CHUYỂN THEO TIẾNG VỊT & RƯỢT ĐUỔI VỊT (Tự động lùng sục)
          let targetX = arenaCenter.x;
          let targetY = arenaCenter.y;

          // Ưu tiên chạy về phía con vịt đang cất tiếng kêu quác quác hoặc con vịt gần nhất
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

          // Lảo đảo quơ tay kiểu người bịt mắt (sinusoidal wobble)
          patrolAngleRef.current += 3.2 * dt;
          const wobbleX = Math.sin(patrolAngleRef.current) * 22;
          const wobbleY = Math.cos(patrolAngleRef.current) * 16;

          const chaseSpeed = 120 * dt;
          px += (toTargetX / distToTarget) * chaseSpeed + wobbleX * dt;
          py += (toTargetY / distToTarget) * (chaseSpeed * 0.7) + wobbleY * dt;

          if (Math.abs(toTargetX) > 2) {
            newDir = toTargetX > 0 ? 'right' : 'left';
          }
        }

        // Giới hạn người chơi luôn ở trong sân elip
        const normPx = (px - arenaCenter.x) / (arenaRadiusX - 30);
        const normPy = (py - arenaCenter.y) / (arenaRadiusY - 22);
        if (normPx * normPx + normPy * normPy > 1) {
          const edgeAngle = Math.atan2(normPy, normPx);
          px = arenaCenter.x + Math.cos(edgeAngle) * (arenaRadiusX - 30);
          py = arenaCenter.y + Math.sin(edgeAngle) * (arenaRadiusY - 22);
        }

        setPlayer(prev => ({
          ...prev,
          x: px,
          y: py,
          direction: newDir,
          isWalking
        }));

        // 2. ĐÀN VỊT DI CHUYỂN LIÊN TỤC VÀ TẢN RA ĐỂ TRÁNH BỊ BẮT
        const currentList = spritesRef.current;
        let closest = null;
        let minD = 999999;

        const updatedSprites = currentList.map((d1, i) => {
          if (d1.isCaught) return d1;

          // Tính khoảng cách đến người chơi bịt mắt
          const distToPlayer = Math.hypot(d1.x - px, d1.y - py);
          if (distToPlayer < minD) {
            minD = distToPlayer;
            closest = { sprite: d1, distance: distToPlayer };
          }

          let fx = 0;
          let fy = 0;

          // A. Lực đẩy lẫn nhau (Flocking Repulsion): Ngăn các vịt đè lên nhau, giữ khoảng cách
          for (let j = 0; j < currentList.length; j++) {
            if (i === j) continue;
            const d2 = currentList[j];
            if (d2.isCaught) continue;

            const diffX = d1.x - d2.x;
            const diffY = d1.y - d2.y;
            const distSq = diffX * diffX + diffY * diffY;
            if (distSq < 2304 && distSq > 0.01) { // Bán kính 48px
              const dist = Math.sqrt(distSq);
              const pushForce = (48 - dist) / 48;
              fx += (diffX / dist) * pushForce * 75;
              fy += (diffY / dist) * pushForce * 55;
            }
          }

          // B. Lực né tránh người bịt mắt (Fleeing behavior)
          let isScared = false;
          if (distToPlayer < 135) {
            isScared = true;
            const fleeForce = (135 - distToPlayer) / 135;
            const awayX = d1.x - px;
            const awayY = d1.y - py;
            const awayDist = Math.hypot(awayX, awayY) || 1;
            fx += (awayX / awayDist) * fleeForce * 185;
            fy += (awayY / awayDist) * fleeForce * 145;
          }

          // C. Lực lượn lội tung tăng ngẫu nhiên
          fx += (Math.random() - 0.5) * 25;
          fy += (Math.random() - 0.5) * 18;

          // Cập nhật vận tốc
          let newVx = d1.vx + fx * dt;
          let newVy = d1.vy + fy * dt;

          const maxSpeed = isScared ? d1.speed * 2.2 : d1.speed;
          const currentSpd = Math.hypot(newVx, newVy);
          if (currentSpd > maxSpeed) {
            newVx = (newVx / currentSpd) * maxSpeed;
            newVy = (newVy / currentSpd) * maxSpeed;
          }

          let newX = d1.x + newVx * dt;
          let newY = d1.y + newVy * dt;

          // D. Giới hạn trong sân đất elip & uốn lượn khi chạm hàng rào tre
          const normX = (newX - arenaCenter.x) / (arenaRadiusX - 35);
          const normY = (newY - arenaCenter.y) / (arenaRadiusY - 25);
          const distNorm = normX * normX + normY * normY;

          if (distNorm > 0.85) {
            // Uốn cong hướng chạy quay ngược vào trong sân
            const toCenterX = arenaCenter.x - newX;
            const toCenterY = arenaCenter.y - newY;
            const cDist = Math.hypot(toCenterX, toCenterY) || 1;
            newVx += (toCenterX / cDist) * 180 * dt;
            newVy += (toCenterY / cDist) * 130 * dt;

            if (distNorm >= 1.0) {
              const edgeAngle = Math.atan2(normY, normX);
              newX = arenaCenter.x + Math.cos(edgeAngle) * (arenaRadiusX - 35);
              newY = arenaCenter.y + Math.sin(edgeAngle) * (arenaRadiusY - 25);
              newVx = -newVx * 0.4;
              newVy = -newVy * 0.4;
            }
          }

          return {
            ...d1,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            isScared,
            isQuacking: d1.duck.id === quackingDuckIdRef.current
          };
        });

        spritesRef.current = updatedSprites;
        setDuckSprites(updatedSprites);
        setNearestDuck(closest);

        // 3. ÂM THANH ĐỊNH VỊ KHÔNG GIAN STEREO (Vịt quác quác định kỳ)
        quackTimerRef.current += dt;
        if (quackTimerRef.current > 1.3) {
          quackTimerRef.current = 0;
          const active = updatedSprites.filter(s => !s.isCaught);
          if (active.length > 0) {
            // Chọn con vịt đang sợ hãi hoặc ngẫu nhiên
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

  // Bong bóng lời thoại trêu đùa xuất hiện ngẫu nhiên
  useEffect(() => {
    if (isPaused) return;
    const quotes = [
      'Thầy ơi em đây này! 🦆',
      'Hụt rồi thầy ơi!',
      'Em chưa học bài đâu tha cho em! 🙏',
      'Bắt em đi nếu thầy bắt được!',
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
          return s.speechQuote ? { ...s, speechQuote: null } : s;
        });
      });
    }, 2800);

    return () => clearInterval(quoteTimer);
  }, [isPaused]);

  // 24 Cột gỗ của hàng rào tre uốn quanh sân elip
  const fencePosts = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i / 24) * Math.PI * 2;
    const x = arenaCenter.x + Math.cos(angle) * arenaRadiusX;
    const y = arenaCenter.y + Math.sin(angle) * arenaRadiusY;
    const isFront = y > arenaCenter.y + 40;
    return { x, y, angle, isFront };
  });

  return (
    <div
      ref={containerRef}
      onClick={handleArenaClick}
      className="relative w-full h-full overflow-hidden select-none bg-gradient-to-b from-[#8ec47d] via-[#7ab868] to-[#5a9c4a] flex items-center justify-center cursor-crosshair"
    >
      {/* ============================================================== */}
      {/* 1. KHÔNG GIAN PHONG CẢNH LÀNG QUÊ VIỆT NAM (CHUẨN 100% ẢNH 2) */}
      {/* ============================================================== */}

      {/* Dãy đồi xanh phía xa */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#a4d793] to-transparent pointer-events-none opacity-80" />

      {/* NHÀ CHÒI ĐÌNH LÀNG MÁI NGÓI ĐỎ Ở TRUNG TÂM PHÍA SAU (Ảnh 2) */}
      <div className="absolute top-2 sm:top-5 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex flex-col items-center filter drop-shadow-lg">
        {/* Mái ngói đỏ đình làng */}
        <div className="relative">
          <div className="w-56 sm:w-80 h-10 sm:h-12 bg-gradient-to-b from-[#b91c1c] via-[#dc2626] to-[#991b1b] rounded-t-xl border-b-4 border-[#7f1d1d] shadow-md flex items-center justify-center">
            <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,#fff_8px,#fff_10px)]" />
          </div>
          <div className="absolute -left-3 top-0 w-6 h-6 border-t-4 border-l-4 border-[#b91c1c] rounded-tl-full transform -rotate-12" />
          <div className="absolute -right-3 top-0 w-6 h-6 border-t-4 border-r-4 border-[#b91c1c] rounded-tr-full transform rotate-12" />
        </div>

        {/* 4 Cột gỗ nâu đỡ mái đình */}
        <div className="w-48 sm:w-72 h-10 sm:h-12 bg-[#3f2212]/30 flex justify-between items-end px-3">
          <div className="w-3.5 h-10 bg-[#543018] rounded-xs border-r border-[#3a200f]" />
          <div className="w-3.5 h-10 bg-[#543018] rounded-xs border-r border-[#3a200f]" />
          <div className="w-3.5 h-10 bg-[#543018] rounded-xs border-r border-[#3a200f]" />
          <div className="w-3.5 h-10 bg-[#543018] rounded-xs border-r border-[#3a200f]" />
        </div>
      </div>

      {/* DÂY CỜ HỘI TAM GIÁC NGŨ SẮC BAY PHẤP PHỚI (Ảnh 2) */}
      <div className="absolute top-12 sm:top-16 inset-x-8 sm:inset-x-20 pointer-events-none z-15 flex justify-between items-center opacity-95">
        {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#f97316', '#8b5cf6', '#eab308'].map((c, i) => (
          <div key={i} className="flex flex-col items-center animate-bounce-subtle" style={{ animationDelay: `${i * 120}ms` }}>
            <div className="w-0 h-0 border-x-[11px] sm:border-x-[14px] border-x-transparent border-t-[20px] sm:border-t-[26px] filter drop-shadow-xs" style={{ borderTopColor: c }} />
          </div>
        ))}
      </div>

      {/* GÓC TRÁI: Bù nhìn rơm đội nón lá & Kiện rơm vàng (Ảnh 2) */}
      <div className="absolute top-16 left-3 sm:left-10 pointer-events-none z-10 hidden sm:flex flex-col items-center">
        <div className="w-0 h-0 border-x-[18px] border-x-transparent border-b-[14px] border-b-[#d7ba89] -mb-1" />
        <div className="w-8 h-8 rounded-full bg-[#fcd34d] border border-amber-600 flex items-center justify-center text-xs">
          🌾
        </div>
        <div className="w-10 h-10 bg-amber-700/80 rounded-t-md -mt-1" />
        <div className="w-16 h-12 bg-amber-400 rounded-t-full border border-amber-600 shadow-sm flex items-center justify-center text-[10px] font-black text-amber-900 mt-1">
          Ụ RƠM
        </div>
      </div>

      {/* GÓC PHẢI: Chum vại sành & Đụn rơm rạ (Ảnh 2) */}
      <div className="absolute top-20 right-4 sm:right-12 pointer-events-none z-10 hidden sm:flex items-end space-x-2">
        <div className="w-16 h-14 bg-amber-400 rounded-t-full border border-amber-600 shadow-md flex items-center justify-center text-[10px] font-black text-amber-900">
          Ụ RƠM
        </div>
        <div className="w-10 h-12 bg-[#8c4826] rounded-full border-2 border-[#5c2d15] shadow-md flex items-center justify-center">
          <div className="w-5 h-2 bg-[#5c2d15] rounded-full -mt-7" />
        </div>
      </div>

      {/* Bụi chuối xanh mướt góc tiền cảnh phía trước */}
      <div className="absolute -bottom-4 -left-6 pointer-events-none z-45 text-4xl sm:text-6xl opacity-90 select-none">
        🌿🌾
      </div>
      <div className="absolute -bottom-4 -right-6 pointer-events-none z-45 text-4xl sm:text-6xl opacity-90 select-none">
        🌾🌿
      </div>

      {/* ============================================================== */}
      {/* 2. SÂN ĐẤT NÉN PHỐI CẢNH 2.5D & HÀNG RÀO TRE (CHUẨN 100% ẢNH 2) */}
      {/* ============================================================== */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
      >
        <defs>
          <radialGradient id="arenaSandGrad" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#e8cfa8" />
            <stop offset="65%" stopColor="#d8b98b" />
            <stop offset="90%" stopColor="#c59f6d" />
            <stop offset="100%" stopColor="#9a7342" />
          </radialGradient>
          <filter id="arenaShadow">
            <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#1e3816" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* 1. Mặt sân đất nén hình elip phối cảnh 2.5D */}
        <ellipse
          cx={arenaCenter.x}
          cy={arenaCenter.y}
          rx={arenaRadiusX}
          ry={arenaRadiusY}
          fill="url(#arenaSandGrad)"
          stroke="#b88f57"
          strokeWidth="6"
          filter="url(#arenaShadow)"
        />

        {/* 2. Đường chạy cát nhẵn ven hàng rào */}
        <ellipse
          cx={arenaCenter.x}
          cy={arenaCenter.y}
          rx={arenaRadiusX * 0.88}
          ry={arenaRadiusY * 0.88}
          fill="none"
          stroke="#eed8b7"
          strokeWidth="3"
          strokeDasharray="16 8"
          opacity="0.65"
        />

        {/* 3. HÀNG RÀO TRE 2 TẦNG NẰM NGANG BAO QUANH (Ảnh 2) */}
        <ellipse
          cx={arenaCenter.x}
          cy={arenaCenter.y - 14}
          rx={arenaRadiusX}
          ry={arenaRadiusY}
          fill="none"
          stroke="#caa466"
          strokeWidth="5"
          opacity="0.95"
        />
        <ellipse
          cx={arenaCenter.x}
          cy={arenaCenter.y - 2}
          rx={arenaRadiusX}
          ry={arenaRadiusY}
          fill="none"
          stroke="#b38947"
          strokeWidth="5"
          opacity="0.95"
        />

        {/* 4. CÁC CỘT GỖ TRÒN & DÂY THỪNG BUỘC (Ảnh 2) */}
        {fencePosts.map((post, idx) => (
          <g key={idx}>
            <rect
              x={post.x - 4}
              y={post.y - 28}
              width="8"
              height="28"
              rx="2"
              fill="#5c381f"
              stroke="#3b200e"
              strokeWidth="1.5"
            />
            <ellipse cx={post.x} cy={post.y - 14} rx="5" ry="2" fill="#d7ba89" />
            <ellipse cx={post.x} cy={post.y - 2} rx="5" ry="2" fill="#d7ba89" />
          </g>
        ))}

        {/* 5. CỔNG RÀO TRE MỞ PHÍA TRƯỚC (Theo Ảnh 2) */}
        <g>
          <rect
            x={arenaCenter.x - 28}
            y={arenaCenter.y + arenaRadiusY - 26}
            width="24"
            height="26"
            rx="2"
            fill="#8c582e"
            stroke="#4a2912"
            strokeWidth="2"
          />
          <rect
            x={arenaCenter.x + 4}
            y={arenaCenter.y + arenaRadiusY - 26}
            width="24"
            height="26"
            rx="2"
            fill="#8c582e"
            stroke="#4a2912"
            strokeWidth="2"
          />
        </g>

        {/* Vòng bắt vịt phát sáng dưới chân người chơi */}
        <ellipse
          cx={player.x}
          cy={player.y}
          rx="68"
          ry="38"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          opacity="0.75"
          className="animate-pulse"
        />
      </svg>

      {/* ============================================================== */}
      {/* 3. ĐÀN VỊT TRẮNG HỌC SINH CHẠY TUNG TĂNG (CHUẨN ẢNH 2) */}
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
      {/* 4. NGƯỜI CHƠI BỊT MẮT NÓN LÁ ÁO BÀ BA CHẠY ĐUỔI VỊT (ẢNH 2) */}
      {/* ============================================================== */}
      <DuckPlayerSprite
        x={player.x}
        y={player.y}
        direction={player.direction}
        isWalking={player.isWalking}
        isCatching={player.isCatching}
      />

      {/* ============================================================== */}
      {/* 5. HIỆU ỨNG BỊT MẮT LỤA ĐỎ (BLINDFOLD OVERLAY KHI CHỌN KHÓ) */}
      {/* ============================================================== */}
      {difficulty === 'blindfold' && (
        <div
          className="absolute inset-0 pointer-events-none z-35"
          style={{
            background: `radial-gradient(circle at ${player.x}px ${player.y}px, transparent 45px, rgba(15, 23, 42, 0.75) 120px, rgba(15, 23, 42, 0.96) 240px)`
          }}
        >
          <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-red-950/90 to-transparent flex items-center justify-center">
            <span className="text-[11px] font-black text-red-300 tracking-widest uppercase">
              🙈 ĐANG BỊT MẮT LỤA ĐỎ — LẮNG NGHE TIẾNG VỊT TRÁI/PHẢI ĐỂ ĐUỔI THEO!
            </span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. NÚT BẮT VỊT TO NỔI BẬT KHI ĐẾN GẦN CHÚ VỊT */}
      {/* ============================================================== */}
      {nearestDuck && nearestDuck.distance <= 85 && !hasCaughtRef.current && (
        <div
          className="absolute z-50 pointer-events-auto transform -translate-x-1/2"
          style={{ left: `${player.x}px`, top: `${player.y + 45}px` }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerCatch();
            }}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white font-black text-xs sm:text-sm shadow-2xl shadow-red-500/80 animate-bounce active:scale-95 border-2 border-yellow-300"
          >
            <span className="text-lg">✋</span>
            <span>BẮT VỊT NGAY!</span>
          </button>
        </div>
      )}
    </div>
  );
};
