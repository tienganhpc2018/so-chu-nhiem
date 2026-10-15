// ufoAudio.js - Quản lý âm thanh Web Audio API & Nhạc nền tùy chỉnh cho Game Đường Đua UFO

class UfoAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmOscs = [];
    this.bgmTimer = null;
    this.isBgmPlaying = false;
    this.customAudio = null;
    this.volume = 0.6;
  }

  // Khởi tạo AudioContext khi có tương tác người dùng
  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.customAudio) {
      this.customAudio.muted = muted;
    }
    if (muted) {
      this.stopBgm();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.customAudio) {
      this.customAudio.volume = this.volume;
    }
  }

  // Tiếng UFO lao xuống từ vũ trụ (UFO Descent Engine Whoosh)
  playUfoDescent() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 2.0);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2500, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(350, this.ctx.currentTime + 2.0);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25 * this.volume, this.ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 2.2);
    } catch (e) {}
  }

  // Tiếng radar quét tìm mục tiêu (Radar Sweep Ping)
  playRadarSweep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12 * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.19);
    } catch (e) {}
  }

  // Phát tiếng tia hút UFO (Tractor Beam Hum)
  playTractorBeam() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 1.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18 * this.volume, this.ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.8);
    } catch (e) {
      // Audio fallback
    }
  }

  // Tiếng Radar ngắm mục tiêu (Lock-on Beep)
  playLockOn() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.08, 0.16].forEach((delay, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77 + idx * 200, now + delay); // B5 tone

        gain.gain.setValueAtTime(0.15 * this.volume, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.07);
      });
    } catch (e) {}
  }

  // Tiếng hút học sinh bay lên UFO (Anti-gravity Whoosh)
  playAbductWhoosh() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.2 * this.volume, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3 * this.volume, this.ctx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.9);
    } catch (e) {}
  }

  // Tiếng hét thất thanh hoạt hình vui nhộn "Á á á cứu em!" (Funny Cartoon Scream)
  playFunnyScream() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Tần số quét cao và rung lắc mạnh mô phỏng tiếng hét hoạt hình
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.linearRampToValueAtTime(850, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(1250, now + 0.65);
      osc.frequency.exponentialRampToValueAtTime(320, now + 1.2);

      // Bộ tạo rung vibrato
      vibrato.frequency.setValueAtTime(18, now); // 18Hz rung giọng
      vibratoGain.gain.setValueAtTime(80, now);
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.28 * this.volume, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      vibrato.start(now);
      osc.start(now);
      vibrato.stop(now + 1.25);
      osc.stop(now + 1.25);
    } catch (e) {}
  }

  // Tiếng khói bụi bốc lên khi đĩa bay sà xuống (Dust Blast Whoosh)
  playDustBlast() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 1.0);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);

      gain.gain.setValueAtTime(0.22 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.1);
    } catch (e) {}
  }

  // Tiếng bật nảy nhảy nhót hoạt hình (Funny boing)
  playBoing() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(250, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.18 * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }

  // Tiếng chiến thắng / bắt xong học sinh (Victory fanfare)
  playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.22 * this.volume, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.45);
      });
    } catch (e) {}
  }

  // Nhạc nền mặc định: "UFO Synth" (tổng hợp trực tiếp bằng Web Audio, không phụ thuộc file mạng)
  playBgm(customAudioSrc = null) {
    if (this.isMuted) return;

    // Nếu người dùng tải nhạc lên: phát file tùy chỉnh
    if (customAudioSrc) {
      this.stopBgm();
      try {
        if (!this.customAudio) {
          this.customAudio = new Audio();
          this.customAudio.loop = true;
        }
        this.customAudio.src = customAudioSrc;
        this.customAudio.volume = this.volume;
        this.customAudio.play().catch(() => {});
        this.isBgmPlaying = true;
        return;
      } catch (e) {}
    }

    // Nếu dùng nhạc mặc định UFO Synth
    if (this.isBgmPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isBgmPlaying = true;
    const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 392.00, 329.63];
    let noteIdx = 0;

    const playNote = () => {
      if (!this.isBgmPlaying || this.isMuted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[noteIdx % notes.length], this.ctx.currentTime);
        noteIdx++;

        gain.gain.setValueAtTime(0.04 * this.volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
      } catch (e) {}
    };

    playNote();
    this.bgmTimer = setInterval(playNote, 320);
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.customAudio) {
      try {
        this.customAudio.pause();
        this.customAudio.currentTime = 0;
      } catch (e) {}
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

export const ufoAudio = new UfoAudioEngine();

// Đọc to tên học sinh bằng giọng nói Tiếng Việt (Web Speech API)
export function speakStudentSelected(studentName) {
  if (!window.speechSynthesis || !studentName) return;
  try {
    window.speechSynthesis.cancel();
    const cleanName = studentName.replace(/[^\p{L}\s]/gu, '').trim();
    const text = `Xin chúc mừng bạn ${cleanName} đã được chọn lên bảng trả bài!`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Tìm giọng tiếng Việt nếu có
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VN'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
}

