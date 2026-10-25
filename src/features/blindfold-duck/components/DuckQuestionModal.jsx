import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Sparkles, Award } from 'lucide-react';
import { duckAudio } from '../services/duckAudio';

export const DuckQuestionModal = ({
  question,
  duckName = 'chú vịt',
  combo = 1,
  onAnswer
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!question) return null;

  const handleSelect = (key) => {
    if (isSubmitted) return;
    setSelectedOption(key);
    setIsSubmitted(true);

    const isCorrect = key === question.correct_answer;
    if (isCorrect) {
      duckAudio.playCorrect();
    } else {
      duckAudio.playWrong();
    }
  };

  const handleContinue = () => {
    const isCorrect = selectedOption === question.correct_answer;
    onAnswer?.({
      isCorrect,
      points: isCorrect ? (question.points || 10) * combo : 0,
      selectedAnswer: selectedOption,
      questionId: question.id
    });
  };

  const options = [
    { key: 'A', text: question.option_a },
    { key: 'B', text: question.option_b },
    { key: 'C', text: question.option_c },
    { key: 'D', text: question.option_d }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-400 overflow-hidden">
        {/* Banner đầu modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🦆</span>
            <div>
              <span className="text-xs font-black text-amber-600 uppercase tracking-wider block">
                BẮT ĐƯỢC BẠN: {duckName.toUpperCase()}
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Thử Thách Tiếng Anh 🎯
              </h3>
            </div>
          </div>

          {/* Combo badge */}
          {combo > 1 && (
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-xs shadow-md shadow-orange-200 animate-pulse flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMBO x{combo}!</span>
            </div>
          )}
        </div>

        {/* Nội dung câu hỏi */}
        <div className="my-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
          <p className="text-base sm:text-lg font-extrabold text-slate-900 leading-relaxed">
            {question.question}
          </p>
        </div>

        {/* Danh sách 4 lựa chọn A, B, C, D */}
        <div className="grid grid-cols-1 gap-2.5">
          {options.map(({ key, text }) => {
            const isCorrect = key === question.correct_answer;
            const isSelected = selectedOption === key;

            let btnStyle = 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 text-slate-800';
            if (isSubmitted) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-200 font-black';
              } else if (isSelected) {
                btnStyle = 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-200 font-black';
              } else {
                btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
              }
            }

            return (
              <button
                key={key}
                disabled={isSubmitted}
                onClick={() => handleSelect(key)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border-2 font-bold text-sm sm:text-base transition-all active:scale-98 text-left ${btnStyle}`}
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                      isSubmitted && isCorrect
                        ? 'bg-white text-emerald-600'
                        : isSubmitted && isSelected
                        ? 'bg-white text-rose-600'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {key}
                  </span>
                  <span>{text}</span>
                </div>

                {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-white shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Giải thích ngữ pháp khi đã chọn đáp án */}
        {isSubmitted && (
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs sm:text-sm animate-fade-in">
            <span className="font-black text-slate-800 block mb-0.5">
              {selectedOption === question.correct_answer ? '🎉 CHÍNH XÁC!' : '❌ CHƯA ĐÚNG!'}
            </span>
            <span className="text-slate-600 font-medium">{question.explanation}</span>
          </div>
        )}

        {/* Nút Tiếp tục */}
        {isSubmitted && (
          <div className="mt-5 flex justify-end">
            <button
              onClick={handleContinue}
              className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-lg shadow-amber-200 hover:scale-105 active:scale-95 transition-all"
            >
              <span>TIẾP TỤC BẮT VỊT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
