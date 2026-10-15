// Màn hình Đua Bi Trực Tiếp (Marble Racing View) — Phiên bản Cửa Ải Đa Tầng & Đầy Đủ Họ Tên
// Vẽ chi tiết: Vòng quay cối xay gió, 2 Cổ nút chai gom bi, Máng phóng cao tốc, Cần gạt & nấm nảy.
// Hiển thị đầy đủ họ tên học sinh, đóng băng hoàn toàn khi có người về nhất.

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  Music,
  Maximize2,
  Minimize2,
  Trophy,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { MarblePhysicsWorld } from '../utils/marblePhysics';
import { soundFx } from '../../../utils/soundEffects';

export const MarbleCanvas = ({
  trackLength = 'medium',
  useStudentPhotos = true,
  participants = [],
  onFinishRace,
  onCancelRace
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const worldRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const imageCacheRef = useRef(new Map());

  // Trạng thái cuộc đua
  const [raceTime, setRaceTime] = useState(0);
  const [finishedCount, setFinishedCount] = useState(0);
  const [firstWinner, setFirstWinner] = useState(null);
  const [liveLeaderboard, setLiveLeaderboard] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  // Điều khiển UI
  const [cameraMode, setCameraMode] = useState('smart'); // 'smart' (Mặc định: Bám sát tốp đầu & catch xuất phát) | 'leader' | 'top10'
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cameraYRef = useRef(0); // ★ Vị trí camera làm mượt (Smooth Camera Lerp)

  // Khởi tạo thế giới vật lý với bề rộng 1060px
  useEffect(() => {
    participants.forEach((p) => {
      if (p.avatar && !imageCacheRef.current.has(p.avatar)) {
        const img = new Image();
        img.src = p.avatar;
        imageCacheRef.current.set(p.avatar, img);
      }
    });

    const world = new MarblePhysicsWorld({
      width: 1060,
      trackLength,
      students: participants,
      usePhotos: useStudentPhotos,
      timeScale: speedMultiplier
    });

    worldRef.current = world;
    setLiveLeaderboard(world.getLiveLeaderboard().slice(0, 30));

    const startTimer = setTimeout(() => {
      world.openStartGate();
      soundFx.playClick();
    }, 1000);

    return () => {
      clearTimeout(startTimer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [trackLength, useStudentPhotos, participants]);

  // Cập nhật tốc độ
  useEffect(() => {
    if (worldRef.current) {
      worldRef.current.timeScale = speedMultiplier;
    }
  }, [speedMultiplier]);

  // Vòng lặp Render 60fps
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = (currentTime) => {
      if (!lastTimeRef.current) lastTimeRef.current = currentTime;
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      const world = worldRef.current;
      if (world && !isPaused) {
        if (!world.isRaceFinished) {
          world.update(deltaTime);
          setRaceTime(world.raceTimer);
          setFinishedCount(world.finishedCount);
          setLiveLeaderboard(world.getLiveLeaderboard().slice(0, 30));
        }

        // ★ DỪNG HẲN TOÀN BỘ KHI CÓ HỌC SINH VỀ NHẤT
        if (world.isRaceFinished || world.finishList.length > 0) {
          if (!firstWinner && world.finishList.length > 0) {
            const winner = world.finishList[0];
            setFirstWinner(winner);
            setRaceTime(world.finalRaceTime || winner.finishTime || world.raceTimer);
            setFinishedCount(1);
            setIsPaused(true);
            soundFx.playCorrect();
            confetti({
              particleCount: 120,
              spread: 90,
              origin: { y: 0.82 }
            });
          }
        }
      }

      drawFrame(ctx, canvas, world);
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [firstWinner, cameraMode, isPaused]);

  // Hàm vẽ toàn bộ đường đua và các viên bi
  const drawFrame = (ctx, canvas, world) => {
    if (!world) return;

    const W = canvas.width;
    const H = canvas.height;

    // ★ CAMERA CHUẨN THI ĐẤU:
    // 1. Lúc xuất phát: Cố định Y=0 CATCH TRỌN VẸN 100% CÁC BI XUẤT PHÁT VÀ NẤM NẢY!
    // 2. Khi đua: Bám chặt theo TỐP BI DẪN ĐẦU (Top Lead Pack). Viên bi dẫn đầu luôn nằm ở khoảng 50% - 60% màn hình,
    //    kéo theo toàn bộ các viên bi bám đuổi ngay phía sau. TUYỆT ĐỐI KHÔNG BAO GIỜ BỊ MÀN HÌNH TRỐNG!
    let targetCameraY = 0;
    if (cameraMode === 'smart') {
      targetCameraY = world.getSmartCameraTargetY(H);
    } else if (cameraMode === 'leader') {
      const leaderY = world.getLeaderY();
      targetCameraY = Math.max(0, Math.min(world.height - H, leaderY - H * 0.55));
    } else {
      const top10 = world.marbles.filter(m => !m.finished).slice(0, 10);
      const avgY = top10.length > 0 ? top10.reduce((s, m) => s + m.y, 0) / top10.length : world.height * 0.5;
      targetCameraY = Math.max(0, Math.min(world.height - H, avgY - H * 0.50));
    }

    // Làm mượt camera: ở vạch xuất phát thì giữ ở 0
    if (targetCameraY === 0 && cameraYRef.current < 20) {
      cameraYRef.current = 0;
    } else {
      cameraYRef.current += (targetCameraY - cameraYRef.current) * 0.075;
    }

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = '#090D26';
    ctx.fillRect(0, 0, W, H);

    ctx.translate(0, -cameraYRef.current);

    // 1. Hai đường viền biên phát sáng màu Neon Cyberpunk
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.moveTo(35, 0);
    ctx.lineTo(35, world.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(world.width - 35, 0);
    ctx.lineTo(world.width - 35, world.height);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 2. Nhãn tên các cửa ải
    drawStageLabels(ctx, world);

    // 3. Cửa ải 1: Cổng xuất phát & Rừng nấm nảy
    drawStartGate(ctx, world);

    for (const b of world.bumpers) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + (b.pulse * 5), 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 12 + b.pulse * 15;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();
    }

    // 4. Cửa ải 2: Cụm Vòng quay cánh quạt cối xay gió
    for (const rot of world.rotators) {
      drawRotator(ctx, world, rot);
    }

    // 5. Cửa ải 4: Mê cung thanh trượt & Cần gạt
    for (const s of world.slopes) {
      ctx.save();
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.thickness;
      ctx.lineCap = 'round';
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
      ctx.restore();
    }

    for (const f of world.flippers) {
      ctx.save();
      ctx.translate(f.x, f.y);
      const currentAngle = f.angle + Math.sin(world.flipperAngle * (f.speed > 0 ? 1 : -1)) * 0.55;
      ctx.rotate(currentAngle);

      ctx.fillStyle = '#F59E0B';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 12;
      ctx.fillRect(-10, -8, f.length, 16);

      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();
    }

    // 6. Cửa ải 5: Cửa chờ
    drawWaitingGate(ctx, world);

    // 7. Cửa ải 3 & 6: Các phễu cổ nút chai
    for (const w of world.funnelWalls) {
      ctx.save();
      ctx.strokeStyle = w.color;
      ctx.lineWidth = w.thickness || 14;
      ctx.lineCap = 'round';
      ctx.shadowColor = w.color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(w.x1, w.y1);
      ctx.lineTo(w.x2, w.y2);
      ctx.stroke();
      ctx.restore();
    }

    // 8. Cửa ải 7: Máng phóng cao tốc về đích
    drawSprintRamp(ctx, world);

    // 9. Vạch đích
    drawFinishLine(ctx, world.width, world.stageY.finish);

    // 10. Vẽ các viên bi
    for (const m of world.marbles) {
      drawMarble(ctx, m);
    }

    ctx.restore();

    // Chữ đếm ngược Xuất phát
    if (world.raceTimer < 1.0) {
      ctx.save();
      ctx.font = '900 68px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FACC15';
      ctx.shadowColor = '#EA580C';
      ctx.shadowBlur = 24;
      ctx.fillText('XUẤT PHÁT!', W / 2, H * 0.45);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.strokeText('XUẤT PHÁT!', W / 2, H * 0.45);
      ctx.restore();
    }
  };

  // Vẽ Vòng quay cối xay gió
  const drawRotator = (ctx, world, rot) => {
    ctx.save();
    ctx.translate(rot.x, rot.y);
    const angle = world.rotatorAngle * rot.speed;
    ctx.rotate(angle);

    // Vòng tròn trung tâm
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fillStyle = rot.color;
    ctx.shadowColor = rot.color;
    ctx.shadowBlur = 14;
    ctx.fill();

    // Các cánh quạt quay
    const numBlades = rot.blades || 4;
    for (let b = 0; b < numBlades; b++) {
      ctx.save();
      ctx.rotate(b * (Math.PI * 2 / numBlades));

      // Cánh quạt
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = rot.color;
      ctx.shadowBlur = 10;
      ctx.fillRect(-6, -6, rot.radius, 12);

      // Điểm chốt ở đầu cánh
      ctx.beginPath();
      ctx.arc(rot.radius, 0, 9, 0, Math.PI * 2);
      ctx.fillStyle = rot.color;
      ctx.fill();
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.restore();
  };

  // Vẽ Máng phóng siêu tốc
  const drawSprintRamp = (ctx, world) => {
    if (!world.sprintRamp) return;
    const { topY, bottomY, leftX, rightX } = world.sprintRamp;

    ctx.save();
    // Nền máng phóng phát sáng vàng cam rực rỡ
    const grad = ctx.createLinearGradient(0, topY, 0, bottomY);
    grad.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
    grad.addColorStop(1, 'rgba(239, 68, 68, 0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(leftX, topY, rightX - leftX, bottomY - topY);

    // Hai viền máng phóng
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(leftX, topY);
    ctx.lineTo(leftX, bottomY);
    ctx.moveTo(rightX, topY);
    ctx.lineTo(rightX, bottomY);
    ctx.stroke();

    // Mũi tên gia tốc hướng xuống vạch đích
    ctx.font = '900 18px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'center';
    const midX = (leftX + rightX) / 2;
    for (let y = topY + 40; y < bottomY - 30; y += 70) {
      ctx.fillText('▼ ▼ BỨT TỐC VỀ ĐÍCH ▼ ▼', midX, y);
    }
    ctx.restore();
  };

  // Vẽ nhãn tên các cửa ải
  const drawStageLabels = (ctx, world) => {
    ctx.save();
    ctx.font = '900 22px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.textAlign = 'center';

    ctx.fillText('CỬA ẢI 1: RỪNG NẤM NẢY', world.width / 2, world.stageY.mushrooms + 25);
    ctx.fillText('CỬA ẢI 2: VÒNG QUAY CỐI XAY GIÓ', world.width / 2, world.stageY.rotators + 25);
    ctx.fillText('CỬA ẢI 3: CỔ NÚT CHAI GOM BI', world.width / 2, world.stageY.funnel1 + 20);
    ctx.fillText('CỬA ẢI 4: MÊ CUNG THANH TRƯỢT', world.width / 2, world.stageY.slopes + 25);
    ctx.fillText('CỬA ẢI 5: CỬA CHẶN NHỊP', world.width / 2, world.stageY.waitingGate + 25);
    ctx.fillText('CỬA ẢI 6: CỔ NÚT CHAI CHẬM', world.width / 2, world.stageY.funnel2 + 20);
    ctx.fillText('CỬA ẢI 7: CẦU PHÓNG VỀ ĐÍCH', world.width / 2, world.stageY.sprintFinish - 15);
    ctx.restore();
  };

  // Vẽ Cổng xuất phát
  const drawStartGate = (ctx, world) => {
    ctx.save();
    const gateY = world.stageY.start + 280;
    const progress = world.startGateProgress;

    if (progress < 1) {
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 10;
      ctx.shadowColor = '#F43F5E';
      ctx.shadowBlur = 12;

      const midX = world.width / 2;
      const openOffset = (world.width / 2 - 40) * progress;

      ctx.beginPath();
      ctx.moveTo(35, gateY);
      ctx.lineTo(midX - openOffset, gateY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(world.width - 35, gateY);
      ctx.lineTo(midX + openOffset, gateY);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Vẽ Cửa chờ & Cổng Nhân Bản Bi (Multiplier Portal)
  const drawWaitingGate = (ctx, world) => {
    ctx.save();
    const gateY = world.stageY.waitingGate + 70;
    const progress = world.waitingGateProgress;

    // Dải phát sáng Cổng Nhân Bản Bi X2
    const portalY = gateY + 45;
    ctx.save();
    ctx.strokeStyle = '#D946EF';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#EC4899';
    ctx.shadowBlur = 20;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.moveTo(45, portalY);
    ctx.lineTo(world.width - 45, portalY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '900 17px system-ui, sans-serif';
    ctx.fillStyle = '#F472B6';
    ctx.shadowColor = '#EC4899';
    ctx.shadowBlur = 12;
    ctx.textAlign = 'center';
    ctx.fillText('⚡ CỔNG NHÂN BẢN BI X2 — BÙNG NỔ BẤT NGỜ ⚡', world.width / 2, portalY - 12);
    ctx.restore();

    if (progress < 1) {
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 12;
      ctx.shadowColor = '#A855F7';
      ctx.shadowBlur = 14;

      const midX = world.width / 2;
      const openOffset = (world.width / 2 - 40) * progress;

      ctx.beginPath();
      ctx.moveTo(35, gateY);
      ctx.lineTo(midX - openOffset, gateY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(world.width - 35, gateY);
      ctx.lineTo(midX + openOffset, gateY);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Vẽ Vạch đích
  const drawFinishLine = (ctx, trackW, y) => {
    ctx.save();
    const squareSize = 16;
    const startX = 35;
    const totalW = trackW - 70;
    const cols = Math.floor(totalW / squareSize);

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#FFFFFF' : '#000000';
        ctx.fillRect(startX + c * squareSize, y + r * squareSize, squareSize, squareSize);
      }
    }

    ctx.font = '900 22px system-ui, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#FBBF24';
    ctx.shadowBlur = 10;
    ctx.textAlign = 'left';
    ctx.fillText('🏁 ĐÍCH', trackW * 0.58, y + 22);
    ctx.restore();
  };

  // Vẽ viên bi với ảnh & tên bay theo
  const drawMarble = (ctx, m) => {
    ctx.save();

    if (m.isBoosting) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.radius + 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.45)';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 22;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(m.x - m.radius * 0.7, m.y - m.radius * 0.3);
      ctx.lineTo(m.x, m.y - m.radius - 18);
      ctx.lineTo(m.x + m.radius * 0.7, m.y - m.radius * 0.3);
      ctx.fillStyle = '#EF4444';
      ctx.shadowColor = '#DC2626';
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius + 2, 0, Math.PI * 2);
    ctx.fillStyle = m.color;
    ctx.shadowColor = m.isBoosting ? '#F59E0B' : m.color;
    ctx.shadowBlur = m.isBoosting ? 18 : 8;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
    ctx.clip();

    let drawnPhoto = false;
    if (useStudentPhotos && m.avatar) {
      const cachedImg = imageCacheRef.current.get(m.avatar);
      if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
        ctx.drawImage(cachedImg, m.x - m.radius, m.y - m.radius, m.radius * 2, m.radius * 2);
        drawnPhoto = true;
      }
    }

    if (!drawnPhoto) {
      ctx.fillStyle = m.color;
      ctx.fillRect(m.x - m.radius, m.y - m.radius, m.radius * 2, m.radius * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(m.initials, m.x, m.y);
    }

    ctx.restore();

    // Tên học sinh hiển thị cạnh viên bi
    ctx.save();
    ctx.font = '800 11px system-ui, sans-serif';
    ctx.fillStyle = m.isBoosting ? '#FDE047' : m.isClone ? '#A7F3D0' : '#FFFFFF';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 5;
    ctx.textAlign = 'center';
    const shortName = m.name.split(' ').slice(-2).join(' ');
    const tag = m.isBoosting ? `🔥 ${shortName}` : m.isClone ? `⚡ ${shortName}` : shortName;
    ctx.fillText(tag, m.x, m.y - m.radius - 4);
    ctx.restore();
  };

  const handleFinishEarly = () => {
    soundFx.playClick();
    const world = worldRef.current;
    if (!world) return;
    const finalLeaderboard = world.getLiveLeaderboard();
    onFinishRace({
      winner: firstWinner || finalLeaderboard[0],
      leaderboard: finalLeaderboard,
      raceTime: world.finalRaceTime || world.raceTimer
    });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#070A1E] flex flex-col select-none overflow-hidden"
    >
      {/* 1. Thanh Top Banner */}
      <div className="h-14 px-5 border-b border-purple-900/40 bg-[#0B0F2B]/90 backdrop-blur-md flex items-center justify-between text-white z-20">
        <div className="flex items-center space-x-2.5">
          <span className="text-xl">🎤</span>
          <span className="text-xs sm:text-sm font-black text-purple-200">
            {worldRef.current ? worldRef.current.marbles.length : participants.length} viên bi trên đường đua
          </span>
          {worldRef.current && worldRef.current.marbles.length > participants.length && (
            <span className="px-2.5 py-0.5 bg-gradient-to-r from-fuchsia-600 to-pink-600 border border-fuchsia-400 rounded-lg text-[11px] font-black text-white animate-pulse shadow-md flex items-center space-x-1">
              <span>⚡</span>
              <span>BÙNG NỔ X2 BI!</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className={`text-xl sm:text-2xl font-mono font-black tracking-wider transition-colors ${
            firstWinner ? 'text-emerald-400' : 'text-yellow-400'
          }`}>
            {Number(raceTime).toFixed(2)}s
          </div>
          {firstWinner && (
            <span className="px-2.5 py-0.5 bg-emerald-900/80 border border-emerald-500 rounded-lg text-[11px] font-black text-emerald-300 animate-pulse flex items-center space-x-1">
              <span>⏱</span>
              <span>ĐÃ CÁN ĐÍCH!</span>
            </span>
          )}
          <span className="px-3 py-1 bg-purple-950/80 border border-purple-800 rounded-xl text-xs font-black text-purple-200">
            VỀ ĐÍCH {finishedCount}/{participants.length}
          </span>
        </div>
      </div>

      {/* 2. Khung Nội Dung Chính: Canvas Đường Đua & Bảng Xếp Hạng */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Khu vực Canvas 2D */}
        <div className="flex-1 flex items-center justify-center p-2 bg-[#0B0F2B] overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={1060}
            height={860}
            className="w-full h-full max-w-[1060px] max-h-[860px] object-contain rounded-2xl shadow-2xl"
          />

          {/* Banner Người Về Nhất ở chân màn hình — HIỂN THỊ ĐẦY ĐỦ HỌ VÀ TÊN */}
          {firstWinner && (
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-30 animate-in slide-in-from-bottom duration-300 max-w-[94%]">
              <div className="px-6 py-3.5 rounded-full bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white shadow-2xl border-2 border-amber-300 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-white/20 shrink-0 shadow-md">
                  {firstWinner.avatar ? (
                    <img src={firstWinner.avatar} alt="winner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-black">
                      {firstWinner.initials}
                    </div>
                  )}
                </div>

                {/* Hiển thị ĐẦY ĐỦ HỌ VÀ TÊN học sinh quán quân */}
                <div className="flex items-center space-x-2.5">
                  <span className="text-sm font-black text-yellow-200 flex items-center space-x-1 shrink-0">
                    <Trophy className="w-4 h-4 fill-current inline text-yellow-300" />
                    <span>VỀ NHẤT:</span>
                  </span>
                  <span className="text-sm sm:text-base font-black text-white tracking-wide">
                    {firstWinner.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleFinishEarly}
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-full shadow-lg flex items-center space-x-1.5 transition-all transform hover:scale-105 active:scale-95 shrink-0"
                >
                  <span>Xem kết quả</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cột Bảng Xếp Hạng — HIỂN THỊ ĐẦY ĐỦ HỌ VÀ TÊN */}
        <div className="w-72 sm:w-80 border-l border-purple-900/40 bg-[#080C26] flex flex-col justify-between p-3 z-20">
          
          {/* Mini-map tiến độ */}
          <div className="mb-2">
            <div className="h-3.5 rounded-full overflow-hidden flex border border-purple-800/60 p-0.5 bg-purple-950/40">
              {['#38BDF8', '#F59E0B', '#06B6D4', '#EC4899', '#A855F7', '#F43F5E', '#22C55E'].map((c, idx) => (
                <div key={idx} className="flex-1 h-full opacity-70" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          {/* BẢNG XẾP HẠNG — HIỂN THỊ ĐẦY ĐỦ HỌ VÀ TÊN */}
          <div className="flex-1 flex flex-col min-h-0">
            <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>BẢNG XẾP HẠNG ĐUA BI</span>
            </h4>

            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
              {liveLeaderboard.map((m, idx) => {
                const rank = idx + 1;
                return (
                  <div
                    key={m.id}
                    className={`p-1.5 px-2 rounded-xl border flex items-center justify-between transition-all ${
                      rank === 1
                        ? 'bg-amber-400/20 border-amber-400 text-yellow-300'
                        : rank <= 3
                        ? 'bg-purple-900/30 border-purple-700 text-purple-200'
                        : 'bg-slate-900/40 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-[11px] font-black w-4 text-center shrink-0">
                        {rank}
                      </span>
                      {m.avatar ? (
                        <img src={m.avatar} alt="av" className="w-5 h-5 rounded-full object-cover shrink-0 border border-white/20" />
                      ) : (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                          style={{ backgroundColor: m.color }}
                        >
                          {m.initials}
                        </div>
                      )}
                      {/* ĐẦY ĐỦ HỌ VÀ TÊN */}
                      <span className="text-xs font-extrabold truncate" title={m.name}>
                        {m.name}
                      </span>
                    </div>

                    {m.finished && (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0 pl-1">
                        ✓ Đích
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cụm Điều Khiển Ở Góc Dưới Bên Phải */}
          <div className="pt-2.5 border-t border-purple-900/40 space-y-2">
            <div className="flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-xl border text-xs font-black flex-1 flex items-center justify-center transition-all ${
                  !isMuted ? 'bg-pink-600 border-pink-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="Âm thanh hiệu ứng"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsMusicOn(!isMusicOn)}
                className={`p-2 rounded-xl border text-xs font-black flex-1 flex items-center justify-center transition-all ${
                  isMusicOn ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="Nhạc nền sôi động"
              >
                <Music className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black flex-1 flex items-center justify-center transition-all"
                title="Toàn màn hình"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>Tốc độ:</span>
              <div className="flex items-center space-x-1">
                {[1, 2, 3].map(sp => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setSpeedMultiplier(sp);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                      speedMultiplier === sp
                        ? 'bg-pink-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    x{sp}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>Camera:</span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setCameraMode('smart');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                    cameraMode === 'smart'
                      ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Catch toàn bộ bi xuất phát, sau đó bám sát các bi nhanh dẫn đầu"
                >
                  Tốp đầu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setCameraMode('leader');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                    cameraMode === 'leader'
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Bám theo viên bi dẫn đầu số 1"
                >
                  Bi số 1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setCameraMode('top10');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                    cameraMode === 'top10'
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Bám theo Top 10 viên bi phía trước"
                >
                  Top 10
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishEarly}
              className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5 ${
                firstWinner
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black animate-pulse'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {firstWinner ? (
                <>
                  <Trophy className="w-4 h-4 fill-current" />
                  <span>XEM KẾT QUẢ BẢNG VÀNG</span>
                </>
              ) : (
                <span>Kết thúc</span>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
