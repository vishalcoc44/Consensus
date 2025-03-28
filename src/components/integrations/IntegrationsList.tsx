
import { useState, useEffect } from 'react';
import { getUserIntegrations, IntegrationSource } from '@/utils/integrationService';
import IntegrationCard from './IntegrationCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface IntegrationsListProps {
  onSelect?: (integration: IntegrationSource) => void;
}

const IntegrationsList = ({ onSelect }: IntegrationsListProps) => {
  const [integrations, setIntegrations] = useState<IntegrationSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        setIsLoading(true);
        const data = await getUserIntegrations();
        setIntegrations(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch integrations:', err);
        setError('Failed to load integrations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIntegrations();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-consensus-blue" />
        <span className="ml-2 text-consensus-grey-600">Loading integrations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <IntegrationCard 
            key={integration.id} 
            integration={integration} 
            onClick={() => onSelect && onSelect(integration)} 
          />
        ))}
      </div>
      
      {integrations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-consensus-grey-600">No integrations available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntegrationsList;
