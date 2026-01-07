
import { useState, useEffect } from 'react';
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
import { Clock, User, MessageSquare, Eye, Calendar, Filter, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
}

const ActivityLog = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    document.title = 'Activity Log - ConsensusAI';
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.log('No session, skipping activity fetch');
        setLoading(false);
        return;
      }

      // Fetch recent proposals (Creation events)
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('proposals')
        .select(`
          id,
          title,
          description,
          created_at,
          created_by
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (proposalsError) throw proposalsError;

      // Fetch recent contributions (Vote/Comment events)
      const { data: contributionsData, error: contributionsError } = await supabase
        .from('contributions')
        .select(`
          id,
          proposal_id,
          user_id,
          comment,
          created_at,
          proposals (
            title
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (contributionsError) throw contributionsError;

      // Fetch user profiles for all involved users
      const userIds = new Set<string>();
      proposalsData?.forEach(p => p.created_by && userIds.add(p.created_by));
      contributionsData?.forEach(c => c.user_id && userIds.add(c.user_id));

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', Array.from(userIds));

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]));

      // Map Proposals to ActivityItems
      const proposalActivities: ActivityItem[] = (proposalsData || []).map(p => {
        const profile = p.created_by ? profilesMap.get(p.created_by) : null;
        return {
          id: `prop-${p.id}`,
          type: 'update', // Using 'update' icon for creation as it's similar
          title: p.title,
          description: `Created new proposal "${p.title}"`,
          timestamp: p.created_at,
          user: {
            name: profile?.full_name || 'Unknown User',
            avatar: profile?.avatar_url || ''
          },
          proposal_id: p.id
        };
      });

      // Map Contributions to ActivityItems
      const contributionActivities: ActivityItem[] = (contributionsData || []).map(c => {
        const profile = c.user_id ? profilesMap.get(c.user_id) : null;
        // @ts-ignore - Supabase types rely on join
        const proposalTitle = c.proposals?.title || 'Unknown Proposal';

        return {
          id: `cont-${c.id}`,
          type: c.comment ? 'comment' : 'contribution',
          title: proposalTitle,
          description: c.comment
            ? `Commented on "${proposalTitle}"`
            : `Contributed to "${proposalTitle}"`,
          timestamp: c.created_at,
          user: {
            name: profile?.full_name || 'Unknown User',
            avatar: profile?.avatar_url || ''
          },
          proposal_id: c.proposal_id
        };
      });

      // Combine and sort
      const allActivities = [...proposalActivities, ...contributionActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 50);

      setActivities(allActivities);
      setLoading(false);

    } catch (err) {
      console.error('Error fetching activity:', err);
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare size={18} className="text-blue-400" />;
      case 'contribution':
        return <User size={18} className="text-emerald-400" />;
      case 'view':
        return <Eye size={18} className="text-purple-400" />;
      case 'update':
        return <Clock size={18} className="text-amber-400" />;
      default:
        return <Clock size={18} className="text-gray-400" />;
    }
  };

  const filteredActivities = activities.filter(activity => {
    // Apply type filter
    if (filterType !== 'all' && activity.type !== filterType) {
      return false;
    }

    // Apply search query
    if (searchQuery && !activity.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !activity.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !activity.user.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const activityDate = new Date(activity.timestamp);
      const now = new Date();

      if (dateFilter === 'today') {
        // Check if the activity happened today
        return activityDate.getDate() === now.getDate() &&
          activityDate.getMonth() === now.getMonth() &&
          activityDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === 'week') {
        // Check if the activity happened within the last 7 days
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return activityDate >= weekAgo;
      } else if (dateFilter === 'month') {
        // Check if the activity happened within the last 30 days
        const monthAgo = new Date(now);
        monthAgo.setDate(now.getDate() - 30);
        return activityDate >= monthAgo;
      }
    }

    return true;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-sf font-bold mb-2">Activity Log</h1>
        <p className="text-consensus-grey-600">Track all activities across your organization's decisions</p>
      </div>

      <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <Tabs defaultValue="all" onValueChange={setFilterType}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="contribution" className="flex-1">Contributions</TabsTrigger>
              <TabsTrigger value="comment" className="flex-1">Comments</TabsTrigger>
              <TabsTrigger value="update" className="flex-1">Updates</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-consensus-grey-500" />
            <Input
              type="text"
              placeholder="Search activities..."
              className="pl-9 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-xl border border-consensus-green/20">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-consensus-green"></div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-consensus-grey-400">
              <p>No activities found matching your filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredActivities.map((activity, index) => (
                <div key={activity.id}
                  className="p-4 hover:bg-white/5 transition-colors flex items-start gap-4 group"
                >
                  <div className="mt-1 p-2 rounded-full bg-consensus-dark-300 border border-white/10 group-hover:border-consensus-green/30 transition-colors">
                    {getActivityIcon(activity.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-6 w-6 ring-2 ring-consensus-dark-300">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="bg-consensus-teal text-consensus-dark-900 font-bold">{getInitials(activity.user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-white">{activity.user.name}</span>
                    </div>

                    <p className="mt-1 text-consensus-grey-300">{activity.description}</p>

                    <div className="mt-2 text-xs text-consensus-grey-500 flex items-center gap-1">
                      <Clock size={10} />
                      {format(new Date(activity.timestamp), 'PPpp')}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-consensus-green/30 text-consensus-green hover:bg-consensus-green hover:text-black transition-colors"
                    onClick={() => window.location.href = `/dashboard/proposals/${activity.proposal_id}`}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </div>
    </DashboardLayout>
  );
};

export default ActivityLog;
