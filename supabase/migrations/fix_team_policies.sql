
-- Drop existing problematic policies for team_members
DROP POLICY IF EXISTS "Team members can view their teams" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view teammates" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can manage team members" ON public.team_members;

-- Create a security definer function to check if a user is a team admin
CREATE OR REPLACE FUNCTION public.is_team_admin(team_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = $1 AND user_id = auth.uid() AND role = 'Admin'
  );
$$;

-- Enable RLS on teams and team_members tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create safer RLS policies for team_members table
-- Anyone can view team members of teams they belong to
CREATE POLICY "Users can view members of their teams"
ON public.team_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = team_members.team_id AND user_id = auth.uid()
  )
);

-- Team admins can insert members
CREATE POLICY "Team admins can insert members"
ON public.team_members
FOR INSERT
WITH CHECK (
  public.is_team_admin(team_id)
);

-- Team admins can update team members
CREATE POLICY "Team admins can update members"
ON public.team_members
FOR UPDATE
USING (
  public.is_team_admin(team_id)
);

-- Team admins can delete team members
CREATE POLICY "Team admins can delete members"
ON public.team_members
FOR DELETE
USING (
  public.is_team_admin(team_id)
);

-- Create RLS policies for teams table
-- Users can see teams they are members of
CREATE POLICY "Users can view their teams"
ON public.teams
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = teams.id AND user_id = auth.uid()
  )
);

-- Users can create teams (they'll become admins automatically)
CREATE POLICY "Users can create teams"
ON public.teams
FOR INSERT
WITH CHECK (true);

-- Only team admins can update team details
CREATE POLICY "Team admins can update teams"
ON public.teams
FOR UPDATE
USING (
  public.is_team_admin(id)
);

-- Only team admins can delete teams
CREATE POLICY "Team admins can delete teams"
ON public.teams
FOR DELETE
USING (
  public.is_team_admin(id)
);
