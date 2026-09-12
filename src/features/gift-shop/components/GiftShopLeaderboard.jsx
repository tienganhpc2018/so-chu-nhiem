import React, { useState, useMemo } from 'react';
import { Trophy, Award, Crown, Gift, Coins, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { soundFx } from '../../../utils/soundEffects';

export const GiftShopLeaderboard = ({ students = [], redemptions = [] }) => {
  const [activeTab, setActiveTab] = useState('coins'); // 'coins' | 'redemptions'
  const [isExpanded, setIsExpanded] = useState(true);

  // Top Đại Gia Tích Xu (Xu hiện có cao nhất)
  const topCoinsStudents = useMemo(() => {
    return [...students]
      .map(st => ({
        id: st.id,
        name: st.full_name,
        coins: Number(st.coins ?? st.total_stars ?? 0),
        group: st.team_group || 1,
        avatar: st.avatar_url
      }))
      .sort((a, b) => b.coins - a.coins)
      .slice(0, 3);
  }, [students]);

  // Top Siêu Sao Đổi Quà (Đổi quà nhiều nhất từ lịch sử)
  const topRedeemers = useMemo(() => {
    const stats = {};
    (redemptions || []).forEach(r => {
      const sId = r.studentId || r.studentName;
      if (!stats[sId]) {
        stats[sId] = {
          id: sId,
          name: r.studentName || 'Học sinh',
          totalCount: 0,
          totalCoinsSpent: 0
        };
      }
      stats[sId].totalCount += 1;
      stats[sId].totalCoinsSpent += Number(r.coinsSpent || 0);
    });

    return Object.values(stats)
      .sort((a, b) => b.totalCount - a.totalCount || b.totalCoinsSpent - a.totalCoinsSpent)
      .slice(0, 3);
  }, [redemptions]);

  const medals = [
    {
      rank: 1,
      badge: '🥇 Hạng Nhất',
      icon: '👑',
      border: 'border-amber-400 bg-gradient-to-b from-amber-50 to-yellow-100/60 shadow-amber-200/50',
      textGrad: 'text-amber-900',
      tag: 'bg-amber-400 text-amber-950',
      accent: 'text-amber-600'
    },
    {
      rank: 2,
      badge: '🥈 Hạng Nhì',
      icon: '⭐',
      border: 'border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100/60 shadow-slate-200/50',
      textGrad: 'text-slate-800',
      tag: 'bg-slate-300 text-slate-800',
      accent: 'text-slate-600'
    },
    {
      rank: 3,
      badge: '🥉 Hạng Ba',
      icon: '✨',
      border: 'border-orange-300 bg-gradient-to-b from-orange-50 to-amber-50/60 shadow-orange-200/50',
      textGrad: 'text-amber-950',
      tag: 'bg-orange-300 text-amber-950',
      accent: 'text-orange-600'
    }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all">
      
      {/* Header Bar */}
      <div className="px-5 py-4 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800 flex items-center space-x-2">
              <span>Bảng Vinh Danh Thi Đua Lớp</span>
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Vinh danh những gương mặt tích cực và nỗ lực nhất trong tháng
            </p>
          </div>
        </div>

        {/* Tab switcher + Toggle collapse */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => {
                soundFx?.playClick();
                setActiveTab('coins');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeTab === 'coins'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>Đại Gia Tích Xu</span>
            </button>

            <button
              onClick={() => {
                soundFx?.playClick();
                setActiveTab('redemptions');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeTab === 'redemptions'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-purple-500" />
              <span>Siêu Sao Đổi Quà</span>
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Body: Top 3 Cards */}
      {isExpanded && (
        <div className="p-5 animate-in fade-in">
          {activeTab === 'coins' ? (
            /* TAB 1: TOP COIN HOLDERS */
            topCoinsStudents.length > 0 && topCoinsStudents.some(s => s.coins > 0) ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {topCoinsStudents.map((st, idx) => {
                  const m = medals[idx] || medals[2];
                  return (
                    <div
                      key={st.id}
                      className={`relative p-4 rounded-2xl border-2 ${m.border} shadow-sm flex flex-col justify-between overflow-hidden transition-all hover:-translate-y-0.5`}
                    >
                      {/* Ribbon badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${m.tag}`}>
                          {m.badge}
                        </span>
                        <span className="text-xl">{m.icon}</span>
                      </div>

                      {/* Student details */}
                      <div className="flex items-center space-x-3 my-1">
                        <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center font-black text-sm text-slate-800 shrink-0 shadow-inner">
                          {st.name ? st.name.charAt(0) : '🎓'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-sm text-slate-800 truncate" title={st.name}>
                            {st.name}
                          </h4>
                          <span className="text-[11px] font-medium text-slate-500">
                            Tổ {st.group}
                          </span>
                        </div>
                      </div>

                      {/* Coin stat */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Số dư hiện có:</span>
                        <span className="text-sm font-black text-amber-600 bg-white/80 px-2.5 py-0.5 rounded-lg border border-amber-200 shadow-xs flex items-center space-x-1">
                          <span>🪙</span>
                          <span>{st.coins} xu</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <Coins className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Chưa có dữ liệu xu thi đua</p>
                <p className="text-[11px] text-slate-400">Hãy cộng xu cho học sinh trong các trò chơi hoặc giờ nề nếp!</p>
              </div>
            )
          ) : (
            /* TAB 2: TOP REDEEMERS */
            topRedeemers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {topRedeemers.map((st, idx) => {
                  const m = medals[idx] || medals[2];
                  return (
                    <div
                      key={st.id}
                      className={`relative p-4 rounded-2xl border-2 ${m.border} shadow-sm flex flex-col justify-between overflow-hidden transition-all hover:-translate-y-0.5`}
                    >
                      {/* Ribbon badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${m.tag}`}>
                          {m.badge}
                        </span>
                        <span className="text-xl">🎁</span>
                      </div>

                      {/* Student details */}
                      <div className="flex items-center space-x-3 my-1">
                        <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center font-black text-sm text-purple-900 shrink-0 shadow-inner">
                          {st.name ? st.name.charAt(0) : '🎓'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-sm text-slate-800 truncate" title={st.name}>
                            {st.name}
                          </h4>
                          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                            Đã đổi {st.totalCount} lần
                          </span>
                        </div>
                      </div>

                      {/* Coins spent stat */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Tổng xu đã dùng:</span>
                        <span className="text-sm font-black text-purple-700 bg-white/80 px-2.5 py-0.5 rounded-lg border border-purple-200 shadow-xs flex items-center space-x-1">
                          <span>✨</span>
                          <span>{st.totalCoinsSpent} xu</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <Gift className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Chưa có lượt đổi quà nào</p>
                <p className="text-[11px] text-slate-400">Khi học sinh đổi quà, các siêu sao tích cực nhất sẽ được vinh danh tại đây!</p>
              </div>
            )
          )}
        </div>
      )}

    </div>
  );
};
