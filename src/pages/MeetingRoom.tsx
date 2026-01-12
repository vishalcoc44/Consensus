import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  Video,
  Users,
  Clock,
  Copy,
  LogOut,
  Square,
  Mic,
  MicOff,
  VideoIcon,
  VideoOff,
  MessageSquare,
  Settings,
  Share2,
  Phone,
  PhoneOff,
  Loader2,
  Crown,
  Circle,
  Send,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import {
  fetchMeetingById,
  startMeeting,
  endMeeting,
  joinMeeting,
  leaveMeeting,
  fetchParticipants,
  subscribeToParticipants,
} from '@/services/meetingsService';
import { supabase } from '@/integrations/supabase/client';
import type { MeetingRoom as MeetingRoomType, MeetingParticipant } from '@/types/phase3';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import ShimmerText from '@/components/ui/effects/ShimmerText';

interface ParticipantWithProfile extends MeetingParticipant {
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface ChatMessage {
  id: string;
  meeting_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const MeetingRoom = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();

  const [meeting, setMeeting] = useState<MeetingRoomType | null>(null);
  const [participants, setParticipants] = useState<ParticipantWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'participants' | 'chat'>('participants');
  const [isJitsiExpanded, setIsJitsiExpanded] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);

  const isHost = meeting?.host_id === user?.id;
  const isLive = meeting?.status === 'live' || meeting?.status === 'active';

  // Generate Jitsi room name from meeting ID
  const jitsiRoomName = meetingId ? `consensus-${meetingId.replace(/-/g, '')}` : '';

  // Load meeting data
  useEffect(() => {
    if (!meetingId) return;
    loadMeeting();
  }, [meetingId]);

  // Subscribe to participant changes
  useEffect(() => {
    if (!meetingId || !hasJoined) return;

    const unsubscribe = subscribeToParticipants(meetingId, async (newParticipants) => {
      const participantsWithProfiles = await loadParticipantProfiles(newParticipants);
      setParticipants(participantsWithProfiles);
    });

    return () => unsubscribe();
  }, [meetingId, hasJoined]);

  // Subscribe to chat messages
  useEffect(() => {
    if (!meetingId || !hasJoined) return;

    // Load existing messages
    loadChatMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`meeting_chat_${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meeting_messages',
          filter: `meeting_id=eq.${meetingId}`,
        },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;
          // Fetch profile for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', newMsg.user_id)
            .single();

          setChatMessages(prev => [...prev, { ...newMsg, profile: profile || undefined }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId, hasJoined]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Timer for live meetings
  useEffect(() => {
    if (!isLive || !meeting?.actual_start) return;

    const startTime = new Date(meeting.actual_start).getTime();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, meeting?.actual_start]);

  const loadMeeting = async () => {
    if (!meetingId) return;

    try {
      const data = await fetchMeetingById(meetingId);
      setMeeting(data);

      const participantData = await fetchParticipants(meetingId);
      const participantsWithProfiles = await loadParticipantProfiles(participantData);
      setParticipants(participantsWithProfiles);

      // Check if current user is already in the meeting
      if (user) {
        const isAlreadyIn = participantData.some(p => p.user_id === user.id && p.is_active);
        setHasJoined(isAlreadyIn);
      }
    } catch (error) {
      console.error('Failed to load meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to load meeting',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadParticipantProfiles = async (participantData: MeetingParticipant[]): Promise<ParticipantWithProfile[]> => {
    const userIds = participantData.map(p => p.user_id);
    if (userIds.length === 0) return [];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    return participantData.map(p => ({
      ...p,
      profile: profiles?.find(profile => profile.id === p.user_id) || undefined,
    }));
  };

  const loadChatMessages = async () => {
    if (!meetingId) return;

    try {
      const { data, error } = await supabase
        .from('meeting_messages')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles for all messages
      const userIds = [...new Set(data?.map(m => m.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const messagesWithProfiles = (data || []).map(msg => ({
        ...msg,
        profile: profiles?.find(p => p.id === msg.user_id) || undefined,
      }));

      setChatMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Failed to load chat messages:', error);
    }
  };

  const handleJoinMeeting = async () => {
    if (!meetingId || !user) return;

    setJoining(true);
    try {
      await joinMeeting(meetingId, user.id);
      setHasJoined(true);
      toast({ title: 'Joined meeting' });

      // Reload participants
      const participantData = await fetchParticipants(meetingId);
      const participantsWithProfiles = await loadParticipantProfiles(participantData);
      setParticipants(participantsWithProfiles);
    } catch (error: any) {
      // Handle duplicate key error (already joined)
      if (error?.code === '23505') {
        setHasJoined(true);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to join meeting',
          variant: 'destructive',
        });
      }
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveMeeting = async () => {
    if (!meetingId || !user) return;

    try {
      await leaveMeeting(meetingId, user.id);
      setHasJoined(false);
      toast({ title: 'Left meeting' });
      navigate('/dashboard/meetings');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to leave meeting',
        variant: 'destructive',
      });
    }
  };

  const handleStartMeeting = async () => {
    if (!meetingId || !isHost) return;

    try {
      const updated = await startMeeting(meetingId);
      setMeeting(updated);
      toast({ title: 'Meeting started', description: 'The meeting is now live!' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start meeting',
        variant: 'destructive',
      });
    }
  };

  const handleEndMeeting = async () => {
    if (!meetingId || !isHost) return;

    try {
      const updated = await endMeeting(meetingId);
      setMeeting(updated);
      toast({ title: 'Meeting ended' });
      navigate('/dashboard/meetings');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end meeting',
        variant: 'destructive',
      });
    }
  };

  const copyMeetingLink = () => {
    const url = `${window.location.origin}/meeting/${meetingId}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied to clipboard' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !meetingId || sendingMessage) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    try {
      const { error } = await supabase
        .from('meeting_messages')
        .insert({
          meeting_id: meetingId,
          user_id: user.id,
          content: messageContent,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setSendingMessage(false);
    }
  };

  const formatElapsedTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activeParticipants = participants.filter(p => p.is_active);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-background animate-fade-in items-center justify-center">
        <div className="p-6 rounded-full bg-destructive/10 mb-6">
          <Video className="h-12 w-12 text-destructive" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Meeting Not Found</h3>
        <p className="text-muted-foreground mb-6">This meeting doesn't exist or has been deleted</p>
        <Button onClick={() => navigate('/dashboard/meetings')}>
          Back to Meeting Rooms
        </Button>
      </div>
    );
  }

