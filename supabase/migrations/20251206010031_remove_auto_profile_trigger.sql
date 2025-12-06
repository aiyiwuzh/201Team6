-- ==========================================================
-- Migration: remove_auto_profile_trigger
-- Description: Remove automatic profile creation trigger
-- Date: 2025-12-06
-- ==========================================================
--
-- This migration removes the automatic profile creation trigger
-- because the frontend (SignUpPage.tsx) already handles profile
-- creation manually. Having both causes conflicts.
--
-- The frontend will be responsible for creating profiles.
--
-- ==========================================================

BEGIN;

-- Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Make the foreign key constraint deferrable to handle timing issues
-- This allows the profile insert to happen even if there's a slight delay
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE 
    DEFERRABLE INITIALLY DEFERRED;

COMMIT;

-- ==========================================================
-- Verification
-- ==========================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Automatic profile creation trigger removed';
    RAISE NOTICE '';
    RAISE NOTICE 'Changes made:';
    RAISE NOTICE '  - Dropped on_auth_user_created trigger';
    RAISE NOTICE '  - Dropped handle_new_user() function';
    RAISE NOTICE '  - Made user_id foreign key deferrable';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Profile creation is now handled by the frontend';
    RAISE NOTICE '    (SignUpPage.tsx calls createProfile manually)';
END $$;

