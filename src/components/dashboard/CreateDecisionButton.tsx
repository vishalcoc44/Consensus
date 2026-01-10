
import { useState, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const DECISION_FACTORS = [
  "Strategic Alignment",
  "Financial Impact",
  "Feasibility",
  "Risk Level",
  "Urgency",
  "Scalability",
  "Stakeholder Impact",
  "Reversibility",
  "Maintenance Effort",
  "Innovation"
];


const CreateDecisionButton = () => {
  /* -------------------------------------------------------------------------
   * STATE
   * ------------------------------------------------------------------------- */
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  // Use a string[] for options. Each entry is the "title".
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');

  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  /* -------------------------------------------------------------------------
   * EFFECTS
   * ------------------------------------------------------------------------- */
  const fetchTeams = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('team_members')
        .select('team:teams(id, name)')
        .eq('user_id', session.user.id);

      if (error) throw error;

      if (data) {
        // @ts-ignore - Supabase types are tricky with nested joins sometimes
        const rawTeams = data.map(item => item.team).filter(Boolean) as any[];

        // Deduplicate teams by ID (in case user has multiple roles in same team)
        const uniqueTeamsMap = new Map();
        rawTeams.forEach(team => {
          if (team && team.id && !uniqueTeamsMap.has(team.id)) {
            uniqueTeamsMap.set(team.id, team);
          }
        });

        const formattedTeams = Array.from(uniqueTeamsMap.values());

        setTeams(formattedTeams);
        // Pre-select first team if available and none selected
        if (formattedTeams.length > 0 && !selectedTeam) {
          setSelectedTeam(formattedTeams[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  /* -------------------------------------------------------------------------
   * HANDLERS
   * ------------------------------------------------------------------------- */
  const openModal = () => {
    setIsOpen(true);
    fetchTeams();
  };
  const closeModal = () => {
    setIsOpen(false);
    // Reset form on close
    setTimeout(() => {
      setTitle('');
      setDescription('');
      setDueDate('');
      setSelectedFactors([]);
      setOptions([]);
      setNewOption('');
    }, 300);
  };

  const toggleFactor = (factor: string) => {
    setSelectedFactors(prev =>
      prev.includes(factor)
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    setOptions(prev => [...prev, newOption.trim()]);
    setNewOption('');
  };

  const removeOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !dueDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTeam) {
      toast({
        title: "Team required",
        description: "Please select a team for this decision",
        variant: "destructive"
      });
      return;
    }

    if (selectedFactors.length === 0) {
      toast({
        title: "Factors required",
        description: "Please select at least one decision factor",
        variant: "destructive"
      });
      return;
    }

    if (options.length < 2) {
      toast({
        title: "Options required",
        description: "Please provide at least 2 options for the decision",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Save the decision (Proposal)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: proposal, error } = await supabase
        .from('proposals')
        .insert({
          title,
          description,
          deadline: new Date(dueDate).toISOString(),
          status: 'active',
          team_id: selectedTeam,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Insert selected factors (Criteria)
      if (selectedFactors.length > 0) {
        const criteriaData = selectedFactors.map((factor, index) => ({
          proposal_id: proposal.id,
          name: factor,
          weight: 5, // Default weight
          order_index: index
        }));

        const { error: criteriaError } = await supabase
          .from('proposal_criteria')
          .insert(criteriaData);

        if (criteriaError) throw criteriaError;
      }

      // 3. Insert Options
      if (options.length > 0) {
        const optionsData = options.map((opt, index) => ({
          proposal_id: proposal.id,
          title: opt,
          order_index: index
        }));

        const { error: optionsError } = await supabase
          .from('proposal_options')
          .insert(optionsData);

        if (optionsError) throw optionsError;
      }

      toast({
        title: "Decision created",
        description: "Your new decision has been created successfully",
      });

      // Reset form and close modal
      setTitle('');
      setDescription('');
      setDueDate('');
      setSelectedFactors([]);
      setOptions([]);
      setNewOption('');
      closeModal();

      // Navigate to the newly created decision
      navigate(`/dashboard/proposals/${proposal.id}`);
    } catch (error) {
      console.error('Error creating decision:', error);
      toast({
        title: "Error creating decision",
        description: "There was an error creating your decision. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={openModal}
        className="flex items-center gap-2 rounded-full px-6 py-6 bg-gradient-to-r from-primary to-emerald-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] shadow-lg shadow-primary/20 transition-all hover:scale-105 duration-300 border border-white/20"
      >
        <Plus size={20} className="text-white" />
        <span className="font-medium text-white">New Decision</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col p-0 rounded-2xl bg-background border-border shadow-2xl backdrop-blur-xl [&>button]:hidden text-foreground">
          <div className="flex justify-between items-center p-6 border-b border-border bg-muted/20 flex-shrink-0">
            <DialogTitle className="text-2xl font-sf font-bold text-foreground tracking-wide">Create New Decision</DialogTitle>
            <button
              onClick={closeModal}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              <DialogDescription className="text-muted-foreground text-base leading-relaxed">
                Start a new collaborative decision-making process. Define the goal and set a timeline for your team.
              </DialogDescription>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="team" className="text-sm font-medium text-foreground">
                    Team <span className="text-primary">*</span>
                  </Label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam} required>
                    <SelectTrigger className="rounded-xl py-4 bg-background border-input text-foreground font-medium">
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.length === 0 ? (
                        <SelectItem value="disabled" disabled>No teams found</SelectItem>
                      ) : (
                        teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name} <span className="text-xs text-muted-foreground ml-2">({team.id.slice(0, 4)})</span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-foreground">
                    Decision Title <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Select New CRM Software"
                    className="rounded-xl py-4 bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20 transition-all font-medium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-foreground">
                    Description <span className="text-primary">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the decision context, objectives, and any constraints..."
                    className="min-h-[120px] rounded-xl bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20 transition-all leading-relaxed custom-scrollbar resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium text-foreground">
                    Due Date <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="rounded-xl py-4 bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Decision Options <span className="text-primary">*</span>
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      (What are we deciding between?)
                    </span>
                  </Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        placeholder="E.g., Salesforce, Hubspot..."
                        className="flex-1 rounded-xl bg-background border-input text-foreground font-medium"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addOption();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addOption}
                        variant="ghost"
                        className="rounded-xl border border-input text-foreground hover:bg-muted hover:text-foreground"
                      >
                        Add
                      </Button>
                    </div>

                    {/* Options List */}
                    {options.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-muted/40 border border-border px-3 py-1.5 rounded-lg">
                            <span className="text-sm font-medium">{opt}</span>
                            <button
                              type="button"
                              onClick={() => removeOption(idx)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">
                    Decision Factors <span className="text-primary">*</span>
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      (Select criteria for evaluation)
                    </span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {DECISION_FACTORS.map((factor) => (
                      <div
                        key={factor}
                        className={`flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${selectedFactors.includes(factor)
                          ? 'bg-primary/10 border-primary/30 shadow-sm'
                          : 'bg-muted/30 border-border/50 hover:bg-muted/50 hover:border-border'
                          }`}
                        onClick={() => toggleFactor(factor)}
                      >
                        <div className={`
                          h-4 w-4 shrink-0 rounded-sm border border-primary flex items-center justify-center transition-colors
                          ${selectedFactors.includes(factor)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-transparent'
                          }
                        `}>
                          {selectedFactors.includes(factor) && <Check className="h-3 w-3" />}
                        </div>
                        <label
                          htmlFor={`factor-${factor}`}
                          className="text-sm font-medium leading-none cursor-pointer flex-1 user-select-none"
                        >
                          {factor}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/20 p-6 border-t border-border flex justify-end gap-3 backdrop-blur-sm flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="rounded-xl px-6 py-2 border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl px-8 py-2 bg-gradient-to-r from-primary to-emerald-500 hover:opacity-90 text-primary-foreground font-medium shadow-lg shadow-primary/20 border border-white/10 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Decision'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateDecisionButton;
