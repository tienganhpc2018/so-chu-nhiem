// Động cơ mô phỏng Vật lý 2D cho Game Đua Bi (Marble Race Pro 2D) — Phiên bản Cửa Ải Đa Tầng & Bứt Tốc Về Đích
// 1. Hệ thống Cửa Ải: Rừng nấm nảy -> Vòng quay cánh quạt -> Cổ nút chai số 1 -> Mê cung thanh trượt -> Cửa chờ -> Cổ nút chai chậm -> Cầu phóng cao tốc về đích.
// 2. Nhịp điệu Đua Kịch Tính: Bắt đầu nhanh -> Gom đàn bi tại cổ chai 1 -> Chen chúc chậm dần tại cổ chai 2 -> Bứt tốc thần tốc về đích.
// 3. Đầy đủ Họ và Tên học sinh, dừng hẳn đồng hồ và bi khi cán đích.

export const MARBLE_PALETTES = [
  '#F43F5E', '#EC4899', '#D946EF', '#A855F7', '#8B5CF6',
  '#6366F1', '#3B82F6', '#0EA5E9', '#06B6D4', '#14B8A6',
  '#10B981', '#22C55E', '#84CC16', '#EAB308', '#F59E0B',
  '#F97316', '#FF4500', '#FF1493', '#7928CA', '#00DFD8'
];

