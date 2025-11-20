/*
  # Fix WITH CHECK subquery issue

  1. Problem
    - WITH CHECK was using a subquery to get old status
    - This doesn't work properly in UPDATE context
  
  2. Solution
    - Store old status in a session variable before UPDATE
    - Or use a simpler approach without subquery
    - Actually, use a trigger-based approach
  
  3. Better Solution
    - Simplify WITH CHECK to just validate new status + role
    - Don't try to check old status in WITH CHECK
*/

DROP POLICY IF EXISTS "Projects can be updated by authorized users" ON projects;

-- Recreate policy with simpler WITH CHECK
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
    -- For draft status, must be the engineer
    (status = 'draft' AND engineer_id = auth.uid()) OR
    -- For pending_hsm status, must be supervisor
    (status = 'pending_hsm' AND get_user_role(auth.uid()) = 'supervisor') OR
    -- For pending_technician status, must be HSM
    (status = 'pending_technician' AND get_user_role(auth.uid()) = 'hsm') OR
    -- For approved status, must be lab technician
    (status = 'approved' AND get_user_role(auth.uid()) = 'lab_technician')
  );
