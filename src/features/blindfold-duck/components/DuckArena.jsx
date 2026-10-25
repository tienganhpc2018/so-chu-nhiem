import React, { useState, useEffect, useRef } from 'react';
import { DuckPlayerSprite } from './DuckPlayerSprite';
import { DuckSprite } from './DuckSprite';
import { DUCK_SPEECH_QUOTES } from '../data/defaultDuckData';
import { duckAudio } from '../services/duckAudio';

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
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Tâm sân và bán kính sân đất hình tròn
  const arenaCenter = { x: dimensions.width / 2, y: dimensions.height / 2 + 10 };
  const arenaRadius = Math.min(dimensions.width, dimensions.height) * 0.44;

  // Người chơi
  const [player, setPlayer] = useState({
    x: arenaCenter.x,
    y: arenaCenter.y,
    direction: 'down',
    isWalking: false,
    isCatching: false
  });

  // Đàn vịt học sinh
  const [duckSprites, setDuckSprites] = useState([]);
  const [nearestDuck, setNearestDuck] = useState(null);
  const keysPressed = useRef({});
  const animFrameRef = useRef(null);

  // Khởi tạo kích thước responsive
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth || 800;
        const h = containerRef.current.clientHeight || 600;
        setDimensions({ width: w, height: h });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Khởi tạo vị trí đàn vịt trong sân
  useEffect(() => {
    if (!ducks || ducks.length === 0) return;

    const initialSprites = ducks.map((d, idx) => {
      // Phân bố đều trong vòng tròn sân đất
      const angle = (idx / ducks.length) * Math.PI * 2 + (Math.random() * 0.5);
      const dist = (0.3 + Math.random() * 0.55) * arenaRadius;
      const x = arenaCenter.x + Math.cos(angle) * dist;
      const y = arenaCenter.y + Math.sin(angle) * dist;

      return {
        duck: d,
        x,
        y,
        vx: (Math.random() > 0.5 ? 1 : -1) * (1.1 + Math.random() * 0.8) * (d.speed || 1),
        vy: (Math.random() > 0.5 ? 1 : -1) * (1.1 + Math.random() * 0.8) * (d.speed || 1),
        speechQuote: null,
        isCaught: false,
        fleeing: false
      };
    });

    setDuckSprites(initialSprites);
    setPlayer({
      x: arenaCenter.x,
      y: arenaCenter.y,
      direction: 'down',
      isWalking: false,
      isCatching: false
    });
  }, [ducks, dimensions.width, dimensions.height]);

  // Lắng nghe bàn phím Desktop W/A/S/D và Mũi tên & Phím Cách Bắt Vịt
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPaused) return;
      keysPressed.current[e.key.toLowerCase()] = true;
      keysPressed.current[e.code] = true;

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

  // Hành động BẮT VỊT
  const triggerCatch = () => {
    setPlayer(p => ({ ...p, isCatching: true }));
    setTimeout(() => setPlayer(p => ({ ...p, isCatching: false })), 240);

    if (nearestDuck && nearestDuck.distance <= 65) {
      // Bắt thành công!
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

  // Vòng lặp vật lý & Di chuyển game (60fps)
  useEffect(() => {
    let lastTime = performance.now();
    let soundTimer = 0;

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (!isPaused) {
        // 1. DI CHUYỂN NGƯỜI CHƠI
        let dx = 0;
        let dy = 0;
        const keys = keysPressed.current;

        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;

        const isWalking = dx !== 0 || dy !== 0;
        let newDir = player.direction;
        if (dx < 0) newDir = 'left';
        else if (dx > 0) newDir = 'right';
        else if (dy < 0) newDir = 'up';
        else if (dy > 0) newDir = 'down';

        const moveSpeed = 160 * dt;
        let px = player.x + dx * moveSpeed;
        let py = player.y + dy * moveSpeed;

        // Giữ người chơi bên trong hàng rào tre hình tròn
        const distToCenter = Math.hypot(px - arenaCenter.x, py - arenaCenter.y);
        const maxPlayerDist = arenaRadius - 32;
        if (distToCenter > maxPlayerDist) {
          const angle = Math.atan2(py - arenaCenter.y, px - arenaCenter.x);
          px = arenaCenter.x + Math.cos(angle) * maxPlayerDist;
          py = arenaCenter.y + Math.sin(angle) * maxPlayerDist;
        }

        setPlayer(prev => ({
          ...prev,
          x: px,
          y: py,
          direction: newDir,
          isWalking
        }));

        // 2. DI CHUYỂN ĐÀN VỊT & TRÁNH NÉ NGƯỜI CHƠI
        let closest = null;
        let minD = 9999;

        setDuckSprites(prev =>
          prev.map(sprite => {
            if (sprite.isCaught) return sprite;

            let vx = sprite.vx;
            let vy = sprite.vy;

            // Tính khoảng cách đến người chơi
            const distToPlayer = Math.hypot(sprite.x - px, sprite.y - py);
            if (distToPlayer < minD) {
              minD = distToPlayer;
              closest = { sprite, distance: distToPlayer };
            }

            // Nếu người chơi lại quá gần (< 110px), vịt hoảng sợ tăng tốc chạy xa người chơi!
            let fleeing = false;
            if (distToPlayer < 110) {
              fleeing = true;
              const fleeAngle = Math.atan2(sprite.y - py, sprite.x - px);
              vx = Math.cos(fleeAngle) * 140 * dt;
              vy = Math.sin(fleeAngle) * 140 * dt;
            } else {
              // Đi dạo tự nhiên trong sân
              vx += (Math.random() - 0.5) * 4 * dt;
              vy += (Math.random() - 0.5) * 4 * dt;
            }

            let nx = sprite.x + vx;
            let ny = sprite.y + vy;

            // Giữ vịt trong sân đất hình tròn
            const duckDist = Math.hypot(nx - arenaCenter.x, ny - arenaCenter.y);
            const maxDuckDist = arenaRadius - 28;
            if (duckDist > maxDuckDist) {
              const normalAngle = Math.atan2(ny - arenaCenter.y, nx - arenaCenter.x);
              nx = arenaCenter.x + Math.cos(normalAngle) * maxDuckDist;
              ny = arenaCenter.y + Math.sin(normalAngle) * maxDuckDist;
              // Bật ngược hướng
              vx = -vx * 0.8;
              vy = -vy * 0.8;
            }

            return {
              ...sprite,
              x: nx,
              y: ny,
              vx,
              vy,
              fleeing
            };
          })
        );

        setNearestDuck(closest);

        // 3. ÂM THANH ĐỊNH VỊ KHÔNG GIAN (SPATIAL AUDIO)
        soundTimer += dt;
        if (soundTimer > 2.2) {
          soundTimer = 0;
          if (closest && closest.sprite) {
            const relX = (closest.sprite.x - px) / arenaRadius;
            duckAudio.playSpatialQuack(relX, closest.distance, arenaRadius);
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [arenaCenter.x, arenaCenter.y, arenaRadius, isPaused]);

  // Luồng bong bóng lời thoại ngẫu nhiên của các chú vịt
  useEffect(() => {
    if (isPaused) return;
    const quoteInterval = setInterval(() => {
      setDuckSprites(prev => {
        if (prev.length === 0) return prev;
        const available = prev.filter(s => !s.isCaught);
        if (available.length === 0) return prev;
        const pickIdx = Math.floor(Math.random() * available.length);
        const targetId = available[pickIdx].duck.id;
        const quote = DUCK_SPEECH_QUOTES[Math.floor(Math.random() * DUCK_SPEECH_QUOTES.length)];

        return prev.map(s => {
          if (s.duck.id === targetId) {
            return { ...s, speechQuote: quote };
          }
          return s.speechQuote ? { ...s, speechQuote: null } : s;
        });
      });
    }, 3200);

    return () => clearInterval(quoteInterval);
  }, [isPaused]);

  // Số lượng cờ hội ngũ sắc cắm quanh hàng rào tre
  const FLAG_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
  const fencePosts = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i / 24) * Math.PI * 2;
    const x = arenaCenter.x + Math.cos(angle) * arenaRadius;
    const y = arenaCenter.y + Math.sin(angle) * arenaRadius;
    const flagColor = FLAG_COLORS[i % FLAG_COLORS.length];
    return { x, y, angle, flagColor, hasFlag: i % 2 === 0 };
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#1c2e17] flex items-center justify-center"
    >
      {/* 1. NỀN LÀNG QUÊ VIỆT NAM (Bụi chuối, chòi lá, đống rơm) */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#2d4a22_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Chòi nghỉ rơm rạ ở góc trên bên trái */}
      <div className="absolute top-4 left-6 pointer-events-none z-10 opacity-90 hidden sm:block">
        <div className="relative flex flex-col items-center">
          <div className="w-0 h-0 border-x-[45px] border-x-transparent border-b-[35px] border-b-amber-700 filter drop-shadow-md" />
          <div className="w-20 h-14 bg-amber-900/80 border border-amber-950 flex items-center justify-center">
            <span className="text-[10px] text-amber-200 font-bold">CHÒI NGHỈ 🛖</span>
          </div>
        </div>
      </div>

      {/* Ụ rơm vàng ở góc trên bên phải */}
      <div className="absolute top-6 right-8 pointer-events-none z-10 opacity-90 hidden sm:block">
        <div className="w-16 h-12 bg-amber-500 rounded-t-full border border-amber-700 shadow-lg flex items-center justify-center">
          <span className="text-xs">🌾 Ụ RƠM</span>
        </div>
      </div>

      {/* 2. SÂN ĐẤT HÌNH TRÒN DÂN GIAN & HÀNG RÀO TRE */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
      >
        <defs>
          <radialGradient id="dirtYardGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#b45309" stopOpacity="0.9" />
            <stop offset="90%" stopColor="#78350f" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#451a03" stopOpacity="1" />
          </radialGradient>
          <filter id="yardGlow">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Mặt sân đất tròn nén chặt */}
        <circle
          cx={arenaCenter.x}
          cy={arenaCenter.y}
          r={arenaRadius}
          fill="url(#dirtYardGrad)"
          filter="url(#yardGlow)"
          stroke="#78350f"
          strokeWidth="6"
        />

        {/* Vòng tre đan viền ngoài hàng rào */}
        <circle
          cx={arenaCenter.x}
          cy={arenaCenter.y}
          r={arenaRadius}
          fill="none"
          stroke="#fef08a"
          strokeWidth="3"
          strokeDasharray="12 6"
          opacity="0.8"
        />

        {/* Các cọc tre & cờ hội ngũ sắc cắm quanh hàng rào */}
        {fencePosts.map((post, idx) => (
          <g key={idx}>
            {/* Cọc tre */}
            <circle cx={post.x} cy={post.y} r="5" fill="#fef08a" stroke="#854d0e" strokeWidth="2" />
            {/* Cờ hội tam giác */}
            {post.hasFlag && (
              <polygon
                points={`
                  ${post.x},${post.y - 4}
                  ${post.x + 16},${post.y - 12}
                  ${post.x},${post.y - 20}
                `}
                fill={post.flagColor}
                stroke="#fff"
                strokeWidth="1"
                className="animate-pulse"
              />
            )}
          </g>
        ))}

        {/* Vòng sáng radar âm thanh xung quanh người chơi khi bịt mắt */}
        <circle
          cx={player.x}
          cy={player.y}
          r="65"
          fill="none"
          stroke="#fde047"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.6"
          className="animate-spin"
          style={{ transformOrigin: `${player.x}px ${player.y}px`, animationDuration: '8s' }}
        />
      </svg>

      {/* 3. ĐÀN VỊT HỌC SINH */}
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

      {/* 4. NGƯỜI CHƠI BỊT MẮT TRUNG TÂM */}
      <DuckPlayerSprite
        x={player.x}
        y={player.y}
        direction={player.direction}
        isWalking={player.isWalking}
        isCatching={player.isCatching}
      />

      {/* 5. HIỆU ỨNG BỊT MẮT LỤA ĐỎ (BLINDFOLD OVERLAY / VIGNETTE) */}
      {difficulty === 'blindfold' && (
        <div
          className="absolute inset-0 pointer-events-none z-25"
          style={{
            background: `radial-gradient(circle at ${player.x}px ${player.y}px, transparent 40px, rgba(15, 23, 42, 0.75) 120px, rgba(15, 23, 42, 0.96) 240px)`
          }}
        >
          {/* Dải viền lụa đỏ phía trên mắt người chơi */}
          <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-red-950/80 to-transparent flex items-center justify-center">
            <span className="text-[11px] font-black text-red-400 tracking-widest uppercase">
              🙈 ĐANG BỊT MẮT — LẮNG NGHE TIẾNG VỊT ĐỂ BẮT!
            </span>
          </div>
        </div>
      )}

      {/* 6. NÚT BẮT VỊT NỔI BẬT KHI ĐẾN GẦN */}
      {nearestDuck && nearestDuck.distance <= 75 && (
        <div
          className="absolute z-50 pointer-events-auto transform -translate-x-1/2"
          style={{ left: `${player.x}px`, top: `${player.y + 40}px` }}
        >
          <button
            onClick={triggerCatch}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white font-black text-xs sm:text-sm shadow-2xl shadow-red-500/80 animate-bounce active:scale-95 border-2 border-yellow-300"
          >
            <span className="text-base">✋</span>
            <span>BẮT VỊT ({nearestDuck.sprite.duck.name})!</span>
          </button>
        </div>
      )}
    </div>
  );
};
