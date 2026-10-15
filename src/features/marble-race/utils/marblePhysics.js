// Động cơ mô phỏng Vật lý 2D cho Game Đua Bi (Marble Race Pro 2D) — Phiên bản Chuẩn Nâng Cấp Pro
// 1. DỪNG HẲN đồng hồ và toàn bộ bi ngay khi có học sinh về nhất.
// 2. Mở rộng khung đường đua (1060px), phễu rộng thoáng, không kẹt bi.
// 3. Tốc độ cao, trọng lực mạnh, hệ thống LỘI NGƯỢC DÒNG BẤT NGỜ (Nitro Comeback Boost) cho bi phía sau.

export const MARBLE_PALETTES = [
  '#F43F5E', '#EC4899', '#D946EF', '#A855F7', '#8B5CF6',
  '#6366F1', '#3B82F6', '#0EA5E9', '#06B6D4', '#14B8A6',
  '#10B981', '#22C55E', '#84CC16', '#EAB308', '#F59E0B',
  '#F97316', '#FF4500', '#FF1493', '#7928CA', '#00DFD8'
];

export class MarblePhysicsWorld {
  constructor({
    width = 1060,         // Khung đường đua mở rộng chuẩn màn hình
    trackLength = 'medium',
    students = [],
    usePhotos = true,
    timeScale = 1
  }) {
    this.width = width;
    this.trackLength = trackLength;
    this.usePhotos = usePhotos;
    this.timeScale = timeScale;
    this.raceTimer = 0;
    this.isRaceFinished = false; // ★ Khi có người về nhất: DỪNG HẲN TOÀN BỘ
    this.finalRaceTime = 0;      // Lưu chính xác thời gian về đích
    this.finishedCount = 0;
    this.finishList = [];
    this.isStartGateOpen = false;
    this.startGateProgress = 0;
    this.waitingGateOpen = false;
    this.waitingGateProgress = 0;
    this.flipperAngle = 0;
    this.nextNitroTime = 2.0;    // Thời điểm kích hoạt Nitro tiếp theo

    // Thiết lập độ dài thế giới theo 3 mức
    if (trackLength === 'short') {
      this.height = 3600;
    } else if (trackLength === 'long') {
      this.height = 6200;
    } else {
      this.height = 4800; // medium (~30s)
    }

    // Các mốc Y cho 7 chặng
    const H = this.height;
    this.stageY = {
      start: 0,
      mushrooms: H * 0.10,
      pinball: H * 0.28,
      waitingGate: H * 0.46,
      flyingBars: H * 0.60,
      funnel: H * 0.77,
      finish: H * 0.94
    };

    this.initObstacles();
    this.initMarbles(students);
  }

  initObstacles() {
    this.bumpers = [];
    this.slopes = [];
    this.flippers = [];
    this.funnelWalls = [];

    const W = this.width;
    const { mushrooms, pinball, waitingGate, flyingBars, funnel, finish } = this.stageY;

    // Chặng 2: Vùng nấm nảy — phân bố rộng trên toàn khung 1060px
    const pinRows = this.trackLength === 'short' ? 5 : this.trackLength === 'long' ? 9 : 7;
    for (let r = 0; r < pinRows; r++) {
      const y = mushrooms + 80 + r * 100;
      const count = (r % 2 === 0) ? 8 : 7;
      const spacing = (W - 80) / (count + 1);
      for (let c = 1; c <= count; c++) {
        this.bumpers.push({
          x: 40 + c * spacing + (Math.sin(r * 2 + c) * 15),
          y: y,
          radius: 19 + (r % 2 === 0 ? 3 : -2),
          color: (r % 2 === 0) ? '#38BDF8' : '#F43F5E',
          pulse: 0
        });
      }
    }

    // Chặng 3: Cần gạt Pinball — quay đều đặn tạo chướng ngại vật sinh động
    const flipperY = pinball + 120;
    this.flippers.push(
      { x: W * 0.20, y: flipperY,        length: 120, angle: 0.35,  speed: 0.06 },
      { x: W * 0.80, y: flipperY,        length: 120, angle: -0.35, speed: -0.06 },
      { x: W * 0.50, y: flipperY + 190,  length: 140, angle: 0,     speed: 0.075 },
      { x: W * 0.32, y: flipperY + 360,  length: 110, angle: 0.25,  speed: -0.055 },
      { x: W * 0.68, y: flipperY + 360,  length: 110, angle: -0.25, speed: 0.055 }
    );

    // Chặng 5: Thanh bay dốc — độ dốc hợp lý, bi trượt nhanh xuống
    const slopeCount = this.trackLength === 'short' ? 4 : 5;
    for (let i = 0; i < slopeCount; i++) {
      const sy = flyingBars + 70 + i * 160;
      if (i % 2 === 0) {
        this.slopes.push({
          x1: 45,
          y1: sy,
          x2: W * 0.82,
          y2: sy + 115,
          color: '#38BDF8',
          thickness: 14,
          dirX: 1,
          dirY: 0.3
        });
      } else {
        this.slopes.push({
          x1: W - 45,
          y1: sy,
          x2: W * 0.18,
          y2: sy + 115,
          color: '#06B6D4',
          thickness: 14,
          dirX: -1,
          dirY: 0.3
        });
      }
    }

    // Chặng 6: Phễu cổ chai — mở rộng cổ phễu 160px để không kẹt bi lâu, dốc trơn
    const funnelTopY  = funnel + 30;
    const funnelNeckY = finish - 130;
    const neckWidth   = 160; // Tăng từ 90/110 → 160px
    this.funnelWalls = [
      { x1: 35,                  y1: funnelTopY,  x2: (W - neckWidth) / 2, y2: funnelNeckY, color: '#EC4899', thickness: 12 },
      { x1: (W - neckWidth) / 2, y1: funnelNeckY, x2: (W - neckWidth) / 2, y2: finish,      color: '#EC4899', thickness: 12 },
      { x1: W - 35,              y1: funnelTopY,  x2: (W + neckWidth) / 2, y2: funnelNeckY, color: '#EC4899', thickness: 12 },
      { x1: (W + neckWidth) / 2, y1: funnelNeckY, x2: (W + neckWidth) / 2, y2: finish,      color: '#EC4899', thickness: 12 }
    ];
  }

