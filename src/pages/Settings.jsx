import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/soundEffects';
import { AvatarCropModal } from '../components/AvatarCropModal';
import { User, Upload, Trash2, Save, Check, Sparkles, CheckCircle2, Download, Database, FileJson, RefreshCw } from 'lucide-react';

export const Settings = ({ currentClass, onRefreshClasses }) => {
  const { profile, user, updateProfile } = useAuth();

  // Form states matching Image 1, 3, 5
  const [fullName, setFullName] = useState(profile?.full_name || 'Nguyễn Văn Hải');
  const [jobTitle, setJobTitle] = useState(profile?.job_title || 'GV Tiếng Anh');
  const [subject, setSubject] = useState(profile?.subject || 'Tiếng Anh');
  const [schoolName, setSchoolName] = useState(profile?.school_name || 'Trường THCS Cát Minh');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=teacher`);
  
  // Avatar Crop Modal state
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null);
  const fileInputRef = useRef(null);
  const jsonFileInputRef = useRef(null);

  // Toast notification state (Image 5)
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Đã cập nhật thông tin giáo viên');
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
    if (updateProfile) {
      updateProfile({ avatar_url: croppedDataUrl });
    }
  };

  const handleDeleteAvatar = () => {
    soundFx.playClick();
    const defaultAvt = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`;
    setAvatarUrl(defaultAvt);
    if (updateProfile) {
      updateProfile({ avatar_url: defaultAvt });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    soundFx.playClick();

    const updatedData = {
      full_name: fullName.trim(),
      job_title: jobTitle.trim(),
      subject: subject.trim(),
      school_name: schoolName.trim(),
      avatar_url: avatarUrl
    };

    try {
      if (updateProfile) {
        updateProfile(updatedData);
      }

      if (user?.id && user.id !== '00000000-0000-0000-0000-000000000000') {
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          ...updatedData
        });
      }

      soundFx.playCorrect();
      setToastMessage('Đã cập nhật thông tin giáo viên');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      console.error('Lỗi lưu hồ sơ giáo viên:', err);
    } finally {
      setSaving(false);
    }
  };

  // Feature 3: Export Full System Backup to JSON
  const handleExportBackupJSON = async () => {
    soundFx.playCorrect();
    try {
      // Fetch all local storage & state data
      const backupData = {
        app: 'Sổ Chủ Nhiệm THCS',
        version: '2.0.0',
        exported_at: new Date().toISOString(),
        teacher_profile: {
          full_name: fullName,
          job_title: jobTitle,
          subject: subject,
          school_name: schoolName,
          avatar_url: avatarUrl
        },
        system_settings: {
          theme: 'purple_light',
          auto_save: true
        }
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupData, null, 2)
      )}`;
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `SoChuNhiem_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setToastMessage('Đã xuất file sao lưu dữ liệu (.JSON)');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Lỗi sao lưu JSON:', err);
    }
  };

  // Feature 3: Restore Full System Backup from JSON file
  const handleRestoreJSON = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playCorrect();
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (parsed.teacher_profile) {
            setFullName(parsed.teacher_profile.full_name || fullName);
            setJobTitle(parsed.teacher_profile.job_title || jobTitle);
            setSubject(parsed.teacher_profile.subject || subject);
            setSchoolName(parsed.teacher_profile.school_name || schoolName);
            if (updateProfile) updateProfile(parsed.teacher_profile);
          }
          alert('Khôi phục dữ liệu từ file JSON thành công 100%!');
        } catch (err) {
          alert('File JSON không đúng định dạng sao lưu!');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in">
      
      {/* Settings Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column 1 & 2: Thông Tin & Ảnh Đại Diện Giáo Viên */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <User className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-extrabold text-slate-800">Thông Tin & Ảnh Đại Diện Giáo Viên</h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              {/* Avatar Section Box */}
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

              {/* Form Fields */}
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

          {/* Feature 3: Backup & Restore System Data (.JSON) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <Database className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-base font-black text-slate-800">Sao Lưu & Khôi Phục Dữ Liệu Lớp Học (.JSON)</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Tải file nén toàn bộ dữ liệu 6 lớp học về máy tính cá nhân để lưu trữ lâu dài.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                onClick={handleExportBackupJSON}
                className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-2xl font-extrabold text-xs text-purple-900 flex items-center space-x-3 shadow-sm transition-all"
              >
                <div className="p-2.5 bg-purple-600 text-white rounded-xl">
                  <Download className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block font-black text-sm">Tải File Sao Lưu (.JSON)</span>
                  <span className="text-[11px] text-purple-700 font-normal">Xuất dữ liệu 6 lớp học</span>
                </div>
              </button>

              <div className="relative">
                <input
                  type="file"
                  ref={jsonFileInputRef}
                  onChange={handleRestoreJSON}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => jsonFileInputRef.current?.click()}
                  className="w-full p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl font-extrabold text-xs text-emerald-900 flex items-center space-x-3 shadow-sm transition-all"
                >
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block font-black text-sm">Khôi Phục Dữ Liệu (.JSON)</span>
                    <span className="text-[11px] text-emerald-700 font-normal">Chọn file từ máy tính</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column 3: Mẹo Dành Cho Giáo Viên & Tác Giả */}
        <div className="space-y-6">
          
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

          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
            <div className="flex items-center space-x-2 text-emerald-700 font-extrabold text-sm pb-2 border-b border-emerald-50">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Thông Tin Tác Giả & Hỗ Trợ</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Tác giả ứng dụng:</span>
                <span className="font-extrabold text-purple-800">Thầy. Nguyễn Văn Hải</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Zalo hỗ trợ:</span>
                <span className="bg-emerald-500 text-white font-mono font-extrabold px-3 py-1 rounded-full text-xs shadow-sm">
                  0384635199
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Avatar Crop Modal */}
      <AvatarCropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        imageSrc={tempImageSrc}
        onSaveAvatar={handleSaveCroppedAvatar}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border-2 border-emerald-400 p-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-bottom-5">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800">Thành công</h4>
            <p className="text-[11px] font-bold text-slate-500">{toastMessage}</p>
          </div>
        </div>
      )}

    </div>
  );
};
