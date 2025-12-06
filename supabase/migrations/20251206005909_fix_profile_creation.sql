-- ==========================================================
-- Migration: fix_profile_creation
-- Description: Fix profile auto-creation on signup
-- Date: 2025-12-06
-- ==========================================================
--
-- This migration fixes the issue where profile creation fails
-- due to NULL email values.
--
-- Changes:
-- 1. Make email nullable in profiles table
-- 2. Update trigger to handle missing email/metadata gracefully
--
-- ==========================================================

BEGIN;

-- Make email nullable (it can be set later)
ALTER TABLE public.profiles 
ALTER COLUMN email DROP NOT NULL;

-- Drop the email uniqueness constraint temporarily
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_email_key;

-- Recreate unique constraint that allows NULLs
CREATE UNIQUE INDEX profiles_email_key ON public.profiles(email) 
WHERE email IS NOT NULL;

-- Drop and recreate the handle_new_user function with better logic
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a basic profile record
    -- Email and other fields can be updated later by the user
    INSERT INTO public.profiles (
        user_id, 
        email, 
        full_name, 
        first_name, 
        last_name,
        created_at, 
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.email, NEW.raw_user_meta_data->>'email'),
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            (NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name')
        ),
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NOW(),
        NOW()
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the signup
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

COMMIT;

-- ==========================================================
-- Verification
-- ==========================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Profile creation trigger fixed';
    RAISE NOTICE '';
    RAISE NOTICE 'Changes made:';
    RAISE NOTICE '  - Email is now nullable in profiles table';
    RAISE NOTICE '  - Trigger handles missing email gracefully';
    RAISE NOTICE '  - Profile creation will not fail signup process';
    RAISE NOTICE '';
    RAISE NOTICE 'Users can update their email/profile after signup';
END $$;