  // Pre-join lobby
  if (!hasJoined) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in fade-in duration-500">
        <Card className="overflow-hidden">
          <div className={cn(
            "h-2 w-full",
            isLive ? "bg-gradient-to-r from-emerald-500 to-teal-600" : "bg-gradient-to-r from-sky-500 to-blue-600"
          )} />
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className={cn(
                "p-4 rounded-2xl bg-gradient-to-br shadow-lg",
                isLive ? "from-emerald-500 to-teal-600" : "from-sky-500 to-blue-600"
              )}>
                <Video className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">{meeting.title}</CardTitle>
            {meeting.description && (
              <p className="text-muted-foreground mt-2">{meeting.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{activeParticipants.length} in meeting</span>
              </div>
              {meeting.scheduled_start && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{format(new Date(meeting.scheduled_start), 'MMM d, h:mm a')}</span>
                </div>
              )}
            </div>

            {/* Status badge */}
            <div className="flex justify-center">
              {isLive ? (
                <Badge className="bg-emerald-500 text-white text-sm px-4 py-1.5 gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  Meeting is Live
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-sm px-4 py-1.5">
                  {meeting.status === 'ended' || meeting.status === 'completed' ? 'Meeting Ended' : 'Waiting to Start'}
                </Badge>
              )}
            </div>

            {/* Participants preview */}
            {activeParticipants.length > 0 && (
              <div className="flex justify-center">
                <div className="flex -space-x-3">
                  {activeParticipants.slice(0, 5).map((p, idx) => (
                    <Avatar key={p.id} className="h-10 w-10 border-2 border-background">
                      <AvatarImage src={p.profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white">
                        {p.profile?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {activeParticipants.length > 5 && (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                      +{activeParticipants.length - 5}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Audio info */}
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                <Volume2 className="h-4 w-4" />
                <span>Audio conferencing powered by Jitsi Meet</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your microphone will be muted by default. You can unmute after joining.
              </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className={cn(
                  "w-full rounded-xl text-white",
                  isLive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                )}
                onClick={handleJoinMeeting}
                disabled={joining || meeting.status === 'ended' || meeting.status === 'completed'}
              >
                {joining ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Phone className="h-5 w-5 mr-2" />
                    {isLive ? 'Join Meeting' : 'Enter Waiting Room'}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => navigate('/dashboard/meetings')}
              >
                Back to Meeting Rooms
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // In-meeting view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isLive ? "bg-emerald-500/20" : "bg-sky-500/20"
          )}>
            <Video className={cn("h-4 w-4", isLive ? "text-emerald-400" : "text-sky-400")} />
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm lg:text-base truncate max-w-[200px] lg:max-w-none">
              <ShimmerText className="inline-block">{meeting.title}</ShimmerText>
            </h1>
            <div className="flex items-center gap-3 text-xs text-white/60">
              {isLive && meeting.actual_start && (
                <span className="flex items-center gap-1.5">
                  <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
                  {formatElapsedTime(elapsedTime)}
                </span>
              )}
              <span>{activeParticipants.length} participants</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 hidden sm:flex"
            onClick={copyMeetingLink}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Invite
          </Button>
          {isHost && !isLive && meeting.status === 'scheduled' && (
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={handleStartMeeting}
            >
              Start Meeting
            </Button>
          )}
          {isHost && isLive && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndMeeting}
            >
              <Square className="h-4 w-4 mr-2" />
              End
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* Audio/Video area */}
        <div className="flex-1 p-4 lg:p-6 flex flex-col">
          {/* Jitsi Meet iframe for audio conferencing */}
          <div
            ref={jitsiContainerRef}
            className={cn(
              "flex-1 rounded-2xl overflow-hidden border border-white/10 transition-all duration-300",
              isJitsiExpanded ? "fixed inset-4 z-50" : "relative"
            )}
          >
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setIsJitsiExpanded(!isJitsiExpanded)}
              >
                {isJitsiExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>


            {isLive ? (
              meeting.meeting_link ? (
                <div className="w-full h-full bg-slate-800/50 flex flex-col items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                      <Video className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Join Google Meet</h3>
                    <p className="text-white/50 text-sm mb-6">
                      Click the button below to join the meeting in Google Meet
                    </p>
                    <Button
                      onClick={() => window.open(meeting.meeting_link!, '_blank')}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                      size="lg"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Open Google Meet
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-slate-800/50 flex flex-col items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Chat Only Mode</h3>
                    <p className="text-white/50 text-sm">
                      No video link provided. Use the chat sidebar to communicate with participants.
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="w-full h-full bg-slate-800/50 flex flex-col items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                    <Volume2 className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-white font-medium mb-2">Waiting for host to start</h3>
                  <p className="text-white/50 text-sm max-w-xs">
                    The meeting will be available once the host starts it
                  </p>
                  {isHost && (
                    <Button
                      onClick={handleStartMeeting}
                      className="mt-4 bg-emerald-500 hover:bg-emerald-600"
                    >
                      Start Meeting Now
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom controls */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              variant="ghost"
              size="lg"
              className={cn(
                "rounded-full h-12 w-12",
                !isAudioEnabled ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-white/10 text-white hover:bg-white/20"
              )}
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            >
              {isAudioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full h-12 w-12"
              onClick={handleLeaveMeeting}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 sm:hidden"
              onClick={copyMeetingLink}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-white/10 flex flex-col bg-slate-900/50 hidden lg:flex">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'participants' | 'chat')} className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4 bg-white/5">
              <TabsTrigger value="participants" className="flex-1 data-[state=active]:bg-white/10">
                <Users className="h-4 w-4 mr-2" />
                People ({activeParticipants.length})
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex-1 data-[state=active]:bg-white/10">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="flex-1 p-4 mt-0">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {activeParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={participant.profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white text-sm">
                          {participant.profile?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate flex items-center gap-1">
                          {participant.profile?.full_name || 'Unknown'}
                          {participant.user_id === meeting.host_id && (
                            <Crown className="h-3 w-3 text-amber-400" />
                          )}
                          {participant.user_id === user?.id && (
                            <span className="text-white/50">(You)</span>
                          )}
                        </p>
                        <p className="text-white/50 text-xs">
                          Joined {formatDistanceToNow(new Date(participant.joined_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 flex flex-col p-4 mt-0">
              <ScrollArea className="flex-1 pr-4" ref={chatScrollRef}>
                <div className="space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-8 w-8 text-white/20 mx-auto mb-2" />
                      <p className="text-white/40 text-sm">No messages yet</p>
                      <p className="text-white/30 text-xs">Be the first to say hi!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isOwnMessage = msg.user_id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex gap-2",
                            isOwnMessage && "flex-row-reverse"
                          )}
                        >
                          {!isOwnMessage && (
                            <Avatar className="h-7 w-7 shrink-0">
                              <AvatarImage src={msg.profile?.avatar_url || undefined} />
                              <AvatarFallback className="bg-sky-600 text-white text-xs">
                                {msg.profile?.full_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={cn(
                            "max-w-[80%]",
                            isOwnMessage && "text-right"
                          )}>
                            {!isOwnMessage && (
                              <p className="text-white/60 text-xs mb-0.5">
                                {msg.profile?.full_name || 'Unknown'}
                              </p>
                            )}
                            <div className={cn(
                              "rounded-2xl px-3 py-2 text-sm",
                              isOwnMessage
                                ? "bg-sky-600 text-white rounded-br-md"
                                : "bg-white/10 text-white/90 rounded-bl-md"
                            )}>
                              {msg.content}
                            </div>
                            <p className="text-white/30 text-[10px] mt-0.5">
                              {format(new Date(msg.created_at), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-full"
                  disabled={sendingMessage}
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="shrink-0 rounded-full bg-sky-600 hover:bg-sky-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
