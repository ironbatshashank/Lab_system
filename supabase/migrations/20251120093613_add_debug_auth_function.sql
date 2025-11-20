/*
  # Add debug function to verify auth.uid()

  1. New Functions
    - `debug_auth_info()` - Returns current auth.uid() and user info for debugging
  
  2. Security
    - SECURITY DEFINER to allow reading auth info
    - Returns basic auth debugging information
*/

CREATE OR REPLACE FUNCTION debug_auth_info()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT json_build_object(
    'auth_uid', auth.uid(),
    'user_role', (SELECT role FROM user_profiles WHERE id = auth.uid()),
    'user_exists', EXISTS(SELECT 1 FROM user_profiles WHERE id = auth.uid())
  );
$$;
