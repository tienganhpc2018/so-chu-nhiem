/**
 * Service lưu trữ dữ liệu trò chơi Bịt Mắt Bắt Vịt
 * Kết nối Supabase database + Adapter LocalStorage an toàn
 */
import { supabase } from '../../../lib/supabase';
import { DEFAULT_DUCK_NAMES, DEFAULT_ENGLISH_QUESTIONS } from '../data/defaultDuckData';

const STORAGE_KEYS = {
  SESSIONS: 'blindfold_duck_sessions_v1',
  QUESTIONS: 'blindfold_duck_questions_v1',
  DUCKS: 'blindfold_duck_custom_ducks_v1',
  SETTINGS: 'blindfold_duck_settings_v1'
};

// ==========================================
// 1. QUẢN LÝ DANH SÁCH VỊT / HỌC SINH
// ==========================================

export function getLocalDucks(currentClassStudents = []) {
  try {
    // Nếu lớp hiện tại có học sinh, ưu tiên nạp danh sách học sinh của lớp
    if (currentClassStudents && currentClassStudents.length > 0) {
      return currentClassStudents.map((s, idx) => ({
        id: s.id || `duck_${idx}`,
        name: s.name || s.full_name || `Học sinh ${idx + 1}`,
        avatar: s.avatar || s.avatar_url || null,
        dialogue: null,
        speed: 1.0 + (idx % 3) * 0.2
      }));
    }

    const saved = localStorage.getItem(STORAGE_KEYS.DUCKS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  return DEFAULT_DUCK_NAMES.map((name, idx) => ({
    id: `duck_${idx}`,
    name,
    avatar: null,
    dialogue: null,
    speed: 1.0 + (idx % 3) * 0.2
  }));
}

export function saveLocalDucks(ducks) {
  try {
    localStorage.setItem(STORAGE_KEYS.DUCKS, JSON.stringify(ducks));
  } catch (e) {}
}

// ==========================================
// 2. QUẢN LÝ CÂU HỎI TIẾNG ANH
// ==========================================

export async function getGameQuestions(gameId = null) {
  // Thử tải từ Supabase nếu có
  try {
    if (gameId) {
      const { data, error } = await supabase
        .from('game_questions')
        .select('*')
        .eq('game_id', gameId)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    // Supabase fallback
  }

  // Tải từ LocalStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  return DEFAULT_ENGLISH_QUESTIONS;
}

export function saveGameQuestions(questions) {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  } catch (e) {}
}

// ==========================================
// 3. LƯU LƯỢT CHƠI & BẢNG XẾP HẠNG
// ==========================================

export async function saveGameSession(sessionData) {
  const sessionItem = {
    id: sessionData.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    game_id: sessionData.game_id || null,
    player_name: sessionData.playerName || 'Người chơi',
    class_id: sessionData.classId || null,
    class_name: sessionData.className || 'Toàn trường',
    mode: sessionData.mode || 'free',
    score: sessionData.score || 0,
    ducks_caught: sessionData.ducksCaught || 0,
    correct_answers: sessionData.correctAnswers || 0,
    total_questions: sessionData.totalQuestions || 0,
    combo_max: sessionData.comboMax || 1,
    duration_seconds: sessionData.durationSeconds || 0,
    completed_at: new Date().toISOString()
  };

  // 1. Lưu vào Supabase (nếu bảng tồn tại)
  try {
    const { error } = await supabase.from('game_sessions').insert([
      {
        player_name: sessionItem.player_name,
        class_id: sessionItem.class_id,
        mode: sessionItem.mode,
        score: sessionItem.score,
        ducks_caught: sessionItem.ducks_caught,
        correct_answers: sessionItem.correct_answers,
        total_questions: sessionItem.total_questions,
        combo_max: sessionItem.combo_max,
        duration_seconds: sessionItem.duration_seconds,
        completed_at: sessionItem.completed_at
      }
    ]);
    if (!error) {
      sessionItem.isSavedToCloud = true;
    }
  } catch (e) {
    // Supabase fallback to local
  }

  // 2. Lưu luôn vào LocalStorage để đảm bảo dữ liệu luôn hiển thị
  try {
    const existing = getLeaderboardSessions();
    const updated = [sessionItem, ...existing].slice(0, 50); // Giữ top 50
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
  } catch (e) {}

  return sessionItem;
}

export function getLeaderboardSessions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => (b.score || 0) - (a.score || 0));
      }
    }
  } catch (e) {}

  // Dữ liệu mẫu bảng xếp hạng ban đầu
  return [
    { id: 'lb_1', player_name: 'Nguyễn Minh (7A1)', score: 180, ducks_caught: 8, correct_answers: 7, combo_max: 5, duration_seconds: 54, completed_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'lb_2', player_name: 'Lê Thảo (7A2)', score: 150, ducks_caught: 7, correct_answers: 6, combo_max: 4, duration_seconds: 58, completed_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'lb_3', player_name: 'Trần Duy (8A1)', score: 120, ducks_caught: 6, correct_answers: 5, combo_max: 3, duration_seconds: 60, completed_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'lb_4', player_name: 'Phạm Trang (6A1)', score: 90, ducks_caught: 5, correct_answers: 4, combo_max: 2, duration_seconds: 48, completed_at: new Date(Date.now() - 172800000).toISOString() }
  ];
}
