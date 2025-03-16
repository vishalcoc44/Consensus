
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, FileText, BarChart, ThumbsUp, ThumbsDown, Bot, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data for visualization
const mockContributions = [
  {
    id: 1,
    user: 'Alice Smith',
    option: 1,
    comment: 'The downtown location is close to major transport links and restaurants, making it more accessible for clients and staff.',
    fileUrl: '/documents/alicesmith_transportmap.pdf',
    fileName: 'transport_map.pdf',
    criteriaRatings: { 1: 3, 2: 5, 3: 4 },
    timestamp: '2023-11-20T14:32:00Z',
    sentiment: 0.8
  },
  {
    id: 2,
    user: 'Bob Johnson',
    option: 2,
    comment: 'The suburban office has much better parking facilities and is less expensive. The commute might be longer but the cost savings are significant.',
    fileUrl: null,
    fileName: null,
    criteriaRatings: { 1: 5, 2: 2, 3: 3 },
    timestamp: '2023-11-21T09:15:00Z',
    sentiment: 0.6
  },
  {
    id: 3,
    user: 'Carol Williams',
    option: 3,
    comment: 'A hybrid solution gives us the best of both worlds. We maintain a professional presence downtown while providing flexibility.',
    fileUrl: '/documents/carolwilliams_hybridplan.docx',
    fileName: 'hybrid_work_plan.docx',
    criteriaRatings: { 1: 4, 2: 4, 3: 5 },
    timestamp: '2023-11-21T16:45:00Z',
    sentiment: 0.9
  },
  {
    id: 4,
    user: 'Dave Brown',
    option: 1,
    comment: 'The downtown location is good but expensive. I worry about the long-term costs.',
    fileUrl: null,
    fileName: null,
    criteriaRatings: { 1: 2, 2: 4, 3: 4 },
    timestamp: '2023-11-22T11:20:00Z',
    sentiment: 0.3
  },
  {
    id: 5,
    user: 'Eve Davis',
    option: 0, // Abstained
    comment: 'I don\'t have a strong preference as I work remotely most of the time.',
    fileUrl: null,
    fileName: null,
    criteriaRatings: { 1: 3, 2: 3, 3: 3 },
    timestamp: '2023-11-22T14:50:00Z',
    sentiment: 0.5
  }
];

// Mock AI analysis
const mockAnalysis = {
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
    { 
      name: 'Cost', 
      averageRating: 3.4,
      importance: 8
    },
    { 
      name: 'Accessibility', 
      averageRating: 3.6,
      importance: 6
    },
    { 
      name: 'Amenities', 
      averageRating: 3.8,
      importance: 4
    }
  ],
  keyThemes: [
    { theme: 'Transportation', keywords: ['transport', 'commute', 'parking', 'accessibility'], occurrences: 3 },
    { theme: 'Cost Concerns', keywords: ['cost', 'expense', 'expensive', 'savings'], occurrences: 3 },
    { theme: 'Flexibility', keywords: ['hybrid', 'remote', 'flexible'], occurrences: 2 },
    { theme: 'Amenities', keywords: ['restaurants', 'facilities', 'professional'], occurrences: 2 },
    { theme: 'Client Relations', keywords: ['clients', 'presence', 'professional'], occurrences: 1 }
  ],
  recommendedOption: 'Hybrid Solution',
  recommendationConfidence: 72,
  insights: [
    'The hybrid solution has the highest overall support score when combining votes and sentiment analysis.',
    'Cost is rated highly important, but accessibility receives the best average ratings.',
    'Transportation and cost concerns are the most frequently mentioned themes in comments.',
    'Team members who prefer downtown emphasize accessibility, while suburban supporters focus on cost.'
  ],
  fileInsights: [
    'The transport map shows 3 major transit lines serving the downtown location.',
    'The hybrid work plan suggests 2 days in-office attendance per week would be optimal.'
  ]
};

