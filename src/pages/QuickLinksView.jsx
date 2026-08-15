import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/soundEffects';
import {
  Link as LinkIcon,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  X,
  Bookmark,
  BookOpen,
  Video,
  MessageCircle,
  Folder,
  CheckCircle2
} from 'lucide-react';

export const QuickLinksView = ({ currentClass }) => {
  // Saved Links List in LocalStorage
  const storageKey = `quick_links_${currentClass?.id || 'demo'}`;
  
  const [linksList, setLinksList] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [
        {
          id: 'l1',
          title: 'học liệu',
          url: 'https://lophocthanyeu.com',
          category: 'Học liệu & SGK',
          description: 'Trang học liệu Tiếng Anh trực tuyến',
          isPinned: true
        }
      ];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('https://');
  const [formCategory, setFormCategory] = useState('Học liệu & SGK');
  const [formDesc, setFormDesc] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(linksList));
    } catch (e) {
      console.error(e);
    }
  }, [linksList, storageKey]);

  const categories = [
    'Tất cả',
    'Học liệu & SGK',
    'Phòng học trực tuyến (Meet/Zoom)',
    'Nhóm Zalo lớp học',
    'Tài liệu Tiếng Anh',
    'Khác'
  ];

  // Open Create Modal
  const handleOpenCreateModal = () => {
    soundFx.playClick();
    setEditingLink(null);
    setFormTitle('');
    setFormUrl('https://');
    setFormCategory('Học liệu & SGK');
    setFormDesc('');
    setFormIsPinned(false);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (link) => {
    soundFx.playClick();
    setEditingLink(link);
    setFormTitle(link.title);
    setFormUrl(link.url);
    setFormCategory(link.category);
    setFormDesc(link.description || '');
    setFormIsPinned(!!link.isPinned);
    setShowAddModal(true);
  };

  // Save Link (Create or Update)
  const handleSaveLink = (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUrl.trim()) return;

    soundFx.playCorrect();

    if (editingLink) {
      setLinksList(prev => prev.map(item => item.id === editingLink.id ? {
        ...item,
        title: formTitle.trim(),
        url: formUrl.trim().startsWith('http') ? formUrl.trim() : `https://${formUrl.trim()}`,
        category: formCategory,
        description: formDesc.trim(),
        isPinned: formIsPinned
      } : item));
      showToast(`Đã cập nhật liên kết: ${formTitle.trim()}`);
    } else {
      const newLink = {
        id: `link_${Date.now()}`,
        title: formTitle.trim(),
        url: formUrl.trim().startsWith('http') ? formUrl.trim() : `https://${formUrl.trim()}`,
        category: formCategory,
        description: formDesc.trim(),
        isPinned: formIsPinned
      };
      setLinksList(prev => [newLink, ...prev]);
      showToast(`Đã thêm liên kết: ${formTitle.trim()}`);
    }

    setShowAddModal(false);
  };

  // Delete Link
  const handleDeleteLink = (id, title) => {
    if (confirm(`Thầy có chắc chắn muốn xóa liên kết "${title}" không?`)) {
      soundFx.playDeduct();
      setLinksList(prev => prev.filter(l => l.id !== id));
      showToast(`Đã xóa liên kết: ${title}`);
    }
  };

  // Show Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered links
  const filteredLinks = linksList.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || (l.description && l.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'Tất cả' || l.category === selectedCategory;
    return matchesSearch && matchesCat;
  }).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in select-none">
      
      {/* HEADER BANNER (Screenshot 4) */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl shadow-purple-glow">
              <LinkIcon className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Liên Kết Tiện Ích Lớp {currentClass?.name || '8A5'}
            </h2>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Lưu trữ nhanh các đường dẫn trang web, học liệu, phòng họp trực tuyến dùng nhiều.
          </p>
        </div>

        {/* Top Search & Add Button (Screenshot 4) */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 transition-all"
            />
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-purple-glow transition-all flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm liên kết</span>
          </button>
        </div>

      </div>

      {/* CATEGORY FILTER PILLS (Screenshot 4) */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const count = cat === 'Tất cả' ? linksList.length : linksList.filter(l => l.category === cat).length;
          if (count === 0 && cat !== 'Tất cả') return null;
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                soundFx.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-purple-glow'
                  : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* EMPTY STATE SCREENSHOT 1 */}
      {linksList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-soft space-y-4 my-8 max-w-lg mx-auto">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-sm">
            <BookOpen className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Chưa có liên kết tiện ích nào</h3>
            <p className="text-xs text-slate-400 font-bold mt-1">
              Hãy tạo các liên kết SGK điện tử, Zoom/Meet, Zalo lớp để truy cập nhanh chóng!
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-purple-glow uppercase tracking-wider transition-all"
          >
            + + Thêm liên kết đầu tiên
          </button>
        </div>
      ) : (
        /* LINK CARDS GRID (Screenshot 4) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map(link => (
            <div
              key={link.id}
              className={`bg-white rounded-3xl p-5 border shadow-soft transition-all space-y-4 flex flex-col justify-between relative group hover:border-purple-300 ${
                link.isPinned ? 'border-purple-300 ring-2 ring-purple-100' : 'border-purple-100'
              }`}
            >
              {/* Category Badge & Pin */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-purple-900 bg-purple-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  {link.category}
                </span>

                {link.isPinned && (
                  <span className="text-amber-500 text-xs flex items-center space-x-1" title="Đã ghim">
                    <Bookmark className="w-4 h-4 fill-amber-400" />
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="text-base font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                  {link.title}
                </h4>
                {link.description && (
                  <p className="text-xs font-semibold text-slate-400 mt-1 line-clamp-2">
                    {link.description}
                  </p>
                )}
                <span className="text-[11px] text-slate-400 font-mono block mt-1 truncate">
                  {link.url}
                </span>
              </div>

              {/* Action Buttons (Screenshot 4: Mở liên kết ↗ | Sửa | Xóa) */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundFx.playClick()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                >
                  <span>Mở liên kết</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEditModal(link)}
                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteLink(link.id, link.title)}
                    className="p-2 text-slate-400 hover:text-coral-600 hover:bg-coral-50 rounded-xl transition-all"
                    title="Xóa liên kết"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT LINK MODAL (Screenshots 2 & 3) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-purple-100 space-y-5 animate-in zoom-in">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  {editingLink ? 'Chỉnh Sửa Liên Kết' : 'Thêm Liên Kết Mới'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Thêm trang web, tài liệu hoặc Google Meet dùng chung
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-4 text-xs font-bold">
              
              {/* Tên liên kết */}
              <div>
                <label className="block text-slate-700 mb-1">Tên liên kết / Trang web *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Sách giáo khoa điện tử, Google Meet..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-purple-500"
                />
              </div>

              {/* Địa chỉ URL */}
              <div>
                <label className="block text-slate-700 mb-1">Địa chỉ URL (Link) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 font-mono"
                />
              </div>

              {/* Danh mục */}
              <div>
                <label className="block text-slate-700 mb-1">Danh mục</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-purple-500"
                >
                  {categories.filter(c => c !== 'Tất cả').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Mô tả ngắn */}
              <div>
                <label className="block text-slate-700 mb-1">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú mục đích liên kết này..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-purple-500"
                ></textarea>
              </div>

              {/* Ghim liên kết */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                />
                <label htmlFor="pinCheck" className="text-slate-700 cursor-pointer">
                  Ghim liên kết này lên đầu trang
                </label>
              </div>

              {/* Buttons (Screenshot 3: Hủy | Thêm Liên Kết) */}
              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black shadow-purple-glow"
                >
                  {editingLink ? 'Lưu Thay Đổi' : 'Thêm Liên Kết'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION (Screenshot 4) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-emerald-100 rounded-2xl px-5 py-3 shadow-2xl border border-emerald-500 backdrop-blur-md flex items-center space-x-2 animate-in slide-in-from-bottom-5 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
