-- MathCoach: Programs and Student Program Assignments
-- Migration 015
-- Run this in Supabase SQL Editor
--
-- This migration:
-- 1. Creates mathcoach_programs table
-- 2. Creates student_program_assignments table
-- 3. Seeds initial Gauss programs (Grade 7, Grade 8)
-- 4. Sets up RLS policies

-- ============================================
-- 1. Create mathcoach_programs table
-- ============================================

CREATE TABLE IF NOT EXISTS mathcoach_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_code text UNIQUE NOT NULL,
  program_name text NOT NULL,
  description text,
  grade int NOT NULL,
  program_type text NOT NULL DEFAULT 'gauss',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mathcoach_programs_code ON mathcoach_programs(program_code);
CREATE INDEX IF NOT EXISTS idx_mathcoach_programs_type_grade ON mathcoach_programs(program_type, grade);

-- ============================================
-- 2. Create student_program_assignments table
-- ============================================

CREATE TABLE IF NOT EXISTS student_program_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES mathcoach_programs(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id),
  active boolean DEFAULT true,
  assigned_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  UNIQUE(student_id, program_id)
);

CREATE INDEX IF NOT EXISTS idx_student_program_assignments_student ON student_program_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_program_assignments_program ON student_program_assignments(program_id);
CREATE INDEX IF NOT EXISTS idx_student_program_assignments_active ON student_program_assignments(student_id, active);

-- ============================================
-- 3. Seed initial Gauss programs
-- ============================================

INSERT INTO mathcoach_programs (program_code, program_name, description, grade, program_type)
VALUES
  ('G7gauss', 'Grade 7 Gauss Contest', 'Waterloo Mathematics Competition Practice for Grade 7', 7, 'gauss'),
  ('G8gauss', 'Grade 8 Gauss Contest', 'Waterloo Mathematics Competition Practice for Grade 8', 8, 'gauss')
ON CONFLICT (program_code) DO UPDATE SET
  program_name = EXCLUDED.program_name,
  description = EXCLUDED.description,
  grade = EXCLUDED.grade,
  program_type = EXCLUDED.program_type;

-- ============================================
-- 4. RLS Policies
-- ============================================

ALTER TABLE mathcoach_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_program_assignments ENABLE ROW LEVEL SECURITY;

-- Programs: all authenticated users can view active programs
CREATE POLICY "Authenticated users can view active programs"
ON mathcoach_programs
FOR SELECT
USING (auth.uid() IS NOT NULL AND active = true);

-- Admins can manage programs
CREATE POLICY "Admins can manage programs"
ON mathcoach_programs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.active = true
  )
);

-- Student program assignments: students can view their own
CREATE POLICY "Students can view own program assignments"
ON student_program_assignments
FOR SELECT
USING (auth.uid() = student_id);

-- Admins can manage all assignments
CREATE POLICY "Admins can manage program assignments"
ON student_program_assignments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.active = true
  )
);

-- Teachers can view their assigned students' program assignments
CREATE POLICY "Teachers can view assigned students program assignments"
ON student_program_assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM student_teacher_assignments sta
    JOIN profiles p ON p.id = auth.uid()
    WHERE sta.teacher_id = auth.uid()
    AND sta.student_id = student_program_assignments.student_id
    AND sta.active = true
    AND p.role = 'teacher'
    AND p.active = true
  )
);

-- Teachers can assign programs to their students
CREATE POLICY "Teachers can assign programs to their students"
ON student_program_assignments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM student_teacher_assignments sta
    JOIN profiles p ON p.id = auth.uid()
    WHERE sta.teacher_id = auth.uid()
    AND sta.student_id = student_program_assignments.student_id
    AND sta.active = true
    AND p.role = 'teacher'
    AND p.active = true
  )
);

-- ============================================
-- 5. Verify
-- ============================================

SELECT 'Programs created:' as status;
SELECT program_code, program_name, grade, program_type FROM mathcoach_programs ORDER BY grade;
