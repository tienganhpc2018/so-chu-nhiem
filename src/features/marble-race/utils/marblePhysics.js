// Động cơ mô phỏng Vật lý 2D cho Game Đua Bi (Marble Race Pro 2D)
// Gồm đủ 7 chặng theo đúng quy chuẩn sư phạm

export const MARBLE_PALETTES = [
  '#F43F5E', '#EC4899', '#D946EF', '#A855F7', '#8B5CF6',
  '#6366F1', '#3B82F6', '#0EA5E9', '#06B6D4', '#14B8A6',
  '#10B981', '#22C55E', '#84CC16', '#EAB308', '#F59E0B',
  '#F97316', '#FF4500', '#FF1493', '#7928CA', '#00DFD8'
];

export class MarblePhysicsWorld {
  constructor({
    width = 760,
    trackLength = 'medium', // 'short' (20s) | 'medium' (30s) | 'long' (40s)
    students = [],
    usePhotos = true,
    timeScale = 1
  }) {
    this.width = width;
    this.trackLength = trackLength;
    this.usePhotos = usePhotos;
    this.timeScale = timeScale;
    this.raceTimer = 0;
    this.finishedCount = 0;
    this.finishList = [];
    this.isStartGateOpen = false;
    this.startGateProgress = 0; // 0 to 1
    this.waitingGateOpen = false;
    this.waitingGateProgress = 0;
    this.flipperAngle = 0;

    // Thiết lập độ dài thế giới theo 3 mức
    if (trackLength === 'short') {
      this.height = 3600;
    } else if (trackLength === 'long') {
      this.height = 6200;
    } else {
      this.height = 4800; // medium
    }

    // Các mốc Y cho 7 chặng
    const H = this.height;
    this.stageY = {
      start: 0,
      mushrooms: H * 0.10,
      pinball: H * 0.28,
      waitingGate: H * 0.46,
      flyingBars: H * 0.60,
      funnel: H * 0.78,
      finish: H * 0.94
    };

    // Tạo các chướng ngại vật cố định
    this.initObstacles();

    // Khởi tạo các viên bi học sinh
    this.initMarbles(students);
  }

  initObstacles() {
    this.bumpers = [];
    this.slopes = [];
    this.flippers = [];
    this.funnelWalls = [];

    const W = this.width;
    const { mushrooms, pinball, waitingGate, flyingBars, funnel, finish } = this.stageY;

    // 1. Chặng 2: VÙNG NẤM NẢY (Bumper Pins)
    const pinRows = this.trackLength === 'short' ? 4 : this.trackLength === 'long' ? 7 : 5;
    for (let r = 0; r < pinRows; r++) {
      const y = mushrooms + 80 + r * 110;
      const count = (r % 2 === 0) ? 6 : 5;
      const spacing = W / (count + 1);
      for (let c = 1; c <= count; c++) {
        this.bumpers.push({
          x: c * spacing + (Math.sin(r * 2 + c) * 15),
          y: y,
          radius: 18 + (r % 2 === 0 ? 3 : -2),
          color: (r % 2 === 0) ? '#38BDF8' : '#F43F5E',
          pulse: 0
        });
      }
    }

    // 2. Chặng 3: CẦN GẠT PINBALL (Spinners / Flippers)
    const flipperY = pinball + 120;
    this.flippers.push(
      { x: W * 0.28, y: flipperY, length: 90, angle: 0.3, speed: 0.045 },
      { x: W * 0.72, y: flipperY, length: 90, angle: -0.3, speed: -0.045 },
      { x: W * 0.50, y: flipperY + 180, length: 110, angle: 0, speed: 0.06 }
    );

    // 3. Chặng 5: THANH BAY (Flying Slopes / Zig-Zag Rails)
    const slopeCount = this.trackLength === 'short' ? 3 : 4;
    for (let i = 0; i < slopeCount; i++) {
      const sy = flyingBars + 80 + i * 160;
      if (i % 2 === 0) {
        // Nghiêng từ trái sang phải
        this.slopes.push({
          x1: 40,
          y1: sy,
          x2: W * 0.82,
          y2: sy + 100,
          color: '#38BDF8',
          thickness: 10
        });
      } else {
        // Nghiêng từ phải sang trái
        this.slopes.push({
          x1: W - 40,
          y1: sy,
          x2: W * 0.18,
          y2: sy + 100,
          color: '#06B6D4',
          thickness: 10
        });
      }
    }

    // 4. Chặng 6: PHỄU CỔ CHAI (Bottleneck Funnel)
    const funnelTopY = funnel + 40;
    const funnelNeckY = finish - 120;
    const neckWidth = 90; // Chỉ đủ cho 1-2 viên bi lọt qua cùng lúc
    this.funnelWalls = [
      // Vách chéo trái
      { x1: 30, y1: funnelTopY, x2: (W - neckWidth) / 2, y2: funnelNeckY, color: '#EC4899' },
      // Cổ chai thẳng đứng trái
      { x1: (W - neckWidth) / 2, y1: funnelNeckY, x2: (W - neckWidth) / 2, y2: finish, color: '#EC4899' },
      // Vách chéo phải
      { x1: W - 30, y1: funnelTopY, x2: (W + neckWidth) / 2, y2: funnelNeckY, color: '#EC4899' },
      // Cổ chai thẳng đứng phải
      { x1: (W + neckWidth) / 2, y1: funnelNeckY, x2: (W + neckWidth) / 2, y2: finish, color: '#EC4899' }
    ];
  }

