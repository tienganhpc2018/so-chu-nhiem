import React, { useState } from 'react';
import { soundFx } from '../utils/soundEffects';
import { Camera, Plus, X, Sparkles, Image, Calendar, Trash2 } from 'lucide-react';

export const ClassJournalModal = ({ isOpen, onClose, currentClass }) => {
  const storageKey = `journal_${currentClass?.id || 'demo'}`;
  const [journals, setJournals] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [
        {
          id: 'j1',
          week: 'Tuần 1 - Học kỳ I',
          date: new Date().toLocaleDateString('vi-VN'),
          title: 'Tiết sinh hoạt lớp tuyên dương các cá nhân xuất sắc',
          imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&q=80',
          note: 'Cả lớp hào hứng tham gia phong trào tích xu và thi đua 4 Tổ.'
        }
      ];
    } catch {
      return [];
    }
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [weekName, setWeekName] = useState('Tuần 1');
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleAddJournal = (e) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    soundFx.playCorrect();
    const newItem = {
      id: `journal_${Date.now()}`,
      week: weekName.trim(),
      date: new Date().toLocaleDateString('vi-VN'),
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      note: note.trim()
    };

    const updated = [newItem, ...journals];
    setJournals(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setShowAddForm(false);
    setTitle('');
    setImageUrl('');
    setNote('');
  };

  const handleDeleteJournal = (id) => {
    if (confirm('Thầy có muốn xóa bức ảnh nhật ký sinh hoạt này không?')) {
      soundFx.playDeduct();
      const updated = journals.filter(j => j.id !== id);
      setJournals(updated);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in overflow-y-auto select-none">
      
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-purple-100 my-auto relative space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-purple-glow">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Nhật Ký Sinh Hoạt & Ảnh Kỷ Niệm Lớp</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Lưu giữ các khoảnh khắc ảnh hoạt động của tập thể lớp {currentClass?.name || '8A5'} theo từng tuần.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Journal Button */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              soundFx.playClick();
              setShowAddForm(!showAddForm);
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-purple-glow flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Đăng tải ảnh kỷ niệm mới</span>
          </button>
        </div>

        {/* Add Journal Form */}
        {showAddForm && (
          <form onSubmit={handleAddJournal} className="p-5 bg-purple-50/70 rounded-3xl border border-purple-200 space-y-3 text-xs font-bold animate-in zoom-in">
            <h4 className="text-sm font-black text-purple-950">📸 Đăng Tải Khoảnh Khắc Tuần Học Mới:</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 mb-1">Tuần học:</label>
                <input
                  type="text"
                  required
                  value={weekName}
                  onChange={(e) => setWeekName(e.target.value)}
                  className="w-full bg-white border border-purple-200 rounded-2xl px-3 py-2 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Đường dẫn ảnh (URL) *:</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-white border border-purple-200 rounded-2xl px-3 py-2 text-xs font-bold outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Tiêu đề khoảnh khắc *:</label>
              <input
                type="text"
                required
                placeholder="VD: Cả lớp tham gia thi vẽ tranh 20/11..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-purple-200 rounded-2xl px-3 py-2 text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Ghi chú kỷ niệm:</label>
              <textarea
                rows={2}
                placeholder="Nội dung ghi chú ý nghĩa của tiết sinh hoạt..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-white border border-purple-200 rounded-2xl px-3 py-2 text-xs font-bold outline-none"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 text-white font-black rounded-xl shadow-purple-glow"
              >
                Lưu vào Nhật Ký
              </button>
            </div>
          </form>
        )}

        {/* Journals Grid List */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
          {journals.map(item => (
            <div key={item.id} className="bg-slate-50 rounded-3xl p-4 border border-slate-200 flex flex-col sm:flex-row gap-4 items-start relative group">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full sm:w-36 h-28 object-cover rounded-2xl border border-purple-200 bg-white shrink-0"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-full uppercase">
                    {item.week}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                </div>
                <h4 className="text-sm font-black text-slate-800">{item.title}</h4>
                {item.note && <p className="text-xs text-slate-500 font-semibold">{item.note}</p>}
              </div>
              <button
                onClick={() => handleDeleteJournal(item.id)}
                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-coral-600 hover:bg-coral-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
