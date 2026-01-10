import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Scale, RefreshCw, AlertTriangle, CheckCircle2, Sparkles, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";

interface ConsensusBuilderProps {
  proposalId?: string;
}

interface RankedOption {
  id: string;
  title: string;
  description?: string;
  supportScore: number;
  sentimentScore: number;
  criteriaScores: Record<string, number>;
  weightedCriteriaScore: number;
  totalScore: number;
}

interface ConsensusData {
  score: number;
  analysis: string;
  broadSupportIds: string[];
  contentiousOptionIds: string[];
  suggestedCompromises: Array<{
    title: string;
    description: string;
    reasoning: string;
    targetIssue: string;
    estimatedApproval: number;
    reductionInDisagreement?: number;
  }>;
  proposedNewOptions: Array<{
    title: string;
    description: string;
    baseOptions: string[];
    estimatedApproval: number;
  }>;
}

interface AnalysisData {
  consensus?: ConsensusData;
  recommendation?: any;
  rankedOptions?: RankedOption[];
  mediator?: any;
}

interface AnalysisResponse {
  analysis_data: Json;
  updated_at: string;
}

const ConsensusBuilder = ({ proposalId }: ConsensusBuilderProps) => {
  const params = useParams();
  const actualProposalId = proposalId || params.proposalId;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('consensus');

  // Fetch the current consensus data from the database
  const {
    data: consensusData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['consensus', actualProposalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_analysis')
        .select('analysis_data, updated_at')
        .eq('proposal_id', actualProposalId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      // Return the consensus data if it exists, otherwise return null
      return data?.analysis_data ? data as AnalysisResponse : null;
    },
    enabled: !!actualProposalId,
  });

  // Safely access the consensus data with proper type assertions
  const getAnalysisData = (): AnalysisData | undefined => {
    if (!consensusData?.analysis_data) return undefined;
    const analysisData = consensusData.analysis_data as unknown as any;

    if (analysisData) {
      return {
        consensus: analysisData.consensus,
        recommendation: analysisData.recommendation,
        rankedOptions: analysisData.rankedOptions || [],
        mediator: analysisData.mediator
      };
    }
    return undefined;
  };

  const analysisData = getAnalysisData();
  const consensus = analysisData?.consensus || null;
  const rankedOptions = analysisData?.rankedOptions || [];

  // Helper to map IDs to Option Objects for display
  const getOptionsByIds = (ids: string[] = []) => {
    return ids.map(id => rankedOptions.find(opt => opt.id === id)).filter(Boolean) as RankedOption[];
  };

  const broadSupportOptions = getOptionsByIds(consensus?.broadSupportIds);
  const contentiousOptions = getOptionsByIds(consensus?.contentiousOptionIds);

  const lastUpdated = consensusData?.updated_at
    ? new Date(consensusData.updated_at).toLocaleString()
    : 'Never';

  // Mutation to generate consensus analysis
  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-recommendation', {
        body: { proposalId: actualProposalId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consensus', actualProposalId] });
      toast({
        title: 'Consensus Analysis Generated',
        description: 'The AI consensus-building analysis has been updated with the latest data.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to generate consensus analysis: ${(error as Error).message}`,
        variant: 'destructive',
      });
    }
  });

  // Render loading state
  if (isLoading) {
    return (
      <div className="w-full glass-panel p-4 rounded-xl animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h3 className="text-base font-bold text-foreground">AI Consensus Builder</h3>
        </div>
        <p className="text-[10px] text-muted-foreground mb-4 ml-6">Analyzing contributions...</p>
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="w-full glass-panel p-4 rounded-xl border-red-200">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h3 className="text-base font-bold text-foreground">AI Consensus Builder</h3>
        </div>
        <div className="bg-red-50 border border-red-200 p-3 rounded-md text-red-600 mt-2 text-xs">
          <p className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            {(error as Error).message}
          </p>
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          className="mt-3 h-7 text-xs"
          size="sm"
          disabled={generateMutation.isPending}
        >
          <RefreshCw className={`h-3 w-3 mr-1.5 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
          Retry
        </Button>
      </div>
    );
  }

  // If no consensus data exists yet, render a button to generate it
  if (!consensus) {
    return (
      <div className="w-full glass-panel p-6 rounded-xl flex flex-col items-center text-center">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">Build Consensus</h3>
        <p className="text-xs text-muted-foreground max-w-xs mb-4">
          Generate suggestions to find common ground.
        </p>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm shadow-sm"
        >
          {generateMutation.isPending ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              Generate
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full glass-panel p-4 rounded-xl animate-fade-in bg-card border-border">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
            <div className="p-1 rounded bg-primary/10 text-primary">
              <Lightbulb className="h-3.5 w-3.5" />
            </div>
            AI Consensus Builder
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5 ml-7">
            AI-driven tools to help build consensus
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="border-border text-muted-foreground hover:text-foreground hover:bg-muted bg-transparent h-7 text-[10px] px-2.5"
        >
          <RefreshCw
            className={`h-3 w-3 mr-1.5 ${generateMutation.isPending ? 'animate-spin' : ''}`}
          />
          {generateMutation.isPending ? 'Analyzing...' : 'Regenerate'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4 bg-muted/40 p-0.5 rounded-lg border border-border/50 h-auto">
          <TabsTrigger
            value="consensus"
            className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground rounded py-1.5 text-[10px] transition-all"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="compromises"
            className="data-[state=active]:bg-background data-[state=active]:text-amber-600 data-[state=active]:shadow-sm text-muted-foreground rounded py-1.5 text-[10px] transition-all"
          >
            Compromises
          </TabsTrigger>
          <TabsTrigger
            value="new-options"
            className="data-[state=active]:bg-background data-[state=active]:text-purple-600 data-[state=active]:shadow-sm text-muted-foreground rounded py-1.5 text-[10px] transition-all"
          >
            <Sparkles className="w-3 h-3 mr-1.5" />
            Magic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consensus" className="mt-0 focus-visible:outline-none">
          <div className="space-y-4">
            {/* Broad Support Options */}
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                Areas of Agreement
              </h3>

              {broadSupportOptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {broadSupportOptions.map((option) => (
                    <div key={option.id} className="bg-green-500/5 hover:bg-green-500/10 p-3 rounded-lg border border-green-200/50 backdrop-blur-sm transition-colors cursor-default">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-foreground text-xs leading-tight truncate pr-2">{option.title}</h4>
                        <Badge className="bg-green-100/50 text-green-700 border-green-200 shrink-0 text-[9px] px-1.5 py-0">
                          {(option.supportScore * 100).toFixed(0)}%
                        </Badge>
                      </div>

                      <div>
                        <div className="flex justify-between text-[9px] mb-1">
                          <span className="text-green-700 font-medium">Consensus Strength</span>
                        </div>
                        <Progress
                          value={option.supportScore * 100}
                          className="h-1 bg-green-200/50"
                          indicatorClassName="bg-green-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-muted-foreground italic bg-muted/30 p-4 rounded-lg border border-dashed border-border text-center">
                  No options have broad support yet.
                </div>
              )}
            </div>

            {/* Contentious Options */}
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center">
                <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                Contentious Topics
              </h3>

              {contentiousOptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {contentiousOptions.map((option) => (
                    <div key={option.id} className="bg-amber-500/5 hover:bg-amber-500/10 p-3 rounded-lg border border-amber-200/50 backdrop-blur-sm transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-foreground text-xs leading-tight truncate pr-2">{option.title}</h4>
                        <Badge className="bg-amber-100/50 text-amber-700 border-amber-200 shrink-0 text-[10px] px-1.5 py-0">
                          {(option.supportScore * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <Progress
                        value={option.supportScore * 100}
                        className="h-1 bg-amber-200/50"
                        indicatorClassName="bg-amber-500"
                      />
                      <div className="mt-2 text-[9px] text-amber-700/80 flex items-center bg-amber-500/10 p-1.5 rounded">
                        <Scale className="h-3 w-3 mr-1.5 shrink-0" />
                        High split in voting.
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-muted-foreground italic bg-muted/30 p-4 rounded-lg border border-dashed border-border text-center">
                  No highly contentious options identified.
                </div>
              )}
            </div>

            <div className="border-t border-border pt-2 flex justify-end">
              <span className="text-[9px] text-muted-foreground">Analysis based on latest voting data</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="compromises" className="mt-0 focus-visible:outline-none">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-foreground flex items-center">
                <Lightbulb className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                Smart Compromises
              </h3>
              <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">AI Generated</span>
            </div>


            {consensus.suggestedCompromises && consensus.suggestedCompromises.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-2">
                {consensus.suggestedCompromises.map((compromise, index) => (
                  <AccordionItem
                    key={index}
                    value={`compromise-${index}`}
                    className="bg-card border border-border/60 rounded-lg px-0 shadow-sm data-[state=open]:ring-1 data-[state=open]:ring-primary/20 transition-all"
                  >
                    <AccordionTrigger className="py-2.5 hover:no-underline px-3 text-foreground hover:bg-muted/30 rounded-t-lg group">
                      <div className="flex justify-between items-center w-full pr-2">
                        <div className="flex items-center gap-2 text-left w-full overflow-hidden">
                          <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-[10px] border border-blue-200">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="font-medium text-xs truncate group-hover:text-primary transition-colors flex-1">{compromise.title}</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 ml-2 shrink-0 text-[9px] px-1.5 h-5">
                          {compromise.estimatedApproval ? compromise.estimatedApproval.toFixed(0) : 0}% Appr.
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-1">
                      <div className="pl-8">
                        <div className="bg-muted/30 p-2.5 rounded-md mb-3 border border-border/50 text-foreground/90 text-[10px] leading-relaxed">
                          {compromise.description}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <div className="flex items-center bg-amber-50/50 px-2 py-1 rounded border border-amber-100/50">
                            <span className="text-[9px] font-semibold text-amber-800 uppercase tracking-wide mr-1.5">Solves:</span>
                            <span className="text-[9px] text-foreground/80 truncate max-w-[120px]">
                              {compromise.targetIssue}
                            </span>
                          </div>

                          <div className="flex items-center bg-green-50/50 px-2 py-1 rounded border border-green-100/50">
                            <span className="text-[9px] font-semibold text-green-800 uppercase tracking-wide mr-1.5">Impact:</span>
                            <span className="text-[9px] text-foreground/80">
                              -{compromise.reductionInDisagreement}% Disagreement
                            </span>
                          </div>
                        </div>

                        <Button size="sm" className="w-full h-7 text-[10px] bg-foreground text-background hover:bg-foreground/90">
                          <Scale className="h-3 w-3 mr-1.5" />
                          Formalize as New Option
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-[10px] text-muted-foreground italic bg-muted/30 p-6 rounded-lg border border-dashed border-border text-center">
                card
                No obvious compromises found.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="new-options" className="mt-0 focus-visible:outline-none">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-semibold text-foreground flex items-center">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-purple-600" />
                Synthesized Options
              </h3>
              <span className="text-[9px] text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded font-medium">Experimental</span>
            </div>

            <p className="text-[10px] text-muted-foreground mb-3">
              New solutions generated by combining features.
            </p>

            {consensus.proposedNewOptions && consensus.proposedNewOptions.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {consensus.proposedNewOptions.map((option, index) => (
                  <div key={index} className="bg-gradient-to-br from-purple-50 via-white to-white border border-purple-100 p-3 rounded-lg shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    {/* Magical glow effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-purple-300/30 transition-colors duration-700"></div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2">
                          <div className="h-8 w-8 bg-gradient-to-br from-purple-100 to-purple-50 rounded-md flex items-center justify-center border border-purple-200 text-purple-600 shadow-sm shrink-0">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-purple-950 leading-tight">{option.title}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50/50 text-[9px] h-4 px-1.5">
                                {option.estimatedApproval ? option.estimatedApproval.toFixed(0) : 0}% Approx. Support
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-foreground/80 mb-3 leading-relaxed text-[10px] line-clamp-3">
                        {option.description}
                      </p>

                      <div className="bg-purple-50/80 p-2 rounded border border-purple-100/60 mb-3">
                        <div className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-1.5 flex items-center">
                          <RefreshCw className="h-2.5 w-2.5 mr-1" />
                          Source DNA
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {option.baseOptions && option.baseOptions.map((baseId) => {
                            const baseOption = rankedOptions.find(opt => opt.id === baseId);
                            return baseOption ? (
                              <Badge key={baseId} variant="secondary" className="bg-white/80 border-purple-100 text-purple-800 hover:bg-white shadow-sm text-[9px] h-5 px-1.5">
                                {baseOption.title}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-purple-500/20 h-8 text-[10px]">
                        Add to Proposal
                        <ArrowRight className="h-3 w-3 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-muted-foreground italic bg-muted/30 p-6 rounded-lg border border-dashed border-border text-center">
                <Sparkles className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                No synthesized options generated.
              </div>
            )}

            <div className="border-t border-border pt-2 flex justify-between items-center text-[9px] text-muted-foreground">
              <span>Model: Gemini Pro</span>
              <span>Updated: {lastUpdated}</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsensusBuilder;
