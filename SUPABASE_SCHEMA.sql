-- ========================================================
-- Yɛnkɔ (Campus Ride & Delivery System for Students)
-- Supabase PostgreSQL Database Schema
-- Project Reference: xzldfxvkjmgkiwhjesoe
-- Copy & paste into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xzldfxvkjmgkiwhjesoe/sql/new
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- 1. PROFILES TABLE (Students, Drivers, Admins)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'driver', 'admin')),
  full_name TEXT,
  phone TEXT,
  email TEXT,
  university TEXT DEFAULT 'UMaT (Tarkwa)',
  student_id_number TEXT,
  avatar_url TEXT,
  
  -- Driver-specific fields
  vehicle_type TEXT DEFAULT 'Taxi / Car' CHECK (vehicle_type IN ('Taxi / Car', 'Bus / Shuttle', 'Motorbike', 'E-Bicycle')),
  vehicle_plate TEXT,
  is_available BOOLEAN DEFAULT false,
  driver_rating NUMERIC(3, 2) DEFAULT 5.0,
  total_trips INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are readable by authenticated users" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);


-- --------------------------------------------------------
-- 2. CAMPUS LOCATIONS (Pre-configured Campus Hotspots)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campus_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hall', 'hostel', 'faculty', 'gate', 'commercial', 'canteen')),
  description TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Campus Locations
ALTER TABLE public.campus_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read campus locations" ON public.campus_locations;
CREATE POLICY "Everyone can read campus locations" ON public.campus_locations
    FOR SELECT USING (true);


-- --------------------------------------------------------
-- 3. TRIPS & DELIVERIES TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  service_type TEXT NOT NULL CHECK (service_type IN ('ride', 'delivery')),
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  package_details TEXT, -- Used if service_type = 'delivery' (e.g. "Food package from Canteen")
  recipient_phone TEXT,  -- Used for deliveries if sending to someone else
  
  fare_amount NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'cash_on_delivery')),
  payment_method TEXT NOT NULL DEFAULT 'momo' CHECK (payment_method IN ('momo', 'cash', 'card')),
  payment_reference TEXT,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Trips
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view their own trips" ON public.trips;
CREATE POLICY "Students can view their own trips" ON public.trips
    FOR SELECT USING (auth.uid() = student_id OR auth.uid() = driver_id OR driver_id IS NULL);

DROP POLICY IF EXISTS "Students can create trips" ON public.trips;
CREATE POLICY "Students can create trips" ON public.trips
    FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students or Drivers can update trips" ON public.trips;
CREATE POLICY "Students or Drivers can update trips" ON public.trips
    FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = driver_id OR driver_id IS NULL);


-- --------------------------------------------------------
-- 4. RATINGS & REVIEWS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read ratings" ON public.ratings;
CREATE POLICY "Everyone can read ratings" ON public.ratings
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert ratings for their trips" ON public.ratings;
CREATE POLICY "Users can insert ratings for their trips" ON public.ratings
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);


-- --------------------------------------------------------
-- 5. TRANSACTIONS TABLE (Paystack / Mobile Money Logs)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  reference TEXT UNIQUE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'GHS',
  payment_channel TEXT DEFAULT 'mobile_money', -- e.g. MTN MoMo, Telecel Cash, Telecel
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);


-- --------------------------------------------------------
-- 6. SEED DATA: CAMPUS HOTSPOTS (UMaT Campus Examples)
-- --------------------------------------------------------
INSERT INTO public.campus_locations (name, category, description) VALUES
  ('Main Gate', 'gate', 'University Main Entrance Gate'),
  ('KT Hall (Kofi Annan Hall)', 'hall', 'On-campus Student Residence'),
  ('SRID Hall', 'hall', 'School of Railway and Infrastructure Development'),
  ('Gold Refinery Lab', 'faculty', 'Faculty of Minerals and Petroleum'),
  ('Library & ICT Complex', 'faculty', 'Central Library and Computer Labs'),
  ('University Canteen', 'canteen', 'Central Student Dining & Food Hub'),
  ('Town Market Junction', 'commercial', 'Tarkwa Town Shuttle Pickup Point'),
  ('Administration Block', 'faculty', 'Vice Chancellor & Registrar Offices')
ON CONFLICT DO NOTHING;


-- --------------------------------------------------------
-- 7. TRIGGERS & FUNCTIONS
-- --------------------------------------------------------

-- Trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Student User'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_trips_updated_at ON public.trips;
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
