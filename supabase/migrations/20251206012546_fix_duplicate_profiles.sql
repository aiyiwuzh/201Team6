-- ==========================================================
-- Migration: fix_duplicate_profiles
-- Description: Clean up duplicate profiles and fix constraints
-- Date: 2025-12-06
-- ==========================================================
--
-- This migration:
-- 1. Removes duplicate profiles (keeps most recent per user_id)
-- 2. Removes the email unique constraint (email can be null or duplicate)
-- 3. Ensures user_id is the primary lookup key
--
-- ==========================================================

BEGIN;

-- Delete duplicate profiles, keeping only the most recent one per user_id
DELETE FROM public.profiles
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.profiles
  ORDER BY user_id, created_at DESC
);

-- Drop the email unique constraint
-- Email shouldn't be unique because multiple profiles might not have email set
DROP INDEX IF EXISTS profiles_email_key;

-- Remove the email unique constraint from the table
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_email_key;

-- Create a partial unique index on user_id (which should already be unique, but just to be safe)
-- This ensures each user can only have one profile
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique_idx 
ON public.profiles(user_id);

-- Also drop the old email validation constraint since email is now optional
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS valid_email;

COMMIT;

-- ==========================================================
-- Verification
-- ==========================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Duplicate profiles cleaned up';
    RAISE NOTICE '';
    RAISE NOTICE 'Changes made:';
    RAISE NOTICE '  - Removed duplicate profiles (kept most recent)';
    RAISE NOTICE '  - Removed email unique constraint';
    RAISE NOTICE '  - Ensured user_id uniqueness';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  user_id is now the only way to look up profiles';
    RAISE NOTICE '    (email is optional and not unique)';
END $$;

