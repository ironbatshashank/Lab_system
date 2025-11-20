/*
  # Add RLS policies for reviewers to update project status

  1. Changes
    - Add policy for supervisors to update projects from pending_supervisor to pending_hsm or draft
    - Add policy for HSM to update projects from pending_hsm to pending_technician or draft
    - Add policy for lab technicians to update projects from pending_technician to approved or draft
  
  2. Security
    - Reviewers can only update projects that are pending their review
    - They can only change status to the next stage or back to draft
    - Engineers retain ability to update their own draft projects
*/

CREATE POLICY "Supervisors can update projects pending their review"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    status = 'pending_supervisor' AND 
    get_user_role() = 'supervisor'
  )
  WITH CHECK (
    status IN ('pending_hsm', 'draft') AND 
    get_user_role() = 'supervisor'
  );

CREATE POLICY "HSM can update projects pending their review"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    status = 'pending_hsm' AND 
    get_user_role() = 'hsm'
  )
  WITH CHECK (
    status IN ('pending_technician', 'draft') AND 
    get_user_role() = 'hsm'
  );

CREATE POLICY "Lab technicians can update projects pending their review"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    status = 'pending_technician' AND 
    get_user_role() = 'lab_technician'
  )
  WITH CHECK (
    status IN ('approved', 'draft') AND 
    get_user_role() = 'lab_technician'
  );
