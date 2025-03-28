
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

// Type for user_integrations table 
interface UserIntegration {
  id: string;
  user_id: string;
  type: string;
  is_connected: boolean;
  last_sync?: string;
  auth_data?: Record<string, any>;
  created_at: string;
}

// Type for integration_data table
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
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      console.log("User not logged in, returning mock data");
      return availableIntegrations;
    }
    
    // Fetch user's connected integrations
    const { data: userIntegrations, error } = await supabase
      .from('user_integrations')
      .select('*');

    if (error) {
      console.error('Error fetching user integrations:', error);
      throw error;
    }
    
    // If no connected integrations found in database, return default list
    if (!userIntegrations || userIntegrations.length === 0) {
      return availableIntegrations;
    }
    
    // Update available integrations with connection status
    return availableIntegrations.map(integration => {
      const connectedIntegration = userIntegrations.find(
        (ui: UserIntegration) => ui.type === integration.id
      );
      
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
    if (!proposalId) return [];
    
    // Fetch integration data for the proposal
    const { data, error } = await supabase
      .from('integration_data')
      .select('*')
      .eq('proposal_id', proposalId);

    if (error) {
      console.error('Error fetching integration data:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      // If no real data, use mock data for development
      if (proposalId) {
        const mockIntegrationData: IntegrationDataRow[] = [
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
        ];
        
        return mockIntegrationData.map(mapRowToIntegrationData);
      }
      
      return [];
    }
    
    // Map database rows to IntegrationData objects
    return data.map(mapRowToIntegrationData);
  } catch (error) {
    console.error('Error fetching integration data:', error);
    return [];
  }
};

// Helper function to map database row to IntegrationData
const mapRowToIntegrationData = (item: IntegrationDataRow): IntegrationData => ({
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
});

// Connect to an integration
export const connectIntegration = async (
  integrationType: IntegrationType, 
  authData: Record<string, string>
): Promise<boolean> => {
  try {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      console.error('User not logged in');
      return false;
    }
    
    // Store integration connection data
    const { error } = await supabase
      .from('user_integrations')
      .upsert({
        user_id: session.data.session.user.id,
        type: integrationType,
        auth_data: authData,
        is_connected: true,
        last_sync: new Date().toISOString()
      });

    if (error) {
      console.error(`Error connecting to ${integrationType}:`, error);
      throw error;
    }
    
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
    if (!proposalId || !query) {
      console.error('Missing required parameters');
      return [];
    }
    
    console.log(`Importing data from ${integrationType} for proposal ${proposalId} with query: ${query}`);
    
    // Call our edge function to fetch integration data
    const { data, error } = await supabase.functions.invoke('fetch-integration-data', {
      body: { 
        integrationType,
        proposalId,
        query
      }
    });

    if (error) {
      console.error(`Error invoking fetch-integration-data function:`, error);
      throw error;
    }
    
    // If the edge function isn't ready yet, use mock data
    if (!data) {
      console.log('Using mock data since edge function data is not available');
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
      
      return mockData;
    }
    
    return data;
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
    if (data.length === 0 || !proposalId) return [];
    
    console.log(`Analyzing ${data.length} items for proposal ${proposalId}`);
    
    // Call our edge function to analyze the data
    const { data: analyzedData, error } = await supabase.functions.invoke('analyze-integration-data', {
      body: { 
        data,
        proposalId
      }
    });

    if (error) {
      console.error('Error invoking analyze-integration-data function:', error);
      throw error;
    }
    
    // If the edge function isn't ready yet, add mock insights
    if (!analyzedData) {
      console.log('Using mock analysis since edge function data is not available');
      const mockAnalyzedData = data.map(item => ({
        ...item,
        insights: [
          ...(item.insights || []),
          'Auto-analysis complete',
          'Sentiment analysis suggests positive reception',
          'Consider linking to related proposal options'
        ]
      }));
      
      return mockAnalyzedData;
    }
    
    return analyzedData;
  } catch (error) {
    console.error('Error analyzing integration data:', error);
    return data;
  }
};
