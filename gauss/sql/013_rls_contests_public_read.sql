-- Gauss AI Coach: RLS Policies for Contests
-- Run this in Supabase SQL Editor
--
-- gauss_contests should be readable by all authenticated users

-- Enable RLS on gauss_contests
ALTER TABLE gauss_contests ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view contests
CREATE POLICY "Authenticated users can view contests"
ON gauss_contests
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Also update the renamed sessions table policies if needed
-- (RLS policies should have been renamed automatically with the table)

-- Verify policies exist on gauss_contest_sessions
-- If migration 012 was run after 007, policies might still reference old table name
-- This ensures the policies exist on the renamed table

DO $$
BEGIN
  -- Check if we need to recreate policies for contest_sessions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'gauss_contest_sessions'
    AND policyname = 'Users can view own sessions'
  ) THEN
    -- Recreate the basic user policies for the renamed table
    CREATE POLICY "Users can view own sessions"
    ON gauss_contest_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own sessions"
    ON gauss_contest_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own sessions"
    ON gauss_contest_sessions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
