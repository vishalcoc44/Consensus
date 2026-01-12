import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  User, 
  MessageSquare, 
  FileText,
  Vote,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeamsFilter } from '@/hooks/useTeamsFilter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TeamSelector from './TeamSelector';
import { cn } from '@/lib/utils';

type ActivityType = 
  | 'proposal_created'
  | 'proposal_updated'
  | 'proposal_deleted'
  | 'proposal_status_changed'
  | 'contribution_added'
  | 'contribution_updated'
  | 'contribution_deleted'
  | 'vote_changed'
  | 'comment_added'
  | 'team_member_joined'
  | 'team_member_left'
  | 'team_member_role_changed';

interface ActivityItem {
  id: string;
  activity_type: ActivityType;
  title: string;
  description: string | null;
  created_at: string;
  metadata: Record<string, any>;
  team_id?: string;
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealtime, setIsRealtime] = useState(false);
  const { selectedTeamId, setSelectedTeamId, filteredItems: filteredActivities } = useTeamsFilter<ActivityItem>(
    activities,
    'team_id'
  );
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentActivity();
    setupRealtimeSubscription();
    
    return () => {
      supabase.channel('recent-activity').unsubscribe();
    };
  }, []);

  const setupRealtimeSubscription = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Get user's team IDs
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', session.user.id);

    if (!teamMembers?.length) return;

    const teamIds = teamMembers.map(tm => tm.team_id);

    const channel = supabase
      .channel('recent-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log'
        },
        async (payload) => {
          // Check if activity is for one of user's teams
          if (!teamIds.includes(payload.new.team_id)) return;

          const { data } = await supabase
            .from('activity_log')
            .select(`
              *,
              user:profiles!activity_log_user_id_fkey (full_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setActivities(prev => [data as ActivityItem, ...prev.slice(0, 4)]);
          }
        }
      )
      .subscribe((status) => {
        setIsRealtime(status === 'SUBSCRIBED');
      });
  };

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // Try new activity_log table first
      let { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          user:profiles!activity_log_user_id_fkey (full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fallback to legacy if table doesn't exist
      if (error?.code === '42P01') {
        await fetchLegacyActivity();
        return;
      }

      if (error) {
        console.error('Error fetching activity:', error);
        await fetchLegacyActivity();
        return;
      }

      if (data) {
        setActivities(data as ActivityItem[]);
      }
    } catch (err) {
      console.error('Error in fetchRecentActivity:', err);
      await fetchLegacyActivity();
    } finally {
      setLoading(false);
    }
  };

  const fetchLegacyActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          id,
          created_at,
          proposal_id,
          user_id,
          comment,
          proposals(title, team_id),
          profiles!contributions_user_id_fkey(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error || !data) {
        console.error('Error fetching legacy activity:', error);
        return;
      }

      const formattedActivities: ActivityItem[] = data.map(item => {
        const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
        const proposal = Array.isArray(item.proposals) ? item.proposals[0] : item.proposals;
        const hasComment = item.comment && item.comment.trim() !== '';

        return {
          id: item.id,
          activity_type: hasComment ? 'comment_added' : 'contribution_added',
          title: hasComment ? 'New comment' : 'New contribution',
          description: `${hasComment ? 'Commented on' : 'Contributed to'}: ${proposal?.title || 'Unknown'}`,
          created_at: item.created_at,
          metadata: { proposal_id: item.proposal_id, proposal_title: proposal?.title },
          team_id: proposal?.team_id,
          user: profile ? {
            full_name: profile.full_name,
            avatar_url: profile.avatar_url
          } : undefined
        };
      });

      setActivities(formattedActivities);
    } catch (err) {
      console.error('Error fetching legacy activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case 'proposal_created':
        return <FileText className={cn(iconClass, "text-emerald-500")} />;
      case 'proposal_updated':
      case 'contribution_updated':
        return <Edit className={cn(iconClass, "text-blue-500")} />;
      case 'proposal_deleted':
      case 'contribution_deleted':
        return <Trash2 className={cn(iconClass, "text-red-500")} />;
      case 'proposal_status_changed':
        return <CheckCircle2 className={cn(iconClass, "text-amber-500")} />;
      case 'contribution_added':
        return <User className={cn(iconClass, "text-indigo-500")} />;
      case 'vote_changed':
        return <Vote className={cn(iconClass, "text-purple-500")} />;
      case 'comment_added':
        return <MessageSquare className={cn(iconClass, "text-cyan-500")} />;
      case 'team_member_joined':
        return <UserPlus className={cn(iconClass, "text-green-500")} />;
      default:
        return <Clock className={cn(iconClass, "text-gray-500")} />;
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleViewProposal = (activity: ActivityItem) => {
    const proposalId = activity.metadata?.proposal_id;
    if (proposalId) {
      navigate(`/dashboard/proposals/${proposalId}`);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
          {isRealtime && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
              <Zap className="h-3 w-3 mr-1" />
              Live
            </Badge>
          )}
        </div>
        <TeamSelector
          selectedTeamId={selectedTeamId}
          onTeamChange={setSelectedTeamId}
          className="w-[140px]"
        />
      </CardHeader>
      <CardContent className="space-y-3">
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
          <div className="text-center text-muted-foreground py-6">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {activities.length === 0 
                ? 'No recent activity' 
                : 'No activity for selected team'}
            </p>
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div 
              key={activity.id} 
              className="flex items-start space-x-3 py-2 group hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
              onClick={() => handleViewProposal(activity)}
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-muted/50">
                {getActivityIcon(activity.activity_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={activity.user?.avatar_url || ''} />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {getInitials(activity.user?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">
                    {activity.user?.full_name || 'Unknown'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {activity.description || activity.title}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewProposal(activity);
                }}
              >
                View
              </Button>
            </div>
          ))
        )}

        {activities.length > 0 && (
          <Button
            variant="link"
            className="w-full mt-2 text-sm"
            onClick={() => navigate('/dashboard/activity')}
          >
            View all activity →
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
