import React, { useEffect } from 'react';
import { Award, RotateCcw, ArrowRight, Star, Plus, CheckCircle, Volume2, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { duckAudio } from '../services/duckAudio';

/**
 * PHASE 5 - KẾT QUẢ GỌI TÊN HỌC SINH (DuckCaughtResultModal)
 * Hiển thị card vinh danh to ở giữa màn hình chuẩn 100% theo Version Gốc:
 * - Ảnh học sinh (Avatar thật từ LMS hoặc avatar mặc định)
 * - Tên học sinh hiển thị lớn, rõ ràng, không bị che khuất
 * - Web Speech API đọc to chúc mừng
 * - Pháo hoa rực rỡ + nút bấm Gọi tiếp học sinh tiếp theo cực nhanh
 * - Tích hợp cộng điểm nề nếp trực tiếp nếu Thầy muốn
 */
export const DuckCaughtResultModal = ({
  caughtStudent,
  mode = 'random_call',
  isTargetMatch = true,
  enableTts = true,
  onNextRound,
  onClose,
  onAwardPoints
}) => {
  if (!caughtStudent) return null;

  const displayName = caughtStudent.name || caughtStudent.full_name || 'Học sinh may mắn';
  const displayAvatar = caughtStudent.avatar || caughtStudent.avatar_url;

  useEffect(() => {
    // Nổ pháo hoa ăn mừng
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.55 }
      });
    } catch (e) {}
  }, [caughtStudent, displayName]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      {/* Vòng hào quang sáng vàng nền */}
      <div className="absolute w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-yellow-400/20 via-amber-500/15 to-orange-500/20 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-400 text-center overflow-hidden animate-scale-up">
        
        {/* Nút đóng góc phải */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
          title="Đóng popup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Tiêu đề BẮT ĐƯỢC RỒI! */}
        <div className="inline-flex items-center space-x-1.5 px-4 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-black uppercase tracking-wider mb-2">
          <span>🦆</span>
          <span>{isTargetMatch ? 'BẮT ĐƯỢC RỒI!' : 'ĐÃ TÓM ĐƯỢC MỤC TIÊU!'}</span>
          <span>🎉</span>
        </div>

        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          🎉 BẮT ĐƯỢC RỒI!
        </h2>

        <p className="text-xs text-slate-500 font-semibold mt-1 mb-5">
          {mode === 'target' && !isTargetMatch
            ? 'Rất tiếc chưa đúng mục tiêu, hãy thử lại bạn khác!'
            : 'Chúc mừng bạn đã may mắn được chọn lên bảng!'}
        </p>

        {/* 2. KHUNG AVATAR LỚN & TÊN HỌC SINH (Chuẩn Version Gốc) */}
        <div className="relative my-3 p-5 rounded-3xl bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100/50 border-2 border-amber-300 flex flex-col items-center shadow-inner">
          
          {/* Avatar học sinh */}
          <div className="relative mb-3">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-400 ring-4 ring-yellow-300/60 shadow-xl overflow-hidden bg-white flex items-center justify-center">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-amber-200 to-yellow-100 flex items-center justify-center text-5xl">
                  🦆
                </div>
              )}
            </div>

            {/* Huy hiệu vương miện */}
            <div className="absolute -bottom-2 right-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white p-1.5 rounded-full border-2 border-white shadow-md">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
          </div>

          {/* TÊN HỌC SINH TO RÕ RÀNG */}
          <span className="text-xs font-black text-amber-700 uppercase tracking-widest block mb-0.5">
            HỌC SINH ĐƯỢC CHỌN
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase">
            {displayName}
          </h3>

          <div className="mt-2 text-xs font-bold text-amber-900/80 bg-amber-200/60 px-3 py-1 rounded-full border border-amber-300">
            Mời bạn đứng dậy trả bài hoặc nhận thử thách! 🙋‍♂️
          </div>
        </div>

        {/* 3. Tùy chọn cộng điểm nề nếp nhanh cho học sinh */}
        {onAwardPoints && (
          <div className="my-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left">
            <span className="text-[11px] font-black text-slate-500 uppercase block mb-1.5">
              GHI NHẬN ĐIỂM NỀ NẾP (LMS):
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onAwardPoints(caughtStudent.id, 2, 'Trả bài tốt')}
                className="flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-black text-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+2 Điểm</span>
              </button>
              <button
                onClick={() => onAwardPoints(caughtStudent.id, 5, 'Xuất sắc')}
                className="flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 font-black text-xs transition-all active:scale-95"
              >
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>+5 Xuất sắc</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. Các nút hành động chính */}
        <div className="mt-5 space-y-2">
          <button
            onClick={onNextRound}
            className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white font-black text-sm sm:text-base shadow-xl shadow-orange-500/30 active:scale-95 transition-all"
          >
            <span>🎲 GỌI BẠN TIẾP THEO</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors"
          >
            Về màn hình chính (Lobby)
          </button>
        </div>

      </div>
    </div>
  );
};
