import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

/**
 * Đọc API Key từ process.env hoặc file .env
 */
function getGeminiApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY;

  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/(?:GEMINI_API_KEY|VITE_GEMINI_API_KEY)\s*=\s*([^\s\r\n]+)/);
      if (match && match[1]) return match[1].replace(/['"]/g, '').trim();
    }
  } catch (e) {}

  return null;
}

/**
 * Tạo nội dung fallback thông minh khi chưa cấu hình API key hoặc không có mạng
 */
function generateContextualFallback({ title = '', category = 'Kỷ niệm' }) {
  const fallbacks = {
    'Học tập': {
      caption: 'Những ánh mắt say mê, chăm chú khám phá từng bài học mới trong giờ học.',
      story: 'Tiết học hôm nay ngập tràn năng lượng tích cực của cả lớp. Các em học sinh chủ động giơ tay thảo luận, cùng nhau giải quyết những bài toán hóc búa và hỗ trợ bạn bè một cách nhiệt tình. Những khoảnh khắc say sưa ghi chép và nụ cười rạng rỡ khi tìm ra đáp án đúng chính là động lực lớn lao nhất của thầy cô mỗi ngày lên lớp.',
      suggestedTitle: title || 'Tiết Học Hứng Khởi & Sáng Tạo'
    },
    'Văn nghệ': {
      caption: 'Khoảnh khắc rực rỡ trên sân khấu với những nụ cười tỏa sáng và tiếng vỗ tay rộn rã.',
      story: 'Sau những ngày miệt mài tập luyện giờ ra chơi, các em đã mang đến một tiết mục biểu diễn vô cùng cảm xúc và bùng nổ. Từng giai điệu, từng bước nhảy đều chứa đựng sự hồn nhiên và tinh thần đồng đội tuyệt vời của tập thể lớp. Cả khán phòng như vỡ òa trong tiếng vỗ tay tự hào của thầy cô và bạn bè.',
      suggestedTitle: title || 'Khoảnh Khắc Tỏa Sáng Sân Khấu Lớp Học'
    },
    'Dã ngoại': {
      caption: 'Cùng nhau hòa mình vào thiên nhiên, lưu giữ những nụ cười rạng rỡ nhất của tuổi học trò.',
      story: 'Chuyến dã ngoại hôm nay đã mang lại cho các em biết bao trải nghiệm quý giá ngoài trang sách. Cùng nhau dựng trại, chia sẻ bữa ăn nhẹ và tham gia các trò chơi tập thể sôi động đã kéo các thành viên trong lớp xích lại gần nhau hơn. Những nụ cười tươi tắn và tiếng cười rộn rã sẽ mãi là hành trang kỷ niệm đẹp đẽ của tuổi học trò.',
      suggestedTitle: title || 'Hành Trình Gắn Kết & Trải Nghiệm Đáng Nhớ'
    },
    'Thể thao': {
      caption: 'Tinh thần thi đấu quả cảm, cháy hết mình vì màu cờ sắc áo của tập thể.',
      story: 'Trận đấu diễn ra đầy kịch tính với những pha bóng ngoạn mục và sự nỗ lực không ngừng nghỉ của các vận động viên nhí. Trên khán đài, các cổ động viên hò reo tiếp thêm sức mạnh cho từng bước chạy. Dù thắng hay bại, tinh thần thể thao cao thượng và sự đoàn kết của cả lớp mới chính là chiếc cúp vô địch quý giá nhất.',
      suggestedTitle: title || 'Bùng Nổ Năng Lượng & Tinh Thần Thể Thao'
    },
    'Kỷ niệm': {
      caption: 'Khoảnh khắc thân thương lưu giữ tình thầy trò và tình bạn tuổi học trò hồn nhiên.',
      story: 'Thời gian trôi đi thật nhanh, nhưng những khoảnh khắc ấm áp bên mái trường và bạn bè sẽ còn đọng lại mãi mãi. Nhìn các em cùng nhau trò chuyện, cười đùa và sẻ chia những ước mơ tuổi mới lớn, thầy cô cảm thấy vô cùng hạnh phúc khi được là người đồng hành nâng cánh cho các em trên chặng đường trưởng thành.',
      suggestedTitle: title || 'Nhật Ký Kỷ Niệm Thân Thương Dưới Mái Trường'
    },
    'Khác': {
      caption: 'Khoảnh khắc sinh động ghi dấu một ngày hoạt động đầy ắp niềm vui của lớp.',
      story: 'Mỗi ngày đến trường cùng các em là một trang nhật ký ngập tràn điều bất ngờ và niềm vui. Từ những điều giản dị như cùng nhau dọn dẹp phòng học, chuẩn bị báo tường đến những phút giây lắng đọng trong giờ sinh hoạt lớp, tất cả tạo nên một mái nhà chung ấm áp và thân thương.',
      suggestedTitle: title || 'Một Ngày Đầy Ý Nghĩa Của Tập Thể Lớp'
    }
  };

  return fallbacks[category] || fallbacks['Kỷ niệm'];
}

