-- ==========================================================
-- Migration: 001_initial_schema
-- Description: Initial database schema for TopTrait
-- Date: 2025-12-06
-- ==========================================================
--
-- This migration creates the complete database schema from scratch.
-- It will DROP all existing tables and create new ones.
--
-- WARNING: This will delete all existing data!
-- Make sure to backup before running if you have any data.
--
-- ==========================================================

BEGIN;

-- ==========================================================
-- DROP EXISTING TABLES (in correct order to respect FKs)
-- ==========================================================

DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.swipes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop existing functions/triggers if they exist
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.check_for_match(UUID, UUID) CASCADE;

-- ==========================================================
-- TABLE: profiles
-- Description: User profiles linked to Supabase Auth
-- ==========================================================

CREATE TABLE public.profiles (
    -- Primary Keys
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Information
    username TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    first_name TEXT,
    last_name TEXT,
    age INTEGER CHECK (age >= 17 AND age <= 100),
    
    -- Academic Information (USC specific)
    major TEXT,
    school TEXT,
    year TEXT CHECK (year IN ('freshman', 'sophomore', 'junior', 'senior', 'graduate', '')),
    
    -- Profile Content
    bio TEXT,
    avatar_url TEXT,
    
    -- Housing Preferences
    housing_preference TEXT,
    usc_area TEXT,
    budget_min NUMERIC(10,2) CHECK (budget_min >= 0),
    budget_max NUMERIC(10,2) CHECK (budget_max >= budget_min),
    
    -- Lifestyle Traits
    sleep_schedule TEXT,
    cleanliness TEXT,
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 10),
    has_pets BOOLEAN DEFAULT false,
    smokes BOOLEAN DEFAULT false,
    greek_life TEXT,
    study_habits TEXT,
    guest_frequency TEXT,
    noise_level TEXT,
    
    -- Additional Data (flexible storage)
    interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    top_traits TEXT[] DEFAULT ARRAY[]::TEXT[],
    profile_data_json JSONB DEFAULT '{}'::JSONB,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for profiles
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

-- Comments
COMMENT ON TABLE public.profiles IS 'User profiles linked to Supabase Auth';
COMMENT ON COLUMN public.profiles.user_id IS 'References auth.users(id) from Supabase Auth';
COMMENT ON COLUMN public.profiles.interests IS 'Array of user interests/hobbies';
COMMENT ON COLUMN public.profiles.top_traits IS 'Array of user top personality traits';

-- ==========================================================
-- TABLE: swipes
-- Description: Tracks user swipe actions (approve/decline)
-- ==========================================================

CREATE TABLE public.swipes (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    swiper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    swiped_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Swipe Action
    action TEXT NOT NULL CHECK (action IN ('approve', 'decline')),
    is_approved BOOLEAN NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(swiper_id, swiped_id),
    CHECK (swiper_id != swiped_id)
);

-- Indexes for swipes
CREATE INDEX idx_swipes_swiper_id ON public.swipes(swiper_id);
CREATE INDEX idx_swipes_swiped_id ON public.swipes(swiped_id);
CREATE INDEX idx_swipes_action ON public.swipes(action);
CREATE INDEX idx_swipes_created_at ON public.swipes(created_at DESC);

-- Comments
COMMENT ON TABLE public.swipes IS 'User swipe actions (approve/decline on other users)';
COMMENT ON COLUMN public.swipes.action IS 'approve = right swipe, decline = left swipe';
COMMENT ON COLUMN public.swipes.is_approved IS 'Redundant boolean for action (kept for backend compatibility)';

-- ==========================================================
-- TABLE: matches
-- Description: Stores mutual swipes (both users approved)
-- ==========================================================

CREATE TABLE public.matches (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys (the two matched users)
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Match Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CHECK (user1_id != user2_id),
    UNIQUE(user1_id, user2_id)
);

-- Indexes for matches
CREATE INDEX idx_matches_user1_id ON public.matches(user1_id);
CREATE INDEX idx_matches_user2_id ON public.matches(user2_id);
CREATE INDEX idx_matches_is_active ON public.matches(is_active) WHERE is_active = true;
CREATE INDEX idx_matches_created_at ON public.matches(created_at DESC);

-- Comments
COMMENT ON TABLE public.matches IS 'Mutual matches between users';
COMMENT ON COLUMN public.matches.is_active IS 'Whether the match is still active (not unmatched)';

-- ==========================================================
-- TABLE: messages
-- Description: Chat messages between matched users
-- ==========================================================

