import React from 'react';
import { Play, Trophy, Settings, Volume2, VolumeX, Sparkles, School, Check, HelpCircle, Dices, Users, RefreshCw } from 'lucide-react';

export const DuckLobbyScreen = ({
  selectedMode = 'random_call',
  onSelectMode,
  roundDuration = 20,
  onSelectRoundDuration,
  noRepeat = true,
  onToggleNoRepeat,
  showDuckNames = true,
  onToggleShowDuckNames,
  enableTts = false,
  onToggleTts,
  characterType = 'girl',
  onSelectCharacter,
  onStartGame,
  onOpenRules,
  onOpenLeaderboard,
  onOpenSettings,
  isMuted,
  onToggleMute,
  duckCount = 25,
  calledCount = 0,
  currentClass
}) => {
  const GAME_MODES = [
    {
      id: 'random_call',
      name: 'Gọi Tên Ngẫu Nhiên',
      desc: 'Version gốc: Quay chọn tên ngẫu nhiên → Đàn vịt chạy tán loạn → Bắt vịt → Công bố tên!',
      icon: '🎲',
      badge: 'CHUẨN VERSION GỐC'
    },
    {
      id: 'target',
      name: 'Gọi Tên → Bắt Đúng Người',
      desc: 'Hệ thống gọi tên trước, người chơi quan sát đàn vịt và bắt đúng chú vịt mang tên đó!',
      icon: '🎯',
      badge: 'THỬ THÁCH'
    },
    {
      id: 'blind_catch',
      name: 'Bắt Vịt → Công Bố Tên',
      desc: 'Đàn vịt chạy ẩn danh hoàn toàn, lao vào tóm một chú vịt rồi lật mở xem đó là ai!',
      icon: '🦆',
      badge: 'BẤT NGỜ'
    }
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-8 bg-gradient-to-b from-[#1b3a1a] via-[#244b23] to-[#122611] text-white select-none overflow-y-auto">
      
      {/* 1. Header & Menu phụ góc trên */}
      <div className="w-full max-w-4xl flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10">
          <School className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-200">
            {currentClass ? `Lớp: ${currentClass.name}` : 'Tất cả học sinh'}
          </span>
          <span className="text-[10px] bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-black border border-amber-400/40">
            {duckCount} Học Sinh
          </span>
          {noRepeat && (
            <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-black border border-emerald-400/40">
              Đã gọi: {calledCount}/{duckCount}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Âm thanh */}
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

          {/* Cài đặt giáo viên */}
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-extrabold text-xs active:scale-95 transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cài Đặt & Học Sinh</span>
          </button>
        </div>
      </div>

      {/* 2. Tiêu đề trò chơi dân gian rực rỡ */}
      <div className="my-auto text-center max-w-2xl px-4 py-3 flex flex-col items-center">
        {/* Huy hiệu dân gian */}
        <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-widest uppercase mb-3 shadow-sm">
          <span>🌾</span>
          <span>Trò Chơi Gọi Tên Ngẫu Nhiên 3D</span>
          <span>🌾</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-400 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex items-center justify-center space-x-3">
          <span className="text-4xl sm:text-6xl">🦆</span>
          <span>BỊT MẮT BẮT VỊT</span>
        </h1>

        <p className="text-xs sm:text-sm text-amber-100/90 font-medium mt-2 max-w-lg leading-relaxed">
          "Trò chơi dân gian gọi tên học sinh ngẫu nhiên cực vui nhộn, công bằng và kịch tính nhất phòng học!"
        </p>

        {/* 3. Lựa chọn 3 chế độ chơi */}
        <div className="w-full my-5">
          <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider block mb-2 text-left sm:text-center">
            CHỌN CHẾ ĐỘ CHƠI:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
            {GAME_MODES.map(m => {
              const isSelected = selectedMode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMode(m.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/25 border-yellow-400 shadow-lg shadow-amber-500/20 scale-102 ring-2 ring-yellow-400/30'
                      : 'bg-black/30 border-white/10 hover:border-white/30 hover:bg-black/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{m.icon}</span>
                      <strong className="text-xs font-black text-white">{m.name}</strong>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-yellow-300 stroke-[3]" />}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                    {m.desc}
                  </p>
                  <span className="inline-block mt-2 text-[9px] font-black px-2 py-0.5 rounded-full bg-white/10 text-amber-300">
                    {m.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. CÁC TÙY CHỌN NHANH TRƯỚC KHI BẮT ĐẦU */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {/* Không lặp học sinh */}
          <button
            onClick={onToggleNoRepeat}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all ${
              noRepeat
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                : 'bg-black/30 border-white/10 text-slate-400'
            }`}
          >
            <span>{noRepeat ? '☑ Không Lặp Tên' : '☐ Cho Phép Lặp'}</span>
          </button>

          {/* Hiển thị tên vịt */}
          <button
            onClick={onToggleShowDuckNames}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all ${
              showDuckNames
                ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                : 'bg-black/30 border-white/10 text-slate-400'
            }`}
          >
            <span>{showDuckNames ? '👀 Hiện Tên Vịt' : '🙈 Ẩn Tên (Bí Mật)'}</span>
          </button>

          {/* Giọng đọc TTS */}
          <button
            onClick={onToggleTts}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all ${
              enableTts
                ? 'bg-blue-500/25 border-blue-400 text-blue-200'
                : 'bg-black/30 border-white/10 text-slate-400'
            }`}
          >
            <span>{enableTts ? '🗣️ Đọc To Tên' : '🔇 Tắt Đọc Tên'}</span>
          </button>

          {/* Thời gian */}
          <div className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-amber-200">
            <span>⏱️ {roundDuration}s / lượt</span>
          </div>
        </div>

        {/* 4B. CHỌN NHÂN VẬT BỊT MẮT (CÔ BÉ / CẬU BÉ / THẦY GIÁO) */}
        <div className="flex items-center space-x-2 mb-6 p-1.5 rounded-2xl bg-black/40 border border-amber-400/30 backdrop-blur-md">
          <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider px-2">
            Người bịt mắt:
          </span>
          {[
            { id: 'girl', label: 'Cô Bé Bà Ba', icon: '👧' },
            { id: 'boy', label: 'Cậu Bé Nhanh Nhẹn', icon: '👦' },
            { id: 'teacher', label: 'Thầy Giáo Vui Tính', icon: '🧑‍🏫' }
          ].map(c => (
            <button
              key={c.id}
              onClick={() => onSelectCharacter?.(c.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                characterType === c.id
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md scale-105 ring-2 ring-yellow-400'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-sm">{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        {/* 5. NÚT LỚN: BẮT ĐẦU BẮT VỊT (WORKFLOW NHANH CỦA THẦY) */}
        <div className="flex flex-col items-center">
          <button
            onClick={onStartGame}
            className="group relative px-10 sm:px-14 py-4 rounded-3xl bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-950 font-black text-lg sm:text-xl shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/80 active:scale-95 transition-all flex items-center space-x-3 border-2 border-yellow-200 animate-pulse"
          >
            <Play className="w-6 h-6 fill-slate-950 text-slate-950" />
            <span>BẮT ĐẦU BẮT VỊT</span>
          </button>
          <span className="text-[11px] text-amber-200/70 font-semibold mt-2">
            Nhấn để bắt đầu chuỗi: Quay tên ngẫu nhiên → Đàn vịt rượt đuổi → Bắt học sinh
          </span>
        </div>
      </div>

      {/* 3. Footer */}
      <div className="w-full max-w-4xl flex items-center justify-between text-xs text-amber-100/60 font-medium shrink-0 pt-4 border-t border-white/10">
        <button
          onClick={onOpenRules}
          className="flex items-center space-x-1 hover:text-amber-300 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Luật Chơi</span>
        </button>

        <span className="hidden sm:inline">
          LMS Nề Nếp & Tiếng Anh THCS • Thầy Nguyễn Văn Hải
        </span>

        <button
          onClick={onOpenLeaderboard}
          className="flex items-center space-x-1 hover:text-amber-300 transition-colors"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Lịch Sử Gọi Tên</span>
        </button>
      </div>

    </div>
  );
};
