import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { PrintNoiseWarningModal } from '../components/PrintNoiseWarningModal';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  AlertTriangle,
  Siren,
  Star,
  Maximize2,
  Timer,
  CheckCircle2,
  BellRing,
  Printer,
  TrendingUp
} from 'lucide-react';

export const NoiseMeterView = ({ currentClass, teacherProfile }) => {
  // Microphone & Audio Meter State
  const [isMicOn, setIsMicOn] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0); // 0 to 100%
  const [autoWarning, setAutoWarning] = useState(false);
  const [hasSoundAlert, setHasSoundAlert] = useState(true);

  // Feature 1: Noise Level Trend History Array (for Line Chart)
  const [noiseHistory, setNoiseHistory] = useState([20, 25, 30, 28, 35, 40, 45, 38, 30, 25]);

  // Feature 2: Print Noise Warning Card Modal State
  const [showPrintWarningModal, setShowPrintWarningModal] = useState(false);

  // Feature 4: High Noise Counter (>85% duration)
  const highNoiseCounterRef = useRef(0);
  const [highNoiseAlert, setHighNoiseAlert] = useState(false);

  // Silence Timer State
  const [silenceTimerSeconds, setSilenceTimerSeconds] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);

  // Web Audio API refs
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  // Instant Alert Action (Screenshot 4)
  const handleInstantAlert = (type) => {
    if (hasSoundAlert) {
      if (type === 'shh' || type === 'loud') soundFx.playDeduct();
      if (type === 'stop') soundFx.playTimerAlarm();
      if (type === 'great') {
        soundFx.playWinner();
        confetti({ particleCount: 60, spread: 90, origin: { y: 0.5 } });
      }
    }
  };

  // Toggle Microphone Real-time Noise Detection (Screenshot 4 & 5)
  const handleToggleMic = async () => {
    if (isMicOn) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      setIsMicOn(false);
      setVolumeLevel(0);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        streamRef.current = stream;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        setIsMicOn(true);
        soundFx.playCorrect();
      } catch (err) {
        console.error('Lỗi kết nối Microphone:', err);
        alert('Không thể kết nối Microphone! Vui lòng cấp quyền micro cho trình duyệt.');
      }
    }
  };

  // Continuous Audio Analysis Loop & Feature 1 + 4
  useEffect(() => {
    let animId;

    if (isMicOn && analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateVolume = () => {
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));

        setVolumeLevel(normalized);

        // Feature 1: Push noise level to trend history (keep last 20 ticks)
        setNoiseHistory(prev => [...prev.slice(-19), normalized]);

        // Feature 4: High Noise >85% logic
        if (normalized > 85) {
          highNoiseCounterRef.current += 1;
          if (highNoiseCounterRef.current >= 30) { // ~3 seconds of high noise
            setHighNoiseAlert(true);
            if (hasSoundAlert) soundFx.playDeduct();
          }
        } else {
          highNoiseCounterRef.current = 0;
          setHighNoiseAlert(false);
        }

        // Auto warning alarm if volume exceeds 70%
        if (autoWarning && normalized > 70 && hasSoundAlert) {
          soundFx.playDeduct();
        }

        animId = requestAnimationFrame(updateVolume);
      };

      animId = requestAnimationFrame(updateVolume);
    }

    return () => cancelAnimationFrame(animId);
  }, [isMicOn, autoWarning, hasSoundAlert]);

  // Silence Timer Countdown Loop
  useEffect(() => {
    let timerId;
    if (timerRunning && silenceTimerSeconds !== null && silenceTimerSeconds > 0) {
      timerId = setInterval(() => {
        setSilenceTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerId);
            setTimerRunning(false);
            if (hasSoundAlert) {
              soundFx.playWinner();
              confetti({ particleCount: 70, spread: 100, origin: { y: 0.5 } });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [timerRunning, silenceTimerSeconds, hasSoundAlert]);

  // Start Silence Countdown
  const handleStartSilenceTimer = (sec) => {
    soundFx.playClick();
    setSilenceTimerSeconds(sec);
    setTimerRunning(true);
  };

  // Fullscreen Toggle
  const handleToggleFullscreen = () => {
    soundFx.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  // Status Level Helper (Screenshot 5)
  const getNoiseStatusInfo = (vol) => {
    if (vol < 40) {
      return { label: 'Yên tĩnh — Lớp nề nếp tốt 🌟', color: 'bg-emerald-500 text-white', statusBg: 'bg-emerald-50 text-emerald-900 border-emerald-200' };
    }
    if (vol < 70) {
      return { label: 'Hơi ồn — Hãy nhắc nhở nhẹ ⚠️', color: 'bg-amber-500 text-white', statusBg: 'bg-amber-50 text-amber-950 border-amber-200' };
    }
    return { label: 'Rất ồn — LỚP QUÁ ỒN! 🚨', color: 'bg-coral-500 text-white', statusBg: 'bg-coral-50 text-coral-950 border-coral-200' };
  };

  const noiseStatus = getNoiseStatusInfo(volumeLevel);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in select-none">
      
      {/* HEADER BANNER (Screenshot 4) */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500 text-white rounded-2xl shadow-md">
              <Volume2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Công Cụ Chống Ồn Lớp Học
            </h2>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Cảnh báo tiếng ồn lớp học — phát hiện tự động qua microphone.
          </p>
        </div>

        {/* Top Action Buttons (Screenshot 4) */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              soundFx.playClick();
              setHasSoundAlert(!hasSoundAlert);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-black border transition-all flex items-center space-x-1.5 ${
              hasSoundAlert ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {hasSoundAlert ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            <span>{hasSoundAlert ? 'Có âm thanh' : 'Tắt âm thanh'}</span>
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-black shadow-purple-glow transition-all flex items-center space-x-1.5"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Toàn màn hình</span>
          </button>
        </div>

      </div>

      {/* TOP 2 CARDS GRID (Screenshot 4 & 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: CẢNH BÁO TỨC THÌ (4 Action Buttons - Screenshot 4) */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-sm pb-2 border-b border-slate-100">
            <BellRing className="w-4 h-4 text-purple-600" />
            <span>Cảnh Báo Tức Thì</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            
            {/* Button 1: SHH Im lặng */}
            <button
              onClick={() => handleInstantAlert('shh')}
              className="p-5 rounded-3xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-950 font-black text-sm flex flex-col items-center justify-center space-y-2 shadow-sm transition-all transform hover:scale-105 active:scale-95 min-h-[110px]"
            >
              <span className="text-3xl">🤫</span>
              <span>SHH! Im lặng nào!</span>
            </button>

            {/* Button 2: Lớp quá ồn */}
            <button
              onClick={() => handleInstantAlert('loud')}
              className="p-5 rounded-3xl bg-orange-50 hover:bg-orange-100 border-2 border-orange-300 text-orange-950 font-black text-sm flex flex-col items-center justify-center space-y-2 shadow-sm transition-all transform hover:scale-105 active:scale-95 min-h-[110px]"
            >
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              <span>LỚP QUÁ ỒN!</span>
            </button>

            {/* Button 3: Dừng lại ngay */}
            <button
              onClick={() => handleInstantAlert('stop')}
              className="p-5 rounded-3xl bg-coral-50 hover:bg-coral-100 border-2 border-coral-300 text-coral-950 font-black text-sm flex flex-col items-center justify-center space-y-2 shadow-sm transition-all transform hover:scale-105 active:scale-95 min-h-[110px]"
            >
              <Siren className="w-8 h-8 text-coral-600 animate-bounce" />
              <span>DỪNG LẠI NGAY!</span>
            </button>

            {/* Button 4: Tuyệt vời */}
            <button
              onClick={() => handleInstantAlert('great')}
              className="p-5 rounded-3xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-950 font-black text-sm flex flex-col items-center justify-center space-y-2 shadow-sm transition-all transform hover:scale-105 active:scale-95 min-h-[110px]"
            >
              <Star className="w-8 h-8 fill-emerald-400 text-emerald-500" />
              <span>TUYỆT VỜI!</span>
            </button>

          </div>
        </div>

        {/* CARD 2: ĐẾM NGƯỢC IM LẶNG (Screenshot 4) */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4 flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-sm pb-2 border-b border-slate-100">
            <Timer className="w-4 h-4 text-purple-600" />
            <span>Đếm Ngược Im Lặng</span>
          </div>

          <div className="text-center space-y-3 my-auto">
            {/* Stopwatch Circle Display */}
            <div className="w-24 h-24 mx-auto rounded-full bg-purple-50 border-4 border-purple-300 shadow-md flex items-center justify-center">
              <span className="text-2xl font-black text-purple-950 font-mono">
                {silenceTimerSeconds !== null ? `${silenceTimerSeconds}s` : '⏱️'}
              </span>
            </div>

            {/* Preset Time Buttons (Screenshot 4) */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[10, 15, 20, 30, 60].map(sec => (
                <button
                  key={`sec-${sec}`}
                  onClick={() => handleStartSilenceTimer(sec)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    silenceTimerSeconds === sec && timerRunning
                      ? 'bg-purple-600 text-white shadow-purple-glow'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
            <p className="text-[11px] font-bold text-slate-400">Khi hết giờ sẽ tự động khen lớp "TUYỆT VỜI!" 🌟</p>
          </div>
        </div>

      </div>

      {/* BOTTOM CARD: PHÁT HIỆN TIẾNG ỒN TỰ ĐỘNG (MICROPHONE - Screenshot 4 & 5) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Mic className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-black text-slate-800">Phát Hiện Tiếng Ồn Tự Động (Microphone)</h3>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoWarning}
                onChange={(e) => setAutoWarning(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span>Cảnh báo tự động</span>
            </label>

            {/* Microphone Toggle Button (Screenshot 4 & 5) */}
            <button
              onClick={handleToggleMic}
              className={`px-6 py-2.5 rounded-2xl font-black text-xs shadow-md transition-all flex items-center space-x-2 ${
                isMicOn
                  ? 'bg-coral-500 hover:bg-coral-600 text-white shadow-coral-glow'
                  : 'bg-coral-500 hover:bg-coral-600 text-white shadow-coral-glow'
              }`}
            >
              {isMicOn ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isMicOn ? 'Tắt micro' : '🎙️ Bật micro'}</span>
            </button>
          </div>
        </div>

        {/* DECIBEL VOLUME METER PROGRESS BAR (Screenshot 5) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-black">
            <span className="text-slate-700 uppercase tracking-wider">Mức độ tiếng ồn hiện tại:</span>
            <span className="text-coral-600 text-sm font-mono">{volumeLevel}%</span>
          </div>

          {/* Smooth Dynamic Color Progress Bar (Screenshot 5) */}
          <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-150 ${noiseStatus.color}`}
              style={{ width: `${volumeLevel}%` }}
            ></div>
          </div>

          {/* Live Noise Level Indicator Status Box (Screenshot 5) */}
          <div className={`p-4 rounded-2xl border text-xs font-extrabold flex items-center justify-between ${noiseStatus.statusBg}`}>
            <span className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{noiseStatus.label}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">Micro đang hoạt động • Cảnh báo: {autoWarning ? 'BẬT' : 'TẮT'}</span>
          </div>

          {/* FEATURE 4: HIGH NOISE WARNING BANNER (>85% DURATION) */}
          {highNoiseAlert && (
            <div className="p-3 bg-red-100 border-2 border-red-400 rounded-2xl text-xs font-black text-red-950 flex items-center justify-between animate-pulse">
              <span className="flex items-center space-x-2">
                <Siren className="w-5 h-5 text-red-600 animate-bounce" />
                <span>CẢNH BÁO: Lớp quá ồn vượt 85% kéo dài! Đã nhắc nhở và trừ 1 xu thi đua nề nếp toàn lớp.</span>
              </span>
            </div>
          )}

          {/* FEATURE 1: REAL-TIME NOISE LEVEL TREND LINE CHART */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-slate-700">
              <span className="flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span>Biểu đồ tiếng ồn theo thời gian thực (30s vừa qua):</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Cập nhật liên tục từ micro</span>
            </div>

            <div className="h-20 w-full flex items-end justify-between gap-1 pt-2">
              {noiseHistory.map((val, idx) => (
                <div key={`nh-${idx}`} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div
                    className={`w-full rounded-t-sm transition-all ${
                      val > 70 ? 'bg-coral-500' : val > 40 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ height: `${Math.max(10, val)}%` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* FEATURE 2: PRINT WARNING CARD A6 BUTTON */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowPrintWarningModal(true);
              }}
              className="px-4 py-2.5 bg-coral-500 hover:bg-coral-600 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu Nhắc Nhở Trật Tự (A6/PDF)</span>
            </button>
          </div>

        </div>

      </div>

      {/* FEATURE 2: PRINT NOISE WARNING CARD MODAL */}
      <PrintNoiseWarningModal
        isOpen={showPrintWarningModal}
        onClose={() => setShowPrintWarningModal(false)}
        currentClass={currentClass}
        teacherProfile={teacherProfile}
      />

    </div>
  );
};
