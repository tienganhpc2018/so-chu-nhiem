-- ====================================================================
-- SỔ CHỦ NHIỆM THCS - SUPABASE DATABASE SCHEMA & RLS MIGRATION SCRIPT
-- Phù hợp khối lớp 6, 7, 8, 9 - 1-Click Run in Supabase SQL Editor
-- ====================================================================

-- 1. EXTENSIONS & SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLES

-- Bảng Hồ sơ người dùng (Giáo viên / Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Lớp học (Khối 6, 7, 8, 9)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    grade_level INT NOT NULL CHECK (grade_level BETWEEN 6 AND 9),
    code TEXT UNIQUE NOT NULL,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Học sinh
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    seat_row INT DEFAULT 1,
    seat_col INT DEFAULT 1,
    total_stars INT DEFAULT 0,
    team_group INT DEFAULT 1,
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Danh mục (Tiêu chí cộng/trừ điểm hoặc Nhóm)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('point_criteria', 'group')),
    icon_name TEXT DEFAULT 'Star'
);

-- Bảng Lịch sử Tích điểm Thi đua
CREATE TABLE IF NOT EXISTS public.point_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    points_changed INT NOT NULL,
    reason TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('add', 'deduct')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Cửa hàng Phần thưởng Đổi Sao
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    required_stars INT NOT NULL DEFAULT 10
);

-- Bảng Học sinh nhận / đổi Phần thưởng
CREATE TABLE IF NOT EXISTS public.student_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Điểm danh Chuyên cần
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('present', 'late', 'absent_p', 'absent_kp')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date)
);

-- 3. INDEXES CHO TỐI ƯU HÓA TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_classes_grade_level ON public.classes(grade_level);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_point_history_student ON public.point_history(student_id);
CREATE INDEX IF NOT EXISTS idx_point_history_class ON public.point_history(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, date);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES PERMISSIVE FOR APP USE

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Drop existing restricted policies if any
DROP POLICY IF EXISTS "Profiles viewable" ON public.profiles;
DROP POLICY IF EXISTS "Classes viewable" ON public.classes;
DROP POLICY IF EXISTS "Students viewable" ON public.students;

-- Permissive policies for web app access
CREATE POLICY "Allow all profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all point_history" ON public.point_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all rewards" ON public.rewards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all student_rewards" ON public.student_rewards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);

-- 5. TRIGGERS

-- Trigger 1: Tự động chèn dữ liệu profile khi Đăng ký Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        'teacher',
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.id)
    )
    ON CONFLICT (email) DO NOTHING;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger 2: Tự động cập nhật tổng điểm Sao của Học sinh
CREATE OR REPLACE FUNCTION public.update_total_stars()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.action_type = 'add') THEN
        UPDATE public.students
        SET total_stars = total_stars + NEW.points_changed
        WHERE id = NEW.student_id;
    ELSIF (NEW.action_type = 'deduct') THEN
        UPDATE public.students
        SET total_stars = GREATEST(0, total_stars - NEW.points_changed)
        WHERE id = NEW.student_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_point_history_inserted ON public.point_history;
CREATE TRIGGER on_point_history_inserted
    AFTER INSERT ON public.point_history
    FOR EACH ROW EXECUTE FUNCTION public.update_total_stars();

-- 6. INITIAL SEED DATA & DEMO CLASS "8A5"

-- Chèn Danh mục Tiêu chí Cộng/Trừ điểm mặc định
INSERT INTO public.categories (name, type, icon_name) VALUES
('Hăng hái phát biểu', 'point_criteria', 'Sparkles'),
('Vệ sinh lớp sạch đẹp', 'point_criteria', 'Broom'),
('Chuẩn bị bài đầy đủ', 'point_criteria', 'BookOpen'),
('Giúp đỡ bạn học tập', 'point_criteria', 'HeartHandshake'),
('Đạt điểm giỏi kiểm tra', 'point_criteria', 'Award'),
('Nói chuyện trong giờ học', 'point_criteria', 'MessageSquareX'),
('Không làm bài tập về nhà', 'point_criteria', 'FileX'),
('Đi học muộn', 'point_criteria', 'ClockWarning'),
('Mất trật tự nề nếp', 'point_criteria', 'Volume2'),
('Sử dụng điện thoại trái phép', 'point_criteria', 'SmartphoneX')
ON CONFLICT DO NOTHING;

-- Chèn 5 Phần thưởng Đổi Sao mẫu
INSERT INTO public.rewards (title, description, icon_url, required_stars) VALUES
('Vé Đổi Chỗ 1 Ngày', 'Được tự chọn vị trí ngồi học thích hợp trong 1 ngày', 'https://api.dicebear.com/7.x/bottts/svg?seed=seat', 10),
('Miễn Kiểm Tra Bài Cũ', 'Thẻ miễn trừ 01 lần kiểm tra bài đầu giờ', 'https://api.dicebear.com/7.x/bottts/svg?seed=shield', 25),
('Trợ Lý Giáo Viên 1 Tuần', 'Được hỗ trợ giáo viên quản lý lớp & chấm điểm nhanh', 'https://api.dicebear.com/7.x/bottts/svg?seed=assistant', 30),
('Phần Quà Robot AI', 'Nhận 01 bộ dụng cụ học tập thông minh mascot Robot', 'https://api.dicebear.com/7.x/bottts/svg?seed=robot', 50),
('Thẻ Trưởng Nhóm Ưu Tiên', 'Được ưu tiên làm Trưởng nhóm và chọn thành viên', 'https://api.dicebear.com/7.x/bottts/svg?seed=star', 100)
ON CONFLICT DO NOTHING;

