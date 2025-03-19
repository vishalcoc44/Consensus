
-- Enable Row Level Security on profiles table
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own profile
CREATE POLICY IF NOT EXISTS "Users can read own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Create policy for users to insert their own profile
CREATE POLICY IF NOT EXISTS "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create policy for users to delete their own profile
CREATE POLICY IF NOT EXISTS "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);
