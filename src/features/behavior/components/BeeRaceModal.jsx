import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
  Settings,
  Shuffle,
  CheckCircle2,
  UserCheck,
  ListOrdered,
  Search,
  ChevronDown
} from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

// Trang phục và phụ kiện vịt đa dạng mô phỏng ảnh mẫu 2, 3, 4, 5
const DUCK_STYLES = [
  { type: 'snowman', bodyColor: '#E0F2FE', accessory: 'snowman_hat', name: 'Người tuyết #5' },
  { type: 'strawberry', bodyColor: '#EF4444', accessory: 'strawberry_stem', name: 'Dâu tây #24' },
  { type: 'bee', bodyColor: '#F59E0B', accessory: 'bee_antennae', name: 'Chú ong #16' },
  { type: 'mafia', bodyColor: '#78350F', accessory: 'mafia_shades', name: 'Mafia xì gà #15' },
  { type: 'pink_zigzag', bodyColor: '#F472B6', accessory: 'pink_chevron', name: 'Zigzag hồng #6' },
  { type: 'mohawk_purple', bodyColor: '#A855F7', accessory: 'purple_mohawk', name: 'Mohawk tím #32' },
  { type: 'blue_cap', bodyColor: '#FBBF24', accessory: 'blue_cap', name: 'Mũ lưỡi trai #28' },
  { type: 'spartan_green', bodyColor: '#10B981', accessory: 'spartan_helmet', name: 'Chiến binh #33' },
  { type: 'businessman', bodyColor: '#FBBF24', accessory: 'blonde_suit', name: 'Doanh nhân #34' },
  { type: 'brown_bear', bodyColor: '#92400E', accessory: 'bear_ears', name: 'Tai gấu #25' },
  { type: 'liberty_crown', bodyColor: '#38BDF8', accessory: 'crown', name: 'Nữ thần #8' },
  { type: 'classic_yellow', bodyColor: '#FBBF24', accessory: 'none', name: 'Vịt vàng kinh điển' },
  { type: 'cool_orange', bodyColor: '#FB923C', accessory: 'headband', name: 'Băng đô thể thao' },
  { type: 'mint_green', bodyColor: '#34D399', accessory: 'sunglasses', name: 'Kính râm hè' }
];

