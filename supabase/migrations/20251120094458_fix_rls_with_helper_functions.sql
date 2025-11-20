/*
  # Fix RLS policies using helper functions for clarity

  1. New Functions
    - `can_update_project(project_id, old_status, new_status)` - Validates update permissions
    - `get_user_role(user_id)` - Returns user's role
  
  2. Changes
    - Drop existing UPDATE policy
    - Create new policy using helper functions
  
  3. Security
    - Engineers can update own draft projects
    - Reviewers can update projects in their review stage
*/

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM user_profiles WHERE id = user_id;
$$;

-- Helper function to check if user can update project
CREATE OR REPLACE FUNCTION can_update_project_status(
  p_engineer_id uuid,
  p_old_status project_status,
  p_new_status project_status
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_user_id uuid;
  v_user_role user_role;
BEGIN
  v_user_id := auth.uid();
  v_user_role := get_user_role(v_user_id);
  
  -- Engineers can update their own draft projects (keep as draft)
  IF p_engineer_id = v_user_id AND p_old_status = 'draft' AND p_new_status = 'draft' THEN
    RETURN true;
  END IF;
  
  -- Supervisors can update pending_supervisor to pending_hsm or draft
  IF v_user_role = 'supervisor' AND p_old_status = 'pending_supervisor' 
     AND p_new_status IN ('pending_hsm', 'draft') THEN
    RETURN true;
  END IF;
  
  -- HSM can update pending_hsm to pending_technician or draft
  IF v_user_role = 'hsm' AND p_old_status = 'pending_hsm'
     AND p_new_status IN ('pending_technician', 'draft') THEN
    RETURN true;
  END IF;
  
  -- Lab technicians can update pending_technician to approved or draft
  IF v_user_role = 'lab_technician' AND p_old_status = 'pending_technician'
     AND p_new_status IN ('approved', 'draft') THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Drop existing policy
DROP POLICY IF EXISTS "Projects can be updated by engineers and reviewers" ON projects;

-- Create new simplified policy using helper function
CREATE POLICY "Projects can be updated by authorized users"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    -- Engineers can update their own draft projects
    (engineer_id = auth.uid() AND status = 'draft') OR
    -- Supervisors can update projects pending their review
    (status = 'pending_supervisor' AND get_user_role(auth.uid()) = 'supervisor') OR
    -- HSM can update projects pending their review
    (status = 'pending_hsm' AND get_user_role(auth.uid()) = 'hsm') OR
    -- Lab technicians can update projects pending their review
    (status = 'pending_technician' AND get_user_role(auth.uid()) = 'lab_technician')
  )
  WITH CHECK (
    can_update_project_status(engineer_id, (SELECT status FROM projects WHERE id = projects.id), status)
  );