CREATE TABLE public.messages (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Message Content
    content TEXT NOT NULL,
    
    -- Message Status
    is_read BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX idx_messages_match_id ON public.messages(match_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_is_read ON public.messages(is_read) WHERE is_read = false;
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Comments
COMMENT ON TABLE public.messages IS 'Chat messages between matched users';

-- ==========================================================
-- TABLE: items (Demo/Testing)
-- Description: Demo table for CRUD operations testing
-- ==========================================================

CREATE TABLE public.items (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for items
CREATE INDEX idx_items_created_at ON public.items(created_at DESC);

-- Comments
COMMENT ON TABLE public.items IS 'Demo table for CRUD operations testing';

-- ==========================================================
-- FUNCTIONS & TRIGGERS
-- ==========================================================

-- Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically update updated_at timestamp on row update';

-- Trigger: Auto-update profiles.updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update items.updated_at
CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON public.items 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function: Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, first_name, last_name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically create a profile when a user signs up via Supabase Auth';

-- Trigger: Create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function: Check for mutual match and create match record
CREATE OR REPLACE FUNCTION public.check_for_match(p_swiper_id UUID, p_swiped_id UUID)
RETURNS UUID AS $$
DECLARE
    v_match_id UUID;
    v_reverse_swipe_exists BOOLEAN;
BEGIN
    -- Check if the other user also approved
    SELECT EXISTS (
        SELECT 1 FROM public.swipes
        WHERE swiper_id = p_swiped_id
        AND swiped_id = p_swiper_id
        AND action = 'approve'
    ) INTO v_reverse_swipe_exists;
    
    -- If mutual approval, create match
    IF v_reverse_swipe_exists THEN
        INSERT INTO public.matches (user1_id, user2_id, is_active, created_at, matched_at)
        VALUES (
            LEAST(p_swiper_id, p_swiped_id),  -- Consistent ordering
            GREATEST(p_swiper_id, p_swiped_id),
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (user1_id, user2_id) DO NOTHING
        RETURNING id INTO v_match_id;
    END IF;
    
    RETURN v_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.check_for_match(UUID, UUID) IS 'Check if two users have mutually approved and create a match if so';

-- ==========================================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- RLS POLICIES: profiles
-- ==========================================================

-- Anyone can view public profiles
CREATE POLICY "profiles_select_public" 
    ON public.profiles FOR SELECT 
    USING (true);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "profiles_delete_own" 
    ON public.profiles FOR DELETE 
    USING (auth.uid() = user_id);

-- ==========================================================
-- RLS POLICIES: swipes
-- ==========================================================

-- Users can view their own swipes
CREATE POLICY "swipes_select_own" 
    ON public.swipes FOR SELECT 
    USING (auth.uid() = swiper_id);

-- Users can create swipes
CREATE POLICY "swipes_insert_own" 
    ON public.swipes FOR INSERT 
    WITH CHECK (auth.uid() = swiper_id);

-- No update/delete policies = swipes are permanent

-- ==========================================================
-- RLS POLICIES: matches
-- ==========================================================

-- Users can view matches they're part of
CREATE POLICY "matches_select_involved" 
    ON public.matches FOR SELECT 
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can deactivate their matches
CREATE POLICY "matches_update_involved" 
    ON public.matches FOR UPDATE 
    USING (auth.uid() = user1_id OR auth.uid() = user2_id)
    WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ==========================================================
-- RLS POLICIES: messages
-- ==========================================================

-- Users can view messages in their matches
CREATE POLICY "messages_select_in_match" 
    ON public.messages FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.matches 
            WHERE id = match_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

-- Users can send messages in their active matches
CREATE POLICY "messages_insert_in_match" 
    ON public.messages FOR INSERT 
    WITH CHECK (
        auth.uid() = sender_id 
        AND EXISTS (
            SELECT 1 FROM public.matches 
            WHERE id = match_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
            AND is_active = true
        )
    );

-- Users can update read status on messages in their matches
CREATE POLICY "messages_update_in_match" 
    ON public.messages FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.matches 
            WHERE id = match_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.matches 
            WHERE id = match_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

-- ==========================================================
-- RLS POLICIES: items (Demo - permissive)
-- ==========================================================

-- Authenticated users can do anything with items (demo only)
CREATE POLICY "items_all_authenticated" 
    ON public.items FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

COMMIT;

-- ==========================================================
-- VERIFICATION QUERIES
-- ==========================================================

-- These will run after the transaction commits
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 001_initial_schema completed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - profiles';
    RAISE NOTICE '  - swipes';
    RAISE NOTICE '  - matches';
    RAISE NOTICE '  - messages';
    RAISE NOTICE '  - items (demo)';
    RAISE NOTICE '';
    RAISE NOTICE 'Run verification queries to confirm:';
    RAISE NOTICE '  SELECT table_name FROM information_schema.tables WHERE table_schema = ''public'';';
END $$;