  initMarbles(students = []) {
    this.marbles = [];
    const count = students.length || 32;
    const cols = Math.min(8, Math.ceil(Math.sqrt(count * 2)));

    students.forEach((st, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const startX = (this.width / 2) - ((cols - 1) * 36 / 2) + col * 36 + (Math.random() - 0.5) * 8;
      const startY = 80 + row * 44 + (Math.random() - 0.5) * 6;

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
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0,
        radius: 17,
        finished: false,
        finishTime: null,
        rank: null,
        stuckTimer: 0,
        lastY: startY
      });
    });
  }

  openStartGate() {
    this.isStartGateOpen = true;
  }

  update(deltaTime = 1 / 60) {
    const dt = Math.min(deltaTime, 0.05) * this.timeScale;
    this.raceTimer += dt;

    // Cập nhật góc quay của Cần gạt Pinball
    this.flipperAngle += dt * 3.5;

    // Cập nhật Cửa xuất phát
    if (this.isStartGateOpen && this.startGateProgress < 1) {
      this.startGateProgress = Math.min(1, this.startGateProgress + dt * 2);
    }

    // Tự động mở Cửa chờ (Stage 4) khi nhóm bi dẫn đầu chạm mốc hoặc sau 12 giây
    const leaderY = Math.max(...this.marbles.map(m => m.y));
    if (!this.waitingGateOpen && (leaderY >= this.stageY.waitingGate - 40 || this.raceTimer > 11)) {
      this.waitingGateOpen = true;
    }
    if (this.waitingGateOpen && this.waitingGateProgress < 1) {
      this.waitingGateProgress = Math.min(1, this.waitingGateProgress + dt * 1.5);
    }

    // Trọng lực theo thời gian và chặng đua
    const gravity = 420; // px/s^2

    // Cập nhật từng viên bi
    for (let i = 0; i < this.marbles.length; i++) {
      const m = this.marbles[i];
      if (m.finished) continue;

      // Nếu cổng chưa mở, giữ bi ở vạch xuất phát
      if (!this.isStartGateOpen) {
        m.y = Math.min(m.y, this.stageY.start + 280);
        continue;
      }

      // Tác động trọng lực
      m.vy += gravity * dt;

      // Ma sát không khí
      m.vx *= 0.995;
      m.vy *= 0.997;

      // Cập nhật vị trí
      m.x += m.vx * dt;
      m.y += m.vy * dt;

      // Va chạm 2 thành tường biên (Left & Right walls)
      const leftBound = 30 + m.radius;
      const rightBound = this.width - 30 - m.radius;
      if (m.x < leftBound) {
        m.x = leftBound;
        m.vx = Math.abs(m.vx) * 0.6 + 15;
      } else if (m.x > rightBound) {
        m.x = rightBound;
        m.vx = -Math.abs(m.vx) * 0.6 - 15;
      }

      // Va chạm Cửa xuất phát
      if (this.startGateProgress < 1) {
        const gateY = this.stageY.start + 300;
        if (m.y + m.radius > gateY && m.y - m.radius < gateY + 15) {
          m.y = gateY - m.radius;
          m.vy = -Math.abs(m.vy) * 0.2;
        }
      }

      // Va chạm Cửa chờ (Stage 4)
      if (this.waitingGateProgress < 0.9) {
        const waitGateY = this.stageY.waitingGate + 80;
        if (m.y + m.radius > waitGateY && m.y - m.radius < waitGateY + 20) {
          m.y = waitGateY - m.radius;
          m.vy = -Math.abs(m.vy) * 0.3;
          m.vx += (Math.random() - 0.5) * 40;
        }
      }

      // Va chạm Nấm nảy (Stage 2)
      for (const b of this.bumpers) {
        const dx = m.x - b.x;
        const dy = m.y - b.y;
        const dist = Math.hypot(dx, dy);
        const minDist = m.radius + b.radius;
        if (dist < minDist && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          // Đẩy ra khỏi nấm
          m.x = b.x + nx * minDist;
          m.y = b.y + ny * minDist;
          // Phản xạ đàn hồi + lực đẩy mạnh
          const dot = m.vx * nx + m.vy * ny;
          if (dot < 0) {
            m.vx = (m.vx - 2 * dot * nx) * 0.9 + nx * 120;
            m.vy = (m.vy - 2 * dot * ny) * 0.9 + ny * 120;
          }
          b.pulse = 1.0; // Hiệu ứng nảy sáng
        }
      }

      // Va chạm Thanh dốc / Thanh bay (Stage 5)
      for (const s of this.slopes) {
        this.checkLineCollision(m, s.x1, s.y1, s.x2, s.y2, s.thickness);
      }

      // Va chạm Phễu cổ chai (Stage 6)
      for (const w of this.funnelWalls) {
        this.checkLineCollision(m, w.x1, w.y1, w.x2, w.y2, 10);
      }

      // Kiểm tra Cán Đích (Stage 7)
      const finishY = this.stageY.finish;
      if (m.y >= finishY) {
        m.finished = true;
        this.finishedCount++;
        m.rank = this.finishedCount;
        m.finishTime = this.raceTimer;
        this.finishList.push(m);
        m.vx = 0;
        m.vy = 40; // Trôi nhẹ xuống khu vực tập kết đích
      }

      // Cơ chế chống kẹt (Anti-stuck mechanism)
      if (Math.abs(m.y - m.lastY) < 1.5) {
        m.stuckTimer += dt;
        if (m.stuckTimer > 0.8) {
          // Nudge nhẹ
          m.vx += (Math.random() - 0.5) * 160;
          m.vy += 80;
          m.stuckTimer = 0;
        }
      } else {
        m.stuckTimer = 0;
      }
      m.lastY = m.y;
    }

    // Va chạm giữa các viên bi với nhau (Marble-to-Marble Collisions)
    for (let i = 0; i < this.marbles.length; i++) {
      for (let j = i + 1; j < this.marbles.length; j++) {
        const m1 = this.marbles[i];
        const m2 = this.marbles[j];
        if (m1.finished && m2.finished) continue;

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

          // Vận tốc va chạm đàn hồi
          const kx = m1.vx - m2.vx;
          const ky = m1.vy - m2.vy;
          const p = 2 * (nx * kx + ny * ky) / 2;

          m1.vx -= p * nx * 0.75;
          m1.vy -= p * ny * 0.75;
          m2.vx += p * nx * 0.75;
          m2.vy += p * ny * 0.75;
        }
      }
    }

    // Giảm hiệu ứng pulse của bumpers
    for (const b of this.bumpers) {
      if (b.pulse > 0) b.pulse = Math.max(0, b.pulse - dt * 3);
    }
  }

  checkLineCollision(m, x1, y1, x2, y2, thickness = 8) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return;

    // Chiếu tọa độ bi lên đoạn thẳng
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
        m.vx = (m.vx - 1.6 * dot * nx) * 0.85;
        m.vy = (m.vy - 1.6 * dot * ny) * 0.85;
      }
    }
  }

  getLiveLeaderboard() {
    // Sắp xếp: Ai đã về đích thì xếp theo rank, ai chưa về đích thì xếp theo tọa độ Y (càng lớn càng gần đích)
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
