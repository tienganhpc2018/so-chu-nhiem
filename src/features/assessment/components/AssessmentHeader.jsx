import React, { useState } from 'react';
import {
  Settings,
  MessageSquareQuote,
  Upload,
  Download,
  Save,
  Maximize2,
  Minimize2,
  ChevronDown,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  School,
  CheckCircle2
} from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const AssessmentHeader = ({
  schoolName = 'TRƯỜNG THCS ĐỀ GI',
  academicYear = '2026-2027',
  classes = [],
  currentClass = null,
  onSelectClass,
  currentSubject = 'Tiếng Anh',
  onSelectSubject,
  semester = 'HKI',
  onSelectSemester,
  isCompact,
  onToggleCompact,
  onOpenConfig,
  onOpenAiComment,
  onOpenImport,
  onExportExcel,
  onSave,
  isSaving = false,
  lastSavedTime = null
}) => {
  const subjects = [
    'Tiếng Anh',
    'Toán',
    'Ngữ Văn',
    'Khoa Học Tự Nhiên',
    'Lịch Sử & Địa Lý',
    'Giáo Dục Công Dân',
    'Tin Học',
    'Công Nghệ',
    'Giáo Dục Thể Chất',
    'Nghệ Thuật'
  ];

  return (
    <div className="space-y-3 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-soft">
      {/* Top Bar: School Brand, Breadcrumbs, System Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        
        {/* Left: School Name & Breadcrumbs */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-teal-800 font-black text-sm tracking-tight">
            <School className="w-4 h-4 text-teal-700" />
            <span className="uppercase">{schoolName}</span>
            <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full border border-teal-200">
              Thông tư 22/2021
            </span>
          </div>

          <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium">
            <span>🏠</span>
            <span className="text-slate-300">»</span>
            <span className="text-slate-600 font-bold">Học sinh</span>
            <span className="text-slate-300">»</span>
            <span className="text-teal-700 font-bold">Sổ đánh giá môn học</span>
            <span className="text-slate-300">/</span>
            <button className="text-slate-400 hover:text-slate-600 p-0.5" title="Trợ giúp"><HelpCircle className="w-3.5 h-3.5" /></button>
            <button className="text-slate-400 hover:text-slate-600 p-0.5" title="Video hướng dẫn"><Play className="w-3.5 h-3.5" /></button>
            <button
              onClick={() => {
                soundFx.playClick();
                window.location.reload();
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5"
              title="Tải lại bảng điểm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Dropdowns & Saved Badge */}
        <div className="flex items-center space-x-2.5">
          {lastSavedTime && (
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đã lưu {lastSavedTime}</span>
            </div>
          )}

          <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            Trung học cơ sở
          </div>

          <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            {academicYear}
          </div>

          {/* Semester Selector */}
          <select
            value={semester}
            onChange={(e) => onSelectSemester(e.target.value)}
            className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs font-extrabold outline-none"
          >
            <option value="HKI">Học kỳ I</option>
            <option value="HKII">Học kỳ II</option>
            <option value="CN">Cả Năm</option>
          </select>
        </div>

      </div>

      {/* Middle Bar: Class Selector & Subject Tabs */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-1">
        
        {/* Class Selection & Title */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">LỚP HỌC:</span>
            {classes && classes.length > 0 ? (
              <select
                value={currentClass?.id || ''}
                onChange={(e) => {
                  soundFx.playClick();
                  const found = classes.find(c => c.id === e.target.value);
                  if (found) onSelectClass(found);
                }}
                className="bg-purple-50 text-purple-900 border border-purple-200 px-3.5 py-1.5 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-purple-400"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.name} (Khối {c.grade_level})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                Chưa có lớp nào
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons (Matching Image 100%) */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 custom-scrollbar">
          
          {/* Toggle View Mode */}
          <button
            onClick={() => {
              soundFx.playClick();
              onToggleCompact?.();
            }}
            className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
            title={isCompact ? 'Chế độ xem mở rộng' : 'Chế độ xem thu gọn'}
          >
            {isCompact ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Cấu hình */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenConfig?.();
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>Cấu hình</span>
          </button>

          {/* Nhận xét / AI Nhận xét */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenAiComment?.();
            }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-sm shadow-teal-200 transition-all transform hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 fill-amber-200 animate-pulse" />
            <span>AI Tự Nhận Xét</span>
          </button>

          {/* Nhập dữ liệu */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenImport?.();
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Nhập dữ liệu</span>
          </button>

          {/* Xuất Excel */}
          <button
            onClick={() => {
              soundFx.playClick();
              onExportExcel?.();
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Xuất Excel</span>
          </button>

          {/* Lưu */}
          <button
            onClick={() => {
              soundFx.playClick();
              onSave?.();
            }}
            disabled={isSaving}
            className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-md shadow-teal-200 transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu'}</span>
          </button>

        </div>

      </div>

      {/* Subject Tabs Scrolling Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pt-2 border-t border-slate-100 custom-scrollbar">
        {subjects.map(sub => {
          const isActive = currentSubject === sub;
          return (
            <button
              key={sub}
              onClick={() => {
                soundFx.playClick();
                onSelectSubject(sub);
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-900 border border-slate-200'
              }`}
            >
              {sub}
            </button>
          );
        })}
      </div>

    </div>
  );
};
