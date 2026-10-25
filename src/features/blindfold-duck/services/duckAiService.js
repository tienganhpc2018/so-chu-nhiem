/**
 * Service AI sinh câu hỏi Tiếng Anh tự động cho trò chơi Bịt Mắt Bắt Vịt
 * Tích hợp Gemini AI & Bộ sinh câu hỏi tiếng Anh THCS chuẩn chương trình mới
 */

export async function generateEnglishQuestionsAi({ topic = 'Unit 2 - City Life - Grade 9', count = 5 }) {
  try {
    const response = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, count, subject: 'English' })
    });

    if (response.ok) {
      const result = await response.json();
      if (result && result.success && Array.isArray(result.questions)) {
        return {
          success: true,
          questions: result.questions,
          isAiLive: true
        };
      }
    }
  } catch (e) {
    // API server fallback
  }

  // Bộ sinh câu hỏi tự động chuẩn ngữ pháp & từ vựng THCS (Grade 6-9)
  const topicBank = [
    {
      question: `Which word is OPPOSITE in meaning to "crowded" in ${topic}?`,
      option_a: 'noisy',
      option_b: 'quiet',
      option_c: 'peaceful',
      option_d: 'busy',
      correct_answer: 'C',
      explanation: 'Trái nghĩa với "crowded" (đông đúc) là "peaceful" (yên bình, vắng lặng) hoặc "empty".',
      points: 10
    },
    {
      question: 'She suggested that we ______ the historical museum this weekend.',
      option_a: 'visit',
      option_b: 'visited',
      option_c: 'visiting',
      option_d: 'to visit',
      correct_answer: 'A',
      explanation: 'Cấu trúc giả định: S + suggest + that + S + (should) + V-nguyên thể.',
      points: 10
    },
    {
      question: 'The metro system in modern cities helps reduce traffic ______.',
      option_a: 'lights',
      option_b: 'jams',
      option_c: 'rules',
      option_d: 'signs',
      correct_answer: 'B',
      explanation: 'Cụm danh từ: traffic jams (tắc nghẽn giao thông / kẹt xe).',
      points: 10
    },
    {
      question: 'Living in the city is much more convenient ______ living in the countryside.',
      option_a: 'as',
      option_b: 'than',
      option_c: 'more',
      option_d: 'from',
      correct_answer: 'B',
      explanation: 'So sánh hơn tính từ dài: more + adj + than (more convenient than).',
      points: 10
    },
    {
      question: 'People who live in big cities often ______ from stress due to busy life.',
      option_a: 'suffer',
      option_b: 'enjoy',
      option_c: 'keep',
      option_d: 'take',
      correct_answer: 'A',
      explanation: 'Cụm động từ: suffer from (chịu đựng, khổ sở vì điều gì).',
      points: 10
    },
    {
      question: 'I wish I ______ visit London and practice English with native speakers.',
      option_a: 'can',
      option_b: 'could',
      option_c: 'will',
      option_d: 'am able to',
      correct_answer: 'B',
      explanation: 'Cấu trúc câu ước ở hiện tại/tương lai: S + wish + S + could + V.',
      points: 10
    }
  ];

  const selected = topicBank.slice(0, Math.min(count, topicBank.length)).map((q, idx) => ({
    ...q,
    id: `ai_q_${Date.now()}_${idx}`
  }));

  return {
    success: true,
    questions: selected,
    isAiLive: false
  };
}