export class MarblePhysicsWorld {
  constructor({
    width = 1060,
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
    this.isRaceFinished = false;
    this.finalRaceTime = 0;
    this.finishedCount = 0;
    this.finishList = [];
    this.isStartGateOpen = false;
    this.startGateProgress = 0;
    this.waitingGateOpen = false;
    this.waitingGateProgress = 0;
    this.flipperAngle = 0;
    this.rotatorAngle = 0;
    this.nextNitroTime = 2.0;

    // Chiều cao thế giới theo các mức (dài hơn để chứa trọn 7 cửa ải phong phú)
    if (trackLength === 'short') {
      this.height = 4200;
    } else if (trackLength === 'long') {
      this.height = 7200;
    } else {
      this.height = 5600; // medium (~30s đầy kịch tính)
    }

    const H = this.height;
    // Phân tầng 7 Cửa Ải theo trục Y
    this.stageY = {
      start: 0,
      mushrooms: H * 0.08,    // Cửa ải 1: Rừng nấm nảy
      rotators: H * 0.22,     // Cửa ải 2: Vòng quay cánh quạt cối xay gió
      funnel1: H * 0.35,      // Cửa ải 3: Cổ nút chai gom bi số 1 (xóa rời rạc)
      slopes: H * 0.47,       // Cửa ải 4: Mê cung ziczac thanh trượt & cần gạt
      waitingGate: H * 0.63,  // Cửa ải 5: Cửa chặn nhịp đập
      funnel2: H * 0.76,      // Cửa ải 6: Cổ nút chai chậm - chen lấn nghẹt thở
      sprintFinish: H * 0.90, // Cửa ải 7: Cầu phóng siêu tốc về đích
      finish: H * 0.96        // Vạch đích
    };

    this.initObstacles();
    this.initMarbles(students);
  }

  initObstacles() {
    this.bumpers = [];
    this.rotators = [];
    this.funnels = [];
    this.slopes = [];
    this.flippers = [];
    this.funnelWalls = [];

    const W = this.width;
    const { mushrooms, rotators, funnel1, slopes, waitingGate, funnel2, sprintFinish, finish } = this.stageY;

    // 1. Cửa ải 1: Rừng nấm nảy dày dặn (Bumper Forest)
    const pinRows = this.trackLength === 'short' ? 4 : this.trackLength === 'long' ? 7 : 5;
    for (let r = 0; r < pinRows; r++) {
      const y = mushrooms + 60 + r * 95;
      const count = (r % 2 === 0) ? 8 : 7;
      const spacing = (W - 80) / (count + 1);
      for (let c = 1; c <= count; c++) {
        this.bumpers.push({
          x: 40 + c * spacing + (Math.sin(r * 2 + c) * 14),
          y: y,
          radius: 19 + (r % 2 === 0 ? 3 : -2),
          color: (r % 2 === 0) ? '#38BDF8' : '#F43F5E',
          pulse: 0
        });
      }
    }

    // 2. Cửa ải 2: Cụm Vòng quay cánh quạt cối xay gió (Spinning Wheels)
    // 3 cối xay gió quay liên tục để hất văng và đảo lộn vị trí các bi
    const rotY = rotators + 100;
    this.rotators.push(
      { x: W * 0.22, y: rotY,       radius: 80, speed: 1.8,  blades: 4, color: '#F59E0B' },
      { x: W * 0.50, y: rotY + 140, radius: 95, speed: -2.2, blades: 4, color: '#A855F7' },
      { x: W * 0.78, y: rotY,       radius: 80, speed: 2.0,  blades: 4, color: '#EC4899' }
    );

    // 3. Cửa ải 3: Cổ nút chai gom bi số 1 (Mid Bottleneck Funnel)
    // Gom cả đàn bi tụ lại thành một khối, triệt tiêu khoảng cách rời rạc
    const f1TopY = funnel1 + 30;
    const f1NeckY = slopes - 50;
    const neck1Width = 145; // cổ vừa phải để các bi dồn cục chen lấn
    this.funnelWalls.push(
      { x1: 35,                   y1: f1TopY,  x2: (W - neck1Width) / 2, y2: f1NeckY, color: '#06B6D4', thickness: 14 },
      { x1: (W - neck1Width) / 2, y1: f1NeckY, x2: (W - neck1Width) / 2, y2: f1NeckY + 90, color: '#06B6D4', thickness: 14 },
      { x1: W - 35,               y1: f1TopY,  x2: (W + neck1Width) / 2, y2: f1NeckY, color: '#06B6D4', thickness: 14 },
      { x1: (W + neck1Width) / 2, y1: f1NeckY, x2: (W + neck1Width) / 2, y2: f1NeckY + 90, color: '#06B6D4', thickness: 14 }
    );

    // 4. Cửa ải 4: Mê cung ziczac thanh trượt kép & cần gạt pinball
    const slopeBaseY = slopes + 60;
    const slopeCount = 5;
    for (let i = 0; i < slopeCount; i++) {
      const sy = slopeBaseY + i * 140;
      if (i % 2 === 0) {
        this.slopes.push({
          x1: 45, y1: sy, x2: W * 0.82, y2: sy + 105,
          color: '#38BDF8', thickness: 14, dirX: 1, dirY: 0.35
        });
      } else {
        this.slopes.push({
          x1: W - 45, y1: sy, x2: W * 0.18, y2: sy + 105,
          color: '#F43F5E', thickness: 14, dirX: -1, dirY: 0.35
        });
      }
    }

    // Các cần gạt Pinball đan xen
    this.flippers.push(
      { x: W * 0.35, y: slopeBaseY + 220, length: 110, angle: 0.3,  speed: 0.06 },
      { x: W * 0.65, y: slopeBaseY + 440, length: 110, angle: -0.3, speed: -0.06 }
    );

    // 5. Cửa ải 6: Cổ nút chai số 2 - CHẬM VÀ NGHẸT THỞ (Slow-Mo Bottleneck)
    // Miệng phễu thoai thoải kéo dài, cổ hẹp 130px khiến bi phải chen lấn, tốc độ chậm lại
    const f2TopY = funnel2 + 20;
    const f2NeckY = sprintFinish - 70;
    const neck2Width = 130;
    this.funnelWalls.push(
      { x1: 35,                   y1: f2TopY,  x2: (W - neck2Width) / 2, y2: f2NeckY, color: '#EC4899', thickness: 14 },
      { x1: (W - neck2Width) / 2, y1: f2NeckY, x2: (W - neck2Width) / 2, y2: sprintFinish, color: '#EC4899', thickness: 14 },
      { x1: W - 35,               y1: f2TopY,  x2: (W + neck2Width) / 2, y2: f2NeckY, color: '#EC4899', thickness: 14 },
      { x1: (W + neck2Width) / 2, y1: f2NeckY, x2: (W + neck2Width) / 2, y2: sprintFinish, color: '#EC4899', thickness: 14 }
    );

    // 6. Cửa ải 7: Máng dốc phóng siêu tốc về đích (Sprint Ramp)
    // Máng dẫn thẳng từ cổ chai số 2 lao thẳng tới đích
    this.sprintRamp = {
      topY: sprintFinish,
      bottomY: finish,
      leftX: (W - neck2Width) / 2,
      rightX: (W + neck2Width) / 2
    };
  }

  initMarbles(students = []) {
    this.marbles = [];
    const count = students.length || 30;
    const cols = Math.min(10, Math.ceil(Math.sqrt(count * 2.2)));

    students.forEach((st, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const startX = (this.width / 2) - ((cols - 1) * 42 / 2) + col * 42 + (Math.random() - 0.5) * 10;
      const startY = 75 + row * 46 + (Math.random() - 0.5) * 8;

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
        isBoosting: false,
        boostTimer: 0
      });
    });
  }

  openStartGate() {
    this.isStartGateOpen = true;
  }

  update(deltaTime = 1 / 60) {
    if (this.isRaceFinished) return;

    const dt = Math.min(deltaTime, 0.05) * this.timeScale;
    this.raceTimer += dt;
    this.flipperAngle += dt * 4.2;
    this.rotatorAngle += dt * 3.0;

    // 1. Mở Cổng xuất phát
    if (this.isStartGateOpen && this.startGateProgress < 1) {
      this.startGateProgress = Math.min(1, this.startGateProgress + dt * 2.2);
    }

    // 2. Mở Cửa chờ khi bi dẫn đầu gần tới
    const leaderY = Math.max(...this.marbles.map(m => m.y));
    if (!this.waitingGateOpen && (leaderY >= this.stageY.waitingGate - 50 || this.raceTimer > 12)) {
      this.waitingGateOpen = true;
    }
    if (this.waitingGateOpen && this.waitingGateProgress < 1) {
      this.waitingGateProgress = Math.min(1, this.waitingGateProgress + dt * 1.6);
    }

    // 3. Cơ chế Nitro Boost định kỳ cho nhóm phía sau (Comeback)
    if (this.raceTimer >= this.nextNitroTime && this.isStartGateOpen) {
      const unfinished = this.marbles.filter(m => !m.finished);
      if (unfinished.length >= 4) {
        const sorted = [...unfinished].sort((a, b) => b.y - a.y);
        const backGroupStart = Math.floor(sorted.length * 0.40);
        const candidates = sorted.slice(backGroupStart);

        if (candidates.length > 0) {
          const lucky = candidates[Math.floor(Math.random() * candidates.length)];
          lucky.isBoosting = true;
          lucky.boostTimer = 0.85;
          lucky.vy += 430;
          lucky.vx += (Math.random() - 0.5) * 160;
        }
      }
      this.nextNitroTime = this.raceTimer + 1.8 + Math.random() * 1.5;
    }

    // 4. Cập nhật chuyển động từng viên bi
    for (let i = 0; i < this.marbles.length; i++) {
      const m = this.marbles[i];
      if (m.finished) continue;

      if (!this.isStartGateOpen) {
        m.y = Math.min(m.y, this.stageY.start + 260);
        continue;
      }

      // Xác định gia tốc theo từng chặng (Rhythm: Chậm ở phễu 2, Siêu nhanh ở máng về đích)
      let currentGravity = 640;
      let frictionX = 0.993;
      let frictionY = 0.997;

      // Đoạn Cổ nút chai số 2: TỐC ĐỘ CHẬM LẠI, CHEN LẤN HỒI HỘP
      if (m.y >= this.stageY.funnel2 && m.y < this.stageY.sprintFinish) {
        currentGravity = 380; // Giảm trọng lực để bi trôi chậm rãi
        frictionX = 0.975;
        frictionY = 0.985;
      }
      // Đoạn Máng phóng về đích: SIÊU TỐC ĐỘ
      else if (m.y >= this.stageY.sprintFinish) {
        currentGravity = 980; // Phóng như tên lửa về vạch đích
        m.vy += 280 * dt;
      }

      // Nitro boost
      if (m.isBoosting) {
        m.boostTimer -= dt;
        m.vy += currentGravity * 0.6 * dt;
        if (m.boostTimer <= 0) m.isBoosting = false;
      } else {
        m.vy += currentGravity * dt;
        m.vx *= frictionX;
        m.vy *= frictionY;
      }

      m.x += m.vx * dt;
      m.y += m.vy * dt;

      // Tường biên trái / phải
      const leftBound  = 35 + m.radius;
      const rightBound = this.width - 35 - m.radius;
      if (m.x < leftBound) {
        m.x = leftBound;
        m.vx = Math.abs(m.vx) * 0.7 + 25;
      } else if (m.x > rightBound) {
        m.x = rightBound;
        m.vx = -Math.abs(m.vx) * 0.7 - 25;
      }

      // Cổng xuất phát
      if (this.startGateProgress < 1) {
        const gateY = this.stageY.start + 280;
        if (m.y + m.radius > gateY && m.y - m.radius < gateY + 15) {
          m.y = gateY - m.radius;
          m.vy = -Math.abs(m.vy) * 0.2;
        }
      }

      // Cửa chờ
      if (this.waitingGateProgress < 0.9) {
        const waitGateY = this.stageY.waitingGate + 70;
        if (m.y + m.radius > waitGateY && m.y - m.radius < waitGateY + 20) {
          m.y = waitGateY - m.radius;
          m.vy = -Math.abs(m.vy) * 0.3;
          m.vx += (Math.random() - 0.5) * 50;
        }
      }

      // Va chạm Nấm nảy
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

      // Va chạm Cụm Vòng quay cánh quạt cối xay gió
      for (const rot of this.rotators) {
        this.checkRotatorCollision(m, rot);
      }

      // Va chạm Mê cung thanh dốc
      for (const s of this.slopes) {
        this.checkSlopeCollision(m, s);
      }

      // Va chạm Các phễu cổ nút chai (Funnel 1 & Funnel 2)
      for (const w of this.funnelWalls) {
        this.checkLineCollision(m, w.x1, w.y1, w.x2, w.y2, w.thickness || 14);
      }

      // ★ CÁN ĐÍCH: DỪNG HẲN TOÀN BỘ KHI CÓ HỌC SINH ĐẦU TIÊN VỀ NHẤT
      if (m.y >= this.stageY.finish) {
        m.finished = true;
        this.finishedCount++;
        m.rank = this.finishedCount;
        m.finishTime = this.raceTimer;
        this.finishList.push(m);
        m.vx = 0;
        m.vy = 0;

        // Dừng đồng hồ & đóng băng toàn bộ bi
        this.isRaceFinished = true;
        this.finalRaceTime = this.raceTimer;

        for (const other of this.marbles) {
          other.vx = 0;
          other.vy = 0;
        }
        break;
      }

      // Chống kẹt
      if (Math.abs(m.y - m.lastY) < 1.0) {
        m.stuckTimer += dt;
        if (m.stuckTimer > 0.6) {
          m.vx += (Math.random() - 0.5) * 260;
          m.vy += 170;
          m.stuckTimer = 0;
        }
      } else {
        m.stuckTimer = 0;
      }
      m.lastY = m.y;
    }

    // Va chạm giữa các viên bi (chen chúc xô đẩy nhau)
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

      for (const b of this.bumpers) {
        if (b.pulse > 0) b.pulse = Math.max(0, b.pulse - dt * 3);
      }
    }
  }

  // Va chạm với Vòng quay cối xay gió
  checkRotatorCollision(m, rot) {
    const dx = m.x - rot.x;
    const dy = m.y - rot.y;
    const dist = Math.hypot(dx, dy);

    // Nếu bi nằm trong bán kính hoạt động của cánh quạt
    if (dist < rot.radius + m.radius && dist > 10) {
      const angle = this.rotatorAngle * rot.speed;
      const numBlades = rot.blades || 4;

      for (let b = 0; b < numBlades; b++) {
        const bladeAngle = angle + (b * (Math.PI * 2 / numBlades));
        const bx = rot.x + Math.cos(bladeAngle) * rot.radius;
        const by = rot.y + Math.sin(bladeAngle) * rot.radius;

        // Va chạm đoạn thẳng từ tâm rot tới đầu cánh quạt
        this.checkLineCollision(m, rot.x, rot.y, bx, by, 12);
      }
    }
  }

  checkSlopeCollision(m, s) {
    const { x1, y1, x2, y2, thickness, dirX = 1, dirY = 0.35 } = s;
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
        m.vx = (m.vx - 1.6 * dot * nx) * 0.88 + dirX * 190;
        m.vy = (m.vy - 1.6 * dot * ny) * 0.88 + dirY * 130;
      }
    }
  }

  checkLineCollision(m, x1, y1, x2, y2, thickness = 12) {
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
