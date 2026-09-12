import React, { useState, useEffect } from 'react';
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
  Users
} from 'lucide-react';
import { PRESET_GIFTS, GIFT_CATEGORIES, COLOR_THEMES } from './constants/presetGifts';
import { AddEditGiftModal } from './components/AddEditGiftModal';
import { RedeemGiftModal } from './components/RedeemGiftModal';
import { RedemptionHistoryTable } from './components/RedemptionHistoryTable';
import { soundFx } from '../../utils/soundEffects';
import { supabase } from '../../lib/supabase';

export const GiftShopView = ({
  currentClass,
  students = [],
  onRefreshStudents
}) => {
  const classId = currentClass?.id || 'default_class';
  const className = currentClass?.name || 'Chủ Nhiệm';

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
      console.error('Error updating student coins:', e);
    }
  };

  // Clear history
  const handleClearHistory = () => {
    saveRedemptionsState([]);
  };

  // Filtered gifts list
  const filteredGifts = gifts.filter(gift => {
    const matchCat = selectedCategory === 'all' || gift.category === selectedCategory;
    const matchQuery = !searchQuery.trim() || gift.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  // Tổng số xu học sinh trong lớp đang có
  const totalClassCoins = students.reduce((sum, st) => sum + Number(st.coins ?? st.total_stars ?? 0), 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* 1. HEADER CỬA HÀNG ĐỔI QUÀ */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-rose-200/60 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Background Decorative Rings */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute left-1/3 -top-12 w-36 h-36 bg-pink-300/20 rounded-full blur-lg pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/30">
            <span>🎁</span>
            <span>Cửa Hàng Đổi Quà Thi Đua Học Đường</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Cửa Hàng Đổi Quà Lớp {className}
          </h1>
          <p className="text-xs sm:text-sm text-rose-100 font-medium">
            Học sinh dùng số xu sao thi đua đạt được để đổi các phần quà học tập, quà lưu niệm và đặc quyền miễn bài tập hấp dẫn!
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

      {/* 2. THANH BỘ LỌC & TÌM KIẾM */}
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

      {/* 3. LƯỚI HIỂN THỊ QUÀ (RESPONSIVE GRID 1-4 CỘT) */}
      {filteredGifts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredGifts.map(gift => {
            const theme = COLOR_THEMES.find(t => t.id === gift.color) || COLOR_THEMES[0];
            const isOutOfStock = (gift.stock ?? 0) <= 0;

            return (
              <div
                key={gift.id}
                className={`rounded-3xl border-2 ${theme.border} ${theme.bg} p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 relative group overflow-hidden`}
              >
                {/* Góc trên: Huy hiệu số lượng tồn kho & Nút sửa/xóa */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-xs ${
                    gift.stock > 0
                      ? 'bg-white text-slate-700 border-slate-200'
                      : 'bg-red-500 text-white border-red-400'
                  }`}>
                    {gift.stock > 0 ? `Kho: ${gift.stock} món` : 'Hết hàng'}
                  </span>

                  {/* Cụm nút Thao tác nhanh (Bút chì & Thùng rác) */}
                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        soundFx?.playClick();
                        setEditingGift(gift);
                        setShowAddEditModal(true);
                      }}
                      title="Chỉnh sửa phần quà này"
                      className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors shadow-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingGiftId(gift.id)}
                      title="Xóa phần quà này"
                      className="p-1.5 bg-white hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg border border-slate-200 transition-colors shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Khung Ảnh / Biểu tượng quà */}
                <div className="w-full h-32 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center overflow-hidden mb-3 shadow-inner relative">
                  {gift.image && (gift.image.startsWith('data:image') || gift.image.startsWith('http')) ? (
                    <img
                      src={gift.image}
                      alt={gift.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-5xl group-hover:scale-115 transition-transform duration-300 select-none">
                      {gift.image || '🎁'}
                    </span>
                  )}

                  {/* Giá xu quy đổi ở góc ảnh */}
                  <div className="absolute bottom-2 right-2 bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-xl shadow-md border border-amber-300 flex items-center space-x-1">
                    <span>🪙</span>
                    <span>{gift.requiredCoins} xu</span>
                  </div>
                </div>

                {/* Thông tin phần quà */}
                <div className="space-y-1 mb-4 flex-1">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${theme.badge}`}>
                    {gift.category || 'Dụng cụ học tập'}
                  </span>
                  <h3 className="font-black text-sm text-slate-800 leading-snug line-clamp-2 mt-1">
                    {gift.name}
                  </h3>
                </div>

                {/* Nút bấm Đổi quà */}
                <div>
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
              Thầy/Cô hãy bấm nút bên dưới để tạo phần quà đầu tiên cho học sinh lớp mình nhé!
            </p>
          </div>
          <button
            onClick={() => {
              soundFx?.playClick();
              setEditingGift(null);
              setShowAddEditModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-200 flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Tạo phần quà đầu tiên</span>
          </button>
        </div>
      )}

      {/* 4. BẢNG LỊCH SỬ ĐỔI QUÀ & XUẤT FILE EXCEL */}
      <RedemptionHistoryTable
        redemptions={redemptions}
        className={className}
        onClearHistory={handleClearHistory}
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
        onConfirmRedeem={handleConfirmRedeem}
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
