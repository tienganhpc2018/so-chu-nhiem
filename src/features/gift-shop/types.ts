/**
 * Định nghĩa cấu trúc dữ liệu cho Mô-đun Cửa Hàng Đổi Quà (Gift Shop & Reward Redemption)
 */

export interface GiftItem {
  id: string;
  classId: string;
  name: string;
  requiredCoins: number;
  stock: number;
  category: string;
  image: string; // Base64 image, URL, hoặc Emoji
  color: string; // 'rose' | 'amber' | 'emerald' | 'indigo' | 'purple' | 'sky'
  redemptionLimit?: 'none' | 'week' | 'month' | 'semester'; // Giới hạn tần suất quy đổi
  createdAt?: string;
}

export interface GiftRedemption {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  giftId: string;
  giftName: string;
  coinsSpent: number;
  timestamp: string; // ISO String
}

export interface StudentWithCoins {
  id: string;
  full_name: string;
  coins: number;
  total_stars?: number;
  avatar_url?: string;
  team_group?: number;
  seat_row?: number;
  seat_col?: number;
}
