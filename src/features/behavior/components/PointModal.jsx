import React, { useState } from 'react';
import { X, Award, Plus, Minus, Upload, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

const DEFAULT_PLUS_CRITERIA = [
  { id: 'p1', label: 'Hăng hái phát biểu', points: 2, icon: '🙋‍♂️' },
  { id: 'p2', label: 'Làm bài tập xuất sắc', points: 5, icon: '🌟' },
  { id: 'p3', label: 'Giúp đỡ bạn bè', points: 3, icon: '🤝' },
  { id: 'p4', label: 'Trực nhật lớp sạch sẽ', points: 3, icon: '🧹' },
  { id: 'p5', label: 'Đi học đúng giờ nề nếp', points: 2, icon: '⏰' },
  { id: 'p6', label: 'Đạt điểm 9-10 kiểm tra', points: 5, icon: '💯' },
];

const DEFAULT_MINUS_CRITERIA = [
  { id: 'm1', label: 'Nói chuyện riêng trong giờ', points: 2, icon: '🗣️' },
  { id: 'm2', label: 'Quên mang sách vở / Đồ dùng', points: 2, icon: '📚' },
  { id: 'm3', label: 'Đi học muộn không phép', points: 3, icon: '⏳' },
  { id: 'm4', label: 'Không làm bài tập về nhà', points: 5, icon: '📝' },
  { id: 'm5', label: 'Mất trật tự khi xếp hàng', points: 2, icon: '⚠️' },
];

// Pixar 3D Avatar Gallery
const PIXAR_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Luna',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Milo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Bella',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Ruby',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Leo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Chloe',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Oscar',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Maya'
];

