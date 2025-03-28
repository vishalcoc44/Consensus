
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
    icon: 'MessageSquare',
    description: 'Import conversations from Slack channels or direct messages',
    isConnected: false
  },
  {
    id: 'teams',
    type: 'teams',
    name: 'Microsoft Teams',
    icon: 'Users',
    description: 'Connect Microsoft Teams chats and files',
    isConnected: false
  },
  {
    id: 'trello',
    type: 'trello',
    name: 'Trello',
    icon: 'Trello',
    description: 'Import cards and lists from your Trello boards',
    isConnected: false
  },
  {
    id: 'asana',
    type: 'asana',
    name: 'Asana',
    icon: 'CheckSquare',
    description: 'Pull tasks and project data from Asana',
    isConnected: false
  },
  {
    id: 'news',
    type: 'news',
    name: 'News API',
    icon: 'Newspaper',
    description: 'Import relevant news articles for context',
    isConnected: false
  },
  {
    id: 'market',
    type: 'market',
    name: 'Market Data',
    icon: 'BarChart',
    description: 'Get market trends and industry data',
    isConnected: false
  }
];

// Type definition for user_integrations table data
interface UserIntegration {
  id: string;
  type: string;
  is_connected: boolean;
  last_sync?: string;
  auth_data?: Record<string, string>;
}

// Type definition for integration_data table
interface IntegrationDataRow {
  id: string;
  source_id: string;
  source_name: string;
  source_type: string;
  proposal_id: string;
  title: string;
  content: string;
  url?: string;
  sentiment?: number;
  created_at: string;
  related_option_ids?: string[];
  insights?: string[];
}

// Get user's connected integrations
export const getUserIntegrations = async (): Promise<IntegrationSource[]> => {
  try {
    // For local testing, just return the mock data with some connected
    // In a real app, uncomment and use the Supabase query below
    
    /*
    const { data: userIntegrations, error } = await supabase
      .from('user_integrations')
      .select('*');

    if (error) throw error;
    */
    
    // Simulate connected integrations for demo purposes
    const mockConnectedIntegrations: UserIntegration[] = [
      {
        id: 'slack-1',
        type: 'slack',
        is_connected: true,
        last_sync: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'market-1',
        type: 'market',
        is_connected: true,
        last_sync: new Date(Date.now() - 86400000).toISOString(),
      }
    ];

    // Update available integrations with connection status
    return availableIntegrations.map(integration => {
      const connectedIntegration = mockConnectedIntegrations.find(ui => ui.type === integration.id);
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
    // For local testing, just return mock data
    // In a real app, uncomment and use the Supabase query below
    
    /*
    const { data, error } = await supabase
      .from('integration_data')
      .select('*')
      .eq('proposal_id', proposalId);

    if (error) throw error;
    */
    
    // Mock data for development purposes
    const mockIntegrationData: IntegrationDataRow[] = proposalId ? [
      {
        id: '1',
        source_id: 'slack',
        source_name: 'Slack',
        source_type: 'slack',
        proposal_id: proposalId,
        title: 'Team Discussion on Office Location',
        content: 'The team discussed the downtown location and most people mentioned concerns about the commute time, but appreciated the central location for client meetings.',
        url: 'https://slack.com/archives/C01234ABCDE/p123456789',
        sentiment: 0.6,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        related_option_ids: ['1'],
        insights: ['60% of team members prefer central location', 'Commute time is a major concern']
      },
      {
        id: '2',
        source_id: 'market',
        source_name: 'Market Data',
        source_type: 'market',
        proposal_id: proposalId,
        title: 'Office Rent Trends Q3 2023',
        content: 'Commercial real estate in downtown areas has seen a 12% decrease in rent prices over the last quarter, while suburban areas have remained stable.',
        sentiment: 0.8,
        created_at: new Date(Date.now() - 259200000).toISOString(),
        related_option_ids: ['1', '2'],
        insights: ['Downtown rent prices decreased by 12%', 'Suburban rent prices remain stable']
      }
    ] : [];

    return mockIntegrationData.map(item => ({
      id: item.id,
      sourceId: item.source_id,
      sourceName: item.source_name,
      sourceType: item.source_type as IntegrationType,
      proposalId: item.proposal_id,
      title: item.title,
      content: item.content,
      url: item.url,
      sentiment: item.sentiment,
      createdAt: item.created_at,
      relatedOptionIds: item.related_option_ids,
      insights: item.insights
    }));
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
    
    // Uncomment when the table exists in Supabase
    /*
    const { error } = await supabase
      .from('user_integrations')
      .upsert({
        type: integrationType,
        auth_data: authData,
        is_connected: true,
        last_sync: new Date().toISOString()
      });

    if (error) throw error;
    */
    
    console.log(`Connected to ${integrationType} with auth data:`, authData);
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
    
    console.log(`Importing data from ${integrationType} for proposal ${proposalId} with query: ${query}`);
    
    // Simulate a delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data based on the query
    const mockData: IntegrationData[] = [
      {
        id: Date.now().toString(),
        sourceId: integrationType,
        sourceName: integrationType === 'slack' ? 'Slack' : 
                    integrationType === 'teams' ? 'Microsoft Teams' : 
                    integrationType === 'trello' ? 'Trello' : 
                    integrationType === 'asana' ? 'Asana' : 
                    integrationType === 'news' ? 'News API' : 'Market Data',
        sourceType: integrationType,
        proposalId,
        title: `${query} - Search Results`,
        content: `This is simulated content related to "${query}" from ${integrationType}.`,
        createdAt: new Date().toISOString(),
        sentiment: 0.7,
        insights: [`Found 3 items related to "${query}"`]
      }
    ];
    
    // Uncomment when the edge function is set up
    /*
    const { data, error } = await supabase.functions.invoke('fetch-integration-data', {
      body: { 
        integrationType,
        proposalId,
        query
      }
    });

    if (error) throw error;
    
    return data || [];
    */
    
    return mockData;
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
    
    // Simulate analyzing the data
    console.log(`Analyzing ${data.length} items for proposal ${proposalId}`);
    
    // Simulate a delay for realism
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Just add some mock insights to the data
    const analyzedData = data.map(item => ({
      ...item,
      insights: [
        ...(item.insights || []),
        'Auto-analysis complete',
        'Sentiment analysis suggests positive reception',
        'Consider linking to related proposal options'
      ]
    }));
    
    // Uncomment when the edge function is set up
    /*
    const { data: analyzedData, error } = await supabase.functions.invoke('analyze-integration-data', {
      body: { 
        data,
        proposalId
      }
    });

    if (error) throw error;
    */
    
    return analyzedData;
  } catch (error) {
    console.error('Error analyzing integration data:', error);
    return data;
  }
};
