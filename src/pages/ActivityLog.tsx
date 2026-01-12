import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  User,
  MessageSquare,
  FileText,
  Calendar,
  Search,
  RefreshCw,
  Vote,
  UserPlus,
  UserMinus,
  Shield,
  Trash2,
  Edit,
  CheckCircle2,
  Circle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTeam } from '@/contexts/TeamContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import ShimmerText from '@/components/ui/effects/ShimmerText';

// Activity types that match our database enum
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
  team_id: string;
  user_id: string | null;
  activity_type: ActivityType;
  entity_type: string;
  entity_id: string;
  title: string;
  description: string | null;
  metadata: Record<string, any>;
  created_at: string;
  // Joined data
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Filter categories for the tabs
type FilterCategory = 'all' | 'proposals' | 'contributions' | 'team';

const ACTIVITY_TYPE_CATEGORIES: Record<ActivityType, FilterCategory> = {
  proposal_created: 'proposals',
  proposal_updated: 'proposals',
  proposal_deleted: 'proposals',
  proposal_status_changed: 'proposals',
  contribution_added: 'contributions',
  contribution_updated: 'contributions',
  contribution_deleted: 'contributions',
  vote_changed: 'contributions',
  comment_added: 'contributions',
  team_member_joined: 'team',
  team_member_left: 'team',
  team_member_role_changed: 'team',
};

