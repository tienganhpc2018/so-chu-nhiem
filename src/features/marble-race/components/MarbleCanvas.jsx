import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  Music,
  Maximize2,
  Minimize2,
  Trophy,
  Flag,
  ArrowRight,
  Flame,
  Pause,
  Play,
  RotateCcw
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
  const lastTimeRef = useRef(null);
  const imageCacheRef = useRef(new Map());

  // UI State (Chuẩn Ảnh 4 & 5)
  const [raceTime, setRaceTime] = useState(0);
  const [finishedCount, setFinishedCount] = useState(0);
  const [firstWinner, setFirstWinner] = useState(null);
  const [liveLeaderboard, setLiveLeaderboard] = useState([]);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [cameraMode, setCameraMode] = useState('leader'); // 'leader' | 'top10'
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStartBanner, setShowStartBanner] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Khởi tạo World vật lý và Preload ảnh học sinh
  useEffect(() => {
    // Preload ảnh
    participants.forEach((p) => {
      const url = p.avatar || p.avatar_url;
      if (url && !imageCacheRef.current.has(url)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        imageCacheRef.current.set(url, img);
      }
    });

    const world = new MarblePhysicsWorld({
      width: 760,
      trackLength,
      students: participants,
      usePhotos: useStudentPhotos,
      timeScale: speedMultiplier
    });

    worldRef.current = world;

    // Tự động mở cổng xuất phát sau 1.2s
    const timer = setTimeout(() => {
      world.openStartGate();
      soundFx.playCorrect();
    }, 1200);

    // Ẩn chữ "XUẤT PHÁT!" sau 3.5s
    const bannerTimer = setTimeout(() => {
      setShowStartBanner(false);
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(bannerTimer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [trackLength, participants, useStudentPhotos]);

  // Cập nhật tốc độ vào world
  useEffect(() => {
    if (worldRef.current) {
      worldRef.current.timeScale = speedMultiplier;
    }
  }, [speedMultiplier]);

  // Vòng lặp Animation Loop 60fps
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
        world.update(deltaTime);

        // Kiểm tra người về nhất lần đầu
        if (world.finishList.length > 0 && !firstWinner) {
          const winner = world.finishList[0];
          setFirstWinner(winner);
          soundFx.playCorrect();
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.85 }
          });
        }

        // Cập nhật state nhẹ nhàng mỗi 100ms
        setRaceTime(world.raceTimer);
        setFinishedCount(world.finishedCount);
        setLiveLeaderboard(world.getLiveLeaderboard().slice(0, 22));
      }

      // Xóa và vẽ khung hình
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

    // Nền Dark Cosmic Navy (Chuẩn Ảnh 4 & 5)
    ctx.fillStyle = '#0B0F2B';
    ctx.fillRect(0, 0, W, H);

    // Dịch chuyển Camera
    ctx.translate(0, -targetCameraY);

    // 1. Vẽ 2 vách biên đường đua
    ctx.strokeStyle = '#1E295F';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(30, world.height);
    ctx.moveTo(world.width - 30, 0);
    ctx.lineTo(world.width - 30, world.height);
    ctx.stroke();

    // Viền phát sáng neon xanh biển
    ctx.strokeStyle = '#06B6D4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(30, world.height);
    ctx.moveTo(world.width - 30, 0);
    ctx.lineTo(world.width - 30, world.height);
    ctx.stroke();

    // 2. Vẽ Tiêu Đề Các Chặng (Text mờ tinh tế trên nền)
    drawStageLabels(ctx, world);

    // 3. Chặng 1: Cổng xuất phát
    const gateY = world.stageY.start + 300;
    if (world.startGateProgress < 1) {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 10;
      ctx.beginPath();
      // Hai thanh mở về 2 bên
      const offset = world.startGateProgress * (world.width / 2);
      ctx.moveTo(30, gateY);
      ctx.lineTo(world.width / 2 - offset, gateY);
      ctx.moveTo(world.width / 2 + offset, gateY);
      ctx.lineTo(world.width - 30, gateY);
      ctx.stroke();
    }

    // 4. Chặng 2: Nấm nảy (Bumpers)
    for (const b of world.bumpers) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + (b.pulse * 4), 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 12 * (1 + b.pulse * 2);
      ctx.fill();

      // Tâm trắng của nấm
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();
    }

    // 5. Chặng 3: Cần gạt Pinball (Spinners)
    for (const f of world.flippers) {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(world.flipperAngle * (f.speed > 0 ? 1 : -1));
      ctx.fillStyle = '#F59E0B';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 10;
      ctx.fillRect(-f.length / 2, -7, f.length, 14);
      // Trục tròn
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();
    }

    // 6. Chặng 4: Cửa chờ (Waiting Gate)
    const waitGateY = world.stageY.waitingGate + 80;
    if (world.waitingGateProgress < 1) {
      ctx.strokeStyle = '#EC4899';
      ctx.lineWidth = 10;
      ctx.beginPath();
      const openOffset = world.waitingGateProgress * (world.width / 2);
      ctx.moveTo(30, waitGateY);
      ctx.lineTo(world.width / 2 - openOffset, waitGateY);
      ctx.moveTo(world.width / 2 + openOffset, waitGateY);
      ctx.lineTo(world.width - 30, waitGateY);
      ctx.stroke();
    }

    // 7. Chặng 5: Thanh bay dốc (Cyan Slopes - Chuẩn Ảnh 4)
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

    // 8. Chặng 6: Phễu cổ chai (Pink Neon Funnel - Chuẩn Ảnh 5)
    for (const fw of world.funnelWalls) {
      ctx.save();
      ctx.strokeStyle = fw.color;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.shadowColor = fw.color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(fw.x1, fw.y1);
      ctx.lineTo(fw.x2, fw.y2);
      ctx.stroke();
      ctx.restore();
    }

    // 9. Chặng 7: Vạch Đích (Checkered Finish Line - Chuẩn Ảnh 5)
    const finishY = world.stageY.finish;
    drawFinishLine(ctx, world.width, finishY);

    // 10. Vẽ các viên bi học sinh (Marbles)
    for (const m of world.marbles) {
      drawMarble(ctx, m);
    }

    ctx.restore();

    // 11. Vẽ Chữ "XUẤT PHÁT!" lớn ở đầu cuộc đua (Chuẩn Ảnh 4)
    if (showStartBanner) {
      ctx.save();
      ctx.font = '900 68px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FACC15'; // Vàng rực rỡ
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
    ctx.fillText('THANH BAY', world.width / 2, world.stageY.flyingBars + 30);
    ctx.fillText('PHỄU CỔ CHAI', world.width / 2, world.stageY.funnel + 30);
    ctx.restore();
  };

  // Vẽ Vạch đích ca-rô
  const drawFinishLine = (ctx, trackW, y) => {
    ctx.save();
    const squareSize = 14;
    const startX = 30;
    const totalW = trackW - 60;
    const cols = Math.floor(totalW / squareSize);

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#FFFFFF' : '#000000';
        ctx.fillRect(startX + c * squareSize, y + r * squareSize, squareSize, squareSize);
      }
    }

    // Chữ "🏁 ĐÍCH"
    ctx.font = '900 20px system-ui, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#FBBF24';
    ctx.shadowBlur = 8;
    ctx.textAlign = 'left';
    ctx.fillText('🏁 ĐÍCH', trackW * 0.58, y + 20);
    ctx.restore();
  };

  // Vẽ viên bi tròn với ảnh học sinh & Tên bay theo (Chuẩn Ảnh 4 & 5)
  const drawMarble = (ctx, m) => {
    ctx.save();

    // Vòng phát sáng của bi
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius + 2, 0, Math.PI * 2);
    ctx.fillStyle = m.color;
    ctx.shadowColor = m.color;
    ctx.shadowBlur = 8;
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
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.textAlign = 'center';
    const shortName = m.name.split(' ').slice(-2).join(' ');
    ctx.fillText(shortName, m.x, m.y - m.radius - 4);
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
      raceTime: world.raceTimer
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
        <div className="flex items-center space-x-4">
          <div className="text-xl sm:text-2xl font-mono font-black text-yellow-400 tracking-wider">
            {raceTime.toFixed(2)}
          </div>
          <span className="px-3 py-1 bg-purple-950/80 border border-purple-800 rounded-xl text-xs font-black text-purple-200">
            VỀ ĐÍCH {finishedCount}/{participants.length}
          </span>
        </div>
      </div>

      {/* 2. Khung Nội Dung Chính: Canvas Đường Đua (Trái) & Bảng Xếp Hạng (Phải) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Khu vực Canvas 2D */}
        <div className="flex-1 flex items-center justify-center p-2 bg-[#0B0F2B] overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={760}
            height={820}
            className="w-full h-full max-w-[760px] max-h-[820px] object-contain rounded-2xl shadow-2xl"
          />

          {/* Banner Người Về Nhất ở chân màn hình (Chuẩn Ảnh 5) */}
          {firstWinner && (
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-30 animate-in slide-in-from-bottom duration-300">
              <div className="px-5 py-3 rounded-full bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white shadow-2xl border-2 border-amber-300 flex items-center space-x-3.5">
                {/* Avatar Người về nhất */}
                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-white/20 shrink-0">
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
                    <Trophy className="w-4 h-4 fill-current inline" />
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
                  className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-full shadow-md flex items-center space-x-1 transition-all transform hover:scale-105 active:scale-95"
                >
                  <span>Xem kết quả</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cột Bảng Xếp Hạng & Điều Khiển Phía Phải (Chuẩn Ảnh 4) */}
        <div className="w-72 sm:w-80 border-l border-purple-900/40 bg-[#080C26] flex flex-col justify-between p-3.5 z-20">
          
          {/* Mini-map tiến độ 7 chặng (Chuẩn Ảnh 4) */}
          <div className="mb-2.5">
            <div className="h-4 rounded-full overflow-hidden flex border border-purple-800/60 p-0.5 bg-purple-950/40">
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

            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
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
          <div className="pt-3 border-t border-purple-900/40 space-y-2.5">
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

            {/* Hàng 4: Nút đỏ lớn KẾT THÚC (Chuẩn Ảnh 4) */}
            <button
              type="button"
              onClick={handleFinishEarly}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
            >
              Kết thúc
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
