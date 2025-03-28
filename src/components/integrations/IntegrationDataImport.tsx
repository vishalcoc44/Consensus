
import { useState } from 'react';
import { IntegrationSource, importDataFromIntegration, analyzeIntegrationData, IntegrationData } from '@/utils/integrationService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search, Loader2, FileCheck, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IntegrationDataImportProps {
  integration: IntegrationSource;
  proposalId: string;
  onBack: () => void;
  onComplete: (data: IntegrationData[]) => void;
}

const IntegrationDataImport = ({ integration, proposalId, onBack, onComplete }: IntegrationDataImportProps) => {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [importedData, setImportedData] = useState<IntegrationData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      // Import data from the integration
      const data = await importDataFromIntegration(integration.type, proposalId, query);
      
      if (data.length === 0) {
        setError('No data found matching your query');
        setIsImporting(false);
        return;
      }

      setImportedData(data);
      setIsImporting(false);
      setIsAnalyzing(true);

      // Analyze the imported data
      const analyzedData = await analyzeIntegrationData(data, proposalId);
      
      toast({
        title: "Data Imported",
        description: `Successfully imported ${analyzedData.length} items from ${integration.name}`,
      });

      onComplete(analyzedData);
    } catch (err) {
      console.error('Import error:', err);
      setError('Failed to import data. Please try again.');
      setIsImporting(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-fit -ml-2 mb-2"
          onClick={onBack}
          disabled={isImporting || isAnalyzing}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <CardTitle>Import from {integration.name}</CardTitle>
        <CardDescription>
          Search for relevant {integration.type === 'slack' || integration.type === 'teams' ? 'conversations' : 
                              integration.type === 'trello' || integration.type === 'asana' ? 'tasks' : 
                              'content'} to import
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="query" className="text-sm font-medium">
            Search Query
          </label>
          <div className="flex space-x-2">
            <Input
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${integration.name}...`}
              disabled={isImporting || isAnalyzing}
              className="flex-1"
            />
            <Button 
              onClick={handleImport}
              disabled={isImporting || isAnalyzing || !query.trim()}
              variant="secondary"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-consensus-grey-500 mt-1">
            Enter keywords related to your proposal to find relevant information
          </p>
        </div>

        {(isImporting || isAnalyzing) && (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            {isImporting ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-consensus-blue mb-2" />
                <p className="font-medium">Importing data from {integration.name}</p>
                <p className="text-sm text-consensus-grey-600">
                  Searching for relevant content...
                </p>
              </>
            ) : (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-2" />
                <p className="font-medium">Analyzing imported data</p>
                <p className="text-sm text-consensus-grey-600">
                  Processing {importedData.length} items...
                </p>
              </>
            )}
          </div>
        )}

        <div className="pt-2">
          <p className="text-xs text-consensus-grey-500">
            {integration.type === 'slack' || integration.type === 'teams' 
              ? 'Search for conversations, channels, or messages containing your keywords.'
              : integration.type === 'trello' || integration.type === 'asana'
                ? 'Search for boards, cards, or tasks relevant to your proposal.'
                : 'Search for articles, reports, or data relevant to your proposal.'}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleImport}
          disabled={isImporting || isAnalyzing || !query.trim()}
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FileCheck className="mr-2 h-4 w-4" />
              Import Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IntegrationDataImport;
