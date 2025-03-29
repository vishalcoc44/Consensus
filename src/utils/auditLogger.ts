
import { supabase } from '@/integrations/supabase/client';

export const logAuthEvent = async (
  action: string, 
  details: Record<string, any>
) => {
  try {
    const timestamp = new Date().toISOString();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;
    
    // Check if the audit_logs table exists before attempting to insert
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        details,
        timestamp,
        ip_address: 'client-side',
        user_agent: navigator.userAgent || 'unknown'
      });
      
    if (error) {
      console.error('Error creating audit log:', error);
    }
  } catch (err) {
    console.error('Audit logging error:', err);
    // Don't throw the error to prevent breaking the auth flow
  }
};