/**
 * Xử lý yêu cầu phân tích ảnh và sinh nội dung AI
 */
export async function handleDescribeImageRequest(reqBody) {
  const { image, title = '', category = 'Kỷ niệm' } = reqBody || {};

  if (!image) {
    return {
      success: false,
      error: 'Thiếu dữ liệu hình ảnh'
    };
  }

  const apiKey = getGeminiApiKey();

  // Nếu không có API Key, trả về fallback ngữ cảnh chất lượng cao
  if (!apiKey) {
    console.log('[AI Vision] Không tìm thấy GEMINI_API_KEY, sử dụng bộ sinh ngữ cảnh học đường.');
    const fallback = generateContextualFallback({ title, category });
    return {
      success: true,
      isFallback: true,
      caption: fallback.caption,
      story: fallback.story,
      suggestedTitle: fallback.suggestedTitle
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Chuẩn hóa dữ liệu Base64
    let mimeType = 'image/jpeg';
    let base64Data = image;

    if (image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    const systemPrompt = `Bạn là một trợ lý AI đồng hành cùng Giáo viên Chủ nhiệm Việt Nam.
Hãy quan sát bức ảnh hoạt động học sinh/lớp học này và sinh nội dung nhật ký lớp học:
1. "caption": 1 câu chú thích ảnh súc tích, tự nhiên, vui tươi (tối đa 20 từ).
2. "story": 1 đoạn văn nhật ký lớp học từ 60 đến 120 từ: văn phong ấm áp, gần gũi, giàu cảm xúc, tôn vinh tinh thần học trò và sự gắn kết lớp học.
3. "suggestedTitle": gợi ý 1 tiêu đề hoạt động súc tích, lôi cuốn (dưới 10 từ).

BẮT BUỘC trả về định dạng JSON thuần túy không có markdown bọc ngoài:
{"caption": "...", "story": "...", "suggestedTitle": "..."}`;

    // Thử gọi các model ưu tiên
    const modelsToTry = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemPrompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
                }
              ]
            }
          ]
        });

        const textResponse = response?.text?.trim() || '';
        let cleanJson = textResponse;
        if (cleanJson.startsWith('```json')) {
          cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(cleanJson);
        return {
          success: true,
          caption: parsed.caption || 'Khoảnh khắc lớp học tươi vui và ý nghĩa.',
          story: parsed.story || 'Những phút giây quý báu ghi dấu chặng đường học tập của lớp.',
          suggestedTitle: parsed.suggestedTitle || title || 'Kỷ Niệm Lớp Học'
        };
      } catch (err) {
        lastError = err;
        console.warn(`[AI Vision] Thử model ${modelName} thất bại, thử model tiếp theo...`, err.message);
      }
    }

    throw lastError || new Error('Không thể tạo nội dung qua Gemini API');
  } catch (err) {
    console.error('[AI Vision Error]:', err.message);
    const fallback = generateContextualFallback({ title, category });
    return {
      success: true,
      isFallback: true,
      caption: fallback.caption,
      story: fallback.story,
      suggestedTitle: fallback.suggestedTitle
    };
  }
}
