import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Check,
  Save,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions';
import { soundFx } from '../../../utils/soundEffects';

export const QuestionManagerModal = ({
  isOpen,
  onClose,
  questions = [],
  onSaveQuestions,
  onSelectQuestionIndex,
  currentSelectedIndex = 0
}) => {
  const [localQuestions, setLocalQuestions] = useState(
    questions.length > 0 ? questions : DEFAULT_QUESTIONS
  );
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: ''
  });

  if (!isOpen) return null;

  // Bắt đầu sửa câu hỏi
  const handleStartEdit = (q) => {
    soundFx.playClick();
    setEditingId(q.id);
    setFormData({
      question: q.question || '',
      options: q.options ? [...q.options] : ['', '', '', ''],
      correctIndex: q.correctIndex ?? q.correct ?? 0,
      explanation: q.explanation || ''
    });
  };

  // Thêm câu hỏi mới
  const handleAddNew = () => {
    soundFx.playClick();
    const newId = `q-${Date.now()}`;
    const newQ = {
      id: newId,
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: ''
    };
    setLocalQuestions(prev => [newQ, ...prev]);
    setEditingId(newId);
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: ''
    });
  };

  // Lưu câu hỏi đang sửa
  const handleSaveItem = () => {
    if (!formData.question.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    soundFx.playCorrect();
    const updated = localQuestions.map(q => {
      if (q.id === editingId) {
        return {
          ...q,
          question: formData.question.trim(),
          options: formData.options.map(opt => opt.trim() || '...'),
          correctIndex: formData.correctIndex,
          correct: formData.correctIndex,
          explanation: formData.explanation.trim()
        };
      }
      return q;
    });

    setLocalQuestions(updated);
    onSaveQuestions?.(updated);
    setEditingId(null);
  };

  // Xóa câu hỏi
  const handleDeleteItem = (id) => {
    soundFx.playClick();
    const updated = localQuestions.filter(q => q.id !== id);
    setLocalQuestions(updated);
    onSaveQuestions?.(updated);
    if (editingId === id) setEditingId(null);
  };

  // Nạp lại bộ câu hỏi mẫu
  const handleResetDefault = () => {
    if (window.confirm('Thầy có muốn nạp lại bộ câu hỏi Tiếng Anh THCS chuẩn ban đầu?')) {
      soundFx.playCorrect();
      setLocalQuestions(DEFAULT_QUESTIONS);
      onSaveQuestions?.(DEFAULT_QUESTIONS);
      setEditingId(null);
    }
  };

  // Chọn câu hỏi này cho lượt hỏi hiện tại
  const handleChooseQuestion = (idx) => {
    soundFx.playClick();
    onSelectQuestionIndex?.(idx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-purple-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              📚
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight">
                CẤU HÌNH CÂU HỎI TRẮC NGHIỆM TIẾNG ANH
              </h3>
              <p className="text-xs text-purple-100 font-bold mt-0.5">
                Tạo, chỉnh sửa và lựa chọn câu hỏi cho học sinh về nhất
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-xl transition-all text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="text-xs font-black text-slate-700">
            Hiện có <span className="text-purple-600 font-black">{localQuestions.length}</span> câu hỏi
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleResetDefault}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-2xs"
              title="Khôi phục câu hỏi mẫu THCS"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Nạp mẫu chuẩn</span>
            </button>

            <button
              type="button"
              onClick={handleAddNew}
              className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm câu hỏi mới</span>
            </button>
          </div>
        </div>

        {/* Nội dung danh sách câu hỏi */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {localQuestions.map((q, idx) => {
            const isEditing = editingId === q.id;
            const isSelected = currentSelectedIndex === idx;
            const correctIdx = q.correctIndex ?? q.correct ?? 0;

            if (isEditing) {
              return (
                <div key={q.id} className="p-4 bg-purple-50/60 border-2 border-purple-300 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-700 uppercase">
                      Đang chỉnh sửa câu hỏi #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600"
                    >
                      Huỷ bỏ
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-600 block mb-1">
                      Nội dung câu hỏi:
                    </label>
                    <textarea
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      placeholder="Ví dụ: What is the opposite of 'generous'?"
                      className="w-full p-2.5 text-xs font-bold border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white resize-none"
                      rows={2}
                    />
                  </div>

                  {/* 4 Đáp án A B C D */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-600 block">
                      4 Lựa chọn (Bấm vào chữ A/B/C/D để chọn đáp án đúng):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                        <div key={optIdx} className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, correctIndex: optIdx })}
                            className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 transition-all ${
                              formData.correctIndex === optIdx
                                ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-300'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300'
                            }`}
                            title="Chọn đây là đáp án đúng"
                          >
                            {letter}
                          </button>
                          <input
                            type="text"
                            value={formData.options[optIdx] || ''}
                            onChange={(e) => {
                              const newOpts = [...formData.options];
                              newOpts[optIdx] = e.target.value;
                              setFormData({ ...formData, options: newOpts });
                            }}
                            placeholder={`Phương án ${letter}`}
                            className="flex-1 p-2 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Giải thích */}
                  <div>
                    <label className="text-[11px] font-black text-slate-600 block mb-1">
                      Lời giải thích khi học sinh trả lời (Tùy chọn):
                    </label>
                    <input
                      type="text"
                      value={formData.explanation}
                      onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                      placeholder="Ví dụ: 'Generous' trái nghĩa với 'selfish'..."
                      className="w-full p-2 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                    />
                  </div>

                  {/* Nút lưu câu hỏi */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSaveItem}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-md transition-all active:scale-95"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu thay đổi</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={q.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      {q.question || <span className="italic text-slate-400">Chưa có nội dung</span>}
                    </h4>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pl-7">
                    {(q.options || []).map((opt, optIdx) => {
                      const isCorrect = optIdx === correctIdx;
                      return (
                        <span
                          key={optIdx}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span className="font-black">{['A', 'B', 'C', 'D'][optIdx]}:</span>
                          <span>{opt || '...'}</span>
                          {isCorrect && <Check className="w-2.5 h-2.5 text-emerald-600 inline" />}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center pl-7 sm:pl-0">
                  <button
                    type="button"
                    onClick={() => handleChooseQuestion(idx)}
                    className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-xl text-xs font-black transition-all flex items-center space-x-1"
                    title="Chọn ngay câu này để hỏi học sinh"
                  >
                    <span>Chọn câu này</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(q)}
                    className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                    title="Chỉnh sửa câu hỏi"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(q.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title="Xóa câu hỏi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {localQuestions.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs font-bold">
              Chưa có câu hỏi nào. Thầy vui lòng bấm &ldquo;Thêm câu hỏi mới&rdquo; hoặc &ldquo;Nạp mẫu chuẩn&rdquo;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
          <span className="text-[11px] text-slate-400 font-bold">
            💡 Câu hỏi được lưu tự động trong suốt buổi học
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black transition-all"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
