# Supabase Setup for INCOIS Application

## Overview
This document provides step-by-step instructions for setting up Supabase as the backend for the INCOIS application.

## Prerequisites
- A Supabase account (free tier is sufficient for development)
- Basic knowledge of SQL
- The INCOIS application codebase

## Steps

### 1. Create a Supabase Project
1. Go to [Supabase](https://supabase.com/) and sign up/login
2. Create a new project with a name like "INCOIS-App"
3. Note your project URL and anon/public API key

### 2. Update Configuration
Replace the placeholder credentials in `js/app.js` with your actual Supabase credentials:

```javascript
// Supabase Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### 3. Set Up Database Tables
1. Go to the SQL Editor in your Supabase dashboard
2. Run the SQL commands from the `supabase_setup.sql` file in this repository
   - This will create the necessary tables (profiles, reports)
   - Row Level Security (RLS) policies have been commented out for now

### 4. Enable Authentication
1. Go to Authentication → Settings
2. Configure Email Auth:
   - Enable Email Signup
   - Disable Email Confirmations for development (enable for production)

### 5. Test the Application
1. Set `useMockData = false` in `js/home.js`
2. Test the login/registration flow
3. Test creating and viewing reports

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Check that your Supabase URL and API key are correct
   - Ensure the auth settings are properly configured in Supabase dashboard

2. **Row Level Security (RLS) Errors**:
   - RLS policies have been commented out in the SQL setup file
   - If you encounter "row-level security policy" errors, ensure you're using the updated SQL file
   - To re-enable RLS, uncomment the RLS section in the `supabase_setup.sql` file

3. **Database Errors**:
   - Verify that all tables were created correctly
   - If you're getting permission errors, ensure RLS is disabled or properly configured

4. **CORS Issues**:
   - Add your application domain to the allowed origins in Supabase settings

## Additional Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth Guides](https://supabase.com/docs/guides/auth)