import React from 'react';
import { X, CheckCircle, Award, Volume2, ShieldAlert } from 'lucide-react';

export const DuckRulesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-400 max-h-[90vh] overflow-y-auto">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề */}
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
          <span className="text-3xl">📜</span>
          <div>
            <span className="text-xs font-black text-amber-600 uppercase tracking-widest block">
              Trò Chơi Dân Gian Việt Nam
            </span>
            <h3 className="text-xl font-black text-slate-900 leading-tight">
              Luật Chơi: Bịt Mắt Bắt Vịt 🦆
            </h3>
          </div>
        </div>

        {/* Nội dung luật */}
        <div className="my-5 space-y-4 text-sm text-slate-700">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
            <h4 className="font-black text-amber-900 mb-1 flex items-center space-x-1.5">
              <span>🌾</span>
              <span>Ý nghĩa trò chơi</span>
            </h4>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-medium">
              "Bịt mắt bắt vịt" là trò chơi dân gian truyền thống gắn liền với các lễ hội làng quê Việt Nam. Trong LMS, các chú vịt hóa thân thành các bạn học sinh trong lớp, vừa rèn luyện khả năng tập trung thính giác, vừa ôn tập tiếng Anh hào hứng!
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-slate-900 text-sm uppercase tracking-wide">
              Quy tắc thi đấu:
            </h4>

            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-lg">🙈</span>
              <div>
                <strong className="block text-slate-900 text-xs sm:text-sm">1. Khăn bịt mắt lụa đỏ</strong>
                <p className="text-xs text-slate-600">
                  Người chơi bịt mắt lụa đỏ và di chuyển bằng phím <strong>W/A/S/D</strong> hoặc <strong>Mũi tên</strong> (hoặc nút cảm ứng trên điện thoại).
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-lg">🔊</span>
              <div>
                <strong className="block text-slate-900 text-xs sm:text-sm">2. Lắng nghe âm thanh định vị</strong>
                <p className="text-xs text-slate-600">
                  Các chú vịt phát ra tiếng quạc và lời thoại học đường. Âm thanh Stereo tai trái/phải và độ to nhỏ sẽ giúp bạn xác định vị trí chú vịt đang ở đâu.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-lg">✋</span>
              <div>
                <strong className="block text-slate-900 text-xs sm:text-sm">3. Nhấn Bắt Vịt (Phím Space)</strong>
                <p className="text-xs text-slate-600">
                  Khi đến đủ gần chú vịt (khoảng cách &lt; 65px), nút <strong>✋ BẮT VỊT</strong> sẽ sáng lên. Nhấn để tóm gọn chú vịt nhận điểm (+10)!
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-lg">🎯</span>
              <div>
                <strong className="block text-slate-900 text-xs sm:text-sm">4. Thử thách câu hỏi Tiếng Anh</strong>
                <p className="text-xs text-slate-600">
                  Trong chế độ Học Tiếng Anh, mỗi lần bắt được một chú vịt, câu hỏi trắc nghiệm sẽ hiện ra. Trả lời đúng để nhân đôi/gấp ba điểm với COMBO!
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
