# Profile Creation Debug Guide

## The Problem
You sign up successfully but your profile doesn't appear in the database profiles table.

## Most Common Causes

### 1. Backend Not Running ❌
If your Spring Boot backend isn't running, the profile creation API call will fail silently.

**Check:**
```bash
lsof -ti:8080
```
- If it returns a number → Backend is running ✅
- If it returns nothing → Backend is NOT running ❌

**Fix:**
```bash
cd /Users/someon/201Team6/backend
mvn spring-boot:run
```

### 2. Email Verification Still Enabled ❌
If email verification is still on, signup creates a user but NO session.

**Check:** Open browser console during signup and look for:
```
Session exists: false  ← BAD! Email verification is still ON
```

Should be:
```
Session exists: true  ← GOOD! Email verification is OFF
```

**Fix:** Go back to Supabase dashboard and double-check it's disabled.

### 3. Profile API Call Failing ❌
Backend might be running but the profile creation is failing.

**Check:** Open browser console and look for:
```
❌ Error creating profile: [error message]
```

Common errors:
- "Network Error" → Backend not running
- "400 Bad Request" → Invalid data format
- "500 Internal Server Error" → Backend database issue

---

## Step-by-Step Testing

### Step 1: Verify Backend is Running

```bash
# Check if backend is running
lsof -ti:8080

# If not running, start it
cd /Users/someon/201Team6/backend
mvn spring-boot:run
```

Wait for backend to show:
```
Started BackendApplication in X seconds
```

### Step 2: Test Backend Manually

```bash
# Test if profiles endpoint works
curl http://localhost:8080/api/profiles
```

Should return JSON array (even if empty):
```json
[]
```

If you get "Connection refused" → Backend not running!

### Step 3: Clear Everything

1. **Delete all Supabase users:**
   - Supabase Dashboard → Authentication → Users
   - Delete ALL users (trash icon)

2. **Clear browser storage:**
   - Press F12 in your app
   - Application tab → Storage → Clear site data
   - Refresh page

### Step 4: Try Signup with Console Open

1. **Open browser console FIRST** (F12)
2. Go to Console tab
3. Try signing up with NEW email: `debugtest@usc.edu`
4. **Watch the console output carefully**

### Expected Console Output (Success):

```
=== SIGN UP DEBUG ===
User created: abc-123-xyz-456
Session exists: true  ← MUST BE TRUE!
User confirmed: 2024-12-06T...
====================
✅ User has active session - email confirmation is disabled
📝 Creating profile for user: abc-123-xyz-456
Profile data: {email: 'debugtest@usc.edu', full_name: 'Debug Test'}
✅ Profile created successfully! {id: '...', user_id: '...', ...}
```

### Console Output if Backend Not Running:

```
=== SIGN UP DEBUG ===
User created: abc-123-xyz-456
Session exists: true
====================
✅ User has active session - email confirmation is disabled
📝 Creating profile for user: abc-123-xyz-456
Profile data: {email: 'debugtest@usc.edu', full_name: 'Debug Test'}
❌ Error creating profile: Network Error
Error details: Network Error
```

### Console Output if Email Verification Still On:

```
=== SIGN UP DEBUG ===
User created: abc-123-xyz-456
Session exists: false  ← PROBLEM!
User confirmed: null
====================
[Toast appears: "Email verification required!"]
```

---

## Debugging Checklist

- [ ] Backend is running (check with `lsof -ti:8080`)
- [ ] Backend responds to `curl http://localhost:8080/api/profiles`
- [ ] Email verification is OFF in Supabase (verified in dashboard)
- [ ] Deleted all old test users from Supabase
- [ ] Cleared browser storage (F12 → Application → Clear site data)
- [ ] Browser console is open (F12)
- [ ] Tried signup with NEW email
- [ ] Checked console for error messages

---

## What Should Happen

### Correct Flow:
```
1. Fill signup form
2. Click "Create Account"
3. Supabase creates user + session
4. Frontend calls backend: POST /api/profiles
5. Backend creates profile in database
6. Success toast appears
7. Redirected to app
8. Profile page works!
```

### Where It Might Fail:

**At Step 3:** Email verification is still on
- Fix: Disable in Supabase dashboard

**At Step 4:** Backend not running
- Fix: Start backend with `mvn spring-boot:run`

**At Step 5:** Database connection issue
- Fix: Check backend console for errors
- Fix: Verify database credentials in `application.properties`

---

## Quick Commands

### Start Backend:
```bash
cd /Users/someon/201Team6/backend
mvn spring-boot:run
```

### Check Backend Status:
```bash
curl http://localhost:8080/api/profiles
```

### View Backend Logs:
Look at terminal where `mvn spring-boot:run` is running

### Check What Profiles Exist:
```bash
curl http://localhost:8080/api/profiles | python3 -m json.tool
```

---

## After Successful Signup

### Verify Profile Was Created:

**Method 1: Backend API**
```bash
curl http://localhost:8080/api/profiles
```

Should show your profile:
```json
[
  {
    "id": "...",
    "user_id": "abc-123-xyz",
    "email": "debugtest@usc.edu",
    "full_name": "Debug Test",
    "age": null,
    "major": "",
    ...
  }
]
```

**Method 2: Supabase Dashboard**
1. Go to Supabase Dashboard
2. Click "Table Editor" (left sidebar)
3. Select "profiles" table
4. You should see your profile row

**Method 3: Profile Page**
1. In your app, click "Profile" tab
2. Should load without error
3. Should show "Debug Test" as name

---

## Still Not Working?

If profile still doesn't appear after all this:

1. **Check backend console** for errors during profile creation
2. **Check browser Network tab** (F12 → Network) during signup
   - Look for POST request to `/api/profiles`
   - Check if it's RED (failed) or GREEN (success)
   - Click on it to see Request/Response
3. **Share the error message** from console or backend logs

---

## Summary

The profile not appearing means ONE of these:
1. ❌ Backend not running → Start it
2. ❌ Email verification still on → Disable in Supabase
3. ❌ API call failing → Check console/Network tab
4. ❌ Database issue → Check backend logs

**Most likely**: Backend is not running! Start it with `mvn spring-boot:run`

