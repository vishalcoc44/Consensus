
import { useState, useEffect, useMemo } from 'react';
import { useTeams } from './useTeams';

export function useTeamsFilter<T extends { team_id?: string | null }>(
  items: T[],
  itemTeamIdFieldName: keyof T = 'team_id' as keyof T
) {
  const { teams, loading: teamsLoading } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string | 'all'>('all');
  
  // Filter items based on selected team
  const filteredItems = useMemo(() => {
    if (selectedTeamId === 'all') {
      return items;
    }
    
    return items.filter(item => {
      const itemTeamId = item[itemTeamIdFieldName as keyof T];
      return itemTeamId === selectedTeamId;
    });
  }, [items, selectedTeamId, itemTeamIdFieldName]);
  
  // Reset selected team if teams list changes
  useEffect(() => {
    if (teams.length > 0 && selectedTeamId !== 'all' && !teams.some(team => team.id === selectedTeamId)) {
      setSelectedTeamId('all');
    }
  }, [teams, selectedTeamId]);
  
  return {
    teams,
    teamsLoading,
    selectedTeamId,
    setSelectedTeamId,
    filteredItems
  };
}
