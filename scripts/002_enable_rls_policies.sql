-- Row Level Security (RLS) policies for all tables
-- This ensures users can only access data they're authorized to see

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE parsed_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Companies policies
-- Employers can view all companies, but only manage their own
CREATE POLICY "Anyone can view active companies"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Employers can create companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their companies"
  ON companies FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their companies"
  ON companies FOR DELETE
  USING (auth.uid() = owner_id);

-- Jobs policies
-- Anyone can view active jobs, employers can manage their company's jobs
CREATE POLICY "Anyone can view active jobs"
  ON jobs FOR SELECT
  USING (status = 'active' OR posted_by = auth.uid());

CREATE POLICY "Employers can create jobs for their companies"
  ON jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Employers can update their company's jobs"
  ON jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Employers can delete their company's jobs"
  ON jobs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Applicants policies
-- Users can only view and manage their own applicant profile
CREATE POLICY "Users can view their own applicant profile"
  ON applicants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applicant profile"
  ON applicants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applicant profile"
  ON applicants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applicant profile"
  ON applicants FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Employers can view applicants who applied to their jobs"
  ON applicants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications
      JOIN jobs ON applications.job_id = jobs.id
      JOIN companies ON jobs.company_id = companies.id
      WHERE applications.applicant_id = applicants.id
      AND companies.owner_id = auth.uid()
    )
  );

-- Applications policies
-- Applicants can view their own applications, employers can view applications to their jobs
CREATE POLICY "Applicants can view their own applications"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applicants
      WHERE applicants.id = applications.applicant_id
      AND applicants.user_id = auth.uid()
    )
  );

CREATE POLICY "Applicants can create applications"
  ON applications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applicants
      WHERE applicants.id = applications.applicant_id
      AND applicants.user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can view applications to their jobs"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN companies ON jobs.company_id = companies.id
      WHERE jobs.id = applications.job_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Employers can update application status"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN companies ON jobs.company_id = companies.id
      WHERE jobs.id = applications.job_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Parsed resumes policies
-- Users can view their own parsed resume, employers can view parsed resumes of applicants to their jobs
CREATE POLICY "Users can view their own parsed resume"
  ON parsed_resumes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applicants
      WHERE applicants.id = parsed_resumes.applicant_id
      AND applicants.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create parsed resumes"
  ON parsed_resumes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applicants
      WHERE applicants.id = parsed_resumes.applicant_id
      AND applicants.user_id = auth.uid()
    )
  );

CREATE POLICY "System can update parsed resumes"
  ON parsed_resumes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM applicants
      WHERE applicants.id = parsed_resumes.applicant_id
      AND applicants.user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can view parsed resumes of applicants to their jobs"
  ON parsed_resumes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications
      JOIN jobs ON applications.job_id = jobs.id
      JOIN companies ON jobs.company_id = companies.id
      WHERE applications.applicant_id = parsed_resumes.applicant_id
      AND companies.owner_id = auth.uid()
    )
  );

-- Activity logs policies
-- Users can view their own activity logs, admins can view all
CREATE POLICY "Users can view their own activity logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (true);
