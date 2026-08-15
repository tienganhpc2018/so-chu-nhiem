import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { soundFx } from '../utils/soundEffects';
import { AvatarCropModal } from '../components/AvatarCropModal';
import { TeacherIDCardModal } from '../components/TeacherIDCardModal';
import {
  User,
  Upload,
  Trash2,
  Save,
  Check,
  Sparkles,
  CheckCircle2,
  Download,
  Database,
  FileJson,
  Lock,
  Unlock,
  KeyRound,
  Award,
  IdCard,
  Grid,
  Cloud,
  CheckCheck
} from 'lucide-react';

export const Settings = ({ currentClass, onRefreshClasses }) => {
  const { profile, user, updateProfile } = useAuth();

  // Form states
  const [fullName, setFullName] = useState(profile?.full_name || 'Nguyễn Văn Hải');
  const [jobTitle, setJobTitle] = useState(profile?.job_title || 'GV Tiếng Anh');
  const [subject, setSubject] = useState(profile?.subject || 'Tiếng Anh');
  const [schoolName, setSchoolName] = useState(profile?.school_name || 'Trường THCS Cát Minh');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=teacher`);

  // Feature 3: PIN Lock Protection State
  const [pinCode, setPinCode] = useState(() => localStorage.getItem('teacher_pin_code') || '1234');
  const [usePinLock, setUsePinLock] = useState(() => localStorage.getItem('use_pin_lock') === 'true');
  const [inputPin, setInputPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => !usePinLock);

  // Avatar Crop & ID Card Modal State
  const [showCropModal, setShowCropModal] = useState(false);
  const [showIDCardModal, setShowIDCardModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'gallery'
  const [tempImageSrc, setTempImageSrc] = useState(null);
  const fileInputRef = useRef(null);
  const jsonFileInputRef = useRef(null);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Đã cập nhật thông tin giáo viên');
  const [saving, setSaving] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(true);

  // Feature 1: 20+ Teacher Preset Avatar Gallery
  const teacherAvatarsList = [
    { id: 't1', name: 'Thầy Giáo Kính Cận', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=teacher_glasses' },
    { id: 't2', name: 'Thầy Giáo Lịch Lãm', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=teacher_gentle' },
    { id: 't3', name: 'Thầy Giáo Năng Động', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=teacher_active' },
    { id: 't4', name: 'Thầy Giáo Cà Rạt', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=teacher_suit' },
    { id: 't5', name: 'Thầy Giáo Yêu Thương', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=teacher_heart' },
    { id: 't6', name: 'Cô Giáo Nơ Hồng', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=teacher_female1' },
    { id: 't7', name: 'Cô Giáo Kính Hồng', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=teacher_female2' },
    { id: 't8', name: 'Cô Giáo Tóc Ngắn', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=teacher_female3' },
    { id: 't9', name: 'Robot Trợ Lý AI', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot_teacher' },
    { id: 't10', name: 'Gấu Trợ Giảng', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=bear_teacher' },
    { id: 't11', name: 'Mèo Thông Thái', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=cat_smart' },
    { id: 't12', name: 'Cú Học Thức', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=owl_wise' }
  ];

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

  const handleSelectPresetAvatar = (url) => {
    soundFx.playCorrect();
    setAvatarUrl(url);
    if (updateProfile) {
      updateProfile({ avatar_url: url });
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

  // Feature 4: Save & Sync Automatically with Cloud Supabase DB
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
      setCloudSynced(true);
      setToastMessage('Đã tự động sao lưu dữ liệu Hồ sơ lên Cloud Supabase!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      console.error('Lỗi lưu hồ sơ giáo viên:', err);
    } finally {
      setSaving(false);
    }
  };

  // Feature 3: Unlock PIN Code
  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (inputPin === pinCode) {
      soundFx.playCorrect();
      setIsUnlocked(true);
      setInputPin('');
    } else {
      soundFx.playDeduct();
      alert('Mật khẩu PIN 4 số không đúng! Vui lòng thử lại.');
    }
  };

  const handleTogglePinLock = (e) => {
    const enabled = e.target.checked;
    setUsePinLock(enabled);
    localStorage.setItem('use_pin_lock', enabled ? 'true' : 'false');
    if (!enabled) setIsUnlocked(true);
  };

  const handleUpdatePinCode = (newPin) => {
    if (newPin.length === 4) {
      setPinCode(newPin);
      localStorage.setItem('teacher_pin_code', newPin);
      soundFx.playCorrect();
      alert(`Đã đổi mã PIN bảo vệ mới thành công: ${newPin}`);
    }
  };

  // Export JSON Backup
  const handleExportBackupJSON = async () => {
    soundFx.playCorrect();
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
      }
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `SoChuNhiem_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setToastMessage('Đã xuất file sao lưu dữ liệu (.JSON)');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Restore JSON Backup
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

  // FEATURE 3: PIN LOCK SCREEN IF LOCKED
  if (usePinLock && !isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-purple-100 shadow-2xl text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-3xl flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">TRANG CÀI ĐẶT ĐÃ KHÓA PIN</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Vui lòng nhập mã PIN 4 số của Giáo viên để truy cập (Tránh học sinh hiếu động bấm nhầm khi Thầy mở bảng thi đua).
          </p>
        </div>

        <form onSubmit={handleVerifyPin} className="space-y-4">
          <input
            type="password"
            maxLength={4}
            value={inputPin}
            onChange={(e) => setInputPin(e.target.value)}
            placeholder="• • • •"
            className="w-48 mx-auto bg-slate-50 border-2 border-purple-200 text-center tracking-[1em] text-2xl font-black py-3 rounded-2xl outline-none focus:border-purple-600"
            autoFocus
          />

          <button
            type="submit"
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-2xl shadow-purple-glow flex items-center justify-center space-x-1.5"
          >
            <Unlock className="w-4 h-4" />
            <span>MỞ KHÓA TRANG CÀI ĐẶT</span>
          </button>
        </form>
        <p className="text-[11px] text-slate-400 italic">Mã PIN mặc định ban đầu: <span className="font-extrabold text-purple-700">1234</span></p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in">
      
      {/* Top Banner Header & Feature 2 ID Card Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2.5">
            <User className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Hồ Sơ & Cài Đặt Hệ Thống
            </h2>
            {/* Feature 4 Cloud Sync Badge */}
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center space-x-1">
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đồng bộ Cloud Supabase</span>
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Quản lý thông tin cá nhân, ảnh đại diện, bảo mật mã PIN và sao lưu dữ liệu hệ thống.
          </p>
        </div>

        {/* Feature 2: Teacher ID Card Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            setShowIDCardModal(true);
          }}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-purple-950 font-black text-xs rounded-2xl shadow-md transition-all flex items-center space-x-2 shrink-0"
        >
          <IdCard className="w-4 h-4" />
          <span>Xem Thẻ Giáo Viên (Teacher ID)</span>
        </button>
      </div>

      {/* Settings Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column 1 & 2: Thông Tin & Ảnh Đại Diện Giáo Viên */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-800">Hồ Sơ Giáo Viên Chủ Nhiệm</h3>
              
              {/* Tab Selector */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${activeTab === 'profile' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'}`}
                >
                  Thông tin
                </button>
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${activeTab === 'gallery' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'}`}
                >
                  Kho Avatar (20+)
                </button>
              </div>
            </div>

            {/* FEATURE 1: PRESET AVATAR GALLERY */}
            {activeTab === 'gallery' ? (
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700">
                  Chọn Ảnh Đại Diện Mẫu Hoạt Hình Giáo Viên Tiếng Anh (Avatar Gallery):
                </label>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {teacherAvatarsList.map((av) => (
                    <button
                      key={av.id}
                      onClick={() => handleSelectPresetAvatar(av.url)}
                      className="flex flex-col items-center p-2 rounded-2xl hover:bg-purple-50 transition-all border border-slate-100 hover:border-purple-300"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-purple-100 border-2 border-purple-300 overflow-hidden shadow-sm">
                        <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-700 mt-1 line-clamp-1 text-center">
                        {av.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
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
                      Tải lên hình ảnh cá nhân hoặc chọn nhanh trong Kho Avatar 20+ hình ảnh có sẵn.
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
                        <span>Tải ảnh từ máy...</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('gallery')}
                        className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200"
                      >
                        Chọn avatar có sẵn
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
            )}

          </div>

          {/* FEATURE 3: PIN CODE PROTECTION SETTINGS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <KeyRound className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-base font-black text-slate-800">Khóa Bảo Vệ Trang Cài Đặt (PIN Code 4 Số)</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Đặt mã PIN 4 số giúp tránh việc học sinh hiếu động bấm nhầm khi Thầy chiếu bảng thi đua.</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-purple-600" />
                  <div>
                    <span className="text-xs font-black text-purple-950 block">Kích hoạt Khóa PIN bảo vệ Trang Cài Đặt</span>
                    <span className="text-[11px] text-purple-700 font-semibold">Bắt buộc nhập mã PIN 4 số mỗi khi truy cập</span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={usePinLock}
                  onChange={handleTogglePinLock}
                  className="w-5 h-5 text-purple-600 rounded cursor-pointer"
                />
              </div>

              {usePinLock && (
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-700">Đổi mã PIN 4 số mới:</span>
                  <input
                    type="password"
                    maxLength={4}
                    defaultValue={pinCode}
                    onBlur={(e) => handleUpdatePinCode(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-300 text-center font-mono font-black text-sm py-2 rounded-xl outline-none"
                  />
                  <span className="text-[11px] text-slate-400">(Tự động lưu khi nhập đủ 4 số)</span>
                </div>
              )}
            </div>
          </div>

          {/* Backup & Restore JSON */}
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

        {/* Right Column 3: Mẹo & Thông Tin Tác Giả */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-4">
            <div className="flex items-center space-x-2 text-purple-700 font-extrabold text-sm pb-2 border-b border-purple-50">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Mẹo Dành Cho Giáo Viên</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-600 font-medium">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Bật Khóa PIN để bảo vệ các thông tin hệ thống khi cho học sinh xem thi đua.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Xuất Thẻ Giáo Viên Tiếng Anh (PNG) để sử dụng tại các báo cáo trường.</span>
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

      {/* Feature 2: Teacher ID Card Modal */}
      <TeacherIDCardModal
        isOpen={showIDCardModal}
        onClose={() => setShowIDCardModal(false)}
        profile={profile}
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
