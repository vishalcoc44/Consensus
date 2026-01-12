
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { StarRating } from '@/components/proposals/StarRating';
import { UploadCloud, AlertCircle, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Option {
  id: string | number;
  title: string;
  description: string;
}

interface Criterion {
  id: string | number;
  name: string;
  weight: number;
  description: string;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  options: Option[];
  criteria: Criterion[];
  deadline: string;
}

interface ContributionFormProps {
  proposal: Proposal;
  onSubmit: (data: any) => void;
}

const ContributionForm = ({ proposal, onSubmit }: ContributionFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  // Use string | number for keys to handle both UUIDs and legacy numeric IDs
  const [criteriaRatings, setCriteriaRatings] = useState<Record<string | number, number>>(
    proposal.criteria.reduce((acc, criterion) => ({
      ...acc,
      [criterion.id]: 0
    }), {})
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setFileUpload(file);
    }
  };

  const updateRating = (criterionId: string | number, rating: number) => {
    setCriteriaRatings(prev => ({
      ...prev,
      [criterionId]: rating
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!selectedOption && selectedOption !== '0') {
      errors.option = 'Please select an option or choose to abstain';
    }

    if (comment.length > 500) {
      errors.comment = 'Comment must be 500 characters or less';
    }

    // Check if at least one criterion has been rated
    const hasRating = Object.values(criteriaRatings).some(rating => rating > 0);
    if (!hasRating) {
      errors.criteria = 'Please rate at least one criterion';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Compile all data
    const contributionData = {
      proposalId: proposal.id,
      selectedOption,
      comment,
      fileUpload, // In a real app, this would be uploaded to storage
      ratings: criteriaRatings, // Fixed: Renamed from criteriaRatings to ratings to match ProposalDetails expectation
      timestamp: new Date().toISOString()
    };

    // Simulate API delay
    setTimeout(() => {
      onSubmit(contributionData);

      toast({
        title: "Contribution submitted",
        description: "Your input has been recorded successfully",
      });

      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          You are providing input for <strong>{proposal.title}</strong>. Your contribution will help
          inform the final decision. Please vote for one option, rate the criteria, and optionally add
          a comment or supporting document.
        </p>
      </div>

      {Object.keys(formErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Please fix the highlighted errors before submitting.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">1. Select an Option</h3>

          <RadioGroup
            value={selectedOption ?? ''}
            onValueChange={setSelectedOption}
            className="space-y-4"
          >
            {proposal.options.map((option) => (
              <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50">
                <RadioGroupItem
                  value={option.id.toString()}
                  id={`option-${option.id}`}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={`option-${option.id}`}
                    className="text-base font-medium cursor-pointer"
                  >
                    {option.title}
                  </Label>
                  {option.description && (
                    <p className="text-sm text-consensus-grey-600 mt-1">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50">
              <RadioGroupItem value="0" id="option-abstain" className="mt-1" />
              <div className="flex-1">
                <Label
                  htmlFor="option-abstain"
                  className="text-base font-medium cursor-pointer"
                >
                  Abstain from voting
                </Label>
                <p className="text-sm text-consensus-grey-600 mt-1">
                  I prefer not to select any of the options
                </p>
              </div>
            </div>
          </RadioGroup>

          {formErrors.option && (
            <p className="text-sm text-red-500 mt-2">{formErrors.option}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">2. Rate the Criteria</h3>

          <div className="space-y-6">
            {proposal.criteria.map((criterion) => (
              <div key={criterion.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">
                    {criterion.name}
                    <span className="text-sm font-normal text-consensus-grey-500 ml-2">
                      (Weight: {criterion.weight}/10)
                    </span>
                  </Label>
                </div>

                {criterion.description && (
                  <p className="text-sm text-consensus-grey-600 mb-2">
                    {criterion.description}
                  </p>
                )}

                <StarRating
                  value={criteriaRatings[criterion.id]}
                  onChange={(rating) => updateRating(criterion.id, rating)}
                />
              </div>
            ))}
          </div>

          {formErrors.criteria && (
            <p className="text-sm text-red-500 mt-2">{formErrors.criteria}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">3. Add Your Comment (Optional)</h3>

            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explain your reasoning or provide feedback (max 500 characters)"
              className="min-h-[120px]"
              maxLength={500}
            />

            <div className="flex justify-end mt-2">
              <span className={`text-xs ${comment.length > 450 ? 'text-amber-600' : 'text-consensus-grey-500'}`}>
                {comment.length}/500 characters
              </span>
            </div>

            {formErrors.comment && (
              <p className="text-sm text-red-500 mt-1">{formErrors.comment}</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">4. Upload Supporting Document (Optional)</h3>

            <div
              className={`border-2 border-dashed ${fileUpload ? 'border-green-300 bg-green-50' : 'border-gray-300'} rounded-lg p-6 text-center`}
            >
              {fileUpload ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-green-600 font-medium">{fileUpload.name}</p>
                  <p className="text-sm text-consensus-grey-600">
                    {(fileUpload.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFileUpload(null)}
                  >
                    Change File
                  </Button>
                </div>
              ) : (
                <Label htmlFor="file-upload" className="cursor-pointer space-y-3 block">
                  <div className="flex items-center justify-center">
                    <UploadCloud className="h-10 w-10 text-consensus-grey-400" />
                  </div>
                  <p className="text-consensus-grey-600">
                    <span className="text-consensus-blue font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-consensus-grey-500">
                    PDF, CSV, DOCX, JPG, PNG (Max 10MB)
                  </p>
                </Label>
              )}

              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.csv,.docx,.jpg,.jpeg,.png"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          className="bg-consensus-blue hover:bg-consensus-blue/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Contribution'}
        </Button>
      </div>
    </form>
  );
};

export default ContributionForm;
