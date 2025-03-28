
import { supabase } from '@/integrations/supabase/client';

// Define integration types
export type IntegrationType = 'slack' | 'teams' | 'trello' | 'asana' | 'news' | 'market';

export interface IntegrationSource {
  id: string;
  type: IntegrationType;
  name: string;
  icon: string;
  description: string;
  isConnected: boolean;
  lastSync?: string;
}

export interface IntegrationData {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceType: IntegrationType;
  proposalId: string;
  title: string;
  content: string;
  url?: string;
  sentiment?: number;
  createdAt: string;
  relatedOptionIds?: string[];
  insights?: string[];
}

// Available integration sources
export const availableIntegrations: IntegrationSource[] = [
  {
    id: 'slack',
    type: 'slack',
    name: 'Slack',
    icon: 'message-square',
    description: 'Import conversations from Slack channels or direct messages',
    isConnected: false
  },
  {
    id: 'teams',
    type: 'teams',
    name: 'Microsoft Teams',
    icon: 'users',
    description: 'Connect Microsoft Teams chats and files',
    isConnected: false
  },
  {
    id: 'trello',
    type: 'trello',
    name: 'Trello',
    icon: 'trello',
    description: 'Import cards and lists from your Trello boards',
    isConnected: false
  },
  {
    id: 'asana',
    type: 'asana',
    name: 'Asana',
    icon: 'check-square',
    description: 'Pull tasks and project data from Asana',
    isConnected: false
  },
  {
    id: 'news',
    type: 'news',
    name: 'News API',
    icon: 'newspaper',
    description: 'Import relevant news articles for context',
    isConnected: false
  },
  {
    id: 'market',
    type: 'market',
    name: 'Market Data',
    icon: 'bar-chart',
    description: 'Get market trends and industry data',
    isConnected: false
  }
];

// Get user's connected integrations
export const getUserIntegrations = async (): Promise<IntegrationSource[]> => {
  try {
    const { data: userIntegrations, error } = await supabase
      .from('user_integrations')
      .select('*');

    if (error) throw error;

    // Update available integrations with connection status
    return availableIntegrations.map(integration => {
      const connectedIntegration = userIntegrations?.find(ui => ui.type === integration.id);
      return {
        ...integration,
        isConnected: !!connectedIntegration,
        lastSync: connectedIntegration?.last_sync || undefined
      };
    });
  } catch (error) {
    console.error('Error fetching user integrations:', error);
    return availableIntegrations;
  }
};

// Get integration data for a specific proposal
export const getProposalIntegrationData = async (proposalId: string): Promise<IntegrationData[]> => {
  try {
    const { data, error } = await supabase
      .from('integration_data')
      .select('*')
      .eq('proposal_id', proposalId);

    if (error) throw error;

    return data?.map(item => ({
      id: item.id,
      sourceId: item.source_id,
      sourceName: item.source_name,
      sourceType: item.source_type,
      proposalId: item.proposal_id,
      title: item.title,
      content: item.content,
      url: item.url,
      sentiment: item.sentiment,
      createdAt: item.created_at,
      relatedOptionIds: item.related_option_ids,
      insights: item.insights
    })) || [];
  } catch (error) {
    console.error('Error fetching integration data:', error);
    return [];
  }
};

// Connect to an integration
export const connectIntegration = async (
  integrationType: IntegrationType, 
  authData: Record<string, string>
): Promise<boolean> => {
  try {
    // In a real application, this would handle OAuth flows
    // For our demo, we'll just simulate a successful connection
    
    const { error } = await supabase
      .from('user_integrations')
      .upsert({
        type: integrationType,
        auth_data: authData,
        is_connected: true,
        last_sync: new Date().toISOString()
      });

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error connecting to ${integrationType}:`, error);
    return false;
  }
};

// Import data from an integration for a proposal
export const importDataFromIntegration = async (
  integrationType: IntegrationType,
  proposalId: string,
  query: string
): Promise<IntegrationData[]> => {
  try {
    // In a real app, this would make API calls to the external service
    // For our demo, we'll call our edge function that simulates retrieving data
    
    const { data, error } = await supabase.functions.invoke('fetch-integration-data', {
      body: { 
        integrationType,
        proposalId,
        query
      }
    });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error(`Error importing data from ${integrationType}:`, error);
    return [];
  }
};

// Analyze integration data to extract insights
export const analyzeIntegrationData = async (
  data: IntegrationData[],
  proposalId: string
): Promise<IntegrationData[]> => {
  try {
    if (data.length === 0) return [];
    
    // Call edge function to analyze the data
    const { data: analyzedData, error } = await supabase.functions.invoke('analyze-integration-data', {
      body: { 
        data,
        proposalId
      }
    });

    if (error) throw error;
    
    return analyzedData || data;
  } catch (error) {
    console.error('Error analyzing integration data:', error);
    return data;
  }
};
