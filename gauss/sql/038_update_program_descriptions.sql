-- Update program descriptions in mathcoach_programs
-- Run this in Supabase SQL Editor

UPDATE mathcoach_programs
SET description = 'Waterloo Gauss Contest for Grade 7'
WHERE description = 'Waterloo Mathematics Competition Practice for Grade 7';

UPDATE mathcoach_programs
SET description = 'Waterloo Gauss Contest for Grade 8'
WHERE description = 'Waterloo Gauss Grade 8 Contests';

-- Verify the update
SELECT id, program_code, program_name, description, grade
FROM mathcoach_programs
ORDER BY grade;
