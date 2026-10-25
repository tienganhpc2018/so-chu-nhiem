import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Trophy, Volume2, UserCheck, Play, ArrowRight, Dices } from 'lucide-react';
import confetti from 'canvas-confetti';
import { duckAudio } from '../services/duckAudio';

/**
 * PHASE 2 - GỌI TÊN NGẪU NHIÊN (RandomNamePicker)
 * Cơ chế quay chọn học sinh ngẫu nhiên chuẩn 100% theo Version Gốc:
 * - Hiệu ứng lướt nhanh tên học sinh qua màn hình
 * - Giảm tốc dần đều (Deceleration easing) kèm tiếng tick... tick... tick...
 * - Dừng lại & khóa tên chớp sáng: 🔔 "LÝ HỒNG THƯƠNG!"
 * - Phát âm thanh chúc mừng & Web Speech API đọc to tên
 * - Chuyển tiếp mượt mà vào sân chơi đàn vịt rượt đuổi
 */
export const DuckRandomNamePicker = ({
  students = [],
  calledIds = [],
  noRepeat = true,
  enableTts = true,
  onNameSelected,
  onCancel
}) => {
  // Lọc danh sách học sinh đủ điều kiện (nếu bật "Không lặp", trừ các bạn đã gọi)
  const eligibleStudents = React.useMemo(() => {
    if (!students || students.length === 0) {
      return [
        { id: 'st_1', name: 'Lý Hồng Thương', avatar: null },
        { id: 'st_2', name: 'Nguyễn Minh', avatar: null },
        { id: 'st_3', name: 'Trần Duy', avatar: null },
        { id: 'st_4', name: 'Lê Thảo', avatar: null },
        { id: 'st_5', name: 'Phạm Bảo', avatar: null },
        { id: 'st_6', name: 'Ngô Ngọc Diệp', avatar: null },
        { id: 'st_7', name: 'Vũ Quang', avatar: null },
        { id: 'st_8', name: 'Đặng Mai', avatar: null },
        { id: 'st_9', name: 'Hoàng Lan Phương', avatar: null }
      ];
    }
    if (noRepeat) {
      const remaining = students.filter(s => !calledIds.includes(s.id));
      return remaining.length > 0 ? remaining : students; // Nếu hết danh sách thì cho quay lại toàn bộ
    }
    return students;
  }, [students, calledIds, noRepeat]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRolling, setIsRolling] = useState(true);
  const [lockedStudent, setLockedStudent] = useState(null);
  const [countdownAuto, setCountdownAuto] = useState(null);

  const rollIntervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (eligibleStudents.length === 0) return;

    // Chọn ngẫu nhiên một bạn học sinh đích thực sự (không phụ thuộc thứ tự)
    const finalWinnerIndex = Math.floor(Math.random() * eligibleStudents.length);
    const finalWinner = eligibleStudents[finalWinnerIndex];

    let currentSpeed = 35; // Tốc độ ban đầu (ms/tên)
    let elapsed = 0;
    const totalSpinTime = 2800; // Tổng thời gian quay khoảng 2.8 giây
    let idx = Math.floor(Math.random() * eligibleStudents.length);

    const spin = () => {
      idx = (idx + 1) % eligibleStudents.length;
      setCurrentIndex(idx);
      duckAudio.playTick();

      elapsed += currentSpeed;

      // Giảm dần tốc độ theo hàm mũ
      if (elapsed < totalSpinTime * 0.5) {
        currentSpeed = 40;
      } else if (elapsed < totalSpinTime * 0.75) {
        currentSpeed = 75;
      } else if (elapsed < totalSpinTime * 0.9) {
        currentSpeed = 140;
      } else if (elapsed < totalSpinTime) {
        currentSpeed = 240;
      } else {
        // Khóa học sinh chiến thắng
        setCurrentIndex(finalWinnerIndex);
        setIsRolling(false);
        setLockedStudent(finalWinner);
        duckAudio.playLockName();

        // Nổ pháo hoa chúc mừng
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        // Tự động chuyển vào sân chơi sau 2 giây
        let cd = 2;
        setCountdownAuto(cd);
        const cdTimer = setInterval(() => {
          cd -= 1;
          setCountdownAuto(cd);
          if (cd <= 0) {
            clearInterval(cdTimer);
            onNameSelected?.(finalWinner);
          }
        }, 1000);

        return;
      }

      timeoutRef.current = setTimeout(spin, currentSpeed);
    };

    timeoutRef.current = setTimeout(spin, currentSpeed);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [eligibleStudents, enableTts]);

  const currentStudent = lockedStudent || eligibleStudents[currentIndex] || eligibleStudents[0];
  const displayName = currentStudent?.name || currentStudent?.full_name || 'Học sinh';
  const displayAvatar = currentStudent?.avatar || currentStudent?.avatar_url;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in select-none">
      {/* Vòng sáng hào quang nền */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-500/20 via-yellow-400/10 to-orange-500/20 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 rounded-3xl p-6 sm:p-8 border-2 border-amber-400/50 shadow-2xl shadow-amber-500/20 text-center overflow-hidden">
        
        {/* Tia sáng quét trang trí phía trên */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-24 bg-gradient-to-b from-amber-400/30 to-transparent blur-xl pointer-events-none" />

        {/* 1. Header Gọi tên */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-widest uppercase mb-4 shadow-sm animate-pulse">
          <Dices className="w-4 h-4 text-amber-400" />
          <span>{isRolling ? 'ĐANG QUAY TÊN NGẪU NHIÊN...' : 'ĐÃ CHỌN ĐƯỢC MỤC TIÊU!'}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center space-x-2">
          <span>🎯</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-400">
            {isRolling ? 'AI SẼ BỊ BẮT ĐÂY?' : 'GỌI TÊN HỌC SINH!'}
          </span>
        </h2>

        <p className="text-xs text-amber-200/70 font-medium mt-1 mb-6">
          {isRolling
            ? 'Vòng quay đang chọn ngẫu nhiên một chú vịt trong lớp...'
            : 'Hãy quan sát đàn vịt chạy trốn và bắt đúng chú vịt này!'}
        </p>

        {/* 2. KHUNG QUAY TÊN 3D NỔI BẬT */}
        <div
          className={`relative p-6 sm:p-7 rounded-3xl border-3 transition-all duration-300 flex flex-col items-center justify-center ${
            lockedStudent
              ? 'bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-red-500/30 border-amber-400 shadow-2xl shadow-amber-500/40 scale-105 animate-bounce-short'
              : 'bg-black/50 border-amber-400/30 shadow-inner'
          }`}
        >
          {/* Avatar học sinh */}
          <div className="relative mb-3">
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 flex items-center justify-center overflow-hidden shadow-xl transition-all ${
                lockedStudent
                  ? 'border-yellow-300 ring-4 ring-amber-400/50 scale-110 bg-amber-100'
                  : 'border-amber-400/40 bg-slate-800'
              }`}
            >
              {displayAvatar ? (
                <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl sm:text-4xl">🦆</span>
              )}
            </div>

            {lockedStudent && (
              <div className="absolute -bottom-2 -right-1 bg-gradient-to-r from-red-600 to-amber-500 text-white p-1.5 rounded-full border-2 border-yellow-300 shadow-md animate-bounce">
                <Sparkles className="w-4 h-4 text-yellow-200 fill-yellow-200" />
              </div>
            )}
          </div>

          {/* TÊN HỌC SINH CHẠY NHANH HOẶC KHÓA TÊN */}
          <div className="min-h-[3.2rem] flex items-center justify-center px-4">
            <span
              className={`font-black tracking-tight transition-all uppercase ${
                lockedStudent
                  ? 'text-2xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 filter drop-shadow-[0_2px_10px_rgba(234,179,8,0.8)] scale-105'
                  : 'text-xl sm:text-2xl text-amber-200/90'
              }`}
            >
              {displayName}
            </span>
          </div>

          {/* Huy hiệu trạng thái */}
          <div className="mt-2">
            {lockedStudent ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[11px] font-black">
                <UserCheck className="w-3.5 h-3.5" />
                <span>MỤC TIÊU ĐÃ ĐƯỢC CHỌN!</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-bold animate-pulse">
                ⏳ Đang đảo tên {eligibleStudents.length} học sinh...
              </span>
            )}
          </div>
        </div>

        {/* 3. Nút hành động */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {lockedStudent ? (
            <button
              onClick={() => onNameSelected?.(lockedStudent)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white font-black text-sm sm:text-base shadow-xl shadow-orange-500/30 flex items-center justify-center space-x-2 active:scale-95 transition-all animate-pulse"
            >
              <span>VÀO SÂN BẮT VỊT NGAY</span>
              <ArrowRight className="w-5 h-5 ml-1" />
              {countdownAuto !== null && countdownAuto > 0 && (
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-black/40">
                  ({countdownAuto}s)
                </span>
              )}
            </button>
          ) : (
            <button
              disabled
              className="px-6 py-3 rounded-2xl bg-slate-800 text-slate-400 font-extrabold text-xs flex items-center justify-center space-x-2 cursor-wait"
            >
              <span>ĐANG TÌM HỌC SINH...</span>
            </button>
          )}

          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Hủy lượt
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
