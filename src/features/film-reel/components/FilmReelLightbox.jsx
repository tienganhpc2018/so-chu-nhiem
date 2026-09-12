import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const FilmReelLightbox = ({
  isOpen,
  onClose,
  images = [], // Array<{ url: string; caption?: string }>
  currentIndex = 0,
  onIndexChange
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onIndexChange(currentIndex - 1);
        soundFx?.playClick();
      }
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        onIndexChange(currentIndex + 1);
        soundFx?.playClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onIndexChange]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      soundFx?.playClick();
      onIndexChange(currentIndex - 1);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < images.length - 1) {
      soundFx?.playClick();
      onIndexChange(currentIndex + 1);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md animate-in fade-in select-none"
    >
      
      {/* Top Controls Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between text-white z-20 bg-gradient-to-b from-black/80 to-transparent"
      >
        <div className="flex items-center space-x-3">
          <span className="text-xs sm:text-sm font-bold bg-white/15 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            {currentIndex + 1} / {images.length}
          </span>
          {currentImage.caption && (
            <p className="text-xs sm:text-sm text-slate-200 line-clamp-1 max-w-md hidden sm:block font-medium">
              {currentImage.caption}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {currentImage.url && (
            <a
              href={currentImage.url}
              target="_blank"
              rel="noreferrer"
              download
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-colors"
              title="Mở ảnh kích thước gốc"
            >
              <ZoomIn className="w-5 h-5" />
            </a>
          )}

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-rose-500/30 text-white rounded-xl backdrop-blur-md transition-colors"
            title="Đóng xem ảnh (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-5xl max-h-[85vh] p-2 flex flex-col items-center justify-center"
      >
        <img
          src={currentImage.url}
          alt={currentImage.caption || 'Hình ảnh hoạt động'}
          className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200"
        />

        {/* Caption dưới ảnh */}
        {currentImage.caption && (
          <div className="mt-3 px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-xl text-center text-xs sm:text-sm text-slate-200 border border-white/10 max-w-xl">
            {currentImage.caption}
          </div>
        )}
      </div>

      {/* Previous Button */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all transform hover:scale-110"
          title="Ảnh trước (Phím mũi tên trái)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Button */}
      {currentIndex < images.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all transform hover:scale-110"
          title="Ảnh tiếp theo (Phím mũi tên phải)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

    </div>
  );
};
