// Màn hình Đua Bi Trực Tiếp (Marble Racing View) — Phiên bản Chuẩn Nâng Cấp Pro
// 1. DỪNG HẲN đồng hồ và toàn bộ bi ngay khi có học sinh về nhất.
// 2. Khung canvas mở rộng 1060px cực nét, hiển thị thoáng và bao quát máy chiếu.
// 3. Hiệu ứng Nitro Boost rực rỡ cho bi vượt mặt lội ngược dòng.

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
  const [cameraMode, setCameraMode] = useState('leader'); // 'leader' | 'top10'
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Khởi tạo thế giới vật lý với bề rộng mở rộng 1060px
  useEffect(() => {
    // Tải trước avatar học sinh
    participants.forEach((p) => {
      if (p.avatar && !imageCacheRef.current.has(p.avatar)) {
        const img = new Image();
        img.src = p.avatar;
        imageCacheRef.current.set(p.avatar, img);
      }
    });

    const world = new MarblePhysicsWorld({
      width: 1060, // Khung rộng 1060px thoáng đẹp
      trackLength,
      students: participants,
      usePhotos: useStudentPhotos,
      timeScale: speedMultiplier
    });

    worldRef.current = world;
    setLiveLeaderboard(world.getLiveLeaderboard().slice(0, 22));

    // Đếm ngược 1 giây rồi mở cổng xuất phát
    const startTimer = setTimeout(() => {
      world.openStartGate();
      soundFx.playClick();
    }, 1000);

    return () => {
      clearTimeout(startTimer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [trackLength, useStudentPhotos, participants]);

  // Cập nhật tốc độ mô phỏng
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
        // Nếu chưa kết thúc -> tiếp tục cập nhật vật lý
        if (!world.isRaceFinished) {
          world.update(deltaTime);
          setRaceTime(world.raceTimer);
          setFinishedCount(world.finishedCount);
          setLiveLeaderboard(world.getLiveLeaderboard().slice(0, 22));
        }

        // ★ KHI CÓ HỌC SINH VỀ NHẤT: DỪNG HẲN MỌI THỨ NGAY LẬP TỨC
        if (world.isRaceFinished || world.finishList.length > 0) {
          if (!firstWinner && world.finishList.length > 0) {
            const winner = world.finishList[0];
            setFirstWinner(winner);
            setRaceTime(world.finalRaceTime || winner.finishTime || world.raceTimer);
            setFinishedCount(1);
            setIsPaused(true); // ★ DỪNG HẲN SIMULATION LOOP
            soundFx.playCorrect();
            confetti({
              particleCount: 110,
              spread: 90,
              origin: { y: 0.82 }
            });
          }
        }
      }

      // Xóa và vẽ khung hình (vẫn vẽ để giữ nguyên hiện trường đóng băng)
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

    // Tính toán vị trí Camera cuộn theo trục Y
    let targetCameraY = 0;
    if (cameraMode === 'leader') {
      const leaderY = world.getLeaderY();
      targetCameraY = Math.max(0, Math.min(world.height - H, leaderY - H * 0.42));
    } else {
      // Top 10 camera
      const top10 = world.marbles.filter(m => !m.finished).slice(0, 10);
      const avgY = top10.length > 0 ? top10.reduce((s, m) => s + m.y, 0) / top10.length : world.height * 0.5;
      targetCameraY = Math.max(0, Math.min(world.height - H, avgY - H * 0.45));
    }

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    // Nền đường đua tối sang trọng (#0A0E2A)
    ctx.fillStyle = '#090D26';
    ctx.fillRect(0, 0, W, H);

    // Di chuyển canvas theo Camera Y
    ctx.translate(0, -targetCameraY);

    // 1. Vẽ hai đường viền biên phát sáng màu xanh Neon Cyberpunk
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

    // 2. Vẽ nhãn tên 7 chặng phát sáng nhẹ
    drawStageLabels(ctx, world);

    // 3. Vẽ Chặng 1: Cổng xuất phát
    drawStartGate(ctx, world);

    // 4. Vẽ Chặng 2: Nấm nảy (Pinball Bumpers)
    for (const b of world.bumpers) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + (b.pulse * 5), 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 12 + b.pulse * 15;
      ctx.fill();

      // Tâm nấm nảy màu trắng
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();
    }

    // 5. Vẽ Chặng 3: Cần gạt Pinball
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

    // 6. Vẽ Chặng 4: Cửa chờ (Waiting Gate)
    drawWaitingGate(ctx, world);

    // 7. Vẽ Chặng 5: Thanh bay dốc
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

      // Vạch mũi tên trượt xuôi dốc
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
      ctx.restore();
    }

    // 8. Vẽ Chặng 6: Phễu cổ chai
    for (const w of world.funnelWalls) {
      ctx.save();
      ctx.strokeStyle = w.color;
      ctx.lineWidth = w.thickness || 12;
      ctx.lineCap = 'round';
      ctx.shadowColor = w.color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(w.x1, w.y1);
      ctx.lineTo(w.x2, w.y2);
      ctx.stroke();
      ctx.restore();
    }

    // 9. Vẽ Chặng 7: Vạch đích ca-rô
    drawFinishLine(ctx, world.width, world.stageY.finish);

    // 10. Vẽ tất cả các viên bi với ảnh & tên bay theo
    for (const m of world.marbles) {
      drawMarble(ctx, m);
    }

    ctx.restore();

    // 11. Vẽ thông báo đếm ngược xuất phát trên đỉnh
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

  // Vẽ chữ mờ tên các chặng
  const drawStageLabels = (ctx, world) => {
    ctx.save();
    ctx.font = '900 24px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.textAlign = 'center';

    ctx.fillText('VÙNG NẤM NẢY', world.width / 2, world.stageY.mushrooms + 30);
    ctx.fillText('CẦN GẠT PINBALL', world.width / 2, world.stageY.pinball + 30);
    ctx.fillText('CỬA CHỜ', world.width / 2, world.stageY.waitingGate + 30);
    ctx.fillText('THANH BAY DỐC', world.width / 2, world.stageY.flyingBars + 30);
    ctx.fillText('PHỄU CỔ CHAI', world.width / 2, world.stageY.funnel + 30);
    ctx.restore();
  };

  // Vẽ Cổng xuất phát
  const drawStartGate = (ctx, world) => {
    ctx.save();
    const gateY = world.stageY.start + 290;
    const progress = world.startGateProgress;

    if (progress < 1) {
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 10;
      ctx.shadowColor = '#F43F5E';
      ctx.shadowBlur = 12;

      const midX = world.width / 2;
      const openOffset = (world.width / 2 - 40) * progress;

      // Cánh cổng trái
      ctx.beginPath();
      ctx.moveTo(35, gateY);
      ctx.lineTo(midX - openOffset, gateY);
      ctx.stroke();

      // Cánh cổng phải
      ctx.beginPath();
      ctx.moveTo(world.width - 35, gateY);
      ctx.lineTo(midX + openOffset, gateY);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Vẽ Cửa chờ
  const drawWaitingGate = (ctx, world) => {
    ctx.save();
    const gateY = world.stageY.waitingGate + 80;
    const progress = world.waitingGateProgress;

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

  // Vẽ Vạch đích ca-rô
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

    // Chữ "🏁 ĐÍCH"
    ctx.font = '900 22px system-ui, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#FBBF24';
    ctx.shadowBlur = 10;
    ctx.textAlign = 'left';
    ctx.fillText('🏁 ĐÍCH', trackW * 0.58, y + 22);
    ctx.restore();
  };

  // Vẽ viên bi tròn với ảnh học sinh & hiệu ứng Nitro Boost (Chuẩn Ảnh 4 & 5)
  const drawMarble = (ctx, m) => {
    ctx.save();

    // ★ HIỆU ỨNG NITRO BOOST: Vệt hào quang lửa vàng cam cho bi lội ngược dòng
    if (m.isBoosting) {
      ctx.save();
      // Quầng lửa bao quanh
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.radius + 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.45)';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 22;
      ctx.fill();

      // Đuôi lửa phóng ngược lên phía trên
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

    // Vòng phát sáng của bi
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius + 2, 0, Math.PI * 2);
    ctx.fillStyle = m.color;
    ctx.shadowColor = m.isBoosting ? '#F59E0B' : m.color;
    ctx.shadowBlur = m.isBoosting ? 18 : 8;
    ctx.fill();

    // Vùng ảnh học sinh
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

    // Nếu không có ảnh -> vẽ màu và chữ viết tắt
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

    // Tên học sinh hiển thị cạnh viên bi (Chuẩn Ảnh 4 & 5)
    ctx.save();
    ctx.font = '800 11px system-ui, sans-serif';
    ctx.fillStyle = m.isBoosting ? '#FDE047' : '#FFFFFF';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 5;
    ctx.textAlign = 'center';
    const shortName = m.name.split(' ').slice(-2).join(' ');
    ctx.fillText(m.isBoosting ? `🔥 ${shortName}` : shortName, m.x, m.y - m.radius - 4);
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
      {/* 1. Thanh Top Banner: Thông báo số bi xuất phát & Đồng hồ (Chuẩn Ảnh 4) */}
      <div className="h-14 px-5 border-b border-purple-900/40 bg-[#0B0F2B]/90 backdrop-blur-md flex items-center justify-between text-white z-20">
        
        {/* Banner Xuất phát */}
        <div className="flex items-center space-x-2.5">
          <span className="text-xl">🎤</span>
          <span className="text-xs sm:text-sm font-black text-purple-200">
            {participants.length} viên bi đã xuất phát!
          </span>
        </div>

        {/* Đồng hồ bấm giờ to & Về đích (Chuẩn Ảnh 4 & 5) */}
        <div className="flex items-center space-x-3">
          {/* Hiển thị trạng thái đồng hồ: Khi có người về nhất thì DỪNG CỐ ĐỊNH và đổi màu xanh lá */}
          <div className={`text-xl sm:text-2xl font-mono font-black tracking-wider transition-colors ${
            firstWinner ? 'text-emerald-400' : 'text-yellow-400'
          }`}>
            {raceTime.toFixed(2)}s
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

      {/* 2. Khung Nội Dung Chính: Canvas Đường Đua Mở Rộng (Trái) & Bảng Xếp Hạng (Phải) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Khu vực Canvas 2D Mở rộng 1060px */}
        <div className="flex-1 flex items-center justify-center p-2 bg-[#0B0F2B] overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={1060}
            height={860}
            className="w-full h-full max-w-[1060px] max-h-[860px] object-contain rounded-2xl shadow-2xl"
          />

          {/* Banner Người Về Nhất ở chân màn hình (Chuẩn Ảnh 5) */}
          {firstWinner && (
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-30 animate-in slide-in-from-bottom duration-300">
              <div className="px-6 py-3.5 rounded-full bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white shadow-2xl border-2 border-amber-300 flex items-center space-x-4">
                {/* Avatar Người về nhất */}
                <div className="w-11 h-11 rounded-full border-2 border-white overflow-hidden bg-white/20 shrink-0 shadow-md">
                  {firstWinner.avatar ? (
                    <img src={firstWinner.avatar} alt="winner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-black">
                      {firstWinner.initials}
                    </div>
                  )}
                </div>

                {/* Tiêu đề & Tên */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-yellow-200 flex items-center space-x-1">
                    <Trophy className="w-4 h-4 fill-current inline text-yellow-300" />
                    <span>VỀ NHẤT!</span>
                  </span>
                  <span className="text-sm font-extrabold text-white">
                    {firstWinner.name}
                  </span>
                </div>

                {/* Nút Xem kết quả */}
                <button
                  type="button"
                  onClick={handleFinishEarly}
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-full shadow-lg flex items-center space-x-1.5 transition-all transform hover:scale-105 active:scale-95"
                >
                  <span>Xem kết quả</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cột Bảng Xếp Hạng & Điều Khiển Phía Phải (Chuẩn Ảnh 4) */}
        <div className="w-64 sm:w-72 border-l border-purple-900/40 bg-[#080C26] flex flex-col justify-between p-3 z-20">
          
          {/* Mini-map tiến độ 7 chặng (Chuẩn Ảnh 4) */}
          <div className="mb-2">
            <div className="h-3.5 rounded-full overflow-hidden flex border border-purple-800/60 p-0.5 bg-purple-950/40">
              {['#38BDF8', '#F43F5E', '#F59E0B', '#A855F7', '#06B6D4', '#EC4899', '#22C55E'].map((c, idx) => (
                <div key={idx} className="flex-1 h-full opacity-70" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          {/* BẢNG XẾP HẠNG 2 CỘT (Chuẩn Ảnh 4) */}
          <div className="flex-1 flex flex-col min-h-0">
            <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>BẢNG XẾP HẠNG</span>
            </h4>

            <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-1.5">
                {liveLeaderboard.map((m, idx) => {
                  const rank = idx + 1;
                  return (
                    <div
                      key={m.id}
                      className={`p-1.5 rounded-xl border flex items-center space-x-1.5 transition-all ${
                        rank === 1
                          ? 'bg-amber-400/20 border-amber-400 text-yellow-300'
                          : rank <= 3
                          ? 'bg-purple-900/30 border-purple-700 text-purple-200'
                          : 'bg-slate-900/40 border-slate-800 text-slate-300'
                      }`}
                    >
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
                      <span className="text-[11px] font-extrabold truncate">
                        {m.name.split(' ').pop()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cụm Điều Khiển Ở Góc Dưới Bên Phải (Chuẩn Ảnh 4) */}
          <div className="pt-2.5 border-t border-purple-900/40 space-y-2">
            {/* Hàng 1: Nút Âm thanh, Nhạc, Toàn màn hình */}
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

            {/* Hàng 2: Tốc độ x1, x2, x3 */}
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

            {/* Hàng 3: Chế độ Camera [Dẫn đầu] | [Top 10] */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>Camera:</span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setCameraMode('leader');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    cameraMode === 'leader'
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Dẫn đầu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setCameraMode('top10');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    cameraMode === 'top10'
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Top 10
                </button>
              </div>
            </div>

            {/* Hàng 4: Nút KẾT THÚC / XEM KẾT QUẢ */}
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
