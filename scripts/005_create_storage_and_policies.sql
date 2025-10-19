-- Create resumes storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own resumes
CREATE POLICY "Users can upload their own resumes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own resumes
CREATE POLICY "Users can read their own resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to resumes (for employers)
CREATE POLICY "Public can read resumes"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'resumes');
