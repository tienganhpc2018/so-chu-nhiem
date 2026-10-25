import React from 'react';
import { Play, BookOpen, Trophy, Settings, Volume2, VolumeX, Shield, Sparkles, School } from 'lucide-react';
import { GAME_MODES, DIFFICULTY_LEVELS } from '../data/defaultDuckData';

export const DuckLobbyScreen = ({
  selectedMode,
  onSelectMode,
  selectedDifficulty,
  onSelectDifficulty,
  roundDuration = 20,
  onSelectRoundDuration,
  onStartGame,
  onOpenRules,
  onOpenLeaderboard,
  onOpenSettings,
  isMuted,
  onToggleMute,
  duckCount = 12,
  currentClass
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-8 bg-gradient-to-b from-[#1b3a1a] via-[#244b23] to-[#122611] text-white select-none overflow-y-auto">
      {/* 1. Header & Menu phụ góc trên */}
      <div className="w-full max-w-4xl flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10">
          <span className="text-base">📍</span>
          <span className="text-xs font-bold text-amber-200">
            {currentClass ? `Lớp: ${currentClass.name}` : 'Tất cả lớp'}
          </span>
          <span className="text-[10px] bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-black border border-amber-400/40">
            {duckCount} Chú Vịt
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Bật / Tắt âm thanh */}
          <button
            onClick={onToggleMute}
            className={`p-2.5 rounded-2xl backdrop-blur-md border transition-all active:scale-95 ${
              isMuted
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                : 'bg-black/40 border-white/20 text-white hover:bg-black/60'
            }`}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Quản lý vịt & câu hỏi */}
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-extrabold text-xs active:scale-95 transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quản Lý & Câu Hỏi</span>
          </button>
        </div>
      </div>

      {/* 2. Tiêu đề trò chơi dân gian rực rỡ */}
      <div className="my-auto text-center max-w-2xl px-4 py-4 flex flex-col items-center">
        {/* Huy hiệu dân gian */}
        <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-widest uppercase mb-3 shadow-sm">
          <span>🌾</span>
          <span>Trò Chơi Dân Gian Việt Nam</span>
          <span>🌾</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-400 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex items-center justify-center space-x-3">
          <span className="text-4xl sm:text-6xl">🦆</span>
          <span>BỊT MẮT BẮT VỊT</span>
        </h1>

        <p className="text-xs sm:text-sm text-amber-100/90 font-medium mt-2 max-w-lg leading-relaxed">
          "Bạn có đủ nhanh và tinh tai để lắng nghe tiếng quạc quạc và tóm gọn những chú vịt học sinh không?"
        </p>

        {/* 3. Lựa chọn 4 chế độ chơi */}
        <div className="w-full my-6">
          <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider block mb-2 text-left sm:text-center">
            CHỌN CHẾ ĐỘ THI ĐẤU:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
            {GAME_MODES.map(m => {
              const isSelected = selectedMode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMode(m.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/25 border-yellow-400 shadow-lg shadow-amber-500/20 scale-102'
                      : 'bg-black/30 border-white/10 hover:border-white/30 hover:bg-black/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{m.icon}</span>
                      <strong className="text-xs sm:text-sm font-black text-white">{m.name}</strong>
                    </div>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-200 border border-amber-300/40">
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium leading-snug pl-7">
                    {m.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Lựa chọn mức độ bịt mắt */}
        <div className="w-full mb-6">
          <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider block mb-2 text-left sm:text-center">
            MỨC ĐỘ THỬ THÁCH BỊT MẮT:
          </span>
          <div className="grid grid-cols-2 gap-2.5 text-left">
            {DIFFICULTY_LEVELS.map(lvl => {
              const isSelected = selectedDifficulty === lvl.id;
              return (
                <div
                  key={lvl.id}
                  onClick={() => onSelectDifficulty(lvl.id)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-rose-600/30 border-rose-400 shadow-md shadow-rose-600/20'
                      : 'bg-black/30 border-white/10 hover:border-white/30'
                  }`}
                >
                  <strong className="block text-xs font-black text-white">{lvl.name}</strong>
                  <span className="text-[10px] text-slate-300 font-medium block leading-snug mt-0.5">
                    {lvl.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4.5 Cài đặt thời gian bắt vịt (Đúng yêu cầu Thầy: 20s hoặc 30s) */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider block text-left">
              ⏱️ THỜI GIAN BẮT VỊT TRẢ BÀI:
            </span>
            <span className="text-[10px] text-amber-200/80 font-bold">
              (Hết giờ sẽ tự động tóm 1 vịt để học sinh trả bài)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { val: 20, label: '20 Giây', desc: 'Chuẩn lớp học' },
              { val: 30, label: '30 Giây', desc: 'Rượt đuổi kịch tính' },
              { val: 15, label: '15 Giây', desc: 'Thử thách chớp nhoáng' }
            ].map(item => {
              const isSelected = roundDuration === item.val;
              return (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => onSelectRoundDuration?.(item.val)}
                  className={`p-2.5 sm:p-3 rounded-2xl border-2 cursor-pointer transition-all text-center ${
                    isSelected
                      ? 'bg-amber-500/35 border-yellow-300 shadow-lg shadow-amber-500/30 scale-102 font-black text-white'
                      : 'bg-black/30 border-white/10 hover:border-white/30 text-slate-300 font-bold'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-black block text-amber-200">
                    ⏱️ {item.label}
                  </span>
                  <span className="text-[10px] opacity-80 block mt-0.5">
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Nút BẮT ĐẦU CHƠI to rực rỡ */}
        <button
          onClick={onStartGame}
          className="w-full sm:w-auto px-10 py-4 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white font-black text-base sm:text-lg shadow-2xl shadow-orange-500/60 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2.5 border-2 border-yellow-200"
        >
          <Play className="w-6 h-6 fill-white" />
          <span>BẮT ĐẦU CHƠI NGAY</span>
        </button>
      </div>

      {/* 6. Footer menu */}
      <div className="w-full max-w-md flex items-center justify-center space-x-4 pt-3 border-t border-white/10 shrink-0 text-xs font-extrabold text-amber-200">
        <button
          onClick={onOpenRules}
          className="flex items-center space-x-1 hover:text-white transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Luật Chơi Dân Gian</span>
        </button>
        <span>•</span>
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center space-x-1 hover:text-white transition-colors"
        >
          <Trophy className="w-4 h-4 text-yellow-300" />
          <span>Bảng Xếp Hạng</span>
        </button>
      </div>
    </div>
  );
};
