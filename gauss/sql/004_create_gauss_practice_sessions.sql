-- Gauss AI Coach: Practice Session Tracking
-- Migration 004: Add production-style practice session tracking
-- Run this in Supabase SQL Editor after 001, 002, 003

-- ============================================
-- 1. Practice Sessions Table
-- ============================================
CREATE TABLE gauss_practice_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    practice_set_id uuid NOT NULL REFERENCES gauss_practice_sets(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'in_progress',
    current_question_number int DEFAULT 1,
    total_questions int DEFAULT 25,
    correct_count int DEFAULT 0,
    wrong_count int DEFAULT 0,
    skipped_count int DEFAULT 0,
    flagged_count int DEFAULT 0,
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    updated_at timestamptz DEFAULT now(),

    -- Constraints
    CONSTRAINT gauss_practice_sessions_status_check
        CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

-- Indexes for practice sessions
CREATE INDEX idx_gauss_practice_sessions_user_id
    ON gauss_practice_sessions(user_id);

CREATE INDEX idx_gauss_practice_sessions_practice_set_id
    ON gauss_practice_sessions(practice_set_id);

CREATE INDEX idx_gauss_practice_sessions_user_practice_set
    ON gauss_practice_sessions(user_id, practice_set_id);

-- ============================================
-- 2. Update gauss_attempts table
-- ============================================

-- Add session_id column
ALTER TABLE gauss_attempts
    ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES gauss_practice_sessions(id) ON DELETE CASCADE;

-- Add status column
ALTER TABLE gauss_attempts
    ADD COLUMN IF NOT EXISTS status text;

-- Add wrong_answers column
ALTER TABLE gauss_attempts
    ADD COLUMN IF NOT EXISTS wrong_answers text[] DEFAULT '{}';

-- Add flagged column
ALTER TABLE gauss_attempts
    ADD COLUMN IF NOT EXISTS flagged boolean DEFAULT false;

-- Add skipped column
ALTER TABLE gauss_attempts
    ADD COLUMN IF NOT EXISTS skipped boolean DEFAULT false;

-- Add status constraint
ALTER TABLE gauss_attempts
    ADD CONSTRAINT gauss_attempts_status_check
        CHECK (status IS NULL OR status IN ('unanswered', 'correct', 'wrong', 'skipped', 'flagged'));

-- Indexes for attempts
CREATE INDEX IF NOT EXISTS idx_gauss_attempts_session_id
    ON gauss_attempts(session_id);

CREATE INDEX IF NOT EXISTS idx_gauss_attempts_session_question
    ON gauss_attempts(session_id, question_id);

-- ============================================
-- 3. Helper function for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_gauss_practice_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_gauss_practice_sessions_updated_at ON gauss_practice_sessions;
CREATE TRIGGER trigger_gauss_practice_sessions_updated_at
    BEFORE UPDATE ON gauss_practice_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_gauss_practice_sessions_updated_at();
