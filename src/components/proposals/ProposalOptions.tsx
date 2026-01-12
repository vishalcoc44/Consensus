
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, List } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Option {
  id: number;
  title: string;
  description: string;
}

interface ProposalOptionsProps {
  options: Option[];
  updateOptions: (options: Option[]) => void;
  errors: Record<string, string>;
}

const ProposalOptions = ({
  options,
  updateOptions,
  errors
}: ProposalOptionsProps) => {
  const updateOption = (id: number, field: keyof Option, value: string) => {
    const updatedOptions = options.map(option =>
      option.id === id ? { ...option, [field]: value } : option
    );
    updateOptions(updatedOptions);
  };

  const addOption = () => {
    if (options.length < 5) {
      const newId = Math.max(0, ...options.map(o => o.id)) + 1;
      updateOptions([...options, { id: newId, title: '', description: '' }]);
    }
  };

  const removeOption = (id: number) => {
    if (options.length > 1) {
      updateOptions(options.filter(option => option.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
      <div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Define Your Options</h2>
        <p className="text-muted-foreground mt-1">
          Add up to 5 distinct options for this decision. Each option should be clearly defined.
        </p>
      </div>

      {errors.options && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm font-medium animate-in shake">
          {errors.options}
        </div>
      )}

      <div className="space-y-6">
        {options.map((option, index) => (
          <div
            key={option.id}
            className="group relative rounded-2xl bg-background/40 border border-white/20 shadow-sm hover:shadow-md hover:bg-background/60 transition-all duration-300 backdrop-blur-sm overflow-hidden"
          >
            {/* Option stripe */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary/50 to-primary/20" />

            <div className="p-6 pl-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="h-7 px-2.5 rounded-lg bg-primary/5 border-primary/10 text-primary">
                    Option {index + 1}
                  </Badge>
                  {index === 0 && <Badge variant="secondary" className="h-6 rounded-md text-[10px]">Default</Badge>}
                </div>
                {options.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(option.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Option Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={option.title}
                    onChange={(e) => updateOption(option.id, 'title', e.target.value)}
                    placeholder="E.g., Downtown Office Location"
                    className="h-11 rounded-xl bg-white/50 dark:bg-black/20 border-black/5 dark:border-white/10 focus:bg-background transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    value={option.description}
                    onChange={(e) => updateOption(option.id, 'description', e.target.value)}
                    placeholder="Describe this option in detail..."
                    className="min-h-[100px] rounded-xl bg-white/50 dark:bg-black/20 border-black/5 dark:border-white/10 focus:bg-background transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {options.length < 5 && (
          <Button
            variant="outline"
            onClick={addOption}
            className="w-full py-8 border-dashed border-2 rounded-2xl hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all group"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <Plus size={20} />
              </div>
              <span className="font-semibold">Add Another Option</span>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProposalOptions;
