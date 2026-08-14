import React, { useState } from 'react';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { MascotRobot } from './MascotRobot';
import { X, Users, Shuffle, Sparkles, Copy, Check } from 'lucide-react';

export const GroupGeneratorModal = ({ isOpen, onClose, students = [] }) => {
  const [numGroups, setNumGroups] = useState(4);
  const [groups, setGroups] = useState([]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateGroups = () => {
    if (students.length === 0) return;
    soundFx.playCorrect();

    // Fisher-Yates Shuffle Algorithm
    const shuffled = [...students];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const n = Math.max(1, Math.min(numGroups, students.length));
    const resultGroups = Array.from({ length: n }, () => []);

    shuffled.forEach((st, idx) => {
      resultGroups[idx % n].push(st);
    });

    setGroups(resultGroups);
    setCopied(false);

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleCopy = () => {
    if (groups.length === 0) return;
    soundFx.playClick();

    let text = `=== DANH SÁCH CHIA NHÓM THẢO LUẬN LỚP HỌC ===\n\n`;
    groups.forEach((g, idx) => {
      text += `📌 NHÓM ${idx + 1} (${g.length} HS):\n`;
      g.forEach(st => {
        text += `  - ${st.full_name}\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-mint-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <MascotRobot mode="happy" size={44} />
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
                <Users className="w-5 h-5 text-mint-600" />
                <span>Thuật Toán Chia Nhóm Tự Động</span>
              </h3>
              <p className="text-xs text-slate-500">Phân nhóm học sinh ngẫu nhiên công bằng phục vụ bài tập thảo luận</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="my-4 bg-mint-50/70 p-4 rounded-2xl border border-mint-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-700">Số lượng nhóm cần chia:</span>
            <select
              value={numGroups}
              onChange={(e) => setNumGroups(Number(e.target.value))}
              className="bg-white border border-mint-200 rounded-xl px-3 py-1.5 text-sm font-extrabold text-mint-800 outline-none focus:ring-2 focus:ring-mint-500"
            >
              {[2, 3, 4, 5, 6, 8, 10].map(n => (
                <option key={n} value={n}>{n} Nhóm</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerateGroups}
            disabled={students.length === 0}
            className="flex items-center space-x-2 bg-mint-500 hover:bg-mint-600 text-white font-extrabold px-5 py-2 rounded-xl text-xs shadow-mint-glow transition-all active:scale-95"
          >
            <Shuffle className="w-4 h-4" />
            <span>TỰ ĐỘNG CHIA NHÓM</span>
          </button>
        </div>

        {/* Groups Output Grid */}
        <div className="flex-1 overflow-y-auto pr-1 my-2">
          {groups.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              Nhấn nút <b>"Tự động chia nhóm"</b> để bắt đầu xáo trộn danh sách học sinh.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group, gIdx) => (
                <div
                  key={gIdx}
                  className="bg-slate-50 border border-mint-200/80 rounded-2xl p-4 shadow-sm hover:border-mint-400 transition-colors"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-mint-100">
                    <span className="text-xs font-extrabold bg-mint-500 text-white px-2.5 py-0.5 rounded-full">
                      NHÓM {gIdx + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {group.length} Thành viên
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {group.map((st, sIdx) => (
                      <li key={st.id} className="text-xs text-slate-700 flex items-center space-x-2">
                        <span className="w-4 text-center font-bold text-mint-600">{sIdx + 1}.</span>
                        <span className="font-semibold">{st.full_name}</span>
                        <span className="text-[10px] text-slate-400">(B{st.seat_row}-C{st.seat_col})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {groups.length > 0 && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Tổng cộng {students.length} học sinh được chia đều</span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 bg-coral-50 hover:bg-coral-100 text-coral-600 border border-coral-200 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã Sao Chép!' : 'Sao Chép Kết Quả'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
