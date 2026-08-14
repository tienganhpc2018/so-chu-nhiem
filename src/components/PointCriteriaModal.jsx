import React, { useState } from 'react';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { MascotRobot } from './MascotRobot';
import { X, PlusCircle, MinusCircle, Star, Sparkles } from 'lucide-react';

export const PointCriteriaModal = ({
  isOpen,
  onClose,
  student,
  onConfirmPointChange
}) => {
  const [actionType, setActionType] = useState('add'); // 'add' | 'deduct'
  const [points, setPoints] = useState(5);
  const [reason, setReason] = useState('Hăng hái phát biểu trong giờ học');

  if (!isOpen || !student) return null;

  // Preset criteria options
  const addPresetCriteria = [
    { name: 'Hăng hái phát biểu xây dựng bài', pts: 5 },
    { name: 'Vệ sinh trực nhật lớp sạch đẹp', pts: 5 },
    { name: 'Chuẩn bị bài đầy đủ & xuất sắc', pts: 10 },
    { name: 'Giúp đỡ bạn vượt khó học tập', pts: 5 },
    { name: 'Đạt điểm 9-10 bài kiểm tra', pts: 10 }
  ];

  const deductPresetCriteria = [
    { name: 'Nói chuyện làm mất trật tự lớp', pts: 5 },
    { name: 'Không làm bài tập về nhà', pts: 10 },
    { name: 'Đi học muộn / không đồng phục', pts: 5 },
    { name: 'Sử dụng điện thoại trái phép', pts: 10 },
    { name: 'Xả rác không đúng nơi quy định', pts: 5 }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    if (actionType === 'add') {
      soundFx.playCorrect();
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      soundFx.playDeduct();
    }

    onConfirmPointChange(student, points, reason, actionType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-mint-100 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <MascotRobot mode={actionType === 'add' ? 'celebrate' : 'thinking'} size={40} />
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {actionType === 'add' ? 'Tuyên Dương & Cộng Sao' : 'Nhắc Nhở & Trừ Sao'}
              </h3>
              <p className="text-xs text-slate-500">Học sinh: <span className="font-bold text-mint-700">{student.full_name}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Type Toggle */}
        <div className="grid grid-cols-2 gap-2 my-4 bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActionType('add');
              setReason('Hăng hái phát biểu trong giờ học');
              setPoints(5);
              soundFx.playClick();
            }}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              actionType === 'add'
                ? 'bg-mint-500 text-white shadow-mint-glow'
                : 'text-slate-600 hover:text-mint-600'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cộng Điểm (+)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActionType('deduct');
              setReason('Nói chuyện làm mất trật tự lớp');
              setPoints(5);
              soundFx.playClick();
            }}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              actionType === 'deduct'
                ? 'bg-coral-500 text-white shadow-coral-glow'
                : 'text-slate-600 hover:text-coral-600'
            }`}
          >
            <MinusCircle className="w-4 h-4" />
            <span>Trừ Điểm (-)</span>
          </button>
        </div>

        {/* Preset Criteria Pills */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-600 mb-2">Chọn nhanh tiêu chí nề nếp THCS:</label>
          <div className="flex flex-wrap gap-2">
            {(actionType === 'add' ? addPresetCriteria : deductPresetCriteria).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setReason(item.name);
                  setPoints(item.pts);
                  soundFx.playClick();
                }}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all font-semibold ${
                  reason === item.name
                    ? actionType === 'add'
                      ? 'bg-mint-100 text-mint-800 border-mint-300 font-bold ring-2 ring-mint-400'
                      : 'bg-coral-100 text-coral-800 border-coral-300 font-bold ring-2 ring-coral-400'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.name} ({actionType === 'add' ? '+' : '-'}{item.pts} sao)
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Lý do cụ thể:</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập chi tiết lý do..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-mint-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Số sao thay đổi:</label>
            <div className="flex items-center space-x-3">
              {[1, 2, 5, 10, 20].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setPoints(val);
                    soundFx.playClick();
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                    points === val
                      ? actionType === 'add'
                        ? 'bg-mint-500 text-white border-mint-500 shadow-sm'
                        : 'bg-coral-500 text-white border-coral-500 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {val} Sao
                </button>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${
                actionType === 'add'
                  ? 'bg-mint-500 hover:bg-mint-600 shadow-mint-glow'
                  : 'bg-coral-500 hover:bg-coral-600 shadow-coral-glow'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Xác Nhận {actionType === 'add' ? `+${points}` : `-${points}`} Sao</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
