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

      // Merge with existing data or create new.  Start with an empty object.
      let mergedData: Json = {};

       // Handle existing data (if any)
        if (existingAnalysis && existingAnalysis.analysis_data) {
          if (typeof existingAnalysis.analysis_data === 'object' && existingAnalysis.analysis_data !== null && !Array.isArray(existingAnalysis.analysis_data)) {
              // If it's a non-null object (and not an array), spread its properties.
              mergedData = { ...(existingAnalysis.analysis_data as Record<string, unknown>) };
          } else {
              // Log a warning (or error) if analysis_data isn't the shape we expect.
              console.warn("Existing analysis_data is not a plain object:", existingAnalysis.analysis_data);
              // Fallback:  mergedData remains an empty object, and we'll add consensusResult below
          }
        }

        // Add the consensusResult. This approach handles ANY valid Json data.
        mergedData = {
          ...(mergedData as object), // Cast to object (safe after checks above)
          consensus: consensusResult,
        } as Json;



      // Save to database
      const { error: saveError } = await supabase
        .from('proposal_analysis')
        .upsert({
          proposal_id: actualProposalId,
          analysis_data: mergedData,
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-consensus-blue" />
            AI Consensus Builder
          </CardTitle>
          <CardDescription>
            Analyzing contributions to build consensus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-consensus-blue border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-consensus-blue" />
            AI Consensus Builder
          </CardTitle>
          <CardDescription>
            Analyzing contributions to build consensus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-lg text-red-800">
            <p>Error loading consensus data: {(error as Error).message}</p>
          </div>
          <Button
            onClick={() => generateMutation.mutate()}
            className="mt-4"
            disabled={generateMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
            Generate Consensus Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If no consensus data exists yet, render a button to generate it
  if (!consensus) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-consensus-blue" />
            AI Consensus Builder
          </CardTitle>
          <CardDescription>
            Generate AI-driven consensus-building suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg text-blue-800 mb-4">
            <p>No consensus analysis available yet. Generate one to see AI-powered suggestions for building consensus among stakeholders.</p>
          </div>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="bg-consensus-blue hover:bg-consensus-blue/90"
          >
            {generateMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4 mr-2" />
                Generate Consensus Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-consensus-blue" />
              AI Consensus Builder
            </CardTitle>
            <CardDescription>
              AI-driven tools to help build consensus
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${generateMutation.isPending ? 'animate-spin' : ''}`}
            />
            Regenerate
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="consensus">Consensus Overview</TabsTrigger>
            <TabsTrigger value="compromises">Compromise Suggestions</TabsTrigger>
            <TabsTrigger value="new-options">Proposed Options</TabsTrigger>
          </TabsList>

          <TabsContent value="consensus">
            <div className="space-y-6">
              {/* Broad Support Options */}
              <div>
                <h3 className="text-lg font-semibold text-consensus-blue mb-3 flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                  Options with Broad Support
                </h3>

                {consensus.broadSupportOptions.length > 0 ? (
                  <div className="space-y-3">
                    {consensus.broadSupportOptions.map((option) => (
                      <div key={option.id} className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{option.title}</h4>
                          <Badge className="bg-green-100 text-green-800">
                            {option.supportPercentage.toFixed(0)}% Support
                          </Badge>
                        </div>
                        {option.description && (
                          <p className="text-sm text-consensus-grey-600 mb-2">{option.description}</p>
                        )}
                        <Progress
                          value={option.supportPercentage}
                          className="h-2 bg-green-100"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-consensus-grey-600 italic">
                    No options have broad support yet. Consider using compromise suggestions.
                  </p>
                )}
              </div>

              {/* Contentious Options */}
              <div>
                <h3 className="text-lg font-semibold text-consensus-blue mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                  Contentious Areas
                </h3>

                {consensus.contentiousOptions.length > 0 ? (
                  <div className="space-y-3">
                    {consensus.contentiousOptions.map((option) => (
                      <div key={option.id} className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{option.title}</h4>
                          <Badge className="bg-amber-100 text-amber-800">
                            {option.supportPercentage.toFixed(0)}% Support
                          </Badge>
                        </div>
                        {option.description && (
                          <p className="text-sm text-consensus-grey-600 mb-2">{option.description}</p>
                        )}
                        <Progress
                          value={option.supportPercentage}
                          className="h-2 bg-amber-100"
                        />
                        <div className="mt-2 text-sm text-amber-800">
                          This option has significant support but lacks consensus. Consider compromise options.
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-consensus-grey-600 italic">
                    No contentious options identified. The team appears to be fairly aligned.
                  </p>
                )}
              </div>

              <div className="text-xs text-consensus-grey-500 mt-4">
                Last updated: {lastUpdated}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compromises">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-consensus-blue mb-3 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-amber-600" />
                Suggested Compromises
              </h3>

              {consensus.suggestedCompromises.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-3">
                  {consensus.suggestedCompromises.map((compromise, index) => (
                    <AccordionItem
                      key={index}
                      value={`compromise-${index}`}
                      className="bg-blue-50 rounded-lg border border-blue-100 px-4"
                    >
                      <AccordionTrigger className="py-3 hover:no-underline">
                        <div className="flex justify-between items-center w-full pr-4">
                          <h4 className="font-medium text-left">{compromise.title}</h4>
                          <Badge className="bg-blue-100 text-blue-800 ml-2">
                            {compromise.estimatedApproval.toFixed(0)}% Est. Approval
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-0 pb-4">
                        <p className="text-sm text-consensus-grey-700 mb-3">
                          {compromise.description}
                        </p>

                        <div className="bg-white p-3 rounded-md mb-3">
                          <div className="flex items-center mb-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                            <span className="text-sm font-medium">Addresses Issue:</span>
                            <Badge className="bg-amber-100 text-amber-800 ml-2">
                              {compromise.targetIssue}
                            </Badge>
                          </div>

                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm font-medium">Reduces Disagreement:</span>
                            <Badge className="bg-green-100 text-green-800 ml-2">
                              {compromise.reductionInDisagreement}%
                            </Badge>
                          </div>
                        </div>

                        <Button size="sm" variant="outline" className="w-full mt-2">
                          <Scale className="h-4 w-4 mr-2" />
                          Propose This Compromise
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-sm text-consensus-grey-600 italic">
                  No compromise suggestions available. This may indicate strong consensus or insufficient data.
                </p>
              )}

              <div className="text-xs text-consensus-grey-500 mt-4">
                Last updated: {lastUpdated}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="new-options">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-consensus-blue mb-3 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                AI-Generated New Options
              </h3>

              {consensus.proposedNewOptions.length > 0 ? (
                <div className="space-y-4">
                  {consensus.proposedNewOptions.map((option, index) => (
                    <div key={index} className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{option.title}</h4>
                        <Badge className="bg-purple-100 text-purple-800">
                          {option.estimatedApproval.toFixed(0)}% Est. Approval
                        </Badge>
                      </div>

                      <p className="text-sm text-consensus-grey-700 mb-3">
                        {option.description}
                      </p>

                      <div className="bg-white p-3 rounded-md mb-3">
                        <div className="text-sm font-medium mb-1">Combines elements from:</div>
                        <div className="flex flex-wrap gap-2">
                          {option.baseOptions.map((baseId) => {
                            const baseOption = [
                              ...consensus.broadSupportOptions,
                              ...consensus.contentiousOptions
                            ].find(opt => opt.id === baseId);

                            return baseOption ? (
                              <Badge key={baseId} variant="outline">
                                {baseOption.title}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>

                      <div className="flex space-x-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Add as New Option
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-consensus-grey-600 italic">
                  No new options have been generated. This might be due to strong support for existing options or insufficient data.
                </p>
              )}

              <div className="text-xs text-consensus-grey-500 mt-4">
                Last updated: {lastUpdated}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConsensusBuilder;
