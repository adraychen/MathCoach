-- Allow admins to update gauss_contests (toggle active status)
-- Run this in Supabase SQL Editor

-- Admin can update contests
CREATE POLICY "Admins can update contests"
ON gauss_contests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Verify the policy was created
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'gauss_contests';
