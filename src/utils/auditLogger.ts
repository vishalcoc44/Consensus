
import { typedSupabase } from './supabaseClient';

export const logAuthEvent = async (
  action: string, 
  details: Record<string, any>
) => {
  try {
    const timestamp = new Date().toISOString();
    const { data: { session } } = await typedSupabase.auth.getSession();
    const userId = session?.user?.id || null;
    
    const { error } = await typedSupabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        details,
        timestamp,
        ip_address: 'client-side',
        user_agent: navigator.userAgent
      });
      
    if (error) {
      console.error('Error creating audit log:', error);
    }
  } catch (err) {
    console.error('Audit logging error:', err);
  }
};

export const logAppEvent = async (
  action: string,
  details: Record<string, any>
) => {
  try {
    await logAuthEvent(`app_${action}`, details);
  } catch (err) {
    console.error('App event logging error:', err);
  }
};
