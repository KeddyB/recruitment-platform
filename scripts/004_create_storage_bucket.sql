-- Create storage bucket for resumes
-- This script sets up the Supabase Storage bucket for resume files

-- Create the resumes bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for resumes bucket
-- Allow authenticated users to upload their own resumes
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own resumes
CREATE POLICY "Users can view their own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own resumes
CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own resumes
CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow employers to view resumes of applicants who applied to their jobs
CREATE POLICY "Employers can view applicant resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  EXISTS (
    SELECT 1 FROM applications
    JOIN applicants ON applications.applicant_id = applicants.id
    JOIN jobs ON applications.job_id = jobs.id
    JOIN companies ON jobs.company_id = companies.id
    WHERE companies.owner_id = auth.uid()
    AND (storage.foldername(name))[1] = applicants.user_id::text
  )
);
