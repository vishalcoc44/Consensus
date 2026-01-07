-- Enable Row Level Security on proposals
ALTER TABLE IF EXISTS public.proposals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all proposals
CREATE POLICY IF NOT EXISTS "Users can view all proposals" 
  ON public.proposals 
  FOR SELECT 
  USING (true);

-- Policy: Users can create proposals
CREATE POLICY IF NOT EXISTS "Users can create proposals" 
  ON public.proposals 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update their own proposals
CREATE POLICY IF NOT EXISTS "Users can update their own proposals" 
  ON public.proposals 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Policy: Users can delete their own proposals
CREATE POLICY IF NOT EXISTS "Users can delete their own proposals" 
  ON public.proposals 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Enable Row Level Security on proposal_analysis
ALTER TABLE IF EXISTS public.proposal_analysis ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all proposal analysis
CREATE POLICY IF NOT EXISTS "Users can view all proposal analysis" 
  ON public.proposal_analysis 
  FOR SELECT 
  USING (true);

-- Policy: Users can create proposal analysis if they created the proposal
CREATE POLICY IF NOT EXISTS "Users can create proposal analysis" 
  ON public.proposal_analysis 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals
      WHERE id = proposal_id AND created_by = auth.uid()
    )
  );

-- Policy: Users can update proposal analysis if they created the proposal
CREATE POLICY IF NOT EXISTS "Users can update proposal analysis" 
  ON public.proposal_analysis 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals
      WHERE id = proposal_id AND created_by = auth.uid()
    )
  );

-- Policy: Users can delete proposal analysis if they created the proposal
CREATE POLICY IF NOT EXISTS "Users can delete proposal analysis" 
  ON public.proposal_analysis 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals
      WHERE id = proposal_id AND created_by = auth.uid()
    )
  ); 