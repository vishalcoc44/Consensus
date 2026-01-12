
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Criterion {
  id: number;
  name: string;
  weight: number;
  description: string;
}

interface ProposalCriteriaProps {
  criteria: Criterion[];
  updateCriteria: (criteria: Criterion[]) => void;
  errors: Record<string, string>;
}

const ProposalCriteria = ({
  criteria,
  updateCriteria,
  errors
}: ProposalCriteriaProps) => {
  const updateCriterion = (id: number, field: keyof Criterion, value: string | number) => {
    const updatedCriteria = criteria.map(criterion =>
      criterion.id === id ? { ...criterion, [field]: value } : criterion
    );
    updateCriteria(updatedCriteria);
  };

  const addCriterion = () => {
    if (criteria.length < 5) {
      const newId = Math.max(0, ...criteria.map(c => c.id)) + 1;
      updateCriteria([...criteria, { id: newId, name: '', weight: 5, description: '' }]);
    }
  };

  const removeCriterion = (id: number) => {
    if (criteria.length > 1) {
      updateCriteria(criteria.filter(criterion => criterion.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
      <div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Define Evaluation Criteria</h2>
        <p className="text-muted-foreground mt-1">
          Add up to 5 criteria that will be used to evaluate each option. Assign a weight (1-10) to each criterion to indicate its importance.
        </p>
      </div>

      {errors.criteria && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm font-medium animate-in shake">
          {errors.criteria}
        </div>
      )}

      <div className="space-y-6">
        {criteria.map((criterion, index) => (
          <div
            key={criterion.id}
            className="group relative rounded-2xl bg-background/40 border border-white/20 shadow-sm hover:shadow-md hover:bg-background/60 transition-all duration-300 backdrop-blur-sm overflow-hidden"
          >
            {/* Criterion stripe */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-500/50 to-purple-500/20" />

            <div className="p-6 pl-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="h-7 px-2.5 rounded-lg bg-purple-500/5 border-purple-500/10 text-purple-600 dark:text-purple-400">
                    Criterion {index + 1}
                  </Badge>
                </div>
                {criteria.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCriterion(criterion.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Criterion Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={criterion.name}
                    onChange={(e) => updateCriterion(criterion.id, 'name', e.target.value)}
                    placeholder="E.g., Cost, Accessibility, Impact"
                    className="h-11 rounded-xl bg-white/50 dark:bg-black/20 border-black/5 dark:border-white/10 focus:bg-background transition-all"
                  />
                </div>

                <div className="p-4 rounded-xl bg-muted/20 border border-black/5 dark:border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <Label className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-primary" />
                      Importance Weight
                    </Label>
                    <Badge variant="secondary" className="px-3 py-1 text-sm font-mono font-medium rounded-lg">
                      {criterion.weight}/10
                    </Badge>
                  </div>

                  <div className="px-2">
                    <Slider
                      value={[criterion.weight]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={(value) => updateCriterion(criterion.id, 'weight', value[0])}
                      className="py-2"
                    />
                  </div>

                  <div className="flex justify-between mt-3 text-xs text-muted-foreground font-medium uppercase tracking-wider px-2">
                    <span>Less Important</span>
                    <span>Critical</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    value={criterion.description}
                    onChange={(e) => updateCriterion(criterion.id, 'description', e.target.value)}
                    placeholder="Explain this criterion and why it matters..."
                    className="min-h-[80px] rounded-xl bg-white/50 dark:bg-black/20 border-black/5 dark:border-white/10 focus:bg-background transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {criteria.length < 5 && (
          <Button
            variant="outline"
            onClick={addCriterion}
            className="w-full py-8 border-dashed border-2 rounded-2xl hover:bg-purple-500/5 hover:border-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all group"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-muted group-hover:bg-purple-500/10 flex items-center justify-center transition-colors">
                <Plus size={20} />
              </div>
              <span className="font-semibold">Add Another Criterion</span>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProposalCriteria;
