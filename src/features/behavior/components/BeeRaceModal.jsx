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
  Check
} from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

// Danh sách các loài vật đua thú vị theo yêu cầu của Thầy
const ANIMAL_TYPES = [
  { id: 'duck', label: 'Vịt Vàng', icon: '🐥', title: 'Đua Vịt 🐥' },
  { id: 'fish', label: 'Đàn Cá', icon: '🐟', title: 'Đua Cá 🐟' },
  { id: 'shrimp', label: 'Tôm Búng', icon: '🦐', title: 'Đua Tôm 🦐' },
  { id: 'squid', label: 'Mực Ống', icon: '🦑', title: 'Đua Mực 🦑' },
  { id: 'crab', label: 'Cua Biển', icon: '🦀', title: 'Đua Cua 🦀' }
];

// Bảng màu rực rỡ cho từng loài vật
const ANIMAL_PALETTES = {
  duck: ['#FBBF24', '#EF4444', '#10B981', '#38BDF8', '#A855F7', '#EC4899', '#FB923C', '#E0F2FE', '#92400E'],
  fish: ['#F97316', '#38BDF8', '#FACC15', '#EC4899', '#10B981', '#8B5CF6', '#EF4444', '#06B6D4', '#E2E8F0'],
  shrimp: ['#EF4444', '#F97316', '#FB7185', '#F43F5E', '#EA580C', '#0284C7', '#059669', '#D97706'],
  squid: ['#A855F7', '#EC4899', '#8B5CF6', '#38BDF8', '#F43F5E', '#6366F1', '#14B8A6', '#FBBF24'],
  crab: ['#DC2626', '#EA580C', '#E11D48', '#B91C1C', '#D97706', '#2563EB', '#0D9488', '#7C3AED']
};

