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
import ShimmerText from '@/components/ui/effects/ShimmerText';

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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-sf font-bold mb-2 text-foreground flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <ShimmerText className="inline-block">Analytics & Insights</ShimmerText>
          </h1>
          <p className="text-muted-foreground">Real-time visualization of team consensus and sentiment</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 rounded-xl bg-card/50 hover:bg-card border-border/50 hover:border-primary/30 text-foreground transition-all duration-300 backdrop-blur-sm" onClick={handleShareAnalysis}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white transition-all duration-300 shadow-lg hover:shadow-xl" onClick={handleExportReport}>
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="mb-6 animate-fade-in group relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div className="glass-panel p-5 rounded-xl border border-border/50 backdrop-blur-sm bg-card/50 relative">
          <label className="text-sm font-semibold mb-3 block text-foreground flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" />
            Select Decision for Analysis
          </label>
          <div className="max-w-md">
            <Select
              value={selectedProposalId}
              onValueChange={setSelectedProposalId}
              disabled={loadingProposals}
            >
              <SelectTrigger className="w-full rounded-lg bg-background/50 border-border/50 hover:border-primary/30 transition-colors h-11">
                <SelectValue placeholder={loadingProposals ? "Loading..." : "Select a decision..."} />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                {proposals.map((proposal) => (
                  <SelectItem key={proposal.id} value={proposal.id} className="cursor-pointer">
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
    </div>
  );
};

export default Analytics;
