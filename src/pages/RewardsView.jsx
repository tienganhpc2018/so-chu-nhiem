import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Gift,
  Plus,
  Search,
  Star,
  Sparkles,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  Users,
  Coins,
  Check
} from 'lucide-react';

export const RewardsView = ({ currentClass, students = [], onRefreshStudents }) => {
  // Reward items state
  const [rewardsList, setRewardsList] = useState([
    { id: 'r1', title: 'Bộ Bút Màu Học Tập', category: 'Dụng cụ học tập', cost: 10, stock: 10, image_url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&q=80' },
    { id: 'r2', title: 'Bộ Thước Kẻ Đa Năng', category: 'Dụng cụ học tập', cost: 15, stock: 10, image_url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=400&q=80' },
    { id: 'r3', title: 'Sổ Tay Lớp Học Vui', category: 'Dụng cụ học tập', cost: 20, stock: 8, image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80' },
    { id: 'r4', title: 'Thẻ Miễn Bài Tập 1 Lần', category: 'Đặc quyền', cost: 30, stock: 5, image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReward, setSelectedReward] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Modals state
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [showStudentCoinModal, setShowStudentCoinModal] = useState(false);

  // Add reward form
  const [newTitle, setNewTitle] = useState('');
  const [newCost, setNewCost] = useState(10);
  const [newStock, setNewStock] = useState(10);
  const [newImage, setNewImage] = useState('');

  // Add coin form for student (Screenshot 5)
  const [coinAmount, setCoinAmount] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState('Ghi chung / Nề nếp');
  const [coinReason, setCoinReason] = useState('');

  // Quick Coin Criteria (Screenshot 5)
  const quickCriteria = [
    { label: 'Làm bài tập đầy đủ, sạch đẹp', coins: 2, icon: '📝' },
    { label: 'Đi học đúng giờ, nề nếp tốt', coins: 2, icon: '⏰' },
    { label: 'Đạt điểm 9, 10 bài kiểm tra', coins: 5, icon: '💯' },
    { label: 'Việc tốt - Giúp đỡ bạn bè', coins: 5, icon: '❤️' },
    { label: 'Học sinh xuất sắc trong tuần', coins: 10, icon: '👑' }
  ];

  const subjectPills = [
    '⭐ Ghi chung / Nề nếp',
    '📐 Toán',
    '📖 Tiếng Việt',
    '🔤 Tiếng Anh',
    '🌱 TN & Xã hội',
    '🔬 Khoa học',
    '📜 Lịch sử & Địa lý',
    '💻 Tin học',
    '⚙️ Công nghệ',
    '🎨 Mĩ thuật',
    '🎵 Âm nhạc',
    '⚽ Giáo dục thể chất',
    '⚖️ Đạo đức'
  ];

  // Open Coin Modal when clicking student avatar or redeem button (Screenshot 5)
  const handleOpenStudentCoinModal = (student) => {
    soundFx.playClick();
    setSelectedStudent(student);
    setCoinAmount(1);
    setCoinReason('');
    setShowStudentCoinModal(true);
  };

  // Submit Add Coins to Student
  const handleConfirmAddCoins = (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    soundFx.playCorrect();
    confetti({ particleCount: 40, spread: 80, origin: { y: 0.6 } });

    // Update local student stars count
    const updatedStars = (selectedStudent.total_stars || 0) + Number(coinAmount);
    selectedStudent.total_stars = updatedStars;

    alert(`Đã cộng thành công +${coinAmount} xu cho học sinh ${selectedStudent.full_name}!`);
    setShowStudentCoinModal(false);
  };

  // Redeem Reward for Student
  const handleRedeemGiftForStudent = (reward, student) => {
    if ((student.total_stars || 0) < reward.cost) {
      soundFx.playDeduct();
      alert(`Học sinh ${student.full_name} chưa đủ xu! Cần ${reward.cost} xu (hiện có ${student.total_stars || 0} xu).`);
      return;
    }

    soundFx.playCorrect();
    confetti({ particleCount: 50, spread: 90, origin: { y: 0.5 } });

    student.total_stars = (student.total_stars || 0) - reward.cost;
    reward.stock = Math.max(0, reward.stock - 1);

    alert(`🎉 Đã đổi thành công phần quà "${reward.title}" cho học sinh ${student.full_name}!`);
    setSelectedReward(null);
  };

  // Create New Gift Item
  const handleCreateReward = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    soundFx.playCorrect();
    const newGift = {
      id: `r_${Date.now()}`,
      title: newTitle.trim(),
      category: 'Dụng cụ học tập',
      cost: Number(newCost),
      stock: Number(newStock),
      image_url: newImage.trim() || 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&q=80'
    };

    setRewardsList([newGift, ...rewardsList]);
    setNewTitle('');
    setShowAddRewardModal(false);
  };

  const filteredRewards = rewardsList.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* HEADER BANNER (Screenshot 4) */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-2xl">
              <Gift className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Cửa Hàng Đổi Quà Lớp {currentClass?.name || '8A5'}
            </h2>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Dùng xu thi đua tích lũy để đổi các món quà xinh xắn hoặc đặc quyền hấp dẫn.
          </p>
        </div>

        {/* Top Action Bar: Search & Add Gift Button (Screenshot 4) */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Tìm kiếm quà..."
              className="w-full bg-purple-50/70 border border-purple-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-bold text-slate-800 placeholder-purple-400 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setShowAddRewardModal(true);
            }}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-purple-glow transition-all flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm phần quà</span>
          </button>
        </div>

      </div>

      {/* QUICK STUDENT COIN BAR (Nhấp avatar để đổi xu quà - Thầy Yêu Cầu & Screenshot 5) */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>Danh Sách Học Sinh (Bấm Vào Avatar Để Cộng Xu / Đổi Quà Direct)</span>
          </h3>
          <span className="text-xs font-bold text-purple-700">{students.length} học sinh</span>
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto pb-2 custom-scrollbar">
          {students.map(st => (
            <button
              key={st.id}
              onClick={() => handleOpenStudentCoinModal(st)}
              className="flex flex-col items-center p-2 rounded-2xl bg-purple-50/60 hover:bg-purple-100 border border-purple-100 hover:border-purple-300 transition-all shrink-0 w-20 group"
              title="Bấm để cộng xu khen thưởng hoặc đổi quà"
            >
              <div className="relative">
                <img
                  src={st.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                  alt={st.full_name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-300 bg-white group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-purple-950 font-black text-[9px] px-1 py-0.2 rounded-md shadow-sm">
                  {st.total_stars || 0}🪙
                </span>
              </div>
              <span className="text-[10px] font-black text-slate-800 line-clamp-1 mt-1.5 text-center">
                {st.full_name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* REWARD CARDS GRID (Screenshot 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-5 border border-purple-100 shadow-soft hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
          >
            {/* Image Preview Box */}
            <div className="relative h-44 rounded-2xl overflow-hidden bg-purple-50 border border-purple-100">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-purple-900 font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-sm">
                Kho: {item.stock} món
              </span>
            </div>

            {/* Content Info */}
            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-800">{item.title}</h3>
              <p className="text-xs text-slate-400 font-bold">{item.category}</p>

              <div className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-900 font-black text-xs px-3 py-1 rounded-full border border-amber-200">
                <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>{item.cost} xu</span>
              </div>
            </div>

            {/* Redeem Action Button (Screenshot 4) */}
            <button
              onClick={() => setSelectedReward(item)}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-purple-glow transition-all flex items-center justify-center space-x-2"
            >
              <Gift className="w-4 h-4" />
              <span>Đổi phần thưởng này</span>
            </button>

          </div>
        ))}
      </div>

      {/* MODAL 1: ADD COINS TO STUDENT (Screenshot 5) */}
      {showStudentCoinModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedStudent.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedStudent.id}`}
                  alt={selectedStudent.full_name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-300 bg-white"
                />
                <div>
                  <h3 className="text-base font-black text-slate-800">Cộng Xu Khen Thưởng</h3>
                  <p className="text-xs text-purple-700 font-bold">
                    {selectedStudent.full_name} • Quỹ xu hiện có: <span className="text-amber-600 font-extrabold">{selectedStudent.total_stars || 0} 🪙</span>
                  </p>
                </div>
              </div>

              <button onClick={() => setShowStudentCoinModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAddCoins} className="space-y-4 my-4">
              
              {/* Quick Reward Criteria Pills (Screenshot 5) */}
              <div>
                <label className="block text-xs font-black text-purple-900 mb-2">GHI NHẬN TÍCH CỰC NƠI LỚP HỌC:</label>
                <div className="space-y-2">
                  {quickCriteria.map((c, idx) => (
                    <div
                      key={`qc-${idx}`}
                      onClick={() => {
                        soundFx.playClick();
                        setCoinAmount(c.coins);
                        setCoinReason(c.label);
                      }}
                      className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        coinReason === c.label ? 'bg-purple-100 border-purple-400 shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-purple-50'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                        <span>{c.icon}</span>
                        <span>{c.label}</span>
                      </span>

                      <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                        +{c.coins} xu
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coin Custom Selector Buttons (Screenshot 5) */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">SỐ XU CỘNG:</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 5, 10, 20].map(val => (
                    <button
                      key={`num-${val}`}
                      type="button"
                      onClick={() => setCoinAmount(val)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                        coinAmount === val ? 'bg-purple-600 text-white shadow-purple-glow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Tag Selector (Screenshot 5) */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">CHỌN MÔN HỌC (TUỲ CHỌN):</label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {subjectPills.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSubject(s)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                        selectedSubject === s ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">LÝ DO CỘNG XU:</label>
                <input
                  type="text"
                  value={coinReason}
                  onChange={(e) => setCoinReason(e.target.value)}
                  placeholder="Ví dụ: Tích cực tham gia trò chơi, giúp bạn..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowStudentCoinModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Xác nhận Cộng +{coinAmount} Xu</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: REDEEM REWARD STUDENT SELECTOR */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800">Chọn Học Sinh Nhận Quà</h3>
              <button onClick={() => setSelectedReward(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex items-center space-x-3">
                <img src={selectedReward.image_url} alt={selectedReward.title} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h4 className="text-xs font-black text-purple-950">{selectedReward.title}</h4>
                  <span className="text-xs font-extrabold text-amber-600">Giá: {selectedReward.cost} xu</span>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {students.map(st => (
                  <div
                    key={st.id}
                    onClick={() => handleRedeemGiftForStudent(selectedReward, st)}
                    className="p-2.5 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={st.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                        alt={st.full_name}
                        className="w-8 h-8 rounded-xl object-cover border border-purple-200"
                      />
                      <span className="text-xs font-black text-slate-800">{st.full_name}</span>
                    </div>

                    <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      {st.total_stars || 0} xu
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: CREATE NEW GIFT ITEM */}
      {showAddRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800">Thêm Phần Quà Mới</h3>
              <button onClick={() => setShowAddRewardModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReward} className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên phần quà *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Bút chì, Thước kẻ, Thẻ đổi chỗ..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giá xu đổi:</label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số lượng kho:</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đường dẫn hình ảnh (URL):</label>
                <input
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddRewardModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white font-black text-xs rounded-xl shadow-purple-glow"
                >
                  TẠO PHẦN QUÀ
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