const ActivityLog = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  const { currentTeam } = useTeam();
  const { toast } = useToast();

  useEffect(() => {
    document.title = 'Activity Log - ConsensusAI';
  }, []);

  useEffect(() => {
    if (currentTeam) {
      setPage(0);
      setActivities([]);
      fetchActivity(true);
      subscribeToRealtime();
    } else {
      setActivities([]);
      setLoading(false);
    }

    return () => {
      supabase.channel('activity-changes').unsubscribe();
    };
  }, [currentTeam]);

  const subscribeToRealtime = () => {
    if (!currentTeam) return;

    const channel = supabase
      .channel('activity-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
          filter: `team_id=eq.${currentTeam.id}`
        },
        async (payload) => {
          // Fetch the new activity with user info
          const { data } = await supabase
            .from('activity_log')
            .select(`
              *,
              user:profiles!activity_log_user_id_fkey (full_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setActivities(prev => [data as ActivityItem, ...prev]);
            toast({
              title: 'New Activity',
              description: data.title,
              duration: 3000,
            });
          }
        }
      )
      .subscribe();
  };

  const fetchActivity = async (reset = false) => {
    if (!currentTeam) return;

    try {
      if (reset) {
        setLoading(true);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const currentPage = reset ? 0 : page;

      // First try the new activity_log table
      let { data: activityData, error: activityError } = await supabase
        .from('activity_log')
        .select(`
          *,
          user:profiles!activity_log_user_id_fkey (full_name, avatar_url)
        `)
        .eq('team_id', currentTeam.id)
        .order('created_at', { ascending: false })
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

      // If the activity_log table doesn't exist yet, fall back to legacy data
      if (activityError?.code === '42P01') {
        console.log('activity_log table not found, using legacy data...');
        await fetchLegacyActivity(reset);
        return;
      }

      if (activityError) {
        console.error('Error fetching activity:', activityError);
        // Fall back to legacy
        await fetchLegacyActivity(reset);
        return;
      }

      if (activityData) {
        if (reset) {
          setActivities(activityData as ActivityItem[]);
        } else {
          setActivities(prev => [...prev, ...(activityData as ActivityItem[])]);
        }
        setHasMore(activityData.length === PAGE_SIZE);
        if (!reset) setPage(currentPage + 1);
      }

    } catch (err) {
      console.error('Error fetching activity:', err);
      await fetchLegacyActivity(reset);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fallback to legacy data fetching (before activity_log table exists)
  const fetchLegacyActivity = async (reset = false) => {
    if (!currentTeam) return;

    try {
      // Fetch proposals
      const { data: proposalsData } = await supabase
        .from('proposals')
        .select(`
          id, title, description, created_at, created_by, status,
          creator:profiles!proposals_created_by_fkey (full_name, avatar_url)
        `)
        .eq('team_id', currentTeam.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch contributions
      const { data: contributionsData } = await supabase
        .from('contributions')
        .select(`
          id, proposal_id, user_id, comment, created_at,
          proposals!inner (title, team_id),
          user:profiles!contributions_user_id_fkey (full_name, avatar_url)
        `)
        .eq('proposals.team_id', currentTeam.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Convert to ActivityItem format
      const proposalActivities: ActivityItem[] = (proposalsData || []).map(p => ({
        id: `prop-${p.id}`,
        team_id: currentTeam.id,
        user_id: p.created_by,
        activity_type: 'proposal_created' as ActivityType,
        entity_type: 'proposal',
        entity_id: p.id,
        title: 'New proposal created',
        description: `Created proposal: ${p.title}`,
        metadata: { proposal_title: p.title, proposal_id: p.id },
        created_at: p.created_at,
        user: p.creator as any
      }));

      const contributionActivities: ActivityItem[] = (contributionsData || []).map(c => {
        const hasComment = c.comment && c.comment.trim() !== '';
        return {
          id: `cont-${c.id}`,
          team_id: currentTeam.id,
          user_id: c.user_id,
          activity_type: hasComment ? 'comment_added' as ActivityType : 'contribution_added' as ActivityType,
          entity_type: 'contribution',
          entity_id: c.id,
          title: hasComment ? 'New comment added' : 'New contribution',
          description: `${hasComment ? 'Commented on' : 'Contributed to'}: ${(c.proposals as any)?.title}`,
          metadata: { proposal_title: (c.proposals as any)?.title, proposal_id: c.proposal_id },
          created_at: c.created_at,
          user: c.user as any
        };
      });

      const allActivities = [...proposalActivities, ...contributionActivities]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 50);

      setActivities(allActivities);
      setHasMore(false);
    } catch (err) {
      console.error('Error fetching legacy activity:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(0);
    fetchActivity(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchActivity(false);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'proposal_created':
        return <FileText className={cn(iconClass, "text-emerald-500")} />;
      case 'proposal_updated':
        return <Edit className={cn(iconClass, "text-blue-500")} />;
      case 'proposal_deleted':
        return <Trash2 className={cn(iconClass, "text-red-500")} />;
      case 'proposal_status_changed':
        return <CheckCircle2 className={cn(iconClass, "text-amber-500")} />;
      case 'contribution_added':
        return <User className={cn(iconClass, "text-indigo-500")} />;
      case 'contribution_updated':
        return <Edit className={cn(iconClass, "text-blue-500")} />;
      case 'contribution_deleted':
        return <Trash2 className={cn(iconClass, "text-red-500")} />;
      case 'vote_changed':
        return <Vote className={cn(iconClass, "text-purple-500")} />;
      case 'comment_added':
        return <MessageSquare className={cn(iconClass, "text-cyan-500")} />;
      case 'team_member_joined':
        return <UserPlus className={cn(iconClass, "text-green-500")} />;
      case 'team_member_left':
        return <UserMinus className={cn(iconClass, "text-orange-500")} />;
      case 'team_member_role_changed':
        return <Shield className={cn(iconClass, "text-violet-500")} />;
      default:
        return <Circle className={cn(iconClass, "text-gray-500")} />;
    }
  };

  const getActivityBadgeColor = (type: ActivityType): string => {
    if (type.includes('deleted')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (type.includes('created') || type.includes('added') || type.includes('joined'))
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (type.includes('updated') || type.includes('changed'))
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    if (type.includes('left'))
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  const formatActivityType = (type: ActivityType): string => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredActivities = activities.filter(activity => {
    // Apply category filter
    if (filterCategory !== 'all') {
      const category = ACTIVITY_TYPE_CATEGORIES[activity.activity_type];
      if (category !== filterCategory) return false;
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = activity.title.toLowerCase().includes(query);
      const matchesDescription = activity.description?.toLowerCase().includes(query);
      const matchesUser = activity.user?.full_name?.toLowerCase().includes(query);
      const matchesMetadata = JSON.stringify(activity.metadata).toLowerCase().includes(query);

      if (!matchesTitle && !matchesDescription && !matchesUser && !matchesMetadata) {
        return false;
      }
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const activityDate = new Date(activity.created_at);
      const now = new Date();

      if (dateFilter === 'today') {
        return activityDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return activityDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setDate(now.getDate() - 30);
        return activityDate >= monthAgo;
      }
    }

    return true;
  });

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleActivityClick = (activity: ActivityItem) => {
    const proposalId = activity.metadata?.proposal_id ||
      (activity.entity_type === 'proposal' ? activity.entity_id : null);

    if (proposalId) {
      window.location.href = `/dashboard/proposals/${proposalId}`;
    }
  };

  // Group activities by date for timeline view
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, ActivityItem[]>);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-sf font-bold mb-2 flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary" />
            <ShimmerText className="inline-block">Activity Log</ShimmerText>
          </h1>
          <p className="text-muted-foreground">
            Track all activities across your organization's decisions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="rounded-xl"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>


      {/* Filters */}
      <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <Tabs defaultValue="all" onValueChange={(v) => setFilterCategory(v as FilterCategory)}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="proposals" className="flex-1">Proposals</TabsTrigger>
              <TabsTrigger value="contributions" className="flex-1">Contributions</TabsTrigger>
              <TabsTrigger value="team" className="flex-1">Team</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              type="text"
              placeholder="Search activities..."
              className="pl-10 pr-4 h-10 rounded-xl bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 focus-visible:border-primary/50 transition-all duration-300 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[160px] h-10 rounded-xl bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="relative">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No activities found</p>
              <p className="text-sm mt-1">
                {searchQuery || filterCategory !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Activities will appear here as your team works'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([date, dayActivities]) => (
              <div key={date} className="relative">
                {/* Date header */}
                <div className="sticky top-0 z-10 mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium backdrop-blur-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(date).toDateString() === new Date().toDateString()
                      ? 'Today'
                      : format(new Date(date), 'EEEE, MMMM d')}
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative pl-8 border-l-2 border-border/50 space-y-4 ml-4">
                  {dayActivities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="relative group cursor-pointer"
                      onClick={() => handleActivityClick(activity)}
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[25px] top-3 w-4 h-4 rounded-full bg-background border-2 border-primary/50 group-hover:border-primary group-hover:scale-125 transition-all duration-200 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                      </div>

                      {/* Activity card */}
                      <Card className="p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 bg-card/50 backdrop-blur-sm">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border/50 group-hover:border-primary/30 transition-colors">
                            {getActivityIcon(activity.activity_type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="h-6 w-6 ring-1 ring-primary/10">
                                <AvatarImage src={activity.user?.avatar_url || ''} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                  {getInitials(activity.user?.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm truncate">
                                {activity.user?.full_name || 'Unknown User'}
                              </span>
                              <Badge
                                variant="secondary"
                                className={cn("text-xs font-normal", getActivityBadgeColor(activity.activity_type))}
                              >
                                {formatActivityType(activity.activity_type)}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {activity.description || activity.title}
                            </p>

                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/70">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                              </span>
                              {activity.metadata?.proposal_title && (
                                <span className="truncate max-w-[200px]">
                                  on "{activity.metadata.proposal_title}"
                                </span>
                              )}
                            </div>
                          </div>

                          {/* View button */}
                          {activity.metadata?.proposal_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loading}
                  className="rounded-xl"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Activity count */}
      {
        filteredActivities.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Showing {filteredActivities.length} activities
          </div>
        )
      }
    </div >
  );
};

export default ActivityLog;
