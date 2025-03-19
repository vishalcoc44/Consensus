
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import VisualizationDashboard from '@/components/analytics/VisualizationDashboard';
import { Button } from '@/components/ui/button';
import { Bot, Download, Lightbulb } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Analytics = () => {
  const { proposalId } = useParams();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  useEffect(() => {
    // Set page title
    document.title = 'Analytics - ConsensusAI';
    
    // In a real app, we would fetch the analysis data from Supabase
    // For now, we're using mock data provided by the VisualizationDashboard component
    console.log(`Loading analysis for proposal: ${proposalId}`);
  }, [proposalId]);
  
  const runAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simulate API call to run analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      // In a real app, this would be fetched from the API
      setAnalysisData({});
    }, 2000);
  };
  
  const exportAnalysis = () => {
    // In a real app, this would generate and download a PDF or CSV
    console.log('Exporting analysis...');
    alert('Analysis report would be downloaded here');
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-sf font-bold">Analysis Dashboard</h1>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportAnalysis}>
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
          
          <Button 
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="bg-consensus-blue hover:bg-consensus-blue/90"
          >
            {isAnalyzing ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                Analyzing...
              </>
            ) : (
              <>
                <Bot size={16} className="mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </div>
      
      <VisualizationDashboard proposalId={proposalId} analysisData={analysisData} isAdmin={true} />
    </DashboardLayout>
  );
};

export default Analytics;
