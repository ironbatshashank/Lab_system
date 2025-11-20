/*
  # Fix WITH CHECK clause to properly validate reviewer updates

  1. Problem
    - WITH CHECK clause was checking engineer_id = auth.uid() for engineer condition
    - This fails for reviewers even though their condition should pass
  
  2. Solution
    - Remove engineer_id check from WITH CHECK for non-draft statuses
    - Only validate that the new status is appropriate for the user's role
  
  3. Security
    - Engineers can only update their own draft projects
    - Reviewers can update to appropriate next-stage status
*/

DROP POLICY IF EXISTS "Projects can be updated by engineers and reviewers" ON projects;

CREATE POLICY "Projects can be updated by engineers and reviewers"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    -- Engineers can update their own draft projects
    (engineer_id = auth.uid() AND status = 'draft'::project_status) OR
    -- Supervisors can update projects pending their review
    (status = 'pending_supervisor' AND EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'supervisor'
    )) OR
    -- HSM can update projects pending their review
    (status = 'pending_hsm' AND EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'hsm'
    )) OR
    -- Lab technicians can update projects pending their review
    (status = 'pending_technician' AND EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'lab_technician'
    ))
  )
  WITH CHECK (
    -- For draft status, must be the engineer
    (status = 'draft'::project_status AND engineer_id = auth.uid()) OR
    -- For pending_hsm status, must be supervisor
    (status = 'pending_hsm'::project_status AND EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'supervisor'
    )) OR
    -- For pending_technician status, must be HSM
    (status = 'pending_technician'::project_status AND EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'hsm'
    )) OR
    -- For approved status, must be lab technician
    (status = 'approved'::project_status AND EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'lab_technician'
    ))
  );
