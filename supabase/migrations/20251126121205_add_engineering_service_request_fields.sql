/*
  # Add Engineering Service Request Form Fields

  1. Changes
    - Add comprehensive form fields to projects table to match Engineering Service Request Form
    - Fields include: requestor details, project type, student details, priority, dates, job description, etc.
  
  2. New Columns
    - `job_card_number` (text) - Auto-generated job card number
    - `requestor_faculty_school` (text) - Faculty/School/External Organization
    - `requestor_email` (text) - Contact email
    - `requestor_phone` (text) - Contact phone
    - `type_of_work` (text) - Undergraduate/Postgraduate/External/Teaching
    - `student_project_title` (text) - Project title for student projects
    - `student_name` (text) - Name of student
    - `supervisor_name` (text) - Name of supervisor
    - `health_safety_confirmed` (boolean) - Confirmation checkbox
    - `priority` (text) - A/B/C priority level
    - `date_required` (date) - Date required for completion
    - `job_description` (text) - Detailed job description
    - `remarks` (text) - Additional remarks
    - `variation_order_requested` (boolean) - YES/NO
    - `drawings_attached` (boolean) - If drawings are attached
  
  3. Security
    - All fields are nullable except boolean defaults
    - Engineers can update these fields in draft status
*/

-- Add new columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS job_card_number text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS requestor_faculty_school text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS requestor_email text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS requestor_phone text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS type_of_work text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS student_project_title text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS student_name text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS supervisor_name text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS health_safety_confirmed boolean DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS priority text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS date_required date;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS job_description text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS remarks text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS variation_order_requested boolean DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS drawings_attached boolean DEFAULT false;

-- Create function to generate job card number
CREATE OR REPLACE FUNCTION generate_job_card_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_number integer;
  year_suffix text;
BEGIN
  year_suffix := to_char(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(job_card_number FROM '\d+') AS integer)), 0) + 1
  INTO next_number
  FROM projects
  WHERE job_card_number IS NOT NULL;
  
  RETURN 'JC' || year_suffix || '-' || LPAD(next_number::text, 4, '0');
END;
$$;

-- Create trigger to auto-generate job card number on insert
CREATE OR REPLACE FUNCTION set_job_card_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.job_card_number IS NULL THEN
    NEW.job_card_number := generate_job_card_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_job_card_number ON projects;
CREATE TRIGGER trigger_set_job_card_number
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION set_job_card_number();
