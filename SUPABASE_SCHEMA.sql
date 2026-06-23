-- Supabase Table Schema for ResuTailor
-- Copy and paste this script into your Supabase SQL Editor (https://supabase.com/dashboard/project/ybhqwesrfiaeyplsjtfj/sql/new)

-- 1. Profiles Table for User Management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  website TEXT,
  school TEXT,
  degree TEXT,
  grad_year TEXT,
  adisadel BOOLEAN DEFAULT true,
  aspiration TEXT,
  ai_tone TEXT DEFAULT 'professional',
  ai_language TEXT DEFAULT 'english',
  ai_strictness TEXT DEFAULT 'medium',
  khadija_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Allow individual read" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow individual insert" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow individual update" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);


-- 2. Resumes Table Update
CREATE TABLE IF NOT EXISTS public.tailored_resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Create policy that allows users to manage their own resumes, and public access to guest resumes
CREATE POLICY "Allow authenticated or guest CRUD operations" ON public.tailored_resumes
    FOR ALL
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

