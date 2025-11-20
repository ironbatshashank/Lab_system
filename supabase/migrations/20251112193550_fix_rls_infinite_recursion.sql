/*
  # Fix RLS Infinite Recursion in user_profiles

  1. Problem
    - Policies on user_profiles table query user_profiles table causing infinite recursion
    - This prevents users from logging in and viewing their profiles

  2. Solution
    - Create a security definer function to get user role that bypasses RLS
    - Update all policies to use this function instead of querying user_profiles
    - This breaks the infinite recursion loop

  3. Changes
    - Create get_user_role() function
    - Drop and recreate all user_profiles policies using the new function
*/

-- Create a security definer function to get the current user's role
-- This function bypasses RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop existing policies on user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Lab directors can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Lab directors can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Lab directors can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Recreate policies using the security definer function
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Lab directors can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (get_user_role() = 'lab_director');

CREATE POLICY "Lab directors can insert profiles"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'lab_director');

CREATE POLICY "Lab directors can update profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (get_user_role() = 'lab_director');

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Update other policies that query user_profiles to use the function
-- This prevents infinite recursion in other tables as well

-- Projects policies
DROP POLICY IF EXISTS "Supervisors can view projects pending their review" ON projects;
CREATE POLICY "Supervisors can view projects pending their review"
  ON projects FOR SELECT
  TO authenticated
  USING (
    status = 'pending_supervisor' AND
    get_user_role() = 'supervisor'
  );

DROP POLICY IF EXISTS "HSM can view projects pending their review" ON projects;
CREATE POLICY "HSM can view projects pending their review"
  ON projects FOR SELECT
  TO authenticated
  USING (
    status = 'pending_hsm' AND
    get_user_role() = 'hsm'
  );

DROP POLICY IF EXISTS "Lab technicians can view projects pending their review" ON projects;
CREATE POLICY "Lab technicians can view projects pending their review"
  ON projects FOR SELECT
  TO authenticated
  USING (
    status = 'pending_technician' AND
    get_user_role() = 'lab_technician'
  );

DROP POLICY IF EXISTS "Lab directors and quality managers can view all projects" ON projects;
CREATE POLICY "Lab directors and quality managers can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (get_user_role() IN ('lab_director', 'quality_manager'));

DROP POLICY IF EXISTS "Account managers can view projects linked to client requests" ON projects;
CREATE POLICY "Account managers can view projects linked to client requests"
  ON projects FOR SELECT
  TO authenticated
  USING (
    get_user_role() = 'account_manager' AND 
    linked_client_request_id IS NOT NULL
  );

DROP POLICY IF EXISTS "Engineers can create projects" ON projects;
CREATE POLICY "Engineers can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    engineer_id = auth.uid() AND
    get_user_role() = 'engineer'
  );

DROP POLICY IF EXISTS "Account managers can create projects from client requests" ON projects;
CREATE POLICY "Account managers can create projects from client requests"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'account_manager');

-- Client requests policies
DROP POLICY IF EXISTS "Account managers and lab directors can view all client requests" ON client_requests;
CREATE POLICY "Account managers and lab directors can view all client requests"
  ON client_requests FOR SELECT
  TO authenticated
  USING (get_user_role() IN ('account_manager', 'lab_director'));

DROP POLICY IF EXISTS "Clients can create requests" ON client_requests;
CREATE POLICY "Clients can create requests"
  ON client_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = auth.uid() AND
    get_user_role() = 'external_client'
  );

DROP POLICY IF EXISTS "Account managers can update client requests" ON client_requests;
CREATE POLICY "Account managers can update client requests"
  ON client_requests FOR UPDATE
  TO authenticated
  USING (get_user_role() = 'account_manager');

-- Client responses policies
DROP POLICY IF EXISTS "Account managers can view all responses" ON client_responses;
CREATE POLICY "Account managers can view all responses"
  ON client_responses FOR SELECT
  TO authenticated
  USING (get_user_role() IN ('account_manager', 'lab_director'));

DROP POLICY IF EXISTS "Account managers can create responses" ON client_responses;
CREATE POLICY "Account managers can create responses"
  ON client_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    account_manager_id = auth.uid() AND
    get_user_role() = 'account_manager'
  );

-- Client request messages policies
DROP POLICY IF EXISTS "Account managers can view all messages" ON client_request_messages;
CREATE POLICY "Account managers can view all messages"
  ON client_request_messages FOR SELECT
  TO authenticated
  USING (get_user_role() IN ('account_manager', 'lab_director'));

DROP POLICY IF EXISTS "Clients and account managers can create messages" ON client_request_messages;
CREATE POLICY "Clients and account managers can create messages"
  ON client_request_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    (
      EXISTS (
        SELECT 1 FROM client_requests
        WHERE id = request_id AND client_id = auth.uid()
      ) OR
      get_user_role() IN ('account_manager', 'lab_director')
    )
  );

-- Comments policies
DROP POLICY IF EXISTS "Project participants can view comments" ON comments;
CREATE POLICY "Project participants can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.engineer_id = auth.uid() OR
        get_user_role() IN ('supervisor', 'hsm', 'lab_technician', 'lab_director', 'quality_manager')
      )
    ) AND (
      is_internal = true OR
      get_user_role() != 'external_client'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    get_user_role() != 'external_client'
  );

-- Approvals policies
DROP POLICY IF EXISTS "Project participants can view approvals" ON approvals;
CREATE POLICY "Project participants can view approvals"
  ON approvals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.engineer_id = auth.uid() OR
        get_user_role() IN ('supervisor', 'hsm', 'lab_technician', 'lab_director', 'quality_manager')
      )
    )
  );

DROP POLICY IF EXISTS "Approvers can create approvals" ON approvals;
CREATE POLICY "Approvers can create approvals"
  ON approvals FOR INSERT
  TO authenticated
  WITH CHECK (
    approver_id = auth.uid() AND
    get_user_role() IN ('supervisor', 'hsm', 'lab_technician')
  );

-- Project results policies
DROP POLICY IF EXISTS "Project participants can view results" ON project_results;
CREATE POLICY "Project participants can view results"
  ON project_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.engineer_id = auth.uid() OR
        get_user_role() IN ('supervisor', 'hsm', 'lab_technician', 'lab_director', 'quality_manager', 'account_manager')
      )
    ) OR (
      is_client_visible = true AND
      EXISTS (
        SELECT 1 FROM projects p
        JOIN client_requests cr ON p.linked_client_request_id = cr.id
        WHERE p.id = project_id AND cr.client_id = auth.uid()
      )
    )
  );