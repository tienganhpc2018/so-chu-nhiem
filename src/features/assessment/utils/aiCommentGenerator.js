/**
 * AI Pedagogical Comment Engine for Middle School (THCS)
 * Strictly follows Circular 22/2021/TT-BGDĐT
 */

const COMMENT_BANKS = {
  'Tiếng Anh': {
    excellent: [
      'Nắm rất vững ngữ pháp và vốn từ vựng phong phú, phát âm chuẩn, phản xạ giao tiếp tự tin và trôi chảy.',
      'Kỹ năng Đọc hiểu và Viết câu xuất sắc. Tích cực tham gia phát biểu xây dựng bài trong giờ học tiếng Anh.',
      'Khả năng nghe hiểu và sử dụng cấu trúc câu linh hoạt, tư duy ngôn ngữ tốt, hoàn thành xuất sắc các bài kiểm tra.',
      'Có năng khiếu học ngoại ngữ, phát âm rõ ràng, làm bài tập đầy đủ và luôn hỗ trợ các bạn trong nhóm học tập.'
    ],
    good: [
      'Nắm chắc kiến thức trọng tâm bài học, đọc - viết tốt. Cần tự tin hơn nữa khi thực hành kỹ năng nói.',
      'Có ý thức học tập chăm chỉ, vốn từ vựng khá, ngữ pháp cơ bản vững vàng. Phát huy thêm phản xạ nghe hiểu.',
      'Hiểu bài nhanh, hoàn thành tốt các bài kiểm tra định kỳ. Nên tích cực luyện tập phát âm chuẩn ngữ điệu.',
      'Kỹ năng Đọc và Viết đạt kết quả tốt. Cần mạnh dạn hơn khi tham gia các hoạt động hội thoại tiếng Anh trên lớp.'
    ],
    average_plus: [
      'Có cố gắng trong học tập, nắm được từ vựng và ngữ pháp cơ bản. Cần dành thêm thời gian luyện kỹ năng nghe.',
      'Tiếp thu bài tương đối tốt, làm bài tập đầy đủ. Cần rèn luyện thêm kỹ năng đặt câu và mở rộng vốn từ.',
      'Có tiến bộ trong các bài kiểm tra gần đây. Cần chú ý cẩn thận hơn trong các dạng bài tập chia động từ.',
      'Nắm được các mẫu câu giao tiếp thông dụng. Cần tập trung hơn để cải thiện kỹ năng Đọc hiểu văn bản.'
    ],
    needs_improvement: [
      'Cần tập trung hơn trong giờ học, ôn tập lại các cấu trúc ngữ pháp cơ bản và củng cố vốn từ vựng.',
      'Kỹ năng Đọc và Nghe còn hạn chế. Cần tăng cường làm bài tập về nhà và tự giác hỏi thầy cô khi chưa hiểu bài.',
      'Cần nỗ lực nhiều hơn trong học tập, chú ý lắng nghe giảng và tích cực tham gia hoạt động nhóm để tiến bộ.',
      'Còn lúng túng khi vận dụng ngữ pháp và từ vựng. Cần xây dựng kế hoạch tự học tại nhà đều đặn hơn.'
    ]
  },
  'Chung': {
    excellent: [
      'Nắm vững toàn bộ kiến thức trọng tâm, tư duy logic tốt, hoàn thành xuất sắc các yêu cầu môn học.',
      'Ý thức học tập gương mẫu, chăm chỉ, tích cực phát biểu xây dựng bài và luôn đạt điểm số cao.',
      'Khả năng tự học và vận dụng kiến thức vào thực tiễn rất tốt. Đạt thành tích xuất sắc trong học kỳ.'
    ],
    good: [
      'Nắm chắc kiến thức cơ bản, có tinh thần cầu tiến trong học tập, hoàn thành tốt các nhiệm vụ được giao.',
      'Học tập chăm chỉ, tiếp thu bài nhanh, kết quả kiểm tra định kỳ đạt mức Khá tốt.',
      'Có tiến bộ rõ rệt trong học kỳ, ý thức học tập tốt, cần phát huy thêm tính chủ động sáng tạo.'
    ],
    average_plus: [
      'Nắm được các kiến thức cơ bản của môn học. Cần cẩn thận hơn khi làm bài kiểm tra để nâng cao điểm số.',
      'Có ý thức học bài và làm bài tập. Cần tăng cường tính chủ động phát biểu và rèn luyện kỹ năng giải quyết vấn đề.',
      'Tiếp thu bài tương đối tốt. Cần dành thêm thời gian ôn tập kiến thức cũ để đạt kết quả cao hơn.'
    ],
    needs_improvement: [
      'Cần tập trung chú ý hơn trong giờ học, chăm chỉ hoàn thành bài tập về nhà và ôn luyện kiến thức hổng.',
      'Kết quả học tập chưa đạt như kỳ vọng. Cần nghiêm túc hơn trong học tập và chủ động nhờ thầy cô hỗ trợ.',
      'Còn thụ động trong giờ học. Cần nỗ lực và tự giác rèn luyện nhiều hơn để cải thiện kết quả môn học.'
    ]
  }
};

