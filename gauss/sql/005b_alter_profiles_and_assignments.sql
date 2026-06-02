-- Gauss AI Coach: Alter Profiles and Assignments
-- Migration 005b: Update existing profiles table and add assignments table
-- Run this if you already ran the old 005 migration

-- ============================================
-- 1. Update profiles table constraints
-- ============================================

-- Drop old approval_status constraint if it exists
ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS profiles_approval_status_check;

-- Add new approval_status constraint
ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_approval_status_check
        CHECK (approval_status IN ('approved', 'disabled'));

-- Update any existing 'pending' or 'rejected' statuses to 'disabled'
UPDATE public.profiles
    SET approval_status = 'disabled'
    WHERE approval_status NOT IN ('approved', 'disabled');

-- ============================================
-- 2. Add missing indexes to profiles
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email
    ON public.profiles(email);

CREATE INDEX IF NOT EXISTS idx_profiles_created_by
    ON public.profiles(created_by);

CREATE INDEX IF NOT EXISTS idx_profiles_active
    ON public.profiles(active);

-- ============================================
-- 3. Create student_teacher_assignments table (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS public.student_teacher_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by uuid REFERENCES auth.users(id),
    active boolean NOT NULL DEFAULT true,
    assigned_at timestamptz DEFAULT now(),
    ended_at timestamptz,

    -- Constraints
    CONSTRAINT student_teacher_assignments_no_self_assign
        CHECK (student_id != teacher_id)
);

-- Indexes for student-teacher assignments
CREATE INDEX IF NOT EXISTS idx_student_teacher_assignments_student_id
    ON public.student_teacher_assignments(student_id);

CREATE INDEX IF NOT EXISTS idx_student_teacher_assignments_teacher_id
    ON public.student_teacher_assignments(teacher_id);

CREATE INDEX IF NOT EXISTS idx_student_teacher_assignments_assigned_by
    ON public.student_teacher_assignments(assigned_by);

CREATE INDEX IF NOT EXISTS idx_student_teacher_assignments_active
    ON public.student_teacher_assignments(active);

-- Partial unique index: each student can have only one active teacher at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_teacher_assignments_one_active_per_student
    ON public.student_teacher_assignments(student_id)
    WHERE active = true;
