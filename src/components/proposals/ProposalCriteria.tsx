
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { FormMessage } from '@/components/ui/form';

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
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Define Evaluation Criteria</h2>
        <p className="text-consensus-grey-600 text-sm">
          Add up to 5 criteria that will be used to evaluate each option. Assign a weight (1-10) to each criterion to indicate its importance.
        </p>
      </div>
      
      {errors.criteria && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {errors.criteria}
        </div>
      )}
      
      <div className="space-y-4">
        {criteria.map((criterion, index) => (
          <Card key={criterion.id} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Criterion {index + 1}</h3>
                {criteria.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCriterion(criterion.id)}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`criterion-name-${criterion.id}`}>
                    Criterion Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`criterion-name-${criterion.id}`}
                    value={criterion.name}
                    onChange={(e) => updateCriterion(criterion.id, 'name', e.target.value)}
                    placeholder="E.g., Cost, Accessibility, Impact"
                    className="rounded-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`criterion-weight-${criterion.id}`}>
                      Weight (Importance)
                    </Label>
                    <span className="text-sm font-medium">{criterion.weight}/10</span>
                  </div>
                  <Slider
                    id={`criterion-weight-${criterion.id}`}
                    value={[criterion.weight]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => updateCriterion(criterion.id, 'weight', value[0])}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-consensus-grey-500">
                    <span>Less Important</span>
                    <span>More Important</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`criterion-desc-${criterion.id}`}>
                    Description
                  </Label>
                  <Textarea
                    id={`criterion-desc-${criterion.id}`}
                    value={criterion.description}
                    onChange={(e) => updateCriterion(criterion.id, 'description', e.target.value)}
                    placeholder="Explain this criterion and why it matters..."
                    className="min-h-[80px] rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {criteria.length < 5 && (
          <Button
            variant="outline"
            onClick={addCriterion}
            className="w-full py-6 border-dashed rounded-lg"
          >
            <Plus size={18} className="mr-2" />
            Add Another Criterion
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProposalCriteria;
