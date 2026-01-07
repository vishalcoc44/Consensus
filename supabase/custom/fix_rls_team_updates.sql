
-- Fix RLS for team updates to strict Admins/Owners only

-- Enable RLS just in case
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- DROP existing update policies
DROP POLICY IF EXISTS "Team creator or admin can update their team" ON public.teams;
DROP POLICY IF EXISTS "Team admins can update their team" ON public.teams;
DROP POLICY IF EXISTS "Team creator can update" ON public.teams;
DROP POLICY IF EXISTS "update_team_policy" ON public.teams;

-- CREATE Strict Update Policy
CREATE POLICY "Team admins/owners can update their team" ON public.teams
FOR UPDATE
USING (
  -- User must be the creator (owner fallback)
  created_by = auth.uid()
  OR
  -- User must be explicitly listed as admin or owner in team_members
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id = id
    AND team_members.user_id = auth.uid()
    AND team_members.role IN ('admin', 'owner')
  )
);
