
-- Enable Row Level Security on teams
ALTER TABLE IF EXISTS public.teams ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all teams they are members of
CREATE POLICY IF NOT EXISTS "Users can view their teams" 
  ON public.teams 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = id AND user_id = auth.uid()
    )
  );

-- Policy: Team creators can manage their teams
CREATE POLICY IF NOT EXISTS "Team creators can manage their teams" 
  ON public.teams 
  FOR ALL 
  USING (created_by = auth.uid());

-- Enable Row Level Security on team_members
ALTER TABLE IF EXISTS public.team_members ENABLE ROW LEVEL SECURITY;

-- Policy: Team admins can manage team members
CREATE POLICY IF NOT EXISTS "Team admins can manage team members" 
  ON public.team_members 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = team_members.team_id 
      AND user_id = auth.uid() 
      AND LOWER(role) = 'admin'
    )
  );

-- Policy: Users can view members of their teams
CREATE POLICY IF NOT EXISTS "Users can view members of their teams" 
  ON public.team_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = team_members.team_id 
      AND user_id = auth.uid()
    )
  );

-- Add a function to check if a user is a team admin (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.is_team_admin(team_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = $1 AND user_id = auth.uid() AND LOWER(role) = 'admin'
  );
$$;
