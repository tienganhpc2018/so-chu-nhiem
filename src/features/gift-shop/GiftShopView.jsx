import React, { useState, useEffect, useMemo } from 'react';
import {
  Gift,
  Plus,
  Coins,
  Sparkles,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Filter,
  Search,
  Users,
  RotateCcw
} from 'lucide-react';
import { PRESET_GIFTS, GIFT_CATEGORIES, COLOR_THEMES } from './constants/presetGifts';
import { AddEditGiftModal } from './components/AddEditGiftModal';
import { RedeemGiftModal } from './components/RedeemGiftModal';
import { RedemptionHistoryTable } from './components/RedemptionHistoryTable';
import { GiftShopLeaderboard } from './components/GiftShopLeaderboard';
import { GiftVoucherModal } from './components/GiftVoucherModal';
import { soundFx } from '../../utils/soundEffects';
import { supabase } from '../../lib/supabase';

export const GiftShopView = ({
  currentClass,
  students = [],
  onRefreshStudents
}) => {
  const classId = currentClass?.id || 'default_class';
  const className = currentClass?.name || 'Chủ Nhiệm';

  // Thông tin giáo viên & trường từ cài đặt
  const teacherProfile = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('teacher_profile') || '{}');
    } catch (e) {
      return {};
    }
  }, []);
  const teacherName = teacherProfile.full_name || 'Thầy Chủ Nhiệm';
  const schoolName = teacherProfile.school_name || 'TRƯỜNG THCS CÁT MINH';

  // State gifts & redemptions
  const [gifts, setGifts] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingGift, setEditingGift] = useState(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedGiftForRedeem, setSelectedGiftForRedeem] = useState(null);
  const [deletingGiftId, setDeletingGiftId] = useState(null);

  // Voucher Modal state
  const [voucherData, setVoucherData] = useState(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Load gifts from LocalStorage or Preset Samples
  useEffect(() => {
    try {
      const storageKey = `gift_items_${classId}`;
      const savedGifts = localStorage.getItem(storageKey);
      if (savedGifts) {
        const parsed = JSON.parse(savedGifts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGifts(parsed);
        } else {
          setGifts(PRESET_GIFTS.map(g => ({ ...g, classId })));
        }
      } else {
        // Khởi tạo 6 món quà mẫu ban đầu
        const initial = PRESET_GIFTS.map(g => ({ ...g, classId }));
        setGifts(initial);
        localStorage.setItem(storageKey, JSON.stringify(initial));
      }
    } catch (e) {
      setGifts(PRESET_GIFTS);
    }

    // Load redemption history
    try {
      const historyKey = `gift_redemptions_${classId}`;
      const savedHistory = localStorage.getItem(historyKey);
      if (savedHistory) {
        setRedemptions(JSON.parse(savedHistory));
      } else {
        setRedemptions([]);
      }
    } catch (e) {
      setRedemptions([]);
    }
  }, [classId]);

  // Save gifts helper
  const saveGiftsState = (updatedGifts) => {
    setGifts(updatedGifts);
    try {
      localStorage.setItem(`gift_items_${classId}`, JSON.stringify(updatedGifts));
    } catch (e) {}
  };

  // Save redemptions helper
  const saveRedemptionsState = (updatedRedemptions) => {
    setRedemptions(updatedRedemptions);
    try {
      localStorage.setItem(`gift_redemptions_${classId}`, JSON.stringify(updatedRedemptions));
    } catch (e) {}
  };

  // Add / Edit Gift handler
  const handleSaveGift = (giftData) => {
    if (editingGift) {
      const updated = gifts.map(g => g.id === giftData.id ? giftData : g);
      saveGiftsState(updated);
    } else {
      const updated = [giftData, ...gifts];
      saveGiftsState(updated);
    }
    setEditingGift(null);
  };

  // Delete Gift handler
  const handleDeleteGift = (giftId) => {
    soundFx?.playClick();
    const updated = gifts.filter(g => g.id !== giftId);
    saveGiftsState(updated);
    setDeletingGiftId(null);
  };

  // Redeem Gift confirmed handler
  const handleConfirmRedeem = async ({ gift, student, coinsSpent }) => {
    // 1. Giảm stock của quà
    const updatedGifts = gifts.map(g => {
      if (g.id === gift.id) {
        return { ...g, stock: Math.max(0, (g.stock ?? 1) - 1) };
      }
      return g;
    });
    saveGiftsState(updatedGifts);

    // 2. Thêm 1 bản ghi vào lịch sử đổi quà
    const newRedemption = {
      id: `red-${Date.now()}`,
      classId,
      studentId: student.id,
      studentName: student.full_name,
      giftId: gift.id,
      giftName: gift.name,
      coinsSpent,
      timestamp: new Date().toISOString()
    };
    const updatedRedemptions = [newRedemption, ...redemptions];
    saveRedemptionsState(updatedRedemptions);

    // 3. Trừ số xu của học sinh trong LocalStorage và State
    try {
      const currentCoins = Number(student.coins ?? student.total_stars ?? 0);
      const newCoins = Math.max(0, currentCoins - coinsSpent);

      // Cập nhật cả custom_students và behavior_students
      ['custom_students_', 'behavior_students_'].forEach(prefix => {
        const key = `${prefix}${classId}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const list = JSON.parse(stored);
          const mapped = list.map(st => {
            if (st.id === student.id) {
              return {
                ...st,
                coins: newCoins,
                total_stars: newCoins
              };
            }
            return st;
          });
          localStorage.setItem(key, JSON.stringify(mapped));
        }
      });

      // Ghi log vào point_history để đồng bộ nề nếp
      const historyKey = `point_history_${classId}`;
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const pointLog = {
        id: `pt-${Date.now()}`,
        student_id: student.id,
        class_id: classId,
        student_name: student.full_name,
        points_changed: coinsSpent,
        action_type: 'deduct',
        reason: `Đổi quà: ${gift.name}`,
        created_at: new Date().toISOString()
      };
      localStorage.setItem(historyKey, JSON.stringify([pointLog, ...existingHistory]));

      // Lưu lên Supabase nếu có kết nối
      try {
        await supabase
          .from('students')
          .update({ total_stars: newCoins })
          .eq('id', student.id);

        await supabase
          .from('point_history')
          .insert({
            student_id: student.id,
            class_id: classId,
            points_changed: coinsSpent,
            action_type: 'deduct',
            reason: `Đổi quà: ${gift.name}`
          });
      } catch (err) {}

      // Refresh student list
      onRefreshStudents?.();
    } catch (e) {
      console.error('Lỗi khi trừ xu học sinh:', e);
    }

    return newRedemption;
  };

  // Undo / Hủy lượt đổi quà handler
  const handleUndoRedeem = async (redemptionId) => {
    const item = redemptions.find(r => r.id === redemptionId);
    if (!item) return;

    // 1. Khôi phục lại tồn kho của phần quà (+1)
    const updatedGifts = gifts.map(g => {
      if (g.id === item.giftId || g.name === item.giftName) {
        return { ...g, stock: (g.stock ?? 0) + 1 };
      }
      return g;
    });
    saveGiftsState(updatedGifts);

    // 2. Hoàn lại số xu cho học sinh
    try {
      const targetStudent = students.find(s => s.id === item.studentId);
      const currentCoins = Number(targetStudent?.coins ?? targetStudent?.total_stars ?? 0);
      const restoredCoins = currentCoins + Number(item.coinsSpent || 0);

      ['custom_students_', 'behavior_students_'].forEach(prefix => {
        const key = `${prefix}${classId}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const list = JSON.parse(stored);
          const mapped = list.map(st => {
            if (st.id === item.studentId) {
              return {
                ...st,
                coins: restoredCoins,
                total_stars: restoredCoins
              };
            }
            return st;
          });
          localStorage.setItem(key, JSON.stringify(mapped));
        }
      });

      // Ghi log hoàn tác vào point_history
      const historyKey = `point_history_${classId}`;
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const pointLog = {
        id: `pt-undo-${Date.now()}`,
        student_id: item.studentId,
        class_id: classId,
        student_name: item.studentName,
        points_changed: item.coinsSpent,
        action_type: 'add',
        reason: `Hoàn tác đổi quà: ${item.giftName}`,
        created_at: new Date().toISOString()
      };
      localStorage.setItem(historyKey, JSON.stringify([pointLog, ...existingHistory]));

      // Cập nhật Supabase nếu có kết nối
      try {
        await supabase
          .from('students')
          .update({ total_stars: restoredCoins })
          .eq('id', item.studentId);

        await supabase
          .from('point_history')
          .insert({
            student_id: item.studentId,
            class_id: classId,
            points_changed: item.coinsSpent,
            action_type: 'add',
            reason: `Hoàn tác đổi quà: ${item.giftName}`
          });
      } catch (err) {}

      onRefreshStudents?.();
    } catch (e) {
      console.error('Lỗi khi hoàn xu học sinh:', e);
    }

    // 3. Xóa bản ghi khỏi danh sách lịch sử
    const updatedRedemptions = redemptions.filter(r => r.id !== redemptionId);
    saveRedemptionsState(updatedRedemptions);

    soundFx?.playCorrect();
  };

  // Mở Voucher modal từ kết quả đổi quà hoặc từ dòng lịch sử
  const handleOpenVoucher = ({ student, gift, redemption }) => {
    setVoucherData({
      student,
      gift,
      redemption: redemption || {},
      className,
      teacherName,
      schoolName
    });
    setShowVoucherModal(true);
  };

  const handlePrintVoucherFromHistory = (item) => {
    const student = students.find(s => s.id === item.studentId) || {
      id: item.studentId,
      full_name: item.studentName,
      team_group: 1
    };
    const gift = gifts.find(g => g.id === item.giftId || g.name === item.giftName) || {
      name: item.giftName,
      requiredCoins: item.coinsSpent,
      image: '🎁'
    };

    handleOpenVoucher({ student, gift, redemption: item });
  };

  // Xóa toàn bộ lịch sử
  const handleClearHistory = () => {
    saveRedemptionsState([]);
  };

  // Khôi phục 6 quà mẫu mặc định nếu lỡ xóa hết
  const handleRestorePresets = () => {
    soundFx?.playClick();
    const initial = PRESET_GIFTS.map(g => ({ ...g, classId }));
    saveGiftsState(initial);
  };

  // Tính toán tổng số xu trong lớp
  const totalClassCoins = useMemo(() => {
    return (students || []).reduce((acc, curr) => {
      return acc + Number(curr.coins ?? curr.total_stars ?? 0);
    }, 0);
  }, [students]);

  // Lọc danh sách quà theo danh mục & tìm kiếm
  const filteredGifts = useMemo(() => {
    return gifts.filter(gift => {
      const matchCat = selectedCategory === 'all' || gift.category === selectedCategory;
      const matchSearch = !searchQuery.trim() || gift.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [gifts, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in pb-20">
      
      {/* 1. HEADER BANNER CỬA HÀNG QUÀ */}
      <div className="relative rounded-3xl bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl shadow-rose-200/50 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Background Decorative Blur Rings */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-36 h-36 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

        {/* Tiêu đề & mô tả */}
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-rose-100 border border-white/20">
            <span>🎁</span>
            <span>GIFT SHOP & REWARD REDEMPTION</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight drop-shadow-sm flex items-center space-x-2.5">
            <span>Cửa Hàng Đổi Quà Lớp {className}</span>
            <Sparkles className="w-6 h-6 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          </h1>

          <p className="text-xs sm:text-sm text-rose-100/90 font-medium leading-relaxed">
            Dùng điểm xu thi đua nề nếp để quy đổi các phần quà học tập, đồ chơi và đặc quyền lớp học hấp dẫn cho các em học sinh.
          </p>
        </div>

        {/* Cụm thông tin xu & Nút Thêm Quà Mới */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] uppercase font-bold text-rose-100 block">
              Tổng quỹ xu lớp:
            </span>
            <span className="text-xl font-black text-amber-300 flex items-center justify-center space-x-1">
              <span>🪙</span>
              <span>{totalClassCoins} xu</span>
            </span>
          </div>

          <button
            onClick={() => {
              soundFx?.playClick();
              setEditingGift(null);
              setShowAddEditModal(true);
            }}
            className="px-5 py-3.5 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-black/10 flex items-center space-x-2 transform hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>+ Thêm phần quà mới</span>
          </button>
        </div>

      </div>

      {/* 2. BẢNG XẾP HẠNG ĐẠI GIA TÍCH XU & SIÊU SAO ĐỔI QUÀ */}
      <GiftShopLeaderboard students={students} redemptions={redemptions} />

      {/* 3. THANH BỘ LỌC & TÌM KIẾM */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Lọc danh mục */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto custom-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({gifts.length})
          </button>
          {GIFT_CATEGORIES.map(cat => {
            const count = gifts.filter(g => g.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Ô tìm kiếm quà */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên phần quà..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
      </div>

      {/* 4. LƯỚI HIỂN THỊ QUÀ (RESPONSIVE GRID 1-4 CỘT) */}
      {filteredGifts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredGifts.map(gift => {
            const theme = COLOR_THEMES.find(t => t.id === gift.color) || COLOR_THEMES[0];
            const isOutOfStock = (gift.stock ?? 0) <= 0;

            return (
              <div
                key={gift.id}
                className={`group relative bg-white rounded-3xl border-2 ${theme.border} hover:shadow-xl hover:shadow-rose-100/60 transition-all duration-300 flex flex-col justify-between overflow-hidden`}
              >
                
                {/* Header thẻ quà: Danh mục & Huy hiệu tồn kho */}
                <div className="p-4 pb-2 flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${theme.badge}`}>
                    {gift.category || 'Dụng cụ học tập'}
                  </span>

                  {isOutOfStock ? (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                      Hết hàng
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Kho: {gift.stock}
                    </span>
                  )}
                </div>

                {/* Khung hình ảnh / Biểu tượng quà */}
                <div className="px-4 py-3 flex items-center justify-center">
                  <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl ${theme.bg} border-2 ${theme.border} flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105 shadow-inner`}>
                    {gift.image && (gift.image.startsWith('data:image') || gift.image.startsWith('http')) ? (
                      <img
                        src={gift.image}
                        alt={gift.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl sm:text-6xl drop-shadow-sm select-none">
                        {gift.image || '🎁'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Thông tin phần quà */}
                <div className="p-4 pt-1 space-y-2">
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-slate-800 line-clamp-1 group-hover:text-rose-600 transition-colors" title={gift.name}>
                      {gift.name}
                    </h3>
                    
                    {/* Giới hạn tần suất nếu có */}
                    {gift.redemptionLimit && gift.redemptionLimit !== 'none' && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        Tối đa 1 lần / {gift.redemptionLimit === 'week' ? 'tuần' : gift.redemptionLimit === 'month' ? 'tháng' : 'kỳ'}
                      </span>
                    )}
                  </div>

                  {/* Giá xu quy đổi */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-semibold">Giá đổi:</span>
                    <span className="text-sm sm:text-base font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-xl border border-amber-200/80 flex items-center space-x-1">
                      <span>🪙</span>
                      <span>{gift.requiredCoins} xu</span>
                    </span>
                  </div>
                </div>

                {/* Hành động: Nút Đổi quà & Nút Sửa/Xóa */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        soundFx?.playClick();
                        setEditingGift(gift);
                        setShowAddEditModal(true);
                      }}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition-colors"
                      title="Chỉnh sửa phần quà"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>

                    <button
                      onClick={() => setDeletingGiftId(gift.id)}
                      className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                      title="Xóa phần quà"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Nút Đổi quà chính */}
                  <button
                    disabled={isOutOfStock}
                    onClick={() => {
                      soundFx?.playClick();
                      setSelectedGiftForRedeem(gift);
                      setShowRedeemModal(true);
                    }}
                    className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all ${
                      isOutOfStock
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : `bg-gradient-to-r ${theme.button} text-white hover:shadow-lg transform hover:scale-102 active:scale-98`
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Hết hàng trong kho' : 'Đổi phần thưởng này'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Trạng thái rỗng: Nếu chưa có quà */
        <div className="p-12 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center mx-auto text-3xl shadow-sm">
            🎁
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-black text-base text-slate-800">
              Chưa có phần quà nào trong danh mục
            </h3>
            <p className="text-xs text-slate-500">
              Thầy/Cô hãy bấm nút bên dưới để tạo phần quà đầu tiên hoặc khôi phục danh sách quà mẫu!
            </p>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => {
                soundFx?.playClick();
                setEditingGift(null);
                setShowAddEditModal(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Tạo phần quà đầu tiên</span>
            </button>

            <button
              onClick={handleRestorePresets}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs"
            >
              Khôi phục 6 quà mẫu
            </button>
          </div>
        </div>
      )}

      {/* 5. BẢNG LỊCH SỬ ĐỔI QUÀ & XUẤT FILE EXCEL */}
      <RedemptionHistoryTable
        redemptions={redemptions}
        className={className}
        onClearHistory={handleClearHistory}
        onUndoRedeem={handleUndoRedeem}
        onPrintVoucher={handlePrintVoucherFromHistory}
      />

      {/* MODAL THÊM / SỬA PHẦN QUÀ */}
      <AddEditGiftModal
        isOpen={showAddEditModal}
        onClose={() => {
          setShowAddEditModal(false);
          setEditingGift(null);
        }}
        onSave={handleSaveGift}
        editingGift={editingGift}
      />

      {/* MODAL XÁC NHẬN ĐỔI QUÀ */}
      <RedeemGiftModal
        isOpen={showRedeemModal}
        onClose={() => {
          setShowRedeemModal(false);
          setSelectedGiftForRedeem(null);
        }}
        gift={selectedGiftForRedeem}
        students={students}
        redemptions={redemptions}
        onConfirmRedeem={handleConfirmRedeem}
        onOpenVoucher={handleOpenVoucher}
      />

      {/* MODAL IN THẺ VOUCHER A6 */}
      <GiftVoucherModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        voucherData={voucherData}
      />

      {/* MODAL XÁC NHẬN XÓA QUÀ */}
      {deletingGiftId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-5 border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-base text-slate-800">Xóa Phần Quà Này?</h4>
              <p className="text-xs text-slate-500">
                Phần quà này sẽ bị xóa khỏi cửa hàng. Các lượt đổi quà trước đây trong lịch sử vẫn được giữ nguyên.
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingGiftId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleDeleteGift(deletingGiftId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
