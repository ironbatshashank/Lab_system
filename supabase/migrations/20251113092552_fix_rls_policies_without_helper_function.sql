/*
  # Fix RLS policies by removing dependency on get_user_role() helper function

  1. Changes
    - Drop all existing UPDATE policies on projects table
    - Recreate policies using direct subquery instead of helper function
    - This avoids issues with SECURITY DEFINER functions in RLS context
  
  2. Security
    - Same security guarantees as before
    - Reviewers can only update projects in their assigned review stage
    - Engineers can only update their own draft projects
*/

-- Drop all existing UPDATE policies
DROP POLICY IF EXISTS "Engineers can update own draft projects" ON projects;
DROP POLICY IF EXISTS "Reviewers can update projects in their review stage" ON projects;

-- Recreate engineer policy with direct check
CREATE POLICY "Engineers can update own draft projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    engineer_id = auth.uid() AND
    status = 'draft'::project_status
  )
  WITH CHECK (
    engineer_id = auth.uid() AND
    status = 'draft'::project_status
  );

-- Recreate unified reviewer policy with direct subquery
CREATE POLICY "Reviewers can update projects in their review stage"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    (status = 'pending_supervisor' AND EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'supervisor'
    )) OR
    (status = 'pending_hsm' AND EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'hsm'
    )) OR
    (status = 'pending_technician' AND EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'lab_technician'
    ))
  )
  WITH CHECK (
    (status IN ('pending_hsm', 'draft') AND EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'supervisor'
    )) OR
    (status IN ('pending_technician', 'draft') AND EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'hsm'
    )) OR
    (status IN ('approved', 'draft') AND EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'lab_technician'
    ))
  );
