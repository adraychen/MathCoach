-- Gauss AI Coach: RLS Policies for Practice Sessions and Attempts
-- Run this in Supabase SQL Editor after 004

-- ============================================
-- 1. Enable RLS on tables
-- ============================================
ALTER TABLE gauss_practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gauss_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Practice Sessions Policies
-- ============================================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
ON gauss_practice_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
ON gauss_practice_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
ON gauss_practice_sessions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. Attempts Policies
-- ============================================

-- Users can view their own attempts
CREATE POLICY "Users can view own attempts"
ON gauss_attempts
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own attempts
CREATE POLICY "Users can insert own attempts"
ON gauss_attempts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own attempts
CREATE POLICY "Users can update own attempts"
ON gauss_attempts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. Admin/Teacher access (optional)
-- ============================================

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions"
ON gauss_practice_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.active = true
  )
);

-- Admins can view all attempts
CREATE POLICY "Admins can view all attempts"
ON gauss_attempts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.active = true
  )
);

-- Teachers can view their assigned students' sessions
CREATE POLICY "Teachers can view assigned students sessions"
ON gauss_practice_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM student_teacher_assignments sta
    JOIN profiles p ON p.id = auth.uid()
    WHERE sta.teacher_id = auth.uid()
    AND sta.student_id = gauss_practice_sessions.user_id
    AND sta.active = true
    AND p.role = 'teacher'
    AND p.active = true
  )
);

-- Teachers can view their assigned students' attempts
CREATE POLICY "Teachers can view assigned students attempts"
ON gauss_attempts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM student_teacher_assignments sta
    JOIN profiles p ON p.id = auth.uid()
    WHERE sta.teacher_id = auth.uid()
    AND sta.student_id = gauss_attempts.user_id
    AND sta.active = true
    AND p.role = 'teacher'
    AND p.active = true
  )
);
