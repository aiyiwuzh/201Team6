# 🚀 Supabase Migrations - Quick Reference

## Run the Initial Migration (Do This First!)

```bash
# Option 1: Using Supabase CLI (recommended)
npx supabase link --project-ref pwbbdilghlmkvszoaxpe
npx supabase db push

# Option 2: Manual (if CLI doesn't work)
# Copy supabase/migrations/20251206004825_initial_schema.sql
# Paste into Supabase Dashboard → SQL Editor → Run
```

## Common Commands

```bash
# Create a new migration
npx supabase migration new <name>

# Example: Add a new feature
npx supabase migration new add_user_photos

# Push migrations to remote database
npx supabase db push

# Pull schema changes from remote
npx supabase db pull

# List all migrations
npx supabase migration list

# Check differences between local and remote
npx supabase db diff
```

## Project Info

- **Project Ref:** `pwbbdilghlmkvszoaxpe`
- **Dashboard:** https://supabase.com/dashboard/project/pwbbdilghlmkvszoaxpe
- **SQL Editor:** https://supabase.com/dashboard/project/pwbbdilghlmkvszoaxpe/sql/new

## What the Initial Migration Creates

- ✅ `profiles` - User profiles (linked to Supabase Auth)
- ✅ `swipes` - Swipe actions (approve/decline)
- ✅ `matches` - Mutual matches
- ✅ `messages` - Chat messages
- ✅ `items` - Demo CRUD table
- ✅ RLS policies for security
- ✅ Auto-create profile on signup
- ✅ Auto-detect matches on mutual swipes

## ⚠️ Warning

The initial migration **DROPS ALL TABLES** and creates them fresh. Make sure to backup any existing data first!

## Need Help?

See `MIGRATION_GUIDE.md` for detailed instructions.

