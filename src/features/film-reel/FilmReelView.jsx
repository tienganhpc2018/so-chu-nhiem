import React, { useState, useEffect, useMemo } from 'react';
import {
  Film,
  Plus,
  Play,
  Search,
  Filter,
  Sparkles,
  Camera,
  Trash2,
  Calendar,
  Layers,
  Heart
} from 'lucide-react';
import { FILM_REEL_CATEGORIES, PRESET_FILM_REELS } from './constants/filmReelPresets';
import { FilmReelCard } from './components/FilmReelCard';
import { FilmReelDetailModal } from './components/FilmReelDetailModal';
import { FilmReelEditorModal } from './components/FilmReelEditorModal';
import { FilmReelLightbox } from './components/FilmReelLightbox';
import { FilmReelSlideshow } from './components/FilmReelSlideshow';
import { soundFx } from '../../utils/soundEffects';

export const FilmReelView = ({ currentClass }) => {
  const classId = currentClass?.id || 'default_class';
  const className = currentClass?.name || 'Chủ Nhiệm';

  // State danh sách cuộn phim
  const [reels, setReels] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedReelForDetail, setSelectedReelForDetail] = useState(null);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingReel, setEditingReel] = useState(null);
  const [deletingReelId, setDeletingReelId] = useState(null);

  // Lightbox state
  const [lightboxData, setLightboxData] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0
  });

  // Slideshow state
  const [slideshowData, setSlideshowData] = useState({
    isOpen: false,
    slides: []
  });

  // Load reels from LocalStorage or Preset
  useEffect(() => {
    try {
      const storageKey = `film_reels_${classId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReels(parsed);
        } else {
          const initial = PRESET_FILM_REELS.map(r => ({ ...r, classId }));
          setReels(initial);
        }
      } else {
        const initial = PRESET_FILM_REELS.map(r => ({ ...r, classId }));
        setReels(initial);
        localStorage.setItem(storageKey, JSON.stringify(initial));
      }
    } catch (e) {
      setReels(PRESET_FILM_REELS);
    }
  }, [classId]);

  // Save helper
  const saveReelsState = (updated) => {
    setReels(updated);
    try {
      localStorage.setItem(`film_reels_${classId}`, JSON.stringify(updated));
    } catch (e) {}
  };

  // Toggle thả tim (Like)
  const handleToggleLike = (reelId) => {
    const updated = reels.map(r => {
      if (r.id === reelId) {
        const isLiked = !r.isLiked;
        const likesCount = (r.likesCount || 0) + (isLiked ? 1 : -1);
        return { ...r, isLiked, likesCount: Math.max(0, likesCount) };
      }
      return r;
    });
    saveReelsState(updated);

    // Cập nhật selectedReelForDetail nếu đang mở
    if (selectedReelForDetail && selectedReelForDetail.id === reelId) {
      const target = updated.find(r => r.id === reelId);
      if (target) setSelectedReelForDetail(target);
    }
  };

  // Thêm mới / Cập nhật bài viết
  const handleSaveReel = (reelData) => {
    if (editingReel) {
      const updated = reels.map(r => r.id === reelData.id ? reelData : r);
      saveReelsState(updated);
      if (selectedReelForDetail?.id === reelData.id) {
        setSelectedReelForDetail(reelData);
      }
    } else {
      const updated = [reelData, ...reels];
      saveReelsState(updated);
    }
    setEditingReel(null);
  };

  // Xóa bài viết
  const handleDeleteReel = (reelId) => {
    soundFx?.playClick();
    const updated = reels.filter(r => r.id !== reelId);
    saveReelsState(updated);
    setDeletingReelId(null);
    if (selectedReelForDetail?.id === reelId) {
      setSelectedReelForDetail(null);
    }
  };

  // Mở Lightbox xem ảnh đơn phóng to
  const handleOpenLightbox = (images, index = 0) => {
    setLightboxData({
      isOpen: true,
      images,
      currentIndex: index
    });
  };

  // Mở chế độ trình chiếu rạp phim (Slideshow)
  const handleOpenSlideshow = (specificReel = null) => {
    soundFx?.playClick();

    let collectedSlides = [];

    if (specificReel) {
      // Chỉ chiếu các ảnh trong 1 bài viết này
      if (specificReel.coverImage) {
        collectedSlides.push({
          url: specificReel.coverImage,
          caption: specificReel.title,
          title: specificReel.title,
          category: specificReel.category,
          date: specificReel.eventDate
        });
      }
      (specificReel.blocks || []).forEach(b => {
        if (b.type === 'image' && b.url) {
          collectedSlides.push({
            url: b.url,
            caption: b.caption || specificReel.title,
            title: specificReel.title,
            category: specificReel.category,
            date: specificReel.eventDate
          });
        }
      });
    } else {
      // Chiếu toàn bộ ảnh của các bài viết đang được lọc
      filteredReels.forEach(r => {
        if (r.coverImage) {
          collectedSlides.push({
            url: r.coverImage,
            caption: r.title,
            title: r.title,
            category: r.category,
            date: r.eventDate
          });
        }
        (r.blocks || []).forEach(b => {
          if (b.type === 'image' && b.url) {
            collectedSlides.push({
              url: b.url,
              caption: b.caption || r.title,
              title: r.title,
              category: r.category,
              date: r.eventDate
            });
          }
        });
      });
    }

    if (collectedSlides.length === 0) {
      alert('Chưa có hình ảnh nào để trình chiếu!');
      return;
    }

    setSlideshowData({
      isOpen: true,
      slides: collectedSlides
    });
  };

  // Khôi phục 3 bài mẫu
  const handleRestorePresets = () => {
    soundFx?.playClick();
    const initial = PRESET_FILM_REELS.map(r => ({ ...r, classId }));
    saveReelsState(initial);
  };

  // Lọc bài viết
  const filteredReels = useMemo(() => {
    return reels.filter(r => {
      const matchCat = selectedCategory === 'all' || r.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        r.title?.toLowerCase().includes(q) ||
        (r.blocks || []).some(b => b.text?.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [reels, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in pb-24">
      
      {/* 1. HEADER BANNER CUỘN PHIM ĐIỆN ẢNH */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-purple-900/40 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Họa tiết tia sáng & cuộn phim nền */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-pink-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Thông tin tiêu đề */}
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-amber-300 border border-white/10">
            <Film className="w-3.5 h-3.5" />
            <span>FILM REEL & CLASS JOURNAL</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight drop-shadow-sm flex items-center space-x-2.5">
            <span>Cuộn Phim Kỷ Niệm Lớp {className}</span>
            <Sparkles className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Lưu giữ trọn vẹn những khoảnh khắc, hoạt động và ký ức thanh xuân tươi đẹp của tập thể lớp qua từng thước phim học trò.
          </p>
        </div>

        {/* Nút Hành động chính */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          {/* Nút Trình chiếu toàn màn hình */}
          <button
            onClick={() => handleOpenSlideshow(null)}
            className="px-5 py-3.5 bg-slate-800/90 hover:bg-slate-700/90 text-amber-300 border border-amber-400/30 font-black text-xs sm:text-sm rounded-2xl shadow-lg flex items-center space-x-2 transition-all transform hover:scale-105 active:scale-95"
            title="Trình chiếu toàn bộ ảnh trong cuộn phim"
          >
            <Play className="w-4 h-4 fill-amber-300" />
            <span>🎞️ Trình Chiếu Slideshow</span>
          </button>

          {/* Nút Tạo khoảnh khắc mới */}
          <button
            onClick={() => {
              soundFx?.playClick();
              setEditingReel(null);
              setShowEditorModal(true);
            }}
            className="px-5 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-purple-900/50 flex items-center space-x-2 transition-all transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>+ Tạo khoảnh khắc mới</span>
          </button>
        </div>

      </div>

      {/* 2. BỘ LỌC DANH MỤC & THANH TÌM KIẾM */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Danh mục chủ đề */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto custom-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({reels.length})
          </button>

          {FILM_REEL_CATEGORIES.map(cat => {
            const count = reels.filter(r => r.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Ô tìm kiếm bài viết */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* 3. LƯỚI DANH SÁCH CUỘN PHIM (GRID 1-3 CỘT) */}
      {filteredReels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReels.map(reel => (
            <FilmReelCard
              key={reel.id}
              reel={reel}
              onOpenDetail={(r) => setSelectedReelForDetail(r)}
              onEdit={(r) => {
                setEditingReel(r);
                setShowEditorModal(true);
              }}
              onToggleLike={handleToggleLike}
            />
          ))}
        </div>
      ) : (
        /* Trạng thái rỗng */
        <div className="p-12 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto text-3xl shadow-sm">
            🎞️
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-black text-base text-slate-800">
              Chưa có cuộn phim kỷ niệm nào
            </h3>
            <p className="text-xs text-slate-500">
              Hãy bấm tạo khoảnh khắc mới để lưu lại kỷ niệm hoạt động của lớp hoặc khôi phục các bài mẫu!
            </p>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => {
                soundFx?.playClick();
                setEditingReel(null);
                setShowEditorModal(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-200 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Tạo khoảnh khắc đầu tiên</span>
            </button>

            <button
              onClick={handleRestorePresets}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs"
            >
              Khôi phục 3 bài mẫu
            </button>
          </div>
        </div>
      )}

      {/* 4. MODAL ĐỌC CHI TIẾT BÀI VIẾT */}
      <FilmReelDetailModal
        isOpen={Boolean(selectedReelForDetail)}
        onClose={() => setSelectedReelForDetail(null)}
        reel={selectedReelForDetail}
        className={className}
        onEdit={(r) => {
          setSelectedReelForDetail(null);
          setEditingReel(r);
          setShowEditorModal(true);
        }}
        onDelete={(id) => setDeletingReelId(id)}
        onToggleLike={handleToggleLike}
        onOpenLightbox={handleOpenLightbox}
        onOpenSlideshow={(r) => handleOpenSlideshow(r)}
      />

      {/* 5. MODAL SOẠN THẢO BÀI VIẾT ĐA PHƯƠNG TIỆN */}
      <FilmReelEditorModal
        isOpen={showEditorModal}
        onClose={() => {
          setShowEditorModal(false);
          setEditingReel(null);
        }}
        onSave={handleSaveReel}
        editingReel={editingReel}
        classId={classId}
        className={className}
      />

      {/* 6. MODAL PHÓNG TO ẢNH LIGHTBOX */}
      <FilmReelLightbox
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData(prev => ({ ...prev, isOpen: false }))}
        images={lightboxData.images}
        currentIndex={lightboxData.currentIndex}
        onIndexChange={(idx) => setLightboxData(prev => ({ ...prev, currentIndex: idx }))}
      />

      {/* 7. MODAL TRÌNH CHIẾU SLIDESHOW TOÀN MÀN HÌNH */}
      <FilmReelSlideshow
        isOpen={slideshowData.isOpen}
        onClose={() => setSlideshowData({ isOpen: false, slides: [] })}
        slides={slideshowData.slides}
      />

      {/* 8. MODAL XÁC NHẬN XÓA CUỘN PHIM */}
      {deletingReelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-base text-slate-800">Xóa Cuộn Phim Này?</h4>
              <p className="text-xs text-slate-500">
                Toàn bộ ảnh chụp và nội dung bài viết này sẽ bị xóa khỏi kho kỷ niệm của lớp.
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingReelId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleDeleteReel(deletingReelId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
