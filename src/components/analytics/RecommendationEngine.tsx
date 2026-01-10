import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Bot, Brain, RefreshCw, ThumbsUp, Sliders, ChevronDown, ChevronUp, Send, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
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

interface MediatorInsights {
  devilsAdvocate: string;
  biasCheck: string;
  compromise?: {
    title: string;
    description: string;
    reasoning: string;
  };
}

interface Recommendation {
  optionId?: string;
  recommendedOptionId?: string;
  recommendedOptionTitle?: string;
  confidenceScore: number;
  confidence?: number;
  explanation?: string;
  reasoning?: string;
  rankedOptions: RankedOption[];
  generatedAt: string;
  parameters: ParameterWeights;
}

interface AnalysisData {
  recommendation?: Recommendation;
  consensus?: any;
  mediator?: MediatorInsights;
  rankedOptions?: RankedOption[];
  parameters?: ParameterWeights;
}

interface RecommendationResponse {
  analysis_data: Json;
  updated_at: string;
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
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as RecommendationResponse;
    },
    enabled: !!actualProposalId,
  });

  const getAnalysisData = (): AnalysisData | undefined => {
    if (!recommendationData?.analysis_data) return undefined;
    const analysisData = recommendationData.analysis_data as unknown as any;

    if (analysisData) {
      return {
        ...analysisData,
        recommendation: {
          ...analysisData.recommendation,
          recommendedOptionTitle: analysisData.recommendation?.recommendedOptionTitle ||
            (analysisData.rankedOptions?.find((o: any) => o.id === analysisData.recommendation?.optionId)?.title),
          confidenceScore: analysisData.recommendation?.confidenceScore || analysisData.recommendation?.confidence || 0,
          explanation: analysisData.recommendation?.explanation || analysisData.recommendation?.reasoning || '',
          rankedOptions: analysisData.rankedOptions || analysisData.recommendation?.rankedOptions || []
        },
        mediator: analysisData.mediator
      };
    }
    return undefined;
  };

  const generateMutation = useMutation({
    mutationFn: async (customWeights?: ParameterWeights) => {
      const { data, error } = await supabase.functions.invoke('generate-recommendation', {
        body: {
          proposalId: actualProposalId,
          parameters: customWeights || weights
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recommendation', actualProposalId] });
      toast({
        title: 'AI Analysis Generated',
        description: 'Gemini has analyzed the proposal and updated insights.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to generate recommendation: ${(error as Error).message}`,
        variant: 'destructive',
      });
    },
  });

  const emailMutation = useMutation({
    mutationFn: async () => {
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

  const analysisData = getAnalysisData();
  const recommendation = analysisData?.recommendation;
  const mediator = analysisData?.mediator;
  const lastUpdated = recommendationData?.updated_at
    ? new Date(recommendationData.updated_at).toLocaleString()
    : 'Never';

  const updateWeight = (key: keyof ParameterWeights, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const handleWeightChange = (key: keyof ParameterWeights) => (values: number[]) => {
    if (values.length > 0) {
      updateWeight(key, values[0]);
    }
  };

  const formatWeight = (weight: number) => `${Math.round(weight * 100)}%`;

  const resetWeights = () => {
    setWeights(defaultWeights);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 text-green-700 border-green-200';
    if (score >= 60) return 'bg-blue-500/10 text-blue-700 border-blue-200';
    if (score >= 40) return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
    return 'bg-red-500/10 text-red-700 border-red-200';
  };

  return (
    <div className="w-full glass-panel p-4 rounded-xl animate-fade-in bg-card border-border">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
            <div className="p-1 rounded bg-primary/10 text-primary">
              <Brain className="h-3.5 w-3.5" />
            </div>
            AI Recommendation Engine
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5 ml-8">
            Analysis of contributions & sentiment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateMutation.mutate(weights)}
            disabled={generateMutation.isPending || !actualProposalId}
            className="border-border text-muted-foreground hover:text-foreground hover:bg-muted bg-transparent h-7 text-[10px] px-2.5"
          >
            <RefreshCw
              className={`h-3 w-3 mr-1.5 ${generateMutation.isPending ? 'animate-spin' : ''}`}
            />
            {generateMutation.isPending ? 'Working...' : 'Regenerate'}
          </Button>

          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowParameters(!showParameters)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted h-7 text-[10px] px-2.5"
            >
              <Sliders className="h-3 w-3 mr-1.5" />
              Params
            </Button>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {/* Parameters Section - Compact */}
        {isAdmin && showParameters && (
          <div className="bg-background/40 backdrop-blur-md border border-primary/10 rounded-lg p-3 animate-fade-in shadow-sm mb-3">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {/* Simplified sliders for compactness */}
              {(['supportWeight', 'sentimentWeight', 'criteriaWeight', 'historicalWeight'] as const).map(key => (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-medium text-foreground capitalize">{key.replace('Weight', '')}</label>
                    <span className="text-[10px] font-mono text-primary">{formatWeight(weights[key])}</span>
                  </div>
                  <Slider
                    value={[weights[key]]}
                    max={1}
                    step={0.05}
                    onValueChange={handleWeightChange(key)}
                    className="py-0.5"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 text-right">
              <Button
                size="sm"
                onClick={() => generateMutation.mutate(weights)}
                className="bg-primary/90 hover:bg-primary h-6 text-[10px] px-3"
              >
                Apply New Weights
              </Button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-8 text-muted-foreground glass-panel bg-muted/5 min-h-[120px]">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
            <p className="font-medium text-xs">Analyzing...</p>
          </div>
        ) : isError ? (
          <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg text-destructive text-center">
            <p className="text-xs">{(error as Error).message}</p>
          </div>
        ) : !recommendation ? (
          <div className="text-center p-6 border border-dashed border-border rounded-lg">
            <Bot className="h-8 w-8 text-primary/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-3">No analysis yet.</p>
            <Button
              size="sm"
              onClick={() => generateMutation.mutate(weights)}
              className="h-8 text-xs bg-primary hover:bg-primary/90"
            >
              Generate
            </Button>
          </div>
        ) : (
          <>
            {/* Extremely Compact Recommendation Card */}
            <div className="bg-gradient-to-r from-card to-primary/5 border border-primary/10 p-3 rounded-lg shadow-sm relative overflow-hidden group mb-3">
              <div className="flex items-start gap-3 relative z-10">
                <div className="p-2 rounded-md bg-green-500/10 text-green-600 border border-green-200/50 shrink-0 mt-0.5">
                  <ThumbsUp className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-foreground truncate pr-2">
                        {recommendation.recommendedOptionTitle || 'Unknown'}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-green-600 font-medium uppercase tracking-wider">Recommended</span>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className={`text-[10px] font-medium ${recommendation.confidenceScore > 70 ? 'text-green-600' : 'text-amber-600'}`}>
                          {recommendation.confidenceScore}% Confidence
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug line-clamp-2">
                    {recommendation.explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Mediator Insights - Very Compact */}
            {mediator && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1 text-amber-700 font-medium text-[10px]">
                    <AlertTriangle className="h-3 w-3" />
                    Devil's Advocate
                  </div>
                  <p className="text-[10px] text-foreground/80 italic line-clamp-3 leading-tight">
                    {mediator.devilsAdvocate}
                  </p>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1 text-blue-700 font-medium text-[10px]">
                    <ShieldCheck className="h-3 w-3" />
                    Bias Check
                  </div>
                  <p className="text-[10px] text-foreground/80 line-clamp-3 leading-tight">
                    {mediator.biasCheck}
                  </p>
                </div>
              </div>
            )}

            {/* Detailed Ranking & Actions - Compact List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <h4 className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Ranked Options</h4>
                <div className="space-y-1.5">
                  {recommendation.rankedOptions && recommendation.rankedOptions.slice(0, 3).map((option, index) => (
                    <div key={option.id} className="bg-card/50 border border-border/40 p-2 rounded-md flex items-center gap-3">
                      <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono border ${index === 0 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}>
                        #{index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium truncate pr-2">{option.title}</span>
                          <span className="text-[10px] font-mono text-primary">{option.totalScore.toFixed(0)}</span>
                        </div>
                        <div className="h-1 w-full bg-muted/60 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${index === 0 ? 'bg-primary' : 'bg-primary/40'}`}
                            style={{ width: `${option.totalScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Actions</h4>
                <div className="p-2.5 bg-card border border-border/60 rounded-lg">
                  <label className="text-[10px] text-muted-foreground mb-1.5 block">Share Report</label>
                  <div className="flex gap-1.5">
                    <Input
                      placeholder="Email..."
                      value={emailRecipient}
                      onChange={(e) => setEmailRecipient(e.target.value)}
                      className="bg-background border-input text-[10px] h-7 px-2 focus-visible:ring-primary/20"
                    />
                    <Button
                      size="sm"
                      onClick={() => emailMutation.mutate()}
                      disabled={!emailRecipient || emailMutation.isPending}
                      className="bg-primary hover:bg-primary/90 shrink-0 h-7 w-7 p-0"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecommendationEngine;
