import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import VisualizationDashboard from '@/components/analytics/VisualizationDashboard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Download, Share2, Loader2, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Analytics = () => {
  const { toast } = useToast();
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string>('');
  const [loadingProposals, setLoadingProposals] = useState(true);

  // Realtime hook
  const { data: analyticsData, loading: loadingAnalytics, error } = useRealtimeAnalytics(selectedProposalId);

  useEffect(() => {
    document.title = 'Analytics - ConsensusAI';
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoadingProposals(true);
      const { data, error } = await supabase
        .from('proposals')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setProposals(data);
        setSelectedProposalId(data[0].id);
      }
    } catch (err: any) {
      console.error("Error fetching proposals:", err);
      toast({
        title: "Error loading decisions",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleExportReport = () => {
    toast({
      title: "Report Exported",
      description: "Analysis report downloaded (Simulation).",
    });
  };

  const handleShareAnalysis = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Analysis link copied to clipboard.",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-sf font-bold mb-2 text-foreground">Analytics & Insights</h1>
          <p className="text-muted-foreground">Real-time visualization of team consensus and sentiment</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-background hover:bg-muted text-foreground" onClick={handleShareAnalysis}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button className="gap-2 text-white" onClick={handleExportReport}>
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="mb-6 animate-fade-in bg-card/50 p-4 rounded-xl border border-border backdrop-blur-sm">
        <label className="text-sm font-medium mb-2 block text-muted-foreground">Select Decision for Analysis</label>
        <div className="max-w-md">
          <Select
            value={selectedProposalId}
            onValueChange={setSelectedProposalId}
            disabled={loadingProposals}
          >
            <SelectTrigger className="w-full bg-background border-input">
              <SelectValue placeholder={loadingProposals ? "Loading..." : "Select a decision..."} />
            </SelectTrigger>
            <SelectContent>
              {proposals.map((proposal) => (
                <SelectItem key={proposal.id} value={proposal.id}>
                  {proposal.title}
                </SelectItem>
              ))}
              {proposals.length === 0 && !loadingProposals && (
                <SelectItem value="none" disabled>No decisions available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loadingAnalytics ? (
        <div className="flex flex-col items-center justify-center h-96 animate-fade-in">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Analyzing real-time data...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-96 border border-dashed border-destructive/30 bg-destructive/5 rounded-xl animate-fade-in">
          <BarChart3 className="h-10 w-10 text-destructive/50 mb-4" />
          <p className="text-destructive font-medium">Failed to load analytics</p>
          <p className="text-sm text-destructive/70 mt-1">{error}</p>
        </div>
      ) : (
        <VisualizationDashboard
          proposalId={selectedProposalId}
          analysisData={analyticsData}
          isAdmin={true}
        />
      )}
    </DashboardLayout>
  );
};

export default Analytics;
