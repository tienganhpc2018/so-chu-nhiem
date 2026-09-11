// Utility phát âm thanh phản hồi (Web Audio API Synthesizer)
// Không phụ thuộc file mp3 bên ngoài, hoạt động 100% trên mọi trình duyệt modern.

class SoundEffectsManager {
  constructor() {
    this.ctx = null;
  }

  initContext() {
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

  playClick() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  }

  playCorrect() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Hợp âm Tinh Tinh vui tươi (+Sao)
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.2, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.3);
      });
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  }

  playDeduct() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Tông âm trầm cảnh báo nhẹ (-Sao)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  }

  playWheelTick() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  }

  playSuspenseSpin() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Generate 25 rapid ticks accelerating up to winner reveal
      for (let i = 0; i < 25; i++) {
        const timeOffset = i * (0.12 - i * 0.0035);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400 + i * 25, now + timeOffset);

        gain.gain.setValueAtTime(0.12, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.04);
      }
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  }

  playWinner() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Nhạc chiến thắng khi quay trúng học sinh
      const notes = [
        { f: 523.25, d: 0.15 },
        { f: 659.25, d: 0.15 },
        { f: 783.99, d: 0.15 },
        { f: 1046.50, d: 0.4 }
      ];

      let delay = 0;
      notes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, now + delay);

        gain.gain.setValueAtTime(0.25, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + n.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + n.d);
        delay += n.d * 0.8;
      });
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  }

  playTimerAlarm() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now + i * 0.2);

        gain.gain.setValueAtTime(0.15, now + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.2);
        osc.stop(now + i * 0.2 + 0.12);
      }
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  }

  playSchoolBell() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Deep resonant THCS school drum sound: 3 booms (TÙNG! TÙNG! TÙNG!)
      for (let i = 0; i < 3; i++) {
        const timeOffset = i * 0.6;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now + timeOffset);
        osc.frequency.exponentialRampToValueAtTime(45, now + timeOffset + 0.5);

        gain.gain.setValueAtTime(0.4, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.5);
      }
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  }

  playTick() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (e) {}
  }

  playTear() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // White noise burst for tearing paper/pouch
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch (e) {}
  }

  playFanfare() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [
        { f: 440, d: 0.1 },
        { f: 554.37, d: 0.1 },
        { f: 659.25, d: 0.12 },
        { f: 880, d: 0.35 }
      ];
      let delay = 0;
      notes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, now + delay);
        gain.gain.setValueAtTime(0.2, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + n.d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + n.d);
        delay += n.d * 0.85;
      });
    } catch (e) {}
  }

  playQuack() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  // Âm thanh hồi hộp drumroll (dùng cho Hái hoa và Bốc thăm đại diện)
  startSuspenseDrum(durationSec = 6) {
    try {
      this.initContext();
      this.stopSuspenseDrum();
      if (!this.ctx) return;

      const startTime = Date.now();
      const endTime = startTime + durationSec * 1000;

      const playPulse = () => {
        if (!this.suspenseInterval) return;
        const now = Date.now();
        if (now >= endTime) {
          this.stopSuspenseDrum();
          return;
        }

        // Calculate progress (0 to 1) to accelerate beat
        const progress = (now - startTime) / (durationSec * 1000);
        const pitch = 180 + progress * 240;

        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = progress > 0.7 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(pitch * 0.6, this.ctx.currentTime + 0.06);

          const vol = 0.08 + progress * 0.12;
          gain.gain.setValueAtTime(vol, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.06);
        } catch (err) {}

        // Schedule next beat with decreasing interval (faster towards end)
        const nextDelay = Math.max(50, Math.floor(180 - progress * 130));
        this.suspenseInterval = setTimeout(playPulse, nextDelay);
      };

      this.suspenseInterval = setTimeout(playPulse, 100);
    } catch (e) {
      console.warn("Suspense audio error:", e);
    }
  }

  stopSuspenseDrum() {
    if (this.suspenseInterval) {
      clearTimeout(this.suspenseInterval);
      this.suspenseInterval = null;
    }
  }

  // Phát tiếng bong bóng bọt nước cho sinh vật biển (cá, tôm, mực, cua)
  playBubblePop() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const freq = 600 + Math.random() * 400;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 0.06);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  // Tiếng còi xuất phát / về đích kịch tính
  playWhistle() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.setValueAtTime(2600, now + 0.08);
      osc.frequency.setValueAtTime(2400, now + 0.16);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {}
  }

  // Nhạc nền cuộc đua hồi hộp, dồn dập (Suspense Racing Beat)
  startRaceAudio(animalType = 'duck') {
    try {
      this.initContext();
      this.stopRaceAudio();
      if (!this.ctx) return;

      this.raceAudioActive = true;
      this.raceProgress = 0; // 0.0 -> 1.0
      let beatStep = 0;

      // Loop nhịp điệu đua dồn dập, hồi hộp tăng dần
      const raceLoop = () => {
        if (!this.raceAudioActive || !this.ctx) return;

        const now = this.ctx.currentTime;
        const p = this.raceProgress || 0; // Tiến trình chặng đua

        // 1. Nhịp Bass Trống đập dồn dập (Heartbeat Racing Kick)
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';

          const baseKick = p > 0.7 ? 140 : 100;
          osc.frequency.setValueAtTime(baseKick, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.11);

          // Âm lượng to, rõ ràng (0.28 - 0.40)
          const kickVol = 0.26 + p * 0.14;
          gain.gain.setValueAtTime(kickVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(p > 0.7 ? 450 : 260, now);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.11);
        } catch (e) {}

        // 2. Tiếng tích tắc đếm ngược hồi hộp (Suspense Tick)
        if (beatStep % 2 === 1 || p > 0.7) {
          try {
            const tickOsc = this.ctx.createOscillator();
            const tickGain = this.ctx.createGain();
            tickOsc.type = 'sine';
            const tickPitch = p > 0.7 ? 1800 : 1200;
            tickOsc.frequency.setValueAtTime(tickPitch, now + 0.05);

            tickGain.gain.setValueAtTime(0.18 + p * 0.1, now + 0.05);
            tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

            tickOsc.connect(tickGain);
            tickGain.connect(this.ctx.destination);
            tickOsc.start(now + 0.05);
            tickOsc.stop(now + 0.09);
          } catch (e) {}
        }

        // 3. Tiếng nước té bọt splash sống động
        try {
          const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
          }
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1400 + (beatStep % 4) * 280, now);

          const splashGain = this.ctx.createGain();
          splashGain.gain.setValueAtTime(0.12 + p * 0.08, now);
          splashGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

          noise.connect(filter);
          filter.connect(splashGain);
          splashGain.connect(this.ctx.destination);
          noise.start(now);
        } catch (e) {}

        // 4. Âm thanh đặc trưng theo loài động vật
        if (beatStep % 5 === 2) {
          if (animalType === 'duck') {
            this.playQuack();
          } else {
            this.playBubblePop();
          }
        }

        beatStep++;

        // Nhịp độ tăng dần khi gần về đích: 180ms -> 85ms ở 3s cuối!
        const delay = Math.max(85, Math.floor(180 - p * 95));
        this.raceAudioTimer = setTimeout(raceLoop, delay);
      };

      raceLoop();
    } catch (e) {
      console.warn("Race audio error:", e);
    }
  }

  // Cập nhật tiến trình cuộc đua để tăng độ kịch tính âm thanh
  setRaceProgress(progress) {
    this.raceProgress = Math.max(0, Math.min(1.0, progress));
  }

  stopRaceAudio() {
    this.raceAudioActive = false;
    this.raceProgress = 0;
    if (this.raceAudioTimer) {
      clearTimeout(this.raceAudioTimer);
      this.raceAudioTimer = null;
    }
  }
}

export const soundFx = new SoundEffectsManager();
