/*
  # Fix approvals update policy for reviewers

  1. Changes
    - Drop the restrictive update policy that only allows updating own approvals
    - Add new policy that allows reviewers to update approvals for their role
    - This allows supervisors/HSM/technicians to update approval records even if approver_id is NULL or different
  
  2. Security
    - Reviewers can only update approvals for their specific role
    - They must be authenticated
    - Ensures approval workflow can progress properly
*/

DROP POLICY IF EXISTS "Approvers can update own approvals" ON approvals;

CREATE POLICY "Reviewers can update approvals for their role"
  ON approvals FOR UPDATE
  TO authenticated
  USING (
    approver_role = get_user_role()::text AND
    get_user_role() = ANY (ARRAY['supervisor'::user_role, 'hsm'::user_role, 'lab_technician'::user_role])
  )
  WITH CHECK (
    approver_role = get_user_role()::text AND
    get_user_role() = ANY (ARRAY['supervisor'::user_role, 'hsm'::user_role, 'lab_technician'::user_role])
  );
