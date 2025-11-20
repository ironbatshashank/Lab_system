/*
  # Laboratory Project Management System - Initial Schema

  1. New Tables
    - `user_profiles`
      - Extends auth.users with additional profile information
      - `id` (uuid, references auth.users)
      - `full_name` (text)
      - `role` (enum: lab_director, engineer, hsm, lab_technician, supervisor, quality_manager, external_client, account_manager)
      - `organization` (text, nullable - for external clients)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `projects`
      - Core project information with approval workflow tracking
      - `id` (uuid, primary key)
      - `engineer_id` (uuid, references user_profiles)
      - `title` (text)
      - `description` (text)
      - `objectives` (text)
      - `equipment_needed` (jsonb array)
      - `timeline_duration` (text)
      - `safety_considerations` (text)
      - `expected_outcomes` (text)
      - `status` (enum: draft, pending_supervisor, pending_hsm, pending_technician, approved, in_progress, completed)
      - `linked_client_request_id` (uuid, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `submitted_at` (timestamptz, nullable)
    
    - `client_requests`
      - External client problem/proposal submissions
      - `id` (uuid, primary key)
      - `client_id` (uuid, references user_profiles)
      - `request_type` (enum: problem, proposal)
      - `title` (text)
      - `description` (text)
      - `detailed_requirements` (text)
      - `priority` (enum: low, medium, high, urgent)
      - `attachments` (jsonb array)
      - `status` (enum: new, under_review, quoted, accepted, rejected, converted_to_project)
      - `assigned_account_manager_id` (uuid, nullable)
      - `submitted_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `client_responses`
      - Account manager quotations and responses
      - `id` (uuid, primary key)
      - `request_id` (uuid, references client_requests)
      - `account_manager_id` (uuid, references user_profiles)
      - `response_text` (text)
      - `quotation_amount` (numeric, nullable)
      - `currency` (text, default 'USD')
      - `estimated_timeline` (text)
      - `deliverables` (jsonb array)
      - `terms_and_conditions` (text)
      - `status` (enum: draft, sent, revised, accepted, rejected)
      - `created_at` (timestamptz)
      - `sent_at` (timestamptz, nullable)
      - `updated_at` (timestamptz)
    
    - `client_request_messages`
      - Communication thread for client requests
      - `id` (uuid, primary key)
      - `request_id` (uuid, references client_requests)
      - `sender_id` (uuid, references user_profiles)
      - `message_text` (text)
      - `attachments` (jsonb array)
      - `is_internal_note` (boolean, default false)
      - `created_at` (timestamptz)
    
    - `comments`
      - Project comments and feedback
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `user_id` (uuid, references user_profiles)
      - `comment_text` (text)
      - `stage` (text)
      - `is_internal` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz, nullable)
    
    - `approvals`
      - Project approval tracking by role
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `approver_id` (uuid, references user_profiles)
      - `approver_role` (text)
      - `status` (enum: pending, approved, changes_requested)
      - `comments` (text, nullable)
      - `approved_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
    
    - `project_results`
      - Uploaded experiment results and data
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `uploaded_by` (uuid, references user_profiles)
      - `file_name` (text)
      - `file_url` (text)
      - `file_type` (text)
      - `parsed_data` (jsonb, nullable)
      - `is_client_visible` (boolean, default false)
      - `uploaded_at` (timestamptz)
    
    - `notifications`
      - User notification system
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `notification_type` (text)
      - `title` (text)
      - `message` (text)
      - `project_id` (uuid, nullable)
      - `request_id` (uuid, nullable)
      - `link_url` (text, nullable)
      - `is_read` (boolean, default false)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Create policies for role-based access control
    - External clients can only see their own requests
    - Account managers can see all client requests
    - Internal users access based on role
    - Lab directors have full access
*/

-- Create custom types
CREATE TYPE user_role AS ENUM (
  'lab_director',
  'engineer',
  'hsm',
  'lab_technician',
  'supervisor',
  'quality_manager',
  'external_client',
  'account_manager'
);

CREATE TYPE project_status AS ENUM (
  'draft',
  'pending_supervisor',
  'pending_hsm',
  'pending_technician',
  'approved',
  'in_progress',
  'completed'
);

CREATE TYPE request_type AS ENUM ('problem', 'proposal');

CREATE TYPE request_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TYPE request_status AS ENUM (
  'new',
  'under_review',
  'quoted',
  'accepted',
  'rejected',
  'converted_to_project'
);

CREATE TYPE response_status AS ENUM ('draft', 'sent', 'revised', 'accepted', 'rejected');

CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'changes_requested');

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role user_role NOT NULL,
  organization text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  objectives text NOT NULL,
  equipment_needed jsonb DEFAULT '[]'::jsonb,
  timeline_duration text NOT NULL,
  safety_considerations text NOT NULL,
  expected_outcomes text NOT NULL,
  status project_status DEFAULT 'draft',
  linked_client_request_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  submitted_at timestamptz
);

-- Create client_requests table
CREATE TABLE IF NOT EXISTS client_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  request_type request_type NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  detailed_requirements text NOT NULL,
  priority request_priority DEFAULT 'medium',
  attachments jsonb DEFAULT '[]'::jsonb,
  status request_status DEFAULT 'new',
  assigned_account_manager_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create client_responses table
CREATE TABLE IF NOT EXISTS client_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES client_requests(id) ON DELETE CASCADE,
  account_manager_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  response_text text NOT NULL,
  quotation_amount numeric(12, 2),
  currency text DEFAULT 'USD',
  estimated_timeline text NOT NULL,
  deliverables jsonb DEFAULT '[]'::jsonb,
  terms_and_conditions text,
  status response_status DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Create client_request_messages table
