
-- Fix RLS for team_invites table to allow proper invitations

-- Enable RLS just in case
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- DROP existing policies to avoid conflicts
DROP POLICY IF EXISTS "Team admins can create invites" ON public.team_invites;
DROP POLICY IF EXISTS "Team members can view invites" ON public.team_invites;
DROP POLICY IF EXISTS "Team admins can delete invites" ON public.team_invites;
DROP POLICY IF EXISTS "Team admins can update invites" ON public.team_invites;

-- INSERT Policy: Admins/Owners and Team Creators
CREATE POLICY "Team admins can create invites" ON public.team_invites
FOR INSERT
WITH CHECK (
  -- User must be an admin/owner of the team
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id = team_invites.team_id
    AND team_members.user_id = auth.uid()
    AND team_members.role IN ('admin', 'owner')
  )
  OR
  -- OR user must be the creator of the team (fallback)
  EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_invites.team_id
      AND teams.created_by = auth.uid()
  )
);

-- SELECT Policy: Team members and the invitee
CREATE POLICY "Team members can view invites" ON public.team_invites
FOR SELECT
USING (
  -- Team members can see invites for their team
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id = team_invites.team_id
    AND team_members.user_id = auth.uid()
  )
  OR
  -- The invited user can see their own invite (using JWT email)
  email = (auth.jwt() ->> 'email')
  OR
  -- Allow creators to see invites even if not in team_members yet (edge case)
  EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_invites.team_id
      AND teams.created_by = auth.uid()
  )
);

-- DELETE Policy: Admins/Owners and Team Creators
CREATE POLICY "Team admins can delete invites" ON public.team_invites
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id = team_invites.team_id
    AND team_members.user_id = auth.uid()
    AND team_members.role IN ('admin', 'owner')
  )
  OR
  EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_invites.team_id
      AND teams.created_by = auth.uid()
  )
);

-- UPDATE Policy: Admins/Owners and Team Creators (e.g. to resend or change role)
CREATE POLICY "Team admins can update invites" ON public.team_invites
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id = team_invites.team_id
    AND team_members.user_id = auth.uid()
    AND team_members.role IN ('admin', 'owner')
  )
  OR
  EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_invites.team_id
      AND teams.created_by = auth.uid()
  )
);
