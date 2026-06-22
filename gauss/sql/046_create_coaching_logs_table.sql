-- Create coaching logs table for reviewing coaching performance
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS gauss_coaching_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES gauss_contest_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES gauss_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('coach', 'student')),
  message TEXT NOT NULL,
  coaching_mode TEXT, -- 'stuck' or 'wrong_answer'
  stage TEXT, -- coaching stage like 'initial', 'followup', etc.
  selected_answer TEXT, -- wrong answer that triggered coaching (if applicable)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_coaching_logs_session ON gauss_coaching_logs(session_id);
CREATE INDEX idx_coaching_logs_user ON gauss_coaching_logs(user_id);
CREATE INDEX idx_coaching_logs_question ON gauss_coaching_logs(question_id);
CREATE INDEX idx_coaching_logs_created ON gauss_coaching_logs(created_at DESC);

-- RLS policies
ALTER TABLE gauss_coaching_logs ENABLE ROW LEVEL SECURITY;

-- Students can insert their own logs
CREATE POLICY "Students can insert own coaching logs"
  ON gauss_coaching_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Students can view their own logs
CREATE POLICY "Students can view own coaching logs"
  ON gauss_coaching_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins and teachers can view all logs (for review)
CREATE POLICY "Admins can view all coaching logs"
  ON gauss_coaching_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

-- Grant access
GRANT SELECT, INSERT ON gauss_coaching_logs TO authenticated;

-- Verify table was created
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'gauss_coaching_logs'
ORDER BY ordinal_position;
