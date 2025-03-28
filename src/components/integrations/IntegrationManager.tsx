
import { useState } from 'react';
import { IntegrationSource, IntegrationData } from '@/utils/integrationService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import IntegrationsList from './IntegrationsList';
import IntegrationSetup from './IntegrationSetup';
import IntegrationDataImport from './IntegrationDataImport';
import IntegrationInsights from './IntegrationInsights';
import { PlusCircle, RefreshCcw } from 'lucide-react';

interface IntegrationManagerProps {
  proposalId: string;
}

const IntegrationManager = ({ proposalId }: IntegrationManagerProps) => {
  const [activeTab, setActiveTab] = useState('insights');
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationSource | null>(null);
  const [view, setView] = useState<'list' | 'setup' | 'import'>('list');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleIntegrationSelect = (integration: IntegrationSource) => {
    setSelectedIntegration(integration);
    if (integration.isConnected) {
      setView('import');
    } else {
      setView('setup');
    }
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedIntegration(null);
  };

  const handleSetupComplete = () => {
    if (selectedIntegration) {
      // After connecting, move to import phase
      setView('import');
    }
  };

  const handleImportComplete = () => {
    // After importing, show insights and refresh the insights view
    setActiveTab('insights');
    setView('list');
    setSelectedIntegration(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleRefreshInsights = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="insights">External Insights</TabsTrigger>
            <TabsTrigger value="integrations">Manage Integrations</TabsTrigger>
          </TabsList>
          
          {activeTab === 'insights' && (
            <Button variant="outline" size="sm" onClick={handleRefreshInsights}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          
          {activeTab === 'integrations' && view === 'list' && (
            <Button variant="outline" size="sm" onClick={() => setActiveTab('insights')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Insights
            </Button>
          )}
        </div>
        
        <TabsContent value="insights" className="mt-0">
          <IntegrationInsights proposalId={proposalId} key={refreshKey} />
        </TabsContent>
        
        <TabsContent value="integrations" className="mt-0">
          {view === 'list' && (
            <IntegrationsList onSelect={handleIntegrationSelect} />
          )}
          
          {view === 'setup' && selectedIntegration && (
            <IntegrationSetup 
              integration={selectedIntegration}
              onBack={handleBackToList}
              onComplete={handleSetupComplete}
            />
          )}
          
          {view === 'import' && selectedIntegration && (
            <IntegrationDataImport 
              integration={selectedIntegration}
              proposalId={proposalId}
              onBack={handleBackToList}
              onComplete={handleImportComplete}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationManager;
