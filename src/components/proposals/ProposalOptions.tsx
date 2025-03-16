
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { FormMessage } from '@/components/ui/form';

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
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Define Your Options</h2>
        <p className="text-consensus-grey-600 text-sm">
          Add up to 5 distinct options for this decision. Each option should be clearly defined.
        </p>
      </div>
      
      {errors.options && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {errors.options}
        </div>
      )}
      
      <div className="space-y-4">
        {options.map((option, index) => (
          <Card key={option.id} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Option {index + 1}</h3>
                {options.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(option.id)}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`option-title-${option.id}`}>
                    Option Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`option-title-${option.id}`}
                    value={option.title}
                    onChange={(e) => updateOption(option.id, 'title', e.target.value)}
                    placeholder="E.g., Downtown Office Location"
                    className="rounded-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`option-desc-${option.id}`}>
                    Description
                  </Label>
                  <Textarea
                    id={`option-desc-${option.id}`}
                    value={option.description}
                    onChange={(e) => updateOption(option.id, 'description', e.target.value)}
                    placeholder="Describe this option in detail..."
                    className="min-h-[100px] rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {options.length < 5 && (
          <Button
            variant="outline"
            onClick={addOption}
            className="w-full py-6 border-dashed rounded-lg"
          >
            <Plus size={18} className="mr-2" />
            Add Another Option
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProposalOptions;
