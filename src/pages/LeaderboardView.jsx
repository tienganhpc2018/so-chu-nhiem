import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { soundFx } from '../utils/soundEffects';
import { MascotRobot } from '../components/MascotRobot';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { Trophy, Award, TrendingUp, Star, Medal, Sparkles, Flame } from 'lucide-react';

export const LeaderboardView = ({ currentClass }) => {
  const [topStudents, setTopStudents] = useState([]);
  const [improvedStudents, setImprovedStudents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentClass) {
      fetchLeaderboardData(currentClass.id);
    }
  }, [currentClass]);

  const fetchLeaderboardData = async (classId) => {
    setLoading(true);
    try {
      // 1. Fetch Top Outstanding Students sorted by total_stars DESC
      const { data: students, error: stErr } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('total_stars', { ascending: false });

      if (stErr) throw stErr;
      setTopStudents(students || []);

      // 2. Fetch Recent Activities & Most Improved (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: history, error: hErr } = await supabase
        .from('point_history')
        .select('*, students(full_name, avatar_url)')
        .eq('class_id', classId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (hErr) throw hErr;
      setRecentActivities(history || []);

      // Aggregate improved points per student in the last 7 days
      const pointsMap = {};
      if (history) {
        history.forEach(item => {
          if (item.action_type === 'add') {
            pointsMap[item.student_id] = (pointsMap[item.student_id] || 0) + item.points_changed;
          }
        });
      }

      // Merge aggregated 7-day gain with student profiles
      const improved = (students || [])
        .map(st => ({
          ...st,
          weekly_gain: pointsMap[st.id] || 0
        }))
        .filter(st => st.weekly_gain > 0)
        .sort((a, b) => b.weekly_gain - a.weekly_gain)
        .slice(0, 5);

      setImprovedStudents(improved);

    } catch (err) {
      console.error('Lỗi tải dữ liệu Bảng vinh danh:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentClass) {
    return (
      <EmptyState
        title="Vui lòng chọn Lớp học"
        description="Hãy chọn một lớp học ở thanh điều hướng để xem Bảng vinh danh và học sinh tiến bộ."
        robotMode="thinking"
      />
    );
  }

  const rank1 = topStudents[0];
  const rank2 = topStudents[1];
  const rank3 = topStudents[2];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-coral-500 to-mint-500 rounded-3xl p-6 text-white shadow-soft flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
            <MascotRobot mode="celebrate" size={56} />
          </div>
          <div>
            <h2 className="text-2xl font-black flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-amber-200" />
              <span>BẢNG VINH DANH NGÔI SAO & TIẾN BỘ</span>
            </h2>
            <p className="text-xs text-white/90 mt-0.5 font-semibold">
              Tuyên dương các học sinh Lớp {currentClass.name} xuất sắc tích lũy sao thi đua nề nếp
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Cập Nhật Realtime</span>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader type="table" count={5} />
      ) : topStudents.length === 0 ? (
        <EmptyState
          title="Chưa có dữ liệu thi đua"
          description="Hãy bắt đầu tích sao tuyên dương học sinh ở trang Sơ đồ lớp học."
          robotMode="thinking"
        />
      ) : (
        <>
          {/* Top 3 Podium Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6">
            
            {/* Rank 2 (Silver) */}
            {rank2 && (
              <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-soft text-center transform hover:-translate-y-1 transition-all relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-800 text-xs font-black px-3 py-1 rounded-full shadow-sm flex items-center space-x-1">
                  <Medal className="w-3.5 h-3.5 text-slate-600" />
                  <span>HẠNG 2</span>
                </div>
                <img
                  src={rank2.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${rank2.id}`}
                  alt={rank2.full_name}
                  className="w-20 h-20 mx-auto rounded-full border-4 border-slate-300 shadow-md mb-2 object-cover bg-slate-50"
                />
                <h4 className="text-sm font-extrabold text-slate-800 line-clamp-1">{rank2.full_name}</h4>
                <div className="mt-2 inline-flex items-center space-x-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200 text-xs font-extrabold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{rank2.total_stars} Sao</span>
                </div>
              </div>
            )}

            {/* Rank 1 (Gold - Center Champion) */}
            {rank1 && (
              <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-6 border-4 border-amber-400 shadow-coral-glow text-center transform md:-translate-y-4 hover:-translate-y-5 transition-all relative z-10">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-md flex items-center space-x-1 ring-4 ring-amber-200">
                  <Trophy className="w-4 h-4 text-amber-200" />
                  <span>QUÁN QUÂN ★ HẠNG 1</span>
                </div>
                <img
                  src={rank1.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${rank1.id}`}
                  alt={rank1.full_name}
                  className="w-24 h-24 mx-auto rounded-full border-4 border-amber-400 shadow-lg mb-2 object-cover bg-white"
                />
                <h4 className="text-base font-black text-slate-900 line-clamp-1">{rank1.full_name}</h4>
                <div className="mt-2 inline-flex items-center space-x-1 bg-amber-500 text-white px-4 py-1.5 rounded-full shadow-md text-sm font-black">
                  <Star className="w-4 h-4 fill-amber-300 text-amber-200" />
                  <span>{rank1.total_stars} SAO TÍCH LŨY</span>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {rank3 && (
              <div className="bg-white rounded-3xl p-5 border-2 border-amber-700/30 shadow-soft text-center transform hover:-translate-y-1 transition-all relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-700/80 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm flex items-center space-x-1">
                  <Medal className="w-3.5 h-3.5 text-amber-200" />
                  <span>HẠNG 3</span>
                </div>
                <img
                  src={rank3.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${rank3.id}`}
                  alt={rank3.full_name}
                  className="w-20 h-20 mx-auto rounded-full border-4 border-amber-700/40 shadow-md mb-2 object-cover bg-amber-50"
                />
                <h4 className="text-sm font-extrabold text-slate-800 line-clamp-1">{rank3.full_name}</h4>
                <div className="mt-2 inline-flex items-center space-x-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200 text-xs font-extrabold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{rank3.total_stars} Sao</span>
                </div>
              </div>
            )}

          </div>

          {/* Grid Layout: Top Leaderboard Table & Most Improved Week */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            
            {/* Column 1 & 2: Full Leaderboard Table */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-mint-100 shadow-soft space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center space-x-2">
                  <Award className="w-5 h-5 text-mint-600" />
                  <span>Bảng Xếp Hạng Tổng Điểm Sao Lớp {currentClass.name}</span>
                </h3>
                <span className="text-xs font-semibold text-slate-400">Sắp xếp theo số Sao</span>
              </div>

              <div className="space-y-2">
                {topStudents.map((st, idx) => (
                  <div
                    key={st.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      idx === 0
                        ? 'bg-amber-50/60 border-amber-200'
                        : idx === 1
                        ? 'bg-slate-50 border-slate-200'
                        : idx === 2
                        ? 'bg-orange-50/40 border-orange-200'
                        : 'bg-white border-slate-100 hover:bg-mint-50/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                        idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-slate-400 text-white' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <img
                        src={st.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                        alt={st.full_name}
                        className="w-10 h-10 rounded-full border border-mint-200 bg-white"
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-800 block">{st.full_name}</span>
                        <span className="text-[11px] text-slate-400">Vị trí: Bàn H{st.seat_row}-C{st.seat_col}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 bg-amber-100/70 text-amber-800 px-3 py-1 rounded-full text-xs font-extrabold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span>{st.total_stars} ⭐</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Most Improved Students & Recent Activity */}
            <div className="space-y-6">
              
              {/* Most Improved in Week */}
              <div className="bg-gradient-to-b from-coral-50/60 to-white rounded-3xl p-6 border border-coral-200 shadow-soft space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-coral-200/80">
                  <TrendingUp className="w-5 h-5 text-coral-600" />
                  <h3 className="text-base font-extrabold text-coral-800">Top Học Sinh Tiến Bộ Tuần</h3>
                </div>

                {improvedStudents.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Chưa có lượt cộng điểm trong 7 ngày qua.</p>
                ) : (
                  <div className="space-y-2.5">
                    {improvedStudents.map((st, idx) => (
                      <div key={st.id} className="flex items-center justify-between p-2.5 bg-white rounded-2xl border border-coral-100 shadow-sm">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xs font-bold text-coral-600">#{idx + 1}</span>
                          <img
                            src={st.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.id}`}
                            alt={st.full_name}
                            className="w-8 h-8 rounded-full border border-coral-200"
                          />
                          <span className="text-xs font-bold text-slate-800">{st.full_name}</span>
                        </div>
                        <span className="text-xs font-extrabold text-mint-700 bg-mint-50 border border-mint-200 px-2.5 py-0.5 rounded-full">
                          +{st.weekly_gain} Sao
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Point Activities Feed */}
              <div className="bg-white rounded-3xl p-6 border border-mint-100 shadow-soft space-y-3">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Lịch Sử Thi Đua Gần Đây</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {recentActivities.slice(0, 8).map((act) => (
                    <div key={act.id} className="text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{act.students?.full_name || 'Học sinh'}</span>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{act.reason}</p>
                      </div>
                      <span className={`font-black text-xs px-2 py-0.5 rounded-full ${
                        act.action_type === 'add' ? 'bg-mint-100 text-mint-800' : 'bg-coral-100 text-coral-800'
                      }`}>
                        {act.action_type === 'add' ? `+${act.points_changed}` : `-${act.points_changed}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
};
