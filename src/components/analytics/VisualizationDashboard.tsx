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
    recommendationConfidence: 72,
    consensusScore: 65,
    participationStats: {
      totalMembers: 12,
      votedCount: 8,
      turnoutPercentage: 66
    },
    criteriaByOption: {}
  };

  // Filters component
  const FiltersSection = () => (
    <div className="flex flex-wrap gap-2 mb-3">
      <Select value={timeFilter} onValueChange={setTimeFilter}>
        <SelectTrigger className="w-[110px] h-7 text-xs">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="week">Past Week</SelectItem>
          <SelectItem value="month">Past Month</SelectItem>
          <SelectItem value="quarter">Past Quarter</SelectItem>
        </SelectContent>
      </Select>

      <Select value={roleFilter} onValueChange={setRoleFilter}>
        <SelectTrigger className="w-[110px] h-7 text-xs">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="admin">Admins</SelectItem>
          <SelectItem value="member">Members</SelectItem>
        </SelectContent>
      </Select>

      <Select value={criteriaFilter} onValueChange={setCriteriaFilter}>
        <SelectTrigger className="w-[110px] h-7 text-xs">
          <SelectValue placeholder="Criteria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Criteria</SelectItem>
          {mockAnalysis.criteriaAnalysis.map((criterion: any, index: number) => (
            <SelectItem key={index} value={criterion.name.toLowerCase()}>
              {criterion.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-muted p-0.5 rounded-lg border border-border h-8">
            <TabsTrigger value="insights" className="data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground rounded text-[10px] px-3 py-1">Data Insights</TabsTrigger>
            <TabsTrigger value="recommendation" className="data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground rounded text-[10px] px-3 py-1">AI Recommendation</TabsTrigger>
            <TabsTrigger value="consensus" className="data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground rounded text-[10px] px-3 py-1">Consensus Building</TabsTrigger>
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

          {/* High Level Metrics - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="glass-panel p-3 rounded-lg flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-foreground">Consensus Score</h3>
                <p className="text-[10px] text-muted-foreground">Team agreement level</p>
              </div>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-xl font-bold">{mockAnalysis.consensusScore || 0}%</span>
                <span className="text-[10px] text-muted-foreground mb-0.5">alignment</span>
              </div>
              <div className="h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${mockAnalysis.consensusScore || 0}%` }} />
              </div>
            </div>

            <div className="glass-panel p-3 rounded-lg flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-foreground">Participation</h3>
                <p className="text-[10px] text-muted-foreground">Team turnout</p>
              </div>
              <div className="mt-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xl font-bold">{mockAnalysis.participationStats?.turnoutPercentage || 0}%</span>
                  <span className="text-[10px] text-muted-foreground">{mockAnalysis.participationStats?.votedCount || 0}/{mockAnalysis.participationStats?.totalMembers || 0} voted</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${mockAnalysis.participationStats?.turnoutPercentage || 0}%` }} />
                </div>
              </div>
            </div>

            <div className="glass-panel p-3 rounded-lg flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-foreground">Recommendation</h3>
                <p className="text-[10px] text-muted-foreground">AI suggested option</p>
              </div>
              <div className="mt-2">
                <div className="text-sm font-semibold truncate" title={mockAnalysis.recommendedOption}>{mockAnalysis.recommendedOption}</div>
                <div className="mt-1 text-[10px] text-green-500 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {mockAnalysis.recommendationConfidence}% confidence
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="glass-panel p-4 rounded-lg">
              <div className="mb-2">
                <h3 className="text-xs font-bold text-foreground">Option Support</h3>
                <p className="text-[10px] text-muted-foreground">Votes per option</p>
              </div>
              <div className="h-48">
                <OptionSupportChart data={mockAnalysis.optionSupport} />
              </div>
            </div>

            <div className="glass-panel p-4 rounded-lg">
              <div className="mb-2">
                <h3 className="text-xs font-bold text-foreground">Sentiment Analysis</h3>
                <p className="text-[10px] text-muted-foreground">Comment tones</p>
              </div>
              <div className="h-48">
                <SentimentPieChart data={mockAnalysis.sentimentAnalysis} />
              </div>
            </div>

            <div className="glass-panel p-4 rounded-lg">
              <div className="mb-2">
                <h3 className="text-xs font-bold text-foreground">Key Themes</h3>
                <p className="text-[10px] text-muted-foreground">Common topics</p>
              </div>
              <div className="h-48">
                <ThemeWordCloud themes={mockAnalysis.keyThemes} />
              </div>
            </div>

            <div className="glass-panel p-4 rounded-lg">
              <div className="mb-2">
                <h3 className="text-xs font-bold text-foreground">Criteria Ratings</h3>
                <p className="text-[10px] text-muted-foreground">Average ratings</p>
              </div>
              <div className="h-48">
                <CriteriaRatingsChart data={mockAnalysis.criteriaAnalysis} />
              </div>
            </div>
          </div>

          {/* Criteria Matrix Breakdown - Compact Table */}
          {mockAnalysis.criteriaByOption && Object.keys(mockAnalysis.criteriaByOption).length > 0 && (
            <div className="glass-panel p-4 rounded-lg mb-4">
              <div className="mb-3">
                <h3 className="text-xs font-bold text-foreground">Detailed Criteria Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-muted/50 h-8">
                      <TableHead className="text-[10px] h-8 text-muted-foreground">Option</TableHead>
                      {mockAnalysis.criteriaAnalysis.map((c: any) => (
                        <TableHead key={c.id || c.name} className="text-right h-8 text-[10px] text-muted-foreground">{c.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAnalysis.optionSupport
                      .filter((opt: any) => opt.option !== 'Abstained')
                      .map((opt: any) => (
                        <TableRow key={opt.id || opt.option} className="border-border hover:bg-muted/50 h-8">
                          <TableCell className="font-medium text-[10px] py-1 text-foreground">{opt.option}</TableCell>
                          {mockAnalysis.criteriaAnalysis.map((crit: any) => {
                            const rating = mockAnalysis.criteriaByOption[opt.id]?.[crit.id];
                            return (
                              <TableCell key={crit.id || crit.name} className="text-right text-[10px] py-1 text-muted-foreground">
                                {rating ? rating.toFixed(1) : '-'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Trend Analysis Chart */}
          <div className="glass-panel p-4 rounded-lg mb-4">
            <div className="mb-2">
              <h3 className="text-xs font-bold text-foreground">Trends</h3>
              <p className="text-[10px] text-muted-foreground">Alignment over time</p>
            </div>
            <div className="h-48">
              <TrendAnalysisChart data={mockAnalysis.trendData} />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-lg">
            <div className="mb-3">
              <h3 className="text-xs font-bold text-foreground">Options Comparison</h3>
            </div>
            <div>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50 h-8">
                    <TableHead className="text-[10px] h-8 text-muted-foreground w-[25%] px-2">Option</TableHead>
                    <TableHead className="text-right text-[10px] h-8 text-muted-foreground px-2">Votes</TableHead>
                    <TableHead className="text-right text-[10px] h-8 text-muted-foreground px-2">%</TableHead>
                    <TableHead className="text-right text-[10px] h-8 text-muted-foreground px-2">Sentiment</TableHead>
                    <TableHead className="text-right text-[10px] h-8 text-muted-foreground px-2">Score</TableHead>
                    <TableHead className="text-center text-[10px] h-8 text-muted-foreground px-2">Rec.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAnalysis.optionSupport
                    .filter((option: any) => option.option !== 'Abstained')
                    .map((option: any, index: number) => (
                      <TableRow key={index} className="border-border hover:bg-muted/50 data-[state=selected]:bg-muted h-8">
                        <TableCell className="font-medium text-[10px] py-1 text-foreground px-2">{option.option}</TableCell>
                        <TableCell className="text-right text-[10px] py-1 text-muted-foreground px-2">{option.votes}</TableCell>
                        <TableCell className="text-right text-[10px] py-1 text-muted-foreground px-2">{option.percentage}%</TableCell>
                        <TableCell className="text-right text-[10px] py-1 text-muted-foreground px-2">{(option.sentiment * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-right text-[10px] py-1 text-muted-foreground px-2">{option.score}</TableCell>
                        <TableCell className="text-center py-1 px-2">
                          {option.option === mockAnalysis.recommendedOption ?
                            <span className="inline-flex items-center rounded-full bg-green-500/20 px-1.5 py-0.5 text-[9px] font-medium text-green-600 border border-green-500/30">
                              Yes
                            </span> :
                            <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                              -
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
