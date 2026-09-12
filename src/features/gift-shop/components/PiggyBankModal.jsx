import React, { useState, useEffect, useMemo } from 'react';
import { X, TrendingUp, ArrowDownRight, ArrowUpRight, CheckCircle2, AlertCircle, History, Sparkles, User, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../../utils/soundEffects';

export const PiggyBankModal = ({
  isOpen,
  onClose,
  classId = 'default_class',
  className = 'Chủ Nhiệm',
  students = [],
  onUpdateStudentCoins
}) => {
  const [savingsData, setSavingsData] = useState({});
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [actionType, setActionType] = useState('deposit'); // 'deposit' | 'withdraw'
  const [amountInput, setAmountInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const storageKey = `gift_savings_${classId}`;

  // Load savings data
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setSavingsData(JSON.parse(saved));
      } else {
        setSavingsData({});
      }
    } catch (e) {
      setSavingsData({});
    }
  }, [classId, isOpen]);

  const saveSavings = (newData) => {
    setSavingsData(newData);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newData));
    } catch (e) {}
  };

  // Chuẩn hóa học sinh
  const studentList = useMemo(() => {
    return (students || []).map(st => {
      const currentCoins = Number(st.coins ?? st.total_stars ?? 0);
      const studentSavings = savingsData[st.id]?.balance || 0;
      return {
        ...st,
        currentCoins,
        savingsBalance: studentSavings
      };
    });
  }, [students, savingsData]);

  // Tổng quỹ heo đất cả lớp
  const totalSavings = useMemo(() => {
    return Object.values(savingsData).reduce((acc, curr) => acc + (curr.balance || 0), 0);
  }, [savingsData]);

  const totalInterestPaid = useMemo(() => {
    return Object.values(savingsData).reduce((acc, curr) => acc + (curr.totalInterest || 0), 0);
  }, [savingsData]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return studentList;
    const q = searchQuery.toLowerCase();
    return studentList.filter(s => s.full_name?.toLowerCase().includes(q));
  }, [studentList, searchQuery]);

  const selectedStudent = studentList.find(s => s.id === selectedStudentId);

  // Xử lý Gửi / Rút xu
  const handleTransaction = (e) => {
    e.preventDefault();
    const amount = parseInt(amountInput, 10);
    if (!selectedStudent || isNaN(amount) || amount <= 0) return;

    const currentCoins = selectedStudent.currentCoins;
    const currentSavings = selectedStudent.savingsBalance;

    if (actionType === 'deposit') {
      if (amount > currentCoins) {
        setErrorMessage('Số dư ví chính không đủ để gửi vào Heo đất!');
        setTimeout(() => setErrorMessage(''), 4000);
        return;
      }

      // Trừ ví chính, cộng vào Heo đất
      const newCoins = currentCoins - amount;
      const newSavings = currentSavings + amount;

      onUpdateStudentCoins?.(selectedStudent.id, newCoins);

      const studentRecord = savingsData[selectedStudent.id] || { balance: 0, totalInterest: 0, history: [] };
      const updatedData = {
        ...savingsData,
        [selectedStudent.id]: {
          ...studentRecord,
          balance: newSavings,
          history: [
            { type: 'deposit', amount, timestamp: new Date().toISOString() },
            ...(studentRecord.history || [])
          ]
        }
      };
      saveSavings(updatedData);

      soundFx?.playCorrect();
      setSuccessMessage(`Đã gửi thành công +${amount} xu vào Heo đất của em ${selectedStudent.full_name}!`);
    } else {
      // Rút xu
      if (amount > currentSavings) {
        setErrorMessage('Số dư trong Heo đất không đủ để rút!');
        setTimeout(() => setErrorMessage(''), 4000);
        return;
      }

      const newCoins = currentCoins + amount;
      const newSavings = currentSavings - amount;

      onUpdateStudentCoins?.(selectedStudent.id, newCoins);

      const studentRecord = savingsData[selectedStudent.id] || { balance: 0, totalInterest: 0, history: [] };
      const updatedData = {
        ...savingsData,
        [selectedStudent.id]: {
          ...studentRecord,
          balance: newSavings,
          history: [
            { type: 'withdraw', amount, timestamp: new Date().toISOString() },
            ...(studentRecord.history || [])
          ]
        }
      };
      saveSavings(updatedData);

      soundFx?.playClick();
      setSuccessMessage(`Đã rút thành công ${amount} xu từ Heo đất về ví của em ${selectedStudent.full_name}!`);
    }

    setAmountInput('');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Quyết toán lãi suất tuần (+5%)
  const handleCalculateWeeklyInterest = () => {
    let totalPaidThisRound = 0;
    let eligibleCount = 0;

    const updatedData = { ...savingsData };

    studentList.forEach(st => {
      const balance = updatedData[st.id]?.balance || 0;
      if (balance > 0) {
        // Lãi suất 5%, tối thiểu +1 xu nếu gửi từ 20 xu
        const interest = Math.max(1, Math.round(balance * 0.05));
        totalPaidThisRound += interest;
        eligibleCount++;

        const studentRecord = updatedData[st.id] || { balance: 0, totalInterest: 0, history: [] };
        updatedData[st.id] = {
          ...studentRecord,
          balance: balance + interest,
          totalInterest: (studentRecord.totalInterest || 0) + interest,
          history: [
            { type: 'interest', amount: interest, timestamp: new Date().toISOString() },
            ...(studentRecord.history || [])
          ]
        };
      }
    });

    if (eligibleCount === 0) {
      setErrorMessage('Hiện chưa có học sinh nào gửi tiết kiệm trong Heo đất để nhận lãi!');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    saveSavings(updatedData);

    soundFx?.playWinner();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });

    setSuccessMessage(`🎉 ĐÃ QUYẾT TOÁN THÀNH CÔNG! Phát tổng cộng +${totalPaidThisRound} xu lãi suất tuần cho ${eligibleCount} học sinh!`);
    setTimeout(() => setSuccessMessage(''), 6000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white">
          <div className="flex items-center space-x-2.5">
            <span className="text-3xl">🐷</span>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center space-x-1.5">
                <span>Ví Tiết Kiệm Heo Đất Lớp {className}</span>
                <Sparkles className="w-4 h-4 text-amber-200" />
              </h3>
              <p className="text-xs text-pink-100 font-medium">
                Tích lũy xu thi đua nhận lãi suất tuần <strong>+5%/tuần</strong> rèn thói quen tài chính
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-left">
          
          {/* Thông báo thành công */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-2 text-xs font-bold text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Thông báo lỗi */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-center space-x-2 text-xs font-bold text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Hộp thống kê Heo đất */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-gradient-to-tr from-pink-50 to-rose-50 border border-pink-200 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-pink-700 block">
                Tổng xu tiết kiệm cả lớp
              </span>
              <span className="text-xl font-black text-rose-600 flex items-center space-x-1 mt-0.5">
                <span>🪙</span>
                <span>{totalSavings} xu</span>
              </span>
            </div>

            <div className="p-4 bg-gradient-to-tr from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">
                Lãi suất định kỳ
              </span>
              <span className="text-xl font-black text-amber-600 flex items-center space-x-1 mt-0.5">
                <TrendingUp className="w-5 h-5" />
                <span>+5% / tuần</span>
              </span>
            </div>

            <div className="p-4 bg-gradient-to-tr from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-purple-700 block">
                Tổng lãi đã chi trả
              </span>
              <span className="text-xl font-black text-purple-600 flex items-center space-x-1 mt-0.5">
                <span>✨</span>
                <span>+{totalInterestPaid} xu</span>
              </span>
            </div>
          </div>

          {/* Nút Quyết Toán Lãi Suất Tuần */}
          <div className="p-4 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div>
              <h4 className="font-black text-sm flex items-center space-x-1.5">
                <span>Quyết Toán Lãi Suất Tuần Này (+5%)</span>
                <Sparkles className="w-4 h-4 text-yellow-200" />
              </h4>
              <p className="text-xs text-rose-100 font-medium">
                Tự động tính và cộng dồn lãi vào Heo đất cho tất cả học sinh đang gửi
              </p>
            </div>
            <button
              type="button"
              onClick={handleCalculateWeeklyInterest}
              className="px-4 py-2.5 bg-white hover:bg-yellow-50 text-rose-600 hover:text-rose-700 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0"
            >
              Phát Lãi Toàn Lớp 📈
            </button>
          </div>

          {/* Khu vực Gửi / Rút xu cho học sinh */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider">
              Gửi Xu / Rút Xu Tiết Kiệm:
            </h4>

            {/* Chọn học sinh */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Chọn học sinh:</label>
                <input
                  type="text"
                  placeholder="Tìm tên học sinh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
                <div className="max-h-28 overflow-y-auto space-y-1 p-1 bg-white rounded-xl border border-slate-200 custom-scrollbar">
                  {filteredStudents.map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStudentId(st.id)}
                      className={`w-full p-1.5 rounded-lg text-left text-xs flex items-center justify-between ${
                        selectedStudentId === st.id ? 'bg-rose-500 text-white font-bold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{st.full_name}</span>
                      <span className="text-[10px] font-bold">🐷 {st.savingsBalance} xu</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form thao tác */}
              {selectedStudent ? (
                <form onSubmit={handleTransaction} className="space-y-2">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-slate-800 block">{selectedStudent.full_name}</span>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>Ví chính: <strong>{selectedStudent.currentCoins} xu</strong></span>
                      <span>Heo đất: <strong className="text-rose-600">{selectedStudent.savingsBalance} xu</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setActionType('deposit')}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        actionType === 'deposit'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      + Gửi Tiết Kiệm
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType('withdraw')}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        actionType === 'withdraw'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      - Rút Về Ví
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Số xu..."
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-all"
                    >
                      Xác nhận
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                  Chọn 1 học sinh bên trái để gửi hoặc rút xu
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