CREATE TABLE IF NOT EXISTS client_request_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES client_requests(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  message_text text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  is_internal_note boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  stage text,
  is_internal boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

-- Create approvals table
CREATE TABLE IF NOT EXISTS approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  approver_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  approver_role text NOT NULL,
  status approval_status DEFAULT 'pending',
  comments text,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create project_results table
CREATE TABLE IF NOT EXISTS project_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  parsed_data jsonb,
  is_client_visible boolean DEFAULT false,
  uploaded_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  request_id uuid REFERENCES client_requests(id) ON DELETE CASCADE,
  link_url text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key for linked_client_request_id after client_requests is created
ALTER TABLE projects 
  ADD CONSTRAINT fk_linked_client_request 
  FOREIGN KEY (linked_client_request_id) 
  REFERENCES client_requests(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_projects_engineer ON projects(engineer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_client_requests_client ON client_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_status ON client_requests(status);
CREATE INDEX IF NOT EXISTS idx_client_requests_manager ON client_requests(assigned_account_manager_id);
CREATE INDEX IF NOT EXISTS idx_comments_project ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_approvals_project ON approvals(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_request_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Lab directors can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'lab_director'
    )
  );

CREATE POLICY "Lab directors can insert profiles"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'lab_director'
    )
  );

CREATE POLICY "Lab directors can update profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'lab_director'
    )
  );

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for projects
CREATE POLICY "Engineers can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (engineer_id = auth.uid());

CREATE POLICY "Supervisors can view projects pending their review"
  ON projects FOR SELECT
  TO authenticated
  USING (
    status = 'pending_supervisor' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'supervisor'
    )
  );

CREATE POLICY "HSM can view projects pending their review"
  ON projects FOR SELECT
  TO authenticated
  USING (
    status = 'pending_hsm' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'hsm'
    )
  );

CREATE POLICY "Lab technicians can view projects pending their review"
  ON projects FOR SELECT
  TO authenticated
  USING (
    status = 'pending_technician' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'lab_technician'
    )
  );

CREATE POLICY "Lab directors and quality managers can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('lab_director', 'quality_manager')
    )
  );

CREATE POLICY "Account managers can view projects linked to client requests"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'account_manager'
    ) AND linked_client_request_id IS NOT NULL
  );

CREATE POLICY "Engineers can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    engineer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'engineer'
    )
  );

CREATE POLICY "Engineers can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (engineer_id = auth.uid())
  WITH CHECK (engineer_id = auth.uid());

CREATE POLICY "Account managers can create projects from client requests"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'account_manager'
    )
  );

-- RLS Policies for client_requests
CREATE POLICY "Clients can view own requests"
  ON client_requests FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Account managers and lab directors can view all client requests"
  ON client_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('account_manager', 'lab_director')
    )
  );

CREATE POLICY "Clients can create requests"
  ON client_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'external_client'
    )
  );

CREATE POLICY "Clients can update own requests"
  ON client_requests FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Account managers can update client requests"
  ON client_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'account_manager'
    )
  );

-- RLS Policies for client_responses
CREATE POLICY "Clients can view responses to their requests"
  ON client_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_requests
      WHERE id = request_id AND client_id = auth.uid()
    )
  );

CREATE POLICY "Account managers can view all responses"
  ON client_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('account_manager', 'lab_director')
    )
  );

CREATE POLICY "Account managers can create responses"
  ON client_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    account_manager_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'account_manager'
    )
  );

CREATE POLICY "Account managers can update own responses"
  ON client_responses FOR UPDATE
  TO authenticated
  USING (account_manager_id = auth.uid())
  WITH CHECK (account_manager_id = auth.uid());

-- RLS Policies for client_request_messages
CREATE POLICY "Clients can view messages for their requests"
  ON client_request_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_requests
      WHERE id = request_id AND client_id = auth.uid()
    ) AND is_internal_note = false
  );

CREATE POLICY "Account managers can view all messages"
  ON client_request_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('account_manager', 'lab_director')
    )
  );

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
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role IN ('account_manager', 'lab_director')
      )
    )
  );

-- RLS Policies for comments
CREATE POLICY "Project participants can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.engineer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role IN ('supervisor', 'hsm', 'lab_technician', 'lab_director', 'quality_manager')
        )
      )
    ) AND (
      is_internal = true OR
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role != 'external_client'
      )
    )
  );

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role != 'external_client'
    )
  );

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for approvals
CREATE POLICY "Project participants can view approvals"
  ON approvals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.engineer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role IN ('supervisor', 'hsm', 'lab_technician', 'lab_director', 'quality_manager')
        )
      )
    )
  );

CREATE POLICY "Approvers can create approvals"
  ON approvals FOR INSERT
  TO authenticated
  WITH CHECK (
    approver_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('supervisor', 'hsm', 'lab_technician')
    )
  );

CREATE POLICY "Approvers can update own approvals"
  ON approvals FOR UPDATE
  TO authenticated
  USING (approver_id = auth.uid())
  WITH CHECK (approver_id = auth.uid());

-- RLS Policies for project_results
CREATE POLICY "Project participants can view results"
  ON project_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (
        p.engineer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role IN ('supervisor', 'hsm', 'lab_technician', 'lab_director', 'quality_manager', 'account_manager')
        )
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

CREATE POLICY "Engineers can upload results"
  ON project_results FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND p.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can update own results"
  ON project_results FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_client_requests_updated_at
  BEFORE UPDATE ON client_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_client_responses_updated_at
  BEFORE UPDATE ON client_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();