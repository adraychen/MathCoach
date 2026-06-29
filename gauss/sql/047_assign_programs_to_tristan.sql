-- Assign Grade 7 and Grade 8 programs to Tristan Chen
-- Student ID: a2f8ceeb-ed3a-434e-bed4-d2489b93de40

-- First, let's see available programs
-- SELECT id, program_code, program_name, grade FROM mathcoach_programs WHERE active = true ORDER BY grade;

-- Insert Grade 7 program assignment
INSERT INTO student_program_assignments (student_id, program_id, active, assigned_at)
SELECT
  'a2f8ceeb-ed3a-434e-bed4-d2489b93de40'::uuid,
  id,
  true,
  NOW()
FROM mathcoach_programs
WHERE grade = 7 AND active = true
ON CONFLICT DO NOTHING;

-- Insert Grade 8 program assignment
INSERT INTO student_program_assignments (student_id, program_id, active, assigned_at)
SELECT
  'a2f8ceeb-ed3a-434e-bed4-d2489b93de40'::uuid,
  id,
  true,
  NOW()
FROM mathcoach_programs
WHERE grade = 8 AND active = true
ON CONFLICT DO NOTHING;

-- Verify the assignments
SELECT
  p.display_name as student_name,
  mp.program_name,
  mp.grade,
  spa.active,
  spa.assigned_at
FROM student_program_assignments spa
JOIN profiles p ON p.id = spa.student_id
JOIN mathcoach_programs mp ON mp.id = spa.program_id
WHERE spa.student_id = 'a2f8ceeb-ed3a-434e-bed4-d2489b93de40';
