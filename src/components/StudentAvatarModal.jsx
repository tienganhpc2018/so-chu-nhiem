import React, { useState } from 'react';
import { soundFx } from '../utils/soundEffects';
import { AvatarCropModal } from './AvatarCropModal';
import { X, Sparkles, Upload, Palette, Trash2, Check, RefreshCw } from 'lucide-react';

export const StudentAvatarModal = ({ isOpen, onClose, student, onUpdateStudentAvatar }) => {
  const [activeTab, setActiveTab] = useState('preset'); // 'preset' | 'upload' | 'color'
  const [filter, setFilter] = useState('all'); // 'all' | 'male' | 'female' | 'mascot'
  const [borderColor, setBorderColor] = useState('border-purple-400');
  
  // Crop Modal state
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null);

  if (!isOpen || !student) return null;

  const presetAvatars = [
    // Male avatars
    { id: 'm1', name: 'Nam Mũ Cáo', gender: 'male', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=boy_cap' },
    { id: 'm2', name: 'Nam Đeo Kính', gender: 'male', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=boy_glasses' },
    { id: 'm3', name: 'Nam Tóc Xoăn', gender: 'male', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=boy_curly' },
    { id: 'm4', name: 'Nam Phi Hành Gia', gender: 'male', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=boy_astro' },
    { id: 'm5', name: 'Nam Siêu Nhân', gender: 'male', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=boy_hero' },
    { id: 'm6', name: 'Nam Học Thức', gender: 'male', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=boy_smart' },

    // Female avatars
    { id: 'f1', name: 'Nữ Nơ Hồng', gender: 'female', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=girl_bow' },
    { id: 'f2', name: 'Nữ Tóc Na Tra', gender: 'female', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=girl_twins' },
    { id: 'f3', name: 'Nữ Đeo Kính', gender: 'female', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=girl_glasses' },
    { id: 'f4', name: 'Nữ Vương Miện', gender: 'female', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=girl_queen' },
    { id: 'f5', name: 'Nữ Họa Sĩ', gender: 'female', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=girl_artist' },
    { id: 'f6', name: 'Nữ Yêu Thương', gender: 'female', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=girl_heart' },

    // Mascot avatars
    { id: 'r1', name: 'Robot Vui Vẻ', gender: 'mascot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot_happy' },
    { id: 'r2', name: 'Mèo Thần Tài', gender: 'mascot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=lucky_cat' },
    { id: 'r3', name: 'Gấu Panda', gender: 'mascot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=panda_cute' },
    { id: 'r4', name: 'Thỏ Ngọc', gender: 'mascot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=bunny_pink' },
  ];

  const borderColorsList = [
    { name: 'Tím Hoàng Gia', class: 'border-purple-500' },
    { name: 'Xanh Mint', class: 'border-emerald-500' },
    { name: 'Cam San Hô', class: 'border-coral-500' },
    { name: 'Vàng Vô Địch', class: 'border-amber-400' },
    { name: 'Xanh Biển', class: 'border-blue-500' },
    { name: 'Hồng Ngọt Ngào', class: 'border-pink-500' },
  ];

  const filteredPresets = presetAvatars.filter(av => {
    if (filter === 'male') return av.gender === 'male';
    if (filter === 'female') return av.gender === 'female';
    if (filter === 'mascot') return av.gender === 'mascot';
    return true;
  });

  const handleSelectPreset = (avUrl) => {
    soundFx.playCorrect();
    onUpdateStudentAvatar(student.id, avUrl, borderColor);
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImageSrc(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCroppedAvatar = (croppedDataUrl) => {
    soundFx.playCorrect();
    onUpdateStudentAvatar(student.id, croppedDataUrl, borderColor);
    onClose();
  };

  const handleResetToDefault = () => {
    soundFx.playClick();
    const defaultUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(student.full_name)}`;
    onUpdateStudentAvatar(student.id, defaultUrl, 'border-purple-400');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-800">Đổi Ảnh Đại Diện Học Sinh</h3>
            <p className="text-xs font-bold text-slate-400 mt-0.5">
              Chọn ảnh có sẵn hoặc tải ảnh mới cho em <span className="text-purple-700 font-extrabold">{student.full_name}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Main Tabs (Matching Image 1 & 2) */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl my-4">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('preset');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'preset' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Avatar Có Sẵn</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('upload');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'upload' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4 text-purple-500" />
            <span>Tải Ảnh Từ Máy</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('color');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'color' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-4 h-4 text-purple-500" />
            <span>Màu Sắc Khung</span>
          </button>
        </div>

        {/* TAB 1: PRESET AVATARS (Matching Image 1) */}
        {activeTab === 'preset' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                  filter === 'all' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ☀️
              </button>

              <button
                onClick={() => setFilter('male')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                  filter === 'male' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Học sinh Nam ♂️
              </button>

              <button
                onClick={() => setFilter('female')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                  filter === 'female' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Học sinh Nữ ♀️
              </button>

              <button
                onClick={() => setFilter('mascot')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                  filter === 'mascot' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Linh vật 🤖
              </button>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {filteredPresets.map((av) => (
                <button
                  key={av.id}
                  onClick={() => handleSelectPreset(av.url)}
                  className="group flex flex-col items-center space-y-1.5 p-2 rounded-2xl hover:bg-purple-50 transition-all border border-transparent hover:border-purple-200 transform hover:scale-105"
                >
                  <div className={`w-14 h-14 rounded-2xl overflow-hidden bg-purple-100 border-2 p-0.5 shadow-sm group-hover:shadow-md ${borderColor}`}>
                    <img src={av.url} alt={av.name} className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-700 text-center line-clamp-1">
                    {av.name}
                  </span>
                </button>
              ))}
            </div>

          </div>
        )}

        {/* TAB 2: UPLOAD FROM DEVICE (Matching Image 2) */}
        {activeTab === 'upload' && (
          <div className="py-6">
            <div className="relative border-2 border-dashed border-purple-300 rounded-3xl p-8 bg-purple-50/50 text-center space-y-3 hover:bg-purple-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto text-purple-600 shadow-md">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800">
                  Nhấp vào đây để chọn ảnh từ máy tính / điện thoại
                </h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Hỗ trợ định dạng JPG, PNG, WEBP, GIF. Có sẵn công cụ cắt & thu phóng!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BORDER COLOR SELECTION */}
        {activeTab === 'color' && (
          <div className="space-y-4 py-4">
            <label className="block text-xs font-bold text-slate-700">Chọn Màu Sắc Vòng Khung Avatar:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {borderColorsList.map((c) => (
                <button
                  key={c.class}
                  onClick={() => {
                    soundFx.playClick();
                    setBorderColor(c.class);
                  }}
                  className={`p-3 rounded-2xl border-2 font-extrabold text-xs flex items-center justify-between transition-all ${
                    borderColor === c.class ? 'border-purple-600 bg-purple-50 text-purple-800 shadow-sm' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{c.name}</span>
                  <div className={`w-4 h-4 rounded-full border-2 ${c.class} bg-purple-200`}></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions (Matching Image 1) */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <button
            onClick={handleResetToDefault}
            className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bỏ ảnh custom</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-purple-glow"
          >
            Đóng
          </button>
        </div>

      </div>

      {/* Crop Modal Trigger (Image 4) */}
      <AvatarCropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        imageSrc={tempImageSrc}
        onSaveAvatar={handleSaveCroppedAvatar}
      />
    </div>
  );
};
