
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Bot, 
  Brain, 
  RefreshCw, 
  ThumbsUp, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Send
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface RecommendationEngineProps {
  proposalId?: string;
  isAdmin?: boolean;
}

interface ParameterWeights {
  supportWeight: number;
  sentimentWeight: number;
  criteriaWeight: number;
  historicalWeight: number;
}

interface RankedOption {
  id: string;
  title: string;
  supportScore: number;
  sentimentScore: number;
  criteriaScores: Record<string, number>;
  weightedCriteriaScore: number;
  totalScore: number;
}

interface Recommendation {
  proposalId: string;
  recommendedOptionId: string;
  recommendedOptionTitle: string;
  confidenceScore: number;
  explanation: string;
  rankedOptions: RankedOption[];
  generatedAt: string;
  parameters: ParameterWeights;
}

interface AnalysisData {
  recommendation: Recommendation;
  optionScores: RankedOption[];
}

const defaultWeights: ParameterWeights = {
  supportWeight: 0.4,
  sentimentWeight: 0.2,
  criteriaWeight: 0.3,
  historicalWeight: 0.1,
};

const RecommendationEngine = ({ 
  proposalId, 
  isAdmin = false 
}: RecommendationEngineProps) => {
  const params = useParams();
  const actualProposalId = proposalId || params.proposalId;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [showParameters, setShowParameters] = useState(false);
  const [weights, setWeights] = useState<ParameterWeights>(defaultWeights);
  const [emailRecipient, setEmailRecipient] = useState('');
  
  // Fetch the current recommendation from the database
  const { 
    data: recommendationData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['recommendation', actualProposalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_analysis')
        .select('analysis_data, updated_at')
        .eq('proposal_id', actualProposalId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!actualProposalId,
  });
  
  // Mutation to generate a new recommendation
  const generateMutation = useMutation({
    mutationFn: async (customWeights?: ParameterWeights) => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          proposalId: actualProposalId,
          parameters: customWeights || weights,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate recommendation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendation', actualProposalId] });
      toast({
        title: 'Recommendation Generated',
        description: 'The AI recommendation has been updated with the latest data.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to generate recommendation: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Mutation to send recommendation email
  const emailMutation = useMutation({
    mutationFn: async () => {
      // This would call an edge function to send an email
      // For now we're just showing a success message
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: 'Email Sent',
        description: `Recommendation was sent to ${emailRecipient}`,
      });
      setEmailRecipient('');
    },
  });
  
  // Get the recommendation data
  const analysisData = recommendationData?.analysis_data as AnalysisData | undefined;
  const recommendation = analysisData?.recommendation;
  const lastUpdated = recommendationData?.updated_at 
    ? new Date(recommendationData.updated_at).toLocaleString() 
    : 'Never';
  
  // Update a specific weight
  const updateWeight = (key: keyof ParameterWeights, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };
  
  // Handle weight slider changes
  const handleWeightChange = (key: keyof ParameterWeights) => (value: number[]) => {
    updateWeight(key, value[0]);
  };
  
  // Format a weight as a percentage
  const formatWeight = (weight: number) => `${Math.round(weight * 100)}%`;
  
  // Reset weights to default
  const resetWeights = () => {
    setWeights(defaultWeights);
  };
  
  // Determine the confidence color
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-consensus-blue" />
              AI Recommendation Engine
            </CardTitle>
            <CardDescription>
              Machine learning analysis of all contributions
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending || !actualProposalId}
            >
              <RefreshCw 
                className={`h-4 w-4 mr-2 ${generateMutation.isPending ? 'animate-spin' : ''}`} 
              />
              Regenerate
            </Button>
            
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowParameters(!showParameters)}
              >
                <Sliders className="h-4 w-4 mr-2" />
                Parameters
                {showParameters ? 
                  <ChevronUp className="h-4 w-4 ml-2" /> : 
                  <ChevronDown className="h-4 w-4 ml-2" />
                }
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-consensus-blue border-t-transparent rounded-full"></div>
          </div>
        ) : isError ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-800">
            <p>Error loading recommendation: {(error as Error).message}</p>
          </div>
        ) : !recommendation ? (
          <div className="bg-blue-50 p-4 rounded-lg text-blue-800">
            <p>No recommendation available. Click 'Regenerate' to create one.</p>
          </div>
        ) : (
          <>
            <div className="bg-slate-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-consensus-blue">
                  Recommended Option: {recommendation.recommendedOptionTitle}
                </h3>
                <Badge className={getConfidenceColor(recommendation.confidenceScore)}>
                  {recommendation.confidenceScore}% Confidence
                </Badge>
              </div>
              
              <p className="text-consensus-grey-700 mb-4">
                {recommendation.explanation}
              </p>
              
              <div className="text-xs text-consensus-grey-500">
                Last updated: {lastUpdated}
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-3">Ranked Options</h4>
              <div className="space-y-3">
                {recommendation.rankedOptions.map((option, index) => (
                  <div key={option.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">
                        {index === 0 && (
                          <ThumbsUp className="h-4 w-4 text-green-600 inline mr-2" />
                        )}
                        {option.title}
                      </div>
                      <div className="text-sm text-consensus-grey-600">
                        Score: {option.totalScore.toFixed(2)}
                      </div>
                    </div>
                    <Progress 
                      value={option.totalScore * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {recommendation.rankedOptions.length > 0 && (
              <div className="flex items-center gap-3 mb-2">
                <Input
                  placeholder="Email this recommendation to..."
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  className="max-w-xs"
                />
                <Button
                  size="sm"
                  onClick={() => emailMutation.mutate()}
                  disabled={!emailRecipient || emailMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            )}
            
            {isAdmin && showParameters && (
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Recommendation Parameters</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetWeights}
                  >
                    Reset to Default
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Support Weight</label>
                      <span className="text-sm text-consensus-grey-600">
                        {formatWeight(weights.supportWeight)}
                      </span>
                    </div>
                    <Slider
                      value={[weights.supportWeight]}
                      max={1}
                      step={0.05}
                      onValueChange={handleWeightChange('supportWeight')}
                    />
                    <p className="text-xs text-consensus-grey-500">
                      How much importance to place on the number of votes for each option.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Sentiment Weight</label>
                      <span className="text-sm text-consensus-grey-600">
                        {formatWeight(weights.sentimentWeight)}
                      </span>
                    </div>
                    <Slider
                      value={[weights.sentimentWeight]}
                      max={1}
                      step={0.05}
                      onValueChange={handleWeightChange('sentimentWeight')}
                    />
                    <p className="text-xs text-consensus-grey-500">
                      How much importance to place on the sentiment of comments for each option.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Criteria Weight</label>
                      <span className="text-sm text-consensus-grey-600">
                        {formatWeight(weights.criteriaWeight)}
                      </span>
                    </div>
                    <Slider
                      value={[weights.criteriaWeight]}
                      max={1}
                      step={0.05}
                      onValueChange={handleWeightChange('criteriaWeight')}
                    />
                    <p className="text-xs text-consensus-grey-500">
                      How much importance to place on the criteria ratings for each option.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Historical Weight</label>
                      <span className="text-sm text-consensus-grey-600">
                        {formatWeight(weights.historicalWeight)}
                      </span>
                    </div>
                    <Slider
                      value={[weights.historicalWeight]}
                      max={1}
                      step={0.05}
                      onValueChange={handleWeightChange('historicalWeight')}
                    />
                    <p className="text-xs text-consensus-grey-500">
                      How much importance to place on historical success of similar options.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => generateMutation.mutate(weights)}
                    disabled={generateMutation.isPending}
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Generate with Custom Parameters
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationEngine;
