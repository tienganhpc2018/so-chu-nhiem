import React from 'react';
import { MascotRobot } from './MascotRobot';
import { Plus } from 'lucide-react';

export const EmptyState = ({
  title = "Chưa có dữ liệu",
  description = "Hãy thêm mới dữ liệu để bắt đầu quản lý lớp học THCS của bạn.",
  actionText = null,
  onAction = null,
  robotMode = 'thinking'
}) => {
  return (
    <div className="bg-white rounded-3xl p-8 border border-mint-100 shadow-soft text-center flex flex-col items-center justify-center my-6 max-w-lg mx-auto">
      <div className="bg-mint-50 p-4 rounded-full mb-4 ring-8 ring-mint-50/50">
        <MascotRobot mode={robotMode} size={64} className="w-16 h-16" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{description}</p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-mint-glow transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
