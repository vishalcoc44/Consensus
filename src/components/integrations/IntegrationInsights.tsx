
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getProposalIntegrationData, IntegrationData } from '@/utils/integrationService';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, AlertCircle, MessageSquare, FileText, BarChart } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface IntegrationInsightsProps {
  proposalId: string;
}

const IntegrationInsights = ({ proposalId }: IntegrationInsightsProps) => {
  const [integrationData, setIntegrationData] = useState<IntegrationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getProposalIntegrationData(proposalId);
        setIntegrationData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch integration data:', err);
        setError('Unable to load external data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (proposalId) {
      fetchData();
    }
  }, [proposalId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-consensus-blue mr-2" />
        <span className="text-sm text-consensus-grey-600">Loading external data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (integrationData.length === 0) {
    return (
      <div className="p-6 bg-consensus-grey-50 rounded-lg text-center border border-consensus-grey-200">
        <p className="text-consensus-grey-600">
          No external data has been integrated yet. Connect external tools to import relevant information.
        </p>
      </div>
    );
  }

  // Group data by source
  const groupedData: Record<string, IntegrationData[]> = {};
  integrationData.forEach(item => {
    if (!groupedData[item.sourceType]) {
      groupedData[item.sourceType] = [];
    }
    groupedData[item.sourceType].push(item);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groupedData).map(([sourceType, items]) => (
        <Card key={sourceType} className="overflow-hidden">
          <CardHeader className="bg-consensus-grey-50 pb-4">
            <CardTitle className="flex items-center">
              {sourceType === 'slack' || sourceType === 'teams' ? (
                <MessageSquare className="h-5 w-5 mr-2 text-consensus-blue" />
              ) : sourceType === 'trello' || sourceType === 'asana' ? (
                <FileText className="h-5 w-5 mr-2 text-consensus-blue" />
              ) : (
                <BarChart className="h-5 w-5 mr-2 text-consensus-blue" />
              )}
              {items[0].sourceName} Insights
            </CardTitle>
            <CardDescription>
              {items.length} items imported from {items[0].sourceName}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="border border-consensus-grey-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{item.title}</h4>
                    {item.sentiment !== undefined && (
                      <Badge className={
                        item.sentiment > 0.6 ? "bg-green-100 text-green-800 hover:bg-green-100" : 
                        item.sentiment < 0.4 ? "bg-red-100 text-red-800 hover:bg-red-100" : 
                        "bg-amber-100 text-amber-800 hover:bg-amber-100"
                      }>
                        {item.sentiment > 0.6 ? "Positive" : 
                         item.sentiment < 0.4 ? "Negative" : 
                         "Neutral"}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-consensus-grey-700 mb-3">
                    {item.content}
                  </p>
                  
                  {item.insights && item.insights.length > 0 && (
                    <div className="bg-consensus-grey-50 p-3 rounded-md mt-2 mb-3">
                      <h5 className="text-sm font-medium mb-2">Key Insights:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {item.insights.map((insight, idx) => (
                          <li key={idx} className="text-sm text-consensus-grey-700">{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {item.url && (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-consensus-blue hover:text-consensus-blue-dark hover:underline"
                    >
                      View in {item.sourceName} <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default IntegrationInsights;