export const BeeRaceModal = ({
  isOpen,
  onClose,
  students = [],
  calledStudentIds = [],
  onConfirmCallStudent
}) => {
  // 1. STATE QUẢN LÝ
  const [animalType, setAnimalType] = useState('duck'); // 'duck' | 'fish' | 'shrimp' | 'squid' | 'crab'
  const [raceState, setRaceState] = useState('ready'); // 'ready' | 'running' | 'paused' | 'finished'
  const [duration, setDuration] = useState(12); // 12s mặc định
  const [timeLeft, setTimeLeft] = useState(12);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [excludeCalled, setExcludeCalled] = useState(true);
  const [duckCount, setDuckCount] = useState(35);
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [winnerAnimal, setWinnerAnimal] = useState(null);
  const [rankedList, setRankedList] = useState([]);

  // 2. REFS
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const animalsRef = useRef([]);
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

  // Cập nhật số con vật mặc định theo sĩ số học sinh
  useEffect(() => {
    if (availableStudents.length > 0) {
      setDuckCount(Math.min(availableStudents.length, 45));
    }
  }, [availableStudents.length]);

  // 4. HÀM KHỞI TẠO CÁC CON VẬT VÀO VẠCH XUẤT PHÁT
  const initializeAnimals = useCallback(() => {
    const pool = availableStudents.length > 0 ? availableStudents : (Array.isArray(students) ? students : []);
    const count = Math.min(duckCount, Math.max(pool.length, 10));
    const palette = ANIMAL_PALETTES[animalType] || ANIMAL_PALETTES.duck;
    const newAnimals = [];

    // Xáo trộn danh sách học sinh
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
      const student = shuffledPool[i % shuffledPool.length] || {
        id: `st-${i + 1}`,
        full_name: `Học sinh #${i + 1}`
      };

      newAnimals.push({
        id: i + 1, // Số đeo nổi bật (#1, #2, #5, #11...)
        student,
        name: student.full_name || `Học sinh #${i + 1}`,
        color: palette[i % palette.length],
        type: animalType,
        startSlant: ((i % 12) / 12) * 35, // Nghiêng theo vạch kẻ caro
        laneRatio: i / Math.max(1, count - 1), // Phân bổ đều làn đường
        x: 0,
        y: 0,
        targetRank: i + 1,
        wiggleOffset: (i * 0.7) % (Math.PI * 2)
      });
    }

    animalsRef.current = newAnimals;
    setWinnerAnimal(null);
    setRankedList([]);
    setRaceState('ready');
    setTimeLeft(duration);
  }, [availableStudents, students, duckCount, duration, animalType]);

  // Khởi tạo khi mở modal hoặc đổi loài vật
  useEffect(() => {
    if (isOpen) {
      initializeAnimals();
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      soundFx.stopRaceAudio();
      setRaceState('ready');
      setShowLeaderboard(false);
      setShowSettings(false);
    }
  }, [isOpen, initializeAnimals]);

  // 5. CÁC HÀM VẼ CON VẬT TRÊN CANVAS (TO HƠN, RÕ HƠN, BẮT MẮT TỪ XA)

  // A. Vẽ VỊT VÀNG (Rubber Duck)
  const drawDuckShape = (ctx, d, isWinnerSolo) => {
    // 1. Thân vịt
    ctx.fillStyle = d.color || '#FBBF24';
    ctx.beginPath();
    ctx.arc(0, 0, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 2. Đuôi vịt vểnh nhọn
    ctx.beginPath();
    ctx.moveTo(-14, 2);
    ctx.lineTo(-26, -7);
    ctx.lineTo(-17, 9);
    ctx.closePath();
    ctx.fillStyle = d.color || '#FBBF24';
    ctx.fill();
    ctx.stroke();

    // 3. Đầu vịt
    ctx.beginPath();
    ctx.arc(14, -7, 13, 0, Math.PI * 2);
    ctx.fillStyle = d.color || '#FBBF24';
    ctx.fill();
    ctx.stroke();

    // 4. Mỏ vịt cam tươi
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.moveTo(23, -7);
    ctx.lineTo(36, -5);
    ctx.lineTo(23, -1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 5. Mắt hoạt hình to
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(17, -10, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(18, -11, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Phụ kiện: Người tuyết (#5) hoặc Vương miện Quán quân
    if (d.id === 5 || isWinnerSolo) {
      // Mũ xanh người tuyết hoặc vương miện
      ctx.fillStyle = isWinnerSolo ? '#FBBF24' : '#0284C7';
      ctx.beginPath();
      ctx.moveTo(8, -19);
      ctx.lineTo(11, -29);
      ctx.lineTo(15, -22);
      ctx.lineTo(19, -29);
      ctx.lineTo(22, -19);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  };

  // B. Vẽ CÁ (Swimming Fish)
  const drawFishShape = (ctx, d, isWinnerSolo) => {
    // Đuôi cá quẫy sóng
    const tailWiggle = Math.sin(Date.now() / 90 + d.wiggleOffset) * 6;

    // Vây đuôi
    ctx.fillStyle = d.color;
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-32, -14 + tailWiggle);
    ctx.lineTo(-24, 0);
    ctx.lineTo(-32, 14 + tailWiggle);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Thân cá bầu dục
    ctx.beginPath();
    if (ctx.ellipse) {
      ctx.ellipse(0, 0, 24, 16, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // Sọc trang trí trên thân cá (kiểu cá hề Nemo)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(-6, -14, 5, 28);
    ctx.fillRect(6, -12, 4, 24);

    // Vây lưng
    ctx.fillStyle = d.color;
    ctx.beginPath();
    ctx.moveTo(-5, -15);
    ctx.lineTo(5, -23);
    ctx.lineTo(12, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Mắt cá
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(15, -4, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(16, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(17, -5, 1, 0, Math.PI * 2);
    ctx.fill();
  };

  // C. Vẽ TÔM BÚNG (Jumping Shrimp)
  const drawShrimpShape = (ctx, d, isWinnerSolo) => {
    // Thân tôm cong nhiều khúc
    ctx.fillStyle = d.color;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.8;

    // Đuôi xòe quạt
    ctx.beginPath();
    ctx.moveTo(-18, 2);
    ctx.lineTo(-30, -8);
    ctx.lineTo(-30, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3 đốt thân tôm
    for (let seg = 2; seg >= 0; seg--) {
      ctx.beginPath();
      if (ctx.ellipse) {
        ctx.ellipse(-10 + seg * 9, (seg - 1) * 2, 10, 14 - seg * 1.5, -0.2, 0, Math.PI * 2);
      } else {
        ctx.arc(-10 + seg * 9, 0, 10, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();
    }

    // Đôi râu tôm dài vươn về phía trước
    ctx.beginPath();
    ctx.moveTo(18, -4);
    ctx.bezierCurveTo(28, -14, 38, -18, 48, -16);
    ctx.moveTo(18, 0);
    ctx.bezierCurveTo(28, -6, 38, -8, 46, -4);
    ctx.stroke();

    // Mắt tôm lồi đen bóng
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(16, -8, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(17, -9, 1, 0, Math.PI * 2);
    ctx.fill();
  };

  // D. Vẽ MỰC ỐNG (Speedy Squid)
  const drawSquidShape = (ctx, d, isWinnerSolo) => {
    ctx.fillStyle = d.color;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.8;

    // Các xúc tu mực uốn lượn phía sau
    const tentacleWave = Math.sin(Date.now() / 80 + d.wiggleOffset) * 5;
    for (let t = -2; t <= 2; t++) {
      ctx.beginPath();
      ctx.moveTo(-10, t * 5);
      ctx.quadraticCurveTo(-22, t * 7 + tentacleWave, -32, t * 5 - tentacleWave);
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    ctx.lineWidth = 1.8;

    // Đầu mực hình tên lửa nhọn
    ctx.beginPath();
    ctx.moveTo(28, 0); // mũi nhọn
    ctx.lineTo(8, -16);
    ctx.lineTo(-10, -14);
    ctx.lineTo(-10, 14);
    ctx.lineTo(8, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Đôi mắt to tròn ngơ ngác
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(2, -6, 4.5, 0, Math.PI * 2);
    ctx.arc(2, 6, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(3, -6, 2.5, 0, Math.PI * 2);
    ctx.arc(3, 6, 2.5, 0, Math.PI * 2);
    ctx.fill();
  };

  // E. Vẽ CUA BIỂN (Running Crab)
  const drawCrabShape = (ctx, d, isWinnerSolo) => {
    ctx.fillStyle = d.color;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.8;

    // 4 chân nhỏ 2 bên
    [-12, -4, 4, 12].forEach(cx => {
      ctx.beginPath();
      ctx.moveTo(cx, -12);
      ctx.lineTo(cx + (cx < 0 ? -6 : 6), -20);
      ctx.moveTo(cx, 12);
      ctx.lineTo(cx + (cx < 0 ? -6 : 6), 20);
      ctx.stroke();
    });

    // 2 càng cua to phía trước
    const clawSnap = Math.sin(Date.now() / 100 + d.wiggleOffset) * 3;
    ctx.beginPath();
    ctx.arc(18, -14, 8, 0, Math.PI * 2);
    ctx.arc(18, 14, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Vết cắt càng cua
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(20, -15, 6, 2 + clawSnap);
    ctx.fillRect(20, 13, 6, 2 + clawSnap);
    ctx.fillStyle = d.color;

    // Mai cua tròn dẹt
    ctx.beginPath();
    if (ctx.ellipse) {
      ctx.ellipse(0, 0, 22, 15, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // 2 mắt lồi trên cuống mắt
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(8, -8, 4, 0, Math.PI * 2);
    ctx.arc(8, 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(9, -8, 2.2, 0, Math.PI * 2);
    ctx.arc(9, 8, 2.2, 0, Math.PI * 2);
    ctx.fill();
  };

  // HÀM VẼ TỔNG HỢP CHO MỌI LOÀI VẬT
  const drawAnimal = (ctx, d, isWinnerSolo = false, isAccelerating = false) => {
    ctx.save();
    ctx.translate(d.x, d.y);

    // Kích thước to hơn hẳn để ngồi xa cũng nhìn rõ: lúc đua scale 1.3, lúc Quán quân Solo scale 2.6
    const scale = isWinnerSolo ? 2.6 : 1.3;
    ctx.scale(scale, scale);

    // Vệt bọt nước bứt tốc ở 3s cuối
    if (isAccelerating) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let b = 1; b <= 5; b++) {
        ctx.beginPath();
        ctx.arc(-26 - b * 9, Math.sin(Date.now() / 50 + b) * 5, 4 + b * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Gợn sóng nước lăn tăn dưới thân
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    if (ctx.ellipse) {
      ctx.ellipse(-2, 14, 24, 7, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(-2, 14, 12, 0, Math.PI * 2);
    }
    ctx.fill();

    // Vẽ hình dáng từng loài cụ thể
    if (d.type === 'fish') {
      drawFishShape(ctx, d, isWinnerSolo);
    } else if (d.type === 'shrimp') {
      drawShrimpShape(ctx, d, isWinnerSolo);
    } else if (d.type === 'squid') {
      drawSquidShape(ctx, d, isWinnerSolo);
    } else if (d.type === 'crab') {
      drawCrabShape(ctx, d, isWinnerSolo);
    } else {
      drawDuckShape(ctx, d, isWinnerSolo);
    }

    // HUY HIỆU SỐ TRÒN TO MÀU TRẮNG VIỀN ĐEN TRÊN THÂN (Rõ mồn một từ xa)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(-10, -5, 20, 15, 4);
    } else {
      ctx.rect(-10, -5, 20, 15);
    }
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(d.id), 0, 2.5);

    // TÊN HỌC SINH (Bảng tên to rõ nét, có nền đen mờ chống chói)
    const displayName = d.name.length > 13 ? d.name.substring(0, 12) + '…' : d.name;
    const nameWidth = Math.max(displayName.length * 7.5, 48);

    ctx.fillStyle = isWinnerSolo ? 'rgba(234, 88, 12, 0.95)' : 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(-nameWidth / 2, -34, nameWidth, 15, 4);
    } else {
      ctx.rect(-nameWidth / 2, -34, nameWidth, 15);
    }
    ctx.fill();

    ctx.fillStyle = isWinnerSolo ? '#FEF08A' : '#FFFFFF';
    ctx.font = isWinnerSolo ? 'bold 12px sans-serif' : 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayName, 0, -26.5);

    ctx.restore();
  };

  // 6. VẼ VẠCH CỜ CARO NGHIÊNG (Ảnh 2 & 5)
  const drawSlantedCheckeredLine = (ctx, topX, bottomX, topY, bottomY) => {
    ctx.save();
    const numTiles = 22;
    const lineWidth = 26;

    for (let i = 0; i < numTiles; i++) {
      const r1 = i / numTiles;
      const r2 = (i + 1) / numTiles;
      const x1 = topX + r1 * (bottomX - topX);
      const y1 = topY + r1 * (bottomY - topY);
      const x2 = topX + r2 * (bottomX - topX);
      const y2 = topY + r2 * (bottomY - topY);

      // Ô caro 1
      ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : '#0F172A';
      ctx.beginPath();
      ctx.moveTo(x1 - lineWidth / 2, y1);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2 - lineWidth / 2, y2);
      ctx.closePath();
      ctx.fill();

      // Ô caro 2
      ctx.fillStyle = i % 2 === 0 ? '#0F172A' : '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + lineWidth / 2, y1);
      ctx.lineTo(x2 + lineWidth / 2, y2);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.8;
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
    const bankHeight = 52;
    const riverHeight = height - bankHeight;

    const render = () => {
      // A. Vẽ Bãi Cỏ Phía Trên (Ảnh 2, 3, 4, 5)
      ctx.fillStyle = '#22C55E';
      ctx.fillRect(0, 0, width, 40);

      // Bụi cây tròn trên bãi cỏ
      ctx.fillStyle = '#15803D';
      [60, 180, 310, 480, 640, 780, 890].forEach(bx => {
        ctx.beginPath();
        ctx.arc(bx, 26, 15, 0, Math.PI * 2);
        ctx.arc(bx + 14, 24, 12, 0, Math.PI * 2);
        ctx.arc(bx - 12, 25, 11, 0, Math.PI * 2);
        ctx.fill();
      });

      // B. Bờ Đất Ven Sông (Màu nâu viền đen)
      ctx.fillStyle = '#854D0E';
      ctx.fillRect(0, 40, width, 12);
      ctx.fillStyle = '#451A03';
      ctx.fillRect(0, 51, width, 2);

      // C. Làn Nước Sông Xanh Biếc Hoạt Hình
      const waterGrad = ctx.createLinearGradient(0, bankHeight, 0, height);
      waterGrad.addColorStop(0, '#0284C7');
      waterGrad.addColorStop(0.4, '#0369A1');
      waterGrad.addColorStop(1, '#075985');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, bankHeight, width, riverHeight);

      // Gợn sóng nước uốn lượn trôi ngang
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.45)';
      ctx.lineWidth = 1.6;
      const waveOffset = (Date.now() / 35) % 48;
      for (let y = bankHeight + 24; y < height; y += 38) {
        ctx.beginPath();
        for (let x = -48; x < width + 48; x += 44) {
          ctx.arc(x + waveOffset, y, 12, 0, Math.PI);
        }
        ctx.stroke();
      }

      const startSlantTopX = 145;
      const startSlantBottomX = 195;
      const finishSlantTopX = width - 110;
      const finishSlantBottomX = width - 60;

      // D. TRẠNG THÁI 1: READY (VÀO VẠCH XUẤT PHÁT - Ảnh 2)
      if (raceState === 'ready') {
        drawSlantedCheckeredLine(ctx, startSlantTopX, startSlantBottomX, bankHeight, height);

        animalsRef.current.forEach((d) => {
          const laneY = bankHeight + 28 + d.laneRatio * (riverHeight - 56);
          d.laneY = laneY;
          d.x = startSlantTopX - 48 - d.startSlant * 0.7;
          d.y = laneY;
          drawAnimal(ctx, d, false, false);
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

        // Đồng bộ nhịp điệu âm thanh dồn dập theo tiến trình
        soundFx.setRaceProgress(progress);

        // VẠCH ĐÍCH CHỈ XUẤT HIỆN Ở 3-4 GIÂY CUỐI (progress >= 0.72 - Ảnh 5)
        if (progress >= 0.72) {
          drawSlantedCheckeredLine(ctx, finishSlantTopX, finishSlantBottomX, bankHeight, height);
        }

        // Vẽ từng con vật đang bơi đua
        animalsRef.current.forEach((d) => {
          const isWinner = d.id === winnerId;
          const isAccelerating = isWinner && progress >= 0.72;
          drawAnimal(ctx, d, false, isAccelerating);
        });
      }

      // F. TRẠNG THÁI 3: FINISHED (ẢNH 2 MẪU: TOÀN BỘ VỊT KHÁC BIẾN MẤT, CHỈ CÒN QUÁN QUÂN BƠI SOLO Ở GIỮA SÔNG)
      else if (raceState === 'finished') {
        const winner = winnerAnimal || animalsRef.current[0];
        if (winner) {
          // Tọa độ ngay giữa trung tâm dòng sông
          const centerAnimal = {
            ...winner,
            x: width / 2,
            y: bankHeight + riverHeight / 2 + Math.sin(Date.now() / 220) * 8
          };

          // Vẽ các vòng sóng nước lan tỏa rộng dưới thân Quán quân
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
          ctx.lineWidth = 2;
          const rippleR = 30 + ((Date.now() / 40) % 40);
          ctx.beginPath();
          if (ctx.ellipse) {
            ctx.ellipse(centerAnimal.x, centerAnimal.y + 24, rippleR, rippleR * 0.35, 0, 0, Math.PI * 2);
          } else {
            ctx.arc(centerAnimal.x, centerAnimal.y + 24, rippleR * 0.6, 0, Math.PI * 2);
          }
          ctx.stroke();

          // Vẽ Quán Quân Solo to đẹp, bơi tung tăng
          drawAnimal(ctx, centerAnimal, true, false);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, raceState, duration, winnerAnimal]);

  // 8. THUẬT TOÁN MẸO LỪA & BỨT PHÁ GIẤU MẶT KỊCH TÍNH
  const handleStartRace = () => {
    soundFx.playClick();
    if (raceState === 'paused') {
      setRaceState('running');
      raceParamsRef.current.startTime = Date.now();
      if (!isMuted) soundFx.startRaceAudio(animalType);
      return;
    }

    const totalAnimals = animalsRef.current.length;
    if (totalAnimals === 0) return;

    // 1 Kẻ giấu mặt Quán Quân
    const winnerIdx = Math.floor(Math.random() * totalAnimals);
    const chosenWinner = animalsRef.current[winnerIdx];

    // 2 Chim mồi dẫn đầu
    const otherAnimals = animalsRef.current.filter(d => d.id !== chosenWinner.id);
    const shuffledOthers = [...otherAnimals].sort(() => Math.random() - 0.5);
    const fakeLeader1 = shuffledOthers[0];
    const fakeLeader2 = shuffledOthers[1];

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

    setWinnerAnimal(chosenWinner);
    setRaceState('running');
    setTimeLeft(duration);
    setShowLeaderboard(false);
    setShowSettings(false);

    // Kích hoạt âm thanh đua xe/đua vịt dồn dập, hồi hộp
    if (!isMuted) {
      soundFx.playWhistle();
      soundFx.startRaceAudio(animalType);
    }

    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 960;
    const startX = 145;
    const finishX = width - 110;
    const trackDistance = finishX - startX;
    const totalDurationMs = duration * 1000;

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

    const physicsInterval = setInterval(() => {
      if (raceState === 'paused') return;

      const { startTime, elapsedBeforePause, winnerId, fakeLeaderIds } = raceParamsRef.current;
      const elapsed = Date.now() - startTime + elapsedBeforePause;
      const progress = Math.min(elapsed / totalDurationMs, 1.0);

      animalsRef.current.forEach((d) => {
        let normalizedX = 0;
        const isWinner = d.id === winnerId;
        const isFakeLeader = fakeLeaderIds.includes(d.id);

        if (isFakeLeader) {
          if (progress < 0.65) {
            normalizedX = Math.pow(progress / 0.65, 0.82) * 0.74;
          } else {
            normalizedX = 0.74 + ((progress - 0.65) / 0.35) * 0.21;
          }
        } else if (isWinner) {
          if (progress < 0.40) {
            normalizedX = (progress / 0.40) * 0.24;
          } else if (progress < 0.72) {
            normalizedX = 0.24 + ((progress - 0.40) / 0.32) * 0.38;
          } else {
            const sprintRatio = (progress - 0.72) / 0.28;
            normalizedX = 0.62 + Math.pow(sprintRatio, 1.35) * 0.45; // Vượt qua vạch đích ở 1.07
          }
        } else {
          const rankWeight = (totalAnimals - d.targetRank) / totalAnimals;
          const targetFinalX = 0.83 + rankWeight * 0.12;
          const jitter = Math.sin(elapsed / 240 + d.wiggleOffset) * 0.025;
          normalizedX = Math.max(0, Math.min(progress * targetFinalX + jitter, targetFinalX));
        }

        d.x = startX + normalizedX * trackDistance + d.startSlant * (1 - progress);
        d.y = d.laneY + Math.sin(Date.now() / 160 + d.wiggleOffset) * 3.5;
      });

      // KHI VỀ ĐÍCH
      if (progress >= 1.0) {
        clearInterval(physicsInterval);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        soundFx.stopRaceAudio();

        const finalSorted = [...animalsRef.current].sort((a, b) => b.x - a.x);
        finalSorted.forEach((d, idx) => {
          d.targetRank = idx + 1;
        });

        animalsRef.current = finalSorted;
        setRankedList(finalSorted);
        setWinnerAnimal(finalSorted[0]);
        setRaceState('finished');
        setTimeLeft(0);

        if (!isMuted) {
          soundFx.playWhistle();
          soundFx.playWinner();
          soundFx.playFanfare();
        }

        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#FBBF24', '#EF4444', '#10B981', '#38BDF8', '#EC4899']
        });
      }
    }, 35);
  };

  const handlePauseRace = () => {
    soundFx.playClick();
    if (raceState === 'running') {
      setRaceState('paused');
      const elapsed = Date.now() - raceParamsRef.current.startTime + raceParamsRef.current.elapsedBeforePause;
      raceParamsRef.current.elapsedBeforePause = elapsed;
      soundFx.stopRaceAudio();
    }
  };

  const handleClearRace = () => {
    soundFx.playClick();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    soundFx.stopRaceAudio();
    initializeAnimals();
  };

  const handleShuffle = () => {
    soundFx.playClick();
    handleClearRace();
  };

  const handleToggleSound = () => {
    if (!isMuted) {
      soundFx.stopRaceAudio();
      setIsMuted(true);
    } else {
      setIsMuted(false);
      if (raceState === 'running') soundFx.startRaceAudio(animalType);
    }
  };

  const handleConfirmCallWinner = (student) => {
    soundFx.playClick();
    if (student?.id) {
      onConfirmCallStudent?.(student.id);
    }
    onClose?.();
  };

  const filteredLeaderboard = useMemo(() => {
    if (!leaderboardSearch.trim()) return rankedList;
    const q = leaderboardSearch.toLowerCase();
    return rankedList.filter(d =>
      (d.name && d.name.toLowerCase().includes(q)) ||
      String(d.id).includes(q)
    );
  }, [rankedList, leaderboardSearch]);

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
      <div className="relative w-full max-w-5xl bg-slate-900 border-4 border-amber-400 rounded-[2.5rem] shadow-2xl p-3 sm:p-5 text-white flex flex-col justify-between min-h-[660px] overflow-hidden">

        {/* 1. TOP STOPWATCH CONTROL BAR (Chuẩn theo ảnh 2, 3, 4, 5) */}
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

                  {/* Số lượng vịt/con vật tham gia */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                      <span>Số lượng tham gia:</span>
                      <span className="text-amber-300">{duckCount} con</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={Math.max(45, (students || []).length || 35)}
                      value={duckCount}
                      onChange={(e) => setDuckCount(Number(e.target.value))}
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
              title="Xáo trộn vị trí xuất phát"
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
                <span>START</span>
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

            {/* Nút Clear */}
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

        {/* THANH CHỌN LOÀI CON VẬT ĐUA (Vịt, Cá, Tôm, Mực, Cua) */}
        <div className="flex items-center justify-between py-1 px-1">
          <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto custom-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-amber-200/80 mr-1 hidden sm:inline">Loài vật đua:</span>
            {ANIMAL_TYPES.map(a => (
              <button
                key={a.id}
                onClick={() => {
                  soundFx.playClick();
                  setAnimalType(a.id);
                }}
                disabled={raceState === 'running'}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center space-x-1 border ${
                  animalType === a.id
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>{a.icon}</span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>

          <span className="text-[11px] font-bold text-slate-400">
            Sĩ số: <strong className="text-white">{duckCount}</strong> thí sinh
          </span>
        </div>

        {/* 2. KHU VỰC CANVAS SÔNG NƯỚC ĐUA */}
        <div className="relative w-full flex-1 my-1 rounded-3xl overflow-hidden border-3 border-sky-400 shadow-2xl bg-sky-900 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={960}
            height={430}
            className="w-full h-full block object-cover select-none"
          />

          {/* Khi đang đua ở 3-4s cuối: Dòng trạng thái kịch tính */}
          {raceState === 'running' && timeLeft <= 4 && timeLeft > 0 && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-red-600/90 text-white font-black text-xs sm:text-sm rounded-full shadow-lg border-2 border-yellow-300 animate-bounce flex items-center space-x-1.5 z-20">
              <span>⚡ KẺ GIẤU MẶT ĐANG BỨT TỐC THẦN SẦU!</span>
            </div>
          )}

          {/* GIAO DIỆN CHUẨN ẢNH 2: KHI KẾT THÚC (Ảnh media_1789139122628.png) */}
          {raceState === 'finished' && winnerAnimal && (
            <>
              {/* Góc trên bên trái: Tùy chọn loại người thắng & Nút Race Again? */}
              <div className="absolute top-4 left-4 z-20 bg-slate-900/90 border-2 border-slate-600 rounded-2xl p-2 sm:p-2.5 shadow-2xl space-y-2 max-w-[210px] animate-in fade-in">
                <label className="flex items-center space-x-2 text-[11px] font-bold text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeCalled}
                    onChange={(e) => setExcludeCalled(e.target.checked)}
                    className="rounded accent-emerald-500 w-4 h-4"
                  />
                  <span>Loại người thắng ở vòng sau?</span>
                </label>

                <button
                  onClick={handleClearRace}
                  className="w-full py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transform hover:scale-105 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Race Again? (Đua Lại)</span>
                </button>
              </div>

              {/* Góc dưới bên phải: NÚT CÚP TRÒN TO (Như ảnh 2) */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowLeaderboard(true);
                }}
                title="Bấm để xem thứ hạng toàn bộ lớp (1st -> Cuối)"
                className="absolute bottom-4 right-4 z-20 w-14 h-14 rounded-full bg-white border-4 border-slate-950 shadow-[0_0_25px_rgba(255,255,255,0.6)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
              >
                <Trophy className="w-7 h-7 text-slate-950 group-hover:rotate-12 transition-transform" />
              </button>
            </>
          )}
        </div>

        {/* 3. KHU VỰC THÔNG BÁO QUÁN QUÂN LÊN BẢNG TRẢ BÀI (KHÔNG TẶNG SAO) */}
        {raceState === 'finished' && winnerAnimal && (
          <div className="w-full bg-slate-800/95 border-2 border-amber-400 p-3 sm:p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in zoom-in-95">
            <div className="flex items-center space-x-3 text-left w-full sm:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
                1st
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                    🎯 HỌC SINH ĐẠI DIỆN LÊN BẢNG TRẢ BÀI:
                  </span>
                  <span className="text-[11px] bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-400/40">
                    Số #{winnerAnimal.id}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {winnerAnimal.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => handleConfirmCallWinner(winnerAnimal.student)}
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
                  THỐNG KÊ THỨ HẠNG CUỘC ĐUA (1st ĐẾN NGƯỜI CUỐI CÙNG)
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
                  {rankedList[0]?.name || winnerAnimal?.name || 'Đang cập nhật'}
                </span>
                <span className="text-[11px] text-amber-200 font-bold block">
                  Số #{rankedList[0]?.id || winnerAnimal?.id || 1} • Chính thức
                </span>
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-400/20 border-2 border-slate-300 rounded-2xl text-center">
                <span className="text-base sm:text-lg font-black text-slate-200">🥈 2nd (Dự bị 1)</span>
                <span className="block font-black text-xs sm:text-sm text-white mt-1 truncate">
                  {rankedList[1]?.name || 'N/A'}
                </span>
                <span className="text-[11px] text-slate-300 font-bold block">
                  Số #{rankedList[1]?.id || 2} • Sẵn sàng
                </span>
              </div>

              <div className="p-2.5 sm:p-3 bg-amber-700/20 border-2 border-amber-600 rounded-2xl text-center">
                <span className="text-base sm:text-lg font-black text-amber-400">🥉 3rd (Dự bị 2)</span>
                <span className="block font-black text-xs sm:text-sm text-white mt-1 truncate">
                  {rankedList[2]?.name || 'N/A'}
                </span>
                <span className="text-[11px] text-amber-300 font-bold block">
                  Số #{rankedList[2]?.id || 3} • Sẵn sàng
                </span>
              </div>
            </div>

            {/* Ô tìm kiếm học sinh */}
            <div className="relative my-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên học sinh hoặc số đeo..."
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
                        Số #{d.id}
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
              <span>Tổng cộng: {rankedList.length || animalsRef.current.length} học sinh tham gia</span>
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
