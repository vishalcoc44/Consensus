
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
import { typedSupabase } from '@/utils/supabaseClient';
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
      
      // Mock data for now - in a real app this would be fetched from the database
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'contribution',
          title: 'Office Location Decision',
          description: 'Added new contribution to "Office Location Decision"',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user: {
            name: 'Emma Thompson',
            avatar: 'https://i.pravatar.cc/150?img=1'
          },
          proposal_id: '123'
        },
        {
          id: '2',
          type: 'comment',
          title: 'Budget Allocation',
          description: 'Commented on "Budget Allocation"',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          user: {
            name: 'Marcus Chen',
            avatar: 'https://i.pravatar.cc/150?img=2'
          },
          proposal_id: '456'
        },
        {
          id: '3',
          type: 'view',
          title: 'Product Roadmap Priorities',
          description: 'Viewed "Product Roadmap Priorities"',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          user: {
            name: 'Sophia Garcia',
            avatar: 'https://i.pravatar.cc/150?img=3'
          },
          proposal_id: '789'
        },
        {
          id: '4',
          type: 'update',
          title: 'Marketing Strategy',
          description: 'Updated "Marketing Strategy" decision',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          user: {
            name: 'Alexander Kim',
            avatar: 'https://i.pravatar.cc/150?img=4'
          },
          proposal_id: '101'
        },
        {
          id: '5',
          type: 'contribution',
          title: 'Hiring Plan',
          description: 'Added new contribution to "Hiring Plan"',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
          user: {
            name: 'Olivia Johnson',
            avatar: 'https://i.pravatar.cc/150?img=5'
          },
          proposal_id: '202'
        }
      ];
      
      // Add a random delay to simulate network request
      setTimeout(() => {
        setActivities(mockActivities);
        setLoading(false);
      }, 800);
      
    } catch (err) {
      console.error('Error fetching activity:', err);
      setLoading(false);
    }
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="text-blue-500" />;
      case 'contribution':
        return <User className="text-emerald-500" />;
      case 'view':
        return <Eye className="text-purple-500" />;
      case 'update':
        return <Clock className="text-amber-500" />;
      default:
        return <Clock className="text-gray-500" />;
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
      
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-consensus-green"></div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-consensus-grey-500">
              <p>No activities found matching your filters.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredActivities.map((activity, index) => (
                <div key={activity.id} 
                  className="p-4 hover:bg-consensus-grey-50 transition-colors flex items-start gap-4"
                >
                  <div className="mt-1 p-2 rounded-full bg-consensus-grey-100">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback>{getInitials(activity.user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{activity.user.name}</span>
                    </div>
                    
                    <p className="mt-1">{activity.description}</p>
                    
                    <div className="mt-2 text-xs text-consensus-grey-500">
                      {format(new Date(activity.timestamp), 'PPpp')}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = `/dashboard/proposals/${activity.proposal_id}`}
                  >
                    View decision
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ActivityLog;
