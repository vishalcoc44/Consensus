
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Mock data types
type MockError = {
  message: string;
  details: string;
  hint: string;
  code: string;
};

interface UseQueryProps<T> {
  tableName: string;
  queryFn?: (query: any) => any;
  enabled?: boolean;
  requireAuth?: boolean;
  onSuccess?: (data: T[]) => void;
  onError?: (error: MockError) => void;
  dependencies?: any[];
}

// Mock data for different tables
const mockData: Record<string, any[]> = {
  'profiles': [
    { id: 'user1', full_name: 'John Doe', avatar_url: null },
    { id: 'user2', full_name: 'Jane Smith', avatar_url: null },
  ],
  'teams': [
    { id: 'team1', name: 'Engineering', created_at: '2023-01-01T00:00:00Z' },
    { id: 'team2', name: 'Marketing', created_at: '2023-01-02T00:00:00Z' },
  ],
  'proposals': [
    { id: 'prop1', title: 'New Feature', description: 'Add a new feature', created_at: '2023-01-03T00:00:00Z' },
    { id: 'prop2', title: 'Bug Fix', description: 'Fix critical bug', created_at: '2023-01-04T00:00:00Z' },
  ],
  'contributions': [
    { id: 'contrib1', user_id: 'user1', proposal_id: 'prop1', content: 'I support this', created_at: '2023-01-05T00:00:00Z' },
    { id: 'contrib2', user_id: 'user2', proposal_id: 'prop1', content: 'Great idea', created_at: '2023-01-06T00:00:00Z' },
  ],
};

export function useSupabaseQuery<T>({
  tableName,
  queryFn,
  enabled = true,
  requireAuth = true,
  onSuccess,
  onError,
  dependencies = []
}: UseQueryProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<MockError | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      if (!enabled) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      console.log(`Mock fetching data from ${tableName}...`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get mock data for the table
      const tableData = mockData[tableName] || [];
      
      // Simulate query function by filtering data
      let result = [...tableData];
      if (queryFn) {
        // This is just a placeholder - in a real implementation,
        // we would apply the query function to filter the data
        console.log("Query function provided but not applied in mock implementation");
      }
      
      console.log(`Mock data fetched from ${tableName}:`, result.length, "records");
      
      // Cast the result to T[]
      const typedResult = result as unknown as T[];
      setData(typedResult);
      
      if (onSuccess) {
        onSuccess(typedResult);
      }
    } catch (err: any) {
      console.error(`Error in mock query for ${tableName}:`, err);
      
      const mockError: MockError = {
        message: err.message || `Could not load data from ${tableName}.`,
        details: '',
        hint: '',
        code: 'MOCK_ERROR'
      };
      
      setError(mockError);
      
      if (onError) {
        onError(mockError);
      }
      
      toast({
        title: `Error loading data`,
        description: err.message || `Could not load data from ${tableName}. Please try again later.`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName, enabled, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}
