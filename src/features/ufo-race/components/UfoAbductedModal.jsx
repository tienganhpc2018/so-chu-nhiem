import React from 'react';
import { Sparkles, RotateCcw, X, Volume2, Trophy } from 'lucide-react';

export const UfoAbductedModal = ({
  isOpen,
  abductedStudents = [],
  onClose,
  onPickNextRound,
  onRestartCurrentRound
}) => {
  if (!isOpen || abductedStudents.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b1329] border-2 border-emerald-500/80 rounded-3xl w-full max-w-3xl text-white shadow-[0_0_60px_rgba(16,185,129,0.5)] flex flex-col overflow-hidden animate-scale-up">
        
        {/* Header với hiệu ứng đĩa bay chúc mừng */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl animate-bounce">🛸</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                ĐÃ TÚM ĐƯỢC {abductedStudents.length} BẠN LÊN BẢNG!
              </h2>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                Mời các phi hành gia may mắn bước lên bục trả bài
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-black/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Danh sách học sinh được chọn */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className={`grid gap-4 ${
            abductedStudents.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
            abductedStudents.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
            'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
          }`}>
            {abductedStudents.map((std, idx) => (
              <div
                key={std.id}
                className="bg-slate-900/90 border-2 border-emerald-400/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-lg hover:border-emerald-300 transition-all hover:scale-105"
              >
                {/* Huy hiệu thứ tự */}
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-md mb-2">
                  #{idx + 1}
                </div>

                {/* Avatar / Ảnh tròn */}
                <div className="relative w-20 h-20 rounded-full border-4 border-yellow-400 overflow-hidden shadow-md bg-amber-100 flex items-center justify-center mb-3">
                  {std.avatar || std.avatar_url ? (
                    <img
                      src={std.avatar || std.avatar_url}
                      alt={std.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="text-3xl font-black text-amber-700">
                      {std.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Tên học sinh hiển thị to rõ theo chuẩn Chữ lót + Tên */}
                <div className="px-3 py-1 rounded-full bg-white border-2 border-red-500 shadow-sm mb-1.5">
                  <span className="font-black text-sm text-red-600 tracking-wide">
                    {std.shortName || std.name || std.full_name}
                  </span>
                </div>
                {(std.full_name || std.name) && (std.shortName !== (std.full_name || std.name)) && (
                  <span className="text-[10px] text-slate-400 mb-1.5 font-medium">
                    ({std.full_name || std.name})
                  </span>
                )}

                {/* Câu thoại vui nhộn */}
                <p className="text-[11px] text-slate-300 italic">
                  "{std.quote || 'Dạ thưa thầy em xin trả lời bài ạ!'}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-[#080d1d] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onRestartCurrentRound}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Thả về & Bắt lại</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700"
            >
              Đóng
            </button>
            <button
              onClick={onPickNextRound}
              className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-900/40 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-yellow-200 fill-yellow-200" />
              <span>Bắt lượt tiếp theo (Không trùng)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
