-- Gauss AI Coach: Student Profiles
-- Migration 005: Create student_profiles table
-- Run this in Supabase SQL Editor after 001-004

-- ============================================
-- 1. Student Profiles Table
-- ============================================
CREATE TABLE public.student_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE NOT NULL,
    display_name text,
    role text NOT NULL DEFAULT 'student',
    active boolean NOT NULL DEFAULT true,
    must_change_password boolean NOT NULL DEFAULT true,
    created_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    -- Constraints
    CONSTRAINT student_profiles_role_check
        CHECK (role IN ('student', 'admin')),
    CONSTRAINT student_profiles_username_format
        CHECK (username ~ '^[a-z0-9_-]+$')
);

-- ============================================
-- 2. Indexes
-- ============================================
CREATE INDEX idx_student_profiles_username
    ON public.student_profiles(username);

CREATE INDEX idx_student_profiles_role
    ON public.student_profiles(role);

-- ============================================
-- 3. Helper function for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_student_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER trigger_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_student_profiles_updated_at();
