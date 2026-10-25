-- ====================================================================
-- TRÒ CHƠI HỌC TẬP: "BỊT MẮT BẮT VỊT" (BLINDFOLD DUCK CATCHING)
-- SUPABASE DATABASE TABLES & RLS MIGRATION SCRIPT
-- Chạy 1-Click trong Supabase SQL Editor
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLES

-- Bảng 1: games (Thông tin game học tập)
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL DEFAULT 'Bịt Mắt Bắt Vịt',
    description TEXT DEFAULT 'Trò chơi dân gian Việt Nam - Học mà chơi, chơi mà học',
    subject TEXT DEFAULT 'Tiếng Anh',
    grade INT DEFAULT 7,
    mode TEXT DEFAULT 'quiz',
    duration_seconds INT DEFAULT 60,
    status TEXT DEFAULT 'active',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng 2: game_ducks (Danh sách vịt / học sinh trong game)
CREATE TABLE IF NOT EXISTS public.game_ducks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    dialogue TEXT,
    audio_url TEXT,
    speed FLOAT DEFAULT 1.0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng 3: game_questions (Câu hỏi tiếng Anh gắn liền với game)
CREATE TABLE IF NOT EXISTS public.game_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    points INT DEFAULT 10,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng 4: game_sessions (Lưu lịch sử lượt chơi & thành tích)
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    user_id UUID,
    player_name TEXT NOT NULL DEFAULT 'Học sinh',
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    mode TEXT DEFAULT 'quiz',
    score INT DEFAULT 0,
    ducks_caught INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    total_questions INT DEFAULT 0,
    combo_max INT DEFAULT 1,
    duration_seconds INT DEFAULT 60,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng 5: game_answers (Chi tiết từng câu trả lời)
CREATE TABLE IF NOT EXISTS public.game_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.game_questions(id) ON DELETE SET NULL,
    selected_answer TEXT,
    is_correct BOOLEAN DEFAULT false,
    points_earned INT DEFAULT 0,
    answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENABLE RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_ducks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_answers ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES
DROP POLICY IF EXISTS "Allow public read games" ON public.games;
CREATE POLICY "Allow public read games" ON public.games FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert games" ON public.games;
CREATE POLICY "Allow public insert games" ON public.games FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read game_ducks" ON public.game_ducks;
CREATE POLICY "Allow public read game_ducks" ON public.game_ducks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public manage game_ducks" ON public.game_ducks;
CREATE POLICY "Allow public manage game_ducks" ON public.game_ducks FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read game_questions" ON public.game_questions;
CREATE POLICY "Allow public read game_questions" ON public.game_questions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public manage game_questions" ON public.game_questions;
CREATE POLICY "Allow public manage game_questions" ON public.game_questions FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read game_sessions" ON public.game_sessions;
CREATE POLICY "Allow public read game_sessions" ON public.game_sessions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert game_sessions" ON public.game_sessions;
CREATE POLICY "Allow public insert game_sessions" ON public.game_sessions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read game_answers" ON public.game_answers;
CREATE POLICY "Allow public read game_answers" ON public.game_answers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert game_answers" ON public.game_answers;
CREATE POLICY "Allow public insert game_answers" ON public.game_answers FOR INSERT WITH CHECK (true);
