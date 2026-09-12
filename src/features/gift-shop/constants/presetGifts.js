/**
 * 6 Món quà học đường mẫu mặc định dành cho Cửa Hàng Đổi Quà
 */
export const PRESET_GIFTS = [
  {
    id: 'preset-1',
    name: 'Bút highlight dạ quang pastel',
    requiredCoins: 10,
    stock: 20,
    category: 'Dụng cụ học tập',
    image: '🖍️',
    color: 'amber'
  },
  {
    id: 'preset-2',
    name: 'Sổ tay lò xo bìa hoạt hình',
    requiredCoins: 15,
    stock: 15,
    category: 'Dụng cụ học tập',
    image: '📓',
    color: 'sky'
  },
  {
    id: 'preset-3',
    name: 'Thước kẻ phát sáng phản quang',
    requiredCoins: 8,
    stock: 25,
    category: 'Dụng cụ học tập',
    image: '📏',
    color: 'emerald'
  },
  {
    id: 'preset-4',
    name: 'Móc khóa thú bông mini',
    requiredCoins: 20,
    stock: 10,
    category: 'Đồ lưu niệm',
    image: '🧸',
    color: 'rose'
  },
  {
    id: 'preset-5',
    name: 'Thẻ miễn bài tập về nhà 1 lần',
    requiredCoins: 30,
    stock: 5,
    category: 'Đặc quyền học tập',
    image: '🎟️',
    color: 'purple'
  },
  {
    id: 'preset-6',
    name: 'Bình nước thể thao học sinh',
    requiredCoins: 50,
    stock: 8,
    category: 'Đồ lưu niệm',
    image: '🍶',
    color: 'indigo'
  }
];

export const GIFT_CATEGORIES = [
  'Dụng cụ học tập',
  'Đồ lưu niệm',
  'Đặc quyền học tập',
  'Bánh kẹo / Đồ ăn nhẹ',
  'Khác'
];

export const COLOR_THEMES = [
  {
    id: 'rose',
    label: 'Hồng Rose',
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    badge: 'bg-rose-100 text-rose-700',
    button: 'from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700',
    iconColor: 'text-rose-500'
  },
  {
    id: 'amber',
    label: 'Vàng Hổ Phách',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    badge: 'bg-amber-100 text-amber-800',
    button: 'from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700',
    iconColor: 'text-amber-500'
  },
  {
    id: 'emerald',
    label: 'Xanh Ngọc Lục',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800',
    button: 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
    iconColor: 'text-emerald-500'
  },
  {
    id: 'indigo',
    label: 'Xanh Chàm',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300',
    badge: 'bg-indigo-100 text-indigo-800',
    button: 'from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700',
    iconColor: 'text-indigo-500'
  },
  {
    id: 'purple',
    label: 'Tím Hoàng Gia',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    badge: 'bg-purple-100 text-purple-800',
    button: 'from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700',
    iconColor: 'text-purple-500'
  },
  {
    id: 'sky',
    label: 'Xanh Da Trời',
    bg: 'bg-sky-50',
    border: 'border-sky-300',
    badge: 'bg-sky-100 text-sky-800',
    button: 'from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700',
    iconColor: 'text-sky-500'
  }
];

export const POPULAR_EMOJIS = [
  '🎁', '🖍️', '📓', '📏', '🧸', '🎟️', '🍶', '⭐', '🎒', '📚',
  '🎨', '🏆', '🥇', '🍫', '🧃', '🍪', '⚽', '🎯', '🏸', '🎧'
];
