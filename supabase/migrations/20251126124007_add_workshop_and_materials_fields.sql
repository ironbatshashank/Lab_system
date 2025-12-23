/*
  # Add Workshop and Materials Tracking Fields (Pages 2 & 3)

  1. New Tables
    - `project_materials` - Track materials needed for projects
    - `project_labor` - Track workshop labor hours
  
  2. New Columns in Projects Table
    - `work_location` (text) - Main Labs or Workshop
    - `technician_allocated` (text) - Name of assigned technician
    - `qty_material_supplied_by_soe` (text) - Quantity of materials supplied
    - `po_numbers` (text) - Purchase order numbers for materials
    - `workshop_remarks` (text) - Workshop-specific remarks
    - `completion_date` (date) - Actual completion date
    - `waiver_late_submission` (text) - Late submission waiver details
    - `waiver_variation` (text) - Variation waiver details
  
  3. Security
    - Enable RLS on new tables
    - Engineers can manage their own project materials/labor
    - Lab technicians and supervisors can view/update
*/

-- Add workshop and completion fields to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS work_location text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS technician_allocated text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS qty_material_supplied_by_soe text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS po_numbers text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS workshop_remarks text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS completion_date date;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS waiver_late_submission text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS waiver_variation text;

-- Create project_materials table
CREATE TABLE IF NOT EXISTS project_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  material_name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  unit_price numeric NOT NULL DEFAULT 0,
  cost numeric GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_labor table
CREATE TABLE IF NOT EXISTS project_labor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  technician_name text NOT NULL,
  work_date date NOT NULL,
  start_time time,
  finish_time time,
  hours numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE project_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_labor ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_materials
CREATE POLICY "Engineers can view own project materials"
  ON project_materials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_materials.project_id
      AND projects.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can insert own project materials"
  ON project_materials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_materials.project_id
      AND projects.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can update own project materials"
  ON project_materials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_materials.project_id
      AND projects.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can delete own project materials"
  ON project_materials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_materials.project_id
      AND projects.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Supervisors and technicians can view all project materials"
  ON project_materials FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('supervisor', 'lab_technician', 'lab_director', 'quality_manager')
  );

-- RLS Policies for project_labor
CREATE POLICY "Engineers can view own project labor"
  ON project_labor FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_labor.project_id
      AND projects.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can insert own project labor"
  ON project_labor FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_labor.project_id
      AND projects.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can update own project labor"
  ON project_labor FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_labor.project_id
      AND projects.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Engineers can delete own project labor"
  ON project_labor FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_labor.project_id
      AND projects.engineer_id = auth.uid()
    )
  );

CREATE POLICY "Supervisors and technicians can view all project labor"
  ON project_labor FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('supervisor', 'lab_technician', 'lab_director', 'quality_manager')
  );

CREATE POLICY "Lab technicians can manage project labor"
  ON project_labor FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'lab_technician'
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_materials_project_id ON project_materials(project_id);
CREATE INDEX IF NOT EXISTS idx_project_labor_project_id ON project_labor(project_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_project_materials_updated_at ON project_materials;
CREATE TRIGGER update_project_materials_updated_at
  BEFORE UPDATE ON project_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_labor_updated_at ON project_labor;
CREATE TRIGGER update_project_labor_updated_at
  BEFORE UPDATE ON project_labor
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
