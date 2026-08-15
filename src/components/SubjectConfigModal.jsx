import React, { useState } from 'react';
import { soundFx } from '../utils/soundEffects';
import { BookOpen, Plus, Edit, Trash2, X, RotateCcw } from 'lucide-react';

export const defaultSubjectsList = [
  { id: 's1', icon: '⭐', name: 'Ghi chung / Nề nếp' },
  { id: 's2', icon: '🔢', name: 'Toán' },
  { id: 's3', icon: '📖', name: 'Tiếng Việt' },
  { id: 's4', icon: '🔤', name: 'Tiếng Anh' },
  { id: 's5', icon: '🌿', name: 'TN & Xã hội' },
  { id: 's6', icon: '🔬', name: 'Khoa học' },
  { id: 's7', icon: '📜', name: 'Lịch sử & Địa lý' },
  { id: 's8', icon: '💻', name: 'Tin học' },
  { id: 's9', icon: '⚙️', name: 'Công nghệ' },
  { id: 's10', icon: '🎨', name: 'Mĩ thuật' },
  { id: 's11', icon: '🎵', name: 'Âm nhạc' },
  { id: 's12', icon: '⚽', name: 'Giáo dục thể chất' },
  { id: 's13', icon: '🕊️', name: 'Đạo đức' }
];

export const SubjectConfigModal = ({ isOpen, onClose, subjects = defaultSubjectsList, onSaveSubjects }) => {
  const emojiList = ['⭐', '🔢', '📖', '🔤', '🌿', '🔬', '📜', '💻', '⚙️', '🎨', '🎵', '⚽', '🕊️', '📚', '🎯', '🏆', '🧪', '💡', '🌍', '📐'];

  const [selectedEmoji, setSelectedEmoji] = useState('⭐');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [subjectList, setSubjectList] = useState(subjects);
  const [editingId, setEditingId] = useState(null);

  if (!isOpen) return null;

  // Add new subject
  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    soundFx.playCorrect();

    if (editingId) {
      setSubjectList(prev => prev.map(s => s.id === editingId ? { ...s, icon: selectedEmoji, name: newSubjectName.trim() } : s));
      setEditingId(null);
    } else {
      const newItem = {
        id: `subj_${Date.now()}`,
        icon: selectedEmoji,
        name: newSubjectName.trim()
      };
      setSubjectList(prev => [...prev, newItem]);
    }

    setNewSubjectName('');
  };

  // Edit existing subject
  const handleStartEdit = (subject) => {
    soundFx.playClick();
    setEditingId(subject.id);
    setSelectedEmoji(subject.icon || '⭐');
    setNewSubjectName(subject.name);
  };

  // Delete subject
  const handleDelete = (id, name) => {
    if (confirm(`Thầy có chắc muốn xóa môn "${name}" khỏi danh sách?`)) {
      soundFx.playDeduct();
      setSubjectList(prev => prev.filter(s => s.id !== id));
    }
  };

  // Reset default subjects
  const handleResetDefault = () => {
    soundFx.playCorrect();
    setSubjectList(defaultSubjectsList);
  };

  // Close and save
  const handleCloseAndSave = () => {
    soundFx.playClick();
    onSaveSubjects?.(subjectList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in overflow-y-auto select-none">
      
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-purple-100 space-y-6 animate-in zoom-in my-auto relative">
        
        {/* Header (Screenshot 2) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Cấu Hình Danh Sách Môn Học</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Thêm, sửa, xóa môn học để gắn thẻ khi khen thưởng / trừ xu
              </p>
            </div>
          </div>

          <button onClick={handleCloseAndSave} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION 1: THÊM MÔN HỌC MỚI (Screenshot 2) */}
        <div className="p-5 bg-purple-50/50 rounded-3xl border border-purple-100 space-y-3">
          <div className="text-xs font-black text-purple-900 uppercase tracking-wider flex items-center space-x-1.5">
            <Plus className="w-4 h-4 text-purple-600" />
            <span>THÊM MÔN HỌC MỚI</span>
          </div>

          {/* Emoji Selection Bar */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-500">Chọn Biểu tượng / Emoji:</label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-2xl border border-purple-100">
              {emojiList.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-8 h-8 rounded-xl text-sm flex items-center justify-center transition-all ${
                    selectedEmoji === emoji ? 'bg-purple-600 text-white shadow-md scale-110' : 'hover:bg-purple-50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Name Input & Add Button */}
          <form onSubmit={handleAddSubject} className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Tên Môn Học *</label>
              <input
                type="text"
                required
                placeholder="VD: Toán, Tiếng Anh, Hoạt động trải nghiệm..."
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="w-full bg-white border border-purple-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-purple-glow flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>{editingId ? 'Lưu thay đổi môn' : 'Thêm môn học'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 2: DANH SÁCH MÔN HỌC HIỆN TẠI (13) (Screenshot 2 & 3) */}
        <div className="space-y-3">
          <div className="text-xs font-black text-slate-700 uppercase tracking-wider">
            DANH SÁCH MÔN HỌC HIỆN TẠI ({subjectList.length}):
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            {subjectList.map(subj => (
              <div
                key={subj.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-purple-300 transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-base p-1.5 bg-white rounded-xl shadow-xs border border-slate-100">
                    {subj.icon || '📚'}
                  </span>
                  <span className="text-xs font-black text-slate-800">{subj.name}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleStartEdit(subj)}
                    className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                    title="Chỉnh sửa môn học"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(subj.id, subj.name)}
                    className="p-1.5 text-slate-400 hover:text-coral-600 hover:bg-coral-50 rounded-xl transition-all"
                    title="Xóa môn học"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER BUTTONS (Screenshot 3) */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={handleResetDefault}
            className="px-4 py-2 bg-coral-50 text-coral-600 hover:bg-coral-100 border border-coral-200 font-extrabold text-xs rounded-2xl flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>

          <button
            onClick={handleCloseAndSave}
            className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-2xl shadow-md"
          >
            Đóng thiết lập
          </button>
        </div>

      </div>
    </div>
  );
};
