
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';

const Analytics = () => {
  const { proposalId } = useParams();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set page title
    document.title = 'Analytics - ConsensusAI';

    // In a real app, we would fetch the analysis data from Supabase
    // For now, we're using mock data provided by the VisualizationDashboard component
    console.log(`Loading analysis for proposal: ${proposalId || 'all proposals'}`);

    // Reset error state when the component mounts or proposalId changes
    setError(null);
  }, [proposalId]);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulate API call to run analysis
      setTimeout(() => {
        setIsAnalyzing(false);
        // In a real app, this would be fetched from the API
        setAnalysisData({});

        toast({
          title: "Analysis complete",
          description: "The proposal data has been analyzed successfully."
        });
      }, 2000);
    } catch (err) {
      setIsAnalyzing(false);
      setError("Failed to run analysis. Please try again.");

      toast({
        title: "Analysis failed",
        description: "There was an error running the analysis. Please try again.",
        variant: "destructive"
      });
    }
  };

  const exportAnalysis = async () => {
    if (!dashboardRef.current) return;

    try {
      toast({
        title: "Export initiated",
        description: "Generating PDF report...",
      });

      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#121212', // Dark background for PDF
        ignoreElements: (element) => element.classList.contains('no-print')
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`analysis-report-${proposalId || 'summary'}.pdf`);

      toast({
        title: "Export complete",
        description: "Your report has been downloaded."
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Could not generate PDF report."
      });
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[80vh] text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

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

      <div ref={dashboardRef} className="pb-4">
        <VisualizationDashboard proposalId={proposalId} analysisData={analysisData} isAdmin={true} />
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
