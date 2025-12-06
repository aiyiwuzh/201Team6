# Database Migration Guide

## 🎯 Quick Start: Run Your First Migration

### Step 1: Link Your Supabase Project

```bash
npx supabase link --project-ref pwbbdilghlmkvszoaxpe
```

When prompted, enter your database password: `vkdWrqxYBL4hXZGx`

### Step 2: Push the Migration

```bash
npx supabase db push
```

This will run the initial schema migration and create all tables.

### Step 3: Verify

Go to your Supabase Dashboard → Table Editor and you should see:
- ✅ profiles
- ✅ swipes
- ✅ matches
- ✅ messages
- ✅ items

## 🔧 Alternative: Manual Migration

If the CLI doesn't work, you can run the migration manually:

1. Go to https://supabase.com/dashboard/project/pwbbdilghlmkvszoaxpe/sql/new
2. Copy the entire contents of `supabase/migrations/20251206004825_initial_schema.sql`
3. Paste into the SQL Editor
4. Click **Run** or press `Cmd+Enter`

## ✅ What This Migration Does

### Creates Tables:

1. **profiles** - User profiles with:
   - Basic info (name, age, email)
   - Academic info (major, school, year)
   - Housing preferences (budget, location)
   - Lifestyle traits (sleep schedule, cleanliness, pets, etc.)

2. **swipes** - Tracks who swiped on whom:
   - Swiper and swiped user IDs
   - Action (approve/decline)
   - Timestamp

3. **matches** - Mutual approvals:
   - Two user IDs
   - Match status (active/inactive)
   - Match timestamp

4. **messages** - Chat between matches:
   - Match ID
   - Sender ID
   - Message content
   - Read status

5. **items** - Demo table for testing CRUD operations

### Automatic Features:

- ✅ **Auto-create profile** when user signs up via Supabase Auth
- ✅ **Auto-detect matches** when two users mutually approve
- ✅ **Auto-update timestamps** on profile/item updates
- ✅ **Row Level Security** - users can only see/edit their own data
- ✅ **Performance indexes** on all foreign keys and common queries

## 🚨 Important Notes

### ⚠️ This Migration Will:

- **DROP** all existing tables (messages, matches, swipes, profiles, items, users)
- **DELETE** all existing data
- **CREATE** new tables from scratch

### Before Running:

1. **Backup any existing data** (if you have any)
2. Make sure no one is using the database
3. Verify you're connected to the correct project

## 🔄 Future Migrations

### Creating a New Migration:

```bash
npx supabase migration new add_user_photos
```

This creates: `supabase/migrations/20251206XXXXXX_add_user_photos.sql`

### Example Migration:

```sql
-- Add photos column to profiles
ALTER TABLE public.profiles 
ADD COLUMN photos TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add index for performance
CREATE INDEX idx_profiles_photos ON public.profiles USING GIN(photos);
```

### Pushing New Migrations:

```bash
npx supabase db push
```

## 🐛 Troubleshooting

### "Project ref is required"

Make sure you've linked your project:
```bash
npx supabase link --project-ref pwbbdilghlmkvszoaxpe
```

### "Permission denied"

Make sure you're using the correct database password when linking.

### "Table already exists"

The migration includes `DROP TABLE IF EXISTS`, so this shouldn't happen. If it does:

1. Go to Supabase Dashboard → SQL Editor
2. Run:
```sql
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.swipes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;
```
3. Try the migration again

### "Cannot connect to Docker"

If you see Docker errors, you're trying to use local development. For now, just push directly to remote:
```bash
npx supabase db push
```

## 📊 Verifying the Migration

### Check Tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Check RLS Policies:

```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Check Triggers:

```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## 🎉 Success!

Once the migration runs successfully:

1. ✅ Your database schema is set up
2. ✅ You can create accounts in your app
3. ✅ Profiles will be auto-created on signup
4. ✅ Users can swipe and match
5. ✅ Matched users can message each other

## 📚 Next Steps

1. **Test user signup** - Create an account and verify profile is created
2. **Test swiping** - Create multiple accounts and test the swipe flow
3. **Test matching** - Verify mutual swipes create matches
4. **Test messaging** - Send messages between matched users

## 🔗 Useful Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/pwbbdilghlmkvszoaxpe
- **SQL Editor:** https://supabase.com/dashboard/project/pwbbdilghlmkvszoaxpe/sql/new
- **Table Editor:** https://supabase.com/dashboard/project/pwbbdilghlmkvszoaxpe/editor
- **Supabase CLI Docs:** https://supabase.com/docs/guides/cli

