-- Gauss AI Coach: Coaching Plans Table
-- Migration 011: Create gauss_coaching_plans for adaptive Socratic coaching
-- Run this in Supabase SQL Editor
--
-- Coaching plans provide structured guidance for the Socratic coach.
-- They are keyed by source_question_id and used to enhance coaching quality.
-- The plan is a guide, not a fixed hint sequence - the coach adapts to student responses.

-- ============================================
-- 1. Create gauss_coaching_plans table
-- ============================================

CREATE TABLE IF NOT EXISTS gauss_coaching_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_question_id text NOT NULL REFERENCES gauss_source_questions(id) ON DELETE CASCADE,

    -- First step guidance for stuck coaching
    first_step_prompt text,

    -- Overall goal of the coaching session
    coaching_goal text,

    -- Expected reasoning steps (array, used as guide not forced sequence)
    expected_reasoning_steps text[],

    -- Key concepts the student should understand
    key_concepts text[],

    -- Common misconceptions to watch for
    common_misconceptions text[],

    -- Adaptive guidance rules (free text for question-specific behavior)
    adaptive_guidance_rules text,

    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    -- Each source question can have only one coaching plan
    CONSTRAINT gauss_coaching_plans_source_unique UNIQUE (source_question_id)
);

-- ============================================
-- 2. Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_gauss_coaching_plans_source_question_id
    ON gauss_coaching_plans(source_question_id);

-- ============================================
-- 3. Auto-update updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_gauss_coaching_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_gauss_coaching_plans_updated_at ON gauss_coaching_plans;
CREATE TRIGGER trigger_gauss_coaching_plans_updated_at
    BEFORE UPDATE ON gauss_coaching_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_gauss_coaching_plans_updated_at();

-- ============================================
-- Notes
-- ============================================
--
-- The coaching plan enhances the Socratic coach but is optional.
-- If no plan exists for a source question, the coach uses the
-- official_solution and general coaching rules.
--
-- Fields:
--   - first_step_prompt: Guidance for the initial "stuck" coaching message
--   - coaching_goal: What the student should understand by the end
--   - expected_reasoning_steps: Array of steps in the solution path (guide only)
--   - key_concepts: Array of concepts the student needs to understand
--   - common_misconceptions: Array of mistakes to watch for
--   - adaptive_guidance_rules: Free text for question-specific coach behavior
--
-- The coach does NOT force students through expected_reasoning_steps in order.
-- It adapts based on student responses:
--   - Vague/unsure responses -> break into smaller steps
--   - Concept confusion -> clarify before continuing
--   - Partial progress -> focus on missing piece only
