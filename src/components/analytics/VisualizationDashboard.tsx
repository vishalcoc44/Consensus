
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
import RecommendationEngine from './RecommendationEngine';
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
    recommendedOption: 'Hybrid Solution',
    recommendationConfidence: 72
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="insights">Data Insights</TabsTrigger>
            <TabsTrigger value="recommendation">AI Recommendation</TabsTrigger>
            <TabsTrigger value="consensus">Consensus Building</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-wrap gap-3 ml-auto">
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
      </div>
      
      <TabsContent value="recommendation" className="mt-0">
        <RecommendationEngine proposalId={proposalId} isAdmin={isAdmin} />
      </TabsContent>
      
      <TabsContent value="consensus" className="mt-0">
        <ConsensusBuilder proposalId={proposalId} />
      </TabsContent>
      
      <TabsContent value="insights" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Option Support</CardTitle>
              <CardDescription>Distribution of votes across options</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <OptionSupportChart data={mockAnalysis.optionSupport} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Analysis</CardTitle>
              <CardDescription>Breakdown of comment sentiments</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <SentimentPieChart data={mockAnalysis.sentimentAnalysis} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Key Themes</CardTitle>
              <CardDescription>Common themes from comments</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ThemeWordCloud themes={mockAnalysis.keyThemes} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Criteria Ratings</CardTitle>
              <CardDescription>Average ratings for each criterion</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <CriteriaRatingsChart data={mockAnalysis.criteriaAnalysis} />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Options Comparison</CardTitle>
            <CardDescription>Detailed comparison of all options</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>
                Analysis results as of {new Date().toLocaleDateString()}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Option</TableHead>
                  <TableHead className="text-right">Votes</TableHead>
                  <TableHead className="text-right">Vote %</TableHead>
                  <TableHead className="text-right">Sentiment</TableHead>
                  <TableHead className="text-right">Support Score</TableHead>
                  <TableHead className="text-center">Recommended</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAnalysis.optionSupport
                  .filter(option => option.option !== 'Abstained')
                  .map((option, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{option.option}</TableCell>
                      <TableCell className="text-right">{option.votes}</TableCell>
                      <TableCell className="text-right">{option.percentage}%</TableCell>
                      <TableCell className="text-right">{(option.sentiment * 100).toFixed(0)}%</TableCell>
                      <TableCell className="text-right">{option.score}/100</TableCell>
                      <TableCell className="text-center">
                        {option.option === mockAnalysis.recommendedOption ? 
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Yes ({mockAnalysis.recommendationConfidence}%)
                          </span> : 
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            No
                          </span>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  );
};

export default VisualizationDashboard;
