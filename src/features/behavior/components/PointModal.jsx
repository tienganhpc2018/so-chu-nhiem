import React, { useState } from 'react';
import {
  X,
  Award,
  Plus,
  Minus,
  Upload,
  Sparkles,
  Check,
  RotateCcw,
  GraduationCap,
  Star,
  Settings,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Camera,
  Crop,
  Scissors
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../../utils/soundEffects';
import { AvatarCropModal } from '../../../components/AvatarCropModal';
import { CameraCaptureModal } from '../../../components/CameraCaptureModal';

const DEFAULT_PLUS_CRITERIA = [
  { id: 'p1', label: 'Phát biểu xây dựng bài', points: 2, icon: '🙋‍♂️' },
  { id: 'p2', label: 'Làm bài tập xuất sắc', points: 2, icon: '🌟' },
  { id: 'p3', label: 'Giúp đỡ bạn bè / Nhóm tốt', points: 2, icon: '🤝' },
  { id: 'p4', label: 'Tham gia mini games', points: 2, icon: '🧹' },
  { id: 'p5', label: 'Đạt điểm 10 kiểm tra', points: 5, icon: '💯' },
  { id: 'p6', label: 'Khen ngợi nỗ lực tiến bộ', points: 2, icon: '🚀' },
  { id: 'p7', label: 'Đọc bài / Thuyết trình hay', points: 2, icon: '🎤' },
  { id: 'p8', label: 'Học tập nghiêm túc, chu đáo', points: 2, icon: '⭐' },
];

const DEFAULT_MINUS_CRITERIA = [
  { id: 'm1', label: 'Nói chuyện riêng trong giờ', points: 2, icon: '🗣️' },
  { id: 'm2', label: 'Quên mang sách vở / Đồ dùng', points: 2, icon: '📚' },
  { id: 'm3', label: 'Đi học muộn không phép', points: 3, icon: '⏳' },
  { id: 'm4', label: 'Không làm bài tập về nhà', points: 5, icon: '📝' },
  { id: 'm5', label: 'Mất trật tự khi xếp hàng', points: 2, icon: '⚠️' },
];

// Avatar Học Sinh Việt Nam Áo Trắng Khăn Quàng
const VN_STUDENT_AVATARS = [
  {
    id: 'vn-g1',
    name: 'Nữ sinh 1',
    gender: 'Nữ',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=250&auto=format&fit=crop&q=80'
  },
  {
    id: 'vn-g2',
    name: 'Nữ sinh 2',
    gender: 'Nữ',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250&auto=format&fit=crop&q=80'
  },
  {
    id: 'vn-b1',
    name: 'Nam sinh 1',
    gender: 'Nam',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80'
  },
  {
    id: 'vn-b2',
    name: 'Nam sinh 2',
    gender: 'Nam',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80'
  },
  {
    id: 'vn-g3',
    name: 'Nữ sinh 3',
    gender: 'Nữ',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80'
  },
  {
    id: 'vn-b3',
    name: 'Nam sinh 3',
    gender: 'Nam',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80'
  }
];

// Pixar 3D Robot Avatar Gallery
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
  onDirectAdjustPoint,
  onResetPoints,
  onConvertReward,
  onToggleGender,
  onUpdateAvatar
}) => {
  // Tabs: 'give' (Cho Điểm & Nhắc Nhở) | 'exchange' (Quy Đổi Điểm Thưởng) | 'avatar' (Đổi Avatar)
  const [activeTab, setActiveTab] = useState('give');
  const [selectedStudentId, setSelectedStudentId] = useState(student?.id || allStudents[0]?.id || '');
  const [plusList, setPlusList] = useState(DEFAULT_PLUS_CRITERIA);
  const [minusList, setMinusList] = useState(DEFAULT_MINUS_CRITERIA);

  // Exchange points selection: 10, 20, 30
  const [exchangeAmount, setExchangeAmount] = useState(10);
  const [notification, setNotification] = useState(null);

  // Avatar Cropper & Camera Modal states
  const [showCropModal, setShowCropModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);

  // New criteria form state
  const [showAddCriteria, setShowAddCriteria] = useState(false);
  const [newCriteriaLabel, setNewCriteriaLabel] = useState('');
  const [newCriteriaPoints, setNewCriteriaPoints] = useState(2);
  const [newCriteriaType, setNewCriteriaType] = useState('plus');

  if (!isOpen) return null;

  const currentSt = allStudents.find(s => s.id === selectedStudentId) || student || allStudents[0];
  if (!currentSt) return null;

  const plusPoints = Number(currentSt.plus_points ?? currentSt.total_stars ?? 0);
  const minusPoints = Number(currentSt.minus_points ?? 0);
  const kttxBonus = Number(currentSt.kttx_bonus ?? 0);
  const isFemale = currentSt.gender === 'Nữ' || currentSt.gender === 'female';

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 1. Cho điểm theo tiêu chí
  const handleApplyCriteria = (criteria, type) => {
    if (type === 'plus') {
      soundFx.playCorrect();
      onApplyPointChange?.(currentSt.id, criteria.points, 'plus', criteria.label);
      showToast(`+${criteria.points} điểm: ${criteria.label}`);
    } else {
      soundFx.playDeduct();
      onApplyPointChange?.(currentSt.id, criteria.points, 'minus', criteria.label);
      showToast(`-${criteria.points} điểm: ${criteria.label}`, 'warn');
    }
  };

  // 2. Trả lại / Điều chỉnh điểm trực tiếp (+ / -) khi lỡ bấm nhầm
  const handleAdjust = (type, delta) => {
    soundFx.playClick();
    onDirectAdjustPoint?.(currentSt.id, type, delta);
    showToast(`${delta > 0 ? 'Tăng' : 'Giảm'} 1 điểm ${type === 'plus' ? 'cộng' : 'trừ'}`);
  };

  // 3. Reset điểm về 0
  const handleReset = () => {
    soundFx.playClick();
    onResetPoints?.(currentSt.id);
    showToast(`Đã đặt lại điểm của ${currentSt.full_name} về 0!`);
  };

  // 4. Đổi giới tính
  const handleGenderToggle = (specificGender) => {
    soundFx.playClick();
    onToggleGender?.(currentSt.id, specificGender);
    const newG = specificGender || (isFemale ? 'Nam' : 'Nữ');
    showToast(`Đã chọn giới tính: ${newG === 'female' || newG === 'Nữ' ? 'Nữ' : 'Nam'}`);
  };

  // 5. Quy đổi sang Điểm KTTX
  const handleExchangeKTTX = () => {
    if (plusPoints < exchangeAmount) {
      soundFx.playDeduct();
      showToast(`Học sinh chưa đủ ${exchangeAmount} điểm nề nếp để quy đổi!`, 'error');
      return;
    }

    const bonusToAdd = Math.floor(exchangeAmount / 10);
    if (kttxBonus + bonusToAdd > 2) {
      soundFx.playDeduct();
      showToast(`Đã chạm mức trần tối đa (+2 điểm KTTX)! Không thể cộng thêm.`, 'warn');
      return;
    }

    soundFx.playCorrect();
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });

    onConvertReward?.(currentSt.id, 'kttx', exchangeAmount);
    showToast(`Thành công! Đã đổi ${exchangeAmount} điểm nề nếp lấy +${bonusToAdd} điểm KTTX 🎓`);
  };

  // 6. Quy đổi sang Sao Cửa Hàng
  const handleExchangeStars = () => {
    if (plusPoints < exchangeAmount) {
      soundFx.playDeduct();
      showToast(`Học sinh chưa đủ ${exchangeAmount} điểm nề nếp để quy đổi!`, 'error');
      return;
    }

    soundFx.playCorrect();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    onConvertReward?.(currentSt.id, 'star', exchangeAmount);
    showToast(`Thành công! Đã chuyển ${exchangeAmount} điểm nề nếp sang +${exchangeAmount} Sao Cửa Hàng ⭐`);
  };

  // 7. Tạo tiêu chí mới
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
    showToast(`Đã thêm tiêu chí mới: ${newItem.label}`);
  };

  // Upload ảnh chân dung từ máy tính -> Mở Avatar Crop Modal để Thầy căn chỉnh khuôn mặt
  const handleUploadImage = (e) => {
    const file = e.target.files?.[0];
    if (file && currentSt) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = evt.target.result;
        setCropImageSrc(base64);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input để có thể chọn lại file
    }
  };

  // Nhận ảnh vừa chụp từ Camera / Webcam -> Mở ngay Avatar Cropper với AI Face Detection
  const handleCapturedFromCamera = (dataUrl) => {
    setShowCameraModal(false);
    setCropImageSrc(dataUrl);
    setShowCropModal(true);
  };

  // Mở công cụ căn chỉnh khuôn mặt cho ảnh hiện tại của học sinh
  const handleOpenReCrop = () => {
    if (currentSt?.avatar || currentSt?.avatar_url) {
      setCropImageSrc(currentSt.avatar || currentSt.avatar_url);
      setShowCropModal(true);
    }
  };

  // Lưu avatar sau khi đã căn chỉnh khuôn mặt chính xác
  const handleSaveCroppedAvatar = (croppedBase64) => {
    soundFx.playCorrect();
    onUpdateAvatar?.(currentSt.id, croppedBase64);
    setShowCropModal(false);
    showToast('Đã căn chỉnh khuôn mặt và lưu avatar thành công!');
  };

  // Progress to next 10 points
  const currentProgress = plusPoints % 10;
  const neededFor10 = 10 - currentProgress;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl sm:max-w-3xl bg-white rounded-[2.5rem] shadow-2xl p-5 sm:p-7 border border-slate-200 flex flex-col justify-between max-h-[94vh] overflow-y-auto">
        
        {/* Toast Notification */}
        {notification && (
          <div
            className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-60 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-black flex items-center space-x-2 animate-in slide-in-from-top duration-200 ${
              notification.type === 'error'
                ? 'bg-rose-600 text-white'
                : notification.type === 'warn'
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{notification.msg}</span>
          </div>
        )}

        {/* 1. Header Bar: Avatar, Info, Gender Badge, Tiêu Chí, Close */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            {/* Avatar with Gender Dot */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl border-2 border-amber-400 p-0.5 bg-amber-50 shadow-sm overflow-hidden flex items-center justify-center">
                <img
                  src={
                    currentSt.avatar ||
                    currentSt.avatar_url ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentSt.full_name)}`
                  }
                  alt={currentSt.full_name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-black border-2 border-white shadow-xs ${
                  isFemale ? 'bg-pink-500' : 'bg-blue-500'
                }`}
                title={isFemale ? 'Nữ' : 'Nam'}
              >
                {isFemale ? '♀' : '♂'}
              </span>
            </div>

            {/* Name, Code, Badges */}
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-extrabold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  {currentSt.code || 'HS01'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {currentSt.full_name}
                </h3>
                
                {/* Gender Toggle Button */}
                <button
                  type="button"
                  onClick={handleGenderToggle}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-black border transition-all hover:scale-105 active:scale-95 flex items-center space-x-1 ${
                    isFemale
                      ? 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100'
                      : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                  }`}
                  title="Bấm để đổi giới tính"
                >
                  <span>{isFemale ? '👧 Nữ Đổi' : '👦 Nam Đổi'}</span>
                </button>
              </div>

              {/* Subtitle Stats */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-500 mt-0.5">
                <span>Tổ {currentSt.team_group || 1}</span>
                <span>•</span>
                <span className="text-emerald-600 font-black">+{plusPoints} ⭐</span>
                <span>•</span>
                <span className="text-purple-600 font-black">-{minusPoints}</span>
                <span>•</span>
                <span className="text-blue-600 font-black flex items-center space-x-0.5">
                  <GraduationCap className="w-3.5 h-3.5 inline text-blue-600" />
                  <span>+{kttxBonus} KTTX</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action: Tiêu Chí & Close */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowAddCriteria(!showAddCriteria);
              }}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center space-x-1 transition-all"
              title="Quản lý / Thêm tiêu chí"
            >
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              <span>Tiêu chí</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Switch Student Bar (Dropdown) */}
        {allStudents.length > 1 && (
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">Học sinh được chọn:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                soundFx.playClick();
                setSelectedStudentId(e.target.value);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 font-extrabold text-slate-800 outline-none text-xs"
            >
              {allStudents.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code ? `${s.code} - ` : ''}{s.full_name} (Tổ {s.team_group || 1})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Form thêm tiêu chí mới (nếu bấm nút Tiêu chí) */}
        {showAddCriteria && (
          <form onSubmit={handleCreateNewCriteria} className="mt-3 p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-black text-purple-900">
              <span>+ Thêm Tiêu Chí Đánh Giá Mới</span>
              <button type="button" onClick={() => setShowAddCriteria(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Tên tiêu chí (VD: Hăng hái lau bảng...)"
                value={newCriteriaLabel}
                onChange={(e) => setNewCriteriaLabel(e.target.value)}
                className="flex-1 min-w-[180px] px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-bold outline-none"
              />
              <select
                value={newCriteriaType}
                onChange={(e) => setNewCriteriaType(e.target.value)}
                className="px-2 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-bold outline-none"
              >
                <option value="plus">+ Điểm Cộng</option>
                <option value="minus">- Điểm Trừ</option>
              </select>
              <input
                type="number"
                min="1"
                max="20"
                value={newCriteriaPoints}
                onChange={(e) => setNewCriteriaPoints(e.target.value)}
                className="w-16 px-2 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-bold outline-none text-center"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-xs"
              >
                Lưu
              </button>
            </div>
          </form>
        )}

        {/* 2. Tab Navigation: Cho Điểm & Nhắc Nhở | Quy Đổi Điểm Thưởng | Đổi Avatar */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl my-3">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('give');
            }}
            className={`py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center space-x-1 sm:space-x-1.5 ${
              activeTab === 'give'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current shrink-0" />
            <span className="text-[11px] sm:text-xs">Cho Điểm & Nhắc Nhở</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('exchange');
            }}
            className={`py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center space-x-1 sm:space-x-1.5 ${
              activeTab === 'exchange'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs">Quy Đổi Điểm Thưởng (KTTX / Sao)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('avatar');
            }}
            className={`py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center space-x-1 sm:space-x-1.5 ${
              activeTab === 'avatar'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs">Đổi Avatar</span>
          </button>
        </div>

        {/* TAB 1: CHO ĐIỂM & NHẮC NHỞ */}
        {activeTab === 'give' && (
          <div className="space-y-4">
            
            {/* Quick Adjustment & Reset Bar (Thanh sửa điểm nhỡ & Reset) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2.5 shadow-xs">
              
              {/* Điểm (+) adjuster */}
              <div className="flex items-center space-x-1.5 text-xs font-black text-emerald-800">
                <span className="text-emerald-700">Điểm (+):</span>
                <button
                  type="button"
                  onClick={() => handleAdjust('plus', -1)}
                  disabled={plusPoints <= 0}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-black text-sm active:scale-95 disabled:opacity-40"
                  title="Giảm 1 điểm cộng (nếu bấm nhầm)"
                >
                  -
                </button>
                <span className="px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-700 font-black text-xs min-w-[2.2rem] text-center shadow-2xs">
                  +{plusPoints}
                </span>
                <button
                  type="button"
                  onClick={() => handleAdjust('plus', 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-black text-sm active:scale-95"
                  title="Tăng 1 điểm cộng"
                >
                  +
                </button>
              </div>

              {/* Điểm (-) adjuster */}
              <div className="flex items-center space-x-1.5 text-xs font-black text-purple-800">
                <span className="text-purple-700">Điểm (-):</span>
                <button
                  type="button"
                  onClick={() => handleAdjust('minus', -1)}
                  disabled={minusPoints <= 0}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-black text-sm active:scale-95 disabled:opacity-40"
                  title="Giảm 1 điểm trừ (nếu phạt nhầm)"
                >
                  -
                </button>
                <span className="px-2.5 py-1 bg-white border border-purple-300 rounded-lg text-purple-700 font-black text-xs min-w-[2.2rem] text-center shadow-2xs">
                  -{minusPoints}
                </span>
                <button
                  type="button"
                  onClick={() => handleAdjust('minus', 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-black text-sm active:scale-95"
                  title="Tăng 1 điểm trừ"
                >
                  +
                </button>
              </div>

              {/* Reset Button */}
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 bg-slate-200/80 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300 text-slate-700 rounded-xl text-xs font-black flex items-center space-x-1.5 border border-slate-300 transition-all active:scale-95 ml-auto"
                title="Đặt lại toàn bộ điểm cộng và điểm trừ của học sinh này về 0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset về 0</span>
              </button>

            </div>

            {/* Khối Khen Thưởng & Điểm Cộng (+) */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-amber-700 flex items-center space-x-1.5">
                <span>⭐ KHEN THƯỞNG & ĐIỂM CỘNG (+)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {plusList.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleApplyCriteria(item, 'plus')}
                    className="p-2.5 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-left transition-all active:scale-98 shadow-2xs group"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg shrink-0">{item.icon}</span>
                      <span className="text-xs font-extrabold text-slate-800 leading-tight">
                        {item.label}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-white border border-emerald-300 text-emerald-700 rounded-lg text-xs font-black shadow-2xs group-hover:scale-110 transition-transform shrink-0">
                      +{item.points}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Khối Nhắc Nhở & Điểm Trừ Nề Nếp (-) */}
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-black uppercase text-rose-700 flex items-center space-x-1.5">
                <span>⚠️ NHẮC NHỞ & ĐIỂM TRỪ NỀ NẾP (-)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {minusList.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleApplyCriteria(item, 'minus')}
                    className="p-2.5 bg-rose-50/70 hover:bg-rose-100 border border-rose-200/80 rounded-2xl flex items-center justify-between text-left transition-all active:scale-98 shadow-2xs group"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg shrink-0">{item.icon}</span>
                      <span className="text-xs font-extrabold text-slate-800 leading-tight">
                        {item.label}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-white border border-rose-300 text-rose-700 rounded-lg text-xs font-black shadow-2xs group-hover:scale-110 transition-transform shrink-0">
                      -{item.points}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: QUY ĐỔI ĐIỂM THƯỞNG (KTTX / SAO) */}
        {activeTab === 'exchange' && (
          <div className="space-y-4">
            
            {/* Banner Điểm Cộng Nề Nếp Khả Dụng */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-4 sm:p-5 text-white shadow-lg border border-white/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-200 block">
                  ĐIỂM CỘNG NỀ NẾP KHẢ DỤNG
                </span>
                <div className="flex items-baseline space-x-1.5 mt-1">
                  <span className="text-3xl font-black text-amber-300">{plusPoints}</span>
                  <span className="text-base font-black text-amber-200">⭐ Điểm</span>
                </div>
              </div>

              {/* Tích lũy KTTX Badge */}
              <div className="text-right bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
                <div className="flex items-center space-x-1 text-xs font-black text-amber-200 justify-end">
                  <GraduationCap className="w-4 h-4" />
                  <span>Đã tích lũy: +{kttxBonus} / 2 KTTX</span>
                </div>
                <span className="text-[10px] text-blue-100 block mt-0.5 font-bold">
                  (Mức trần tối đa: +2 điểm)
                </span>
              </div>
            </div>

            {/* Tiến độ đạt mốc 10 điểm tiếp theo */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                <span>Tiến độ đạt mốc 10 điểm tiếp theo:</span>
                <span className="text-emerald-700 font-black">{currentProgress}/10 điểm</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (currentProgress / 10) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] font-bold text-slate-500">
                {plusPoints >= 10 ? (
                  <span className="text-emerald-700 font-extrabold">
                    🎉 Học sinh đã tích lũy đủ {plusPoints} điểm nề nếp, có thể tiến hành quy đổi ngay bên dưới!
                  </span>
                ) : (
                  <span>
                    Cần thêm <strong className="text-amber-600">{neededFor10} điểm nề nếp</strong> nữa để đủ mốc 10 điểm.
                  </span>
                )}
              </p>
            </div>

            {/* Bộ chọn số điểm muốn đổi: 10 Điểm | 20 Điểm | 30 Điểm */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 block">
                Số điểm muốn đổi:
              </label>
              <div className="flex items-center space-x-2">
                {[10, 20, 30].map(pts => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setExchangeAmount(pts);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                      exchangeAmount === pts
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-102'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {pts} Điểm
                  </button>
                ))}
              </div>
            </div>

            {/* 2 Thẻ Quy Đổi: KTTX vs Sao Cửa Hàng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              
              {/* Thẻ 1: Đổi sang Điểm KTTX */}
              <div className="bg-blue-50/60 border-2 border-blue-200 hover:border-blue-400 rounded-3xl p-4 flex flex-col justify-between transition-all space-y-3">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-900">
                      Đổi sang Điểm KTTX
                    </h5>
                    <p className="text-[11px] text-slate-600 font-bold mt-1 leading-relaxed">
                      Cứ <strong>10 điểm nề nếp</strong> quy đổi thành <strong>+1 điểm</strong> cộng vào cột Kiểm tra Thường xuyên.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExchangeKTTX}
                  disabled={plusPoints < exchangeAmount || kttxBonus >= 2}
                  className="w-full py-2.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>
                    {kttxBonus >= 2
                      ? 'Đã đạt mức trần (+2 điểm)'
                      : plusPoints < exchangeAmount
                      ? `Chưa đủ ${exchangeAmount} điểm`
                      : `Đổi lấy +${Math.floor(exchangeAmount / 10)} Điểm KTTX`}
                  </span>
                </button>
              </div>

              {/* Thẻ 2: Đổi sang Sao Cửa Hàng */}
              <div className="bg-amber-50/60 border-2 border-amber-200 hover:border-amber-400 rounded-3xl p-4 flex flex-col justify-between transition-all space-y-3">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-900">
                      Đổi sang Sao Cửa Hàng
                    </h5>
                    <p className="text-[11px] text-slate-600 font-bold mt-1 leading-relaxed">
                      Học sinh không muốn lấy điểm kiểm tra có thể đổi thành <strong>+{exchangeAmount} Sao ⭐</strong> để mua quà và mở túi mù.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExchangeStars}
                  disabled={plusPoints < exchangeAmount}
                  className="w-full py-2.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Star className="w-4 h-4 fill-current" />
                  <span>
                    {plusPoints < exchangeAmount
                      ? `Chưa đủ ${exchangeAmount} điểm`
                      : `Đổi lấy +${exchangeAmount} Sao Cửa Hàng`}
                  </span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: ĐỔI AVATAR (Chuẩn theo thiết kế ảnh 2) */}
        {activeTab === 'avatar' && (
          <div className="space-y-4 animate-in fade-in">
            
            {/* 1. TẢI ẢNH THẺ / CHÂN DUNG TỪ MÁY TÍNH */}
            <div className="border-2 border-dashed border-teal-400 bg-teal-50/50 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center space-x-3.5">
                <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">
                    TẢI ẢNH THẺ / CHÂN DUNG TỪ MÁY TÍNH:
                  </h4>
                  <p className="text-[11px] sm:text-xs text-teal-800 font-bold mt-0.5">
                    Tự do chọn file ảnh (.jpg, .png) của học sinh từ máy tính hoặc điện thoại của Thầy/Cô.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* 1. Nút Chụp Ảnh Trực Tiếp Bằng Webcam / Camera */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setShowCameraModal(true);
                  }}
                  className="px-3.5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl text-xs font-black shadow-md flex items-center space-x-1.5 transition-all active:scale-95"
                  title="Bật webcam hoặc camera điện thoại chụp ngay tại lớp"
                >
                  <Camera className="w-4 h-4" />
                  <span>Chụp Camera</span>
                </button>

                {/* 2. Nút Tải file từ máy tính */}
                <label className="cursor-pointer px-3.5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-2xl text-xs font-black shadow-md flex items-center space-x-1.5 shrink-0 transition-all active:scale-95">
                  <Upload className="w-4 h-4" />
                  <span>Tải Từ Máy</span>
                  <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
                </label>

                {/* 3. Nút Căn chỉnh lại khuôn mặt nếu học sinh đã có ảnh */}
                {currentSt.avatar && !currentSt.avatar.includes('dicebear') && (
                  <button
                    type="button"
                    onClick={handleOpenReCrop}
                    className="px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-black shadow-md flex items-center space-x-1.5 transition-all active:scale-95"
                    title="Mở công cụ di chuyển và căn đúng khuôn mặt"
                  >
                    <Crop className="w-4 h-4" />
                    <span>Căn Chỉnh Mặt</span>
                  </button>
                )}
              </div>
            </div>

            {/* 2. GIỚI TÍNH HỌC SINH */}
            <div className="border border-slate-200 rounded-3xl p-3.5 bg-white space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-slate-800 tracking-wide uppercase">GIỚI TÍNH HỌC SINH:</span>
                <span className={`text-[11px] font-black ${isFemale ? 'text-pink-600' : 'text-blue-600'}`}>
                  {isFemale ? '👧 HỌC SINH NỮ' : '👦 HỌC SINH NAM'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleGenderToggle('Nam')}
                  className={`py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${
                    !isFemale
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>👦</span>
                  <span>Học Sinh Nam</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenderToggle('Nữ')}
                  className={`py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${
                    isFemale
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>👧</span>
                  <span>Học Sinh Nữ</span>
                </button>
              </div>
            </div>

            {/* 3. AVATAR HỌC SINH VIỆT NAM ÁO TRẮNG KHĂN QUÀNG */}
            <div className="space-y-2 pt-1">
              <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                AVATAR HỌC SINH VIỆT NAM ÁO TRẮNG KHĂN QUÀNG:
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {VN_STUDENT_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      soundFx.playCorrect();
                      onUpdateAvatar?.(currentSt.id, av.url);
                      showToast(`Đã chọn avatar ${av.name}!`);
                    }}
                    className={`p-2 rounded-2xl border-2 transition-all flex items-center space-x-2.5 text-left transform hover:scale-102 active:scale-95 ${
                      currentSt.avatar === av.url
                        ? 'border-purple-600 bg-purple-50/60 shadow-sm'
                        : 'border-slate-200 hover:border-purple-400 bg-white'
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-slate-800 truncate">
                        {av.name}
                      </div>
                      <span
                        className={`inline-block text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                          av.gender === 'Nữ'
                            ? 'bg-pink-100 text-pink-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {av.gender}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. HOẶC CHỌN AVATAR ROBOT HOẠT HÌNH */}
            <div className="space-y-2 pt-1">
              <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                HOẶC CHỌN AVATAR ROBOT HOẠT HÌNH:
              </h5>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {PIXAR_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      soundFx.playCorrect();
                      onUpdateAvatar?.(currentSt.id, url);
                      showToast('Đã chọn avatar Robot hoạt hình!');
                    }}
                    className={`p-1.5 rounded-2xl border-2 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center ${
                      currentSt.avatar === url
                        ? 'border-purple-600 bg-purple-50 shadow-sm'
                        : 'border-slate-200 hover:border-amber-400 bg-slate-50'
                    }`}
                  >
                    <img src={url} alt="robot" className="w-11 h-11 object-contain" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 3. Modal Footer: LMS Nề nếp 4.0 & Nút Hoàn tất */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
          <span className="text-[11px] font-bold text-slate-400">
            LMS Nề nếp 4.0 • Tự động đồng bộ hóa
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow-md transition-all active:scale-95"
          >
            Hoàn tất
          </button>
        </div>

      </div>

      {/* MODAL CĂN CHỈNH & DI CHUYỂN KHUÔN MẶT AVATAR (Chuẩn yêu cầu Thầy) */}
      <AvatarCropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        imageSrc={cropImageSrc}
        studentName={currentSt?.full_name || currentSt?.name}
        onSaveAvatar={handleSaveCroppedAvatar}
      />

      {/* MODAL CHỤP ẢNH TRỰC TIẾP TỪ CAMERA / WEBCAM */}
      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        studentName={currentSt?.full_name || currentSt?.name}
        onCaptureImage={handleCapturedFromCamera}
      />
    </div>
  );
};
