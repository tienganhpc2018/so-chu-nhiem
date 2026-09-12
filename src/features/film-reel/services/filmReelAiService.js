/**
 * Service gọi API AI Vision mô tả ảnh và sinh nội dung nhật ký lớp học
 */

export async function describeImageWithAi({ image, title = '', category = 'Kỷ niệm' }) {
  try {
    const response = await fetch('/api/ai/describe-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image, title, category })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.success) {
        return {
          success: true,
          caption: data.caption,
          story: data.story,
          suggestedTitle: data.suggestedTitle,
          isFallback: Boolean(data.isFallback)
        };
      }
    }
  } catch (e) {
    console.warn('[AI Service] Không kết nối được API server, chuyển sang fallback cục bộ:', e.message);
  }

  // Fallback cục bộ thông minh nếu không có kết nối server
  const localFallbacks = {
    'Học tập': {
      caption: 'Những ánh mắt chăm chú, tích cực thảo luận và khám phá tri thức mới.',
      story: 'Giờ học hôm nay diễn ra trong không khí sôi nổi và hào hứng. Các em hăng hái phát biểu, cùng nhau giải quyết từng câu hỏi hóc búa với sự tập trung cao độ và tinh thần đồng đội đáng khen ngợi.',
      suggestedTitle: title || 'Tiết Học Say Mê & Sáng Tạo'
    },
    'Văn nghệ': {
      caption: 'Những giai điệu rộn rã và nụ cười rực rỡ tỏa sáng trên sân khấu.',
      story: 'Tiết mục biểu diễn của lớp đã mang lại bầu không khí vô cùng náo nức. Sự tự tin, hồn nhiên và gắn kết của các em đã nhận được những tràng pháo tay cổ vũ nồng nhiệt từ toàn trường.',
      suggestedTitle: title || 'Khoảnh Khắc Tỏa Sáng Nghệ Thuật'
    },
    'Dã ngoại': {
      caption: 'Hòa mình giữa thiên nhiên, cùng nhau tạo nên những kỷ niệm khó quên.',
      story: 'Chuyến dã ngoại mang đến cho các em một không gian mở để vui chơi, vận động và thắt chặt tình bạn bè. Những tiếng cười giòn giã sẽ là ký ức đẹp mãi theo bước chân học trò.',
      suggestedTitle: title || 'Hành Trình Dã Ngoại Trải Nghiệm'
    },
    'Thể thao': {
      caption: 'Những bước chạy nhiệt huyết, cháy hết mình vì tinh thần đồng đội.',
      story: 'Trận thi đấu thể thao đầy kịch tính với sự cổ vũ cuồng nhiệt của cả lớp. Dù kết quả ra sao, tinh thần đoàn kết và nỗ lực bền bỉ mới chính là chiến thắng lớn nhất của các em.',
      suggestedTitle: title || 'Khí Thế Thể Thao Sôi Động'
    },
    'Kỷ niệm': {
      caption: 'Khoảnh khắc thân thương ghi dấu tình bạn và tình thầy trò dưới mái trường.',
      story: 'Mỗi khoảnh khắc bên nhau đều là một trang lưu bút vô giá của tuổi học trò. Nhìn các em rạng rỡ bên nhau, thầy cô càng thêm trân trọng những tháng ngày được đồng hành cùng lớp.',
      suggestedTitle: title || 'Nhật Ký Kỷ Niệm Thân Thương'
    },
    'Khác': {
      caption: 'Khoảnh khắc đáng nhớ ghi lại một ngày hoạt động đầy ắp niềm vui.',
      story: 'Một hoạt động ý nghĩa và giàu cảm xúc của tập thể lớp. Tinh thần tự giác, nhiệt tình tham gia của từng thành viên đã góp phần tạo nên một ngày thật trọn vẹn và đáng nhớ.',
      suggestedTitle: title || 'Khoảnh Khắc Ý Nghĩa Của Lớp'
    }
  };

  const selected = localFallbacks[category] || localFallbacks['Kỷ niệm'];
  return {
    success: true,
    caption: selected.caption,
    story: selected.story,
    suggestedTitle: selected.suggestedTitle,
    isFallback: true
  };
}
