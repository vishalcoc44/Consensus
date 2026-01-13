import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTeams, Team } from '@/hooks/useTeams';
import { useToast } from '@/components/ui/use-toast';

interface TeamContextType {
	teams: Team[];
	currentTeam: Team | null;
	setCurrentTeam: (team: Team) => void;
	isLoading: boolean;
	isInitializing: boolean;
	refreshTeams: () => Promise<void>;
	createTeam: (name: string, description: string) => Promise<any>;
	addTeamMember: (teamId: string, userId: string, role: string) => Promise<boolean>;
	removeTeamMember: (teamId: string, userId: string) => Promise<boolean>;
	updateTeam: (teamId: string, updates: any) => Promise<boolean>;
	leaveTeam: (teamId: string) => Promise<boolean>;
	acceptInvite: (invite: any) => Promise<boolean>;
	declineInvite: (inviteId: string) => Promise<boolean>;
	myInvites: any[];
	error: string | null;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider = ({ children }: { children: React.ReactNode }) => {
	const {
		teams,
		loading: teamsLoading,
		error,
		refreshTeams,
		createTeam,
		addTeamMember,
		removeTeamMember,
		updateTeam,
		leaveTeam,
		acceptInvite,
		declineInvite,

		myInvites,
		fetchTeamMembers,
		cacheTeamMembers
	} = useTeams();
	const { toast } = useToast();
	const [currentTeam, setCurrentTeamState] = useState<Team | null>(null);
	const [isInitializing, setIsInitializing] = useState(true);

	// Initialize currentTeam from localStorage or fallback to first team
	useEffect(() => {
		if (teams.length > 0) {
			const storedTeamId = localStorage.getItem('consensus_active_team_id');
			let foundTeam = null;

			if (storedTeamId) {
				foundTeam = teams.find(t => t.id === storedTeamId);
			}

			if (foundTeam) {
				setCurrentTeamState(foundTeam);
			} else {
				// Fallback if no stored ID or ID not found in current list
				// Only set if currentTeam is null, to avoid overriding user selection during live updates
				// unless the currentTeam is no longer in the list (e.g. removed)
				if (!currentTeam) {
					setCurrentTeamState(teams[0]);
				} else {
					// Verify currentTeam still exists
					const exists = teams.find(t => t.id === currentTeam.id);
					if (!exists) {
						setCurrentTeamState(teams[0]);
					} else {
						// Update currentTeam object with fresh data (e.g. member count changes)
						// BUT preserve members if we have them and new one doesn't (though new one shouldn't have them unless we fetched)
						// Actually, we trust 'teams' as source of truth.

						if (JSON.stringify(exists) !== JSON.stringify(currentTeam)) {
							// Check if we already have members loaded in currentTeam but not in exists (the update from useTeams might have reset it if we didn't cache propely, but we are caching in useTeams now)
							// If exists has no members but currentTeam does, we might want to keep members? 
							// Logic: If 'exists' is from useTeams state, and we update useTeams state with cacheTeamMembers, 'exists' SHOULD have members.
							setCurrentTeamState(exists);
						}
					}
				}
			}
		} else {
			// If teams became empty (e.g. left last team), clear current
			if (!teamsLoading) {
				setCurrentTeamState(null);
			}
		}

		// Mark initialization complete once we've processed teams
		if (!teamsLoading) {
			setIsInitializing(false);
		}
	}, [teams, teamsLoading, currentTeam]);

	// Wrapper for setCurrentTeam to persist to localStorage and show toast
	// Also handles lazy loading of members
	const setCurrentTeam = async (team: Team) => {
		const isChangingTeam = currentTeam && currentTeam.id !== team.id;

		// 1. Optimistic update
		setCurrentTeamState(team);
		localStorage.setItem('consensus_active_team_id', team.id);

		if (isChangingTeam) {
			toast({
				title: "Team switched",
				description: `Now viewing ${team.name}`,
			});
		}

		// 2. Lazy load members if needed
		if (!team.members && team.member_count > 0) {
			try {
				const members = await fetchTeamMembers(team.id);
				cacheTeamMembers(team.id, members);
			} catch (err) {
				console.error("Failed to load team members", err);
			}
		}
	};

	return (
		<TeamContext.Provider
			value={{
				teams,
				currentTeam,
				setCurrentTeam,
				isLoading: teamsLoading,
				isInitializing,
				refreshTeams,
				createTeam,
				addTeamMember,
				removeTeamMember,
				updateTeam,
				leaveTeam,
				acceptInvite,
				declineInvite,
				myInvites,
				error
			}}
		>
			{children}
		</TeamContext.Provider>
	);
};

export const useTeam = () => {
	const context = useContext(TeamContext);
	if (context === undefined) {
		throw new Error('useTeam must be used within a TeamProvider');
	}
	return context;
};