const SHORT_COMMENTS = {
  excellent: [
    'Nắm bài rất vững, tích cực phát biểu, kết quả xuất sắc.',
    'Tư duy tốt, chăm chỉ, hoàn thành bài học rất tốt.',
    'Ý thức học tập gương mẫu, kết quả đạt mức Xuất sắc.'
  ],
  good: [
    'Nắm chắc kiến thức, chăm chỉ, kết quả học tập tốt.',
    'Tiếp thu bài nhanh, làm bài cẩn thận, đạt mức Khá tốt.',
    'Có tiến bộ rõ rệt, ý thức học tập rất đáng khen ngợi.'
  ],
  average_plus: [
    'Nắm được kiến thức cơ bản, cần cố gắng hơn ở kỹ năng nghe - nói.',
    'Có cố gắng trong học tập, cần cẩn thận hơn khi làm bài.',
    'Đạt yêu cầu môn học, cần chăm chỉ rèn luyện thêm tại nhà.'
  ],
  needs_improvement: [
    'Cần tập trung học bài và bổ sung kiến thức còn thiếu.',
    'Cần chăm chỉ hơn, tích cực làm bài tập về nhà đầy đủ.',
    'Cần nỗ lực nhiều hơn để cải thiện kết quả học tập.'
  ]
};

export const generateStudentComment = (student, scores = {}, subject = 'Tiếng Anh', style = 'standard') => {
  const { tbm } = scores;
  const bank = COMMENT_BANKS[subject] || COMMENT_BANKS['Chung'];

  let level = 'average_plus';
  if (tbm !== null && tbm !== undefined && !isNaN(tbm)) {
    if (tbm >= 8.5) level = 'excellent';
    else if (tbm >= 6.5) level = 'good';
    else if (tbm >= 5.0) level = 'average_plus';
    else level = 'needs_improvement';
  }

  // Pick suitable list
  let candidateList = style === 'short' ? (SHORT_COMMENTS[level] || SHORT_COMMENTS['good']) : (bank[level] || bank['good']);

  // Random pick based on student name hash so it stays consistent yet varied across students
  const seed = (student?.full_name || 'HS').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pickedIndex = seed % candidateList.length;
  let baseComment = candidateList[pickedIndex];

  // Optional personal touch for 'detailed' style
  if (style === 'detailed') {
    if (level === 'excellent') {
      baseComment += ' Tiếp tục phát huy thế mạnh để đạt thành tích cao hơn nữa!';
    } else if (level === 'good') {
      baseComment += ' Thầy/cô tin tưởng em sẽ bứt phá mạnh mẽ trong học kỳ tới!';
    } else if (level === 'average_plus') {
      baseComment += ' Cần chú ý rèn luyện đều đặn hằng ngày để tiến bộ vững chắc.';
    } else {
      baseComment += ' Cần phối hợp cùng giáo viên và gia đình để có kế hoạch rèn luyện phù hợp.';
    }
  }

  return baseComment;
};
