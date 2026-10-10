// Kho câu hỏi trắc nghiệm Tiếng Anh THCS phục vụ tính năng kết hợp câu hỏi khi đua bi
export const DEFAULT_QUESTIONS = [
  {
    id: 'q1',
    question: 'Choose the correct form: "She usually ______ to school by bicycle."',
    options: ['go', 'goes', 'going', 'went'],
    correctIndex: 1,
    explanation: 'Chủ ngữ "She" ngôi thứ 3 số ít và thì Hiện tại đơn (usually) đi với động từ "goes".'
  },
  {
    id: 'q2',
    question: 'What is the opposite of "generous"?',
    options: ['kind', 'selfish', 'helpful', 'friendly'],
    correctIndex: 1,
    explanation: '"Generous" (hào phóng, rộng lượng) trái nghĩa với "selfish" (ích kỷ).'
  },
  {
    id: 'q3',
    question: 'Find the mistake: "They was playing football at 4 PM yesterday."',
    options: ['They', 'was', 'playing', 'yesterday'],
    correctIndex: 1,
    explanation: 'Chủ ngữ "They" số nhiều trong thì Quá khứ tiếp diễn phải dùng "were", không dùng "was".'
  },
  {
    id: 'q4',
    question: 'Complete the sentence: "If it rains tomorrow, we ______ the picnic."',
    options: ['cancel', 'will cancel', 'cancelled', 'would cancel'],
    correctIndex: 1,
    explanation: 'Câu điều kiện loại 1: Mệnh đề If dùng thì Hiện tại đơn, mệnh đề chính dùng "will + V".'
  },
  {
    id: 'q5',
    question: 'Which word has the underlined part pronounced differently? (ch)',
    options: ['school', 'scholarship', 'chemistry', 'children'],
    correctIndex: 3,
    explanation: '"children" phát âm là /tʃ/, ba từ còn lại phát âm là /k/.'
  },
  {
    id: 'q6',
    question: 'Choose the correct preposition: "Ha Long Bay is famous ______ its stunning limestone islands."',
    options: ['about', 'with', 'for', 'in'],
    correctIndex: 2,
    explanation: 'Cấu trúc "famous for something": nổi tiếng vì điều gì.'
  },
  {
    id: 'q7',
    question: 'What should we do to protect the environment?',
    options: ['Litter in public places', 'Cut down more trees', 'Plant more trees and recycle', 'Use plastic bags only'],
    correctIndex: 2,
    explanation: '"Plant more trees and recycle" (Trồng thêm cây xanh và tái chế) là hành động bảo vệ môi trường.'
  },
  {
    id: 'q8',
    question: 'Choose the best response: "Teacher: Good morning, class!" - "Students: ______"',
    options: ['Goodbye, teacher!', 'Good morning, teacher!', 'How are you?', 'Thank you!'],
    correctIndex: 1,
    explanation: 'Đáp lại lời chào buổi sáng của thầy/cô: "Good morning, teacher!".'
  }
];
