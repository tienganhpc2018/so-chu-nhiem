import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { X, Users, Sparkles, Shuffle, UserCheck, Timer, CheckCircle, Flame } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const GroupTeamsModal = ({
  isOpen,
  onClose,
  students = []
}) => {
  const [selectedScope, setSelectedScope] = useState('all'); // 'all' | 1 | 2 | 3 | 4
  const [selectedRep, setSelectedRep] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);
  const [scanSecondsLeft, setScanSecondsLeft] = useState(8);

  const scanIntervalRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Group students into 4 teams
  const team1 = useMemo(() => students.filter(s => (s.team_group || 1) === 1), [students]);
  const team2 = useMemo(() => students.filter(s => s.team_group === 2), [students]);
  const team3 = useMemo(() => students.filter(s => s.team_group === 3), [students]);
  const team4 = useMemo(() => students.filter(s => s.team_group === 4), [students]);

  const teamData = [
    { id: 1, name: 'TỔ 1 - BẠC HÀ', color: 'from-emerald-500 to-teal-600', members: team1, badge: '🌿' },
    { id: 2, name: 'TỔ 2 - SAN HÔ', color: 'from-orange-500 to-rose-500', members: team2, badge: '🪸' },
    { id: 3, name: 'TỔ 3 - HỔ PHÁCH', color: 'from-amber-500 to-yellow-500', members: team3, badge: '🍯' },
    { id: 4, name: 'TỔ 4 - ĐẠI DƯƠNG', color: 'from-blue-500 to-indigo-600', members: team4, badge: '🌊' },
  ];

  // Pool of candidate students based on selectedScope
  const candidatePool = useMemo(() => {
    if (selectedScope === 'all') return students.length > 0 ? students : [];
    const t = teamData.find(tm => tm.id === selectedScope);
    return t && t.members.length > 0 ? t.members : (students.length > 0 ? students : []);
  }, [selectedScope, students, teamData]);

  // Clean up on unmount or modal close
  useEffect(() => {
    if (!isOpen) {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      soundFx.stopSuspenseDrum();
      setIsScanning(false);
      setHighlightedId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Pick Representative with 8-second running scanner
  const handleStartPickRepresentative = () => {
    if (candidatePool.length === 0 || isScanning) return;

    soundFx.playClick();
    setIsScanning(true);
    setSelectedRep(null);
    setScanSecondsLeft(8);

    // Kích hoạt trống dồn hồi hộp 8.2s
    soundFx.startSuspenseDrum(8.2);

    const startTime = Date.now();
    const durationMs = 8200; // 8.2 giây
    let currentIndex = 0;

    // Countdown timer mỗi 1 giây
    countdownTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const left = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      setScanSecondsLeft(left);
    }, 250);

    // Vòng lặp quét học sinh liên tục với tốc độ biến thiên
    const runScanStep = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= durationMs) {
        // Kết thúc quét -> chốt người thắng
        if (scanIntervalRef.current) clearTimeout(scanIntervalRef.current);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        soundFx.stopSuspenseDrum();

        const finalWinner = candidatePool[Math.floor(Math.random() * candidatePool.length)];
        setSelectedRep(finalWinner);
        setHighlightedId(finalWinner.id);
        setIsScanning(false);

        soundFx.playWinner();
        soundFx.playFanfare();

        confetti({
          particleCount: 130,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899']
        });
        return;
      }

      // Chọn học sinh tiếp theo trong danh sách
      currentIndex = (currentIndex + 1) % candidatePool.length;
      const currentStudent = candidatePool[currentIndex];
      setHighlightedId(currentStudent.id);
      soundFx.playTick();

      // Cuộn học sinh đang quét vào tầm mắt nếu cần
      const el = document.getElementById(`student-card-${currentStudent.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Tốc độ: Ban đầu nhanh (70ms), 2 giây cuối giảm tốc độ (150ms -> 320ms -> 500ms)
      let nextDelay = 70;
      if (elapsed > 5500) {
        const slowRatio = (elapsed - 5500) / 2700; // 0 to 1
        nextDelay = 80 + slowRatio * 380;
      }

      scanIntervalRef.current = setTimeout(runScanStep, nextDelay);
    };

    runScanStep();
  };

  const getScopeLabel = () => {
    if (selectedScope === 'all') return `Cả Lớp (${students.length} HS)`;
    const t = teamData.find(tm => tm.id === selectedScope);
    return `${t?.name} (${t?.members.length} HS)`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border-4 border-teal-500 rounded-[2.5rem] shadow-2xl p-4 sm:p-6 text-white flex flex-col justify-between max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-teal-800/60">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🐝</span>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-teal-300">
                CHIA NHÓM & BỐC THĂM ĐẠI DIỆN BÁO CÁO
              </h3>
              <p className="text-[11px] text-teal-200/70 font-bold">
                Tổ chức thi đua, chọn phạm vi (Cả lớp hoặc từng Tổ) và rà soát ngẫu nhiên 8 giây
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-2xl">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Selected Representative Spotlight (When finished) */}
        {selectedRep && !isScanning && (
          <div className="my-2 p-3 sm:p-4 bg-gradient-to-r from-amber-500/20 via-teal-500/20 to-purple-500/20 border-2 border-amber-400 rounded-3xl flex items-center justify-between animate-in zoom-in-95 shadow-xl">
            <div className="flex items-center space-x-3">
              <img
                src={
                  selectedRep.avatar ||
                  selectedRep.avatar_url ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedRep.full_name)}`
                }
                alt={selectedRep.full_name}
                className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover bg-slate-800"
              />
              <div>
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span>ĐẠI DIỆN TRÌNH BÀY ĐÃ ĐƯỢC CHỌN:</span>
                </span>
                <span className="text-base sm:text-lg font-black text-white">{selectedRep.full_name}</span>
                <span className="text-xs text-amber-200 font-bold ml-2">
                  (Tổ {selectedRep.team_group || 1} • {selectedScope === 'all' ? 'Toàn lớp' : `Tổ ${selectedScope}`})
                </span>
              </div>
            </div>
            <span className="px-3.5 py-1.5 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md animate-pulse">
              🎉 Sẵn Sàng Trình Bày!
            </span>
          </div>
        )}

        {/* Scanning In Progress Bar (During the 8 seconds) */}
        {isScanning && (
          <div className="my-2 p-3 bg-gradient-to-r from-teal-950 via-slate-800 to-teal-950 border-2 border-teal-400 rounded-2xl flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-teal-400 animate-ping" />
              <span className="text-xs sm:text-sm font-black text-teal-300">
                ⏳ ĐANG RÀ SOÁT DANH SÁCH {getScopeLabel().toUpperCase()}...
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-teal-500/20 px-3 py-1 rounded-xl border border-teal-400/40">
              <Timer className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-sm font-black text-amber-300">
                {scanSecondsLeft} GIÂY
              </span>
            </div>
          </div>
        )}

        {/* 4 Teams Grid with High-Visibility Scanning Highlight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-2 flex-1 overflow-hidden">
          {teamData.map(team => {
            const isTeamActive = selectedScope === 'all' || selectedScope === team.id;
            return (
              <div
                key={team.id}
                onClick={() => !isScanning && setSelectedScope(team.id)}
                className={`bg-slate-800/80 rounded-3xl p-3 border transition-all flex flex-col justify-between cursor-pointer ${
                  selectedScope === team.id
                    ? 'border-amber-400 ring-2 ring-amber-400/40 bg-slate-800'
                    : isTeamActive
                    ? 'border-slate-700 hover:border-teal-500/50'
                    : 'border-slate-800 opacity-40 hover:opacity-75'
                }`}
              >
                {/* Team Card Header */}
                <div className={`p-2 rounded-2xl bg-gradient-to-r ${team.color} text-center shadow-md flex items-center justify-between px-3`}>
                  <div className="text-left">
                    <h4 className="font-black text-xs text-white tracking-wider flex items-center space-x-1">
                      <span>{team.badge}</span>
                      <span>{team.name}</span>
                    </h4>
                    <span className="text-[10px] text-white/80 font-bold">{team.members.length} học sinh</span>
                  </div>
                  {selectedScope === team.id && (
                    <span className="text-[9px] bg-white text-slate-900 font-black px-2 py-0.5 rounded-full">
                      Đang chọn
                    </span>
                  )}
                </div>

                {/* Members List with Scanning Effect */}
                <div className="space-y-1.5 my-2 flex-1 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {team.members.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs italic">
                      Chưa có học sinh trong tổ
                    </div>
                  ) : (
                    team.members.map((m, i) => {
                      const isHighlighted = highlightedId === m.id;
                      const isWinner = selectedRep?.id === m.id && !isScanning;

                      return (
                        <div
                          key={m.id || i}
                          id={`student-card-${m.id}`}
                          className={`p-1.5 rounded-xl flex items-center justify-between text-xs transition-all duration-100 ${
                            isWinner
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black ring-4 ring-emerald-300 scale-105 shadow-xl z-20'
                              : isHighlighted
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black ring-4 ring-amber-300 scale-105 shadow-xl z-10 animate-bounce'
                              : 'bg-slate-900/60 text-slate-200 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <img
                              src={
                                m.avatar ||
                                m.avatar_url ||
                                `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(m.full_name)}`
                              }
                              alt={m.full_name}
                              className={`w-6 h-6 rounded-full object-cover ${
                                isHighlighted || isWinner ? 'ring-2 ring-white' : ''
                              }`}
                            />
                            <span className="truncate">{m.full_name}</span>
                          </div>

                          {/* Scanner Indicator Tag */}
                          {isHighlighted && (
                            <span className="text-[9px] font-black bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded-md ml-1 whitespace-nowrap">
                              👉 ĐANG QUÉT
                            </span>
                          )}
                          {isWinner && (
                            <span className="text-[9px] font-black bg-slate-950 text-emerald-300 px-1.5 py-0.5 rounded-md ml-1 whitespace-nowrap">
                              ⭐ ĐẠI DIỆN
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Pick Team button */}
                <button
                  type="button"
                  disabled={isScanning || team.members.length === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedScope(team.id);
                  }}
                  className={`w-full py-1 rounded-xl text-[10px] font-black transition-all ${
                    selectedScope === team.id
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {selectedScope === team.id ? '✓ Đang Chọn Tổ Này' : `Bấm Chọn Riêng Tổ ${team.id}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Action Controls & Scope Filter Tabs */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Scope Selector Pills */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1">Phạm vi:</span>
            <button
              disabled={isScanning}
              onClick={() => setSelectedScope('all')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                selectedScope === 'all'
                  ? 'bg-teal-500 text-slate-950 shadow-md ring-2 ring-teal-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ⭐ Cả Lớp ({students.length})
            </button>

            {[1, 2, 3, 4].map(tNum => (
              <button
                key={tNum}
                disabled={isScanning}
                onClick={() => setSelectedScope(tNum)}
                className={`px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  selectedScope === tNum
                    ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Tổ {tNum}
              </button>
            ))}
          </div>

          {/* Start Scan Button */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleStartPickRepresentative}
              disabled={isScanning || candidatePool.length === 0}
              className={`px-6 py-3 rounded-2xl font-black text-xs shadow-lg flex items-center space-x-2 transition-all transform ${
                isScanning
                  ? 'bg-amber-600 text-white cursor-not-allowed animate-pulse'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 hover:scale-105 active:scale-95 shadow-amber-500/30'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isScanning
                  ? `ĐANG QUÉT NGẪU NHIÊN (${scanSecondsLeft}s)...`
                  : `🎯 QUAY CHỌN ĐẠI DIỆN ${selectedScope === 'all' ? 'CẢ LỚP' : `TỔ ${selectedScope}`} (8 GIÂY)`}
              </span>
            </button>

            <button
              onClick={onClose}
              disabled={isScanning}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl"
            >
              Đóng
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