export const PointModal = ({
  isOpen,
  onClose,
  student,
  allStudents = [],
  onApplyPointChange,
  onUpdateAvatar
}) => {
  const [activeTab, setActiveTab] = useState('plus'); // 'plus' | 'minus' | 'avatar'
  const [selectedStudentId, setSelectedStudentId] = useState(student?.id || allStudents[0]?.id || '');
  const [plusList, setPlusList] = useState(DEFAULT_PLUS_CRITERIA);
  const [minusList, setMinusList] = useState(DEFAULT_MINUS_CRITERIA);

  // New criteria form state
  const [showAddCriteria, setShowAddCriteria] = useState(false);
  const [newCriteriaLabel, setNewCriteriaLabel] = useState('');
  const [newCriteriaPoints, setNewCriteriaPoints] = useState(2);
  const [newCriteriaType, setNewCriteriaType] = useState('plus');

  if (!isOpen) return null;

  const currentSt = allStudents.find(s => s.id === selectedStudentId) || student || allStudents[0];

  const handleApply = (criteria, type) => {
    if (!currentSt) return;
    if (type === 'plus') {
      soundFx.playCorrect();
      onApplyPointChange?.(currentSt.id, criteria.points, 'plus', criteria.label);
    } else {
      soundFx.playDeduct();
      onApplyPointChange?.(currentSt.id, criteria.points, 'minus', criteria.label);
    }
  };

  const handleCreateNewCriteria = (e) => {
    e.preventDefault();
    if (!newCriteriaLabel.trim()) return;
    soundFx.playClick();

    const newItem = {
      id: `crit-${Date.now()}`,
      label: newCriteriaLabel.trim(),
      points: Number(newCriteriaPoints),
      icon: newCriteriaType === 'plus' ? '⭐' : '⚠️'
    };

    if (newCriteriaType === 'plus') {
      setPlusList(prev => [...prev, newItem]);
    } else {
      setMinusList(prev => [...prev, newItem]);
    }

    setNewCriteriaLabel('');
    setShowAddCriteria(false);
  };

  const handleUploadImage = (e) => {
    const file = e.target.files?.[0];
    if (file && currentSt) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = evt.target.result;
        soundFx.playCorrect();
        onUpdateAvatar?.(currentSt.id, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-5 sm:p-7 border border-purple-100 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-purple-100 rounded-2xl text-purple-700">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">
                Cho Điểm & Nề Nếp Học Sinh
              </h3>
              <p className="text-[11px] text-slate-500 font-bold">
                Tích điểm thưởng, trừ điểm nhắc nhở và đổi Avatar Pixar 3D
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-2xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Student Profile Banner */}
        {currentSt && (
          <div className="my-4 p-3 bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-2xl border border-purple-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={
                  currentSt.avatar ||
                  currentSt.avatar_url ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentSt.full_name)}`
                }
                alt={currentSt.full_name}
                className="w-12 h-12 rounded-full border-2 border-amber-400 bg-white shadow-sm object-cover"
              />
              <div>
                <span className="text-sm font-black text-slate-900 block">{currentSt.full_name}</span>
                <span className="text-[10px] text-slate-500 font-bold">
                  {currentSt.code || 'HS'} • Tổ {currentSt.team_group || 1}
                </span>
              </div>
            </div>

            {/* Switch student dropdown */}
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-white border border-purple-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none shadow-xs"
            >
              {allStudents.map(s => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tab Controls: Điểm Cộng | Điểm Trừ | Avatar Pixar 3D */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl mb-4">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('plus');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'plus'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Điểm Cộng ({currentSt?.plus_points || 0})</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('minus');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'minus'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Minus className="w-3.5 h-3.5" />
            <span>- Điểm Trừ ({currentSt?.minus_points || 0})</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('avatar');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'avatar'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kho Avatar 3D</span>
          </button>
        </div>

        {/* TAB 1: PLUS POINTS */}
        {activeTab === 'plus' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {plusList.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleApply(item, 'plus')}
                  className="p-3 bg-white border border-rose-200 hover:border-rose-400 hover:bg-rose-50/50 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs transition-all transform hover:scale-102 active:scale-95"
                >
                  <span className="text-xl mb-1">{item.icon}</span>
                  <span className="text-xs font-bold text-slate-800 leading-tight">{item.label}</span>
                  <span className="mt-1 px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-black">
                    +{item.points} Điểm
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MINUS POINTS */}
        {activeTab === 'minus' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {minusList.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleApply(item, 'minus')}
                  className="p-3 bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs transition-all transform hover:scale-102 active:scale-95"
                >
                  <span className="text-xl mb-1">{item.icon}</span>
                  <span className="text-xs font-bold text-slate-800 leading-tight">{item.label}</span>
                  <span className="mt-1 px-2 py-0.5 bg-purple-600 text-white rounded-full text-[10px] font-black">
                    -{item.points} Điểm
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PIXAR 3D AVATAR & UPLOAD */}
        {activeTab === 'avatar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Chọn Avatar Pixar 3D có sẵn:</span>
              <label className="cursor-pointer px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh từ máy tính</span>
                <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {PIXAR_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    soundFx.playCorrect();
                    onUpdateAvatar?.(currentSt.id, url);
                  }}
                  className="p-1 rounded-2xl border-2 border-slate-200 hover:border-amber-400 hover:scale-110 transition-all bg-amber-50"
                >
                  <img src={url} alt="3D Avatar" className="w-16 h-16 rounded-xl object-cover mx-auto" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Form to Add Custom Criteria */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          {!showAddCriteria ? (
            <button
              onClick={() => setShowAddCriteria(true)}
              className="text-xs font-extrabold text-purple-600 hover:text-purple-800 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm Tiêu Chí Mới</span>
            </button>
          ) : (
            <form onSubmit={handleCreateNewCriteria} className="w-full flex items-center space-x-2">
              <input
                type="text"
                value={newCriteriaLabel}
                onChange={(e) => setNewCriteriaLabel(e.target.value)}
                placeholder="Tên tiêu chí (ví dụ: Làm mẫu cho lớp...)"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
                required
              />
              <select
                value={newCriteriaType}
                onChange={(e) => setNewCriteriaType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold"
              >
                <option value="plus">+ Cộng</option>
                <option value="minus">- Trừ</option>
              </select>
              <input
                type="number"
                min={1}
                max={10}
                value={newCriteriaPoints}
                onChange={(e) => setNewCriteriaPoints(Number(e.target.value))}
                className="w-16 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-center font-bold"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={() => setShowAddCriteria(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
