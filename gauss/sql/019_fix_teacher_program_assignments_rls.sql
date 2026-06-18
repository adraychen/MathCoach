-- Fix RLS policy for teachers to view student program assignments
-- Run this in Supabase SQL Editor

-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Teachers can view assigned students program assignments" ON student_program_assignments;

-- Create a simpler policy that allows teachers to view program assignments
-- for students assigned to them
CREATE POLICY "Teachers can view assigned students program assignments"
ON student_program_assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM student_teacher_assignments sta
    WHERE sta.teacher_id = auth.uid()
    AND sta.student_id = student_program_assignments.student_id
    AND sta.active = true
  )
  AND
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'teacher'
    AND p.active = true
  )
);

-- Verify the policy was created
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'student_program_assignments';
