/*
  # Simplify approvals insert policy

  1. Changes
    - Drop restrictive INSERT policy that checks approver_id
    - Create simpler policy that just checks user role
    - This allows reviewers to create approval records more easily
  
  2. Security
    - Still restricts to authenticated reviewers only
    - Ensures only supervisors, HSM, and lab technicians can create approvals
*/

DROP POLICY IF EXISTS "Approvers can create approvals" ON approvals;

CREATE POLICY "Reviewers can create approvals"
  ON approvals FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role() = ANY (ARRAY['supervisor'::user_role, 'hsm'::user_role, 'lab_technician'::user_role])
  );
