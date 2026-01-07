
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import OptionSupportChart from './charts/OptionSupportChart';
import SentimentPieChart from './charts/SentimentPieChart';
import ThemeWordCloud from './charts/ThemeWordCloud';
import CriteriaRatingsChart from './charts/CriteriaRatingsChart';
import TrendAnalysisChart from './charts/TrendAnalysisChart';
import RecommendationEngine from './RecommendationEngine';
import ImpactAnalysis from './ImpactAnalysis';
import ConsensusBuilder from './ConsensusBuilder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VisualizationDashboardProps {
  proposalId?: string;
  analysisData?: any;
  isAdmin?: boolean;
}

const VisualizationDashboard = ({
  proposalId,
  analysisData = null,
  isAdmin = false
}: VisualizationDashboardProps) => {
  const [timeFilter, setTimeFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [criteriaFilter, setCriteriaFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('insights');

  // For now, we're using mock data similar to what's in ContributionsOverview
  // In production, this would come from the proposal_analysis table in Supabase
  const mockAnalysis = analysisData || {
    optionSupport: [
      { option: 'Downtown Office', votes: 2, percentage: 40, sentiment: 0.55, score: 46 },
      { option: 'Suburban Office Park', votes: 1, percentage: 20, sentiment: 0.6, score: 36 },
      { option: 'Hybrid Solution', votes: 1, percentage: 20, sentiment: 0.9, score: 48 },
      { option: 'Abstained', votes: 1, percentage: 20, sentiment: 0.5, score: 0 }
    ],
    sentimentAnalysis: {
      positive: 3,
      neutral: 1,
      negative: 1,
      averageSentiment: 0.62
    },
    criteriaAnalysis: [
      { name: 'Cost', averageRating: 3.4, importance: 8 },
      { name: 'Accessibility', averageRating: 3.6, importance: 6 },
      { name: 'Amenities', averageRating: 3.8, importance: 4 }
    ],
    keyThemes: [
      { theme: 'Transportation', keywords: ['transport', 'commute', 'parking', 'accessibility'], occurrences: 3 },
      { theme: 'Cost Concerns', keywords: ['cost', 'expense', 'expensive', 'savings'], occurrences: 3 },
      { theme: 'Flexibility', keywords: ['hybrid', 'remote', 'flexible'], occurrences: 2 },
      { theme: 'Amenities', keywords: ['restaurants', 'facilities', 'professional'], occurrences: 2 },
      { theme: 'Client Relations', keywords: ['clients', 'presence', 'professional'], occurrences: 1 }
    ],
    trendData: [
      { date: 'Day 1', consensusScore: 30, sentimentScore: 45 },
      { date: 'Day 2', consensusScore: 42, sentimentScore: 50 },
      { date: 'Day 3', consensusScore: 38, sentimentScore: 48 },
      { date: 'Day 4', consensusScore: 55, sentimentScore: 60 },
      { date: 'Day 5', consensusScore: 62, sentimentScore: 72 },
      { date: 'Day 6', consensusScore: 72, sentimentScore: 78 },
      { date: 'Today', consensusScore: 75, sentimentScore: 82 }
    ],
    recommendedOption: 'Hybrid Solution',
    recommendationConfidence: 72
  };

  // Filters component
  const FiltersSection = () => (
    <div className="flex flex-wrap gap-3 mb-4">
      <Select value={timeFilter} onValueChange={setTimeFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Time Period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="week">Past Week</SelectItem>
          <SelectItem value="month">Past Month</SelectItem>
          <SelectItem value="quarter">Past Quarter</SelectItem>
        </SelectContent>
      </Select>

      <Select value={roleFilter} onValueChange={setRoleFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="User Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="admin">Admins</SelectItem>
          <SelectItem value="member">Members</SelectItem>
        </SelectContent>
      </Select>

      <Select value={criteriaFilter} onValueChange={setCriteriaFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Criteria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Criteria</SelectItem>
          {mockAnalysis.criteriaAnalysis.map((criterion, index) => (
            <SelectItem key={index} value={criterion.name.toLowerCase()}>
              {criterion.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-muted p-1 rounded-xl border border-border">
            <TabsTrigger value="insights" className="data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground rounded-lg">Data Insights</TabsTrigger>
            <TabsTrigger value="recommendation" className="data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground rounded-lg">AI Recommendation</TabsTrigger>
            <TabsTrigger value="consensus" className="data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground rounded-lg">Consensus Building</TabsTrigger>
          </TabsList>
        </div>

        {activeTab === 'insights' && <FiltersSection />}

        <TabsContent value="recommendation" className="mt-0">
          <RecommendationEngine proposalId={proposalId} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="consensus" className="mt-0">
          <ConsensusBuilder proposalId={proposalId} />
        </TabsContent>

        <TabsContent value="insights" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="glass-panel p-6 rounded-xl">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">Option Support</h3>
                <p className="text-sm text-muted-foreground">Distribution of votes across options</p>
              </div>
              <div className="h-80">
                <OptionSupportChart data={mockAnalysis.optionSupport} />
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">Sentiment Analysis</h3>
                <p className="text-sm text-muted-foreground">Breakdown of comment sentiments</p>
              </div>
              <div className="h-80">
                <SentimentPieChart data={mockAnalysis.sentimentAnalysis} />
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">Key Themes</h3>
                <p className="text-sm text-muted-foreground">Common themes from comments</p>
              </div>
              <div className="h-80">
                <ThemeWordCloud themes={mockAnalysis.keyThemes} />
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">Criteria Ratings</h3>
                <p className="text-sm text-muted-foreground">Average ratings for each criterion</p>
              </div>
              <div className="h-80">
                <CriteriaRatingsChart data={mockAnalysis.criteriaAnalysis} />
              </div>
            </div>
          </div>

          {/* Trend Analysis Chart */}
          <div className="glass-panel p-6 rounded-xl mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-foreground">Consensus & Sentiment Trends</h3>
              <p className="text-sm text-muted-foreground">Tracking alignment over time</p>
            </div>
            <div className="h-80">
              <TrendAnalysisChart data={mockAnalysis.trendData} />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-foreground">Options Comparison</h3>
              <p className="text-sm text-muted-foreground">Detailed comparison of all options</p>
            </div>
            <div>
              <Table>
                <TableCaption className="text-muted-foreground">
                  Analysis results as of {new Date().toLocaleDateString()}
                </TableCaption>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableHead className="text-muted-foreground">Option</TableHead>
                    <TableHead className="text-right text-muted-foreground">Votes</TableHead>
                    <TableHead className="text-right text-muted-foreground">Vote %</TableHead>
                    <TableHead className="text-right text-muted-foreground">Sentiment</TableHead>
                    <TableHead className="text-right text-muted-foreground">Support Score</TableHead>
                    <TableHead className="text-center text-muted-foreground">Recommended</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAnalysis.optionSupport
                    .filter((option: any) => option.option !== 'Abstained')
                    .map((option: any, index: number) => (
                      <TableRow key={index} className="border-border hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <TableCell className="font-medium text-foreground">{option.option}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{option.votes}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{option.percentage}%</TableCell>
                        <TableCell className="text-right text-muted-foreground">{(option.sentiment * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-right text-muted-foreground">{option.score}/100</TableCell>
                        <TableCell className="text-center">
                          {option.option === mockAnalysis.recommendedOption ?
                            <span className="inline-flex items-center rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-600 border border-green-500/30">
                              Yes ({mockAnalysis.recommendationConfidence}%)
                            </span> :
                            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                              No
                            </span>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VisualizationDashboard;
