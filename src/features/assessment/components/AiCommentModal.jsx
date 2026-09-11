import React, { useState } from 'react';
import { X, Sparkles, Check, Bot, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../../utils/soundEffects';

export const AiCommentModal = ({
  isOpen,
  onClose,
  currentSubject = 'Tiếng Anh',
  totalStudents = 0,
  onApplyAiComments
}) => {
  const [targetScope, setTargetScope] = useState('all'); // 'all' | 'empty_only'
  const [commentStyle, setCommentStyle] = useState('standard'); // 'standard' | 'short' | 'detailed'
  const [generating, setGenerating] = useState(false);

  if (!isOpen) return null;

  const handleStartGenerate = () => {
    soundFx.playClick();
    setGenerating(true);

    setTimeout(() => {
      onApplyAiComments?.({ scope: targetScope, style: commentStyle });
      setGenerating(false);
      soundFx.playFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-6 sm:p-8 border border-teal-100 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-teal-600 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-teal-200">
              <Sparkles className="w-6 h-6 text-amber-200 fill-amber-200" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">
                AI Tự Động Nhận Xét Học Sinh
              </h3>
              <p className="text-xs text-slate-400 font-bold">
                Chuẩn Thông tư 22/2021 • Môn {currentSubject}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-2xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4">
          
          {/* Target Scope */}
          <div>
            <label className="text-xs font-black text-slate-700 block mb-2">
              1. Áp dụng nhận xét cho:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTargetScope('all')}
                className={`p-3 rounded-2xl text-left border-2 transition-all ${
                  targetScope === 'all'
                    ? 'border-teal-600 bg-teal-50/70 text-teal-950'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-xs font-black block">Tất cả {totalStudents} học sinh</span>
                <span className="text-[10px] text-slate-500">Cập nhật toàn bộ lớp</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetScope('empty_only')}
                className={`p-3 rounded-2xl text-left border-2 transition-all ${
                  targetScope === 'empty_only'
                    ? 'border-teal-600 bg-teal-50/70 text-teal-950'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-xs font-black block">Chưa có nhận xét</span>
                <span className="text-[10px] text-slate-500">Giữ nguyên lời cũ</span>
              </button>
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="text-xs font-black text-slate-700 block mb-2">
              2. Phong cách lời nhận xét:
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'standard',
                  title: 'Chuẩn Thông tư 22 (Khuyên Dùng)',
                  desc: 'Nêu rõ ưu điểm, kỹ năng tốt, hạn chế và biện pháp rèn luyện.'
                },
                {
                  id: 'short',
                  title: 'Ngắn gọn, súc tích (Chuẩn VnEdu / SMAS)',
                  desc: 'Câu từ cô đọng, dễ nhập vào sổ điểm điện tử giới hạn ký tự.'
                },
                {
                  id: 'detailed',
                  title: 'Chi tiết & Động viên sâu sắc',
                  desc: 'Nhận xét cụ thể phương hướng phát triển và lời khuyên truyền cảm hứng.'
                }
              ].map(st => (
                <div
                  key={st.id}
                  onClick={() => setCommentStyle(st.id)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-3 ${
                    commentStyle === st.id
                      ? 'border-teal-600 bg-teal-50/70 text-teal-950'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                    commentStyle === st.id ? 'border-teal-600 bg-teal-600' : 'border-slate-300'
                  }`}>
                    {commentStyle === st.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="text-xs font-black block leading-snug">{st.title}</span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">{st.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
          >
            Đóng
          </button>
          
          <button
            type="button"
            onClick={handleStartGenerate}
            disabled={generating || totalStudents === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md shadow-teal-200 flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-200 fill-amber-200" />
            <span>{generating ? 'AI Đang Phân Tích Điểm...' : 'BẮT ĐẦU SINH NHẬN XÉT'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
