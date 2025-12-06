-- ==========================================================
-- Migration: simplify_profile_schema
-- Description: Simplify profiles table to core fields only
-- Date: 2025-12-06
-- ==========================================================
--
-- This migration simplifies the profiles table by removing
-- unused fields and keeping only core profile data.
--
-- Fields to keep:
-- - id, user_id, email, full_name, age
-- - major, school, year, bio
-- - budget_min, budget_max, cleanliness_rating
-- - created_at, updated_at
--
-- ==========================================================

BEGIN;

-- Drop unused columns from profiles table
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS username,
DROP COLUMN IF EXISTS first_name,
DROP COLUMN IF EXISTS last_name,
DROP COLUMN IF EXISTS avatar_url,
DROP COLUMN IF EXISTS housing_preference,
DROP COLUMN IF EXISTS usc_area,
DROP COLUMN IF EXISTS sleep_schedule,
DROP COLUMN IF EXISTS cleanliness,
DROP COLUMN IF EXISTS has_pets,
DROP COLUMN IF EXISTS smokes,
DROP COLUMN IF EXISTS greek_life,
DROP COLUMN IF EXISTS study_habits,
DROP COLUMN IF EXISTS guest_frequency,
DROP COLUMN IF EXISTS noise_level,
DROP COLUMN IF EXISTS interests,
DROP COLUMN IF EXISTS top_traits,
DROP COLUMN IF EXISTS profile_data_json;

-- Ensure remaining columns have proper defaults and constraints
ALTER TABLE public.profiles
ALTER COLUMN full_name SET DEFAULT '',
ALTER COLUMN major SET DEFAULT '',
ALTER COLUMN school SET DEFAULT '',
ALTER COLUMN year SET DEFAULT '',
ALTER COLUMN bio SET DEFAULT '';

-- Update cleanliness_rating constraint to be 1-10 (if not already)
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_cleanliness_rating_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_cleanliness_rating_check 
CHECK (cleanliness_rating IS NULL OR (cleanliness_rating >= 1 AND cleanliness_rating <= 10));

-- Update budget constraints
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_budget_min_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_budget_min_check 
CHECK (budget_min IS NULL OR budget_min >= 0);

ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_budget_max_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_budget_max_check 
CHECK (budget_max IS NULL OR budget_max >= 0);

-- Ensure budget_max >= budget_min when both are set
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_budget_range_check 
CHECK (budget_min IS NULL OR budget_max IS NULL OR budget_max >= budget_min);

COMMIT;

-- ==========================================================
-- Verification
-- ==========================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Profile schema simplified successfully';
    RAISE NOTICE '';
    RAISE NOTICE 'Remaining fields:';
    RAISE NOTICE '  - id, user_id, email';
    RAISE NOTICE '  - full_name, age';
    RAISE NOTICE '  - major, school, year';
    RAISE NOTICE '  - bio';
    RAISE NOTICE '  - budget_min, budget_max';
    RAISE NOTICE '  - cleanliness_rating (1-10)';
    RAISE NOTICE '  - created_at, updated_at';
    RAISE NOTICE '';
    RAISE NOTICE 'Removed fields:';
    RAISE NOTICE '  - username, first_name, last_name, avatar_url';
    RAISE NOTICE '  - housing_preference, usc_area';
    RAISE NOTICE '  - sleep_schedule, cleanliness, has_pets, smokes';
    RAISE NOTICE '  - greek_life, study_habits, guest_frequency, noise_level';
    RAISE NOTICE '  - interests, top_traits, profile_data_json';
END $$;

