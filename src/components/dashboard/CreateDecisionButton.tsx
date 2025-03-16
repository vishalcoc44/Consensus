
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
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

const CreateDecisionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Creating decision:', { title, description, dueDate });
    
    // Reset form and close modal
    setTitle('');
    setDescription('');
    setDueDate('');
    setLoading(false);
    closeModal();
  };

  return (
    <>
      <Button
        onClick={openModal}
        className="flex items-center gap-2 rounded-full px-6 py-6 bg-consensus-blue hover:bg-consensus-blue/90 shadow-lg shadow-consensus-blue/10 hover:shadow-consensus-blue/20 transition-all hover:scale-105 duration-300"
      >
        <Plus size={20} />
        <span>New Decision</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-xl bg-white">
          <div className="flex justify-between items-center p-5 border-b border-consensus-grey-200">
            <DialogTitle className="text-xl font-sf">Create New Decision</DialogTitle>
            <button
              onClick={closeModal}
              className="p-1 rounded-full hover:bg-consensus-grey-100 text-consensus-grey-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="p-5 space-y-6">
              <DialogDescription className="text-consensus-grey-600 mb-6">
                Start a new decision-making process. Add details and invite participants to contribute.
              </DialogDescription>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Decision Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Select New CRM Software"
                    className="rounded-lg py-5"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the decision and context..."
                    className="min-h-[100px] rounded-lg"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium">
                    Due Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="rounded-lg py-5"
                    required
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter className="bg-consensus-grey-50 p-5 border-t border-consensus-grey-200">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="rounded-lg bg-consensus-blue hover:bg-consensus-blue/90"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="ml-2">Creating...</span>
                  </div>
                ) : (
                  'Create Decision'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateDecisionButton;
