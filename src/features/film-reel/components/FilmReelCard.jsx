import React from 'react';
import { Heart, Calendar, Image as ImageIcon, Edit3, Eye, Sparkles } from 'lucide-react';
import { FILM_REEL_CATEGORIES } from '../constants/filmReelPresets';
import { soundFx } from '../../../utils/soundEffects';

export const FilmReelCard = ({
  reel,
  onOpenDetail,
  onEdit,
  onToggleLike
}) => {
  const categoryInfo = FILM_REEL_CATEGORIES.find(c => c.id === reel.category) || FILM_REEL_CATEGORIES[0];
  const imageCount = (reel.blocks || []).filter(b => b.type === 'image').length + (reel.coverImage ? 1 : 0);

  const formattedDate = (() => {
    if (!reel.eventDate) return 'Chưa có ngày';
    try {
      const d = new Date(reel.eventDate);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch (e) {
      return reel.eventDate;
    }
  })();

  const handleLikeClick = (e) => {
    e.stopPropagation();
    soundFx?.playClick();
    onToggleLike?.(reel.id);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    soundFx?.playClick();
    onEdit?.(reel);
  };

  return (
    <div
      onClick={() => onOpenDetail?.(reel)}
      className="group relative bg-slate-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-purple-900/30 transition-all duration-300 border border-slate-800 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
    >
      
      {/* 1. DẢI LỖ ĐỤC PHIM TRÊN CÙNG (35mm Sprocket Holes Top) */}
      <div className="bg-slate-950 px-3 py-1.5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex space-x-2 w-full justify-between overflow-hidden opacity-60">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2 rounded-xs bg-slate-800 border border-slate-700/80 shrink-0"
            />
          ))}
        </div>
      </div>

      {/* 2. KHUNG ẢNH BÌA ĐẠI DIỆN */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
        {reel.coverImage ? (
          <img
            src={reel.coverImage}
            alt={reel.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500 space-y-1">
            <ImageIcon className="w-8 h-8" />
            <span className="text-xs">Chưa có ảnh bìa</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Category Badge & Image Count */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shadow-sm backdrop-blur-md ${categoryInfo.badge}`}>
            {reel.category}
          </span>

          <span className="text-[11px] font-bold text-white bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 flex items-center space-x-1">
            <ImageIcon className="w-3 h-3 text-amber-400" />
            <span>{imageCount} ảnh</span>
          </span>
        </div>

        {/* Event Date Overlay */}
        <div className="absolute bottom-2.5 left-3 flex items-center space-x-1.5 text-slate-300 text-xs font-semibold z-10 drop-shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-rose-400" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* 3. DẢI LỖ ĐỤC PHIM Ở GIỮA */}
      <div className="bg-slate-950 px-3 py-1 flex items-center justify-between border-t border-b border-slate-800/80">
        <div className="flex space-x-2 w-full justify-between overflow-hidden opacity-60">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2 rounded-xs bg-slate-800 border border-slate-700/80 shrink-0"
            />
          ))}
        </div>
      </div>

      {/* 4. NỘI DUNG THÔNG TIN BÀI VIẾT */}
      <div className="p-4 bg-slate-900 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <h3
            className="text-white font-black text-sm sm:text-base line-clamp-2 group-hover:text-amber-300 transition-colors leading-snug"
            title={reel.title}
          >
            {reel.title}
          </h3>

          {/* Snippet preview from first paragraph */}
          {(() => {
            const firstP = (reel.blocks || []).find(b => b.type === 'paragraph' && b.text);
            return firstP ? (
              <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed font-medium">
                {firstP.text}
              </p>
            ) : null;
          })()}
        </div>

        {/* 5. CỤM NÚT HÀNH ĐỘNG */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          {/* Nút thả tim (Like) */}
          <button
            type="button"
            onClick={handleLikeClick}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              reel.isLiked
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700/50'
            }`}
            title="Thả tim yêu thích khoảnh khắc"
          >
            <Heart className={`w-3.5 h-3.5 ${reel.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{reel.likesCount || 0}</span>
          </button>

          {/* Nút Xem chi tiết & Chỉnh sửa */}
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={handleEditClick}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
              title="Chỉnh sửa cuộn phim"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onOpenDetail?.(reel)}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem</span>
            </button>
          </div>
        </div>

      </div>

      {/* 6. DẢI LỖ ĐỤC PHIM DƯỚI CÙNG (35mm Sprocket Holes Bottom) */}
      <div className="bg-slate-950 px-3 py-1.5 flex items-center justify-between border-t border-slate-800/80">
        <div className="flex space-x-2 w-full justify-between overflow-hidden opacity-60">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2 rounded-xs bg-slate-800 border border-slate-700/80 shrink-0"
            />
          ))}
        </div>
      </div>

    </div>
  );
};
