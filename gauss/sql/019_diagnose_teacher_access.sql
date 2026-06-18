-- Diagnostic SQL to check teacher access to student program assignments
-- Run this in Supabase SQL Editor

-- 1. Check Teacher Ray's profile
SELECT id, display_name, role, active, approval_status
FROM profiles
WHERE display_name LIKE '%Ray%' OR role = 'teacher';

-- 2. Check student-teacher assignments for Teacher Ray
SELECT sta.*, p.display_name as student_name
FROM student_teacher_assignments sta
JOIN profiles p ON p.id = sta.student_id
WHERE sta.teacher_id IN (SELECT id FROM profiles WHERE display_name LIKE '%Ray%');

-- 3. Check all student program assignments
SELECT spa.*, p.display_name as student_name, mp.program_name
FROM student_program_assignments spa
JOIN profiles p ON p.id = spa.student_id
JOIN mathcoach_programs mp ON mp.id = spa.program_id;

-- 4. Check RLS policies on student_program_assignments
SELECT policyname, cmd, qual::text
FROM pg_policies
WHERE tablename = 'student_program_assignments';
