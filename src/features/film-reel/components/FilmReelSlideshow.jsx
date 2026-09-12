import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, ChevronLeft, ChevronRight, Maximize, Minimize, Film, Sparkles } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const FilmReelSlideshow = ({
  isOpen,
  onClose,
  slides = [] // Array<{ url: string; caption?: string; title: string; category: string; date: string }>
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef(null);

  const SLIDE_DURATION = 4000; // 4 giây

  useEffect(() => {
    if (!isOpen) {
      setCurrentIndex(0);
      setIsPlaying(true);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (isPlaying && slides.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % slides.length);
      }, SLIDE_DURATION);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPlaying, slides.length]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(p => !p);
      }
      if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);
        soundFx?.playClick();
      }
      if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev + 1) % slides.length);
        soundFx?.playClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, slides.length, onClose]);

  if (!isOpen || slides.length === 0) return null;

  const currentSlide = slides[currentIndex] || slides[0];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black text-white select-none animate-in fade-in overflow-hidden">
      
      {/* 1. THANH TIẾN TRÌNH THỜI GIAN (Progress Bar) */}
      <div className="w-full h-1 bg-white/10 relative">
        <div
          key={currentIndex + (isPlaying ? '-play' : '-pause')}
          style={{ animationDuration: `${SLIDE_DURATION}ms` }}
          className={`h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 ${
            isPlaying ? 'w-full animate-[progress_linear]' : 'w-0'
          }`}
        />
      </div>

      {/* 2. THANH ĐIỀU KHIỂN TRÊN CÙNG (Top Bar) */}
      <div className="w-full px-6 py-4 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block flex items-center gap-1">
              <Sparkles className="w-3 h-3 inline" /> TRÌNH CHIẾU CUỘN PHIM KỶ NIỆM
            </span>
            <h3 className="text-sm sm:text-base font-black text-white truncate max-w-md">
              {currentSlide.title || 'Khoảnh Khắc Lớp Học'}
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold bg-white/15 px-3 py-1 rounded-full border border-white/20">
            {currentIndex + 1} / {slides.length}
          </span>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-rose-500/40 text-white rounded-xl transition-colors"
            title="Thoát trình chiếu (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. KHUNG HÌNH CHÍNH (Center Photo Stage) */}
      <div className="relative flex-1 w-full flex items-center justify-center p-4 sm:p-8">
        <div className="relative max-h-[80vh] max-w-6xl w-full flex items-center justify-center">
          <img
            key={currentSlide.url}
            src={currentSlide.url}
            alt={currentSlide.caption || currentSlide.title}
            className="max-h-[75vh] max-w-full object-contain rounded-3xl shadow-2xl border border-white/15 animate-in fade-in zoom-in-95 duration-500"
          />

          {/* Dải cuộn phim 35mm hai bên ảnh */}
          <div className="hidden lg:flex flex-col justify-between absolute left-2 top-0 bottom-0 py-4 opacity-40">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-3 h-2 rounded-xs bg-white/30 border border-white/20" />
            ))}
          </div>
          <div className="hidden lg:flex flex-col justify-between absolute right-2 top-0 bottom-0 py-4 opacity-40">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-3 h-2 rounded-xs bg-white/30 border border-white/20" />
            ))}
          </div>
        </div>

        {/* Nút Điều Hướng Tới / Lui */}
        <button
          onClick={() => {
            soundFx?.playClick();
            setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);
          }}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all transform hover:scale-110"
          title="Lùi lại"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => {
            soundFx?.playClick();
            setCurrentIndex(prev => (prev + 1) % slides.length);
          }}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all transform hover:scale-110"
          title="Tiếp theo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* 4. THANH THÔNG TIN VÀ ĐIỀU KHIỂN DƯỚI CÙNG (Bottom Bar) */}
      <div className="w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        
        {/* Caption thông tin bức ảnh */}
        <div className="text-center sm:text-left space-y-1 max-w-xl">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 border border-purple-400/30">
              {currentSlide.category || 'Kỷ niệm'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {currentSlide.date}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 font-medium italic">
            "{currentSlide.caption || currentSlide.title || 'Khoảnh khắc đáng nhớ của tập thể lớp.'}"
          </p>
        </div>

        {/* Cụm nút Play / Pause */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              soundFx?.playClick();
              setIsPlaying(!isPlaying);
            }}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-purple-900/50 transition-all transform hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>TẠM DỪNG</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>TIẾP TỤC PHÁT</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
