
import { useState, useEffect } from 'react';
import { typedSupabase } from '@/utils/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { PostgrestError } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Define valid table names from Database type
type ValidTableNames = keyof Database['public']['Tables'];

interface UseSupabaseQueryProps<T> {
  tableName: ValidTableNames;
  queryFn?: (query: any) => any;
  enabled?: boolean;
  onSuccess?: (data: T[]) => void;
  onError?: (error: PostgrestError) => void;
  dependencies?: any[];
}

export function useSupabaseQuery<T>({
  tableName,
  queryFn,
  enabled = true,
  onSuccess,
  onError,
  dependencies = []
}: UseSupabaseQueryProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      if (!enabled) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      console.log(`Fetching data from ${tableName}...`);
      
      // Check for authentication first
      const { data: { session } } = await typedSupabase.auth.getSession();
      
      if (!session) {
        console.log("No active session found");
        toast({
          title: "Authentication required",
          description: "Please sign in to access this data",
          variant: "destructive"
        });
        throw new Error("Authentication required");
      }
      
      // Start with a basic query
      let query = typedSupabase.from(tableName).select('*');
      
      // Apply custom query function if provided
      if (queryFn) {
        query = queryFn(query);
      }
      
      const { data: result, error: queryError } = await query;
      
      if (queryError) {
        console.error(`Error fetching data from ${tableName}:`, queryError);
        throw queryError;
      }
      
      console.log(`Data fetched from ${tableName}:`, result?.length || 0, "records");
      
      // Safely cast the result to T[]
      const typedResult = (result || []) as T[];
      setData(typedResult);
      
      if (onSuccess) {
        onSuccess(typedResult);
      }
    } catch (err: any) {
      console.error(`Error in useSupabaseQuery for ${tableName}:`, err);
      if (err.code && err.message) {
        // This is a PostgrestError
        setError(err);
        if (onError) {
          onError(err);
        }
        
        // Show a more specific error message if we can determine what went wrong
        let errorMessage = err.message || `Could not load data from ${tableName}.`;
        
        if (err.code === '42501') {
          errorMessage = "You don't have permission to access this data. This could be due to Row Level Security policies.";
        } else if (err.code === '42P01') {
          errorMessage = `The table "${tableName}" doesn't exist or you don't have access to it.`;
        } else if (err.code === '23505') {
          errorMessage = "A duplicate record already exists.";
        }
        
        toast({
          title: `Error loading data`,
          description: errorMessage,
          variant: 'destructive'
        });
      } else {
        // This is a generic error
        const genericError = {
          message: err.message || `Could not load data from ${tableName}.`,
          details: '',
          hint: '',
          code: 'GENERIC_ERROR'
        } as PostgrestError;
        
        setError(genericError);
        if (onError) {
          onError(genericError);
        }
        
        toast({
          title: `Error loading data`,
          description: err.message || `Could not load data from ${tableName}. Please try again later.`,
          variant: 'destructive'
        });
      }
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
