-- Add lifestyle fields to profiles table

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_level INT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS study_habits TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sleep_schedule TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS guests TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS drinking TEXT;

