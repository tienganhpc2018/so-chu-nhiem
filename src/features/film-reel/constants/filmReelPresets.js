/**
 * Hằng số, danh mục và dữ liệu mẫu cho Cuộn Phim Kỷ Niệm Lớp Học
 */

export const FILM_REEL_CATEGORIES = [
  { id: 'Học tập', label: 'Học tập', color: 'indigo', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'Văn nghệ', label: 'Văn nghệ', color: 'rose', badge: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'Dã ngoại', label: 'Dã ngoại', color: 'emerald', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'Thể thao', label: 'Thể thao', color: 'amber', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'Kỷ niệm', label: 'Kỷ niệm', color: 'purple', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'Khác', label: 'Khác', color: 'sky', badge: 'bg-sky-100 text-sky-800 border-sky-200' }
];

export const ACTIVITY_SUGGESTIONS = [
  'Lễ Tri Ân Thầy Cô 20/11',
  'Ngày Hội Sáng Tạo STEM',
  'Giải Bóng Đá Mini Lớp Học',
  'Tham Quan Dã Ngoại Trải Nghiệm',
  'Hội Thi Kể Chuyện Lịch Sử',
  'Tiết Sinh Hoạt Lớp Ấm Áp',
  'Cuộc Thi Rung Chuông Vàng',
  'Lễ Bế Giảng Năm Học'
];

// Kho ảnh minh họa thông minh theo chủ đề để AI tự sinh ảnh bìa
export const AI_STOCK_COVERS = {
  'Học tập': [
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80'
  ],
  'Văn nghệ': [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80'
  ],
  'Dã ngoại': [
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80'
  ],
  'Thể thao': [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80'
  ],
  'Kỷ niệm': [
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80'
  ],
  'Khác': [
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80'
  ]
};

// 3 Cuộn phim mẫu khởi tạo sinh động
export const PRESET_FILM_REELS = [
  {
    id: 'reel-preset-1',
    title: 'Lễ Kỷ Niệm Tri Ân Ngày Nhà Giáo Việt Nam 20/11',
    category: 'Văn nghệ',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    eventDate: '2026-11-20',
    likesCount: 38,
    isLiked: true,
    blocks: [
      {
        id: 'blk-1',
        type: 'paragraph',
        text: 'Sáng ngày 20/11, không khí lớp học rộn ràng hơn bao giờ hết với những lẵng hoa tươi thắm và những nụ cười rạng rỡ của các cô cậu học trò. Tập thể lớp đã bí mật chuẩn bị tiết mục văn nghệ đặc biệt từ cả tuần trước để tạo bất ngờ cho thầy cô.'
      },
      {
        id: 'blk-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1000&q=80',
        caption: 'Tiết mục múa tập thể rực rỡ sắc màu của các bạn nữ trong lớp.'
      },
      {
        id: 'blk-3',
        type: 'paragraph',
        text: 'Từng câu hát cất lên trong trẻo và lắng đọng tình cảm biết ơn sâu sắc gửi tới thầy cô. Những tấm thiệp nhỏ xinh tự tay các em cắt dán nắn nót từng dòng chúc khiến thầy cô không khỏi xúc động nghẹn ngào.'
      },
      {
        id: 'blk-4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
        caption: 'Cả lớp cùng hòa giọng trong ca khúc hát về mái trường mến yêu.'
      },
      {
        id: 'blk-5',
        type: 'paragraph',
        text: 'Buổi lễ khép lại bằng những cái ôm ấm áp và bức ảnh kỷ niệm đông đủ cả lớp. Đây chắc chắn sẽ là một trong những trang kỷ niệm rực rỡ nhất trong cuốn nhật ký học trò của các em.'
      }
    ],
    createdAt: '2026-11-20T10:00:00.000Z'
  },
  {
    id: 'reel-preset-2',
    title: 'Ngày Hội Khoa Học & Trải Nghiệm Sáng Tạo STEM',
    category: 'Học tập',
    coverImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
    eventDate: '2026-10-15',
    likesCount: 29,
    isLiked: false,
    blocks: [
      {
        id: 'blk-201',
        type: 'paragraph',
        text: 'Ngày hội STEM hôm nay biến phòng học thành một xưởng chế tạo tí hon đầy ắp tiếng reo hò hứng khởi. Các tổ cùng nhau thảo luận, lên ý tưởng và chế tạo mô hình cầu chịu lực bằng que gỗ và tên lửa nước áp suất.'
      },
      {
        id: 'blk-202',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
        caption: 'Các thành viên tổ 2 đang cẩn thận thử nghiệm độ bền của mô hình.'
      },
      {
        id: 'blk-203',
        type: 'paragraph',
        text: 'Dù có những lần thử nghiệm chưa thành công và tên lửa bị lệch hướng, các em vẫn không hề nản lòng mà nhanh chóng tìm nguyên nhân để cải tiến. Tinh thần học tập chủ động và hợp tác đồng đội tỏa sáng rạng ngời trong từng ánh mắt say mê.'
      },
      {
        id: 'blk-204',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80',
        caption: 'Thầy trò cùng vỡ òa chúc mừng sản phẩm hoàn thiện xuất sắc.'
      },
      {
        id: 'blk-205',
        type: 'paragraph',
        text: 'Một ngày học tập thực tế tràn ngập năng lượng, giúp các em thêm yêu thích các môn khoa học và tự tin biến những ý tưởng trên giấy thành hiện thực.'
      }
    ],
    createdAt: '2026-10-15T15:30:00.000Z'
  },
  {
    id: 'reel-preset-3',
    title: 'Chuyến Dã Ngoại Sinh Thái Gắn Kết Tình Bạn',
    category: 'Dã ngoại',
    coverImage: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
    eventDate: '2026-09-28',
    likesCount: 45,
    isLiked: true,
    blocks: [
      {
        id: 'blk-301',
        type: 'paragraph',
        text: 'Rời xa bảng đen phấn trắng và không gian lớp học quen thuộc, cả lớp đã có một ngày cuối tuần hòa mình vào thiên nhiên trong lành tại khu sinh thái ngoại ô.'
      },
      {
        id: 'blk-302',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        caption: 'Các em vui vẻ chia sẻ bữa trưa ngoài trời dưới bóng cây xanh mát.'
      },
      {
        id: 'blk-303',
        type: 'paragraph',
        text: 'Những trò chơi tập thể đòi hỏi sự ăn ý như kéo co, tiếp sức, giải mật thư đã giúp xóa nhòa mọi khoảng cách. Những bạn vốn ngày thường rụt rè hôm nay đã tự tin cười đùa và gắn kết cùng các bạn.'
      },
      {
        id: 'blk-304',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=80',
        caption: 'Tiếng cười giòn tan lưu giữ mãi khoảnh khắc thanh xuân tươi đẹp.'
      },
      {
        id: 'blk-305',
        type: 'paragraph',
        text: 'Chuyến đi không chỉ đem lại những tiếng cười sảng khoái mà còn bồi đắp thêm tình bạn keo sơn, chuẩn bị cho một năm học mới nhiều thành công.'
      }
    ],
    createdAt: '2026-09-28T16:00:00.000Z'
  }
];
