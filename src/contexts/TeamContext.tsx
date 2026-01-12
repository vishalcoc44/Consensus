import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTeams, Team } from '@/hooks/useTeams';

interface TeamContextType {
	teams: Team[];
	currentTeam: Team | null;
	setCurrentTeam: (team: Team) => void;
	isLoading: boolean;
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
		myInvites
	} = useTeams();
	const [currentTeam, setCurrentTeamState] = useState<Team | null>(null);

	// Initialize currentTeam from localStorage or fallback to first team
	useEffect(() => {
		if (teams.length > 0) {
			const storedTeamId = localStorage.getItem('consensus_active_team_id');

			if (storedTeamId) {
				const found = teams.find(t => t.id === storedTeamId);
				if (found) {
					setCurrentTeamState(found);
					return;
				}
			}

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
					if (JSON.stringify(exists) !== JSON.stringify(currentTeam)) {
						setCurrentTeamState(exists);
					}
				}
			}
		} else {
			// If teams became empty (e.g. left last team), clear current
			if (!teamsLoading) {
				setCurrentTeamState(null);
			}
		}
	}, [teams, teamsLoading, currentTeam]);

	// Wrapper for setCurrentTeam to persist to localStorage
	const setCurrentTeam = (team: Team) => {
		setCurrentTeamState(team);
		localStorage.setItem('consensus_active_team_id', team.id);
	};

	return (
		<TeamContext.Provider
			value={{
				teams,
				currentTeam,
				setCurrentTeam,
				isLoading: teamsLoading,
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