interface Proposal {
  id: string;
  title: string;
  options: Array<{id: number, title: string, description: string}>;
  criteria: Array<{id: number, name: string, weight: number, description: string}>;
}

interface ContributionsOverviewProps {
  proposal: Proposal;
}

const ContributionsOverview = ({ proposal }: ContributionsOverviewProps) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(true); // For demo, set to true

  // For a real app, this would trigger the AI analysis
  const runAIAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 3000);
  };

  // Get option title from ID
  const getOptionTitle = (optionId: number) => {
    if (optionId === 0) return 'Abstained';
    const option = proposal.options.find(o => o.id === optionId);
    return option ? option.title : 'Unknown Option';
  };

  // Get criterion name from ID
  const getCriterionName = (criterionId: number) => {
    const criterion = proposal.criteria.find(c => c.id === criterionId);
    return criterion ? criterion.name : 'Unknown Criterion';
  };

  // Format the dates to be more readable
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            disabled={!analysisComplete}
          >
            AI Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
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
                  {mockAnalysis.optionSupport.map((optionData, index) => (
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
                  {mockAnalysis.criteriaAnalysis.map((criterionData, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-sm">
                          {criterionData.name}
                          <span className="ml-2 text-xs text-consensus-grey-500">
                            (Weight: {criterionData.importance}/10)
                          </span>
                        </div>
                        <div className="text-sm text-consensus-grey-600">
                          {criterionData.averageRating.toFixed(1)}/5
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
                      <div className="text-xl font-bold text-green-600">{mockAnalysis.sentimentAnalysis.positive}</div>
                      <div className="text-xs text-consensus-grey-600">Positive</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-amber-600">{mockAnalysis.sentimentAnalysis.neutral}</div>
                      <div className="text-xs text-consensus-grey-600">Neutral</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-rose-600">{mockAnalysis.sentimentAnalysis.negative}</div>
                      <div className="text-xs text-consensus-grey-600">Negative</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Average Sentiment</div>
                    <div className="text-lg font-bold text-consensus-blue">
                      {(mockAnalysis.sentimentAnalysis.averageSentiment * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <ThumbsDown size={16} className="text-rose-500" />
                  <div className="w-full mx-2 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-rose-500 via-amber-500 to-green-500 h-2.5 rounded-full" 
                      style={{ width: `100%` }}
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
                  {mockAnalysis.keyThemes.map((theme, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-sm">{theme.theme}</div>
                        <div className="text-xs text-consensus-grey-600">
                          {theme.occurrences} mentions
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {theme.keywords.map((keyword, kidx) => (
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
          
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Bot size={18} className="mr-2 text-consensus-blue" />
                AI Recommendation 
                <Badge className="ml-2 bg-blue-100 text-blue-800">
                  {mockAnalysis.recommendationConfidence}% Confidence
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-consensus-blue/5 p-4 rounded-lg mb-4">
                <p className="font-medium text-consensus-blue-900">
                  Based on all inputs, the AI recommends: <span className="text-consensus-blue font-bold">{mockAnalysis.recommendedOption}</span>
                </p>
              </div>
              
              <h4 className="font-medium mb-2">Key Insights:</h4>
              <ul className="space-y-2">
                {mockAnalysis.insights.map((insight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block h-4 w-4 rounded-full bg-consensus-blue/20 mr-2 mt-1"></span>
                    <span className="text-sm text-consensus-grey-700">{insight}</span>
                  </li>
                ))}
              </ul>
              
              {mockAnalysis.fileInsights.length > 0 && (
                <>
                  <h4 className="font-medium mt-4 mb-2">Document Insights:</h4>
                  <ul className="space-y-2">
                    {mockAnalysis.fileInsights.map((insight, index) => (
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
        </TabsContent>
        
        <TabsContent value="contributions">
          <div className="space-y-4">
            {mockContributions.map((contribution) => (
              <Card key={contribution.id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">{contribution.user}</h3>
                      <p className="text-xs text-consensus-grey-500">
                        {formatDate(contribution.timestamp)}
                      </p>
                    </div>
                    <Badge 
                      className={`${contribution.option === 0 ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-800'}`}
                    >
                      {contribution.option === 0 
                        ? 'Abstained' 
                        : getOptionTitle(contribution.option)}
                    </Badge>
                  </div>
                  
                  {contribution.comment && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Comment</h4>
                        {contribution.sentiment && (
                          <Badge className={getSentimentColor(contribution.sentiment)}>
                            Sentiment: {(contribution.sentiment * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-consensus-grey-700 bg-slate-50 p-3 rounded-lg">
                        "{contribution.comment}"
                      </p>
                    </div>
                  )}
                  
                  {contribution.fileName && (
                    <div className="flex items-center text-sm mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg">
                      <FileUp size={16} className="mr-2" />
                      <span>Uploaded: {contribution.fileName}</span>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Criteria Ratings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {Object.entries(contribution.criteriaRatings).map(([criterionId, rating]) => (
                        <div key={criterionId} className="bg-slate-50 p-2 rounded-lg">
                          <div className="text-xs text-consensus-grey-600 mb-1">
                            {getCriterionName(parseInt(criterionId))}
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, index) => (
                              <Star
                                key={index}
                                size={14}
                                className={`${
                                  index < rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="analysis">
          <Card className="overflow-hidden">
            <CardHeader className="bg-slate-50 pb-4">
              <CardTitle className="text-xl">AI Analysis Results</CardTitle>
              <p className="text-sm text-consensus-grey-600">
                Comprehensive analysis of all inputs and uploaded documents
              </p>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Option Support Scores</h3>
                  <p className="text-sm text-consensus-grey-600 mb-4">
                    Combined scores based on votes (60%) and sentiment analysis (40%)
                  </p>
                  
                  <div className="space-y-4">
                    {mockAnalysis.optionSupport.filter(o => o.option !== 'Abstained').map((optionData, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">
                            {optionData.option}
                            {optionData.option === mockAnalysis.recommendedOption && (
                              <Badge className="ml-2 bg-green-100 text-green-800">Recommended</Badge>
                            )}
                          </div>
                          <div className="font-bold">{optionData.score}/100</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Progress 
                            value={optionData.score} 
                            className="h-3" 
                          />
                        </div>
                        <div className="flex justify-between text-xs text-consensus-grey-500">
                          <div>Votes: {optionData.votes} ({optionData.percentage}%)</div>
                          <div>Sentiment: {(optionData.sentiment * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Recommendation Explanation</h3>
                  
                  <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                    <p className="text-consensus-grey-700">
                      The <strong>{mockAnalysis.recommendedOption}</strong> is recommended with 
                      {' '}{mockAnalysis.recommendationConfidence}% confidence based on:
                    </p>
                    
                    <ul className="space-y-2">
                      {mockAnalysis.insights.map((insight, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block h-4 w-4 rounded-full bg-consensus-blue/20 mr-2 mt-1"></span>
                          <span className="text-sm text-consensus-grey-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Theme Analysis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockAnalysis.keyThemes.map((theme, index) => (
                      <div key={index} className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{theme.theme}</h4>
                          <Badge variant="outline">{theme.occurrences} mentions</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {theme.keywords.map((keyword, kidx) => (
                            <Badge 
                              key={kidx}
                              className="bg-white border-gray-200"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-consensus-grey-600">
                          This theme appears in {(theme.occurrences / mockContributions.length * 100).toFixed(0)}% of all contributions
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {mockAnalysis.fileInsights.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Document Analysis</h3>
                    
                    <Card className="border border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center mb-3">
                          <FileUp size={18} className="mr-2 text-blue-600" />
                          <h4 className="font-medium text-blue-800">Uploaded Document Insights</h4>
                        </div>
                        
                        <ul className="space-y-2">
                          {mockAnalysis.fileInsights.map((insight, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="inline-block h-3 w-3 rounded-full bg-blue-200 mr-2 mt-1.5"></span>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContributionsOverview;
