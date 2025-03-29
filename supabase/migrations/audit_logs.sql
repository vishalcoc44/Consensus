
-- Audit logs table for security and compliance
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  hash TEXT -- For blockchain verification (if implemented)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_timestamp_idx ON public.audit_logs(timestamp);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for accessing audit logs
-- Only allow users to view their own logs
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create a policy to allow admins to view all logs
CREATE POLICY "Admins can view all logs"
  ON public.audit_logs
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Create a policy to allow adding audit logs
CREATE POLICY "Allow inserting audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Modify the profiles table to add GDPR-related fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS gdpr_consent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS data_deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS data_encrypted BOOLEAN DEFAULT false;

-- Create user_roles table if it doesn't exist (used by admin policies)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable Row Level Security on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage all roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Create an initial admin role if needed
-- This can be adjusted based on your specific user setup requirements
