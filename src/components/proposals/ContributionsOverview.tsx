import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, FileText, BarChart, ThumbsUp, ThumbsDown, Bot, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VisualizationDashboard from '@/components/analytics/VisualizationDashboard';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Interface for the detailed proposal structure
interface DetailedProposal {
  id: string;
  title: string;
  options: Array<{ id: string, title: string, description: string }>;
  criteria: Array<{ id: string, name: string, weight: number, description: string }>;
  contributions: Array<{
    id: string;
    comment: string;
    created_at: string;
    selected_option_id: string | null;
    user: { full_name: string | null; avatar_url: string | null } | null;
    ratings: Array<{ criterion_id: string; rating: number }>;
  }>;
  analysis: Array<{
    analysis_data: any; // Using any for the JSONB column for flexibility matching mock structure
    created_at: string;
  }>;
}

interface ContributionsOverviewProps {
  proposal: any; // Using any temporarily to avoid strict type conflicts with parent, will verify at runtime
}


// Removed mockAnalysis logic to use real data from proposal.analysis check


// Define Star component for ratings display
const Star = ({ size, className }: { size: number, className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';

const ContributionsOverview = ({ proposal }: ContributionsOverviewProps) => {
  const { data: realtimeAnalytics } = useRealtimeAnalytics(proposal.id);
  const [activeTab, setActiveTab] = useState('summary');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Check if we have analysis data
  const existingAnalysis = proposal.analysis && proposal.analysis.length > 0
    ? proposal.analysis[0].analysis_data
    : null;

  const [analysisComplete, setAnalysisComplete] = useState(!!existingAnalysis);
  const { toast } = useToast();

  // Use existing analysis or null
  const displayAnalysis = existingAnalysis || null;

  // Generate AI recommendation
  const generateRecommendation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);

      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-recommendation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            proposalId: proposal.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate recommendation');
        }

        return await response.json();
        // In a real app we might want to refetch the proposal here to get the new analysis
        // For now, reload window or rely on parent refetch if we lifted state
        window.location.reload();
        return await response.json();
      } finally {
        setIsAnalyzing(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Analysis Complete',
        description: 'AI recommendation has been generated based on all contributions.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Analysis Failed',
        description: `Error: ${(error as Error).message}`,
        variant: 'destructive',
      });
    },
  });

  // For a real app, this would trigger the AI analysis
  const runAIAnalysis = () => {
    generateRecommendation.mutate();
  };

  // Get option title from ID
  const getOptionTitle = (optionId: string | null) => {
    if (!optionId || optionId === '0') return 'Abstained';
    const option = proposal.options.find((o: any) => o.id === optionId);
    return option ? option.title : 'Unknown Option';
  };

  // Get criterion name from ID
  const getCriterionName = (criterionId: string) => {
    const criterion = proposal.criteria.find((c: any) => c.id === criterionId);
    return criterion ? criterion.name : 'Unknown Criterion';
  };

  // Format the dates to be more readable
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Get sentiment badge color
  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.7) return 'bg-green-100 text-green-700';
    if (sentiment >= 0.4) return 'bg-amber-100 text-amber-700';
    return 'bg-rose-100 text-rose-700';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Contributions & Analysis</h2>

        {!analysisComplete && !isAnalyzing && (
          <Button
            onClick={runAIAnalysis}
            className="bg-consensus-blue hover:bg-consensus-blue/90"
          >
            <Bot size={16} className="mr-2" />
            Run AI Analysis
          </Button>
        )}

        {isAnalyzing && (
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-consensus-blue border-t-transparent rounded-full"></div>
            <span className="text-sm text-consensus-grey-600">Analyzing contributions...</span>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger
            value="summary"
            className="data-[state=active]:text-consensus-blue data-[state=active]:shadow"
          >
            Summary
          </TabsTrigger>
          <TabsTrigger
            value="contributions"
            className="data-[state=active]:text-consensus-blue data-[state=active]:shadow"
          >
            Individual Contributions
          </TabsTrigger>
          <TabsTrigger
            value="analysis"
            className="data-[state=active]:text-consensus-blue data-[state=active]:shadow"
            disabled={!displayAnalysis}
          >
            AI Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          {displayAnalysis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <ThumbsUp size={18} className="mr-2 text-consensus-blue" />
                    Option Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {displayAnalysis.optionSupport?.map((optionData: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm">{optionData.option}</div>
                          <div className="text-sm text-consensus-grey-600">
                            {optionData.votes} votes ({optionData.percentage}%)
                          </div>
                        </div>
                        <Progress value={optionData.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <BarChart size={18} className="mr-2 text-consensus-blue" />
                    Criteria Ratings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {displayAnalysis.criteriaAnalysis?.map((criterionData: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm">
                            {criterionData.name}
                            <span className="ml-2 text-xs text-consensus-grey-500">
                              (Weight: {criterionData.importance}/10)
                            </span>
                          </div>
                          <div className="text-sm text-consensus-grey-600">
                            {Number(criterionData.averageRating).toFixed(1)}/5
                          </div>
                        </div>
                        <Progress
                          value={(criterionData.averageRating / 5) * 100}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <MessageCircle size={18} className="mr-2 text-consensus-blue" />
                    Sentiment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">{displayAnalysis.sentimentAnalysis?.positive || 0}</div>
                        <div className="text-xs text-consensus-grey-600">Positive</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-amber-600">{displayAnalysis.sentimentAnalysis?.neutral || 0}</div>
                        <div className="text-xs text-consensus-grey-600">Neutral</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-rose-600">{displayAnalysis.sentimentAnalysis?.negative || 0}</div>
                        <div className="text-xs text-consensus-grey-600">Negative</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Average Sentiment</div>
                      <div className="text-lg font-bold text-consensus-blue">
                        {(displayAnalysis.sentimentAnalysis?.averageSentiment * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <ThumbsDown size={16} className="text-rose-500" />
                    <div className="w-full mx-2 bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-rose-500 via-amber-500 to-green-500 h-2.5 rounded-full"
                        style={{ width: `${(displayAnalysis.sentimentAnalysis?.averageSentiment || 0) * 100}%` }}
                      ></div>
                    </div>
                    <ThumbsUp size={16} className="text-green-500" />
                  </div>
                  <div className="flex justify-between text-xs text-consensus-grey-600 mt-1">
                    <span>Negative</span>
                    <span>Neutral</span>
                    <span>Positive</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <FileText size={18} className="mr-2 text-consensus-blue" />
                    Key Themes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {displayAnalysis.keyThemes?.map((theme: any, index: number) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm">{theme.theme}</div>
                          <div className="text-xs text-consensus-grey-600">
                            {theme.occurrences} mentions
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {theme.keywords.map((keyword: string, kidx: number) => (
                            <Badge
                              key={kidx}
                              variant="outline"
                              className="text-xs bg-slate-50"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-slate-50">
              <Bot className="h-12 w-12 mx-auto text-consensus-grey-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
              <p className="text-consensus-grey-600 mb-6 max-w-md mx-auto">
                Run the AI analysis to generate insights, sentiment scores, and recommendations based on the contributions received so far.
              </p>
              <Button onClick={runAIAnalysis} className="bg-consensus-blue">
                Run AI Analysis
              </Button>
            </div>
          )}

          {displayAnalysis && (
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Bot size={18} className="mr-2 text-consensus-blue" />
                  AI Recommendation
                  <Badge className="ml-2 bg-blue-100 text-blue-800">
                    {displayAnalysis.recommendationConfidence}% Confidence
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-consensus-blue/5 p-4 rounded-lg mb-4">
                  <p className="font-medium text-consensus-blue-900">
                    Based on all inputs, the AI recommends: <span className="text-consensus-blue font-bold">{displayAnalysis.recommendedOption}</span>
                  </p>
                </div>

                <h4 className="font-medium mb-2">Key Insights:</h4>
                <ul className="space-y-2">
                  {displayAnalysis.insights?.map((insight: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block h-4 w-4 rounded-full bg-consensus-blue/20 mr-2 mt-1"></span>
                      <span className="text-sm text-consensus-grey-700">{insight}</span>
                    </li>
                  ))}
                </ul>

                {displayAnalysis.fileInsights?.length > 0 && (
                  <>
                    <h4 className="font-medium mt-4 mb-2">Document Insights:</h4>
                    <ul className="space-y-2">
                      {displayAnalysis.fileInsights.map((insight: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <FileUp size={14} className="mr-2 mt-1 text-consensus-grey-500" />
                          <span className="text-sm text-consensus-grey-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contributions">
          <div className="space-y-4">
            {proposal.contributions && proposal.contributions.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {proposal.contributions.map((contribution: any) => (
                  <AccordionItem key={contribution.id} value={contribution.id} className="border rounded-lg mb-4 px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex justify-between items-center w-full pr-4">
                        <div className="text-left">
                          <h3 className="font-medium text-base">{contribution.user?.full_name || 'Anonymous User'}</h3>
                          <p className="text-xs text-consensus-grey-500 font-normal mt-1">
                            {formatDate(contribution.created_at || contribution.timestamp)}
                          </p>
                        </div>
                        <Badge
                          className={`${!contribution.selected_option_id ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-800'}`}
                        >
                          {getOptionTitle(contribution.selected_option_id)}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-4 border-t mt-2">
                      {contribution.comment && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">Comment</h4>
                          </div>
                          <p className="text-sm text-consensus-grey-700 bg-slate-50 p-3 rounded-lg">
                            "{contribution.comment}"
                          </p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium mb-2">Criteria Ratings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {proposal.criteria.map((criterion: any) => {
                            const userRating = contribution.ratings?.find((r: any) => r.criterion_id === criterion.id)?.rating || 0;

                            return (
                              <div key={criterion.id} className="bg-slate-50 p-2 rounded-lg">
                                <div className="text-xs text-consensus-grey-600 mb-1">
                                  {criterion.name}
                                </div>
                                <div className="flex">
                                  {[...Array(5)].map((_, index) => (
                                    <Star
                                      key={index}
                                      size={14}
                                      className={`${index < userRating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                        }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <p className="text-consensus-grey-600">No contributions yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <VisualizationDashboard
            proposalId={proposal.id}
            isAdmin={true}
            analysisData={realtimeAnalytics}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContributionsOverview;
