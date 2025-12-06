# Authentication Debug Guide

## What's Happening (The Problem)

You're experiencing these issues:
1. ✅ Sign up appears to work
2. ❌ Profile page says "must be signed in"
3. ❌ Signing in creates a second account

## Root Cause

**Email verification is STILL ENABLED in your Supabase dashboard!**

Here's what happens:
```
Sign Up → Supabase creates user BUT NO SESSION → Email verification required
       ↓
App thinks you're logged in (wrong!)
       ↓
Go to Profile → Checks for real session → None found → Error!
       ↓
Sign Out → Try to login → Supabase sees unverified email → Allows new signup
```

## How to Diagnose

### Step 1: Open Browser Console
1. Press `F12` (or right-click → Inspect)
2. Go to **Console** tab
3. Try signing up

### Step 2: Look for Debug Output

**If you see this:**
```
=== SIGN UP DEBUG ===
User created: abc-123-xyz
Session exists: false   ← ❌ THIS IS THE PROBLEM!
User confirmed: null
====================
```

**This means:** Email verification is ENABLED. You MUST disable it!

**If you see this:**
```
=== SIGN UP DEBUG ===
User created: abc-123-xyz
Session exists: true   ← ✅ GOOD!
User confirmed: 2024-12-06...
====================
✅ User has active session - email confirmation is disabled
```

**This means:** Email verification is disabled and signup is working!

## The Fix (YOU MUST DO THIS!)

### 🚨 CRITICAL: Disable Email Confirmation in Supabase

1. Go to: **https://supabase.com/dashboard**
2. Select your project: **pwbbdilghlmkvszoaxpe**
3. Click: **Authentication** (in left sidebar)
4. Click: **Settings** (under Authentication)
5. Scroll to: **Email Auth** section
6. Find: "**Enable email confirmations**"
7. **TOGGLE IT OFF** (make sure it's gray/disabled)
8. Click: **Save** button at bottom

### Verify It's Off

You should see:
```
Email confirmations: OFF (or disabled/gray)
```

## Clean Up Existing Accounts

After disabling email confirmation, clean up the mess:

### Step 1: Delete Duplicate Users in Supabase
1. Go to: **Authentication** → **Users** in Supabase dashboard
2. You'll probably see multiple accounts with same email
3. Delete ALL of them (click trash icon)

### Step 2: Clear Browser Data
1. In your app, open DevTools (F12)
2. Go to: **Application** tab
3. Click: **Storage** in left sidebar
4. Click: **Clear site data** button
5. Refresh the page

## Test Again

Now try the complete flow:

### Test Sign Up:
1. Go to sign up page
2. Fill in form (use a NEW email: `test999@usc.edu`)
3. Click "Create Account"
4. **Check console** - should see:
   ```
   Session exists: true  ← Must be TRUE!
   ✅ User has active session
   ```
5. Should see: "Account created successfully! Welcome to TopTrait!"
6. Should be on swiping page
7. **Click "Profile" tab**
8. Should work! No error! ✅

### Test Login:
1. Sign out
2. Go to login page
3. Enter: `test999@usc.edu` / your password
4. Click "Sign In"
5. **Check console** - should see:
   ```
   Session exists: true  ← Must be TRUE!
   ```
6. Should be logged in
7. Can access Profile page ✅

## Understanding the Debug Output

### When Signing Up:
```javascript
=== SIGN UP DEBUG ===
User created: abc-123     // User ID in Supabase
Session exists: true/false // ← KEY: Must be TRUE!
User confirmed: timestamp  // When email was confirmed
====================
```

- **Session exists: false** = Email confirmation is ON (BAD!)
- **Session exists: true** = Email confirmation is OFF (GOOD!)

### When Logging In:
```javascript
=== LOGIN DEBUG ===
User logged in: abc-123    // User ID
Session exists: true/false // ← KEY: Must be TRUE!
==================
```

### When Loading Profile:
```javascript
=== PROFILE PAGE DEBUG ===
Auth error: null
User from getUser(): abc-123 // Should have user ID
Session exists: true/false   // ← KEY: Must be TRUE!
========================
```

## Why It Creates Duplicate Accounts

When email confirmation is enabled:
1. First signup → User created, not confirmed
2. You can't login (email not verified)
3. Try to "login" again with same email
4. Supabase allows another signup (because first wasn't confirmed)
5. Result: Multiple accounts with same email!

## Common Mistakes

❌ **Mistake 1:** Not disabling email confirmation in Supabase
- Fix: Go to Supabase dashboard and disable it!

❌ **Mistake 2:** Not clearing browser storage
- Fix: Application tab → Clear site data

❌ **Mistake 3:** Using same email after fixing
- Fix: Use a completely new email for testing

❌ **Mistake 4:** Not checking console logs
- Fix: Always keep console open to see debug output

## Checklist

Before testing again, make sure:

- [ ] Opened Supabase dashboard
- [ ] Went to Authentication → Settings
- [ ] Found "Enable email confirmations"
- [ ] **TOGGLED IT OFF** (must be disabled/gray)
- [ ] Clicked Save
- [ ] Deleted all duplicate users in Authentication → Users
- [ ] Cleared browser storage (Application tab)
- [ ] Refreshed the page
- [ ] Console is open (F12)
- [ ] Ready to test with NEW email

## Expected Behavior After Fix

✅ Sign up → Instant account + session  
✅ Immediately logged in  
✅ Can access Profile page right away  
✅ Sign out works  
✅ Sign in works with same credentials  
✅ No duplicate accounts created  

## Still Having Issues?

If it's still not working:

1. **Take a screenshot** of:
   - Supabase Settings page showing "Enable email confirmations"
   - Browser console during signup
   - Profile page error

2. **Check these:**
   - Are you using `@usc.edu` email?
   - Is password meeting requirements? (8+ chars, 2+ special chars)
   - Did you actually click Save in Supabase?

3. **Try this:**
   - Close browser completely
   - Reopen and go to your app
   - Open console first (F12)
   - Try signup with brand new email

## The Real Problem

The issue is NOT with the code. The issue is:

**EMAIL VERIFICATION IS STILL ENABLED IN SUPABASE**

Until you disable it in the dashboard, nothing will work properly!

