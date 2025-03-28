
import { useState } from 'react';
import { IntegrationSource, connectIntegration } from '@/utils/integrationService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IntegrationSetupProps {
  integration: IntegrationSource;
  onBack: () => void;
  onComplete: () => void;
}

const IntegrationSetup = ({ integration, onBack, onComplete }: IntegrationSetupProps) => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!apiKey) {
      setError('API key is required');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Connect to the integration using the provided credentials
      const success = await connectIntegration(integration.type, {
        apiKey,
        workspace: workspace || undefined
      });

      if (success) {
        setIsConnected(true);
        toast({
          title: "Integration Connected",
          description: `Successfully connected to ${integration.name}`,
        });
        // Wait a moment to show success state before completing
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        setError('Failed to connect. Please check your credentials and try again.');
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsConnecting(false);
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
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <CardTitle>Connect to {integration.name}</CardTitle>
        <CardDescription>
          Enter your credentials to connect to {integration.name}
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
          <label htmlFor="apiKey" className="text-sm font-medium">
            API Key / Access Token
          </label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter API key or access token"
            disabled={isConnecting || isConnected}
          />
        </div>

        {(integration.type === 'slack' || integration.type === 'teams') && (
          <div className="space-y-2">
            <label htmlFor="workspace" className="text-sm font-medium">
              Workspace / Organization ID
            </label>
            <Input
              id="workspace"
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              placeholder="Optional: Enter workspace ID"
              disabled={isConnecting || isConnected}
            />
          </div>
        )}

        <div className="pt-2">
          <p className="text-xs text-consensus-grey-500">
            Your credentials are securely stored and used only to fetch data with your permission.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleConnect}
          disabled={isConnecting || isConnected}
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : isConnected ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Connected
            </>
          ) : (
            'Connect'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IntegrationSetup;
