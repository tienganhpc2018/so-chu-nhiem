import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/soundEffects';
import { DangerZone } from '../components/DangerZone';
import { AvatarCropModal } from '../components/AvatarCropModal';
import { MascotRobot } from '../components/MascotRobot';
import { User, Upload, Trash2, Save, Check, Sparkles, HelpCircle, PhoneCall, CheckCircle2, ShieldAlert } from 'lucide-react';

export const Settings = ({ currentClass, onRefreshClasses }) => {
  const { profile, user, refreshProfile } = useAuth();

  // Form states matching Image 1, 3, 5
  const [fullName, setFullName] = useState(profile?.full_name || 'Võ Châu Thanh');
  const [jobTitle, setJobTitle] = useState(profile?.job_title || 'GV Tin học');
  const [subject, setSubject] = useState(profile?.subject || 'Tin học');
  const [schoolName, setSchoolName] = useState(profile?.school_name || 'Trường THCS Trưng Vương');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=teacher`);
  
  // Avatar Crop Modal state
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null);
  const fileInputRef = useRef(null);

  // Toast notification state (Image 5)
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFileSelect = (e) => {
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
    setAvatarUrl(croppedDataUrl);
  };

  const handleDeleteAvatar = () => {
    soundFx.playClick();
    setAvatarUrl(`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    soundFx.playClick();

    try {
      if (user?.id && user.id !== '00000000-0000-0000-0000-000000000000') {
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          full_name: fullName.trim(),
          job_title: jobTitle.trim(),
          subject: subject.trim(),
          school_name: schoolName.trim(),
          avatar_url: avatarUrl
        });
      }

      soundFx.playCorrect();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      if (refreshProfile) refreshProfile();
    } catch (err) {
      console.error('Lỗi lưu hồ sơ giáo viên:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPointsHistory = async (classId) => {
    await supabase.from('point_history').delete().eq('class_id', classId);
    await supabase.from('students').update({ total_stars: 0 }).eq('class_id', classId);
    soundFx.playCorrect();
    alert('Đã xóa toàn bộ lịch sử tích điểm và đặt lại điểm Sao của lớp về 0!');
  };

  const handleResetSeatingChart = async (classId) => {
    await supabase.from('students').update({ seat_row: 1, seat_col: 1 }).eq('class_id', classId);
    soundFx.playCorrect();
    alert('Đã đặt lại sơ đồ chỗ ngồi về vị trí mặc định!');
  };

  const handleDeleteClassRoster = async (classId) => {
    await supabase.from('students').delete().eq('class_id', classId);
    soundFx.playCorrect();
    alert('Đã xóa toàn bộ danh sách học sinh khỏi lớp!');
    if (onRefreshClasses) onRefreshClasses();
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in">
      
      {/* Settings Grid Layout (Image 1, 3, 5 Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column 1 & 2: Thông Tin & Ảnh Đại Diện Giáo Viên */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
          
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <User className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-extrabold text-slate-800">Thông Tin & Ảnh Đại Diện Giáo Viên</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* Avatar Section Box (Matching Image 1, 3 & 5) */}
            <div className="bg-slate-50/70 rounded-3xl p-6 border-2 border-dashed border-purple-200 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-purple-600 p-1 shadow-md overflow-hidden flex items-center justify-center">
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex items-center space-x-2 justify-center sm:justify-start">
                  <h4 className="text-sm font-bold text-slate-800">Ảnh Đại Diện Giáo Viên</h4>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    Đã tải ảnh
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Tải lên hình ảnh cá nhân (JPG, PNG, WEBP). Ảnh sẽ hiển thị tại Banner chào hỏi và báo cáo.
                </p>

                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Tải ảnh từ máy tính...</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    className="px-3 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa ảnh</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Form Fields (Matching Image 1 & 5) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Họ và tên Giáo viên *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Vai trò / Chức vụ</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Môn giảng dạy</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên trường học</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            {/* Save Submit Button (Matching Image 1 & 5) */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-purple-glow transition-all flex items-center space-x-2 transform active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Đang lưu...' : 'Lưu Hồ Sơ Giáo Viên'}</span>
              </button>
            </div>

          </form>

        </div>

        {/* Right Column 3: Mẹo Dành Cho Giáo Viên & Tác Giả (Image 1 & 5) */}
        <div className="space-y-6">
          
          {/* Card 1: Mẹo Dành Cho Giáo Viên */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
            <div className="flex items-center space-x-2 text-purple-700 font-extrabold text-sm pb-2 border-b border-purple-50">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Mẹo Dành Cho Giáo Viên</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-600 font-medium">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Thường xuyên cộng xu khi học sinh phát biểu hăng hái để tăng động lực.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Dùng Vòng quay may mắn đầu giờ để sinh hoạt và tạo không khí vui tươi.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Xuất file JSON sao lưu hàng tháng để đảm bảo dữ liệu luôn an toàn.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Thông Tin Tác Giả & Hỗ Trợ */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
            <div className="flex items-center space-x-2 text-emerald-700 font-extrabold text-sm pb-2 border-b border-emerald-50">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Thông Tin Tác Giả & Hỗ Trợ</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Tác giả ứng dụng:</span>
                <span className="font-extrabold text-purple-800">Thầy. Võ Châu Thanh</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Zalo hỗ trợ:</span>
                <span className="bg-emerald-500 text-white font-mono font-extrabold px-3 py-1 rounded-full text-xs shadow-sm">
                  0974754446
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Danger Zone Section */}
      {currentClass && (
        <DangerZone
          currentClass={currentClass}
          onResetPointsHistory={handleResetPointsHistory}
          onResetSeatingChart={handleResetSeatingChart}
          onDeleteClassRoster={handleDeleteClassRoster}
        />
      )}

      {/* Avatar Crop Modal (Image 4) */}
      <AvatarCropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        imageSrc={tempImageSrc}
        onSaveAvatar={handleSaveCroppedAvatar}
      />

      {/* Save Success Toast Notification (Matching Image 5) */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border-2 border-emerald-400 p-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-bottom-5">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800">Thành công</h4>
            <p className="text-[11px] font-bold text-slate-500">Đã cập nhật thông tin giáo viên</p>
          </div>
        </div>
      )}

    </div>
  );
};
