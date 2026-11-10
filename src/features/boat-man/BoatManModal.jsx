import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize, Minimize, Award } from 'lucide-react';

/**
 * BoatManModal.jsx - Trò chơi giáo dục gọi tên học sinh ngẫu nhiên "Người Lái Đò"
 * Tái hiện 100% nguyên bản trò chơi gốc từ file HTML đóng gói.
 * Tích hợp đầy đủ vào Tab Nề Nếp Lớp Học (LMS Sổ chủ nhiệm), nhận dữ liệu học sinh thực tế của lớp (ví dụ lớp 7A6).
 */
export const BoatManModal = ({
  isOpen,
  onClose,
  currentClass,
  students: lmsStudents = [],
  calledStudentIds: lmsCalledIds = [],
  onConfirmCallStudent,
  onAwardPointsToStudent
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // UI state phản ánh lên React
  const [timerDisplay, setTimerDisplay] = useState('00:20');
  const [quickDuration, setQuickDuration] = useState('20');
  const [phaseText, setPhaseText] = useState('Bến Đò Làng (Chuẩn bị)');
  const [statTotal, setStatTotal] = useState(12);
  const [statSleeping, setStatSleeping] = useState('?');
  const [statSchool, setStatSchool] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  // Banner diễn biến
  const [narrative, setNarrative] = useState({
    visible: false,
    text: '',
    icon: 'fa-wind'
  });

  // Spotlight học sinh ngủ quên
  const [spotlight, setSpotlight] = useState({
    visible: false,
    teacherTitle: 'PHÁT HIỆN HỌC SINH NGỦ QUÊN!',
    studentName: '',
    subtext: ''
  });

  // Modal cài đặt
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    studentListText: '',
    duration: 20,
    teacherGender: 'female',
    callMode: 'random',
    callCount: 2,
    manualSelectedIds: []
  });

  // Modal trao thưởng điểm nề nếp cho học sinh
  const [selectedStudentForAward, setSelectedStudentForAward] = useState(null);
  const [awardReason, setAwardReason] = useState('Khen thưởng hăng hái trả bài');

  // Ref giữ toàn bộ game logic & engine canvas
  const engineRef = useRef(null);

  // Xử lý bật tắt toàn màn hình
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Khởi tạo Game Engine khi Modal mở
  useEffect(() => {
    if (!isOpen) {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Chuẩn bị danh sách học sinh từ LMS
    let initialNames = [];
    if (lmsStudents && lmsStudents.length > 0) {
      initialNames = lmsStudents.map(s => s.name || s.full_name || 'Học sinh');
    } else {
      initialNames = [
        "Minh Anh", "Bảo Ngọc", "Gia Huy", "Tuấn Kiệt",
        "Hà My", "Đăng Khoa", "Thảo Nhi", "Hoàng Nam",
        "Khánh Linh", "Đức Duy", "Phương Thảo", "Quốc Bảo"
      ];
    }

    // Sound System
    class SoundSystem {
      constructor() {
        this.ctx = null;
        this.enabled = true;
        this.windGain = null;
        this.windFilter = null;
        this.whiteNoise = null;
        this.isWindPlaying = false;
      }

      init() {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      }

      toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
          this.stopWindAmbience();
        } else if (engineRef.current && engineRef.current.gameState.phase === 1 && !engineRef.current.gameState.paused) {
          this.startWindAmbience(engineRef.current.gameState.windIntensity);
        }
        return this.enabled;
      }

      startWindAmbience(intensity = 0.5) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        if (this.isWindPlaying) {
          this.updateWindIntensity(intensity);
          return;
        }

        try {
          const bufferSize = 2 * this.ctx.sampleRate;
          const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }

          this.whiteNoise = this.ctx.createBufferSource();
          this.whiteNoise.buffer = noiseBuffer;
          this.whiteNoise.loop = true;

          this.windFilter = this.ctx.createBiquadFilter();
          this.windFilter.type = 'bandpass';
          this.windFilter.frequency.value = 260 + intensity * 300;
          this.windFilter.Q.value = 1.8;

          this.windGain = this.ctx.createGain();
          this.windGain.gain.value = 0.04 + intensity * 0.08;

          this.whiteNoise.connect(this.windFilter);
          this.windFilter.connect(this.windGain);
          this.windGain.connect(this.ctx.destination);

          this.whiteNoise.start(0);
          this.isWindPlaying = true;
        } catch (e) {
          // ignore audio restriction
        }
      }

      updateWindIntensity(intensity) {
        if (!this.isWindPlaying || !this.windGain || !this.windFilter || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          this.windFilter.frequency.setTargetAtTime(220 + intensity * 380, now, 0.3);
          this.windGain.gain.setTargetAtTime(this.enabled ? (0.03 + intensity * 0.09) : 0, now, 0.3);
        } catch (e) {}
      }

      stopWindAmbience() {
        if (this.whiteNoise && this.isWindPlaying) {
          try { this.whiteNoise.stop(); } catch (e) {}
          this.isWindPlaying = false;
        }
      }

      playSuspenseTick(pitch = 220) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(pitch, now);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.09);
        } catch (e) {}
      }

      playCallAndSleep() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const notes = [587.33, 659.25, 783.99, 1046.50];
          notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.11);
            gain.gain.setValueAtTime(0.22, now + idx * 0.11);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.45);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.11);
            osc.stop(now + idx * 0.11 + 0.46);
          });
        } catch (e) {}
      }

      playStepSound() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320 + Math.random() * 160, now);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.09);
        } catch (e) {}
      }

      playVictoryFanfare() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const melody = [523.25, 659.25, 783.99, 1046.50];
          melody.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.15);
            gain.gain.setValueAtTime(0.18, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.5);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.52);
          });
        } catch (e) {}
      }
    }

    const sound = new SoundSystem();
    const ctx = canvas.getContext('2d');
    const TOTAL_CAMERA_DISTANCE = 3200;

    const SHIRT_COLORS = [
      "#ef4444", "#f97316", "#eab308", "#22c55e",
      "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
      "#14b8a6", "#f43f5e", "#6366f1", "#84cc16"
    ];

    const clouds = [];
    const leaves = [];
    const zzzParticles = [];

    const gameState = {
      phase: 0,
      paused: false,
      time: 0,
      totalDuration: 20,
      remainingTime: 20,
      lastFrameTimestamp: 0,
      journeyProgress: 0,
      cameraX: 0,
      currentSceneIndex: 1,

      teacherGender: 'female',
      callMode: 'random',
      callCount: 2,
      manualSelectedIndices: new Set(),

      windIntensity: 0.15,
      targetWindIntensity: 0.15,
      skyDarkness: 0,
      targetSkyDarkness: 0,

      boat: {
        x: 380,
        baseY: 590,
        y: 590,
        dockX: 980,
        angle: 0,
        oarAngle: 0
      },

      teacherBubble: {
        visible: false,
        text: "",
        timer: 0
      },

      studentNames: [...initialNames],
      students: [],
      callQueue: [],
      callTimer: 0,
      suspenseTicks: 0,
      completionAnnounced: false
    };

    function initEnvironment() {
      clouds.length = 0;
      for (let i = 0; i < 9; i++) {
        clouds.push({
          x: i * 220 + Math.random() * 80,
          y: 65 + (i % 3) * 48,
          scale: 0.75 + (i % 3) * 0.25,
          speed: 0.4 + (i % 4) * 0.2
        });
      }

      leaves.length = 0;
      for (let i = 0; i < 30; i++) {
        leaves.push({
          x: Math.random() * 1600,
          y: Math.random() * 650,
          size: 7 + Math.random() * 6,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.12,
          speedX: 2.5 + Math.random() * 3.5,
          speedY: 0.6 + Math.random() * 1.5,
          color: Math.random() > 0.35 ? '#4ade80' : '#facc15'
        });
      }
    }

    function formatSeconds(sec) {
      const s = Math.max(0, Math.ceil(sec));
      const mins = Math.floor(s / 60);
      const rem = s % 60;
      return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
    }

    function updateTimerUI() {
      setTimerDisplay(formatSeconds(gameState.remainingTime));
    }

    function showNarrativeMsg(text, iconClass = "fa-wind") {
      setNarrative({
        visible: true,
        text: text,
        icon: iconClass
      });
    }

    function setPhaseTitle(title) {
      setPhaseText(title);
    }

    function setTeacherSpeech(text, duration = 220) {
      gameState.teacherBubble.visible = true;
      gameState.teacherBubble.text = text;
      gameState.teacherBubble.timer = duration;
    }

    function updateStats() {
      const total = gameState.students.length;
      const calledSleeping = gameState.students.filter(s => s.called).length;
      const inSchool = gameState.students.filter(s => s.state === 'in_school').length;

      setStatTotal(total);
      setStatSleeping(gameState.phase < 2 ? "?" : calledSleeping);
      setStatSchool(inSchool);
    }

    function buildStudents() {
      gameState.students = [];
      zzzParticles.length = 0;

      const total = gameState.studentNames.length;
      const startSeatX = -225;
      const endSeatX = 125;
      const seatSpan = endSeatX - startSeatX;

      gameState.studentNames.forEach((rawName, idx) => {
        const name = rawName.trim() || `Học sinh ${idx + 1}`;
        const row = idx % 2;
        const ratio = total > 1 ? idx / (total - 1) : 0.5;
        const seatOffsetX = startSeatX + ratio * seatSpan;
        const seatOffsetY = row === 0 ? -24 : -10;
        const labelTier = idx % 3;

        // Tìm học sinh lms tương ứng để liên kết ID
        const matchedLms = lmsStudents.find(
          st => (st.name || st.full_name) === name || st.id === `st-${idx + 1}`
        );

        gameState.students.push({
          id: idx,
          lmsId: matchedLms?.id || null,
          studentObj: matchedLms || null,
          name: name,
          color: SHIRT_COLORS[idx % SHIRT_COLORS.length],
          isGirl: idx % 2 === 0,
          row: row,
          seatOffsetX: seatOffsetX,
          seatOffsetY: seatOffsetY,
          labelTier: labelTier,

          willFallAsleep: false,
          called: false,
          drowsy: false,
          state: 'sitting',

          worldX: 0,
          worldY: 0,
          walkProgress: 0,
          walkDelay: 0,
          headNodPhase: Math.random() * Math.PI * 2,
          stepPhase: 0
        });
      });

      updateStats();
      updateTimerUI();
    }

    function selectSecretSleeping() {
      gameState.students.forEach(s => {
        s.willFallAsleep = false;
        s.called = false;
        s.drowsy = false;
        s.state = 'sitting';
      });

      if (gameState.callMode === 'manual' && gameState.manualSelectedIndices.size > 0) {
        gameState.students.forEach(s => {
          if (gameState.manualSelectedIndices.has(s.id)) {
            s.willFallAsleep = true;
          }
        });
      } else {
        const count = Math.min(gameState.callCount, gameState.students.length);
        const shuffled = [...gameState.students].sort(() => Math.random() - 0.5);
        for (let i = 0; i < count; i++) {
          shuffled[i].willFallAsleep = true;
        }
      }
    }

    function startJourney() {
      if (gameState.phase >= 2) {
        resetGame();
      }

      sound.init();
      selectSecretSleeping();

      gameState.phase = 1;
      gameState.paused = false;
      gameState.remainingTime = gameState.totalDuration;
      gameState.journeyProgress = 0;
      gameState.cameraX = 0;
      gameState.currentSceneIndex = 1;
      gameState.lastFrameTimestamp = performance.now();

      setIsPaused(false);
      setIsStarted(true);

      setPhaseTitle("Đang đưa học sinh qua sông");
      showNarrativeMsg("Con thuyền bắt đầu rời bến đò làng... Hãy xem ai giữ được tỉnh táo đến khi tới trường nhé!", "fa-sailboat");
      setTeacherSpeech("Các em ngồi vững nhé, thuyền bắt đầu rời bến!", 200);

      sound.startWindAmbience(0.4);
      updateStats();
    }

    function triggerAutoDock() {
      sound.init();
      if (gameState.phase === 0) {
        selectSecretSleeping();
      }

      gameState.paused = false;
      setIsPaused(false);

      gameState.phase = 2;
      gameState.remainingTime = 0;
      gameState.journeyProgress = 1.0;
      gameState.cameraX = TOTAL_CAMERA_DISTANCE;
      gameState.boat.x = gameState.boat.dockX;
      gameState.targetWindIntensity = 0.15;
      gameState.targetSkyDarkness = 0.0;
      sound.updateWindIntensity(0.15);
      updateTimerUI();

      setPhaseTitle("Đã cập bến! Học sinh vào trường");
      showNarrativeMsg("Thuyền đã cập bến! Các em học sinh đang lần lượt bước xuống thuyền đi vào lớp...", "fa-school");
      setTeacherSpeech("Thuyền cập bến rồi! Các em lần lượt đi vào lớp nhé!", 240);

      gameState.students.forEach(s => {
        s.drowsy = false;
        if (s.willFallAsleep) {
          s.state = 'sleeping';
        }
      });

      const awakeStudents = gameState.students
        .filter(s => !s.willFallAsleep)
        .sort((a, b) => b.seatOffsetX - a.seatOffsetX);

      awakeStudents.forEach((student, orderIdx) => {
        student.state = 'standing';
        student.walkDelay = 18 + orderIdx * 24;
        student.walkProgress = 0;
      });

      const sleepingStudents = gameState.students.filter(s => s.willFallAsleep);
      gameState.callQueue = sleepingStudents.map(s => s.id);
      gameState.callTimer = 95;
      gameState.suspenseTicks = 0;
    }

    function manualCallSleeping() {
      sound.init();
      if (gameState.phase < 2) {
        triggerAutoDock();
        return;
      }

      if (gameState.phase === 2) {
        gameState.phase = 3;
      }

      if (gameState.callQueue.length > 0) {
        gameState.callTimer = 5;
      } else {
        const alreadySleeping = gameState.students.filter(s => s.state === 'sleeping' && !s.called);
        if (alreadySleeping.length > 0) {
          gameState.callQueue = alreadySleeping.map(s => s.id);
          gameState.callTimer = 5;
        } else {
          const allSleeping = gameState.students.filter(s => s.called);
          if (allSleeping.length > 0) {
            const names = allSleeping.map(s => s.name).join(", ");
            showNarrativeMsg(`Các bạn ngủ quên trên thuyền đã bị gọi tên: ${names}!`, "fa-bullhorn");
            sound.playCallAndSleep();
          }
        }
      }
    }

    let spotlightTimerId = null;

    function revealAndCall(studentId) {
      const student = gameState.students.find(s => s.id === studentId);
      if (!student) return;

      student.willFallAsleep = true;
      student.state = 'sleeping';
      student.called = true;

      // Đồng bộ gọi tên lên LMS Sổ Chủ Nhiệm
      if (student.lmsId) {
        onConfirmCallStudent?.(student.lmsId);
      }

      const teacherTitle = gameState.teacherGender === 'female' ? "Cô giáo" : "Thầy giáo";
      setTeacherSpeech(`Ơ kìa! Em ${student.name} ngủ quên trên thuyền rồi!`, 160);

      setSpotlight({
        visible: true,
        teacherTitle: "PHÁT HIỆN HỌC SINH NGỦ QUÊN!",
        studentName: student.name,
        subtext: `${teacherTitle} gọi tên vì vẫn đang say giấc trên thuyền (Zzz...)`,
        studentObj: student
      });

      if (spotlightTimerId) clearTimeout(spotlightTimerId);
      spotlightTimerId = setTimeout(() => {
        setSpotlight(prev => ({ ...prev, visible: false }));
      }, 3200);

      sound.playCallAndSleep();
      updateStats();
    }

    function finishPhase4() {
      if (gameState.completionAnnounced) return;
      gameState.completionAnnounced = true;
      gameState.phase = 4;

      const sleepingNames = gameState.students.filter(s => s.called).map(s => s.name);
      const sleepingText = sleepingNames.length > 0
        ? `Còn bạn ${sleepingNames.join(", ")} ngủ quên đã bị gọi tên!`
        : `Tất cả học sinh đều tỉnh táo đến trường!`;

      setPhaseTitle("Hoàn thành chuyến đò");
      showNarrativeMsg(
        `"Chuyến đò đã cập bến! Các em chăm ngoan đã vào trường an toàn. ${sleepingText}"`,
        "fa-flag-checkered"
      );
      setTeacherSpeech("Các bạn thức đã vào lớp. Mấy bạn ngủ quên mau tỉnh dậy nào!", 400);
      sound.playVictoryFanfare();
    }

    function resetGame() {
      gameState.phase = 0;
      gameState.paused = false;
      gameState.completionAnnounced = false;
      gameState.callQueue = [];
      gameState.remainingTime = gameState.totalDuration;
      gameState.journeyProgress = 0;
      gameState.cameraX = 0;
      gameState.currentSceneIndex = 1;

      gameState.targetWindIntensity = 0.15;
      gameState.windIntensity = 0.15;
      gameState.targetSkyDarkness = 0;
      gameState.skyDarkness = 0;

      gameState.boat.x = 380;
      gameState.boat.angle = 0;
      gameState.teacherBubble.visible = false;

      setIsPaused(false);
      setIsStarted(false);
      setSpotlight(prev => ({ ...prev, visible: false }));
      setNarrative(prev => ({ ...prev, visible: false }));

      setPhaseTitle("Bến Đò Làng (Chuẩn bị)");
      sound.stopWindAmbience();
      buildStudents();
    }

    function getStudentBoatWorldPos(student) {
      const cosA = Math.cos(gameState.boat.angle);
      const sinA = Math.sin(gameState.boat.angle);
      const wx = gameState.boat.x + student.seatOffsetX * cosA - student.seatOffsetY * sinA;
      const wy = gameState.boat.y + student.seatOffsetX * sinA + student.seatOffsetY * cosA;
      return { x: wx, y: wy };
    }

    function getWalkPathPosition(student) {
      const startPos = getStudentBoatWorldPos(student);
      const waypoints = [
        startPos,
        { x: 1185, y: 560 },
        { x: 1265, y: 540 },
        { x: 1365, y: 495 },
        { x: 1445, y: 448 }
      ];

      const p = Math.min(1, Math.max(0, student.walkProgress));
      const totalSegments = waypoints.length - 1;
      const exactSeg = p * totalSegments;
      const segIdx = Math.min(totalSegments - 1, Math.floor(exactSeg));
      const localT = exactSeg - segIdx;

      const p0 = waypoints[segIdx];
      const p1 = waypoints[segIdx + 1];

      return {
        x: p0.x + (p1.x - p0.x) * localT,
        y: p0.y + (p1.y - p0.y) * localT - Math.abs(Math.sin(student.stepPhase)) * 5
      };
    }

    // UPDATE LOGIC
    function update(now) {
      if (!gameState.lastFrameTimestamp) gameState.lastFrameTimestamp = now;
      const dt = Math.min(0.1, (now - gameState.lastFrameTimestamp) / 1000);
      gameState.lastFrameTimestamp = now;

      if (gameState.paused) return;

      gameState.time += 1;

      if (gameState.phase === 1) {
        gameState.remainingTime -= dt;
        if (gameState.remainingTime <= 0) {
          gameState.remainingTime = 0;
          triggerAutoDock();
          return;
        }

        gameState.journeyProgress = 1 - (gameState.remainingTime / gameState.totalDuration);
        const p = gameState.journeyProgress;
        gameState.cameraX = p * TOTAL_CAMERA_DISTANCE;

        if (p < 0.25) {
          if (gameState.currentSceneIndex !== 1) gameState.currentSceneIndex = 1;
          gameState.targetWindIntensity = 0.45;
          gameState.targetSkyDarkness = 0.25;
          gameState.boat.x = 380 + (p / 0.25) * 60;
        } else if (p < 0.60) {
          if (gameState.currentSceneIndex !== 2) {
            gameState.currentSceneIndex = 2;
            setPhaseTitle("Trời nổi gió lớn");
            showNarrativeMsg('"Ôi! Gió to quá! Các em ngồi yên trên thuyền, đừng ngủ gật nhé!"', "fa-wind");
            setTeacherSpeech("Ôi! Gió to quá! Các em ngồi yên trên thuyền nhé!", 220);
            sound.updateWindIntensity(0.85);
          }
          gameState.targetWindIntensity = 0.88;
          gameState.targetSkyDarkness = 0.72;
          gameState.boat.x = 440 + ((p - 0.25) / 0.35) * 80;

          if (gameState.time % 35 === 0) {
            gameState.students.forEach(s => {
              s.drowsy = Math.random() < 0.28;
            });
          }
        } else if (p < 0.85) {
          if (gameState.currentSceneIndex !== 3) {
            gameState.currentSceneIndex = 3;
            setPhaseTitle("Vượt sóng dữ");
            const teacherTitle = gameState.teacherGender === 'female' ? "Cô giáo" : "Thầy giáo";
            showNarrativeMsg(`${teacherTitle} vững tay chèo vượt qua khúc sông sóng lớn... Ai sẽ là người ngủ quên đây?`, "fa-water");
            setTeacherSpeech("Sắp qua khúc sông sóng lớn rồi, cố lên các em!", 200);
            sound.updateWindIntensity(1.0);
          }
          gameState.targetWindIntensity = 0.95;
          gameState.targetSkyDarkness = 0.6;
          gameState.boat.x = 520 + ((p - 0.60) / 0.25) * 140;

          if (gameState.time % 30 === 0) {
            gameState.students.forEach(s => {
              s.drowsy = Math.random() < 0.35;
            });
          }
        } else {
          if (gameState.currentSceneIndex !== 4) {
            gameState.currentSceneIndex = 4;
            setPhaseTitle("Sắp tới bến trường");
            showNarrativeMsg("Phía trước đã thấy cổng trường! Chuẩn bị cập bến nhé các em!", "fa-school");
            setTeacherSpeech("Ngôi trường hiện ra phía trước rồi các em ơi!", 180);
            sound.updateWindIntensity(0.45);
          }
          gameState.targetWindIntensity = 0.4;
          gameState.targetSkyDarkness = 0.15;
          const localT = (p - 0.85) / 0.15;
          gameState.boat.x = 660 + localT * (gameState.boat.dockX - 660);
        }

        updateTimerUI();
      }

      gameState.windIntensity += (gameState.targetWindIntensity - gameState.windIntensity) * 0.04;
      gameState.skyDarkness += (gameState.targetSkyDarkness - gameState.skyDarkness) * 0.03;

      clouds.forEach(c => {
        c.x -= c.speed * (1 + gameState.windIntensity * 4.5);
        if (c.x < -250) c.x = 1750;
      });

      leaves.forEach(l => {
        l.x += l.speedX * (0.5 + gameState.windIntensity * 2.8);
        l.y += l.speedY + Math.sin(gameState.time * 0.05 + l.x * 0.01) * 1.2;
        l.rot += l.rotSpeed * (1 + gameState.windIntensity * 2);

        if (l.x > 1650) {
          l.x = -30;
          l.y = Math.random() * 550;
        }
        if (l.y > 720) {
          l.y = -20;
          l.x = Math.random() * 1400;
        }
      });

      if (gameState.teacherBubble.visible) {
        gameState.teacherBubble.timer--;
        if (gameState.teacherBubble.timer <= 0) {
          gameState.teacherBubble.visible = false;
        }
      }

      const waveRockAmplitude = 0.02 + gameState.windIntensity * 0.085;
      const waveRockSpeed = 0.05 + gameState.windIntensity * 0.04;

      if (gameState.phase === 1) {
        gameState.boat.oarAngle = Math.sin(gameState.time * 0.16) * 0.58;
      } else if (gameState.phase >= 2) {
        gameState.boat.oarAngle *= 0.88;
      } else {
        gameState.boat.oarAngle = Math.sin(gameState.time * 0.07) * 0.2;
      }

      const rockFactor = gameState.phase >= 2 ? 0.18 : 1.0;
      gameState.boat.angle = Math.sin(gameState.time * waveRockSpeed) * waveRockAmplitude * rockFactor;
      gameState.boat.y = gameState.boat.baseY + Math.cos(gameState.time * waveRockSpeed * 1.2) * (4 + gameState.windIntensity * 14) * rockFactor;

      let allAwakeInSchool = true;

      gameState.students.forEach(s => {
        if (s.state === 'sleeping') {
          s.headNodPhase += 0.06;
          if (gameState.time % 34 === (s.id * 7) % 34) {
            const pos = getStudentBoatWorldPos(s);
            zzzParticles.push({
              x: pos.x + 5,
              y: pos.y - 38,
              alpha: 1.0,
              scale: 0.72,
              drift: (Math.random() - 0.5) * 0.6
            });
          }
        } else if (gameState.phase >= 2 && !s.willFallAsleep) {
          if (s.state === 'standing') {
            allAwakeInSchool = false;
            s.walkDelay--;
            if (s.walkDelay <= 0) {
              s.state = 'walking';
              const startPos = getStudentBoatWorldPos(s);
              s.worldX = startPos.x;
              s.worldY = startPos.y;
              sound.playStepSound();
            }
          } else if (s.state === 'walking') {
            allAwakeInSchool = false;
            s.walkProgress += 0.0055;
            s.stepPhase += 0.28;

            if (gameState.time % 20 === 0) {
              sound.playStepSound();
            }

            const pathPos = getWalkPathPosition(s);
            s.worldX = pathPos.x;
            s.worldY = pathPos.y;

            if (s.walkProgress >= 1.0) {
              s.state = 'in_school';
              updateStats();
            }
          } else if (s.state !== 'in_school') {
            allAwakeInSchool = false;
          }
        } else {
          allAwakeInSchool = false;
        }
      });

      if (gameState.phase === 2 && allAwakeInSchool) {
        gameState.phase = 3;
        gameState.callTimer = 80;
        const teacherTitle = gameState.teacherGender === 'female' ? "Cô giáo" : "Thầy giáo";
        setPhaseTitle("Phát hiện học sinh ngủ quên!");
        showNarrativeMsg(`Các bạn tỉnh táo đã vào lớp hết rồi... Ôi kìa! Trên thuyền vẫn còn bạn đang ngủ say!`, "fa-bed");
        setTeacherSpeech(`Các bạn vào lớp hết rồi, để ${teacherTitle.toLowerCase()} xem ai còn ngủ quên trên thuyền nào!`, 180);
      }

      if (gameState.phase === 3) {
        if (gameState.callQueue.length > 0) {
          gameState.callTimer--;
          if (gameState.callTimer > 0 && gameState.callTimer < 50 && gameState.callTimer % 8 === 0) {
            sound.playSuspenseTick(240 + (50 - gameState.callTimer) * 8);
          }
          if (gameState.callTimer <= 0) {
            const nextId = gameState.callQueue.shift();
            revealAndCall(nextId);
            gameState.callTimer = 155;
          }
        } else {
          gameState.callTimer--;
          if (gameState.callTimer <= 0) {
            finishPhase4();
          }
        }
      }

      for (let i = zzzParticles.length - 1; i >= 0; i--) {
        const z = zzzParticles[i];
        z.y -= 0.75;
        z.x += z.drift + gameState.windIntensity * 0.5;
        z.scale += 0.008;
        z.alpha -= 0.014;
        if (z.alpha <= 0) {
          zzzParticles.splice(i, 1);
        }
      }
    }

    // DRAW FUNCTIONS
    function drawSky() {
      const d = gameState.skyDarkness;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 540);

      const r1 = Math.round(56 * (1 - d) + 30 * d);
      const g1 = Math.round(189 * (1 - d) + 41 * d);
      const b1 = Math.round(248 * (1 - d) + 59 * d);

      const r2 = Math.round(186 * (1 - d) + 71 * d);
      const g2 = Math.round(230 * (1 - d) + 85 * d);
      const b2 = Math.round(253 * (1 - d) + 105 * d);

      skyGrad.addColorStop(0, `rgb(${r1},${g1},${b1})`);
      skyGrad.addColorStop(1, `rgb(${r2},${g2},${b2})`);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 1600, 560);

      if (d < 0.85) {
        ctx.save();
        ctx.globalAlpha = 1 - d * 1.1;
        ctx.fillStyle = "#fde047";
        ctx.beginPath();
        ctx.arc(220, 130, 52, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(254, 240, 138, 0.35)";
        ctx.beginPath();
        ctx.arc(220, 130, 74, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      clouds.forEach(c => {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.scale(c.scale, c.scale);

        const shade = Math.round(255 - d * 135);
        ctx.fillStyle = `rgb(${shade}, ${shade + 4}, ${shade + 12})`;
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.arc(38, -12, 50, 0, Math.PI * 2);
        ctx.arc(82, -4, 44, 0, Math.PI * 2);
        ctx.arc(115, 10, 32, 0, Math.PI * 2);
        ctx.arc(-32, 12, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    function drawVillageHouse(x, y, roofColor) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "#fef3c7";
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 2;
      ctx.fillRect(-40, 0, 80, 48);
      ctx.strokeRect(-40, 0, 80, 48);

      ctx.fillStyle = "#78350f";
      ctx.fillRect(-12, 16, 24, 32);

      ctx.fillStyle = roofColor;
      ctx.beginPath();
      ctx.moveTo(-52, 4);
      ctx.lineTo(0, -32);
      ctx.lineTo(52, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    function drawBuffalo(x, y) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(18, -5, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(18, -11, 8, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.restore();
    }

    function drawLimestoneKarst(x, baseY, w, h) {
      ctx.save();
      ctx.translate(x, baseY);
      const grad = ctx.createLinearGradient(0, -h, 0, 0);
      grad.addColorStop(0, "#334155");
      grad.addColorStop(1, "#475569");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.quadraticCurveTo(-w * 0.4, -h * 0.85, 0, -h);
      ctx.quadraticCurveTo(w * 0.4, -h * 0.8, w / 2, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.arc(0, -h + 18, w * 0.22, Math.PI, 0);
      ctx.arc(-w * 0.18, -h * 0.65, w * 0.16, Math.PI, 0);
      ctx.fill();
      ctx.restore();
    }

    function drawSwayingTree(x, y, scale, seed) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      const windBend = gameState.windIntensity * 0.38 + Math.sin(gameState.time * 0.08 + seed) * (0.04 + gameState.windIntensity * 0.12);

      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(windBend * 40, -45, windBend * 85, -90);
      ctx.stroke();

      ctx.translate(windBend * 85, -90);
      ctx.rotate(windBend * 0.6);
      ctx.fillStyle = "#16a34a";
      ctx.beginPath();
      ctx.arc(0, -10, 36, 0, Math.PI * 2);
      ctx.arc(-26, 6, 28, 0, Math.PI * 2);
      ctx.arc(26, 8, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.arc(-8, -16, 26, 0, Math.PI * 2);
      ctx.arc(16, -4, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawBackgroundScenes() {
      const cam = gameState.cameraX;

      // Núi xa Parallax 0.35x
      ctx.save();
      ctx.translate(-cam * 0.35, 0);
      ctx.fillStyle = "#64748b";
      ctx.beginPath();
      ctx.moveTo(0, 510);
      for (let x = 0; x <= 3200; x += 400) {
        ctx.quadraticCurveTo(x + 200, 310 + (x % 300 === 0 ? 40 : -20), x + 400, 480);
      }
      ctx.lineTo(3200, 530);
      ctx.lineTo(0, 530);
      ctx.fill();
      ctx.restore();

      // Bờ sông Parallax 0.8x
      ctx.save();
      ctx.translate(-cam * 0.8, 0);

      const hillGrad = ctx.createLinearGradient(0, 420, 0, 535);
      hillGrad.addColorStop(0, "#4ade80");
      hillGrad.addColorStop(1, "#15803d");
      ctx.fillStyle = hillGrad;
      ctx.beginPath();
      ctx.moveTo(-200, 485);
      for (let x = -200; x <= 4400; x += 350) {
        ctx.quadraticCurveTo(x + 175, 425 + ((x / 350) % 2) * 35, x + 350, 488);
      }
      ctx.lineTo(4400, 540);
      ctx.lineTo(-200, 540);
      ctx.fill();

      drawVillageHouse(320, 425, "#f59e0b");
      drawVillageHouse(620, 435, "#eab308");

      ctx.fillStyle = "rgba(250, 204, 21, 0.45)";
      ctx.fillRect(1050, 465, 850, 45);
      drawBuffalo(1350, 475);
      drawBuffalo(1620, 482);

      drawLimestoneKarst(2150, 495, 130, 190);
      drawLimestoneKarst(2480, 500, 155, 230);
      drawLimestoneKarst(2760, 495, 115, 165);

      const treeWorldPositions = [150, 480, 820, 1080, 1280, 1520, 1780, 2020, 2350, 2650, 2980, 3280, 3550];
      treeWorldPositions.forEach((tx, idx) => {
        drawSwayingTree(tx, 485 + (idx % 2) * 10, 0.78 + (idx % 3) * 0.16, idx);
      });

      ctx.restore();
    }

    function drawWaveLayer(baseY, amplitude, freq, speed, color) {
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, 900);
      for (let x = 0; x <= 1600; x += 25) {
        const y = baseY + Math.sin(x * freq + gameState.time * speed) * amplitude
                        + Math.cos(x * freq * 1.8 - gameState.time * speed * 0.7) * (amplitude * 0.4);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(1600, 900);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawRiverBack() {
      const riverGrad = ctx.createLinearGradient(0, 500, 0, 900);
      const d = gameState.skyDarkness;
      riverGrad.addColorStop(0, d > 0.5 ? "#0369a1" : "#0ea5e9");
      riverGrad.addColorStop(0.5, d > 0.5 ? "#075985" : "#0284c7");
      riverGrad.addColorStop(1, "#0c4a6e");

      ctx.fillStyle = riverGrad;
      ctx.fillRect(0, 505, 1600, 395);

      drawWaveLayer(535, 8 + gameState.windIntensity * 14, 0.012, 0.06, "rgba(125, 211, 252, 0.28)");
      drawWaveLayer(575, 10 + gameState.windIntensity * 18, 0.015, -0.08, "rgba(56, 189, 248, 0.35)");
    }

    function drawShoreDockAndSchool() {
      ctx.save();

      const landGrad = ctx.createLinearGradient(1180, 420, 1600, 750);
      landGrad.addColorStop(0, "#4ade80");
      landGrad.addColorStop(0.4, "#22c55e");
      landGrad.addColorStop(1, "#15803d");

      ctx.fillStyle = landGrad;
      ctx.beginPath();
      ctx.moveTo(1230, 540);
      ctx.quadraticCurveTo(1320, 430, 1600, 420);
      ctx.lineTo(1600, 760);
      ctx.quadraticCurveTo(1360, 730, 1220, 600);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#166534";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = "#fde68a";
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(1245, 535);
      ctx.quadraticCurveTo(1345, 505, 1415, 445);
      ctx.lineTo(1475, 455);
      ctx.quadraticCurveTo(1395, 535, 1265, 565);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#78350f";
      [1175, 1215, 1255].forEach(px => {
        ctx.fillRect(px, 545, 12, 65);
      });
      ctx.fillStyle = "#92400e";
      ctx.beginPath();
      ctx.roundRect(1160, 532, 115, 22, 6);
      ctx.fill();
      ctx.strokeStyle = "#451a03";
      ctx.lineWidth = 2;
      ctx.stroke();

      const schoolX = 1355;
      const schoolY = 265;

      ctx.fillStyle = "#fef08a";
      ctx.strokeStyle = "#ca8a04";
      ctx.lineWidth = 3;
      ctx.fillRect(schoolX, schoolY + 60, 220, 130);
      ctx.strokeRect(schoolX, schoolY + 60, 220, 130);

      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.moveTo(schoolX - 18, schoolY + 62);
      ctx.lineTo(schoolX + 110, schoolY + 5);
      ctx.lineTo(schoolX + 238, schoolY + 62);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#991b1b";
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(schoolX + 110, schoolY + 40, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#7c2d12";
      ctx.beginPath();
      ctx.roundRect(schoolX + 88, schoolY + 115, 44, 75, [12, 12, 0, 0]);
      ctx.fill();

      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(schoolX + 24, schoolY + 105, 40, 42);
      ctx.fillRect(schoolX + 156, schoolY + 105, 40, 42);
      ctx.strokeStyle = "#0284c7";
      ctx.strokeRect(schoolX + 24, schoolY + 105, 40, 42);
      ctx.strokeRect(schoolX + 156, schoolY + 105, 40, 42);

      const gateX = 1390;
      const gateY = 385;
      ctx.fillStyle = "#f97316";
      ctx.fillRect(gateX, gateY, 16, 75);
      ctx.fillRect(gateX + 95, gateY, 16, 75);

      ctx.fillStyle = "#1d4ed8";
      ctx.beginPath();
      ctx.roundRect(gateX - 12, gateY - 26, 135, 30, 8);
      ctx.fill();
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 13px 'Baloo 2', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("TRƯỜNG HỌC", gateX + 55, gateY - 7);

      const flagPoleX = schoolX + 45;
      const flagPoleY = schoolY - 55;
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(flagPoleX, schoolY + 25);
      ctx.lineTo(flagPoleX, flagPoleY);
      ctx.stroke();

      const waveOffset = Math.sin(gameState.time * 0.18) * 6;
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(flagPoleX, flagPoleY);
      ctx.quadraticCurveTo(flagPoleX + 24, flagPoleY + waveOffset, flagPoleX + 48, flagPoleY + 4);
      ctx.lineTo(flagPoleX + 48, flagPoleY + 32);
      ctx.quadraticCurveTo(flagPoleX + 24, flagPoleY + 28 + waveOffset, flagPoleX, flagPoleY + 28);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(flagPoleX + 23, flagPoleY + 15, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawStartAndDest() {
      const cam = gameState.cameraX;

      if (cam < 900) {
        ctx.save();
        ctx.translate(-cam, 0);
        ctx.fillStyle = "#16a34a";
        ctx.beginPath();
        ctx.moveTo(0, 480);
        ctx.quadraticCurveTo(120, 495, 165, 575);
        ctx.lineTo(0, 610);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#78350f";
        ctx.fillRect(90, 540, 10, 55);
        ctx.fillRect(140, 540, 10, 55);
        ctx.fillStyle = "#92400e";
        ctx.beginPath();
        ctx.roundRect(40, 528, 125, 18, 5);
        ctx.fill();

        ctx.fillStyle = "#fef08a";
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 2.5;
        ctx.fillRect(55, 485, 8, 45);
        ctx.beginPath();
        ctx.roundRect(15, 462, 95, 26, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#78350f";
        ctx.font = "800 11px 'Baloo 2', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("BẾN ĐÒ LÀNG", 62, 479);
        ctx.restore();
      }

      const schoolOffset = TOTAL_CAMERA_DISTANCE - cam;
      if (schoolOffset < 1600) {
        ctx.save();
        ctx.translate(schoolOffset, 0);
        drawShoreDockAndSchool();
        ctx.restore();
      }
    }

    function drawTeacherCharacter(tx, ty) {
      ctx.save();
      ctx.translate(tx, ty);

      const isFemale = gameState.teacherGender === 'female';

      ctx.fillStyle = isFemale ? "#ec4899" : "#2563eb";
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-18, -28, 36, 48, 12);
      ctx.fill();
      ctx.stroke();

      if (!isFemale) {
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.moveTo(0, -24);
        ctx.lineTo(-4, -8);
        ctx.lineTo(0, -4);
        ctx.lineTo(4, -8);
        ctx.closePath();
        ctx.fill();
      } else {
        const windFlap = gameState.windIntensity * 14;
        ctx.fillStyle = "#f472b6";
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.quadraticCurveTo(-28 - windFlap, 18, -22 - windFlap, 32);
        ctx.lineTo(-4, 22);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = "#fed7aa";
      ctx.beginPath();
      ctx.arc(0, -46, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#1e293b";
      if (isFemale) {
        ctx.beginPath();
        ctx.arc(-16, -48, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(6, -48, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#be123c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(5, -42, 5, 0.1, Math.PI * 0.85);
      ctx.stroke();

      ctx.fillStyle = "#fef08a";
      ctx.strokeStyle = "#a16207";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-28, -54);
      ctx.lineTo(0, -76);
      ctx.lineTo(28, -54);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = isFemale ? "#ec4899" : "#92400e";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-10, -54);
      ctx.quadraticCurveTo(0, -32, 10, -54);
      ctx.stroke();

      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.beginPath();
      ctx.roundRect(-38, -104, 76, 22, 8);
      ctx.fill();
      ctx.fillStyle = "#fde047";
      ctx.font = "800 12px 'Nunito', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(isFemale ? "CÔ GIÁO" : "THẦY GIÁO", 0, -89);

      ctx.restore();
    }

    function drawStudentCharacter(student, onBoat = true) {
      ctx.save();

      if (onBoat) {
        ctx.translate(student.seatOffsetX, student.seatOffsetY);
      } else {
        ctx.translate(student.worldX, student.worldY);
      }

      const isSleeping = student.state === 'sleeping';
      const isDrowsy = student.drowsy && gameState.phase === 1;
      const isWalking = student.state === 'walking';
      const isStanding = student.state === 'standing';

      if (isSleeping) {
        const sleepNod = Math.sin(student.headNodPhase) * 0.12 + 0.38;
        ctx.translate(0, 6);
        ctx.rotate(sleepNod);
      } else if (isDrowsy) {
        ctx.rotate(Math.sin(gameState.time * 0.15 + student.id) * 0.12);
      } else if (isStanding) {
        ctx.translate(0, -10);
      }

      if (isWalking) {
        const legSwing = Math.sin(student.stepPhase) * 8;
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-4, 6);
        ctx.lineTo(-4 - legSwing, 22);
        ctx.moveTo(4, 6);
        ctx.lineTo(4 + legSwing, 22);
        ctx.stroke();
      }

      ctx.fillStyle = student.color;
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-13, -18, 26, 28, 9);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(-10, -17);
      ctx.lineTo(10, -17);
      ctx.lineTo(0, -6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ffedd5";
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -31, 13.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(0, -34, 13.5, Math.PI, Math.PI * 2);
      ctx.fill();

      if (student.isGirl) {
        ctx.beginPath();
        ctx.arc(-14, -33, 5, 0, Math.PI * 2);
        ctx.arc(14, -33, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      if (isSleeping || isDrowsy) {
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(-4.5, -31, 3, 0.15, Math.PI - 0.15);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(4.5, -31, 3, 0.15, Math.PI - 0.15);
        ctx.stroke();

        ctx.fillStyle = "#f43f5e";
        ctx.beginPath();
        ctx.arc(0, -24, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(-4.5, -31, 2, 0, Math.PI * 2);
        ctx.arc(4.5, -31, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#e11d48";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, -26, 4, 0.15, Math.PI - 0.15);
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawStudentNameLabel(student, baseX, baseY) {
      ctx.save();

      const tierOffset = student.labelTier * 22;
      const labelY = baseY - 62 - tierOffset;

      const isSleeping = student.state === 'sleeping';

      ctx.strokeStyle = isSleeping ? "rgba(168, 85, 247, 0.8)" : "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(baseX, labelY + 10);
      ctx.lineTo(baseX, baseY - 45);
      ctx.stroke();

      ctx.font = "800 12px 'Nunito', sans-serif";
      const displayText = isSleeping ? `💤 ${student.name}` : student.name;
      const textWidth = ctx.measureText(displayText).width;
      const boxW = textWidth + 14;
      const boxH = 20;

      ctx.fillStyle = student.called
        ? "#6b21a8"
        : isSleeping
          ? "#9333ea"
          : "rgba(255, 255, 255, 0.94)";
      ctx.strokeStyle = isSleeping ? "#fde047" : "#0284c7";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.roundRect(baseX - boxW / 2, labelY - boxH / 2, boxW, boxH, 7);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isSleeping ? "#fef08a" : "#0f172a";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(displayText, baseX, labelY + 0.5);

      ctx.restore();
    }

    function drawTeacherSpeechBubble() {
      ctx.save();
      const cosA = Math.cos(gameState.boat.angle);
      const sinA = Math.sin(gameState.boat.angle);
      const tx = gameState.boat.x + 215 * cosA - (-22) * sinA;
      const ty = gameState.boat.y + 215 * sinA + (-22) * cosA;

      const bubbleX = Math.min(1320, Math.max(260, tx - 40));
      const bubbleY = ty - 145;

      ctx.font = "800 15px 'Nunito', sans-serif";
      const text = gameState.teacherBubble.text;
      const w = Math.max(220, ctx.measureText(text).width + 36);
      const h = 44;

      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 3.5;

      ctx.beginPath();
      ctx.roundRect(bubbleX - w / 2, bubbleY - h / 2, w, h, 16);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bubbleX + 15, bubbleY + h / 2);
      ctx.lineTo(bubbleX + 32, bubbleY + h / 2 + 14);
      ctx.lineTo(bubbleX + 38, bubbleY + h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#1e293b";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, bubbleX, bubbleY);
      ctx.restore();
    }

    function drawBoatAndPassengers() {
      ctx.save();
      ctx.translate(gameState.boat.x, gameState.boat.y);
      ctx.rotate(gameState.boat.angle);

      gameState.students
        .filter(s => s.row === 0 && (s.state === 'sitting' || s.state === 'sleeping' || s.state === 'standing'))
        .forEach(s => drawStudentCharacter(s, true));

      gameState.students
        .filter(s => s.row === 1 && (s.state === 'sitting' || s.state === 'sleeping' || s.state === 'standing'))
        .forEach(s => drawStudentCharacter(s, true));

      drawTeacherCharacter(215, -22);

      const boatGrad = ctx.createLinearGradient(0, -15, 0, 65);
      boatGrad.addColorStop(0, "#b45309");
      boatGrad.addColorStop(0.5, "#92400e");
      boatGrad.addColorStop(1, "#451a03");

      ctx.fillStyle = boatGrad;
      ctx.strokeStyle = "#451a03";
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.moveTo(-290, -18);
      ctx.quadraticCurveTo(-310, -32, -275, 25);
      ctx.quadraticCurveTo(-240, 58, -160, 58);
      ctx.lineTo(175, 58);
      ctx.quadraticCurveTo(255, 58, 295, -22);
      ctx.quadraticCurveTo(275, -12, 235, -10);
      ctx.lineTo(-245, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-278, -10);
      ctx.quadraticCurveTo(0, -2, 282, -16);
      ctx.stroke();

      ctx.strokeStyle = "rgba(69, 26, 3, 0.45)";
      ctx.lineWidth = 2;
      for (let bx = -200; bx <= 180; bx += 55) {
        ctx.beginPath();
        ctx.moveTo(bx, -6);
        ctx.lineTo(bx - 8, 55);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(195, -5);
      ctx.rotate(gameState.boat.oarAngle);
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-18, -32);
      ctx.lineTo(35, 68);
      ctx.stroke();

      ctx.fillStyle = "#d97706";
      ctx.beginPath();
      ctx.ellipse(38, 72, 9, 22, -0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      gameState.students
        .filter(s => s.state === 'sitting' || s.state === 'sleeping' || s.state === 'standing')
        .forEach(s => drawStudentNameLabel(s, s.seatOffsetX, s.seatOffsetY));

      ctx.restore();

      if (gameState.teacherBubble.visible) {
        drawTeacherSpeechBubble();
      }
    }

    function drawWalkingStudents() {
      const walkingList = gameState.students.filter(s => s.state === 'walking');
      walkingList.forEach(s => {
        drawStudentCharacter(s, false);
        drawStudentNameLabel(s, s.worldX, s.worldY);
      });
    }

    function drawRiverFront() {
      drawWaveLayer(625, 12 + gameState.windIntensity * 22, 0.016, 0.09, "rgba(14, 165, 233, 0.65)");
      drawWaveLayer(675, 10 + gameState.windIntensity * 16, 0.013, -0.07, "rgba(3, 105, 161, 0.8)");
    }

    function drawWeatherAndZzz() {
      if (gameState.windIntensity > 0.35) {
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${gameState.windIntensity * 0.35})`;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        for (let i = 0; i < 10; i++) {
          const wx = ((gameState.time * (12 + i * 2) + i * 230) % 1900) - 150;
          const wy = 90 + (i * 53) % 450;
          ctx.beginPath();
          ctx.moveTo(wx, wy);
          ctx.lineTo(wx + 95 + gameState.windIntensity * 80, wy + 8);
          ctx.stroke();
        }
        ctx.restore();
      }

      leaves.forEach(l => {
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rot);
        ctx.fillStyle = l.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, l.size, l.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      zzzParticles.forEach(z => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, z.alpha);
        ctx.translate(z.x, z.y);
        ctx.scale(z.scale, z.scale);
        ctx.font = "900 20px 'Baloo 2', cursive";
        ctx.fillStyle = "#fde047";
        ctx.strokeStyle = "#581c87";
        ctx.lineWidth = 3;
        ctx.strokeText("Zzz", 0, 0);
        ctx.fillText("Zzz", 0, 0);
        ctx.restore();
      });
    }

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawSky();
      drawBackgroundScenes();
      drawRiverBack();
      drawStartAndDest();
      drawBoatAndPassengers();
      drawWalkingStudents();
      drawRiverFront();
      drawWeatherAndZzz();
    }

    // Canvas click handler
    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      for (let i = gameState.students.length - 1; i >= 0; i--) {
        const s = gameState.students[i];
        if ((s.state === 'sitting' || s.state === 'sleeping') && !s.called) {
          const pos = getStudentBoatWorldPos(s);
          const dist = Math.hypot(clickX - pos.x, clickY - (pos.y - 25));
          if (dist < 32) {
            sound.init();
            revealAndCall(s.id);
            break;
          }
        }
      }
    };

    canvas.addEventListener('click', handleCanvasClick);

    // Main animation loop
    let animId = null;
    function loop(now) {
      update(now);
      render();
      animId = requestAnimationFrame(loop);
    }

    initEnvironment();
    buildStudents();
    animId = requestAnimationFrame(loop);

    // Save engine methods to ref
    engineRef.current = {
      sound,
      gameState,
      startJourney,
      triggerAutoDock,
      manualCallSleeping,
      revealAndCall,
      resetGame,
      buildStudents,
      destroy: () => {
        if (animId) cancelAnimationFrame(animId);
        sound.stopWindAmbience();
        canvas.removeEventListener('click', handleCanvasClick);
        if (spotlightTimerId) clearTimeout(spotlightTimerId);
      }
    };

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [isOpen]);

  // Xử lý các nút điều khiển
  const handleStart = () => {
    engineRef.current?.startJourney();
  };

  const handlePause = () => {
    if (!engineRef.current) return;
    const gs = engineRef.current.gameState;
    gs.paused = !gs.paused;
    gs.lastFrameTimestamp = performance.now();
    setIsPaused(gs.paused);
    if (gs.paused) {
      engineRef.current.sound.stopWindAmbience();
    } else if (gs.phase === 1) {
      engineRef.current.sound.startWindAmbience(gs.windIntensity);
    }
  };

  const handleDock = () => {
    engineRef.current?.triggerAutoDock();
  };

  const handleCall = () => {
    engineRef.current?.manualCallSleeping();
  };

  const handleReset = () => {
    engineRef.current?.resetGame();
  };

  const handleToggleSound = () => {
    if (!engineRef.current) return;
    const enabled = engineRef.current.sound.toggle();
    setSoundEnabled(enabled);
  };

  const handleDurationSelectChange = (e) => {
    const val = parseInt(e.target.value, 10) || 20;
    setQuickDuration(String(val));
    if (engineRef.current) {
      engineRef.current.gameState.totalDuration = val;
      if (engineRef.current.gameState.phase === 0) {
        engineRef.current.gameState.remainingTime = val;
        setTimerDisplay(
          `${String(Math.floor(val / 60)).padStart(2, '0')}:${String(val % 60).padStart(2, '0')}`
        );
      }
    }
  };

  // Cài đặt modal
  const handleOpenSettings = () => {
    if (!engineRef.current) return;
    const gs = engineRef.current.gameState;
    setSettingsForm({
      studentListText: gs.studentNames.join('\n'),
      duration: gs.totalDuration,
      teacherGender: gs.teacherGender,
      callMode: gs.callMode,
      callCount: gs.callCount,
      manualSelectedIds: Array.from(gs.manualSelectedIndices)
    });
    setShowSettings(true);
  };

  const handleSaveSettings = () => {
    if (!engineRef.current) return;
    const gs = engineRef.current.gameState;

    const parsedNames = settingsForm.studentListText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (parsedNames.length > 0) {
      gs.studentNames = parsedNames;
    }
    gs.totalDuration = settingsForm.duration || 20;
    gs.teacherGender = settingsForm.teacherGender;
    gs.callMode = settingsForm.callMode;
    gs.callCount = settingsForm.callCount;
    gs.manualSelectedIndices = new Set(settingsForm.manualSelectedIds);

    setQuickDuration(String(gs.totalDuration));
    setShowSettings(false);
    engineRef.current.resetGame();
  };

  // Trao điểm nề nếp cho học sinh bị gọi tên
  const handleOpenAwardModal = (studentObj) => {
    setSelectedStudentForAward(studentObj);
  };

  const handleConfirmAward = (pts) => {
    if (!selectedStudentForAward) return;
    const lmsId = selectedStudentForAward.lmsId || selectedStudentForAward.id;
    if (lmsId) {
      onAwardPointsToStudent?.(lmsId, pts, awardReason);
    }
    setSelectedStudentForAward(null);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 select-none backdrop-blur-sm animate-fade-in p-2 md:p-4"
    >
      <div className="relative w-full max-w-[1600px] aspect-video max-h-[96vh] bg-[#87CEEB] rounded-2xl md:rounded-3xl shadow-2xl border-4 border-amber-400/80 overflow-hidden flex flex-col">
        
        {/* CANVAS VẼ TOÀN BỘ GAME */}
        <canvas
          ref={canvasRef}
          width="1600"
          height="900"
          className="w-full h-full block cursor-pointer"
        />

        {/* HEADER: Tiêu đề, Logo, Đồng hồ, Giai đoạn & Thống kê */}
        <div className="absolute top-2.5 left-3 right-3 flex justify-between items-start pointer-events-none z-10">
          {/* Logo & Tên Game */}
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 md:px-5 md:py-2 rounded-2xl shadow-lg border-2 border-amber-400 flex items-center gap-2.5 pointer-events-auto">
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl md:text-2xl shadow-inner">
              <i className="fa-solid fa-sailboat"></i>
            </div>
            <div>
              <h1 className="font-title text-lg md:text-2xl font-extrabold text-amber-900 leading-none tracking-wide">
                NGƯỜI LÁI ĐÒ
              </h1>
              <p className="text-[10px] md:text-xs text-amber-700 font-bold mt-0.5">
                {currentClass ? `Lớp ${currentClass.name}` : 'Trò chơi nề nếp & trả bài'}
              </p>
            </div>
          </div>

          {/* Bảng hiển thị Thời gian, Giai đoạn, Sĩ số & Nút điều khiển */}
          <div className="flex items-center gap-2 pointer-events-auto flex-wrap justify-end">
            {/* Đồng hồ đếm ngược & Chọn nhanh thời gian */}
            <div className="bg-rose-600 text-white px-3 py-1.5 md:px-4 md:py-1.5 rounded-2xl shadow-lg border-2 border-rose-300 flex items-center gap-2 font-title">
              <i className="fa-solid fa-clock text-yellow-300 text-base md:text-lg animate-pulse"></i>
              <span className="text-lg md:text-2xl font-extrabold tracking-wider min-w-[55px] text-center">
                {timerDisplay}
              </span>
              <select
                value={quickDuration}
                onChange={handleDurationSelectChange}
                className="bg-rose-800 hover:bg-rose-900 text-yellow-200 text-xs font-sans font-extrabold px-2 py-1 rounded-lg border border-rose-400 focus:outline-none cursor-pointer"
                title="Chọn thời gian thuyền di chuyển"
              >
                <option value="10">10 giây</option>
                <option value="15">15 giây</option>
                <option value="20">20 giây</option>
                <option value="30">30 giây</option>
                <option value="45">45 giây</option>
                <option value="60">60 giây</option>
              </select>
            </div>

            {/* Badge Giai đoạn */}
            <div className="hidden sm:flex bg-sky-900/90 backdrop-blur-md text-white px-3.5 py-1.5 md:py-2 rounded-2xl shadow-lg border-2 border-sky-400 items-center gap-2 font-bold text-xs md:text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{phaseText}</span>
            </div>

            {/* Thống kê Sĩ số */}
            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 md:py-2 rounded-2xl shadow-lg border-2 border-slate-300 flex items-center gap-2.5 md:gap-3.5 text-xs md:text-sm font-extrabold">
              <div className="flex items-center gap-1.5 text-blue-700" title="Tổng số học sinh">
                <i className="fa-solid fa-users text-sm md:text-base"></i>
                <span>Sĩ số: <strong>{statTotal}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-700" title="Học sinh ngủ quên bị gọi tên">
                <i className="fa-solid fa-bed text-sm md:text-base"></i>
                <span>Ngủ quên: <strong>{statSleeping}</strong></span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-emerald-700" title="Học sinh vào trường">
                <i className="fa-solid fa-school text-sm md:text-base"></i>
                <span>Vào trường: <strong>{statSchool}</strong></span>
              </div>
            </div>

            {/* Nút Âm thanh */}
            <button
              onClick={handleToggleSound}
              className="btn-game bg-amber-500 hover:bg-amber-400 border-b-4 border-amber-700 active:translate-y-1 active:border-b-2 text-white w-9 h-9 md:w-10 md:h-10 rounded-2xl shadow-lg flex items-center justify-center text-base"
              title="Bật/Tắt âm thanh"
            >
              <i className={`fa-solid ${soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
            </button>

            {/* Nút Cài đặt */}
            <button
              onClick={handleOpenSettings}
              className="btn-game bg-indigo-600 hover:bg-indigo-500 border-b-4 border-indigo-800 active:translate-y-1 active:border-b-2 text-white px-3 md:px-3.5 h-9 md:h-10 rounded-2xl shadow-lg flex items-center gap-1.5 font-bold text-xs md:text-sm"
              title="Thiết lập danh sách học sinh & thời gian"
            >
              <i className="fa-solid fa-sliders"></i>
              <span className="hidden md:inline">Cài đặt</span>
            </button>

            {/* Toàn màn hình */}
            <button
              onClick={toggleFullscreen}
              className="btn-game bg-slate-700 hover:bg-slate-600 border-b-4 border-slate-900 active:translate-y-1 active:border-b-2 text-white w-9 h-9 md:w-10 md:h-10 rounded-2xl shadow-lg flex items-center justify-center"
              title="Toàn màn hình"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Thoát */}
            <button
              onClick={onClose}
              className="btn-game bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-800 active:translate-y-1 active:border-b-2 text-white w-9 h-9 md:w-10 md:h-10 rounded-2xl shadow-lg flex items-center justify-center"
              title="Đóng game (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BANNER THÔNG BÁO DIỄN BIẾN */}
        <div
          className={`absolute top-16 md:top-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none transition-all duration-300 w-full max-w-2xl px-4 flex justify-center ${
            narrative.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 px-5 py-2 md:px-6 md:py-2.5 rounded-full shadow-2xl border-4 border-amber-500 flex items-center gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-amber-500 text-white flex items-center justify-center text-base md:text-lg shrink-0 shadow">
              <i className={`fa-solid ${narrative.icon}`}></i>
            </div>
            <p className="font-title text-sm md:text-lg font-bold text-slate-800 text-center leading-snug">
              {narrative.text}
            </p>
          </div>
        </div>

        {/* HIỂN THỊ NỔI BẬT HỌC SINH NGỦ QUÊN BỊ GỌI TÊN (SPOTLIGHT) */}
        {spotlight.visible && (
          <div className="absolute top-28 md:top-36 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce-in">
            <div className="bg-gradient-to-b from-purple-700 via-indigo-800 to-slate-900 text-white px-7 py-4 md:px-10 md:py-5 rounded-3xl shadow-[0_20px_60px_rgba(88,28,135,0.9)] border-4 border-yellow-300 text-center min-w-[320px] md:min-w-[420px]">
              <div className="text-xs uppercase tracking-widest text-yellow-200 font-extrabold mb-1 flex items-center justify-center gap-2">
                <i className="fa-solid fa-bell animate-bounce text-yellow-300"></i>
                <span>{spotlight.teacherTitle}</span>
                <i className="fa-solid fa-moon text-yellow-300"></i>
              </div>
              <div className="font-title text-3xl md:text-5xl font-extrabold text-yellow-300 drop-shadow-lg my-1">
                {spotlight.studentName}
              </div>
              <div className="text-xs md:text-sm font-bold text-purple-100 mt-1 bg-white/10 px-4 py-1 rounded-full inline-block">
                <i className="fa-solid fa-bullhorn mr-1 text-amber-300"></i>
                {spotlight.subtext}
              </div>

              {/* Nút cộng điểm nhanh nếu có handler */}
              {onAwardPointsToStudent && spotlight.studentObj && (
                <div className="mt-3 pointer-events-auto flex justify-center">
                  <button
                    onClick={() => handleOpenAwardModal(spotlight.studentObj)}
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-purple-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-md border border-yellow-200 flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Cộng Điểm Nề Nếp ⭐</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* THANH ĐIỀU KHIỂN CHÍNH Ở ĐÁY MÀN HÌNH */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-full max-w-4xl px-3 pointer-events-none">
          <div className="bg-slate-900/85 backdrop-blur-md p-2 md:p-2.5 rounded-3xl shadow-2xl border-2 border-slate-600/80 flex flex-wrap items-center justify-center gap-2 pointer-events-auto">
            
            {/* 1. BẮT ĐẦU */}
            <button
              onClick={handleStart}
              className="btn-game bg-emerald-500 hover:bg-emerald-400 border-b-4 border-emerald-700 active:translate-y-1 active:border-b-2 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-2xl font-title font-bold text-sm md:text-base flex items-center gap-2 shadow-lg"
            >
              <i className="fa-solid fa-play"></i>
              <span>BẮT ĐẦU</span>
            </button>

            {/* 2. TẠM DỪNG / TIẾP TỤC */}
            <button
              onClick={handlePause}
              disabled={!isStarted}
              className="btn-game bg-amber-500 hover:bg-amber-400 border-b-4 border-amber-700 active:translate-y-1 active:border-b-2 text-white px-3.5 md:px-4 py-2 md:py-2.5 rounded-2xl font-title font-bold text-sm md:text-base flex items-center gap-2 shadow-lg disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <i className={`fa-solid ${isPaused ? 'fa-play' : 'fa-pause'}`}></i>
              <span>{isPaused ? 'TIẾP TỤC' : 'TẠM DỪNG'}</span>
            </button>

            {/* 3. CẬP BẾN NGAY */}
            <button
              onClick={handleDock}
              className="btn-game bg-sky-500 hover:bg-sky-400 border-b-4 border-sky-700 active:translate-y-1 active:border-b-2 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-2xl font-title font-bold text-sm md:text-base flex items-center gap-2 shadow-lg"
            >
              <i className="fa-solid fa-anchor"></i>
              <span>CHO THUYỀN CẬP BẾN</span>
            </button>

            {/* 4. GỌI TÊN HỌC SINH NGỦ QUÊN */}
            <button
              onClick={handleCall}
              className="btn-game bg-purple-600 hover:bg-purple-500 border-b-4 border-purple-800 active:translate-y-1 active:border-b-2 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-2xl font-title font-bold text-sm md:text-base flex items-center gap-2 shadow-lg"
            >
              <i className="fa-solid fa-bullhorn"></i>
              <span>GỌI TÊN HS NGỦ QUÊN</span>
            </button>

            {/* 5. CHƠI LẠI */}
            <button
              onClick={handleReset}
              className="btn-game bg-rose-500 hover:bg-rose-400 border-b-4 border-rose-700 active:translate-y-1 active:border-b-2 text-white px-3.5 md:px-4 py-2 md:py-2.5 rounded-2xl font-title font-bold text-sm md:text-base flex items-center gap-2 shadow-lg"
            >
              <i className="fa-solid fa-rotate-right"></i>
              <span>CHƠI LẠI</span>
            </button>

          </div>
        </div>

        {/* MODAL CÀI ĐẶT DANH SÁCH & THỜI GIAN */}
        {showSettings && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border-4 border-indigo-500 w-full max-w-4xl max-h-[92%] flex flex-col overflow-hidden animate-pop">
              
              {/* Header Modal */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-chalkboard-user text-2xl text-yellow-300"></i>
                  <div>
                    <h2 className="font-title text-xl md:text-2xl font-extrabold leading-none">
                      THIẾT LẬP TRÒ CHƠI NGƯỜI LÁI ĐÒ
                    </h2>
                    <p className="text-xs text-indigo-100 mt-0.5">
                      Đồng bộ danh sách học sinh Lớp {currentClass?.name || '7A6'} trong LMS Sổ Chủ Nhiệm
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg transition"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-5 md:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-5 flex-1">
                {/* Cột trái: Nhập danh sách */}
                <div className="md:col-span-6 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-bold text-slate-700 text-sm flex items-center gap-2">
                      <i className="fa-solid fa-list-ol text-indigo-600"></i>
                      Danh sách học sinh (Mỗi dòng 1 tên):
                    </label>
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-extrabold px-2.5 py-1 rounded-full">
                      {settingsForm.studentListText.split('\n').filter(s => s.trim().length > 0).length} học sinh
                    </span>
                  </div>
                  <textarea
                    rows={9}
                    value={settingsForm.studentListText}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, studentListText: e.target.value }))}
                    className="w-full flex-1 p-3 rounded-2xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-none font-bold text-slate-700 text-sm leading-relaxed resize-none shadow-inner"
                    placeholder="Nhập tên học sinh, mỗi dòng 1 em..."
                  />
                  {/* Nút nạp lại từ LMS */}
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (lmsStudents && lmsStudents.length > 0) {
                          const names = lmsStudents.map(s => s.name || s.full_name);
                          setSettingsForm(prev => ({ ...prev, studentListText: names.join('\n') }));
                        }
                      }}
                      className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold px-3 py-1.5 rounded-xl border border-indigo-200 transition"
                    >
                      <i className="fa-solid fa-rotate mr-1"></i> Nạp lại từ Lớp {currentClass?.name || '7A6'}
                    </button>
                  </div>
                </div>

                {/* Cột phải: Thiết lập thời gian, nhân vật & học sinh ngủ quên */}
                <div className="md:col-span-6 flex flex-col gap-3.5">
                  {/* Thời gian */}
                  <div className="bg-rose-50 p-3 rounded-2xl border-2 border-rose-200">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="font-bold text-rose-900 text-xs md:text-sm">
                        <i className="fa-solid fa-hourglass-half mr-1.5"></i>Thời gian thuyền di chuyển (giây):
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="180"
                        value={settingsForm.duration}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, duration: parseInt(e.target.value, 10) || 20 }))}
                        className="w-16 px-2 py-0.5 rounded-xl border-2 border-rose-400 font-extrabold text-center text-rose-900 text-sm"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[10, 15, 20, 30, 45, 60].map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSettingsForm(prev => ({ ...prev, duration: s }))}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition ${
                            settingsForm.duration === s
                              ? 'bg-rose-600 text-white border-rose-700'
                              : 'bg-white border-rose-300 text-rose-800 hover:bg-rose-100'
                          }`}
                        >
                          {s}s
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nhân vật Cô / Thầy */}
                  <div className="bg-amber-50 p-3 rounded-2xl border-2 border-amber-200">
                    <label className="font-bold text-amber-900 text-xs md:text-sm block mb-1.5">
                      <i className="fa-solid fa-user-tie mr-1.5"></i>Chọn nhân vật Người Lái Đò:
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <label
                        className={`p-2 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition ${
                          settingsForm.teacherGender === 'female'
                            ? 'border-amber-600 bg-amber-100'
                            : 'border-amber-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="teacherGender"
                          value="female"
                          checked={settingsForm.teacherGender === 'female'}
                          onChange={() => setSettingsForm(prev => ({ ...prev, teacherGender: 'female' }))}
                          className="hidden"
                        />
                        <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-sm">Cô</div>
                        <div>
                          <div className="font-extrabold text-slate-800 text-xs">Cô Giáo</div>
                          <div className="text-[10px] text-slate-500">Áo dài & Nón lá</div>
                        </div>
                      </label>
                      <label
                        className={`p-2 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition ${
                          settingsForm.teacherGender === 'male'
                            ? 'border-amber-600 bg-amber-100'
                            : 'border-amber-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="teacherGender"
                          value="male"
                          checked={settingsForm.teacherGender === 'male'}
                          onChange={() => setSettingsForm(prev => ({ ...prev, teacherGender: 'male' }))}
                          className="hidden"
                        />
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">Thầy</div>
                        <div>
                          <div className="font-extrabold text-slate-800 text-xs">Thầy Giáo</div>
                          <div className="text-[10px] text-slate-500">Sơ mi & Nón lá</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Thiết lập số học sinh ngủ quên */}
                  <div className="bg-purple-50 p-3 rounded-2xl border-2 border-purple-200">
                    <label className="font-bold text-purple-900 text-xs md:text-sm block mb-1.5">
                      <i className="fa-solid fa-bullseye mr-1.5"></i>Số học sinh ngủ quên bị gọi tên cuối giờ:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={settingsForm.callCount}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, callCount: parseInt(e.target.value, 10) || 1 }))}
                        className="w-16 px-2.5 py-1 rounded-xl border-2 border-purple-400 font-extrabold text-center text-purple-900 text-sm"
                      />
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 5].map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setSettingsForm(prev => ({ ...prev, callCount: c }))}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition ${
                              settingsForm.callCount === c
                                ? 'bg-purple-600 text-white border-purple-700'
                                : 'bg-white border-purple-300 text-purple-800 hover:bg-purple-100'
                            }`}
                          >
                            {c} HS
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Footer Modal */}
              <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-semibold">
                  Mẹo: Khi thuyền cập bến, cả lớp sẽ hồi hộp xem ai là người ngủ quên trên thuyền!
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-sm text-slate-700 hover:bg-slate-200"
                  >
                    HỦY
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className="btn-game bg-indigo-600 hover:bg-indigo-500 border-b-4 border-indigo-800 text-white px-5 py-2 rounded-xl font-title font-bold text-sm shadow-md"
                  >
                    <i className="fa-solid fa-check mr-1.5"></i> LƯU & ÁP DỤNG
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* MODAL CỘNG ĐIỂM NỀ NẾP CHO HỌC SINH BỊ GỌI TÊN */}
        {selectedStudentForAward && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border-4 border-amber-400 w-full max-w-md p-5 flex flex-col animate-pop">
              <div className="flex items-center gap-3 mb-3 border-b border-slate-200 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow">
                  ⭐
                </div>
                <div>
                  <h3 className="font-title text-xl font-extrabold text-amber-900 leading-none">
                    GHI NHẬN ĐIỂM NỀ NẾP (LMS)
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    Học sinh: <span className="text-purple-700 font-extrabold">{selectedStudentForAward.name}</span>
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Lý do cộng điểm:
                </label>
                <input
                  type="text"
                  value={awardReason}
                  onChange={(e) => setAwardReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[+1, +2, +5].map(pts => (
                  <button
                    key={pts}
                    onClick={() => handleConfirmAward(pts)}
                    className="py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-sm border-2 border-amber-300 transition flex items-center justify-center gap-1 shadow-sm active:scale-95"
                  >
                    <span>+{pts}</span>
                    <span className="text-xs">Sao ⭐</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedStudentForAward(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-100"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