export const BeeRaceModal = ({
  isOpen,
  onClose,
  students = [],
  calledStudentIds = [],
  onConfirmCallStudent
}) => {
  // 1. STATE QUẢN LÝ
  const [raceState, setRaceState] = useState('ready'); // 'ready' | 'running' | 'paused' | 'finished'
  const [duration, setDuration] = useState(12); // thời gian đua mặc định 12s
  const [timeLeft, setTimeLeft] = useState(12);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [excludeCalled, setExcludeCalled] = useState(true);
  const [duckCount, setDuckCount] = useState(35);
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [winnerDuck, setWinnerDuck] = useState(null);
  const [rankedList, setRankedList] = useState([]);

  // 2. REFS
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const ducksRef = useRef([]);
  const raceParamsRef = useRef({
    startTime: 0,
    pausedTime: 0,
    elapsedBeforePause: 0,
    winnerId: null,
    fakeLeaderIds: [],
    ranksOrder: []
  });
  const timerIntervalRef = useRef(null);

  // 3. DANH SÁCH HỌC SINH THAM GIA
  const availableStudents = useMemo(() => {
    const list = Array.isArray(students) ? students : [];
    if (!excludeCalled || !calledStudentIds || calledStudentIds.length === 0) {
      return list;
    }
    const uncalled = list.filter(st => st && st.id && !calledStudentIds.includes(st.id));
    return uncalled.length > 0 ? uncalled : list;
  }, [students, calledStudentIds, excludeCalled]);

  // Cập nhật số vịt mặc định theo sĩ số học sinh
  useEffect(() => {
    if (availableStudents.length > 0) {
      setDuckCount(Math.min(availableStudents.length, 45));
    }
  }, [availableStudents.length]);

  // 4. HÀM KHỞI TẠO ĐÀN VỊT VÀO VẠCH XUẤT PHÁT
  const initializeDucks = useCallback(() => {
    const pool = availableStudents.length > 0 ? availableStudents : (Array.isArray(students) ? students : []);
    const count = Math.min(duckCount, Math.max(pool.length, 10));
    const newDucks = [];

    // Chọn danh sách học sinh (xáo trộn nếu cần)
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
      const student = shuffledPool[i % shuffledPool.length] || {
        id: `duck-st-${i + 1}`,
        full_name: `Học sinh #${i + 1}`
      };

      const styleDef = DUCK_STYLES[i % DUCK_STYLES.length];

      newDucks.push({
        id: i + 1, // Số đeo nổi bật trên thân vịt (#1, #2, #5, #15, #24...)
        student,
        name: student.full_name || `Học sinh #${i + 1}`,
        color: styleDef.bodyColor,
        style: styleDef,
        startSlant: ((i % 12) / 12) * 35, // Độ nghiêng nhẹ theo vạch kẻ caro
        laneRatio: i / Math.max(1, count - 1), // Tỉ lệ phân bố làn đường từ trên xuống dưới
        x: 0,
        y: 0,
        targetRank: i + 1,
        bubbles: [],
        wiggleOffset: (i * 0.7) % (Math.PI * 2)
      });
    }

    ducksRef.current = newDucks;
    setWinnerDuck(null);
    setRankedList([]);
    setRaceState('ready');
    setTimeLeft(duration);
  }, [availableStudents, students, duckCount, duration]);

  // Khởi tạo khi mở modal hoặc thay đổi danh sách
  useEffect(() => {
    if (isOpen) {
      initializeDucks();
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      soundFx.stopRaceAudio();
      setRaceState('ready');
      setShowLeaderboard(false);
      setShowSettings(false);
    }
  }, [isOpen, initializeDucks]);

  // 5. HÀM VẼ CHÚ VỊT HOẠT HỌA CHUẨN ĐỒ HỌA (THEO ẢNH 2, 3, 4, 5)
  const drawCartoonDuck = (ctx, d, isWinnerHighlight = false, progress = 0, isAccelerating = false) => {
    ctx.save();
    ctx.translate(d.x, d.y);

    const scale = isWinnerHighlight ? 1.5 : 0.95;
    ctx.scale(scale, scale);

    // Vệt bọt nước bứt tốc (Turbo Wake Bubbles ở 3s cuối)
    if (isAccelerating) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let b = 1; b <= 4; b++) {
        ctx.beginPath();
        ctx.arc(-20 - b * 7, Math.sin(Date.now() / 60 + b) * 4, 3 + b * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Gợn sóng nước lăn tăn dưới thân vịt
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.beginPath();
    if (ctx.ellipse) {
      ctx.ellipse(-2, 11, 17, 5.5, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(-2, 11, 8, 0, Math.PI * 2);
    }
    ctx.fill();

    // 1. Thân vịt
    ctx.fillStyle = d.color || '#FBBF24';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Đuôi vịt vểnh nhọn ngộ nghĩnh
    ctx.beginPath();
    ctx.moveTo(-11, 2);
    ctx.lineTo(-20, -5);
    ctx.lineTo(-13, 7);
    ctx.closePath();
    ctx.fillStyle = d.color || '#FBBF24';
    ctx.fill();
    ctx.stroke();

    // 3. Đầu vịt
    ctx.beginPath();
    ctx.arc(11, -5, 9.5, 0, Math.PI * 2);
    ctx.fillStyle = d.color || '#FBBF24';
    ctx.fill();
    ctx.stroke();

    // 4. Mỏ vịt màu cam tươi
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.moveTo(18, -5);
    ctx.lineTo(28, -3);
    ctx.lineTo(18, -1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 5. Mắt hoạt hình to tròn
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(13.5, -7.5, 2.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(14.2, -8.2, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // 6. TRANG PHỤC & PHỤ KIỆN ĐẶC BIỆT (Ảnh 3, 4, 5)
    const acc = d.style?.accessory;
    if (acc === 'snowman_hat') {
      // Mũ len tuyết xanh + Khăn quàng đỏ (#5)
      ctx.fillStyle = '#0284C7';
      ctx.fillRect(7, -18, 9, 6);
      ctx.fillRect(4, -13, 15, 2.5);
      ctx.fillStyle = '#EF4444'; // khăn quàng
      ctx.fillRect(4, 2, 10, 4);
    } else if (acc === 'strawberry_stem') {
      // Cuống lá dâu tây xanh (#24)
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.moveTo(11, -14);
      ctx.lineTo(8, -19);
      ctx.lineTo(13, -16);
      ctx.lineTo(16, -19);
      ctx.closePath();
      ctx.fill();
    } else if (acc === 'mafia_shades') {
      // Kính râm đen + Xì gà (#15)
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(9, -9, 11, 4.5);
      ctx.fillStyle = '#78350F';
      ctx.fillRect(20, -3, 6, 2.2); // xì gà
    } else if (acc === 'bee_antennae') {
      // Râu chú ong (#16)
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(11, -14);
      ctx.lineTo(10, -20);
      ctx.moveTo(13, -14);
      ctx.lineTo(15, -20);
      ctx.stroke();
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(10, -20, 2, 0, Math.PI * 2);
      ctx.arc(15, -20, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (acc === 'purple_mohawk') {
      // Tóc dựng Mohawk tím punk (#32)
      ctx.fillStyle = '#9333EA';
      ctx.beginPath();
      ctx.moveTo(6, -13);
      ctx.lineTo(8, -21);
      ctx.lineTo(11, -14);
      ctx.lineTo(13, -21);
      ctx.lineTo(15, -13);
      ctx.closePath();
      ctx.fill();
    } else if (acc === 'blue_cap') {
      // Mũ lưỡi trai xanh thể thao (#28)
      ctx.fillStyle = '#2563EB';
      ctx.beginPath();
      ctx.arc(11, -11, 7, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(11, -11, 10, 2.5); // lưỡi trai
    } else if (acc === 'crown' || isWinnerHighlight) {
      // Vương miện hoàng gia vàng
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.moveTo(6, -13);
      ctx.lineTo(8, -20);
      ctx.lineTo(11, -15);
      ctx.lineTo(14, -20);
      ctx.lineTo(16, -13);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 7. HUY HIỆU SỐ TRÒN MÀU TRẮNG VIỀN ĐEN TRÊN THÂN VỊT (Ảnh 3, 4, 5)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(-8, -4, 15, 11, 3.5);
    } else {
      ctx.rect(-8, -4, 15, 11);
    }
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 9px monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(d.id), -0.5, 1.8);

    // 8. TÊN HỌC SINH (Bảng tên bo góc rõ nét, không bị chồng chéo)
    const displayName = d.name.length > 13 ? d.name.substring(0, 12) + '…' : d.name;
    const nameWidth = Math.max(displayName.length * 6.5, 42);

    ctx.fillStyle = isWinnerHighlight ? 'rgba(234, 88, 12, 0.95)' : 'rgba(15, 23, 42, 0.75)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(-nameWidth / 2 + 3, -29, nameWidth, 13, 4);
    } else {
      ctx.rect(-nameWidth / 2 + 3, -29, nameWidth, 13);
    }
    ctx.fill();

    ctx.fillStyle = isWinnerHighlight ? '#FEF08A' : '#FFFFFF';
    ctx.font = isWinnerHighlight ? 'bold 11px sans-serif' : 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayName, 3, -22.5);

    ctx.restore();
  };

  // 6. VẼ VẠCH CỜ CARO NGHIÊNG (SLANTED CHECKERED LINE - Ảnh 2 & 5)
  const drawSlantedCheckeredLine = (ctx, topX, bottomX, topY, bottomY) => {
    ctx.save();
    const numTiles = 24;
    const lineWidth = 24;

    for (let i = 0; i < numTiles; i++) {
      const r1 = i / numTiles;
      const r2 = (i + 1) / numTiles;
      const x1 = topX + r1 * (bottomX - topX);
      const y1 = topY + r1 * (bottomY - topY);
      const x2 = topX + r2 * (bottomX - topX);
      const y2 = topY + r2 * (bottomY - topY);

      // Ô caro 1 (nửa trái)
      ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : '#0F172A';
      ctx.beginPath();
      ctx.moveTo(x1 - lineWidth / 2, y1);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2 - lineWidth / 2, y2);
      ctx.closePath();
      ctx.fill();

      // Ô caro 2 (nửa phải)
      ctx.fillStyle = i % 2 === 0 ? '#0F172A' : '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + lineWidth / 2, y1);
      ctx.lineTo(x2 + lineWidth / 2, y2);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.fill();
    }

    // Viền đen sắc nét
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(topX - lineWidth / 2, topY);
    ctx.lineTo(bottomX - lineWidth / 2, bottomY);
    ctx.moveTo(topX + lineWidth / 2, topY);
    ctx.lineTo(bottomX + lineWidth / 2, bottomY);
    ctx.stroke();

    ctx.restore();
  };

  // 7. VÒNG LẶP RENDER CANVAS CHÍNH
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const bankHeight = 54;
    const riverHeight = height - bankHeight;

    const render = () => {
      // A. Vẽ Bãi Cỏ Phía Trên (Ảnh 2, 3, 4, 5)
      ctx.fillStyle = '#22C55E';
      ctx.fillRect(0, 0, width, 42);

      // Bụi cây tròn trên bãi cỏ
      ctx.fillStyle = '#15803D';
      [60, 180, 310, 480, 640, 780, 890].forEach(bx => {
        ctx.beginPath();
        ctx.arc(bx, 28, 14, 0, Math.PI * 2);
        ctx.arc(bx + 12, 25, 11, 0, Math.PI * 2);
        ctx.arc(bx - 10, 26, 10, 0, Math.PI * 2);
        ctx.fill();
      });

      // B. Bờ Đất Ven Sông (Màu nâu gạch)
      ctx.fillStyle = '#854D0E';
      ctx.fillRect(0, 42, width, 12);
      ctx.fillStyle = '#451A03';
      ctx.fillRect(0, 53, width, 2);

      // C. Làn Nước Sông Xanh Biếc Hoạt Hình
      const waterGrad = ctx.createLinearGradient(0, bankHeight, 0, height);
      waterGrad.addColorStop(0, '#0284C7');
      waterGrad.addColorStop(0.4, '#0369A1');
      waterGrad.addColorStop(1, '#075985');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, bankHeight, width, riverHeight);

      // Gợn sóng nước uốn lượn trôi ngang
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.45)';
      ctx.lineWidth = 1.4;
      const waveOffset = (Date.now() / 35) % 48;
      for (let y = bankHeight + 22; y < height; y += 36) {
        ctx.beginPath();
        for (let x = -48; x < width + 48; x += 44) {
          ctx.arc(x + waveOffset, y, 11, 0, Math.PI);
        }
        ctx.stroke();
      }

      // Vị trí chuẩn của vạch xuất phát và vạch đích
      const startSlantTopX = 145;
      const startSlantBottomX = 195;
      const finishSlantTopX = width - 110;
      const finishSlantBottomX = width - 60;

      // D. TRẠNG THÁI 1: READY (VÀO VẠCH XUẤT PHÁT - Ảnh 2)
      if (raceState === 'ready') {
        // Vẽ vạch cờ xuất phát
        drawSlantedCheckeredLine(ctx, startSlantTopX, startSlantBottomX, bankHeight, height);

        // Đàn vịt xếp hàng dọc theo vạch nghiêng ở bên trái
        ducksRef.current.forEach((d) => {
          const laneY = bankHeight + 25 + d.laneRatio * (riverHeight - 50);
          d.laneY = laneY;
          d.x = startSlantTopX - 45 - d.startSlant * 0.7;
          d.y = laneY;
          drawCartoonDuck(ctx, d, false);
        });
      }

      // E. TRẠNG THÁI 2: RUNNING & PAUSED (ĐUA SÔI ĐỘNG - Ảnh 3, 4, 5)
      else if (raceState === 'running' || raceState === 'paused') {
        const { startTime, elapsedBeforePause, winnerId } = raceParamsRef.current;
        const currentElapsed = raceState === 'paused'
          ? elapsedBeforePause
          : (Date.now() - startTime + elapsedBeforePause);

        const totalDurationMs = duration * 1000;
        const progress = Math.min(currentElapsed / totalDurationMs, 1.0);

        // VẠCH ĐÍCH CHỈ XUẤT HIỆN Ở 3-4 GIÂY CUỐI (progress >= 0.72 - Ảnh 5)
        if (progress >= 0.72) {
          drawSlantedCheckeredLine(ctx, finishSlantTopX, finishSlantBottomX, bankHeight, height);
        }

        // Vẽ từng chú vịt với tọa độ tính toán theo tiến trình
        ducksRef.current.forEach((d) => {
          const isWinner = d.id === winnerId;
          const isAccelerating = isWinner && progress >= 0.72;
          drawCartoonDuck(ctx, d, false, progress, isAccelerating);
        });
      }

      // F. TRẠNG THÁI 3: FINISHED (KẾT THÚC - QUÁN QUÂN NỔI BẬT)
      else if (raceState === 'finished') {
        // Vẽ vạch đích cố định
        drawSlantedCheckeredLine(ctx, finishSlantTopX, finishSlantBottomX, bankHeight, height);

        // Vẽ các vịt ở vị trí sau khi cán đích
        ducksRef.current.forEach((d) => {
          const isWinner = d.targetRank === 1;
          drawCartoonDuck(ctx, d, isWinner, 1.0, false);
        });
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, raceState, duration]);

  // 8. THUẬT TOÁN "MẸO LỪA & BỨT PHÁ GIẤU MẶT" (KỊCH TÍNH 100%)
  const handleStartRace = () => {
    soundFx.playClick();
    if (raceState === 'paused') {
      // Tiếp tục đua sau khi tạm dừng
      setRaceState('running');
      raceParamsRef.current.startTime = Date.now();
      if (!isMuted) soundFx.startRaceAudio();
      return;
    }

    const totalDucks = ducksRef.current.length;
    if (totalDucks === 0) return;

    // Chọn NGẪU NHIÊN 1 KẺ GIẤU MẶT SẼ VỀ NHẤT (Winner)
    const winnerIdx = Math.floor(Math.random() * totalDucks);
    const chosenWinner = ducksRef.current[winnerIdx];

    // Chọn 2 CHÚ VỊT "CHIM MỒI" (Dẫn đầu suốt 70% chặng đua nhưng hụt hơi ở cuối)
    const otherDucks = ducksRef.current.filter(d => d.id !== chosenWinner.id);
    const shuffledOthers = [...otherDucks].sort(() => Math.random() - 0.5);
    const fakeLeader1 = shuffledOthers[0];
    const fakeLeader2 = shuffledOthers[1];

    // Tạo bảng xếp hạng thứ tự về đích dự kiến (1st, 2nd, 3rd... N-th)
    const assignedRanks = [chosenWinner, ...shuffledOthers];
    assignedRanks.forEach((d, idx) => {
      d.targetRank = idx + 1;
    });

    raceParamsRef.current = {
      startTime: Date.now(),
      pausedTime: 0,
      elapsedBeforePause: 0,
      winnerId: chosenWinner.id,
      fakeLeaderIds: [fakeLeader1?.id, fakeLeader2?.id].filter(Boolean),
      ranksOrder: assignedRanks
    };

    setWinnerDuck(chosenWinner);
    setRaceState('running');
    setTimeLeft(duration);
    setShowLeaderboard(false);
    setShowSettings(false);

    if (!isMuted) {
      soundFx.startRaceAudio();
    }

    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 960;
    const startX = 145;
    const finishX = width - 110;
    const trackDistance = finishX - startX;
    const totalDurationMs = duration * 1000;

    // Timer đếm ngược từng giây
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Vòng lặp cập nhật vật lý mượt mà (Physics Simulation Engine)
    const physicsInterval = setInterval(() => {
      if (raceState === 'paused') return;

      const { startTime, elapsedBeforePause, winnerId, fakeLeaderIds } = raceParamsRef.current;
      const elapsed = Date.now() - startTime + elapsedBeforePause;
      const progress = Math.min(elapsed / totalDurationMs, 1.0);

      ducksRef.current.forEach((d) => {
        let normalizedX = 0;
        const isWinner = d.id === winnerId;
        const isFakeLeader = fakeLeaderIds.includes(d.id);

        // THUẬT TOÁN ĐƯỜNG CONG VẬN TỐC (SPEED CURVES):
        if (isFakeLeader) {
          // Chim mồi: Vọt lên dẫn đầu cực nhanh ở 65% chặng đua đầu, sau đó đuối sức
          if (progress < 0.65) {
            normalizedX = Math.pow(progress / 0.65, 0.82) * 0.74;
          } else {
            normalizedX = 0.74 + ((progress - 0.65) / 0.35) * 0.21; // Về đích ở ~0.95 (hạng 2 hoặc 3)
          }
        } else if (isWinner) {
          // Kẻ giấu mặt (Quán quân):
          // Giai đoạn 1 (0 -> 40%): Bơi lững lờ ở tốp sau
          if (progress < 0.40) {
            normalizedX = (progress / 0.40) * 0.24;
          }
          // Giai đoạn 2 (40% -> 72%): Nhẹ nhàng tiến lên áp sát tốp đầu
          else if (progress < 0.72) {
            normalizedX = 0.24 + ((progress - 0.40) / 0.32) * 0.38; // Đến 62% đường
          }
          // Giai đoạn 3 (72% -> 100%): BỨT TỐC THẦN SẦU VƯỢT MẶT Ở GIÂY CUỐI!
          else {
            const sprintRatio = (progress - 0.72) / 0.28;
            normalizedX = 0.62 + Math.pow(sprintRatio, 1.35) * 0.43; // Cán đích ở 1.05
          }
        } else {
          // Toàn bộ các vịt khác: So kè nhau liên tục bằng hàm sin dao động
          const rankWeight = (totalDucks - d.targetRank) / totalDucks;
          const targetFinalX = 0.84 + rankWeight * 0.12;
          const jitter = Math.sin(elapsed / 250 + d.wiggleOffset) * 0.025;
          normalizedX = Math.max(0, Math.min(progress * targetFinalX + jitter, targetFinalX));
        }

        // Cập nhật vị trí X và dao động Y bơi lội
        d.x = startX + normalizedX * trackDistance + d.startSlant * (1 - progress);
        d.y = d.laneY + Math.sin(Date.now() / 160 + d.wiggleOffset) * 3.5;
      });

      // KHI CUỘC ĐUA KẾT THÚC (progress >= 1.0)
      if (progress >= 1.0) {
        clearInterval(physicsInterval);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        soundFx.stopRaceAudio();

        // Sắp xếp thứ tự về đích thực tế dựa trên vị trí X cuối cùng
        const finalSorted = [...ducksRef.current].sort((a, b) => b.x - a.x);
        finalSorted.forEach((d, idx) => {
          d.targetRank = idx + 1;
        });

        ducksRef.current = finalSorted;
        setRankedList(finalSorted);
        setWinnerDuck(finalSorted[0]);
        setRaceState('finished');
        setTimeLeft(0);

        if (!isMuted) {
          soundFx.playWinner();
          soundFx.playFanfare();
        }

        // Bắn pháo hoa ăn mừng
        confetti({
          particleCount: 140,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#FBBF24', '#EF4444', '#10B981', '#38BDF8', '#EC4899']
        });
      }
    }, 35);
  };

  // Tạm dừng cuộc đua
  const handlePauseRace = () => {
    soundFx.playClick();
    if (raceState === 'running') {
      setRaceState('paused');
      const elapsed = Date.now() - raceParamsRef.current.startTime + raceParamsRef.current.elapsedBeforePause;
      raceParamsRef.current.elapsedBeforePause = elapsed;
      soundFx.stopRaceAudio();
    }
  };

  // Làm mới lại cuộc đua
  const handleClearRace = () => {
    soundFx.playClick();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    soundFx.stopRaceAudio();
    initializeDucks();
  };

  // Xáo trộn vịt (Shuffle)
  const handleShuffle = () => {
    soundFx.playClick();
    handleClearRace();
  };

  // Bật/tắt âm thanh
  const handleToggleSound = () => {
    if (!isMuted) {
      soundFx.stopRaceAudio();
      setIsMuted(true);
    } else {
      setIsMuted(false);
      if (raceState === 'running') soundFx.startRaceAudio();
    }
  };

  // Xác nhận gọi học sinh chiến thắng lên bảng trả bài
  const handleConfirmCallWinner = (student) => {
    soundFx.playClick();
    if (student?.id) {
      onConfirmCallStudent?.(student.id);
    }
    onClose?.();
  };

  // Lọc danh sách trong bảng xếp hạng thứ tự
  const filteredLeaderboard = useMemo(() => {
    if (!leaderboardSearch.trim()) return rankedList;
    const q = leaderboardSearch.toLowerCase();
    return rankedList.filter(d =>
      (d.name && d.name.toLowerCase().includes(q)) ||
      String(d.id).includes(q)
    );
  }, [rankedList, leaderboardSearch]);

  // Hàm chuyển đổi số thứ tự chuẩn 1st, 2nd, 3rd, 4th...
  const formatOrdinalRank = (rank) => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
  };

  // NẾU MODAL CHƯA MỞ THÌ RETURN NULL SAU KHI ĐÃ GỌI TẤT CẢ HOOKS HỢP LỆ
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border-4 border-amber-400 rounded-[2.5rem] shadow-2xl p-3 sm:p-5 text-white flex flex-col justify-between min-h-[640px] overflow-hidden">

        {/* 1. TOP STOPWATCH CONTROL BAR (Mô phỏng chuẩn ảnh 2, 3, 4, 5) */}
        <div className="w-full flex items-center justify-between pb-2 border-b border-amber-500/30">

          {/* Cụm nút điều khiển bên trái */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Nút Cài đặt */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                title="Cài đặt cuộc đua"
                className={`p-2 rounded-xl border transition-all ${
                  showSettings ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Popover Menu Cài Đặt */}
              {showSettings && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-slate-900 border-2 border-amber-400 rounded-2xl shadow-2xl p-4 z-50 space-y-3 animate-in zoom-in-95">
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">Cài Đặt Đường Đua</h4>

                  {/* Thời gian đua */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">Thời gian đếm ngược:</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[8, 12, 15, 20].map(t => (
                        <button
                          key={t}
                          onClick={() => {
                            soundFx.playClick();
                            setDuration(t);
                            setTimeLeft(t);
                            handleClearRace();
                          }}
                          className={`py-1.5 rounded-lg text-xs font-black border ${
                            duration === t ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {t}s
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Số lượng vịt tham gia */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                      <span>Số vịt tham gia:</span>
                      <span className="text-amber-300">{duckCount} vịt</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={Math.max(45, (students || []).length || 35)}
                      value={duckCount}
                      onChange={(e) => {
                        setDuckCount(Number(e.target.value));
                      }}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  {/* Loại trừ học sinh đã gọi */}
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer pt-1 border-t border-slate-800">
                    <input
                      type="checkbox"
                      checked={excludeCalled}
                      onChange={(e) => setExcludeCalled(e.target.checked)}
                      className="rounded accent-amber-400"
                    />
                    <span>Ưu tiên em chưa lên trả bài</span>
                  </label>
                </div>
              )}
            </div>

            {/* Nút Âm thanh */}
            <button
              onClick={handleToggleSound}
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
              className={`p-2 rounded-xl border transition-all ${
                isMuted ? 'bg-slate-800 text-red-400 border-slate-700' : 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Nút Xáo trộn (Shuffle) */}
            <button
              onClick={handleShuffle}
              title="Xáo trộn vị trí vịt"
              disabled={raceState === 'running'}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 transition-all"
            >
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Nút Start / Pause */}
            {raceState === 'ready' && (
              <button
                onClick={handleStartRace}
                className="px-3.5 sm:px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center space-x-1.5 transform hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>START (XUẤT PHÁT)</span>
              </button>
            )}

            {raceState === 'running' && (
              <button
                onClick={handlePauseRace}
                className="px-3.5 sm:px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
              >
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>PAUSE</span>
              </button>
            )}

            {raceState === 'paused' && (
              <button
                onClick={handleStartRace}
                className="px-3.5 sm:px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>CONTINUE</span>
              </button>
            )}

            {/* Nút Clear / Đua Lại */}
            <button
              onClick={handleClearRace}
              title="Làm mới lại đường đua"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CLEAR</span>
            </button>
          </div>

          {/* ĐỒNG HỒ DIGITAL TRUNG TÂM (Chuẩn Stopwatch Ảnh 2, 3, 4, 5) */}
          <div className="bg-slate-100 border-4 border-slate-950 px-4 sm:px-8 py-0.5 rounded-2xl shadow-xl flex items-center justify-center">
            <span className="font-mono text-2xl sm:text-4xl font-black text-slate-950 tracking-wider">
              00:00:{String(timeLeft).padStart(2, '0')}
            </span>
          </div>

          {/* Nhóm nút bên phải: Cúp thứ hạng & Nút đóng */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowLeaderboard(true);
              }}
              title="Xem thứ hạng toàn bộ lớp (1st -> Cuối)"
              className="p-2 sm:px-3 sm:py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
              <span className="hidden md:inline">THỨ HẠNG</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 2. KHU VỰC CANVAS SÔNG NƯỚC ĐUA VỊT */}
        <div className="relative w-full flex-1 my-2 rounded-3xl overflow-hidden border-3 border-sky-400 shadow-2xl bg-sky-900 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={960}
            height={430}
            className="w-full h-full block object-cover select-none"
          />

          {/* Dòng trạng thái kịch tính */}
          {raceState === 'running' && timeLeft <= 4 && timeLeft > 0 && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-red-600/90 text-white font-black text-xs sm:text-sm rounded-full shadow-lg border-2 border-yellow-300 animate-bounce flex items-center space-x-1.5 z-20">
              <span>⚡ KẺ GIẤU MẶT ĐANG BỨT TỐC THẦN SẦU!</span>
            </div>
          )}
        </div>

        {/* 3. KHU VỰC THÔNG BÁO QUÁN QUÂN LÊN BẢNG TRẢ BÀI (KHÔNG TẶNG SAO) */}
        {raceState === 'finished' && winnerDuck && (
          <div className="w-full bg-slate-800/95 border-2 border-amber-400 p-3 sm:p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in zoom-in-95">
            <div className="flex items-center space-x-3 text-left w-full sm:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
                1st
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                    🎯 ĐẠI DIỆN LÊN BẢNG TRẢ BÀI:
                  </span>
                  <span className="text-[11px] bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-400/40">
                    Vịt #{winnerDuck.id}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {winnerDuck.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => handleConfirmCallWinner(winnerDuck.student)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center space-x-1.5 transition-all"
              >
                <UserCheck className="w-4 h-4 stroke-[2.5]" />
                <span>XÁC NHẬN GỌI EM NÀY</span>
              </button>

              <button
                onClick={() => setShowLeaderboard(true)}
                className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
              >
                <ListOrdered className="w-4 h-4" />
                <span>XEM THỨ TỰ (1st - CUỐI)</span>
              </button>

              <button
                onClick={handleClearRace}
                className="px-3.5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 4. MODAL BẢNG THỨ TỰ TOÀN BỘ LỚP (1st, 2nd, 3rd... đến cuối cùng) */}
        {showLeaderboard && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md rounded-[2.5rem] p-4 sm:p-6 flex flex-col justify-between animate-in zoom-in-95 border-3 border-amber-400">
            {/* Header Leaderboard */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-amber-400" />
                <h4 className="font-black text-base sm:text-lg text-amber-300">
                  THỐNG KÊ THỨ HẠNG ĐUA VỊT (1st ĐẾN NGƯỜI CUỐI CÙNG)
                </h4>
              </div>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top 3 Dự Bị Highlights (Không tặng sao) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 my-3">
              <div className="p-2.5 sm:p-3 bg-amber-500/20 border-2 border-amber-400 rounded-2xl text-center">
                <span className="text-base sm:text-lg font-black text-amber-300">🥇 1st (Lên Bảng)</span>
                <span className="block font-black text-xs sm:text-sm text-white mt-1 truncate">
                  {rankedList[0]?.name || winnerDuck?.name || 'Đang cập nhật'}
                </span>
                <span className="text-[11px] text-amber-200 font-bold block">
                  Vịt #{rankedList[0]?.id || winnerDuck?.id || 1} • Chính thức
                </span>
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-400/20 border-2 border-slate-300 rounded-2xl text-center">
                <span className="text-base sm:text-lg font-black text-slate-200">🥈 2nd (Dự bị 1)</span>
                <span className="block font-black text-xs sm:text-sm text-white mt-1 truncate">
                  {rankedList[1]?.name || 'N/A'}
                </span>
                <span className="text-[11px] text-slate-300 font-bold block">
                  Vịt #{rankedList[1]?.id || 2} • Sẵn sàng
                </span>
              </div>

              <div className="p-2.5 sm:p-3 bg-amber-700/20 border-2 border-amber-600 rounded-2xl text-center">
                <span className="text-base sm:text-lg font-black text-amber-400">🥉 3rd (Dự bị 2)</span>
                <span className="block font-black text-xs sm:text-sm text-white mt-1 truncate">
                  {rankedList[2]?.name || 'N/A'}
                </span>
                <span className="text-[11px] text-amber-300 font-bold block">
                  Vịt #{rankedList[2]?.id || 3} • Sẵn sàng
                </span>
              </div>
            </div>

            {/* Ô tìm kiếm học sinh trong danh sách */}
            <div className="relative my-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên học sinh hoặc số đeo vịt..."
                value={leaderboardSearch}
                onChange={(e) => setLeaderboardSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 pl-9 pr-4 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Danh sách cuộn toàn bộ học sinh từ 1st đến cuối */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 max-h-56 custom-scrollbar my-2">
              {filteredLeaderboard.map((d, index) => {
                const rankNum = d.targetRank || (index + 1);
                const isFirst = rankNum === 1;
                const isSecond = rankNum === 2;
                const isThird = rankNum === 3;

                return (
                  <div
                    key={d.id}
                    className={`p-2 sm:p-2.5 rounded-xl flex items-center justify-between text-xs transition-all ${
                      isFirst
                        ? 'bg-amber-400/25 text-amber-200 font-black border-2 border-amber-400/70 shadow-md'
                        : isSecond
                        ? 'bg-slate-300/20 text-slate-200 font-bold border border-slate-300/40'
                        : isThird
                        ? 'bg-amber-700/20 text-amber-300 font-bold border border-amber-600/30'
                        : 'bg-slate-900/80 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-8 font-mono font-black text-center text-xs sm:text-sm ${
                        isFirst ? 'text-amber-400' : isSecond ? 'text-slate-200' : isThird ? 'text-amber-300' : 'text-slate-400'
                      }`}>
                        {formatOrdinalRank(rankNum)}
                      </span>
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {d.name}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                        Vịt số #{d.id}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        {isFirst ? '🎯 Lên bảng trả bài' : isSecond ? 'Dự bị 1' : isThird ? 'Dự bị 2' : 'Hoàn thành'}
                      </span>
                      {isFirst && (
                        <button
                          onClick={() => handleConfirmCallWinner(d.student)}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] rounded-lg shadow"
                        >
                          Chọn em này
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Bảng Thứ Tự */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Tổng cộng: {rankedList.length || ducksRef.current.length} học sinh tham gia</span>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
              >
                Đóng Bảng Thứ Hạng
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