-- Tạo sẵn Lớp mẫu Lớp 8A5 (GVCN Nguyễn Văn Hải)
INSERT INTO public.classes (id, name, grade_level, code) VALUES
('8a500000-0000-0000-0000-0000000008a5', '8A5', 8, '8A5-2026')
ON CONFLICT DO NOTHING;

-- Tạo sẵn 18 Học sinh lớp 8A5 với các vị trí bàn học 4x6
INSERT INTO public.students (class_id, full_name, avatar_url, seat_row, seat_col, total_stars, team_group) VALUES
('8a500000-0000-0000-0000-0000000008a5', 'Nguyễn Minh Anh', 'https://api.dicebear.com/7.x/bottts/svg?seed=minhanh', 1, 1, 45, 1),
('8a500000-0000-0000-0000-0000000008a5', 'Trần Bảo Nam', 'https://api.dicebear.com/7.x/bottts/svg?seed=baonam', 1, 2, 30, 1),
('8a500000-0000-0000-0000-0000000008a5', 'Lê Hoàng Khánh', 'https://api.dicebear.com/7.x/bottts/svg?seed=hoangkhanh', 1, 3, 50, 1),
('8a500000-0000-0000-0000-0000000008a5', 'Phạm Thu Trang', 'https://api.dicebear.com/7.x/bottts/svg?seed=thutrang', 1, 4, 65, 2),
('8a500000-0000-0000-0000-0000000008a5', 'Vũ Đức Anh', 'https://api.dicebear.com/7.x/bottts/svg?seed=ducanh', 1, 5, 25, 2),
('8a500000-0000-0000-0000-0000000008a5', 'Đặng Thảo Nguyên', 'https://api.dicebear.com/7.x/bottts/svg?seed=thaonguyen', 1, 6, 40, 2),

('8a500000-0000-0000-0000-0000000008a5', 'Bùi Gia Huy', 'https://api.dicebear.com/7.x/bottts/svg?seed=giahuy', 2, 1, 35, 3),
('8a500000-0000-0000-0000-0000000008a5', 'Đỗ Phương Linh', 'https://api.dicebear.com/7.x/bottts/svg?seed=phuonglinh', 2, 2, 80, 3),
('8a500000-0000-0000-0000-0000000008a5', 'Nông Văn Mạnh', 'https://api.dicebear.com/7.x/bottts/svg?seed=vanmanh', 2, 3, 20, 3),
('8a500000-0000-0000-0000-0000000008a5', 'Hà Ánh Tuyết', 'https://api.dicebear.com/7.x/bottts/svg?seed=anhtuyet', 2, 4, 55, 4),
('8a500000-0000-0000-0000-0000000008a5', 'Ngô Quốc Trung', 'https://api.dicebear.com/7.x/bottts/svg?seed=quoctrung', 2, 5, 15, 4),
('8a500000-0000-0000-0000-0000000008a5', 'Dương Mỹ Duyên', 'https://api.dicebear.com/7.x/bottts/svg?seed=myduyen', 2, 6, 70, 4),

('8a500000-0000-0000-0000-0000000008a5', 'Lý Hải Long', 'https://api.dicebear.com/7.x/bottts/svg?seed=hailong', 3, 1, 60, 1),
('8a500000-0000-0000-0000-0000000008a5', 'Trịnh Cẩm Tú', 'https://api.dicebear.com/7.x/bottts/svg?seed=camtu', 3, 2, 40, 2),
('8a500000-0000-0000-0000-0000000008a5', 'Đoàn Quang Vinh', 'https://api.dicebear.com/7.x/bottts/svg?seed=quangvinh', 3, 3, 90, 3),
('8a500000-0000-0000-0000-0000000008a5', 'Mai Ngọc Hà', 'https://api.dicebear.com/7.x/bottts/svg?seed=ngocha', 3, 4, 75, 4),
('8a500000-0000-0000-0000-0000000008a5', 'Lương Minh Tuấn', 'https://api.dicebear.com/7.x/bottts/svg?seed=minhtuan', 3, 5, 30, 1),
('8a500000-0000-0000-0000-0000000008a5', 'Tào Thanh Thảo', 'https://api.dicebear.com/7.x/bottts/svg?seed=thanhthao', 3, 6, 45, 2)
ON CONFLICT DO NOTHING;

-- Xong! Đã hoàn thành khởi tạo SQL Schema permissive & Lớp mẫu 8A5.
