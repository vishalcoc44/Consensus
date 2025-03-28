
import { IntegrationSource } from '@/utils/integrationService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';

interface IntegrationCardProps {
  integration: IntegrationSource;
  onClick?: () => void;
}

const IntegrationCard = ({ integration, onClick }: IntegrationCardProps) => {
  // Dynamically get the appropriate Lucide icon
  const IconComponent = LucideIcons[integration.icon as keyof typeof LucideIcons] || LucideIcons.Link;

  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="p-2 bg-consensus-blue/10 rounded-lg mr-3">
              <IconComponent className="h-5 w-5 text-consensus-blue" />
            </div>
            <CardTitle className="text-lg">{integration.name}</CardTitle>
          </div>
          {integration.isConnected && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Connected
            </Badge>
          )}
        </div>
        <CardDescription>{integration.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {integration.isConnected && integration.lastSync && (
          <p className="text-xs text-consensus-grey-500 mb-4">
            Last synchronized: {new Date(integration.lastSync).toLocaleString()}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant={integration.isConnected ? "outline" : "default"}
          className="w-full"
          onClick={onClick}
        >
          {integration.isConnected ? 'Manage Connection' : 'Connect'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IntegrationCard;
