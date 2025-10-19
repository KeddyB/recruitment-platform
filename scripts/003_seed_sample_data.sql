-- Sample data for testing and development
-- This script adds sample companies, jobs, and applicants

-- Note: This assumes you have at least one authenticated user
-- You'll need to replace the UUIDs with actual user IDs from auth.users after signup

-- Insert sample companies (you'll need to update owner_id with real user IDs)
-- For now, we'll create a comment showing the structure
-- Uncomment and update after creating test users

/*
INSERT INTO companies (name, description, website, owner_id) VALUES
  ('TechCorp Inc', 'Leading technology company specializing in AI and cloud solutions', 'https://techcorp.example.com', 'YOUR_USER_ID_HERE'),
  ('StartupHub', 'Fast-growing startup in the fintech space', 'https://startuphub.example.com', 'YOUR_USER_ID_HERE'),
  ('Global Solutions', 'International consulting firm', 'https://globalsolutions.example.com', 'YOUR_USER_ID_HERE');
*/

-- Insert sample jobs (update company_id and posted_by after creating companies)
/*
INSERT INTO jobs (company_id, title, description, location, job_type, salary_range, requirements, posted_by, status) VALUES
  (
    'COMPANY_ID_HERE',
    'Senior Full Stack Developer',
    'We are looking for an experienced full stack developer to join our team. You will work on cutting-edge projects using React, Node.js, and PostgreSQL.',
    'San Francisco, CA',
    'full-time',
    '$120,000 - $180,000',
    'Requirements: 5+ years experience with React, Node.js, PostgreSQL. Strong problem-solving skills.',
    'USER_ID_HERE',
    'active'
  ),
  (
    'COMPANY_ID_HERE',
    'Product Designer',
    'Join our design team to create beautiful and intuitive user experiences.',
    'Remote',
    'full-time',
    '$90,000 - $130,000',
    'Requirements: 3+ years experience in product design, proficiency in Figma, strong portfolio.',
    'USER_ID_HERE',
    'active'
  );
*/

-- The actual seeding will happen after we create the authentication system
-- and have real user IDs to work with
