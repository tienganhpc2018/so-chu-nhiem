-- ====================================================================
-- SỔ CHỦ NHIỆM THCS - SUPABASE DATABASE SCHEMA & RLS MIGRATION SCRIPT
-- Phù hợp khối lớp 6, 7, 8, 9 - 1-Click Run in Supabase SQL Editor
-- ====================================================================

-- 1. EXTENSIONS & SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLES

-- Bảng Hồ sơ người dùng (Giáo viên / Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
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
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_point_history_student ON public.point_history(student_id);
CREATE INDEX IF NOT EXISTS idx_point_history_class ON public.point_history(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, date);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Policy Profiles
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Policy Classes
CREATE POLICY "Teachers can view their own classes" ON public.classes
    FOR SELECT TO authenticated USING (teacher_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Teachers can insert their own classes" ON public.classes
    FOR INSERT TO authenticated WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own classes" ON public.classes
    FOR UPDATE TO authenticated USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own classes" ON public.classes
    FOR DELETE TO authenticated USING (teacher_id = auth.uid());

-- Helper Function check class ownership
CREATE OR REPLACE FUNCTION public.is_teacher_of_class(c_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.classes
        WHERE id = c_id AND teacher_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy Students
CREATE POLICY "Teachers can view students in their classes" ON public.students
    FOR SELECT TO authenticated USING (public.is_teacher_of_class(class_id));

CREATE POLICY "Teachers can insert students into their classes" ON public.students
    FOR INSERT TO authenticated WITH CHECK (public.is_teacher_of_class(class_id));

CREATE POLICY "Teachers can update students in their classes" ON public.students
    FOR UPDATE TO authenticated USING (public.is_teacher_of_class(class_id));

CREATE POLICY "Teachers can delete students in their classes" ON public.students
    FOR DELETE TO authenticated USING (public.is_teacher_of_class(class_id));

-- Policy Categories
CREATE POLICY "Categories viewable by authenticated" ON public.categories
    FOR SELECT TO authenticated USING (true);

-- Policy Point History
CREATE POLICY "Teachers view point history" ON public.point_history
    FOR SELECT TO authenticated USING (public.is_teacher_of_class(class_id));

CREATE POLICY "Teachers insert point history" ON public.point_history
    FOR INSERT TO authenticated WITH CHECK (public.is_teacher_of_class(class_id));

-- Policy Rewards
CREATE POLICY "Rewards viewable by authenticated" ON public.rewards
    FOR SELECT TO authenticated USING (true);

-- Policy Student Rewards
CREATE POLICY "Teachers view student rewards" ON public.student_rewards
    FOR SELECT TO authenticated USING (EXISTS (
        SELECT 1 FROM public.students s WHERE s.id = student_id AND public.is_teacher_of_class(s.class_id)
    ));

CREATE POLICY "Teachers insert student rewards" ON public.student_rewards
    FOR INSERT TO authenticated WITH CHECK (EXISTS (
        SELECT 1 FROM public.students s WHERE s.id = student_id AND public.is_teacher_of_class(s.class_id)
    ));

-- Policy Attendance
CREATE POLICY "Teachers manage attendance" ON public.attendance
    FOR ALL TO authenticated USING (EXISTS (
        SELECT 1 FROM public.students s WHERE s.id = student_id AND public.is_teacher_of_class(s.class_id)
    ));

-- 5. TRIGGERS

-- Trigger 1: Tự động chèn dữ liệu profile khi Giáo viên Đăng ký Supabase Auth
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
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger 2: Tự động cập nhật tổng số điểm Sao (total_stars) của Học sinh khi có point_history mới
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

-- 6. INITIAL SEED DATA

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

-- Xong! Đã khởi tạo hoàn tất SQL Schema cho Sổ Chủ Nhiệm THCS.
