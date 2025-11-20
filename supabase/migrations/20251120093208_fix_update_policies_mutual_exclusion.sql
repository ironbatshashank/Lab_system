/*
  # Fix UPDATE policies with proper mutual exclusion

  1. Problem
    - Multiple PERMISSIVE policies require ALL WITH CHECK clauses to pass
    - Engineer policy WITH CHECK was rejecting reviewer updates
  
  2. Solution
    - Drop both existing UPDATE policies
    - Create a single comprehensive policy covering all cases
    - Use CASE-style logic to handle engineers vs reviewers
  
  3. Security
    - Engineers can update their own draft projects
    - Reviewers can update projects in their review stage only
    - No overlap or conflicts between the two cases
*/

DROP POLICY IF EXISTS "Engineers can update own draft projects" ON projects;
DROP POLICY IF EXISTS "Reviewers can update projects in their review stage" ON projects;

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
    -- Engineers can only keep status as draft
    (engineer_id = auth.uid() AND status = 'draft'::project_status) OR
    -- Supervisors can change to pending_hsm or draft
    (status IN ('pending_hsm', 'draft') AND EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'supervisor'
    )) OR
    -- HSM can change to pending_technician or draft
    (status IN ('pending_technician', 'draft') AND EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'hsm'
    )) OR
    -- Lab technicians can change to approved or draft
    (status IN ('approved', 'draft') AND EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'lab_technician'
    ))
  );
