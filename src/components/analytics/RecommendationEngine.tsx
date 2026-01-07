import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Bot, Brain, RefreshCw, ThumbsUp, Sliders, ChevronDown, ChevronUp, Send } from 'lucide-react';
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
  recommendation?: Recommendation;
  optionScores?: RankedOption[];
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
        .single();

      if (error) throw error;
      return data as RecommendationResponse;
    },
    enabled: !!actualProposalId,
  });

  const getAnalysisData = (): AnalysisData | undefined => {
    if (!recommendationData?.analysis_data) return undefined;

    const analysisData = recommendationData.analysis_data;
    if (typeof analysisData === 'object' && analysisData !== null) {
      return analysisData as unknown as AnalysisData;
    }

    return undefined;
  };

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

      const recommendationData = await response.json();

      const { error: updateError } = await supabase
        .from('proposal_analysis')
        .upsert({
          proposal_id: actualProposalId,
          analysis_data: { recommendation: recommendationData },
          updated_at: new Date().toISOString(),
        }, { onConflict: 'proposal_id' });

      if (updateError) {
        throw updateError;
      }

      return recommendationData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recommendation', actualProposalId] });
      toast({
        title: 'Recommendation Generated',
        description: 'The AI recommendation has been updated with the latest data.',
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
    if (score >= 80) return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (score >= 60) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (score >= 40) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    return 'bg-red-500/20 text-red-300 border-red-500/30';
  };

  return (
    <div className="w-full glass-panel p-6 rounded-2xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-bold text-white">
            <div className="p-2 rounded-lg bg-consensus-blue/20 text-consensus-blue">
              <Brain className="h-5 w-5" />
            </div>
            AI Recommendation Engine
          </h3>
          <p className="text-consensus-grey-400 mt-1 ml-11">
            Machine learning analysis of all contributions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateMutation.mutate(weights)}
            disabled={generateMutation.isPending || !actualProposalId}
            className="border-white/10 text-consensus-grey-300 hover:text-white hover:bg-white/5 bg-transparent"
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
              className="text-consensus-grey-300 hover:text-white hover:bg-white/5"
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

      <div className="mt-2">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-12 text-consensus-grey-400">
            <div className="animate-spin h-10 w-10 border-4 border-consensus-blue border-t-transparent rounded-full mb-4"></div>
            <p>Analyzing decision data...</p>
          </div>
        ) : isError ? (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl text-red-200">
            <p className="flex items-center gap-2">
              <span className="font-semibold">Error loading recommendation:</span> {(error as Error).message}
            </p>
          </div>
        ) : !recommendation ? (
          <div className="bg-consensus-blue/10 border border-consensus-blue/20 p-8 rounded-xl text-center">
            <Bot className="h-12 w-12 text-consensus-blue mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium text-blue-200 mb-2">No Recommendation Yet</h4>
            <p className="text-consensus-grey-400 mb-6 max-w-md mx-auto">
              Generate an AI recommendation to see actionable insights based on team contributions.
            </p>
            <Button
              onClick={() => generateMutation.mutate(weights)}
              className="bg-consensus-blue hover:bg-consensus-blue/90 text-white"
            >
              Generate Recommendation
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-consensus-dark-800 to-consensus-dark-900 border border-white/5 p-6 rounded-xl mb-6 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-consensus-blue/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    <ThumbsUp className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs text-consensus-grey-400 uppercase tracking-wider font-semibold">Recommended Option</span>
                    <h3 className="text-xl font-bold text-white mt-0.5">
                      {recommendation.recommendedOptionTitle}
                    </h3>
                  </div>
                </div>
                <Badge className={`mt-3 md:mt-0 border ${getConfidenceColor(recommendation.confidenceScore)}`}>
                  {recommendation.confidenceScore}% Confidence
                </Badge>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-white/5 mb-4 backdrop-blur-sm relative z-10">
                <p className="text-gray-300 leading-relaxed">
                  {recommendation.explanation}
                </p>
              </div>

              <div className="text-xs text-consensus-grey-500 flex items-center justify-end">
                <span className="w-2 h-2 rounded-full bg-consensus-green mr-2 animate-pulse"></span>
                Last updated: {lastUpdated}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-consensus-teal"></span>
                  Ranked Options Analysis
                </h4>
                <div className="space-y-3">
                  {recommendation.rankedOptions.map((option, index) => (
                    <div key={option.id} className="bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors group">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium text-gray-200 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-black/30 text-consensus-grey-400 flex items-center justify-center text-xs mr-3 font-mono border border-white/5 group-hover:border-consensus-blue/30 group-hover:text-consensus-blue transition-colors">
                            {index + 1}
                          </span>
                          {option.title}
                        </div>
                        <div className="text-sm font-mono text-consensus-blue">
                          {option.totalScore.toFixed(1)}<span className="text-consensus-grey-500 text-xs ml-1">/ 100</span>
                        </div>
                      </div>
                      <div className="relative h-2 w-full bg-black/40 rounded-full overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-gradient-to-r from-consensus-green to-consensus-teal' : 'bg-consensus-blue/60'}`}
                          style={{ width: `${option.totalScore}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-consensus-grey-500">
                        <span>Support: {(option.supportScore * 100).toFixed(0)}%</span>
                        <span>Sentiment: {(option.sentimentScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-xl p-5 h-fit">
                <h4 className="font-medium text-white mb-4">Actions</h4>

                {recommendation.rankedOptions.length > 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-consensus-grey-400 mb-2 block">Share Recommendation</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Email address..."
                          value={emailRecipient}
                          onChange={(e) => setEmailRecipient(e.target.value)}
                          className="bg-black/30 border-white/10 text-sm text-white focus:border-consensus-blue/50"
                        />
                        <Button
                          size="icon"
                          onClick={() => emailMutation.mutate()}
                          disabled={!emailRecipient || emailMutation.isPending}
                          className="bg-consensus-blue hover:bg-consensus-blue/90 shrink-0"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <p className="text-xs text-consensus-grey-500 mb-3">
                        This analysis incorporates support votes, sentiment analysis, and criteria weighting.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isAdmin && showParameters && (
              <div className="mt-8 bg-black/20 border border-white/5 rounded-xl p-6 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-medium text-white">Analysis Parameters</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetWeights}
                    className="text-consensus-grey-400 hover:text-white hover:bg-white/5 h-8 text-xs"
                  >
                    Reset to Default
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-300">Support Weight</label>
                        <span className="text-xs font-mono bg-consensus-blue/20 text-consensus-blue px-2 py-0.5 rounded border border-consensus-blue/30">
                          {formatWeight(weights.supportWeight)}
                        </span>
                      </div>
                      <Slider
                        value={[weights.supportWeight]}
                        max={1}
                        step={0.05}
                        onValueChange={handleWeightChange('supportWeight')}
                        className="py-1"
                      />
                      <p className="text-xs text-consensus-grey-500">
                        Importance of raw vote count.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-300">Sentiment Weight</label>
                        <span className="text-xs font-mono bg-consensus-blue/20 text-consensus-blue px-2 py-0.5 rounded border border-consensus-blue/30">
                          {formatWeight(weights.sentimentWeight)}
                        </span>
                      </div>
                      <Slider
                        value={[weights.sentimentWeight]}
                        max={1}
                        step={0.05}
                        onValueChange={handleWeightChange('sentimentWeight')}
                        className="py-1"
                      />
                      <p className="text-xs text-consensus-grey-500">
                        Importance of qualitative feedback tone.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-300">Criteria Weight</label>
                        <span className="text-xs font-mono bg-consensus-blue/20 text-consensus-blue px-2 py-0.5 rounded border border-consensus-blue/30">
                          {formatWeight(weights.criteriaWeight)}
                        </span>
                      </div>
                      <Slider
                        value={[weights.criteriaWeight]}
                        max={1}
                        step={0.05}
                        onValueChange={handleWeightChange('criteriaWeight')}
                        className="py-1"
                      />
                      <p className="text-xs text-consensus-grey-500">
                        Importance of structured criteria ratings.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-300">Historical Weight</label>
                        <span className="text-xs font-mono bg-consensus-blue/20 text-consensus-blue px-2 py-0.5 rounded border border-consensus-blue/30">
                          {formatWeight(weights.historicalWeight)}
                        </span>
                      </div>
                      <Slider
                        value={[weights.historicalWeight]}
                        max={1}
                        step={0.05}
                        onValueChange={handleWeightChange('historicalWeight')}
                        className="py-1"
                      />
                      <p className="text-xs text-consensus-grey-500">
                        Relevance of past successful decisions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => generateMutation.mutate(weights)}
                    disabled={generateMutation.isPending}
                    className="bg-consensus-blue hover:bg-consensus-blue/90 text-white"
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Apply New Parameters
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecommendationEngine;
