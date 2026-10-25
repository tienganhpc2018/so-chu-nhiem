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
              QUY TRÌNH CHƠI VERSION GỐC:
            </h4>

            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xl">🎲</span>
              <div>
                <strong className="block text-slate-900 text-xs sm:text-sm">1. Quay chọn tên ngẫu nhiên</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  Khi bắt đầu, hệ thống kích hoạt màn hình quay tên <strong>"🎯 AI SẼ GỌI AI?"</strong> với hiệu ứng lướt nhanh tên cả lớp và khóa tên người may mắn: 🔔 <strong>"LÝ HỒNG THƯƠNG!"</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xl">🦆</span>
              <div>
                <strong className="block text-slate-900 text-xs sm:text-sm">2. Đàn vịt 3D chạy tán loạn trong sân</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  Đàn vịt 20–30 con với 8 màu lông đa dạng ùa vào sân đất nén 3D bao quanh bởi hàng rào tre, liên tục chạy tản ra, tụ lại và né tránh người chơi.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xl">🏃</span>
              <div>
                <strong className="block text-slate-900 text-xs sm:text-sm">3. Người chơi bịt mắt rượt đuổi</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  Cậu bé áo bà ba nón lá bịt mắt dải lụa đỏ tiến vào giữa đàn vịt. Khi đến gần, đàn vịt hoảng sợ quác quác tạt sang hai bên cực kỳ phấn khích!
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xl">✋</span>
              <div>
                <strong className="block text-slate-900 text-xs sm:text-sm">4. Bắt vịt & Camera Zoom Focus</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  Nhấn nút <strong>"✋ BẮT VỊT NGAY!"</strong> hoặc đợi hết thời gian 20s, người chơi sẽ lao tới tóm gọn chú vịt. Camera lập tức phóng to focus vào vịt kèm ánh sáng spotlight và pháo hoa rực rỡ!
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xl">🎉</span>
              <div>
                <strong className="block text-slate-900 text-xs sm:text-sm">5. Công bố học sinh & Gọi bạn tiếp theo</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  Màn hình vinh danh lớn ở giữa hiện rõ avatar và họ tên học sinh, phát âm thanh đọc tên và Thầy có thể cộng điểm nề nếp trực tiếp, sau đó nhấn <strong>"Gọi bạn tiếp theo"</strong> để tiếp tục chuỗi quay cả lớp!
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
