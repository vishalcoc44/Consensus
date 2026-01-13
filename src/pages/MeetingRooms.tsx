import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  Video,
  Plus,
  Users,
  Clock,
  Calendar,
  Copy,
  Trash2,
  Play,
  Radio,
  Hash,
  Search,
  Filter,
  Edit,
  Link2,
  ExternalLink,
  MoreVertical,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTeam } from '@/contexts/TeamContext';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { fetchMeetings, createMeeting, deleteMeeting, updateMeeting, startMeeting, endMeeting, getActiveParticipantsCount } from '@/services/meetingsService';
import { supabase } from '@/integrations/supabase/client';
import type { MeetingRoom } from '@/types/phase3';
import { formatDistanceToNow, format, isAfter, isBefore, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import ShimmerText from '@/components/ui/effects/ShimmerText';
import { TeamSelector } from '@/components/teams/TeamSelector';

interface Proposal {
  id: string;
  title: string;
}

const MeetingRooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { currentTeam, isInitializing } = useTeam();
  const { user } = useUser();
  const { toast } = useToast();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'live' | 'ended'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'upcoming'>('upcoming');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_start: '',
    proposal_id: '',
    max_participants: 50,
    meeting_link: '',
  });

  useEffect(() => {
    if (!currentTeam) {
      setLoading(false);
      return;
    }
    loadRooms();
    loadProposals();
  }, [currentTeam]);

  const loadRooms = async () => {
    if (!currentTeam) return;

    try {
      const data = await fetchMeetings(currentTeam.id);
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load meeting rooms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProposals = async () => {
    if (!currentTeam) return;

    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('id, title')
        .eq('team_id', currentTeam.id)
        .in('status', ['active', 'draft'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (error) {
      console.error('Failed to load proposals:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      scheduled_start: '',
      proposal_id: '',
      max_participants: 50,
      meeting_link: '',
    });
  };

  const handleCreateRoom = async () => {
    if (!currentTeam || !user || !formData.title.trim()) return;

    setCreating(true);
    try {
      const room = await createMeeting({
        team_id: currentTeam.id,
        proposal_id: formData.proposal_id && formData.proposal_id !== 'none' ? formData.proposal_id : null,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: 'scheduled',
        scheduled_start: formData.scheduled_start ? new Date(formData.scheduled_start).toISOString() : new Date().toISOString(),
        scheduled_end: null,
        host_id: user.id,
        max_participants: formData.max_participants,
        meeting_link: formData.meeting_link.trim() || null,
      });

      setRooms([room, ...rooms]);
      setShowCreateModal(false);
      resetForm();
      toast({ title: 'Meeting room created', description: 'You can now share the link with participants.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create room',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEditRoom = async () => {
    if (!selectedRoom || !formData.title.trim()) return;

    setUpdating(true);
    try {
      const updated = await updateMeeting(selectedRoom.id, {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        scheduled_start: formData.scheduled_start ? new Date(formData.scheduled_start).toISOString() : selectedRoom.scheduled_start,
        proposal_id: formData.proposal_id && formData.proposal_id !== 'none' ? formData.proposal_id : null,
        max_participants: formData.max_participants,
        meeting_link: formData.meeting_link.trim() || null,
      });

      setRooms(rooms.map(r => r.id === updated.id ? updated : r));
      setShowEditModal(false);
      setSelectedRoom(null);
      resetForm();
      toast({ title: 'Meeting updated' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update meeting',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;

    try {
      await deleteMeeting(selectedRoom.id);
      setRooms(rooms.filter(r => r.id !== selectedRoom.id));
      setShowDeleteDialog(false);
      setSelectedRoom(null);
      toast({ title: 'Room deleted' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete room',
        variant: 'destructive',
      });
    }
  };

  const handleStartMeeting = async (room: MeetingRoom) => {
    try {
      const updated = await startMeeting(room.id);
      setRooms(rooms.map(r => r.id === updated.id ? updated : r));
      toast({ title: 'Meeting started!', description: 'The meeting is now live.' });
      navigate(`/meeting/${room.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start meeting',
        variant: 'destructive',
      });
    }
  };

  const handleEndMeeting = async (room: MeetingRoom) => {
    try {
      const updated = await endMeeting(room.id);
      setRooms(rooms.map(r => r.id === updated.id ? updated : r));
      toast({
        title: 'Meeting ended',
        description: 'The meeting has been ended successfully.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end meeting',
        variant: 'destructive',
      });
    }
  };


  const openEditModal = (room: MeetingRoom) => {
    setSelectedRoom(room);
    setFormData({
      title: room.title,
      description: room.description || '',
      scheduled_start: room.scheduled_start ? new Date(room.scheduled_start).toISOString().slice(0, 16) : '',
      proposal_id: room.proposal_id || '',
      max_participants: room.max_participants,
      meeting_link: room.meeting_link || '',
    });
    setShowEditModal(true);
  };

  const openDeleteDialog = (room: MeetingRoom) => {
    setSelectedRoom(room);
    setShowDeleteDialog(true);
  };

  const copyRoomLink = (id: string) => {
    const url = `${window.location.origin}/meeting/${id}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied to clipboard' });
  };

  const getStatusConfig = (status: MeetingRoom['status']) => {
    switch (status) {
      case 'live':
      case 'active':
        return { label: 'Live', color: 'bg-emerald-500', textColor: 'text-emerald-500', pulse: true };
      case 'scheduled':
        return { label: 'Scheduled', color: 'bg-sky-500', textColor: 'text-sky-500', pulse: false };
      case 'ended':
      case 'completed':
        return { label: 'Ended', color: 'bg-slate-500', textColor: 'text-slate-500', pulse: false };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-red-500', textColor: 'text-red-500', pulse: false };
      default:
        return { label: 'Unknown', color: 'bg-slate-500', textColor: 'text-slate-500', pulse: false };
    }
  };

  const isLive = (status: MeetingRoom['status']) => status === 'live' || status === 'active';
  const isEnded = (status: MeetingRoom['status']) => status === 'ended' || status === 'completed' || status === 'cancelled';
  const isHost = (room: MeetingRoom) => room.host_id === user?.id;

  // Filtered and sorted rooms
  const filteredRooms = useMemo(() => {
    let result = [...rooms];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'live') {
        result = result.filter(r => isLive(r.status));
      } else if (statusFilter === 'ended') {
        result = result.filter(r => isEnded(r.status));
      } else {
        result = result.filter(r => r.status === statusFilter);
      }
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'upcoming') {
        // Live first, then scheduled by date, then ended
        if (isLive(a.status) && !isLive(b.status)) return -1;
        if (!isLive(a.status) && isLive(b.status)) return 1;
        if (a.status === 'scheduled' && b.status !== 'scheduled') return -1;
        if (a.status !== 'scheduled' && b.status === 'scheduled') return 1;
        const aDate = a.scheduled_start ? new Date(a.scheduled_start) : new Date(0);
        const bDate = b.scheduled_start ? new Date(b.scheduled_start) : new Date(0);
        return aDate.getTime() - bDate.getTime();
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [rooms, searchQuery, statusFilter, sortBy]);

  const liveRooms = rooms.filter(r => isLive(r.status));
  const scheduledRooms = rooms.filter(r => r.status === 'scheduled');
  const upcomingToday = rooms.filter(r => {
    if (r.status !== 'scheduled' || !r.scheduled_start) return false;
    const scheduledDate = new Date(r.scheduled_start);
    const today = new Date();
    return scheduledDate.toDateString() === today.toDateString();
  });

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentTeam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="p-6 rounded-full bg-muted mb-6">
          <Video className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No team selected</h3>
        <p className="text-muted-foreground mb-4">Please select a team to view meeting rooms</p>
        <TeamSelector variant="full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25">
              <Video className="h-6 w-6" />
            </div>
            <ShimmerText className="inline-block">Meeting Rooms</ShimmerText>
          </h1>
          <p className="text-muted-foreground">
            Virtual spaces for real-time collaboration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TeamSelector variant="full" />
          <Button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Room
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Rooms', value: rooms.length, icon: Video, gradient: 'from-sky-500 to-blue-600' },
          { label: 'Live Now', value: liveRooms.length, icon: Radio, gradient: 'from-emerald-500 to-teal-600', pulse: liveRooms.length > 0 },
          { label: 'Scheduled', value: scheduledRooms.length, icon: Calendar, gradient: 'from-violet-500 to-purple-600' },
          { label: 'Today', value: upcomingToday.length, icon: Clock, gradient: 'from-amber-500 to-orange-600' },
        ].map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/50 shadow-md hover:shadow-lg transition-all duration-300">
            <div className={cn("absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10 bg-gradient-to-br", stat.gradient)} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={cn("relative p-3 rounded-xl bg-gradient-to-br shadow-lg", stat.gradient)}>
                  <stat.icon className="h-5 w-5 text-white" />
                  {stat.pulse && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex gap-3">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <TabsList className="h-10 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
              <TabsTrigger value="live" className="rounded-lg">
                Live
                {liveRooms.length > 0 && (
                  <Badge className="ml-1.5 h-5 w-5 p-0 justify-center bg-emerald-500">{liveRooms.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="rounded-lg">Scheduled</TabsTrigger>
              <TabsTrigger value="ended" className="rounded-lg">Ended</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-[140px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming first</SelectItem>
              <SelectItem value="newest">Newest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))
        ) : filteredRooms.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 rounded-full bg-gradient-to-br from-sky-500/20 to-blue-500/20 mb-4">
                  <Video className="h-8 w-8 text-sky-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery || statusFilter !== 'all' ? 'No meetings found' : 'No Meeting Rooms'}
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first virtual meeting room for real-time collaboration'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Button onClick={() => setShowCreateModal(true)} className="rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Room
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const statusConfig = getStatusConfig(room.status);
            const live = isLive(room.status);
            const ended = isEnded(room.status);
            const host = isHost(room);
            const linkedProposal = proposals.find(p => p.id === room.proposal_id);

            return (
              <div
                key={room.id}
                className={cn(
                  "group relative overflow-hidden rounded-xl transition-all duration-300",
                  "glass-panel hover:shadow-xl hover:-translate-y-1",
                  live ? "ring-1 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]" : "border-border/50",
                  ended && "opacity-80 grayscale-[0.5] hover:grayscale-0 hover:opacity-100"
                )}
              >
                {/* Status indicator bar (Gradient) */}
                <div className={cn("h-1.5 w-full bg-gradient-to-r",
                  live ? "from-emerald-500 via-teal-400 to-emerald-500 animate-gradient-xy" :
                    ended ? "from-slate-400 to-slate-500" :
                      "from-sky-500 to-blue-600"
                )} />

                {/* Live badge */}
                {live && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-emerald-500/90 text-white border-0 gap-1.5 pl-2 shadow-lg shadow-emerald-500/20 animate-pulse">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                      </span>
                      Live
                    </Badge>
                  </div>
                )}

                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl bg-gradient-to-br shadow-lg transition-transform duration-300 group-hover:scale-105",
                      live ? "from-emerald-500 to-teal-600 shadow-emerald-500/25" :
                        ended ? "from-slate-500 to-gray-600" :
                          "from-sky-500 to-blue-600 shadow-sky-500/25"
                    )}>
                      <Video className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 space-y-1 pr-12">
                      <h3 className="text-lg font-semibold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {room.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono opacity-70">#{room.id.slice(0, 8)}</span>
                        {host && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-primary/10 text-primary border-primary/20">Host</Badge>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-panel border-border/50">
                        <DropdownMenuItem onClick={() => copyRoomLink(room.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy link
                        </DropdownMenuItem>
                        {!ended && (
                          <DropdownMenuItem onClick={() => openEditModal(room)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(room)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {room.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 pl-1">
                      {room.description}
                    </p>
                  )}

                  {/* Meta info grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50">
                      <Users className="h-3.5 w-3.5 text-sky-500" />
                      <span>Max {room.max_participants}</span>
                    </div>
                    {room.scheduled_start && (
                      <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50">
                        <Calendar className="h-3.5 w-3.5 text-violet-500" />
                        <span>{format(new Date(room.scheduled_start), 'MMM d, h:mm a')}</span>
                      </div>
                    )}
                  </div>

                  {/* Linked proposal */}
                  {linkedProposal && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                      <Link2 className="h-3 w-3 text-amber-600" />
                      <span className="truncate">Linked: <span className="font-medium text-amber-700 dark:text-amber-500">{linkedProposal.title}</span></span>
                    </div>
                  )}
                </div>

                <div className="p-4 pt-0 mt-auto flex gap-2">
                  {ended ? (
                    <Button
                      variant="outline"
                      className="flex-1 bg-muted/50 border-border/50 cursor-not-allowed"
                      disabled
                    >
                      Meeting Ended
                    </Button>
                  ) : live ? (
                    <>
                      <Button
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 border-0"
                        onClick={() => {
                          if (room.meeting_link) {
                            window.open(room.meeting_link, '_blank');
                          } else {
                            navigate(`/meeting/${room.id}`);
                          }
                        }}
                      >
                        <Play className="h-4 w-4 mr-2 fill-current" />
                        {room.meeting_link ? 'Join Google Meet' : 'Join Chat'}
                      </Button>
                      {host && (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleEndMeeting(room)}
                          className="shadow-lg shadow-red-500/20"
                          title="End Meeting"
                        >
                          <Square className="h-4 w-4 fill-current" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      {host ? (
                        <Button
                          className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/20 border-0"
                          onClick={() => handleStartMeeting(room)}
                        >
                          <Play className="h-4 w-4 mr-2 fill-current" />
                          Start Meeting
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="flex-1 border-primary/20 hover:bg-primary/5 text-primary hover:text-primary"
                          onClick={() => navigate(`/meeting/${room.id}`)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Enter Room
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyRoomLink(room.id)}
                        className="hover:bg-muted"
                      >
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Room Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Meeting Room</DialogTitle>
            <DialogDescription>
              Set up a new virtual space for your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Room Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Sprint Planning"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What's this meeting about?"
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled">Schedule For</Label>
                <Input
                  id="scheduled"
                  type="datetime-local"
                  value={formData.scheduled_start}
                  onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max">Max Participants</Label>
                <Input
                  id="max"
                  type="number"
                  min={2}
                  max={100}
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 50 })}
                  className="rounded-xl"
                />
              </div>
            </div>

            {proposals.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="proposal">Link to Decision</Label>
                <Select
                  value={formData.proposal_id}
                  onValueChange={(v) => setFormData({ ...formData, proposal_id: v })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select a decision (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {proposals.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="meeting_link">Google Meet Link (Optional)</Label>
              <Input
                id="meeting_link"
                value={formData.meeting_link}
                onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                Create a Google Meet link and paste it here, or leave empty to use chat only
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleCreateRoom}
              disabled={creating || !formData.title.trim()}
              className="rounded-xl"
            >
              {creating ? 'Creating...' : 'Create Room'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Meeting Room</DialogTitle>
            <DialogDescription>
              Update the meeting details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Room Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-scheduled">Schedule For</Label>
                <Input
                  id="edit-scheduled"
                  type="datetime-local"
                  value={formData.scheduled_start}
                  onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-max">Max Participants</Label>
                <Input
                  id="edit-max"
                  type="number"
                  min={2}
                  max={100}
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 50 })}
                  className="rounded-xl"
                />
              </div>
            </div>

            {proposals.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="edit-proposal">Link to Decision</Label>
                <Select
                  value={formData.proposal_id}
                  onValueChange={(v) => setFormData({ ...formData, proposal_id: v })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select a decision (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {proposals.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-meeting_link">Google Meet Link (Optional)</Label>
              <Input
                id="edit-meeting_link"
                value={formData.meeting_link}
                onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                Create a Google Meet link and paste it here, or leave empty to use chat only
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleEditRoom}
              disabled={updating || !formData.title.trim()}
              className="rounded-xl"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting Room?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedRoom?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoom}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MeetingRooms;
