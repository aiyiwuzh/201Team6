-- ==========================================================
-- Migration: disable_rls
-- Description: Disable Row Level Security on all tables
-- Date: 2025-12-06
-- ==========================================================
--
-- This migration disables RLS for development purposes.
-- 
-- WARNING: This removes security policies!
-- All authenticated users will have full access to all data.
-- Only use this in development, NOT in production!
--
-- ==========================================================

BEGIN;

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

DROP POLICY IF EXISTS "swipes_select_own" ON public.swipes;
DROP POLICY IF EXISTS "swipes_insert_own" ON public.swipes;

DROP POLICY IF EXISTS "matches_select_involved" ON public.matches;
DROP POLICY IF EXISTS "matches_update_involved" ON public.matches;

DROP POLICY IF EXISTS "messages_select_in_match" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_in_match" ON public.messages;
DROP POLICY IF EXISTS "messages_update_in_match" ON public.messages;

DROP POLICY IF EXISTS "items_all_authenticated" ON public.items;

-- Disable RLS on all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.items DISABLE ROW LEVEL SECURITY;

COMMIT;

-- ==========================================================
-- Verification
-- ==========================================================

DO $$
BEGIN
    RAISE NOTICE '✅ RLS disabled on all tables';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  WARNING: All authenticated users now have full access to all data!';
    RAISE NOTICE '⚠️  This is OK for development but NOT for production!';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables with RLS disabled:';
    RAISE NOTICE '  - profiles';
    RAISE NOTICE '  - swipes';
    RAISE NOTICE '  - matches';
    RAISE NOTICE '  - messages';
    RAISE NOTICE '  - items';
END $$;

