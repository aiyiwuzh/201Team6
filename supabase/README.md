# Supabase Database Migrations

This directory contains database migrations for the TopTrait application.

## 📁 Structure

```
supabase/
├── config.toml                    # Supabase project configuration
├── migrations/                    # Database migration files
│   └── 20251206004825_initial_schema.sql
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js installed (for npx)
- Supabase project created at https://supabase.com

### Running Migrations

#### Option 1: Push to Remote Database (Recommended)

```bash
# Link your Supabase project (one-time setup)
npx supabase link --project-ref <your-project-ref>

# Push all pending migrations to your remote database
npx supabase db push
```

#### Option 2: Run Manually in Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Copy the contents of `migrations/20251206004825_initial_schema.sql`
5. Paste and run it

## 📝 Creating New Migrations

To create a new migration file:

```bash
npx supabase migration new <migration_name>
```

Example:
```bash
npx supabase migration new add_user_preferences
```

This will create a new timestamped file in `supabase/migrations/`.

## 🔍 Migration Commands

### View Migration Status
```bash
npx supabase migration list
```

### Pull Remote Schema
If you made changes directly in Supabase dashboard:
```bash
npx supabase db pull
```

### Reset Local Database
```bash
npx supabase db reset
```

### Diff Local vs Remote
```bash
npx supabase db diff
```

## 📋 Current Migrations

### `20251206004825_initial_schema.sql`

**Description:** Initial database schema for TopTrait

**Creates:**
- `profiles` - User profiles linked to Supabase Auth
- `swipes` - User swipe actions (approve/decline)
- `matches` - Mutual matches between users
- `messages` - Chat messages between matched users
- `items` - Demo table for CRUD testing

**Features:**
- ✅ Row Level Security (RLS) policies
- ✅ Automatic profile creation on user signup
- ✅ Automatic match detection on mutual swipes
- ✅ Auto-updating timestamps
- ✅ Proper indexes for performance
- ✅ Foreign key constraints

**⚠️ WARNING:** This migration will DROP all existing tables and data!

## 🔒 Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Profiles
- Anyone can view profiles
- Users can only edit their own profile

### Swipes
- Users can only view their own swipes
- Users can only create swipes as themselves

### Matches
- Users can only view matches they're part of
- Users can deactivate their own matches

### Messages
- Users can only view messages in their matches
- Users can only send messages in active matches

## 🛠️ Troubleshooting

### Migration fails with "relation already exists"

The initial migration drops tables first, but if you get errors:

```sql
-- Run this in Supabase SQL Editor to clean up:
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.swipes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;
```

### Can't link to Supabase project

Make sure you have your project ref. Find it in:
- Supabase Dashboard → Project Settings → General → Reference ID

### Permission denied errors

Make sure you're using the correct database credentials and have proper permissions.

## 📚 Additional Resources

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🔄 Workflow

### Development Workflow

1. **Create migration:**
   ```bash
   npx supabase migration new my_feature
   ```

2. **Edit the generated SQL file** in `supabase/migrations/`

3. **Test locally** (optional, requires Docker):
   ```bash
   npx supabase start
   npx supabase db reset
   ```

4. **Push to remote:**
   ```bash
   npx supabase db push
   ```

5. **Verify in Supabase Dashboard**

### Production Deployment

For production, you should:
1. Test migrations thoroughly in a staging environment
2. Backup your database before running migrations
3. Use `npx supabase db push` to apply migrations
4. Monitor for errors and rollback if needed

## 🎯 Best Practices

1. **Never edit old migrations** - Create new ones instead
2. **Always test migrations** before pushing to production
3. **Use transactions** (BEGIN/COMMIT) for atomic changes
4. **Add comments** to explain complex migrations
5. **Keep migrations small** and focused on one change
6. **Backup before major changes**

## 📞 Need Help?

- Check the [Supabase Discord](https://discord.supabase.com)
- Review [Supabase Documentation](https://supabase.com/docs)
- Open an issue in the project repository

