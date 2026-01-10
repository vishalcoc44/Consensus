
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DecisionCard from '@/components/dashboard/DecisionCard';
import EditDecisionDialog from '@/components/dashboard/EditDecisionDialog';
import CreateDecisionButton from '@/components/dashboard/CreateDecisionButton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import ErrorDisplay from '@/components/auth/components/ErrorDisplay';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface Decision {
  id: string | number;
  title: string;
  description: string;
  dueDate: string;
  participants: number;
  comments: number;
  progress: number;
  status: 'active' | 'completed' | 'archived';
  consensus: number;
  created_by?: string;
  team_id?: string;
  image_url?: string | null;
  creator_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const Decisions = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [filteredDecisions, setFilteredDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [teamRoles, setTeamRoles] = useState<Record<string, string>>({});

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [decisionToDelete, setDecisionToDelete] = useState<string | number | null>(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [decisionToEdit, setDecisionToEdit] = useState<Decision | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Decisions - ConsensusAI';
    fetchDecisions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [decisions, searchQuery, statusFilter, sortBy]);

  const applyFilters = () => {
    let result = [...decisions];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        decision =>
          decision.title.toLowerCase().includes(query) ||
          decision.description.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(decision => decision.status === statusFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        result.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'progress':
        result.sort((a, b) => b.progress - a.progress);
        break;
      case 'consensus':
        result.sort((a, b) => b.consensus - a.consensus);
        break;
    }

    setFilteredDecisions(result);
  };

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching decisions data...");

      // Get the current user's session to check auth
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.log("No active session found");
        setError("Authentication required to view decisions");
        setLoading(false);
        return;
      }

      setCurrentUserId(session.user.id);

      // Fetch user's team roles for permission checks
      const { data: teamMembersData } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', session.user.id);

      if (teamMembersData) {
        const rolesMap: Record<string, string> = {};
        teamMembersData.forEach(tm => {
          if (tm.team_id) rolesMap[tm.team_id] = tm.role;
        });
        setTeamRoles(rolesMap);
      }

      // Use a simpler query to avoid potential recursion issues
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          creator:created_by (
            full_name,
            avatar_url
          )
        `);

      if (error) {
        console.error("Database query error:", error);
        throw error;
      }

      if (data) {
        console.log("Decisions data retrieved:", data.length, "records");
        data.forEach(d => console.log(`Decision ${d.id} creator:`, d.created_by, d.creator));

        // Now fetch the additional data separately to avoid recursion
        const contributionCounts: Record<string, number> = {};

        // Get contribution counts
        if (data.length > 0) {
          const proposalIds = data.map(item => item.id);

          // Fix: Use separate count queries for each proposal to avoid groupBy
          for (const proposalId of proposalIds) {
            const { count, error: countError } = await supabase
              .from('contributions')
              .select('*', { count: 'exact', head: true })
              .eq('proposal_id', proposalId);

            if (countError) {
              console.error(`Error fetching contribution count for proposal ${proposalId}:`, countError);
            } else if (count !== null) {
              contributionCounts[proposalId] = count;
            }
          }
        }

        // Format decisions
        const formattedDecisions: Decision[] = data.map(item => {
          const participantsCount = contributionCounts[item.id] || 0;
          const commentsCount = participantsCount * 2;
          const consensusScore = Math.floor(Math.random() * 100);

          let progress = 0;
          if (item.status === 'completed' || item.status === 'archived') {
            progress = 100;
          } else if (item.status === 'active') {
            if (item.deadline) {
              const now = new Date();
              const deadline = new Date(item.deadline);
              const created = new Date(item.created_at);

              if (now > deadline) {
                progress = 100;
              } else {
                const totalTime = deadline.getTime() - created.getTime();
                const elapsedTime = now.getTime() - created.getTime();
                progress = Math.min(100, Math.ceil((elapsedTime / totalTime) * 100));
              }
            } else {
              progress = Math.floor(Math.random() * 90) + 10;
            }
          }

          return {
            id: item.id,
            title: item.title,
            description: item.description || 'No description provided',
            dueDate: item.deadline ? new Date(item.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline',
            participants: participantsCount,
            comments: commentsCount,
            progress: progress,
            status: (item.status as 'active' | 'completed' | 'archived') || 'active',
            consensus: consensusScore,
            created_by: item.created_by,
            team_id: item.team_id,
            image_url: item.image_url,
            creator_profile: item.creator
              ? { full_name: item.creator.full_name, avatar_url: item.creator.avatar_url }
              : undefined
          };
        });

        setDecisions(formattedDecisions);
        // Initially set filtered decisions to all decisions
        setFilteredDecisions(formattedDecisions);
      }
    } catch (error: any) {
      console.error('Error fetching decisions:', error);
      setError(error.message || 'Could not load decisions. Please try again later.');
      toast({
        title: 'Error fetching decisions',
        description: error.message || 'Could not load decisions. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDecisionClick = (decisionId: string | number) => {
    navigate(`/dashboard/proposals/${decisionId}`);
  };

  const initiateDelete = (id: string | number) => {
    setDecisionToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const initiateEdit = (decision: Decision) => {
    setDecisionToEdit(decision);
    setIsEditDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!decisionToDelete) return;
    const id = decisionToDelete;

    try {
      console.log(`Attempting to delete decision ${id}...`);

      // Get current user for debugging
      const { data: { user } } = await supabase.auth.getUser();
      const decisionToRemove = decisions.find(d => d.id === id);
      console.log(`Current User: ${user?.id}, Proposal Creator: ${decisionToRemove?.created_by}, Team: ${decisionToRemove?.team_id}`);

      // 1. Fetch contributions to find their IDs for deleting ratings
      const { data: contributions } = await supabase
        .from('contributions')
        .select('id')
        .eq('proposal_id', id);

      // 2. Delete dependent data manually (in case cascade is missing)
      const deletePromises = [
        supabase.from('proposal_options').delete().eq('proposal_id', id),
        supabase.from('proposal_criteria').delete().eq('proposal_id', id),
        supabase.from('proposal_analysis').delete().eq('proposal_id', id)
      ];

      // If there are contributions, delete their ratings first, then the contributions
      if (contributions && contributions.length > 0) {
        const contributionIds = contributions.map(c => c.id);
        // Delete ratings first
        await supabase.from('contribution_ratings').delete().in('contribution_id', contributionIds);
        // Then delete contributions
        deletePromises.push(supabase.from('contributions').delete().eq('proposal_id', id));
      } else {
        // Even if no contributions found, try deleting to be safe or if query failed
        deletePromises.push(supabase.from('contributions').delete().eq('proposal_id', id));
      }

      await Promise.allSettled(deletePromises);

      // 3. Delete the proposal itself
      const { data, error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id)
        .select(); // Select to verify

      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }

      // Check if any row was actually deleted
      if (!data || data.length === 0) {
        console.error("Deletion mismatch debug:", {
          currentUserId: user?.id,
          proposalCreator: decisionToRemove?.created_by,
          proposalTeam: decisionToRemove?.team_id
        });
        throw new Error("Deletion failed. You may not have permission to delete this decision (ID mismatch).");
      }

      toast({
        title: "Decision deleted",
        description: "The decision has been permanently removed.",
      });

      // 3. Update local state immediately to reflect change
      setDecisions(prev => prev.filter(d => d.id !== id));
      setFilteredDecisions(prev => prev.filter(d => d.id !== id));

      // 4. Fetch to be sure
      fetchDecisions();
    } catch (error: any) {
      console.error('Error deleting decision details:', error);
      toast({
        title: "Error deleting decision",
        description: error.message || error.details || "Failed to delete decision",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDecisionToDelete(null);
    }
  };

  const getCanEdit = (decision: Decision) => {
    // Same permission logic as delete, typically
    return getCanDelete(decision);
  };

  const getCanDelete = (decision: Decision) => {
    if (!currentUserId) return false;
    // Creator can always delete
    if (decision.created_by === currentUserId) return true;

    // Team admins/owners can delete
    if (decision.team_id && teamRoles[decision.team_id]) {
      const role = teamRoles[decision.team_id];
      // Check for case sensitivity or whitespace issues
      if (role === 'admin' || role === 'owner') return true;
      // Also check uppercase just in case
      if (role === 'Admin' || role === 'Owner') return true;
    }
    return false;
  };

  return (
    <DashboardLayout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-sf font-bold mb-2">Decision Management</h1>
        <p className="text-muted-foreground">View and manage all your organization's decisions</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search decisions..."
              className="pl-9 pr-4 py-2 bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2 border-border bg-background hover:bg-muted text-foreground hover:text-foreground">
                <SlidersHorizontal size={16} />
                <span>Filters</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort by</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="progress">Progress</SelectItem>
                      <SelectItem value="consensus">Consensus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <CreateDecisionButton />
      </div>

      {error && (
        <ErrorDisplay error={error} title="Error Loading Decisions" />
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredDecisions.length === 0 ? (
        searchQuery || statusFilter !== 'all' ? (
          <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg animate-fade-in">
            No decisions match your filters. Try adjusting your search criteria.
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg animate-fade-in">
            No decisions yet. Use the "New Decision" button to create one.
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredDecisions.map((decision) => (
            <div
              key={decision.id}
              onClick={() => handleDecisionClick(decision.id)}
              className="cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <DecisionCard
                title={decision.title}
                description={decision.description}
                dueDate={decision.dueDate}
                participants={decision.participants}
                comments={decision.comments}
                progress={decision.progress}
                status={decision.status}
                consensus={decision.consensus}
                imageUrl={decision.image_url}
                createdBy={decision.creator_profile ? {
                  name: decision.creator_profile.full_name,
                  avatarUrl: decision.creator_profile.avatar_url
                } : undefined}
                onDelete={getCanDelete(decision) ? () => initiateDelete(decision.id) : undefined}
                onEdit={getCanEdit(decision) ? () => initiateEdit(decision) : undefined}
              />
            </div>
          ))}
        </div>
      )}

      {filteredDecisions.length > 0 && (
        <div className="mt-6 text-center text-consensus-grey-500 text-sm">
          Showing {filteredDecisions.length} of {decisions.length} decisions
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the decision
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {decisionToEdit && (
        <EditDecisionDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          decision={decisionToEdit}
          onUpdate={fetchDecisions}
        />
      )}
    </DashboardLayout>
  );
};

export default Decisions;
