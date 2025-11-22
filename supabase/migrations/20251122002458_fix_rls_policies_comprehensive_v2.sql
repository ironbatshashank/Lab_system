/*
  # Comprehensive RLS Policy Fix for Project Approval Workflow

  1. Problem
    - Multiple `get_user_role` functions causing inconsistency
    - WITH CHECK clause doesn't handle all state transitions properly
    - Policies are confusing with mixed function signatures
  
  2. Solution
    - Drop all existing policies first
    - Drop duplicate get_user_role functions
    - Create single, clear get_user_role() function (no parameters)
    - Rebuild UPDATE policy with correct logic for all transitions
    - Add missing case for sending projects back to draft
  
  3. Security
    - Engineers can only update their own draft projects
    - Supervisors can move pending_supervisor → pending_hsm or draft
    - HSM can move pending_hsm → pending_technician or draft
    - Lab technicians can move pending_technician → approved or draft
    - All state transitions are validated
*/

-- Drop all existing policies on projects table
DROP POLICY IF EXISTS "Projects can be updated by authorized users" ON projects;
DROP POLICY IF EXISTS "Engineers can update own projects" ON projects;
DROP POLICY IF EXISTS "Account managers can create projects from client requests" ON projects;
DROP POLICY IF EXISTS "Engineers can create projects" ON projects;
DROP POLICY IF EXISTS "Supervisors can view projects pending their review" ON projects;
DROP POLICY IF EXISTS "HSM can view projects pending their review" ON projects;
DROP POLICY IF EXISTS "Lab technicians can view projects pending their review" ON projects;
DROP POLICY IF EXISTS "Lab directors and quality managers can view all projects" ON projects;
DROP POLICY IF EXISTS "Account managers can view projects linked to client requests" ON projects;
DROP POLICY IF EXISTS "Engineers can view own projects" ON projects;

-- Now drop all existing get_user_role functions
DROP FUNCTION IF EXISTS get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_role() CASCADE;
DROP FUNCTION IF EXISTS can_update_project_status(uuid, project_status, project_status) CASCADE;

-- Create single, consistent get_user_role function (no parameters)
CREATE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$;

-- CREATE SELECT POLICIES
CREATE POLICY "Engineers can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (engineer_id = auth.uid());

CREATE POLICY "Supervisors can view projects pending their review"
  ON projects FOR SELECT
  TO authenticated
  USING (
    status = 'pending_supervisor' AND
    get_user_role() = 'supervisor'
  );

CREATE POLICY "HSM can view projects pending their review"
  ON projects FOR SELECT
  TO authenticated
  USING (
    status = 'pending_hsm' AND
    get_user_role() = 'hsm'
  );

CREATE POLICY "Lab technicians can view projects pending their review"
  ON projects FOR SELECT
  TO authenticated
  USING (
    status = 'pending_technician' AND
    get_user_role() = 'lab_technician'
  );

CREATE POLICY "Lab directors and quality managers can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    get_user_role() IN ('lab_director', 'quality_manager')
  );

CREATE POLICY "Account managers can view projects linked to client requests"
  ON projects FOR SELECT
  TO authenticated
  USING (
    get_user_role() = 'account_manager' AND
    linked_client_request_id IS NOT NULL
  );

-- CREATE INSERT POLICIES
CREATE POLICY "Engineers can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    engineer_id = auth.uid() AND
    get_user_role() = 'engineer'
  );

CREATE POLICY "Account managers can create projects from client requests"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role() = 'account_manager'
  );

-- CREATE UPDATE POLICY
CREATE POLICY "Projects can be updated by authorized users"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    -- Engineers can update their own draft projects
    (engineer_id = auth.uid() AND status = 'draft') OR
    -- Supervisors can update projects pending their review
    (status = 'pending_supervisor' AND get_user_role() = 'supervisor') OR
    -- HSM can update projects pending their review
    (status = 'pending_hsm' AND get_user_role() = 'hsm') OR
    -- Lab technicians can update projects pending their review
    (status = 'pending_technician' AND get_user_role() = 'lab_technician') OR
    -- Lab directors and quality managers can update any project
    (get_user_role() IN ('lab_director', 'quality_manager'))
  )
  WITH CHECK (
    -- Engineers can only keep their projects in draft
    (status = 'draft' AND engineer_id = auth.uid()) OR
    
    -- Supervisors can move to pending_hsm (approve) or back to draft (request changes)
    ((status = 'pending_hsm' OR status = 'draft') AND get_user_role() = 'supervisor') OR
    
    -- HSM can move to pending_technician (approve) or back to draft (request changes)
    ((status = 'pending_technician' OR status = 'draft') AND get_user_role() = 'hsm') OR
    
    -- Lab technicians can move to approved (approve) or back to draft (request changes)
    ((status = 'approved' OR status = 'draft') AND get_user_role() = 'lab_technician') OR
    
    -- Lab directors and quality managers can set any status
    (get_user_role() IN ('lab_director', 'quality_manager'))
  );
