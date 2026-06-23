-- Supabase Table Schema for ResuTailor
-- Copy and paste this script into your Supabase SQL Editor (https://supabase.com/dashboard/project/ybhqwesrfiaeyplsjtfj/sql/new)

CREATE TABLE IF NOT EXISTS public.tailored_resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_name TEXT,
  cv_text TEXT,
  job_links JSONB DEFAULT '[]'::jsonb,
  active_job_index INTEGER,
  chat_messages JSONB DEFAULT '[]'::jsonb,
  resume_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tailored_resumes ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read/insert/update/delete tailored resumes
-- (Note: For production, you should bind these to auth.uid() using user_id column)
CREATE POLICY "Allow public CRUD operations" ON public.tailored_resumes
    FOR ALL
    USING (true)
    WITH CHECK (true);
