CREATE TABLE recommendation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  support_weight NUMERIC NOT NULL DEFAULT 0.5,
  criteria_weight NUMERIC NOT NULL DEFAULT 0.3,
  sentiment_weight NUMERIC NOT NULL DEFAULT 0.1,
  historical_data_weight NUMERIC NOT NULL DEFAULT 0.1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy: Allow users to manage their own settings
CREATE POLICY "Allow individual user access" ON recommendation_settings
  FOR ALL USING (auth.uid() = user_id);

-- Recommendations Table
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
  recommended_option_id UUID REFERENCES decision_options(id),
  recommended_option_text TEXT,
  confidence_score NUMERIC,
  explanation TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy for Recommendations
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read" ON recommendations FOR SELECT TO authenticated USING (true);


-- Trigger function to invoke notification
CREATE OR REPLACE FUNCTION handle_new_recommendation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://mtbfxmbvfuhpxegbyewk.supabase.co/functions/v1/notify-recommendation',
    headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || NEW.supabase_service_role_key -- You need to pass the key securely
    ),
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to fire after a new recommendation is inserted
CREATE TRIGGER on_new_recommendation
  AFTER INSERT ON recommendations
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_recommendation(); 