  initMarbles(students = []) {
    this.marbles = [];
    const count = students.length || 30;
    const cols = Math.min(11, Math.ceil(Math.sqrt(count * 2.2)));

    students.forEach((st, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const startX = (this.width / 2) - ((cols - 1) * 42 / 2) + col * 42 + (Math.random() - 0.5) * 10;
      const startY = 80 + row * 46 + (Math.random() - 0.5) * 8;

      const initials = st.full_name
        ? st.full_name.trim().split(' ').pop().substring(0, 2).toUpperCase()
        : `B${idx + 1}`;

      this.marbles.push({
        id: st.id || `m-${idx}`,
        studentId: st.id,
        name: st.full_name || `Học sinh ${idx + 1}`,
        initials,
        avatar: st.avatar || st.avatar_url || null,
        color: MARBLE_PALETTES[idx % MARBLE_PALETTES.length],
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * 0.8,
        vy: 0,
        radius: 17,
        finished: false,
        finishTime: null,
        rank: null,
        stuckTimer: 0,
        lastY: startY,
        boostCooldown: 0,
        isBoosting: false,
        boostTimer: 0
      });
    });
  }

  openStartGate() {
    this.isStartGateOpen = true;
  }

  update(deltaTime = 1 / 60) {
    // ★ NẾU ĐÃ CÓ NGƯỜI VỀ NHẤT: DỪNG HẲN TOÀN BỘ MỌI THỨ!
    if (this.isRaceFinished) {
      return;
    }

    const dt = Math.min(deltaTime, 0.05) * this.timeScale;
    this.raceTimer += dt;
    this.flipperAngle += dt * 4.2;

    // Mở cổng xuất phát
    if (this.isStartGateOpen && this.startGateProgress < 1) {
      this.startGateProgress = Math.min(1, this.startGateProgress + dt * 2.2);
    }

    // Mở cửa chờ khi bi dẫn đầu gần tới
    const leaderY = Math.max(...this.marbles.map(m => m.y));
    if (!this.waitingGateOpen && (leaderY >= this.stageY.waitingGate - 50 || this.raceTimer > 9)) {
      this.waitingGateOpen = true;
    }
    if (this.waitingGateOpen && this.waitingGateProgress < 1) {
      this.waitingGateProgress = Math.min(1, this.waitingGateProgress + dt * 1.8);
    }

    // ★ Trọng lực tăng mạnh: 680 px/s² (giúp bi lăn nhanh, dứt khoát)
    const gravity = 680;

    // ★ HỆ THỐNG "LỘI NGƯỢC DÒNG BẤT NGỜ" (Comeback Nitro Mechanics)
    // Cứ mỗi 1.5 - 2.5 giây, chọn 1-2 viên bi ở nửa sau đoàn đua để kích hoạt Nitro
    if (this.raceTimer >= this.nextNitroTime && this.isStartGateOpen) {
      const unfinished = this.marbles.filter(m => !m.finished);
      if (unfinished.length >= 4) {
        // Sắp xếp theo vị trí Y (cao = gần đích hơn)
        const sorted = [...unfinished].sort((a, b) => b.y - a.y);
        // Chọn từ nhóm 40% cuối đoàn đua
        const backGroupStart = Math.floor(sorted.length * 0.45);
        const candidates = sorted.slice(backGroupStart);

        if (candidates.length > 0) {
          // Chọn ngẫu nhiên 1 viên bi trong nhóm sau
          const luckyMarble = candidates[Math.floor(Math.random() * candidates.length)];
          luckyMarble.isBoosting = true;
          luckyMarble.boostTimer = 0.9; // Boost trong 0.9 giây
          luckyMarble.vy += 420;        // Lực phóng cực mạnh về phía trước
          luckyMarble.vx += (Math.random() - 0.5) * 160; // Lạng lách vượt lên
        }
      }
      this.nextNitroTime = this.raceTimer + 1.6 + Math.random() * 1.4;
    }

    for (let i = 0; i < this.marbles.length; i++) {
      const m = this.marbles[i];
      if (m.finished) continue;

      if (!this.isStartGateOpen) {
        m.y = Math.min(m.y, this.stageY.start + 270);
        continue;
      }

      // Xử lý hiệu ứng Nitro đang diễn ra
      if (m.isBoosting) {
        m.boostTimer -= dt;
        m.vy += gravity * 0.5 * dt; // Gia tốc thêm trong khi boost
        if (m.boostTimer <= 0) {
          m.isBoosting = false;
        }
      } else {
        m.vy += gravity * dt;
        m.vx *= 0.994;
        m.vy *= 0.998;
      }

      m.x += m.vx * dt;
      m.y += m.vy * dt;

      // Va chạm tường biên (khung rộng 1060px)
      const leftBound  = 35 + m.radius;
      const rightBound = this.width - 35 - m.radius;
      if (m.x < leftBound) {
        m.x = leftBound;
        m.vx = Math.abs(m.vx) * 0.7 + 25;
      } else if (m.x > rightBound) {
        m.x = rightBound;
        m.vx = -Math.abs(m.vx) * 0.7 - 25;
      }

      // Va chạm Cổng xuất phát
      if (this.startGateProgress < 1) {
        const gateY = this.stageY.start + 290;
        if (m.y + m.radius > gateY && m.y - m.radius < gateY + 15) {
          m.y = gateY - m.radius;
          m.vy = -Math.abs(m.vy) * 0.2;
        }
      }

      // Va chạm Cửa chờ
      if (this.waitingGateProgress < 0.9) {
        const waitGateY = this.stageY.waitingGate + 80;
        if (m.y + m.radius > waitGateY && m.y - m.radius < waitGateY + 20) {
          m.y = waitGateY - m.radius;
          m.vy = -Math.abs(m.vy) * 0.3;
          m.vx += (Math.random() - 0.5) * 50;
        }
      }

      // Va chạm Nấm nảy — nẩy tưng bừng tạo âm vang
      for (const b of this.bumpers) {
        const dx = m.x - b.x;
        const dy = m.y - b.y;
        const dist = Math.hypot(dx, dy);
        const minDist = m.radius + b.radius;
        if (dist < minDist && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          m.x = b.x + nx * minDist;
          m.y = b.y + ny * minDist;
          const dot = m.vx * nx + m.vy * ny;
          if (dot < 0) {
            m.vx = (m.vx - 2 * dot * nx) * 0.95 + nx * 170;
            m.vy = (m.vy - 2 * dot * ny) * 0.95 + ny * 170;
          }
          b.pulse = 1.0;
        }
      }

      // Va chạm Thanh bay dốc — trượt nhanh xuống dốc, không bị kẹt
      for (const s of this.slopes) {
        this.checkSlopeCollision(m, s);
      }

      // Va chạm Phễu cổ chai
      for (const w of this.funnelWalls) {
        this.checkLineCollision(m, w.x1, w.y1, w.x2, w.y2, w.thickness || 12);
      }

      // ★ KIỂM TRA CÁN ĐÍCH: DỪNG HẲN KHI CÓ NGƯỜI VỀ NHẤT
      if (m.y >= this.stageY.finish) {
        m.finished = true;
        this.finishedCount++;
        m.rank = this.finishedCount;
        m.finishTime = this.raceTimer;
        this.finishList.push(m);
        m.vx = 0;
        m.vy = 0;

        // ★ DỪNG HẲN TOÀN BỘ ĐỒNG HỒ VÀ CÁC VIÊN BI!
        this.isRaceFinished = true;
        this.finalRaceTime = this.raceTimer;

        // Dừng tất cả các viên bi khác tại vị trí hiện tại
        for (const other of this.marbles) {
          other.vx = 0;
          other.vy = 0;
        }
        break; // Thoát vòng lặp ngay
      }

      // Cơ chế chống kẹt thông minh
      if (Math.abs(m.y - m.lastY) < 1.2) {
        m.stuckTimer += dt;
        if (m.stuckTimer > 0.6) {
          m.vx += (Math.random() - 0.5) * 260;
          m.vy += 160;
          m.stuckTimer = 0;
        }
      } else {
        m.stuckTimer = 0;
      }
      m.lastY = m.y;
    }

    // Va chạm bi-bi nếu chưa kết thúc
    if (!this.isRaceFinished) {
      for (let i = 0; i < this.marbles.length; i++) {
        for (let j = i + 1; j < this.marbles.length; j++) {
          const m1 = this.marbles[i];
          const m2 = this.marbles[j];
          if (m1.finished || m2.finished) continue;

          const dx = m2.x - m1.x;
          const dy = m2.y - m1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = m1.radius + m2.radius;

          if (dist < minDist && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = 0.5 * (minDist - dist);

            m1.x -= nx * overlap;
            m1.y -= ny * overlap;
            m2.x += nx * overlap;
            m2.y += ny * overlap;

            const kx = m1.vx - m2.vx;
            const ky = m1.vy - m2.vy;
            const p = 2 * (nx * kx + ny * ky) / 2;

            m1.vx -= p * nx * 0.82;
            m1.vy -= p * ny * 0.82;
            m2.vx += p * nx * 0.82;
            m2.vy += p * ny * 0.82;
          }
        }
      }

      // Giảm hiệu ứng pulse bumpers
      for (const b of this.bumpers) {
        if (b.pulse > 0) b.pulse = Math.max(0, b.pulse - dt * 3);
      }
    }
  }

