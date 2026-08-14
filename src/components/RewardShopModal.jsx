import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { MascotRobot } from './MascotRobot';
import { X, Gift, Star, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

export const RewardShopModal = ({
  isOpen,
  onClose,
  student,
  onRewardRedeemed
}) => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchRewards();
    }
  }, [isOpen]);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('required_stars', { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (err) {
      console.error('Lỗi tải cửa hàng quà:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward) => {
    if (!student) return;
    if (student.total_stars < reward.required_stars) {
      soundFx.playDeduct();
      alert(`Học sinh ${student.full_name} chưa đủ sao! Cần ${reward.required_stars} sao (hiện có ${student.total_stars} sao).`);
      return;
    }

    setRedeemingId(reward.id);
    soundFx.playClick();

    try {
      // 1. Trừ điểm sao bằng cách insert vào point_history
      const { error: pointErr } = await supabase
        .from('point_history')
        .insert([{
          student_id: student.id,
          class_id: student.class_id,
          points_changed: reward.required_stars,
          reason: `Đổi đặc quyền: ${reward.title}`,
          action_type: 'deduct'
        }]);

      if (pointErr) throw pointErr;

      // 2. Ghi nhận quà đã đổi
      const { error: rewardErr } = await supabase
        .from('student_rewards')
        .insert([{
          student_id: student.id,
          reward_id: reward.id
        }]);

      if (rewardErr) throw rewardErr;

      soundFx.playWinner();
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 }
      });

      onRewardRedeemed?.();
      onClose();
    } catch (err) {
      console.error('Lỗi đổi quà:', err);
      alert('Không thể thực hiện đổi quà. Vui lòng thử lại sau.');
    } finally {
      setRedeemingId(null);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-mint-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <MascotRobot mode="celebrate" size={44} />
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 flex items-center space-x-2">
                <Gift className="w-5 h-5 text-coral-500" />
                <span>Cửa Hàng Đổi Qùa & Đặc Quyền</span>
              </h3>
              <p className="text-xs text-slate-500">
                Đổi quà cho: <span className="font-extrabold text-mint-700">{student.full_name}</span> (Quỹ sao: <span className="font-extrabold text-amber-500">{student.total_stars || 0} ⭐</span>)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reward List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 my-4">
          {loading ? (
            <div className="py-8 text-center text-slate-400">Đang tải danh sách phần thưởng...</div>
          ) : rewards.length === 0 ? (
            <div className="py-8 text-center text-slate-400">Chưa có phần thưởng nào được thiết lập.</div>
          ) : (
            rewards.map(reward => {
              const canAfford = student.total_stars >= reward.required_stars;
              return (
                <div
                  key={reward.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    canAfford
                      ? 'bg-gradient-to-r from-mint-50/50 to-amber-50/30 border-mint-200 hover:border-mint-400 shadow-sm'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-mint-100 shadow-sm flex items-center justify-center">
                      <img
                        src={reward.icon_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${reward.id}`}
                        alt={reward.title}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{reward.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{reward.description}</p>
                      <div className="inline-flex items-center space-x-1 mt-1 bg-amber-100/80 text-amber-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span>Yêu cầu {reward.required_stars} Sao</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford || redeemingId === reward.id}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5 ${
                      canAfford
                        ? 'bg-coral-500 hover:bg-coral-600 text-white shadow-coral-glow'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{redeemingId === reward.id ? 'Đang đổi...' : canAfford ? 'ĐỔI QÙA' : 'Chưa đủ sao'}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">Tích lũy thêm điểm Sao nề nếp để mở khóa các đặc quyền cao cấp hơn!</p>
        </div>

      </div>
    </div>
  );
};
