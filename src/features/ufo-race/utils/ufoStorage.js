// ufoStorage.js - Quản lý dữ liệu lớp học, cấu hình âm thanh & lịch sử gọi tên cho Game Đường Đua UFO
import { DEFAULT_UFO_STUDENTS } from '../data/defaultUfoData';

const STORAGE_KEYS = {
  CLASSES: 'ufo_race_saved_classes_v2',
  SETTINGS: 'ufo_race_user_settings_v2',
  HISTORY: 'ufo_race_call_history_v2'
};

// Khởi tạo danh sách lớp mặc định
export const getInitialUfoClasses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc lớp UFO từ LocalStorage:', e);
  }

  // Mặc định tạo Lớp 12A1 với 40 học sinh chuẩn ảnh mẫu
  const defaultClass = {
    id: 'class_12a1',
    name: 'Lớp 12A1',
    students: DEFAULT_UFO_STUDENTS.map((name, idx) => ({
      id: `ufo_std_${idx + 1}`,
      name: name,
      avatar: null
    }))
  };

  const initialClasses = [defaultClass];
  saveUfoClasses(initialClasses);
  return initialClasses;
};

// Lưu danh sách lớp vào Storage
export const saveUfoClasses = (classes) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  } catch (e) {
    console.error('Lỗi lưu danh sách lớp UFO:', e);
  }
};

// Lưu cài đặt (nhạc nền, âm lượng, số lượng chọn mặc định...)
export const getUfoSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}

  return {
    selectedMusic: 'ufo_synth', // 'ufo_synth' | 'custom'
    customMusicName: null,
    customMusicData: null,
    isMuted: false,
    volume: 0.7,
    speechEnabled: true,
    pickCount: 2
  };
};

export const saveUfoSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Lỗi lưu cài đặt UFO:', e);
  }
};

// Thuật toán chọn ngẫu nhiên X học sinh (không trùng lặp trong cùng 1 vòng)
export const pickRandomStudents = (allStudents, count, calledIds = []) => {
  if (!allStudents || allStudents.length === 0) return [];

  // Lọc các bạn chưa được gọi
  let eligible = allStudents.filter(s => !calledIds.includes(s.id));

  // Nếu số bạn chưa được gọi ít hơn số lượng cần bắt -> reset vòng mới
  if (eligible.length < count) {
    eligible = [...allStudents];
  }

  // Shuffle Fisher-Yates
  const shuffled = [...eligible];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
};
