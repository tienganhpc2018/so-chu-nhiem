import React, { useState, useEffect, useRef } from 'react';
import { DuckPlayerSprite } from './DuckPlayerSprite';
import { DuckSprite } from './DuckSprite';
import { DUCK_SPEECH_QUOTES } from '../data/defaultDuckData';
import { duckAudio } from '../services/duckAudio';

/**
 * Giao diện và Vật lý sân chơi BỊT MẮT BẮT VỊT chuẩn 100% theo Ảnh 2:
 * - Góc nhìn 2.5D phối cảnh sân đất tròn nén chặt
 * - Hàng rào tre 2 tầng uốn cong bao quanh, cột gỗ buộc thừng, cổng rào phía trước
 * - Chòi đình mái ngói đỏ, dây cờ ngũ sắc phấp phới, kiện rơm, chum vại, bụi chuối
 * - Người bịt mắt CHẠY LIÊN TỤC rà soát quanh vòng tròn, không đứng yên một chỗ!
 * - Đàn vịt trắng chạy tán loạn ven hàng rào, né tránh và trêu đùa người chơi
 */
export const DuckArena = ({
  ducks = [],
  mode = 'free', // 'free' | 'quiz' | 'target' | 'time_trial'
  difficulty = 'easy', // 'easy' | 'blindfold'
  targetDuckId = null,
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

  // Người chơi bịt mắt: Bắt đầu ở giữa và chạy linh hoạt quanh sân
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
  const keysPressed = useRef({});
  const animFrameRef = useRef(null);
  const patrolAngleRef = useRef(0);
  const userInteractedRef = useRef(false);

  // Cập nhật kích thước khung nhìn responsive
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

  // Khởi tạo vị trí đàn vịt trắng phân bố đều ven hàng rào tre (Ảnh 2)
  useEffect(() => {
    if (!ducks || ducks.length === 0) return;

    const initialSprites = ducks.map((d, idx) => {
      // Phân bố vòng cung ven hàng rào tre giống hệt Ảnh 2
      const angle = (idx / ducks.length) * Math.PI * 2 + (Math.random() * 0.3 - 0.15);
      const distRatio = 0.68 + (idx % 3) * 0.08; // Ven hàng rào tre
      const x = arenaCenter.x + Math.cos(angle) * (arenaRadiusX * distRatio);
      const y = arenaCenter.y + Math.sin(angle) * (arenaRadiusY * distRatio);

      // Tốc độ chạy vòng quanh sân theo chiều kim đồng hồ
      const tangentAngle = angle + Math.PI / 2;
      const baseSpeed = 45 * (d.speed || 1);

      return {
        duck: d,
        x,
        y,
        angle,
        speed: baseSpeed,
        vx: Math.cos(tangentAngle) * baseSpeed,
        vy: Math.sin(tangentAngle) * (baseSpeed * 0.6),
        speechQuote: idx === 1 ? 'Thầy ơi em đây này!' : idx === 3 ? 'Hụt rồi!' : idx === 5 ? 'Em chưa học bài đâu!' : null,
        isCaught: false,
        isScared: false
      };
    });

    setDuckSprites(initialSprites);
    setPlayer({
      x: arenaCenter.x - 30,
      y: arenaCenter.y,
      direction: 'right',
      isWalking: true,
      isCatching: false
    });
    patrolAngleRef.current = 0;
  }, [ducks, dimensions.width, dimensions.height]);

  // Lắng nghe bàn phím Desktop W/A/S/D, Mũi tên & Phím Cách
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPaused) return;
      keysPressed.current[e.key.toLowerCase()] = true;
      keysPressed.current[e.code] = true;
      userInteractedRef.current = true;

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
    };
  }, [nearestDuck, isPaused]);

  // Nhấp chuột / Chạm vào sân để người chơi chạy lao tới điểm đó
  const handleArenaClick = (e) => {
    if (isPaused) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Tính hướng lao tới
    const dx = clickX - player.x;
    const dy = clickY - player.y;
    const angle = Math.atan2(dy, dx);
    const dashDistance = Math.min(80, Math.hypot(dx, dy));

    userInteractedRef.current = true;
    let newPx = player.x + Math.cos(angle) * dashDistance;
    let newPy = player.y + Math.sin(angle) * dashDistance;

    // Giữ trong sân elip
    const normX = (newPx - arenaCenter.x) / (arenaRadiusX - 25);
    const normY = (newPy - arenaCenter.y) / (arenaRadiusY - 20);
    if (normX * normX + normY * normY > 1) {
      const edgeAngle = Math.atan2(normY, normX);
      newPx = arenaCenter.x + Math.cos(edgeAngle) * (arenaRadiusX - 25);
      newPy = arenaCenter.y + Math.sin(edgeAngle) * (arenaRadiusY - 20);
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
  const triggerCatch = () => {
    setPlayer(p => ({ ...p, isCatching: true }));
    setTimeout(() => setPlayer(p => ({ ...p, isCatching: false })), 300);

    if (nearestDuck && nearestDuck.distance <= 75) {
      // Bắt thành công chú vịt!
      duckAudio.playCatchSuccess();
      setDuckSprites(prev =>
        prev.map(ds => (ds.duck.id === nearestDuck.sprite.duck.id ? { ...ds, isCaught: true } : ds))
      );
      onCatchDuck?.(nearestDuck.sprite.duck);
    } else {
      // Bắt hụt!
      duckAudio.playMiss();
      onMissCatch?.();
    }
  };

  // VÒNG LẶP VẬT LÝ VÀ CHUYỂN ĐỘNG LIÊN TỤC QUANH VÒNG TRÒN (60fps)
  useEffect(() => {
    let lastTime = performance.now();
    let soundTimer = 0;

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (!isPaused) {
        // 1. NGƯỜI CHƠI BỊT MẮT DI CHUYỂN QUANH VÒNG TRÒN
        let dx = 0;
        let dy = 0;
        const keys = keysPressed.current;

        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;

        let px = player.x;
        let py = player.y;
        let newDir = player.direction;
        let isWalking = true;

        if (dx !== 0 || dy !== 0) {
          // Khi người dùng bấm phím: chạy theo điều khiển
          userInteractedRef.current = true;
          const moveSpeed = 190 * dt;
          px += dx * moveSpeed;
          py += dy * moveSpeed;
          newDir = dx < 0 ? 'left' : dx > 0 ? 'right' : player.direction;
        } else {
          // KHI KHÔNG BẤM PHÍM: TỰ ĐỘNG CHẠY TUẦN TRA RÀ SOÁT QUANH SÂN (Đúng yêu cầu Thầy!)
          // Người bịt mắt sải bước chạy quanh vòng tròn tìm vịt
          patrolAngleRef.current += 0.85 * dt;
          const patrolRadiusX = arenaRadiusX * 0.45;
          const patrolRadiusY = arenaRadiusY * 0.45;
          const targetPatrolX = arenaCenter.x + Math.cos(patrolAngleRef.current) * patrolRadiusX;
          const targetPatrolY = arenaCenter.y + Math.sin(patrolAngleRef.current) * patrolRadiusY;

          const toPatrolDx = targetPatrolX - px;
          const toPatrolDy = targetPatrolY - py;
          px += toPatrolDx * Math.min(2.8 * dt, 0.2);
          py += toPatrolDy * Math.min(2.8 * dt, 0.2);
          if (Math.abs(toPatrolDx) > 1) {
            newDir = toPatrolDx > 0 ? 'right' : 'left';
          }
        }

        // Giới hạn người chơi luôn ở trong sân đất elip
        const normX = (px - arenaCenter.x) / (arenaRadiusX - 25);
        const normY = (py - arenaCenter.y) / (arenaRadiusY - 20);
        if (normX * normX + normY * normY > 1) {
          const edgeAngle = Math.atan2(normY, normX);
          px = arenaCenter.x + Math.cos(edgeAngle) * (arenaRadiusX - 25);
          py = arenaCenter.y + Math.sin(edgeAngle) * (arenaRadiusY - 20);
        }

        setPlayer(prev => ({
          ...prev,
          x: px,
          y: py,
          direction: newDir,
          isWalking
        }));

        // 2. ĐÀN VỊT TRẮNG CHẠY QUANH HÀNG RÀO TRE & HOẢNG SỢ NÉ TRÁNH
        let closest = null;
        let minD = 9999;

        setDuckSprites(prev =>
          prev.map(sprite => {
            if (sprite.isCaught) return sprite;

            // Tính khoảng cách đến người chơi
            const distToPlayer = Math.hypot(sprite.x - px, sprite.y - py);
            if (distToPlayer < minD) {
              minD = distToPlayer;
              closest = { sprite, distance: distToPlayer };
            }

            let newAngle = sprite.angle;
            let currentSpeed = sprite.speed;
            let isScared = false;

            if (distToPlayer < 115) {
              // Khi người chơi lại gần: Vịt hoảng sợ, tăng tốc chạy trốn gấp đôi!
              isScared = true;
              currentSpeed = sprite.speed * 2.2;
              // Chạy tiếp theo vòng tròn đẩy xa người chơi
              newAngle += (currentSpeed / arenaRadiusX) * dt;
            } else {
              // Chạy tung tăng bình thường quanh vòng tròn hàng rào
              newAngle += (currentSpeed / arenaRadiusX) * dt;
            }

            // Tọa độ elip 2.5D ven hàng rào tre
            const duckDistRatio = 0.72 + Math.sin(newAngle * 3 + sprite.duck.name.length) * 0.1;
            const nx = arenaCenter.x + Math.cos(newAngle) * (arenaRadiusX * duckDistRatio);
            const ny = arenaCenter.y + Math.sin(newAngle) * (arenaRadiusY * duckDistRatio);

            // Hướng mặt theo chiều chạy
            const vx = nx - sprite.x;

            return {
              ...sprite,
              x: nx,
              y: ny,
              angle: newAngle,
              vx: vx || sprite.vx,
              isScared
            };
          })
        );

        setNearestDuck(closest);

        // 3. ÂM THANH ĐỊNH VỊ KHÔNG GIAN STEREO
        soundTimer += dt;
        if (soundTimer > 2.0) {
          soundTimer = 0;
          if (closest && closest.sprite) {
            const relX = (closest.sprite.x - px) / arenaRadiusX;
            duckAudio.playSpatialQuack(relX, closest.distance, arenaRadiusX);
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [arenaCenter.x, arenaCenter.y, arenaRadiusX, arenaRadiusY, isPaused]);

  // Luồng bong bóng lời thoại trêu đùa của đàn vịt học sinh (Ảnh 2)
  useEffect(() => {
    if (isPaused) return;
    const quotes = [
      'Thầy ơi em đây này!',
      'Hụt rồi!',
      'Em chưa học bài đâu!',
      'Bắt em đi!',
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
    }, 3000);

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

      {/* Dãy đồi xanh & cánh đồng phía xa */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#a4d793] to-transparent pointer-events-none opacity-80" />

      {/* NHÀ CHÒI ĐÌNH LÀNG MÁI NGÓI ĐỎ Ở TRUNG TÂM PHÍA SAU (Ảnh 2) */}
      <div className="absolute top-2 sm:top-5 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex flex-col items-center filter drop-shadow-lg">
        {/* Mái ngói đỏ đình làng */}
        <div className="relative">
          <div className="w-56 sm:w-80 h-10 sm:h-12 bg-gradient-to-b from-[#b91c1c] via-[#dc2626] to-[#991b1b] rounded-t-xl border-b-4 border-[#7f1d1d] shadow-md flex items-center justify-center">
            {/* Vân ngói âm dương */}
            <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,#fff_8px,#fff_10px)]" />
          </div>
          {/* Đầu đao mái cong vút hai bên */}
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
        {/* Nón lá của bù nhìn */}
        <div className="w-0 h-0 border-x-[18px] border-x-transparent border-b-[14px] border-b-[#d7ba89] -mb-1" />
        <div className="w-8 h-8 rounded-full bg-[#fcd34d] border border-amber-600 flex items-center justify-center text-xs">
          🌾
        </div>
        <div className="w-10 h-10 bg-amber-700/80 rounded-t-md -mt-1" />
        {/* Đụn rơm cuộn */}
        <div className="w-16 h-12 bg-amber-400 rounded-t-full border border-amber-600 shadow-sm flex items-center justify-center text-[10px] font-black text-amber-900 mt-1">
          Ụ RƠM
        </div>
      </div>

      {/* GÓC PHẢI: Chum vại sành & Đụn rơm rạ (Ảnh 2) */}
      <div className="absolute top-20 right-4 sm:right-12 pointer-events-none z-10 hidden sm:flex items-end space-x-2">
        <div className="w-16 h-14 bg-amber-400 rounded-t-full border border-amber-600 shadow-md flex items-center justify-center text-[10px] font-black text-amber-900">
          Ụ RƠM
        </div>
        {/* Chum vại sành nâu cổ truyền */}
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
          {/* Màu đất cát mịn màng ấm áp nén chặt (Ảnh 2) */}
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
        {/* Tầng tre trên */}
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
        {/* Tầng tre dưới */}
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
            {/* Cột gỗ dựng đứng */}
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
            {/* Dây thừng quấn quanh cột tre */}
            <ellipse cx={post.x} cy={post.y - 14} rx="5" ry="2" fill="#d7ba89" />
            <ellipse cx={post.x} cy={post.y - 2} rx="5" ry="2" fill="#d7ba89" />
          </g>
        ))}

        {/* 5. CỔNG RÀO TRE MỞ PHÍA TRƯỚC (Theo Ảnh 2) */}
        <g>
          {/* 2 Cánh cổng tre ở đáy vòng tròn */}
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
          isCaught={sprite.isCaught}
          isTarget={targetDuckId === sprite.duck.id}
          isBlurMode={difficulty === 'easy'}
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
      {nearestDuck && nearestDuck.distance <= 80 && (
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
            <span>BẮT ({nearestDuck.sprite.duck.name})!</span>
          </button>
        </div>
      )}
    </div>
  );
};
