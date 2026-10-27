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
const PANIC_SPEECHES = [
  'Ối! Thầy gần quá! 😱',
  'Á á chạy mau! 💨',
  'Hụt rồi! 😜',
  'Em chưa học bài đâu! 💦'
];

const WANDER_SPEECHES = [
  'Thầy ơi, em đây này! 🖐️',
  'Bắt em đi! 😜',
  'Hụt rồi! 🏃',
  'Không bắt được em đâu! 😆'
];

export const DuckArena = ({
  ducks = [],
  mode = 'blind_catch',
  targetDuckId = null,
  characterType = 'boy',
  timeLeft = 20,
  roundDuration = 20,
  showDuckNames = true,
  onCatchDuck,
  onMissCatch,
  isPaused = false
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 620 });
  const [activeCharacter, setActiveCharacter] = useState(characterType || 'boy');

  // Cập nhật khi prop thay đổi
  useEffect(() => {
    if (characterType) setActiveCharacter(characterType);
  }, [characterType]);

  // Helper so sánh ID an toàn (hỗ trợ cả string và number từ Supabase)
  const isMatchDuck = (a, b) => a != null && b != null && String(a) === String(b);

  // Tâm và bán kính sân cát tròn phối cảnh 3D
  const arenaCenter = { x: dimensions.width / 2, y: dimensions.height / 2 + 50 };
  const arenaRadiusX = Math.min(dimensions.width * 0.44, 460);
  const arenaRadiusY = Math.min(dimensions.height * 0.31, 205);

  // Người bịt mắt 3D hoạt hình
  const playerRef = useRef({
    x: arenaCenter.x - 60,
    y: arenaCenter.y + 20,
    direction: 'right',
    isWalking: true,
    isCatching: false,
    isHoldingDuck: false
  });

  const [playerState, setPlayerState] = useState(playerRef.current);

  // Đàn vịt 3D (18-26 con)
  const [duckSprites, setDuckSprites] = useState([]);
  const [caughtDuckObj, setCaughtDuckObj] = useState(null);
  const [cameraZoom, setCameraZoom] = useState({ scale: 1, x: 0, y: 0 });

  const animFrameRef = useRef(null);
  const patrolAngleRef = useRef(0);
  const spritesRef = useRef([]);
  const hasCaughtRef = useRef(false);
  const isSurpriseLungingRef = useRef(false);
  const quackAudioTimerRef = useRef(0);

  // Tìm tên bạn học sinh đang được đuổi theo (Không bao giờ gán cứng ducks[0])
  const targetDuckObj = ducks.find(d => isMatchDuck(d.id, targetDuckId)) || null;
  const targetStudentName = targetDuckObj?.name || targetDuckObj?.full_name || (mode === 'blind_catch' ? 'một chú vịt bí ẩn' : 'học sinh');

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

    // 1. Chú vịt mục tiêu (BẮT BUỘC CÓ MẶT NẾU ĐÃ CHỌN TÊN ĐỂ TRÁNH LỖI MẶC ĐỊNH BẠN ĐẦU TIÊN)
    const targetDuck = ducks.find(d => isMatchDuck(d.id, targetDuckId));

    // 2. Trộn ngẫu nhiên danh sách các bạn học sinh còn lại
    const remainingDucks = ducks
      .filter(d => !targetDuck || !isMatchDuck(d.id, targetDuck.id))
      .sort(() => Math.random() - 0.5);

    // 3. Đàn vịt khoảng 16 - 26 con
    const flockTargetCount = Math.max(16, Math.min(26, ducks.length));
    const finalDuckList = [];
    if (targetDuck) {
      finalDuckList.push(targetDuck);
    }

    for (let i = 0; finalDuckList.length < flockTargetCount && remainingDucks.length > 0; i++) {
      finalDuckList.push(remainingDucks[i % remainingDucks.length]);
    }

    // Trộn ngẫu nhiên hoàn toàn thứ tự trong đàn
    finalDuckList.sort(() => Math.random() - 0.5);

    const cohort = finalDuckList.map((item, idx) => ({
      ...item,
      instanceId: `duck_inst_${item.id}_${idx}_${Date.now()}`,
      isTarget: isMatchDuck(item.id, targetDuckId)
    }));

    // Phân bổ đều khắp 360 độ mặt sân tròn (tránh tập trung vào góc)
    const initialSprites = cohort.map((item, idx) => {
      const angle = (idx / cohort.length) * Math.PI * 2;
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
        isTarget: item.isTarget,
        speech: null,
        speechTimer: 2 + Math.random() * 5
      };
    });

    spritesRef.current = initialSprites;
    setDuckSprites(initialSprites);
    patrolAngleRef.current = 0;
  }, [ducks, targetDuckId, dimensions.width, dimensions.height]);

  // HÀNH ĐỘNG BẮT VỊT (BẤT NGỜ LAO TỚI TÚM VỊT MỤC TIÊU)
  const triggerCatch = (forcedDuck = null) => {
    if (hasCaughtRef.current) return;

    let targetToCatch = forcedDuck;
    if (!targetToCatch) {
      if (targetDuckId) {
        const targetSprite = spritesRef.current.find(s => isMatchDuck(s.duck.id, targetDuckId));
        if (targetSprite) {
          targetToCatch = targetSprite.duck;
        }
      }

      // Nếu chưa có target hoặc chế độ bắt tự do / blind_catch:
      // Bốc NGẪU NHIÊN 1 chú vịt chưa bị bắt trong sân (KHÔNG BAO GIỜ MẶC ĐỊNH NGUYỄN QUYỀN ANH)
      if (!targetToCatch) {
        const uncaughtSprites = spritesRef.current.filter(s => !s.isCaught);
        if (uncaughtSprites.length > 0) {
          const randIdx = Math.floor(Math.random() * uncaughtSprites.length);
          targetToCatch = uncaughtSprites[randIdx].duck;
        } else if (ducks.length > 0) {
          const randIdx = Math.floor(Math.random() * ducks.length);
          targetToCatch = ducks[randIdx];
        }
      }
    }

    if (targetToCatch) {
      hasCaughtRef.current = true;
      isSurpriseLungingRef.current = false;
      duckAudio.playCatchSuccess();

      const caughtSprite = spritesRef.current.find(
        s => s.duck.id === targetToCatch.id || s.duck.instanceId === targetToCatch.instanceId
      );

      if (caughtSprite) {
        caughtSprite.isCaught = true;
        caughtSprite.state = 'CAUGHT';
        setCaughtDuckObj(targetToCatch);

        // Lao tới ôm vịt hạnh phúc
        playerRef.current.x = caughtSprite.x;
        playerRef.current.y = caughtSprite.y + 8;
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

  // KHI ĐẾM NGƯỢC XUỐNG DƯỚI 3.5S: KÍCH HOẠT PHA "BẤT NGỜ LAO TỚI BẮT VỊT"
  useEffect(() => {
    if (timeLeft <= 3 && timeLeft > 0 && !hasCaughtRef.current && !isPaused) {
      isSurpriseLungingRef.current = true;
    }
    if (timeLeft === 0 && !hasCaughtRef.current && !isPaused) {
      let targetSprite = null;
      if (targetDuckId) {
        targetSprite = spritesRef.current.find(s => isMatchDuck(s.duck.id, targetDuckId));
      }
      if (targetSprite) {
        triggerCatch(targetSprite.duck);
      } else {
        const activeSprites = spritesRef.current.filter(s => !s.isCaught);
        if (activeSprites.length > 0) {
          const randIdx = Math.floor(Math.random() * activeSprites.length);
          triggerCatch(activeSprites[randIdx].duck);
        } else {
          triggerCatch();
        }
      }
    }
  }, [timeLeft, isPaused, targetDuckId]);

  // VÒNG LẶP VẬT LÝ DI CHUYỂN TOÀN SÂN & BẤT NGỜ BẮT VỊT (60FPS)
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.08);
      lastTime = currentTime;

      if (!isPaused && !hasCaughtRef.current && spritesRef.current.length > 0) {
        let p = playerRef.current;

        // ==============================================================
        // 1. CƠ CHẾ DI CHUYỂN NGƯỜI BỊT MẮT:
        // - GIAI ĐOẠN 1 (Đầu & giữa trận): Di chuyển quanh cả vòng sân, mò mẫm tự nhiên
        //   KHÔNG dí bắt 1 học sinh ngay, tạo sự hồi hộp bất ngờ cho cả lớp!
        // - GIAI ĐOẠN 2 (3.5 giây cuối hoặc bấm nút bắt): Bất ngờ phi tới tóm lấy vịt mục tiêu!
        // ==============================================================
        let targetX = arenaCenter.x;
        let targetY = arenaCenter.y;
        let currentSpeed = 95 * dt;

        if (isSurpriseLungingRef.current) {
          // PHA BẤT NGỜ LAO TỚI BẮT VỊT (Bứt tốc độ cao tóm lấy mục tiêu)
          let targetSprite = null;
          if (targetDuckId) {
            targetSprite = spritesRef.current.find(s => isMatchDuck(s.duck.id, targetDuckId));
          }
          if (!targetSprite) {
            targetSprite = spritesRef.current[0];
          }

          targetX = targetSprite ? targetSprite.x : arenaCenter.x;
          targetY = targetSprite ? targetSprite.y : arenaCenter.y;
          currentSpeed = 230 * dt; // Bứt tốc bất ngờ
          p.isCatching = true;

          // Nếu đã áp sát dưới 25px: Bắt luôn!
          const distToCatch = Math.hypot(targetX - p.x, targetY - p.y);
          if (distToCatch < 28) {
            triggerCatch(targetSprite.duck);
            return;
          }
        } else {
          // PHA MÒ MẪM QUANH CẢ VÒNG SÂN (Tự nhiên, không lộ mục tiêu)
          patrolAngleRef.current += 0.85 * dt;
          
          // Đi tuần tra hình số 8 / hình elip mềm quanh cả vòng sân
          const orbitRadiusX = arenaRadiusX * 0.55;
          const orbitRadiusY = arenaRadiusY * 0.55;

          let wanderX = arenaCenter.x + Math.cos(patrolAngleRef.current) * orbitRadiusX;
          let wanderY = arenaCenter.y + Math.sin(patrolAngleRef.current * 1.3) * orbitRadiusY;

          // Cứ 3.5 giây đổi hướng mò mẫm về phía một âm thanh vịt ngẫu nhiên gần đó
          const soundCycle = Math.floor(currentTime / 3500);
          const randSoundIdx = (soundCycle * 7) % spritesRef.current.length;
          const soundSprite = spritesRef.current[randSoundIdx];

          if (soundSprite && (currentTime % 3500) < 1400) {
            wanderX = soundSprite.x;
            wanderY = soundSprite.y;
          }

          targetX = wanderX;
          targetY = wanderY;
          currentSpeed = 100 * dt; // Chạy bước tự nhiên, không nhanh quá
          p.isCatching = false;
        }

        const toTargetX = targetX - p.x;
        const toTargetY = targetY - p.y;
        const distToTarget = Math.hypot(toTargetX, toTargetY) || 1;

        p.x += (toTargetX / distToTarget) * currentSpeed;
        p.y += (toTargetY / distToTarget) * currentSpeed;

        if (Math.abs(toTargetX) > 2) {
          p.direction = toTargetX >= 0 ? 'right' : 'left';
        }
        p.isWalking = true;

        // Giữ người chơi luôn trong ranh giới sân cát
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

          // B. Lực né tránh người bắt khi đến gần (vòng cung trượt né, tránh kẹt góc rào)
          const distToPlayer = Math.hypot(sprite.x - p.x, sprite.y - p.y);
          if (distToPlayer < 140) {
            sprite.state = 'PANIC';
            anyPanic = true;
            // Đẩy dạt ra xa + lượn vòng cung vuông góc để thoát
            const fleeAngle = Math.atan2(sprite.y - p.y, sprite.x - p.x);
            const tangentOffset = (i % 2 === 0 ? 0.65 : -0.65);
            sprite.vx = Math.cos(fleeAngle + tangentOffset) * 135;
            sprite.vy = Math.sin(fleeAngle + tangentOffset) * 90;
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

          // E. Quản lý bong bóng lời thoại ngộ nghĩnh của đàn vịt
          sprite.speechTimer -= dt;
          if (sprite.isCaught) {
            sprite.speech = 'Bị tóm rồi! 🦆';
          } else if (sprite.state === 'PANIC') {
            if (!sprite.speech || sprite.speechTimer <= 0) {
              sprite.speech = PANIC_SPEECHES[Math.floor(Math.random() * PANIC_SPEECHES.length)];
              sprite.speechTimer = 2.4;
            }
          } else if (sprite.state === 'WALK') {
            if (sprite.speech && sprite.speechTimer <= 0) {
              sprite.speech = null;
              sprite.speechTimer = 6 + Math.random() * 8;
            } else if (!sprite.speech && sprite.speechTimer <= 0 && Math.random() < 0.25) {
              sprite.speech = WANDER_SPEECHES[Math.floor(Math.random() * WANDER_SPEECHES.length)];
              sprite.speechTimer = 2.5;
            }
          }

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
      {/* 1. THANH TRẠNG THÁI ĐỈNH SÂN: HỒI HỘP, BẤT NGỜ (KHÔNG TIẾT LỘ SỚM) */}
      {/* ============================================================== */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="px-5 py-2 rounded-full bg-[#1b4d3e]/90 backdrop-blur-md text-white border-2 border-white/40 shadow-xl flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs sm:text-sm font-black tracking-wide">
            {hasCaughtRef.current
              ? `🎉 ĐÃ TÚM ĐƯỢC CHÚ VỊT CỦA ${targetStudentName.toUpperCase()}! 👏`
              : timeLeft <= 3
              ? `⚡ BẤT NGỜ LAO TỚI BẮT VỊT! 🎯`
              : `🌾 Đang bịt mắt lùng sục quanh sân... Ai sẽ bị tóm đây? 🦆`}
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1B. NÚT ĐỔI NHÂN VẬT THIỆN CẢM: CÔ BÉ / CẬU BÉ */}
      {/* ============================================================== */}
      <div className="absolute top-3 right-3 sm:right-5 z-50 pointer-events-auto flex items-center space-x-1 p-1 rounded-2xl bg-black/60 backdrop-blur-md border border-amber-400/50 shadow-xl">
        <span className="text-[10px] font-black text-amber-200 pl-2 pr-1 hidden sm:inline">Nhân vật:</span>
        {[
          { id: 'girl', label: 'Cô Bé', icon: '👧' },
          { id: 'boy', label: 'Cậu Bé', icon: '👦' }
        ].map(char => (
          <button
            key={char.id}
            onClick={(e) => {
              e.stopPropagation();
              setActiveCharacter(char.id);
            }}
            className={`flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-black transition-all ${
              activeCharacter === char.id
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md scale-105 ring-2 ring-yellow-400'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title={`Chuyển người bịt mắt thành ${char.label}`}
          >
            <span className="text-sm">{char.icon}</span>
            <span>{char.label}</span>
          </button>
        ))}
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
            speech={sprite.speech}
            showName={showDuckNames}
            allNames={allNames}
          />
        ))}

        {/* ============================================================== */}
        {/* 5. NGƯỜI BỊT MẮT 3D HOẠT HÌNH (CÔ BÉ / CẬU BÉ / THẦY GIÁO) */}
        {/* ============================================================== */}
        <DuckPlayerSprite
          x={playerState.x}
          y={playerState.y}
          direction={playerState.direction}
          characterType={activeCharacter}
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
