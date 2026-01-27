-- Create storage bucket for ID documents (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-documents', 'id-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'id-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own documents
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'id-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all documents for verification
CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'id-documents' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Create a sample active election for testing
INSERT INTO public.elections (title, description, status, start_date, end_date)
VALUES 
  ('2026 State Governor Election', 'Vote for your state governor. This election determines the executive leader of the state for the next 4 years.', 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '7 days'),
  ('Student Council President 2026', 'Annual student council election. Vote for the candidate who will represent student interests.', 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '5 days');

-- Create sample candidates for state election
INSERT INTO public.candidates (election_id, name, party, bio, image_url)
SELECT 
  id,
  'Alexandra Chen',
  'Progressive Party',
  'Former state senator with 12 years of experience.
Champion of education reform and healthcare access.
Committed to sustainable economic growth.',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face'
FROM public.elections WHERE title = '2026 State Governor Election'
UNION ALL
SELECT 
  id,
  'Marcus Williams',
  'Conservative Alliance',
  'Business leader and former mayor.
Focus on fiscal responsibility and job creation.
Advocate for public safety and infrastructure.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
FROM public.elections WHERE title = '2026 State Governor Election'
UNION ALL
SELECT 
  id,
  'Priya Sharma',
  'Independent',
  'Environmental scientist and community organizer.
Emphasis on climate action and green jobs.
Non-partisan approach to governance.',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face'
FROM public.elections WHERE title = '2026 State Governor Election';

-- Create sample candidates for college election
INSERT INTO public.candidates (election_id, name, party, bio, image_url)
SELECT 
  id,
  'Jordan Martinez',
  'Unity Coalition',
  'Junior majoring in Political Science.
Led successful campus sustainability initiative.
Committed to student mental health resources.',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face'
FROM public.elections WHERE title = 'Student Council President 2026'
UNION ALL
SELECT 
  id,
  'Taylor Kim',
  'Student First',
  'Senior in Business Administration.
Founded the campus entrepreneurship club.
Advocate for affordable housing and textbooks.',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face'
FROM public.elections WHERE title = 'Student Council President 2026';