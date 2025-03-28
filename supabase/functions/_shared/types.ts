
export type IntegrationType = 'slack' | 'teams' | 'trello' | 'asana' | 'news' | 'market';

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
