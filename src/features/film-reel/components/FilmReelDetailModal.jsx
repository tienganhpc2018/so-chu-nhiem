import React from 'react';
import { X, Heart, Calendar, Play, Edit3, Trash2, Maximize2, Sparkles, Tag, Users, Printer } from 'lucide-react';
import { FILM_REEL_CATEGORIES } from '../constants/filmReelPresets';
import { soundFx } from '../../../utils/soundEffects';

export const FilmReelDetailModal = ({
  isOpen,
  onClose,
  reel,
  className = 'Chủ Nhiệm',
  onEdit,
  onDelete,
  onToggleLike,
  onOpenLightbox,
  onOpenSlideshow
}) => {
  if (!isOpen || !reel) return null;

  const categoryInfo = FILM_REEL_CATEGORIES.find(c => c.id === reel.category) || FILM_REEL_CATEGORIES[0];

  const formattedDate = (() => {
    if (!reel.eventDate) return 'Chưa có ngày';
    try {
      const d = new Date(reel.eventDate);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch (e) {
      return reel.eventDate;
    }
  })();

  // Tập hợp danh sách ảnh trong bài viết để mở Lightbox
  const allImages = [
    ...(reel.coverImage ? [{ url: reel.coverImage, caption: reel.title }] : []),
    ...(reel.blocks || [])
      .filter(b => b.type === 'image' && b.url)
      .map(b => ({ url: b.url, caption: b.caption || reel.title }))
  ];

  const handleImageClick = (imgUrl) => {
    const idx = allImages.findIndex(img => img.url === imgUrl);
    soundFx?.playClick();
    onOpenLightbox?.(allImages, idx >= 0 ? idx : 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto print:static print:bg-white print:p-0 print:m-0 print:overflow-visible">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none print:my-0">
        
        {/* 1. THANH CÔNG CỤ ĐẦU TRANG (Action Bar) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-purple-50/40 to-pink-50/40 shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${categoryInfo.badge}`}>
              {reel.category}
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Lớp {className}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Nút In / Xuất Kỷ yếu A4 */}
            <button
              onClick={() => {
                soundFx?.playClick();
                window.print();
              }}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
              title="In hoặc Lưu file PDF Kỷ Yếu (Khổ A4)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">In Kỷ Yếu A4</span>
            </button>

            {/* Nút Thả tim */}
            <button
              onClick={() => {
                soundFx?.playClick();
                onToggleLike?.(reel.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all ${
                reel.isLiked
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              title="Thả tim bài viết"
            >
              <Heart className={`w-3.5 h-3.5 ${reel.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{reel.likesCount || 0}</span>
            </button>

            {/* Nút Trình chiếu bài này */}
            <button
              onClick={() => {
                soundFx?.playClick();
                onOpenSlideshow?.(reel);
              }}
              className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors"
              title="Trình chiếu ảnh bài viết toàn màn hình"
            >
              <Play className="w-3.5 h-3.5 fill-purple-700" />
              <span className="hidden sm:inline">Trình chiếu</span>
            </button>

            {/* Nút Chỉnh sửa */}
            <button
              onClick={() => {
                soundFx?.playClick();
                onEdit?.(reel);
              }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              title="Chỉnh sửa bài viết"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Nút Xóa */}
            <button
              onClick={() => {
                soundFx?.playClick();
                onDelete?.(reel.id);
              }}
              className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
              title="Xóa bài viết"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Nút Đóng */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors ml-2"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. NỘI DUNG NHẬT KÝ TẠP CHÍ HỌC ĐƯỜNG (Centered Magazine Body) */}
        <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8 max-w-3xl mx-auto w-full">
          
          {/* Tiêu đề & Ngày tháng */}
          <div className="text-center space-y-3 pb-6 border-b border-slate-100">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
              {reel.title}
            </h1>

            <div className="flex items-center justify-center space-x-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span>{formattedDate}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-purple-500" />
                <span>Tập thể lớp {className}</span>
              </span>
            </div>
          </div>

          {/* Ảnh bìa đại diện lớn */}
          {reel.coverImage && (
            <div
              onClick={() => handleImageClick(reel.coverImage)}
              className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-md cursor-pointer group border border-slate-200"
            >
              <img
                src={reel.coverImage}
                alt={reel.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-4 py-2 bg-black/60 text-white rounded-xl text-xs font-bold backdrop-blur-sm flex items-center space-x-1.5">
                  <Maximize2 className="w-4 h-4" />
                  <span>Bấm để phóng to</span>
                </span>
              </div>
            </div>
          )}

          {/* Dòng chảy các khối văn bản và ảnh chụp (Flow Content) */}
          <div className="space-y-6 pt-2">
            {(reel.blocks || []).map((block, idx) => {
              if (block.type === 'paragraph') {
                return (
                  <p
                    key={block.id || idx}
                    className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal first-letter:text-3xl first-letter:font-black first-letter:text-purple-700 first-letter:mr-1"
                  >
                    {block.text}
                  </p>
                );
              }

              if (block.type === 'image' && block.url) {
                return (
                  <div
                    key={block.id || idx}
                    className="my-6 space-y-2"
                  >
                    <div
                      onClick={() => handleImageClick(block.url)}
                      className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer group border border-slate-200 max-h-[500px] bg-slate-50 flex items-center justify-center"
                    >
                      <img
                        src={block.url}
                        alt={block.caption || 'Hình ảnh hoạt động'}
                        className="max-h-[500px] w-full object-cover transition-transform duration-500 group-hover:scale-102"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-4 py-2 bg-black/60 text-white rounded-xl text-xs font-bold backdrop-blur-sm flex items-center space-x-1.5">
                          <Maximize2 className="w-4 h-4" />
                          <span>Phóng to ảnh</span>
                        </span>
                      </div>
                    </div>

                    {/* Chú thích ảnh (Caption) */}
                    {block.caption && (
                      <p className="text-center text-xs sm:text-sm text-slate-500 italic font-medium pt-1">
                        📷 {block.caption}
                      </p>
                    )}
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* Dấu ấn kết thúc nhật ký */}
          <div className="pt-8 border-t border-slate-100 text-center space-y-2 text-slate-400">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cuộn Phim Kỷ Niệm Lớp Học</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Lưu giữ những khoảnh khắc thanh xuân tươi đẹp nhất của thầy và trò.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
