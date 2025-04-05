
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

-- Add policies for proposals to ensure they can be accessed properly
CREATE POLICY IF NOT EXISTS "Authenticated users can view all proposals"
ON public.proposals
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Users can create proposals"
ON public.proposals
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Users can manage their own proposals"
ON public.proposals
FOR ALL
USING (created_by = auth.uid());

-- Add policies for proposal_analysis to ensure they can be accessed properly
CREATE POLICY IF NOT EXISTS "Authenticated users can view all proposal analysis"
ON public.proposal_analysis
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Users can create proposal analysis"
ON public.proposal_analysis
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Add policies for proposal_options
CREATE POLICY IF NOT EXISTS "Authenticated users can view all proposal options"
ON public.proposal_options
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Add policies for proposal_criteria
CREATE POLICY IF NOT EXISTS "Authenticated users can view all proposal criteria"
ON public.proposal_criteria
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Add policies for contributions
CREATE POLICY IF NOT EXISTS "Authenticated users can view all contributions"
ON public.contributions
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Users can create their own contributions"
ON public.contributions
FOR INSERT
WITH CHECK (user_id = auth.uid());
