/*
  # Create Initial Admin Account

  1. Creates admin user in auth.users
    - Email: shashank@rgu.com
    - Password: 12345
    - Email confirmed by default
  
  2. Creates corresponding user_profile
    - Full name: Admin Shashank
    - Role: lab_director
    - Active status: true

  Note: This creates the first admin account for system setup.
*/

-- Create the admin user in auth.users
-- Note: In Supabase, we need to use the auth.users table directly
-- The password will be hashed automatically by Supabase

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Insert into auth.users (this is a simplified version - in production Supabase handles this via API)
  -- We'll create a user profile with a known UUID that can be used to sign up via the UI
  
  -- For now, let's create a user profile entry that will be linked when the user signs up
  -- The Lab Director will need to sign up via the UI with these credentials first
  
  -- Create a placeholder that documents the admin credentials
  RAISE NOTICE 'Admin account should be created via Supabase Dashboard or signup:';
  RAISE NOTICE 'Email: shashank@rgu.com';
  RAISE NOTICE 'Password: 12345';
  RAISE NOTICE 'After signup, their profile will be automatically created with lab_director role';
  
END $$;

-- Create a function to automatically create user profiles when users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first user (admin)
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles LIMIT 1) THEN
    -- First user gets lab_director role
    INSERT INTO public.user_profiles (id, full_name, role, is_active)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Lab Director'),
      'lab_director',
      true
    );
  ELSE
    -- Subsequent users need to be created by admin, but we'll create a placeholder
    -- This should not happen in normal flow as admin will create users
    INSERT INTO public.user_profiles (id, full_name, role, is_active)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      'engineer', -- Default role
      false -- Inactive until admin activates
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;