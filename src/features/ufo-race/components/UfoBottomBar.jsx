import React from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings as SettingsIcon } from 'lucide-react';

export const UfoBottomBar = ({
  isRunning = false,
  onToggleStart,
  pickCount = 2,
  onSelectPickCount,
  currentClassName = 'Lớp 12A1',
  studentCount = 38,
  isMuted = false,
  onToggleSound,
  isFullscreen = false,
  onToggleFullscreen,
  onOpenSettings
}) => {
  return (
    <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[95%] sm:max-w-4xl w-full">
      <div className="bg-[#111928]/95 backdrop-blur-md border border-slate-700/70 rounded-2xl px-3 sm:px-5 py-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.6)] flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto">
        
        {/* 1. Nút "Bắt đầu" lớn với biểu tượng Đĩa bay */}
        <button
          onClick={onToggleStart}
          className={`shrink-0 flex items-center space-x-2 px-5 sm:px-6 py-2.5 rounded-xl font-black text-sm tracking-wide transition-all shadow-lg active:scale-95 ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40 animate-pulse'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-900/40 hover:scale-105'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-white" />
              <span>Đang tóm...</span>
            </>
          ) : (
            <>
              <span className="text-base">🛸</span>
              <span>Bắt đầu</span>
            </>
          )}
        </button>

        {/* 2. Bộ chọn số lượng học sinh cần bắt: 1, 2, 3, 4, 5 bạn (Chuẩn 100% ảnh Thầy gửi) */}
        <div className="shrink-0 flex items-center space-x-1.5 text-xs text-slate-300 font-bold bg-slate-900/70 px-3 py-1.5 rounded-xl border border-slate-700/50">
          <span className="text-slate-400 mr-1">Bắt:</span>
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              onClick={() => onSelectPickCount(num)}
              disabled={isRunning}
              className={`w-7 h-7 rounded-lg font-black text-xs transition-all flex items-center justify-center ${
                pickCount === num
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40 scale-110'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              } ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {num}
            </button>
          ))}
          <span className="text-slate-400 ml-1">bạn</span>
        </div>

        {/* 3. Hiển thị sĩ số lớp: e.g. "Lớp học • 38 hs" */}
        <div className="hidden md:flex items-center space-x-2 text-xs font-bold text-slate-300 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/50 whitespace-nowrap">
          <span className="text-emerald-400 font-extrabold">{currentClassName}</span>
          <span className="text-slate-500">•</span>
          <span>{studentCount} hs</span>
        </div>

        {/* 4. Nhóm tiện ích bên phải: Âm thanh, Toàn màn hình, Cài đặt */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          
          {/* Nút bật/tắt âm thanh */}
          <button
            onClick={onToggleSound}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              isMuted
                ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isMuted ? 'Tắt' : 'Bật'}</span>
          </button>

          {/* Nút Toàn màn hình */}
          <button
            onClick={onToggleFullscreen}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all"
            title="Bật/Tắt Toàn màn hình"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Toàn màn hình</span>
          </button>

          {/* Nút Cài đặt */}
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-extrabold bg-slate-800 text-slate-200 hover:text-emerald-400 hover:bg-slate-700 border border-slate-700 transition-all"
            title="Cài đặt & Danh sách học sinh"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Cài đặt</span>
          </button>
        </div>

      </div>
    </div>
  );
};
