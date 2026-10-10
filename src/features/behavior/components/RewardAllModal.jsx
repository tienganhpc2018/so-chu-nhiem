import React, { useState } from 'react';
import { X, Sparkles, Award, Users, AlertCircle, CheckCircle2, UserCheck, UserX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../../utils/soundEffects';

export const RewardAllModal = ({
  isOpen,
  onClose,
  students = [],
  currentClass,
  onRewardAllPresent
}) => {
  const [selectedPoints, setSelectedPoints] = useState(2);
  const [reason, setReason] = useState('Cả lớp chăm ngoan, giữ nề nếp trật tự tốt');

  if (!isOpen) return null;

  // Filter present and absent students
  const presentStudents = students.filter(
    s => s.status !== 'Absent_Perm' && s.status !== 'Absent_NoPerm'
  );
  const absentStudents = students.filter(
    s => s.status === 'Absent_Perm' || s.status === 'Absent_NoPerm'
  );

  const PRESET_POINTS = [1, 2, 3, 5, 10];
  const PRESET_REASONS = [
    'Cả lớp chăm ngoan, giữ nề nếp trật tự tốt',
    'Hoàn thành bài học và bài tập xuất sắc',
    'Tích cực hăng hái tham gia hoạt động nhóm',
    'Khen thưởng nỗ lực thi đua toàn diện cả lớp'
  ];

  const handleConfirm = () => {
    if (presentStudents.length === 0) return;
    soundFx.playCorrect();
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });

    onRewardAllPresent?.(selectedPoints, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl p-5 sm:p-7 border border-amber-200 flex flex-col justify-between max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-amber-200">
              <Sparkles className="w-6 h-6 text-yellow-100 fill-yellow-100" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">
                Thưởng Điểm Cho Cả Lớp
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                Tự động loại trừ học sinh vắng • Giữ nguyên điểm cũ của từng em
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-4 py-3 custom-scrollbar flex-1 pr-1">
          
          {/* Statistics Card */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Sĩ số lớp</span>
              <span className="text-base font-black text-slate-800">{students.length} HS</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-[10px] font-black uppercase text-emerald-600 block flex items-center justify-center space-x-1">
                <UserCheck className="w-3 h-3 inline" />
                <span>Được thưởng (+)</span>
              </span>
              <span className="text-base font-black text-emerald-700">{presentStudents.length} HS</span>
            </div>

            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200">
              <span className="text-[10px] font-black uppercase text-rose-500 block flex items-center justify-center space-x-1">
                <UserX className="w-3 h-3 inline" />
                <span>Vắng (Bỏ qua)</span>
              </span>
              <span className="text-base font-black text-rose-600">{absentStudents.length} HS</span>
            </div>
          </div>

          {/* Point Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 flex items-center justify-between">
              <span>Chọn số điểm thưởng cộng cho mỗi học sinh:</span>
              <span className="text-amber-600 font-black text-sm">+{selectedPoints} Điểm ⭐</span>
            </label>
            <div className="flex items-center space-x-2">
              {PRESET_POINTS.map(pts => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedPoints(pts);
                  }}
                  className={`flex-1 py-2.5 rounded-2xl font-black text-xs transition-all ${
                    selectedPoints === pts
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200 scale-105'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  +{pts} Điểm
                </button>
              ))}
            </div>
          </div>

          {/* Reason Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 block">
              Lý do khen thưởng:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {PRESET_REASONS.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setReason(r);
                  }}
                  className={`text-left p-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                    reason === r
                      ? 'border-amber-400 bg-amber-50/70 text-amber-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Hoặc tự nhập lý do khen thưởng..."
              className="w-full mt-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Absent Students Notice */}
          {absentStudents.length > 0 && (
            <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-200 text-xs">
              <div className="flex items-center space-x-1.5 text-rose-700 font-black mb-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Học sinh vắng hôm nay ({absentStudents.length} em - không được cộng điểm):</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {absentStudents.map(st => (
                  <span
                    key={st.id}
                    className="px-2 py-0.5 bg-white text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold"
                  >
                    {st.full_name} ({st.status === 'Absent_Perm' ? 'Vắng phép' : 'Vắng K.phép'})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Guarantee Note */}
          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200 text-[11px] text-blue-800 font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Mọi điểm cộng (+) và điểm trừ (-) đã tích lũy trước đó của từng học sinh đều được giữ nguyên 100%!</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
          >
            Hủy bỏ
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={presentStudents.length === 0}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-2xl shadow-md shadow-amber-200 flex items-center space-x-2 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>XÁC NHẬN CỘNG +{selectedPoints} ĐIỂM ({presentStudents.length} HS)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
