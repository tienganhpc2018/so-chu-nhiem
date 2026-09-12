import React, { useState, useEffect } from 'react';
import { X, Upload, Sparkles, Image as ImageIcon, Smile, Link as LinkIcon, Check } from 'lucide-react';
import { GIFT_CATEGORIES, COLOR_THEMES, POPULAR_EMOJIS, LIMIT_OPTIONS } from '../constants/presetGifts';
import { soundFx } from '../../../utils/soundEffects';

export const AddEditGiftModal = ({ isOpen, onClose, onSave, editingGift = null }) => {
  const [name, setName] = useState('');
  const [requiredCoins, setRequiredCoins] = useState(10);
  const [stock, setStock] = useState(10);
  const [category, setCategory] = useState(GIFT_CATEGORIES[0]);
  const [redemptionLimit, setRedemptionLimit] = useState('none');
  const [imageType, setImageType] = useState('emoji'); // 'emoji' | 'upload' | 'url'
  const [imageValue, setImageValue] = useState('🎁');
  const [color, setColor] = useState('rose');
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (editingGift) {
      setName(editingGift.name || '');
      setRequiredCoins(editingGift.requiredCoins || 10);
      setStock(editingGift.stock ?? 10);
      setCategory(editingGift.category || GIFT_CATEGORIES[0]);
      setRedemptionLimit(editingGift.redemptionLimit || 'none');
      setColor(editingGift.color || 'rose');

      const img = editingGift.image || '🎁';
      if (img.startsWith('data:image')) {
        setImageType('upload');
        setImageValue(img);
      } else if (img.startsWith('http://') || img.startsWith('https://')) {
        setImageType('url');
        setImageValue(img);
      } else {
        setImageType('emoji');
        setImageValue(img);
      }
    } else {
      setName('');
      setRequiredCoins(10);
      setStock(10);
      setCategory(GIFT_CATEGORIES[0]);
      setRedemptionLimit('none');
      setImageType('emoji');
      setImageValue('🎁');
      setColor('rose');
      setPreviewError(false);
    }
  }, [editingGift, isOpen]);

  if (!isOpen) return null;

  // Handle file upload Base64
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 3MB
    if (file.size > 3 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 3MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageValue(event.target?.result);
      setPreviewError(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên phần quà!');
      return;
    }
    if (requiredCoins < 1) {
      alert('Số xu quy đổi phải từ 1 xu trở lên!');
      return;
    }
    if (stock < 0) {
      alert('Số lượng tồn kho không được âm!');
      return;
    }

    soundFx?.playClick();

    const giftData = {
      id: editingGift ? editingGift.id : `gift-${Date.now()}`,
      name: name.trim(),
      requiredCoins: Number(requiredCoins),
      stock: Number(stock),
      category: category || 'Khác',
      redemptionLimit: redemptionLimit || 'none',
      image: imageValue || '🎁',
      color: color || 'rose'
    };

    onSave(giftData);
    onClose();
  };

  const selectedTheme = COLOR_THEMES.find(t => t.id === color) || COLOR_THEMES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50 to-pink-50">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">🎁</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                {editingGift ? 'Chỉnh Sửa Phần Quà' : 'Thêm Phần Quà Mới'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Cấu hình vật phẩm, số xu quy đổi và số lượng trong kho
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          
          {/* Tên phần quà */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tên phần quà <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Bút chì màu, Sổ tay cute, Thẻ miễn BTVN..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition-all"
            />
          </div>

          {/* Grid 2 cột: Số xu & Tồn kho */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Số xu quy đổi (🪙) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={requiredCoins}
                onChange={(e) => setRequiredCoins(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Số lượng trong kho (Món) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Danh mục */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Danh mục phân loại
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              {GIFT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Giới hạn đổi quà theo tuần/tháng/học kỳ */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Giới hạn tần suất đổi quà
              </label>
              <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md">
                Kiểm soát đặc quyền
              </span>
            </div>
            <select
              value={redemptionLimit}
              onChange={(e) => setRedemptionLimit(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {LIMIT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} — {opt.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Ảnh / Biểu tượng quà */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Ảnh / Biểu tượng hiển thị
            </label>

            {/* Tab chọn hình thức ảnh */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-2.5 space-x-1">
              <button
                type="button"
                onClick={() => { setImageType('emoji'); if (!imageValue || imageValue.length > 4) setImageValue('🎁'); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 transition-all ${
                  imageType === 'emoji' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Biểu Tượng (Emoji)</span>
              </button>
              <button
                type="button"
                onClick={() => setImageType('upload')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 transition-all ${
                  imageType === 'upload' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải Ảnh (Base64)</span>
              </button>
              <button
                type="button"
                onClick={() => setImageType('url')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 transition-all ${
                  imageType === 'url' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Link Ảnh Online</span>
              </button>
            </div>

            {/* Nội dung theo từng tab */}
            {imageType === 'emoji' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={imageValue}
                  onChange={(e) => setImageValue(e.target.value)}
                  placeholder="Gõ hoặc chọn 1 biểu tượng emoji..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-center"
                />
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100 max-h-24 overflow-y-auto custom-scrollbar">
                  {POPULAR_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setImageValue(em)}
                      className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white rounded-lg hover:shadow-sm transition-all"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {imageType === 'upload' && (
              <div className="flex items-center space-x-3">
                <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-rose-400 rounded-2xl cursor-pointer bg-slate-50 hover:bg-rose-50/50 transition-all text-center">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-600">Bấm để tải ảnh từ máy tính</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WEBP (Dưới 3MB)</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}

            {imageType === 'url' && (
              <input
                type="url"
                value={imageValue}
                onChange={(e) => { setImageValue(e.target.value); setPreviewError(false); }}
                placeholder="https://example.com/anh-qua.png"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            )}
          </div>

          {/* Bảng chọn màu sắc nhận diện */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Màu sắc phong cách thẻ quà
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {COLOR_THEMES.map((t) => {
                const isSelected = color === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setColor(t.id)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold border-2 flex flex-col items-center justify-center space-y-1 transition-all ${
                      isSelected
                        ? `${t.border} ${t.bg} shadow-md scale-105 ring-2 ring-rose-300 ring-offset-1`
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-gradient-to-tr shadow-xs flex items-center justify-center" style={{ backgroundColor: t.id === 'rose' ? '#F43F5E' : t.id === 'amber' ? '#F59E0B' : t.id === 'emerald' ? '#10B981' : t.id === 'indigo' ? '#6366F1' : t.id === 'purple' ? '#A855F7' : '#0EA5E9' }}>
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </span>
                    <span className="truncate">{t.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Khung xem trước (Live Preview) */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center space-x-3.5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${selectedTheme.border} ${selectedTheme.bg} overflow-hidden shrink-0 shadow-inner`}>
              {imageValue && (imageValue.startsWith('data:image') || imageValue.startsWith('http')) ? (
                <img
                  src={imageValue}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={() => setPreviewError(true)}
                />
              ) : (
                <span className="text-3xl">{imageValue || '🎁'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${selectedTheme.badge}`}>
                {category || 'Dụng cụ học tập'}
              </span>
              <h4 className="font-bold text-sm text-slate-800 truncate mt-0.5">
                {name || 'Tên phần quà mẫu'}
              </h4>
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 mt-0.5">
                <span className="text-amber-600 font-extrabold flex items-center">
                  🪙 {requiredCoins} xu
                </span>
                <span>•</span>
                <span>Kho: {stock} món</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-lg shadow-rose-200 flex items-center space-x-1.5 transform hover:scale-105 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{editingGift ? 'Cập Nhật Quà' : 'Thêm Phần Quà'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
