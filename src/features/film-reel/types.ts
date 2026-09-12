/**
 * Định nghĩa cấu trúc dữ liệu cho Tính năng Cuộn Phim Kỷ Niệm Lớp Học (Film Reel)
 */

export type FilmReelCategory = 
  | 'Học tập' 
  | 'Văn nghệ' 
  | 'Dã ngoại' 
  | 'Thể thao' 
  | 'Kỷ niệm' 
  | 'Khác';

export interface FilmReelBlock {
  id: string;
  type: 'paragraph' | 'image';
  text?: string;
  url?: string;
  caption?: string;
  aiGenerated?: boolean;
}

export interface FilmReelItem {
  id: string;
  classId: string;
  title: string;
  category: FilmReelCategory;
  coverImage: string;
  eventDate: string; // YYYY-MM-DD hoặc DD/MM/YYYY
  blocks: FilmReelBlock[];
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt?: string;
}
