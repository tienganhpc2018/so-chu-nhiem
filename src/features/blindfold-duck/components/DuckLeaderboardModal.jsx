import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Flame, Calendar } from 'lucide-react';
import { getLeaderboardSessions } from '../services/duckStorage';

export const DuckLeaderboardModal = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSessions(getLeaderboardSessions());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-400 max-h-[90vh] flex flex-col">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề */}
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 shrink-0">
          <span className="text-3xl">🏆</span>
          <div>
            <span className="text-xs font-black text-amber-600 uppercase tracking-widest block">
              BẢNG VÀNG THI ĐUA
            </span>
            <h3 className="text-xl font-black text-slate-900 leading-tight">
              Bảng Xếp Hạng: Bịt Mắt Bắt Vịt
            </h3>
          </div>
        </div>

        {/* Danh sách người chơi */}
        <div className="my-4 overflow-y-auto flex-1 space-y-2 pr-1 custom-scrollbar">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Chưa có lượt chơi nào được ghi nhận. Hãy là người đầu tiên!
            </div>
          ) : (
            sessions.map((item, idx) => {
              let rankBadge = (
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
              );
              if (idx === 0) rankBadge = <span className="text-xl">🥇</span>;
              else if (idx === 1) rankBadge = <span className="text-xl">🥈</span>;
              else if (idx === 2) rankBadge = <span className="text-xl">🥉</span>;

              return (
                <div
                  key={item.id || idx}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    idx === 0
                      ? 'bg-amber-50/90 border-amber-300 shadow-sm'
                      : idx < 3
                      ? 'bg-slate-50/80 border-slate-200'
                      : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="shrink-0">{rankBadge}</div>
                    <div>
                      <strong className="block text-xs sm:text-sm text-slate-900 font-extrabold">
                        {item.player_name || 'Học sinh'}
                      </strong>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-semibold mt-0.5">
                        <span>🦆 Bắt: {item.ducks_caught || 0}</span>
                        {item.combo_max > 1 && (
                          <span className="text-orange-600 flex items-center">
                            <Flame className="w-2.5 h-2.5 mr-0.5" />
                            x{item.combo_max}
                          </span>
                        )}
                        <span>⏱️ {item.duration_seconds || 60}s</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base sm:text-lg font-black text-amber-600 block leading-tight">
                      {item.score || 0}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">điểm</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Nút đóng */}
        <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-all"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
};
