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
import { generateConsensusAnalysis } from '@/utils/consensusBuilder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";

interface ConsensusBuilderProps {
  proposalId?: string;
}

interface ConsensusData {
  broadSupportOptions: Array<{
    id: string;
    title: string;
    description?: string;
    supportPercentage: number;
    isContentious: boolean;
    criteriaScores: Record<string, number>;
  }>;
  contentiousOptions: Array<{
    id: string;
    title: string;
    description?: string;
    supportPercentage: number;
    isContentious: boolean;
    criteriaScores: Record<string, number>;
  }>;
  suggestedCompromises: Array<{
    title: string;
    description: string;
    baseOptionId: string;
    targetIssue: string;
    estimatedApproval: number;
    reductionInDisagreement: number;
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
        .single();

      if (error) throw error;

      // Return the consensus data if it exists, otherwise return null
      return data?.analysis_data ? data as AnalysisResponse : null;
    },
    enabled: !!actualProposalId,
  });

  // Safely access the consensus data with proper type assertions
  const getAnalysisData = (): AnalysisData | undefined => {
    if (!consensusData?.analysis_data) return undefined;

    // Handle different types the Json can be
    const analysisData = consensusData.analysis_data;
    if (typeof analysisData === 'object' && analysisData !== null) {
      // Cast to AnalysisData to ensure TypeScript knows the structure
      return analysisData as unknown as AnalysisData;
    }

    return undefined;
  };

  // Get analysis data and consensus data using the helper function
  const analysisData = getAnalysisData();
  // Use optional chaining to safely access consensus, defaulting to null if not found
  const consensus = analysisData?.consensus || null;

  const lastUpdated = consensusData?.updated_at
    ? new Date(consensusData.updated_at).toLocaleString()
    : 'Never';

  // Mutation to generate consensus analysis
  const generateMutation = useMutation({
    mutationFn: async () => {
      // Generate consensus analysis
      const consensusResult = await generateConsensusAnalysis(actualProposalId as string);

      if (!consensusResult) {
        throw new Error('Failed to generate consensus analysis');
      }

      // Get existing analysis data
      const { data: existingAnalysis, error: fetchError } = await supabase
        .from('proposal_analysis')
        .select('analysis_data')
        .eq('proposal_id', actualProposalId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "row not found" error
        throw fetchError;
      }

      // Prepare the merged data object
      let mergedData: Record<string, unknown> = {};

      // Handle existing data (if any)
      if (existingAnalysis && existingAnalysis.analysis_data) {
        if (typeof existingAnalysis.analysis_data === 'object' && existingAnalysis.analysis_data !== null && !Array.isArray(existingAnalysis.analysis_data)) {
          // If it's a non-null object (and not an array), spread its properties
          mergedData = { ...existingAnalysis.analysis_data as Record<string, unknown> };
        }
      }

      // Add the consensus result
      mergedData.consensus = consensusResult;

      // Save to database
      const { error: saveError } = await supabase
        .from('proposal_analysis')
        .upsert({
          proposal_id: actualProposalId,
          analysis_data: mergedData as unknown as Json,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'proposal_id' });

      if (saveError) {
        throw saveError;
      }

      return consensusResult;
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
      <div className="w-full glass-panel p-6 rounded-2xl animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-5 w-5 text-consensus-blue" />
          <h3 className="text-xl font-bold text-white">AI Consensus Builder</h3>
        </div>
        <p className="text-consensus-grey-400 mb-8 ml-7">Analyzing contributions to build consensus</p>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-10 w-10 border-4 border-consensus-blue border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="w-full glass-panel p-6 rounded-2xl border-red-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-5 w-5 text-consensus-blue" />
          <h3 className="text-xl font-bold text-white">AI Consensus Builder</h3>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl text-red-200 mt-6">
          <p className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {(error as Error).message}
          </p>
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          className="mt-6 bg-consensus-blue hover:bg-consensus-blue/90"
          disabled={generateMutation.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
          Retry Analysis
        </Button>
      </div>
    );
  }

  // If no consensus data exists yet, render a button to generate it
  if (!consensus) {
    return (
      <div className="w-full glass-panel p-8 rounded-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-consensus-blue/10 rounded-full flex items-center justify-center mb-6">
          <Lightbulb className="h-8 w-8 text-consensus-blue" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Build Consensus with AI</h3>
        <p className="text-consensus-grey-400 max-w-md mb-8">
          Generate AI-driven suggestions to find common ground, identify friction points, and discover new compromise options.
        </p>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="bg-consensus-blue hover:bg-consensus-blue/90 text-white px-8 py-6 rounded-xl text-lg shadow-lg shadow-consensus-blue/20"
        >
          {generateMutation.isPending ? (
            <>
              <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
              Analyzing Data...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-3" />
              Generate Analysis
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full glass-panel p-6 rounded-2xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-bold text-white">
            <div className="p-2 rounded-lg bg-consensus-blue/20 text-consensus-blue">
              <Lightbulb className="h-5 w-5" />
            </div>
            AI Consensus Builder
          </h3>
          <p className="text-consensus-grey-400 mt-1 ml-11">
            AI-driven tools to help build consensus
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="border-white/10 text-consensus-grey-300 hover:text-white hover:bg-white/5 bg-transparent"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${generateMutation.isPending ? 'animate-spin' : ''}`}
          />
          Regenerate
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 bg-black/40 p-1 rounded-xl border border-white/5">
          <TabsTrigger value="consensus" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-consensus-grey-400 rounded-lg">Consensus Overview</TabsTrigger>
          <TabsTrigger value="compromises" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-consensus-grey-400 rounded-lg">Compromise Suggestions</TabsTrigger>
          <TabsTrigger value="new-options" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-consensus-grey-400 rounded-lg">Proposed Options</TabsTrigger>
        </TabsList>

        <TabsContent value="consensus" className="mt-0">
          <div className="space-y-6">
            {/* Broad Support Options */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-400" />
                Options with Broad Support
              </h3>

              {consensus.broadSupportOptions.length > 0 ? (
                <div className="space-y-3">
                  {consensus.broadSupportOptions.map((option) => (
                    <div key={option.id} className="bg-green-500/10 p-5 rounded-xl border border-green-500/20 backdrop-blur-sm">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-green-100">{option.title}</h4>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30 border">
                          {option.supportPercentage.toFixed(0)}% Support
                        </Badge>
                      </div>
                      {option.description && (
                        <p className="text-sm text-green-200/70 mb-3">{option.description}</p>
                      )}
                      <Progress
                        value={option.supportPercentage}
                        className="h-1.5 bg-green-950/50"
                      // Note: Progress component needs to handle bar color via helper or class inside it usually, or standard theme. Assuming standard theme or utility override.
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-consensus-grey-400 italic bg-white/5 p-4 rounded-lg border border-white/5">
                  No options have broad support yet. Consider using compromise suggestions to bridge the gap.
                </div>
              )}
            </div>

            {/* Contentious Options */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-400" />
                Contentious Areas
              </h3>

              {consensus.contentiousOptions.length > 0 ? (
                <div className="space-y-3">
                  {consensus.contentiousOptions.map((option) => (
                    <div key={option.id} className="bg-amber-500/10 p-5 rounded-xl border border-amber-500/20 backdrop-blur-sm">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-amber-100">{option.title}</h4>
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30 border">
                          {option.supportPercentage.toFixed(0)}% Support
                        </Badge>
                      </div>
                      {option.description && (
                        <p className="text-sm text-amber-200/70 mb-3">{option.description}</p>
                      )}
                      <Progress
                        value={option.supportPercentage}
                        className="h-1.5 bg-amber-950/50"
                      />
                      <div className="mt-3 text-xs text-amber-300/80 flex items-center">
                        <Scale className="h-3 w-3 mr-1.5" />
                        Significant support but lacks consensus. Needs compromise.
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-consensus-grey-400 italic bg-white/5 p-4 rounded-lg border border-white/5">
                  No contentious options identified. The team appears to be reasonably aligned.
                </div>
              )}
            </div>

            <div className="text-xs text-consensus-grey-500 flex justify-end">
              Last updated: {lastUpdated}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="compromises" className="mt-0">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-amber-400" />
              Suggested Compromises
            </h3>

            {consensus.suggestedCompromises.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-3">
                {consensus.suggestedCompromises.map((compromise, index) => (
                  <AccordionItem
                    key={index}
                    value={`compromise-${index}`}
                    className="bg-consensus-blue/5 rounded-xl border border-consensus-blue/10 px-4 data-[state=open]:bg-consensus-blue/10 transition-colors"
                  >
                    <AccordionTrigger className="py-4 hover:no-underline text-white">
                      <div className="flex justify-between items-center w-full pr-4">
                        <h4 className="font-medium text-left">{compromise.title}</h4>
                        <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 ml-2">
                          {compromise.estimatedApproval.toFixed(0)}% Est. Approval
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-0 pb-4">
                      <div className="bg-black/20 p-4 rounded-lg mb-4 border border-white/5">
                        <p className="text-sm text-gray-300 mb-0">
                          {compromise.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex items-center bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/10">
                          <span className="text-xs font-medium text-amber-200">Addresses:</span>
                          <span className="text-xs text-amber-100 ml-1.5">
                            {compromise.targetIssue}
                          </span>
                        </div>

                        <div className="flex items-center bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/10">
                          <span className="text-xs font-medium text-green-200">Disagreement Redux:</span>
                          <span className="text-xs text-green-100 ml-1.5">
                            {compromise.reductionInDisagreement}%
                          </span>
                        </div>
                      </div>

                      <Button size="sm" className="w-full bg-consensus-blue hover:bg-consensus-blue/90 text-white">
                        <Scale className="h-4 w-4 mr-2" />
                        Propose This Compromise
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-sm text-consensus-grey-400 italic bg-white/5 p-4 rounded-lg border border-white/5">
                No compromise suggestions available. This may indicate strong consensus or insufficient data.
              </div>
            )}

            <div className="text-xs text-consensus-grey-500 flex justify-end">
              Last updated: {lastUpdated}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="new-options" className="mt-0">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
              AI-Generated New Options
            </h3>

            {consensus.proposedNewOptions.length > 0 ? (
              <div className="space-y-4">
                {consensus.proposedNewOptions.map((option, index) => (
                  <div key={index} className="bg-purple-900/10 p-5 rounded-xl border border-purple-500/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="flex justify-between items-center mb-3 relative z-10">
                      <h4 className="font-bold text-lg text-purple-100">{option.title}</h4>
                      <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {option.estimatedApproval.toFixed(0)}% Est. Approval
                      </Badge>
                    </div>

                    <p className="text-sm text-purple-200/80 mb-4 leading-relaxed relative z-10">
                      {option.description}
                    </p>

                    <div className="bg-black/30 p-3 rounded-lg mb-4 border border-white/5 relative z-10">
                      <div className="text-xs font-medium text-purple-300 mb-2 uppercase tracking-wide">Combines elements from:</div>
                      <div className="flex flex-wrap gap-2">
                        {option.baseOptions.map((baseId) => {
                          const baseOption = [
                            ...consensus.broadSupportOptions,
                            ...consensus.contentiousOptions
                          ].find(opt => opt.id === baseId);

                          return baseOption ? (
                            <Badge key={baseId} variant="outline" className="border-purple-500/30 text-purple-200 bg-purple-500/10 hover:bg-purple-500/20">
                              {baseOption.title}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-2 relative z-10">
                      <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg shadow-purple-600/20">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Add as New Option
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-consensus-grey-400 italic bg-white/5 p-4 rounded-lg border border-white/5">
                No new options have been generated.
              </div>
            )}

            <div className="text-xs text-consensus-grey-500 flex justify-end">
              Last updated: {lastUpdated}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsensusBuilder;

