# Admin Setup Guide

This guide explains how to grant admin access to users in the Technical Enablement Tracker application.

## Overview

The application has two separate interfaces:
- **Main App** (`index.html`): For regular users to track activities
- **Admin Panel** (`admin.html`): For admins to manage lookup schedules

## Granting Admin Access

Admin access is controlled via Supabase user metadata. Follow these steps to grant admin privileges:

### Method 1: Using Supabase Dashboard (Recommended)

1. **Log in to Supabase Dashboard**
   - Go to [https://supabase.com](https://supabase.com)
   - Navigate to your project: `qghpvjhaqrzkigxpbjte`

2. **Navigate to Authentication**
   - Click on "Authentication" in the left sidebar
   - Click on "Users" tab

3. **Find the User**
   - Locate the user you want to make an admin
   - Click on the user's email to open their details

4. **Update User Metadata**
   - Scroll down to "User Metadata" section
   - Click "Edit" or add new metadata
   - Add the following JSON:
   ```json
   {
     "is_admin": true
   }
   ```
   - Click "Save"

5. **Verify**
   - The user must sign out and sign back in for changes to take effect
   - They can now access the admin panel at `/admin.html`

### Method 2: Using SQL Editor

1. **Open SQL Editor in Supabase Dashboard**
   - Click on "SQL Editor" in the left sidebar

2. **Run the following SQL command:**
   ```sql
   UPDATE auth.users
   SET raw_user_meta_data = jsonb_set(
     COALESCE(raw_user_meta_data, '{}'::jsonb),
     '{is_admin}',
     'true'
   )
   WHERE email = 'user@example.com';
   ```
   - Replace `user@example.com` with the actual user's email

3. **Verify**
   - The user must sign out and sign back in
   - They can now access the admin panel

### Method 3: Using Supabase API (For Developers)

```javascript
// This requires service role key (keep secret!)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qghpvjhaqrzkigxpbjte.supabase.co',
  'YOUR_SERVICE_ROLE_KEY' // NOT the anon key!
)

const { data, error } = await supabase.auth.admin.updateUserById(
  'user-uuid-here',
  {
    user_metadata: { is_admin: true }
  }
)
```

## Removing Admin Access

To remove admin privileges, set `is_admin` to `false` or remove the field entirely:

**Using Dashboard:**
- Edit the user's metadata and change `"is_admin": true` to `"is_admin": false`
- Or remove the `is_admin` field completely

**Using SQL:**
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'is_admin'
WHERE email = 'user@example.com';
```

## Testing Admin Access

1. **As Admin User:**
   - Sign in to the application
   - Navigate to `/admin.html`
   - You should see the admin panel with "Manage Schedules" and "Import Schedule" tabs
   - You can create, edit, and delete lookup schedules

2. **As Regular User:**
   - Sign in to the application
   - Navigate to `/admin.html`
   - You should see an "Access Denied" message
   - Click "Go to Main App" to return to the regular interface

3. **Not Signed In:**
   - Navigate to `/admin.html`
   - You should see a sign-in prompt
   - After signing in, the appropriate screen will appear based on your admin status

## Admin Capabilities

Admin users can:
- **Manage Lookup Schedules**: Create, edit, and delete lookup schedules that all users can access
- **Import Class Schedules**: Parse and import class schedules from text (e.g., gym class schedules)
- **Organize by Category**: Group lookup schedules by category for easier management
- **Set Schedule Details**: Configure title, description, location, time, cadence, and notes

## Regular User Access to Lookup Schedules

Regular users can:
- **Browse Lookup Schedules**: View all available lookup schedules via the "Schedule Lookup" button
- **Create Activities from Templates**: Select a lookup schedule to quickly create an activity
- **Cannot Modify**: Regular users cannot create, edit, or delete lookup schedules

## Security Notes

1. **Admin Role is Frontend Only**: The admin check happens in the browser. For production use, you should also add Row Level Security (RLS) policies in Supabase to restrict database operations.

2. **Recommended RLS Policy for lookup_schedules Table:**
   ```sql
   -- Only admins can insert/update/delete lookup schedules
   CREATE POLICY "Admins can manage lookup schedules"
   ON lookup_schedules
   FOR ALL
   USING (
     (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
   );

   -- All authenticated users can read lookup schedules
   CREATE POLICY "Authenticated users can view lookup schedules"
   ON lookup_schedules
   FOR SELECT
   USING (auth.role() = 'authenticated');
   ```

3. **Service Role Key**: Never expose your service role key in frontend code. Only use it in secure backend environments.

## Troubleshooting

**Problem: User has admin metadata but still sees "Access Denied"**
- Solution: Ensure the user has signed out and signed back in after the metadata was updated

**Problem: Changes to lookup schedules not appearing**
- Solution: Refresh the page to reload data from Supabase

**Problem: Cannot access admin.html at all**
- Solution: Verify the file exists in your deployment and the path is correct

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [User Metadata Guide](https://supabase.com/docs/guides/auth/managing-user-data#using-triggers)
- [Row Level Security Policies](https://supabase.com/docs/guides/auth/row-level-security)
