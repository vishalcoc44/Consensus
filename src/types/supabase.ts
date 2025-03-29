
import { Database as OriginalDatabase } from '@/integrations/supabase/types';

// Extend the original Database type to include our audit_logs table
export interface Database extends OriginalDatabase {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          timestamp: string;
          details: Record<string, any>;
          ip_address: string | null;
          user_agent: string | null;
          hash: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          timestamp?: string;
          details: Record<string, any>;
          ip_address?: string | null;
          user_agent?: string | null;
          hash?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          timestamp?: string;
          details?: Record<string, any>;
          ip_address?: string | null;
          user_agent?: string | null;
          hash?: string | null;
        };
      }
    } & OriginalDatabase['public']['Tables'];
  };
}

// Create a custom supabase client type that includes our extended Database type
export type TypedSupabaseClient = ReturnType<typeof createClient<Database>>;

import { createClient } from '@supabase/supabase-js';
