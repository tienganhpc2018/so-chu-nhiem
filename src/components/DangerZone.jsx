import React, { useState } from 'react';
import { soundFx } from '../utils/soundEffects';
import { MascotRobot } from './MascotRobot';
import { AlertTriangle, Trash2, ShieldAlert, Check } from 'lucide-react';

export const DangerZone = ({
  currentClass,
  onResetPointsHistory,
  onResetSeatingChart,
  onDeleteClassRoster
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [activeAction, setActiveAction] = useState(null); // 'points' | 'seating' | 'roster'
  const [loading, setLoading] = useState(false);

  const isConfirmed = confirmInput.trim().toUpperCase() === 'XAC NHAN';

  const handleExecute = async () => {
    if (!isConfirmed || !activeAction || !currentClass) return;

    setLoading(true);
    soundFx.playDeduct();

    try {
      if (activeAction === 'points') {
        await onResetPointsHistory(currentClass.id);
      } else if (activeAction === 'seating') {
        await onResetSeatingChart(currentClass.id);
      } else if (activeAction === 'roster') {
        await onDeleteClassRoster(currentClass.id);
      }
      setConfirmInput('');
      setActiveAction(null);
    } catch (err) {
      console.error('Lỗi thực hiện DangerZone action:', err);
      alert('Không thể thực hiện tác vụ bảo mật. Vui lòng kiểm tra quyền truy cập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-red-50/50 rounded-3xl p-6 border-2 border-red-200 shadow-soft max-w-3xl mx-auto my-6">
      
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-red-200">
        <div className="p-2 bg-red-100 rounded-2xl">
          <MascotRobot mode="danger" size={40} />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-red-700 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>VÙNG NGUY HIỂM BẢO MẬT (DANGER ZONE)</span>
          </h3>
          <p className="text-xs text-red-600/80">
            Các tác vụ dưới đây có nguy cơ xóa bỏ dữ liệu vĩnh viễn. Yêu cầu nhập xác nhận bảo mật để kích hoạt.
          </p>
        </div>
      </div>

      {/* Action Selection Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
        
        <button
          onClick={() => {
            setActiveAction('points');
            setConfirmInput('');
            soundFx.playClick();
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeAction === 'points'
              ? 'bg-red-500 text-white border-red-600 shadow-md ring-2 ring-red-400'
              : 'bg-white text-slate-800 border-red-200 hover:bg-red-50/70'
          }`}
        >
          <span className="text-xs font-extrabold block mb-1">Xóa Lịch Sử Tích Điểm</span>
          <span className={`text-[11px] block ${activeAction === 'points' ? 'text-red-100' : 'text-slate-500'}`}>
            Xóa sạch tất cả sao thưởng & vi phạm của lớp
          </span>
        </button>

        <button
          onClick={() => {
            setActiveAction('seating');
            setConfirmInput('');
            soundFx.playClick();
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeAction === 'seating'
              ? 'bg-red-500 text-white border-red-600 shadow-md ring-2 ring-red-400'
              : 'bg-white text-slate-800 border-red-200 hover:bg-red-50/70'
          }`}
        >
          <span className="text-xs font-extrabold block mb-1">Đặt Lại Sơ Đồ Chỗ Ngồi</span>
          <span className={`text-[11px] block ${activeAction === 'seating' ? 'text-red-100' : 'text-slate-500'}`}>
            Đưa tất cả vị trí bàn học của sinh viên về trạng thái chờ
          </span>
        </button>

        <button
          onClick={() => {
            setActiveAction('roster');
            setConfirmInput('');
            soundFx.playClick();
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeAction === 'roster'
              ? 'bg-red-500 text-white border-red-600 shadow-md ring-2 ring-red-400'
              : 'bg-white text-slate-800 border-red-200 hover:bg-red-50/70'
          }`}
        >
          <span className="text-xs font-extrabold block mb-1">Xóa Danh Sách Học Sinh</span>
          <span className={`text-[11px] block ${activeAction === 'roster' ? 'text-red-100' : 'text-slate-500'}`}>
            Xóa toàn bộ dữ liệu học sinh trong lớp khỏi hệ thống
          </span>
        </button>

      </div>

      {/* Confirmation String Prompt */}
      {activeAction && (
        <div className="mt-4 p-4 bg-white rounded-2xl border border-red-300 shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2 text-xs font-bold text-red-700 mb-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Xác nhận bảo mật tuyệt đối: Nhập chính xác chuỗi "XAC NHAN" để thực hiện</span>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="Gõ XAC NHAN vào đây..."
              className="flex-1 bg-red-50/50 border border-red-300 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-red-900 focus:ring-2 focus:ring-red-500 outline-none uppercase placeholder:normal-case"
            />
            <button
              onClick={handleExecute}
              disabled={!isConfirmed || loading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-extrabold px-6 py-2 rounded-xl text-xs shadow-md transition-all flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{loading ? 'Đang xử lý...' : 'XÁC NHẬN XÓA'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
