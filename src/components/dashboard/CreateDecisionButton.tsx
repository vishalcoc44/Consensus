
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
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

const CreateDecisionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

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

    setLoading(true);

    try {
      // Save the decision to Supabase
      const { data: proposal, error } = await supabase
        .from('proposals')
        .insert({
          title,
          description,
          deadline: new Date(dueDate).toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Decision created",
        description: "Your new decision has been created successfully",
      });

      // Reset form and close modal
      setTitle('');
      setDescription('');
      setDueDate('');
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
        className="flex items-center gap-2 rounded-full px-6 py-6 bg-gradient-to-r from-consensus-blue to-consensus-teal hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] shadow-lg shadow-consensus-blue/20 transition-all hover:scale-105 duration-300 border border-white/10"
      >
        <Plus size={20} className="text-white" />
        <span className="font-medium text-white">New Decision</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col p-0 rounded-2xl glass-panel border-consensus-dark-300/50 shadow-2xl backdrop-blur-xl [&>button]:hidden">
          <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5 flex-shrink-0">
            <DialogTitle className="text-2xl font-sf font-bold text-white tracking-wide">Create New Decision</DialogTitle>
            <button
              onClick={closeModal}
              className="p-2 rounded-full hover:bg-white/10 text-consensus-grey-400 hover:text-white transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              <DialogDescription className="text-consensus-grey-300 text-base leading-relaxed">
                Start a new collaborative decision-making process. Define the goal and set a timeline for your team.
              </DialogDescription>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-consensus-grey-200">
                    Decision Title <span className="text-consensus-green">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Select New CRM Software"
                    className="rounded-xl py-4 bg-consensus-dark-900/50 border-white/10 text-white placeholder:text-consensus-grey-600 focus:border-consensus-blue/50 focus:ring-consensus-blue/20 transition-all font-medium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-consensus-grey-200">
                    Description <span className="text-consensus-green">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the decision context, objectives, and any constraints..."
                    className="min-h-[120px] rounded-xl bg-consensus-dark-900/50 border-white/10 text-white placeholder:text-consensus-grey-600 focus:border-consensus-blue/50 focus:ring-consensus-blue/20 transition-all leading-relaxed custom-scrollbar resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium text-consensus-grey-200">
                    Due Date <span className="text-consensus-green">*</span>
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="rounded-xl py-4 bg-consensus-dark-900/50 border-white/10 text-white placeholder:text-consensus-grey-600 focus:border-consensus-blue/50 focus:ring-consensus-blue/20 transition-all [color-scheme:dark]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-black/20 p-6 border-t border-white/5 flex justify-end gap-3 backdrop-blur-sm flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="rounded-xl px-6 py-2 border-white/10 bg-transparent text-consensus-grey-300 hover:bg-white/5 hover:text-white transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl px-8 py-2 bg-gradient-to-r from-consensus-blue to-consensus-teal hover:opacity-90 text-white font-medium shadow-lg shadow-consensus-blue/20 border border-white/10 transition-all"
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
