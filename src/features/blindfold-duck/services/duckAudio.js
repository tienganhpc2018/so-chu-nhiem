/**
 * Âm thanh định vị không gian (Spatial / Stereo Audio) cho trò chơi Bịt Mắt Bắt Vịt
 * Sử dụng Web Audio API thuần (không phụ thuộc file ngoài, không lo lỗi mạng)
 */

class DuckAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.volume = 0.8;
    this.bgmTimer = null;
    this.isBgmPlaying = false;
  }

  initCtx() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted) {
      this.stopBgm();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Tạo âm thanh vịt kêu có định vị không gian (Stereo Pan & Distance Volume)
   * @param {number} relX - Tọa độ X tương đối từ -1 (hoàn toàn bên trái) đến +1 (hoàn toàn bên phải)
   * @param {number} distance - Khoảng cách thực tế giữa người chơi và con vịt
   * @param {number} maxDist - Khoảng cách tối đa của sân
   * @param {number} pitchType - 0: chuẩn, 1: cao (vịt nhỏ), 2: thấp (vịt to)
   */
  playSpatialQuack(relX = 0, distance = 100, maxDist = 400, pitchType = 0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const panVal = Math.max(-1, Math.min(1, relX));
      // Khoảng cách càng gần âm lượng càng lớn, càng xa âm lượng nhỏ hơn
      const distRatio = Math.max(0, Math.min(1, distance / maxDist));
      const distVol = (1.1 - distRatio * 0.7) * this.volume;

      // Panner Node (Định vị loa trái / phải)
      let panner;
      if (this.ctx.createStereoPanner) {
        panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(panVal, now);
      }

      // Bộ dao động âm thanh tiếng quạc hoạt hình sinh động
      const baseFreq = pitchType === 1 ? 440 : pitchType === 2 ? 300 : 370;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.18);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq * 2.2, now);
      filter.Q.setValueAtTime(3.8, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.42 * distVol, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);

      if (panner) {
        gain.connect(panner);
        panner.connect(this.ctx.destination);
      } else {
        gain.connect(this.ctx.destination);
      }

      osc.start(now);
      osc.stop(now + 0.24);

      // Tiếng cạp phụ thứ 2 nhát nhỏ cho vui nhộn ("Cạp cạp!")
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(baseFreq * 1.1, now + 0.14);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.55, now + 0.28);

      gain2.gain.setValueAtTime(0.001, now + 0.14);
      gain2.gain.linearRampToValueAtTime(0.3 * distVol, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc2.connect(filter);
      if (panner) {
        gain2.connect(panner);
      } else {
        gain2.connect(this.ctx.destination);
      }
      osc2.start(now + 0.14);
      osc2.stop(now + 0.32);
    } catch (e) {
      // Audio fallback
    }
  }

  /**
   * Tiếng tích tắc đếm ngược đồng hồ (Tick Tock)
   */
  playTickTock(isUrgent = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isUrgent ? 1200 : 800, now);

      gain.gain.setValueAtTime(isUrgent ? 0.3 * this.volume : 0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  /**
   * Tiếng bắt được vịt (Catch Pop & Yay)
   */
  playCatchSuccess() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Âm pop giòn giã
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.12);

      gain.gain.setValueAtTime(0.4 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);

      // Chùm nốt reo vui C6, E6, G6
      [0.08, 0.16, 0.24].forEach((delay, idx) => {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const freqs = [1046.5, 1318.5, 1567.98];
        o.type = 'triangle';
        o.frequency.setValueAtTime(freqs[idx], now + delay);
        g.gain.setValueAtTime(0.2 * this.volume, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);

        o.connect(g);
        g.connect(this.ctx.destination);
        o.start(now + delay);
        o.stop(now + delay + 0.16);
      });
    } catch (e) {}
  }

  /**
   * Tiếng bắt hụt (Funny Miss Whoosh)
   */
  playMiss() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  /**
   * Tiếng trả lời câu hỏi Tiếng Anh đúng (Correct Bell)
   */
  playCorrect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.12].forEach((delay, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 0 ? 587.33 : 880.0, now + delay); // D5 then A5
        gain.gain.setValueAtTime(0.25 * this.volume, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.4);
      });
    } catch (e) {}
  }

  /**
   * Tiếng trả lời câu hỏi sai (Wrong Buzzer)
   */
  playWrong() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.setValueAtTime(130, now + 0.12);

      gain.gain.setValueAtTime(0.22 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  /**
   * Tiếng đếm ngược 3..2..1 bắt đầu
   */
  playCountdown() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  /**
   * Nhạc nền âm hưởng lễ hội làng quê Việt Nam (Trống hội dân gian rộn rã)
   */
  playBgm() {
    if (this.isBgmPlaying || this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isBgmPlaying = true;
    let step = 0;
    // Nhịp trống hội dân gian: Tùng - Tùng - Cắc - Tùng
    const drumNotes = [90, 0, 95, 0, 180, 0, 90, 110];

    const playBeat = () => {
      if (!this.isBgmPlaying || this.isMuted || !this.ctx) return;
      try {
        const note = drumNotes[step % drumNotes.length];
        step++;
        if (note > 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = note > 150 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(note, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.14);

          gain.gain.setValueAtTime(0.08 * this.volume, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.18);
        }
      } catch (e) {}
    };

    playBeat();
    this.bgmTimer = setInterval(playBeat, 260);
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  destroy() {
    this.stopBgm();
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch (e) {}
      this.ctx = null;
    }
  }
}

export const duckAudio = new DuckAudioEngine();
