-- Permanent Fix for Teams Update RLS Policy
-- This uses the teams.created_by column as a fallback, which is always reliable.

-- Drop all existing UPDATE policies on teams to start fresh
DROP POLICY IF EXISTS "Team admins can update their team" ON public.teams;
DROP POLICY IF EXISTS "Team creator can update" ON public.teams;
DROP POLICY IF EXISTS "update_team_policy" ON public.teams;

-- Create a robust update policy that checks:
-- 1. If the user is the original creator of the team (always works)
-- 2. OR if the user is an admin/owner in team_members (role check)
CREATE POLICY "Team creator or admin can update their team" 
ON public.teams FOR UPDATE
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_members.team_id = id 
    AND team_members.user_id = auth.uid()
    AND team_members.role::text IN ('admin', 'owner')
  )
);

-- This policy will now work automatically for any team creator without needing team_members checks first.
