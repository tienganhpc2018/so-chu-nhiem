import React from 'react';
import { X, CheckCircle, Award, Volume2, ShieldAlert, Sparkles, Clock, Target } from 'lucide-react';

export const DuckRulesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-400 max-h-[92vh] overflow-y-auto">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-md shadow-amber-200">
            🦆
          </div>
          <div>
            <span className="text-xs font-black text-amber-600 uppercase tracking-widest block">
              Trò Chơi Dân Gian Học Tập
            </span>
            <h3 className="text-xl font-black text-slate-900 leading-tight">
              Luật Chơi: Bịt Mắt Bắt Vịt Trả Bài
            </h3>
          </div>
        </div>

        {/* Nội dung luật */}
        <div className="my-5 space-y-3.5 text-sm text-slate-700">
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200">
            <h4 className="font-black text-amber-900 mb-1 flex items-center space-x-1.5 text-xs sm:text-sm">
              <span>🌾</span>
              <span>Ý NGHĨA TRÒ CHƠI</span>
            </h4>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-medium">
              "Bịt Mắt Bắt Vịt" tái hiện trò chơi dân gian hội làng Việt Nam. Các chú vịt con trắng muốt chính là các bạn học sinh trong lớp. Thầy cô dùng trò chơi để tạo không khí sôi động, công bằng và hào hứng trong các giờ kiểm tra bài cũ môn Tiếng Anh!
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">
              QUY TRÌNH THI ĐẤU & TRẢ BÀI:
            </h4>

            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xl">🦆</span>
              <div>
                <strong className="block text-slate-900 text-xs sm:text-sm">1. 9 Chú Vịt tham gia mỗi lượt chạy</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  Trên sân đất nén 2.5D luôn có 9 chú vịt đại diện cho các bạn học sinh trong lớp, chạy vòng quanh sân, vỗ cánh và tung tăng né tránh người bịt mắt.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xl">⏱️</span>
              <div>
                <strong className="block text-slate-900 text-xs sm:text-sm">2. Thời gian đếm ngược 20s hoặc 30s</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  Mỗi lượt chơi kéo dài 20 hoặc 30 giây rượt đuổi kịch tính. Người chơi có thể tự điều khiển bằng phím <strong>W/A/S/D / Mũi tên / Chuột</strong> hoặc để chú bé bịt mắt tự động lần theo tiếng kêu quác quác.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xl">✋</span>
              <div>
                <strong className="block text-slate-900 text-xs sm:text-sm">3. Hết giờ (hoặc bắt trúng) $\to$ Tóm 1 chú vịt</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  Khi đồng hồ về 0s hoặc khi nhấn phím <strong>Cách (Space) / Nút Bắt Vịt</strong> thành công, người bịt mắt sẽ tóm được 1 chú vịt may mắn.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xl">🎯</span>
              <div>
                <strong className="block text-slate-900 text-xs sm:text-sm">4. Học sinh đứng lên trả bài</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  Màn hình trả bài hiện ra với tên đầy đủ của học sinh. Thầy có thể cho học sinh trả lời câu hỏi trắc nghiệm tiếng Anh hoặc kiểm tra miệng và chấm điểm trực tiếp (10 Điểm, 8-9 Điểm, Chưa thuộc).
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xl">🔄</span>
              <div>
                <strong className="block text-slate-900 text-xs sm:text-sm">5. Tự động luân chuyển cả lớp</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  Sau khi trả bài xong, hệ thống đưa các bạn học sinh tiếp theo vào sân cho đến khi tất cả các bạn trong lớp đều được tham gia vui vẻ!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nút Đã hiểu */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-md shadow-amber-200 active:scale-95 transition-all"
          >
            ĐÃ HIỂU LUẬT CHƠI
          </button>
        </div>
      </div>
    </div>
  );
};
