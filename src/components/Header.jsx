import React, { useState } from 'react';
import { soundFx } from '../utils/soundEffects';
import { ChevronDown, CheckCircle2, School } from 'lucide-react';

export const Header = ({
  activeTabTitle = 'Trang chủ',
  activeTabSubtitle = 'Tổng quan tình hình và hoạt động học tập hôm nay',
  classes = [],
  currentClass = null,
  onSelectClass,
  teacherProfile = null,
  onOpenSettings
}) => {
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  const teacherName = teacherProfile?.full_name || 'Võ Châu Thanh';
  const teacherRole = teacherProfile?.role === 'admin' ? 'Quản trị' : (teacherProfile?.job_title || 'GV Tin học');
  const teacherAvatar = teacherProfile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${teacherName}`;

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-purple-100 px-6 py-4 flex items-center justify-between shadow-sm">
      
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
          {activeTabTitle}
        </h1>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">
          {activeTabSubtitle}
        </p>
      </div>

      {/* Right Controls Pill Bar (Image 1, 2, 5 Style) */}
      <div className="flex items-center space-x-3">
        
        {/* Saved Status Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 text-xs font-bold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Đã lưu {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Class Selector Dropdown Pill */}
        {classes.length > 0 && (
          <div className="relative">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowClassDropdown(!showClassDropdown);
              }}
              className="flex items-center space-x-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shadow-sm"
            >
              <School className="w-4 h-4 text-purple-600" />
              <span>
                {currentClass ? `Lớp ${currentClass.name} • Khối ${currentClass.grade_level}` : 'Chọn Lớp'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-purple-600" />
            </button>

            {showClassDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-purple-100 py-2 z-50 animate-in fade-in">
                <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Danh Sách Lớp Chủ Nhiệm
                </div>
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => {
                      onSelectClass(cls);
                      setShowClassDropdown(false);
                      soundFx.playClick();
                    }}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-purple-50 transition-colors ${
                      currentClass?.id === cls.id ? 'font-bold text-purple-700 bg-purple-50/70' : 'text-slate-700'
                    }`}
                  >
                    <span>Lớp {cls.name}</span>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                      Khối {cls.grade_level}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Teacher Avatar & Name Badge (Image 1, 2, 5 Style) */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenSettings?.();
          }}
          className="flex items-center space-x-2.5 p-1 pr-3 bg-slate-50 hover:bg-purple-50 rounded-2xl border border-slate-200 transition-all shadow-sm"
        >
          <img
            src={teacherAvatar}
            alt={teacherName}
            className="w-8 h-8 rounded-xl object-cover bg-purple-100 border border-purple-200 shadow-inner"
          />
          <div className="text-left hidden md:block">
            <span className="block text-xs font-black text-slate-800 leading-tight">{teacherName}</span>
            <span className="block text-[10px] font-bold text-purple-600">{teacherRole}</span>
          </div>
        </button>

      </div>

    </header>
  );
};
