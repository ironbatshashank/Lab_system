/*
  # Fix engineer update policy to avoid conflicts with reviewer policies

  1. Changes
    - Drop the broad engineer update policy
    - Create a more specific policy that only applies to draft projects
    - This prevents conflicts with reviewer policies when updating project status
  
  2. Security
    - Engineers can still update their own draft projects
    - Reviewers can update projects pending their review without conflict
    - Each policy operates on different project states
*/

DROP POLICY IF EXISTS "Engineers can update own projects" ON projects;

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