  // Va chạm với thanh dốc có gia tốc trượt xuống (downhill slide)
  checkSlopeCollision(m, s) {
    const { x1, y1, x2, y2, thickness, dirX = 1, dirY = 0.3 } = s;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return;

    let t = ((m.x - x1) * dx + (m.y - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    const dist = Math.hypot(m.x - closestX, m.y - closestY);
    const minDist = m.radius + thickness / 2;

    if (dist < minDist && dist > 0) {
      const nx = (m.x - closestX) / dist;
      const ny = (m.y - closestY) / dist;

      m.x = closestX + nx * minDist;
      m.y = closestY + ny * minDist;

      const dot = m.vx * nx + m.vy * ny;
      if (dot < 0) {
        // Nảy nhẹ ra khỏi mặt thanh
        m.vx = (m.vx - 1.6 * dot * nx) * 0.88;
        m.vy = (m.vy - 1.6 * dot * ny) * 0.88;
        // ★ Bổ sung lực trượt dọc theo chiều dốc của thanh để bi lướt cực nhanh
        m.vx += dirX * 180;
        m.vy += dirY * 120;
      }
    }
  }

  checkLineCollision(m, x1, y1, x2, y2, thickness = 10) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return;

    let t = ((m.x - x1) * dx + (m.y - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    const dist = Math.hypot(m.x - closestX, m.y - closestY);
    const minDist = m.radius + thickness / 2;

    if (dist < minDist && dist > 0) {
      const nx = (m.x - closestX) / dist;
      const ny = (m.y - closestY) / dist;

      m.x = closestX + nx * minDist;
      m.y = closestY + ny * minDist;

      const dot = m.vx * nx + m.vy * ny;
      if (dot < 0) {
        m.vx = (m.vx - 1.7 * dot * nx) * 0.85;
        m.vy = (m.vy - 1.7 * dot * ny) * 0.85;
      }
    }
  }

  getLiveLeaderboard() {
    return [...this.marbles].sort((a, b) => {
      if (a.finished && b.finished) return a.rank - b.rank;
      if (a.finished) return -1;
      if (b.finished) return 1;
      return b.y - a.y;
    });
  }

  getLeaderY() {
    const unfinished = this.marbles.filter(m => !m.finished);
    if (unfinished.length === 0) return this.stageY.finish;
    return Math.max(...unfinished.map(m => m.y));
  }
}
