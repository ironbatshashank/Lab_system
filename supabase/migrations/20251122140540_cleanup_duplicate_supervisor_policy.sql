/*
  # Cleanup Duplicate Supervisor Policy

  1. Problem
    - Two UPDATE policies exist: "Policy with table joins" and "Projects can be updated by authorized users"
    - This causes confusion and potential conflicts
  
  2. Solution
    - Remove the generic "Policy with table joins"
    - Keep the comprehensive "Projects can be updated by authorized users" policy
    - This policy already handles all supervisor update cases correctly
  
  3. Security
    - Maintains proper authorization for all roles
    - Supervisors can update pending_supervisor projects and move them to pending_hsm or draft
*/

-- Drop the duplicate policy
DROP POLICY IF EXISTS "Policy with table joins" ON projects;
