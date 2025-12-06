-- ==========================================================
-- Migration: remove_profiles_fkey
-- Description: Remove foreign key constraint on profiles.user_id
-- Date: 2025-12-06
-- ==========================================================
--
-- This migration removes the foreign key constraint between
-- profiles.user_id and auth.users(id).
--
-- This is necessary because of timing issues where the profile
-- creation happens before the auth.users record is fully committed.
--
-- WARNING: This removes referential integrity checking.
-- The application must ensure user_id values are valid.
--
-- ==========================================================

BEGIN;

-- Remove foreign key constraints from all tables that reference auth.users
-- This prevents timing issues during user signup and profile creation

-- Profiles table
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Swipes table
ALTER TABLE public.swipes
DROP CONSTRAINT IF EXISTS swipes_swiper_id_fkey;

ALTER TABLE public.swipes
DROP CONSTRAINT IF EXISTS swipes_swiped_id_fkey;

-- Matches table
ALTER TABLE public.matches
DROP CONSTRAINT IF EXISTS matches_user1_id_fkey;

ALTER TABLE public.matches
DROP CONSTRAINT IF EXISTS matches_user2_id_fkey;

-- Messages table
ALTER TABLE public.messages
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

COMMIT;

-- ==========================================================
-- Verification
-- ==========================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Foreign key constraints removed from all tables';
    RAISE NOTICE '';
    RAISE NOTICE 'Removed foreign keys to auth.users from:';
    RAISE NOTICE '  - profiles.user_id';
    RAISE NOTICE '  - swipes.swiper_id';
    RAISE NOTICE '  - swipes.swiped_id';
    RAISE NOTICE '  - matches.user1_id';
    RAISE NOTICE '  - matches.user2_id';
    RAISE NOTICE '  - messages.sender_id';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Application must ensure user_id values are valid';
    RAISE NOTICE '    (referential integrity is no longer enforced by database)';
END $$;

