/**
 * Dữ liệu mặc định cho Trò chơi dân gian: "BỊT MẮT BẮT VỊT"
 * Môn Tiếng Anh THCS - Thầy Nguyễn Văn Hải
 */

/**
 * Rút gọn tên học sinh: "Chữ lót + Tên" (nếu trùng thì lấy "Họ + Tên")
 * Giúp hiển thị gọn gàng, không bị chồng đè chữ khi cả lớp 35-40 học sinh cùng vào sân
 */
export function getShortStudentName(fullName = '', allNames = []) {
  if (!fullName) return 'Vịt';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName;
  if (parts.length === 2) return fullName; // e.g. "Lê Nam"

  // Chữ lót + Tên: e.g. "Huỳnh Thị Linh Vy" -> "Linh Vy", "Trịnh Trần Minh Trung" -> "Minh Trung"
  const shortName = `${parts[parts.length - 2]} ${parts[parts.length - 1]}`;

  // Kiểm tra trùng trong lớp: nếu có nhiều hơn 1 bạn cùng shortName thì lấy Họ + Tên
  if (allNames && allNames.length > 0) {
    const duplicates = allNames.filter(n => {
      const p = (n || '').trim().split(/\s+/);
      const s = p.length >= 2 ? `${p[p.length - 2]} ${p[p.length - 1]}` : n;
      return s.toLowerCase() === shortName.toLowerCase();
    });
    if (duplicates.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1]}`; // e.g. "Huỳnh Vy" vs "Nguyễn Vy"
    }
  }

  return shortName;
}

export const DEFAULT_DUCK_NAMES = [
  'Trang',
  'Duy',
  'Minh',
  'Thảo',
  'Bảo',
  'Ngọc Diệp',
  'Quang',
  'Mai',
  'Lan Phương',
  'Hoàng',
  'Tuấn',
  'Linh'
];

export const DUCK_SPEECH_QUOTES = [
  'Thầy ơi, em đây này! 🦆',
  'Hụt rồi thầy ơi haha!',
  'Em chưa học bài đâu tha cho em! 🙏',
  'Bắt em đi nếu thầy bắt được!',
  'Lêu lêu quạc quạc!',
  'Bên này cơ mà thầy ơi!',
  'Ú òa không bắt được em đâu!',
  'Quạc quạc em trốn kĩ lắm!',
  'Đố thầy bắt trúng em đấy!',
  'Em đang đứng sau lưng thầy nè!'
];

export const DEFAULT_ENGLISH_QUESTIONS = [
  {
    id: 'q1',
    question: 'She decided ______ abroad to improve her English.',
    option_a: 'move',
    option_b: 'to move',
    option_c: 'moving',
    option_d: 'moved',
    correct_answer: 'B',
    explanation: 'Cấu trúc: decide + to V (quyết định làm gì)',
    points: 10
  },
  {
    id: 'q2',
    question: 'If it ______ sunny tomorrow, we will play soccer in the yard.',
    option_a: 'is',
    option_b: 'was',
    option_c: 'will be',
    option_d: 'are',
    correct_answer: 'A',
    explanation: 'Câu điều kiện loại 1: Mệnh đề If dùng thì hiện tại đơn (If + S + V(s/es))',
    points: 10
  },
  {
    id: 'q3',
    question: 'My brother is really keen ______ reading folk story books.',
    option_a: 'in',
    option_b: 'at',
    option_c: 'on',
    option_d: 'about',
    correct_answer: 'C',
    explanation: 'Cụm từ cố định: be keen on + V-ing / Noun (say mê, thích thú cái gì)',
    points: 10
  },
  {
    id: 'q4',
    question: 'They have lived in Hanoi ______ 2018.',
    option_a: 'for',
    option_b: 'since',
    option_c: 'in',
    option_d: 'at',
    correct_answer: 'B',
    explanation: 'Thì hiện tại hoàn thành: "since" đi với mốc thời gian cụ thể (since 2018)',
    points: 10
  },
  {
    id: 'q5',
    question: 'The film was so ______ that almost everyone cried at the end.',
    option_a: 'moving',
    option_b: 'moved',
    option_c: 'move',
    option_d: 'movement',
    correct_answer: 'A',
    explanation: 'Tính từ đuôi -ing miêu tả tính chất gây xúc động, lay động lòng người của bộ phim',
    points: 10
  },
  {
    id: 'q6',
    question: 'Lan speaks English ______ than her classmates.',
    option_a: 'more fluent',
    option_b: 'more fluently',
    option_c: 'fluently',
    option_d: 'most fluently',
    correct_answer: 'B',
    explanation: 'So sánh hơn của trạng từ dài: more + adv + than (speaks ... more fluently than)',
    points: 10
  },
  {
    id: 'q7',
    question: 'You should avoid ______ sweet soda before going to bed.',
    option_a: 'drink',
    option_b: 'to drink',
    option_c: 'drinking',
    option_d: 'drank',
    correct_answer: 'C',
    explanation: 'Cấu trúc: avoid + V-ing (tránh làm việc gì)',
    points: 10
  },
  {
    id: 'q8',
    question: 'The temple ______ built in the 11th century by King Ly Thai To.',
    option_a: 'is',
    option_b: 'was',
    option_c: 'were',
    option_d: 'has been',
    correct_answer: 'B',
    explanation: 'Thể bị động thì quá khứ đơn: S + was/were + V3/ed (The temple was built...)',
    points: 10
  }
];

export const GAME_MODES = [
  {
    id: 'free',
    name: 'Bắt Vịt Tự Do',
    desc: 'Không câu hỏi, rèn luyện kỹ năng nghe định vị và bắt thật nhiều vịt!',
    icon: '🦆',
    badge: 'DỄ CHƠI'
  },
  {
    id: 'quiz',
    name: 'Bắt Vịt Học Tiếng Anh',
    desc: 'Bắt được vịt sẽ mở câu hỏi trắc nghiệm tiếng Anh, đúng nhận thêm +10 điểm & combo!',
    icon: '📚',
    badge: 'KHUYÊN DÙNG'
  },
  {
    id: 'target',
    name: 'Truy Tìm Học Sinh Chỉ Định',
    desc: 'Hệ thống yêu cầu bắt đúng bạn học sinh cụ thể (Ví dụ: "Hãy tìm và bắt Duy!")',
    icon: '🎯',
    badge: 'THỬ THÁCH'
  },
  {
    id: 'time_trial',
    name: 'Thử Thách 60 Giây',
    desc: 'Đua với thời gian 60 giây, bắt nhiều vịt và trả lời nhiều câu hỏi nhất có thể!',
    icon: '⏱️',
    badge: 'KỊCH TÍNH'
  }
];

export const DIFFICULTY_LEVELS = [
  {
    id: 'easy',
    name: 'Chế độ Dễ (Mờ Ảo)',
    desc: 'Vịt hiển thị mờ trong làn sương, phù hợp chiếu lớp học hoặc người mới chơi.',
    visionRadius: 160,
    showDucksBlur: true
  },
  {
    id: 'blindfold',
    name: 'Bịt Mắt Chuẩn Lễ Hội (Khó)',
    desc: 'Màn hình tối bịt mắt lụa đỏ, hoàn toàn dựa vào thính giác âm thanh Stereo để bắt!',
    visionRadius: 65,
    showDucksBlur: false
  }
];
