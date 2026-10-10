import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Award,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions';
import { soundFx } from '../../../utils/soundEffects';

export const RaceQuestionModal = ({
  isOpen,
  onClose,
  winner,
  onRewardStudent
}) => {
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  if (!isOpen || !winner) return null;

  const currentQ = DEFAULT_QUESTIONS[qIndex % DEFAULT_QUESTIONS.length];

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    soundFx.playClick();
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      soundFx.playCorrect();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      soundFx.playDeduct();
    }
  };

  const handleNextQuestion = () => {
    soundFx.playClick();
    setQIndex(prev => prev + 1);
    setSelectedOption(null);
    setIsAnswered(false);
    setRewardClaimed(false);
  };

  const handleClaimReward = () => {
    soundFx.playCorrect();
    setRewardClaimed(true);
    onRewardStudent?.(winner.id, 2, 'Trả lời đúng câu hỏi sau Đua Bi');
  };

  const isCorrect = selectedOption === currentQ.correctIndex;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-indigo-100 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
              🎓
            </div>
            <div>
              <h3 className="text-base font-black leading-tight">
                Câu Hỏi Nhanh — {winner.name}
              </h3>
              <p className="text-xs text-indigo-100 font-bold mt-0.5">
                Người về nhất thử thách kiểm tra kiến thức
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

        {/* Nội dung câu hỏi */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Huy hiệu số thứ tự */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-black">
              Câu {qIndex + 1}/{DEFAULT_QUESTIONS.length}
            </span>
            <span className="text-xs font-bold text-slate-400">
              Chủ đề: Tiếng Anh THCS
            </span>
          </div>

          {/* Câu hỏi */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <h4 className="text-sm sm:text-base font-black text-slate-800 leading-relaxed">
              {currentQ.question}
            </h4>
          </div>

          {/* 4 Phương án */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isSelected = selectedOption === idx;
              const isThisCorrect = idx === currentQ.correctIndex;

              let btnStyle = 'border-slate-200 hover:border-indigo-400 bg-white text-slate-700';
              if (isAnswered) {
                if (isThisCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm';
                } else if (isSelected) {
                  btnStyle = 'border-rose-500 bg-rose-50 text-rose-900';
                } else {
                  btnStyle = 'border-slate-200 opacity-50 bg-white text-slate-400';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between text-left font-extrabold text-xs sm:text-sm ${btnStyle}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black shrink-0 text-slate-700">
                      {letter}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswered && isThisCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isThisCorrect && (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Giải thích sau khi trả lời */}
          {isAnswered && (
            <div className={`p-3.5 rounded-2xl border text-xs font-bold animate-in fade-in ${
              isCorrect ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}>
              <div className="font-black mb-1">
                {isCorrect ? '🎉 Chính xác!' : '💡 Giải thích chi tiết:'}
              </div>
              <p>{currentQ.explanation}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
          <button
            type="button"
            onClick={handleNextQuestion}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Câu tiếp theo</span>
          </button>

          <div className="flex items-center space-x-2">
            {isAnswered && isCorrect && !rewardClaimed && (
              <button
                type="button"
                onClick={handleClaimReward}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black shadow-md flex items-center space-x-1.5 transition-all transform hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+2 Sao Thưởng</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all"
            >
              Hoàn tất
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
