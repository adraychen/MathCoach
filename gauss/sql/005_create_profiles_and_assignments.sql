-- Gauss AI Coach: Profiles and Assignments
-- Migration 005: Create production account tables
-- Run this in Supabase SQL Editor after 001-004

-- ============================================
-- 1. Profiles Table
-- ============================================
--
-- Purpose:
--   Stores user profile information for all account types.
--   Supports both email-based login (teachers, admins) and
--   username-based login (students).
--

CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL,
    display_name text NOT NULL,
    username text UNIQUE,
    email text,
    login_type text NOT NULL DEFAULT 'email',
    active boolean NOT NULL DEFAULT true,
    approval_status text NOT NULL DEFAULT 'approved',
    must_change_password boolean NOT NULL DEFAULT false,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    -- Constraints
    CONSTRAINT profiles_role_check
        CHECK (role IN ('admin', 'teacher', 'student')),
    CONSTRAINT profiles_login_type_check
        CHECK (login_type IN ('email', 'username')),
    CONSTRAINT profiles_approval_status_check
        CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    CONSTRAINT profiles_username_format
        CHECK (username IS NULL OR username ~ '^[a-z0-9_-]+$')
);

-- Indexes for profiles
CREATE INDEX idx_profiles_role
    ON public.profiles(role);

CREATE INDEX idx_profiles_username
    ON public.profiles(username);

CREATE INDEX idx_profiles_approval_status
    ON public.profiles(approval_status);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();


-- ============================================
-- 2. Student-Teacher Assignments Table
-- ============================================
--
-- Purpose:
--   Tracks which students are assigned to which teachers.
--   Supports assignment history by using active flag and ended_at.
--   Each student can have only one active teacher at a time.
--

CREATE TABLE public.student_teacher_assignments (
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
CREATE INDEX idx_student_teacher_assignments_student_id
    ON public.student_teacher_assignments(student_id);

CREATE INDEX idx_student_teacher_assignments_teacher_id
    ON public.student_teacher_assignments(teacher_id);

CREATE INDEX idx_student_teacher_assignments_active
    ON public.student_teacher_assignments(active);

-- Partial unique index: each student can have only one active teacher at a time
CREATE UNIQUE INDEX idx_student_teacher_assignments_one_active_per_student
    ON public.student_teacher_assignments(student_id)
    WHERE active = true;


-- ============================================
-- Notes
-- ============================================
--
-- profiles.login_type:
--   - 'email': User logs in with email/password (teachers, admins)
--   - 'username': User logs in with username/password (students)
--
-- profiles.approval_status:
--   - 'pending': Account created but awaiting admin approval
--   - 'approved': Account is approved and can access the system
--   - 'rejected': Account was rejected by admin
--
-- student_teacher_assignments:
--   - To reassign a student, set active=false and ended_at=now() on old row,
--     then insert a new row with the new teacher.
--   - The partial unique index ensures data integrity for active assignments.
