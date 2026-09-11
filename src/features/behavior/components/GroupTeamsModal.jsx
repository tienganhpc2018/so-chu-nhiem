import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Layers, Users, Sparkles, Shuffle, UserCheck } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const GroupTeamsModal = ({
  isOpen,
  onClose,
  students = []
}) => {
  const [teams, setTeams] = useState([1, 2, 3, 4]);
  const [selectedRep, setSelectedRep] = useState(null);

  if (!isOpen) return null;

  // Split students into 4 teams
  const team1 = students.filter(s => (s.team_group || 1) === 1);
  const team2 = students.filter(s => s.team_group === 2);
  const team3 = students.filter(s => s.team_group === 3);
  const team4 = students.filter(s => s.team_group === 4);

  const teamData = [
    { id: 1, name: 'TỔ 1 - BẠC HÀ', color: 'from-emerald-500 to-teal-600', members: team1 },
    { id: 2, name: 'TỔ 2 - SAN HÔ', color: 'from-orange-500 to-rose-500', members: team2 },
    { id: 3, name: 'TỔ 3 - HỔ PHÁCH', color: 'from-amber-500 to-yellow-500', members: team3 },
    { id: 4, name: 'TỔ 4 - ĐẠI DƯƠNG', color: 'from-blue-500 to-indigo-600', members: team4 },
  ];

  const handlePickRepresentative = () => {
    soundFx.playClick();
    soundFx.playSuspenseSpin();

    setTimeout(() => {
      const rand = students[Math.floor(Math.random() * students.length)];
      setSelectedRep(rand);
      soundFx.playWinner();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border-4 border-teal-500 rounded-[2.5rem] shadow-2xl p-5 sm:p-7 text-white flex flex-col justify-between max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-teal-800/60">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🐝</span>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-teal-300">
                CHIA NHÓM & QUẢN LÝ THEO TỔ THI ĐUA
              </h3>
              <p className="text-[11px] text-teal-200/70 font-bold">
                Tổ chức 4 tổ thi đua, thảo luận nhóm và bốc thăm đại diện báo cáo
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-2xl">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Selected Representative Spotlight (if picked) */}
        {selectedRep && (
          <div className="my-3 p-4 bg-gradient-to-r from-amber-500/20 via-teal-500/20 to-purple-500/20 border-2 border-amber-400 rounded-3xl flex items-center justify-between animate-in zoom-in-95">
            <div className="flex items-center space-x-3">
              <img
                src={
                  selectedRep.avatar ||
                  selectedRep.avatar_url ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedRep.full_name)}`
                }
                alt={selectedRep.full_name}
                className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover"
              />
              <div>
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block">
                  🎯 ĐẠI DIỆN TRÌNH BÀY ĐƯỢC CHỌN:
                </span>
                <span className="text-base font-black text-white">{selectedRep.full_name}</span>
                <span className="text-xs text-slate-300 font-bold ml-2">
                  (Tổ {selectedRep.team_group || 1})
                </span>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs">
              Sẵn Sàng Trình Bày!
            </span>
          </div>
        )}

        {/* 4 Teams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-3">
          {teamData.map(team => (
            <div
              key={team.id}
              className="bg-slate-800/80 rounded-3xl p-4 border border-slate-700 flex flex-col justify-between space-y-3"
            >
              <div className={`p-2.5 rounded-2xl bg-gradient-to-r ${team.color} text-center shadow-md`}>
                <h4 className="font-black text-xs text-white tracking-wider">{team.name}</h4>
                <span className="text-[10px] text-white/80 font-bold">{team.members.length} thành viên</span>
              </div>

              {/* Members List */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {team.members.map((m, i) => (
                  <div
                    key={m.id || i}
                    className="p-1.5 bg-slate-900/60 rounded-xl flex items-center space-x-2 text-xs"
                  >
                    <img
                      src={
                        m.avatar ||
                        m.avatar_url ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(m.full_name)}`
                      }
                      alt={m.full_name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-bold text-slate-200 truncate">{m.full_name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePickRepresentative}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all transform hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>🎯 CHỌN ĐẠI DIỆN TRÌNH BÀY NGẪU NHIÊN</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
