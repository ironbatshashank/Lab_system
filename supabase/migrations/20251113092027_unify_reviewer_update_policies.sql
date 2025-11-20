/*
  # Unify reviewer update policies to avoid conflicts

  1. Changes
    - Drop all individual reviewer update policies
    - Create a single unified policy for all reviewers
    - This prevents any potential conflicts between multiple policies
  
  2. Security
    - Supervisors can update projects from pending_supervisor to pending_hsm or draft
    - HSM can update projects from pending_hsm to pending_technician or draft
    - Lab technicians can update projects from pending_technician to approved or draft
    - Each reviewer can only update projects in their review stage
*/

DROP POLICY IF EXISTS "Supervisors can update projects pending their review" ON projects;
DROP POLICY IF EXISTS "HSM can update projects pending their review" ON projects;
DROP POLICY IF EXISTS "Lab technicians can update projects pending their review" ON projects;

CREATE POLICY "Reviewers can update projects in their review stage"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    (status = 'pending_supervisor' AND get_user_role() = 'supervisor') OR
    (status = 'pending_hsm' AND get_user_role() = 'hsm') OR
    (status = 'pending_technician' AND get_user_role() = 'lab_technician')
  )
  WITH CHECK (
    (status IN ('pending_hsm', 'draft') AND get_user_role() = 'supervisor') OR
    (status IN ('pending_technician', 'draft') AND get_user_role() = 'hsm') OR
    (status IN ('approved', 'draft') AND get_user_role() = 'lab_technician')
  );
