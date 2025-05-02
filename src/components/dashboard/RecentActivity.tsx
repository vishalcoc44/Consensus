
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User, MessageSquare, Eye, Filter } from 'lucide-react';
import { typedSupabase } from '@/utils/supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { extractProfileData } from '@/utils/supabaseClient';
import { useTeamsFilter } from '@/hooks/useTeamsFilter';
import TeamSelector from './TeamSelector';

interface ActivityItem {
  id: string;
  type: 'comment' | 'contribution' | 'view' | 'update';
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar?: string;
  };
  proposal_id: string;
  team_id?: string;
}

const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedTeamId, setSelectedTeamId, filteredItems: filteredActivities } = useTeamsFilter<ActivityItem>(
    activities,
    'team_id'
  );
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchRecentActivity();
  }, []);
  
  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      
      // Get the current user's session
      const { data: { session } } = await typedSupabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }
      
      // This is a simulated activity feed - in a real app, you'd fetch from a dedicated activity table
      // Fetching contributions as an example activity source
      const { data, error } = await typedSupabase
        .from('contributions')
        .select(`
          id,
          created_at,
          proposal_id,
          user_id,
          proposals(title, team_id),
          profiles!contributions_user_id_fkey(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error('Error fetching recent activity:', error);
        setLoading(false);
        return;
      }
      
      if (data) {
        const formattedActivities: ActivityItem[] = data.map(item => {
          // Safely extract profile data to handle the possible error case
          const profileData = extractProfileData(item.profiles);
          const userName = profileData?.full_name || 'Anonymous User';
          const avatarUrl = profileData?.avatar_url || undefined;
          
          const proposalTitle = item.proposals?.title || 'Unknown Proposal';
          const teamId = item.proposals?.team_id || undefined;
          
          return {
            id: item.id,
            type: 'contribution',
            title: proposalTitle,
            description: `New contribution added to "${proposalTitle}"`,
            timestamp: item.created_at,
            user: {
              name: userName,
              avatar: avatarUrl
            },
            proposal_id: item.proposal_id,
            team_id: teamId
          };
        });
        
        setActivities(formattedActivities);
      }
    } catch (err) {
      console.error('Error in fetchRecentActivity:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare size={16} className="text-blue-500" />;
      case 'contribution':
        return <User size={16} className="text-emerald-500" />;
      case 'view':
        return <Eye size={16} className="text-purple-500" />;
      case 'update':
        return <Clock size={16} className="text-amber-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };
  
  const handleViewProposal = (proposalId: string) => {
    navigate(`/dashboard/proposals/${proposalId}`);
  };
  
  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
        <TeamSelector 
          selectedTeamId={selectedTeamId}
          onTeamChange={setSelectedTeamId}
          className="w-[140px]"
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="flex items-start space-x-3 py-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : filteredActivities.length === 0 ? (
          <div className="text-center text-consensus-grey-500 py-4">
            {activities.length === 0 ? 
              <p>No recent activity found.</p> : 
              <p>No activity found for the selected team.</p>
            }
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div key={activity.id} className="flex items-start space-x-3 py-2 group hover:bg-gray-50 rounded-md px-2 transition-colors">
              <div className="mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {activity.user.name} <span className="font-normal text-consensus-grey-600">on</span> {activity.title}
                </p>
                <p className="text-xs text-consensus-grey-500 mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleViewProposal(activity.proposal_id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                View
              </Button>
            </div>
          ))
        )}
        
        {activities.length > 0 && (
          <Button 
            variant="link" 
            className="w-full mt-2" 
            onClick={() => navigate('/dashboard/activity')}
          >
            View all activity
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
