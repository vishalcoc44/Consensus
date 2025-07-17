import React, { useState, useEffect, useCallback } from 'react';
import './../../styles/RecommendationSettings.css';
import { FiSave, FiInfo } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient'; // Import supabase client

interface Settings {
  supportWeight: number;
  criteriaWeight: number;
  sentimentWeight: number;
  historicalDataWeight: number;
}

const RecommendationSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    supportWeight: 50,
    criteriaWeight: 30,
    sentimentWeight: 10,
    historicalDataWeight: 10,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from('recommendation_settings')
        .select('support_weight, criteria_weight, sentiment_weight, historical_data_weight')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "No rows found"
        throw error;
      }

      if (data) {
        setSettings({
          supportWeight: data.support_weight * 100,
          criteriaWeight: data.criteria_weight * 100,
          sentimentWeight: data.sentiment_weight * 100,
          historicalDataWeight: data.historical_data_weight * 100,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);


  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [e.target.name]: Number(e.target.value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setIsSaving(true);
    setError(null);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("You must be logged in to save settings.");

        const { error } = await supabase
            .from('recommendation_settings')
            .upsert({
                user_id: user.id,
                support_weight: settings.supportWeight / 100,
                criteria_weight: settings.criteriaWeight / 100,
                sentiment_weight: settings.sentimentWeight / 100,
                historical_data_weight: settings.historicalDataWeight / 100,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

        if (error) throw error;
        
        alert('Settings saved successfully!');

    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsSaving(false);
    }
  };

  const totalWeight = Object.values(settings).reduce((sum, value) => sum + value, 0);

  if (loading) return <p>Loading settings...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  return (
    <div className="recommendation-settings-container">
      <h2>AI Recommendation Settings</h2>
      <p className="settings-description">
        Adjust the weights of different factors to fine-tune how the AI makes recommendations.
        The total weight must add up to 100%.
      </p>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="supportWeight">
            Support Score Weight ({settings.supportWeight}%)
          </label>
          <input
            type="range"
            id="supportWeight"
            name="supportWeight"
            min="0"
            max="100"
            value={settings.supportWeight}
            onChange={handleSliderChange}
          />
          <p className="field-description">
            <FiInfo /> How much to value the percentage of users who voted for an option.
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="criteriaWeight">
            Weighted Criteria Weight ({settings.criteriaWeight}%)
          </label>
          <input
            type="range"
            id="criteriaWeight"
            name="criteriaWeight"
            min="0"
            max="100"
            value={settings.criteriaWeight}
            onChange={handleSliderChange}
          />
          <p className="field-description">
            <FiInfo /> How much to value the option's ratings against important criteria.
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="sentimentWeight">
            Sentiment Analysis Weight ({settings.sentimentWeight}%)
          </label>
          <input
            type="range"
            id="sentimentWeight"
            name="sentimentWeight"
            min="0"
            max="100"
            value={settings.sentimentWeight}
            onChange={handleSliderChange}
          />
           <p className="field-description">
            <FiInfo /> How much to value the positive/negative sentiment in user comments.
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="historicalDataWeight">
            Historical Data Weight ({settings.historicalDataWeight}%)
          </label>
          <input
            type="range"
            id="historicalDataWeight"
            name="historicalDataWeight"
            min="0"
            max="100"
            value={settings.historicalDataWeight}
            onChange={handleSliderChange}
          />
           <p className="field-description">
            <FiInfo /> How much to value the success rate of similar decisions in the past.
          </p>
        </div>

        <div className="form-footer">
            <div className={`total-weight ${totalWeight !== 100 ? 'unbalanced' : ''}`}>
                Total Weight: {totalWeight}%
                {totalWeight !== 100 && (
                    <span className="weight-warning">Must be 100%</span>
                )}
            </div>
            <button type="submit" className="save-btn" disabled={isSaving || totalWeight !== 100}>
                <FiSave /> {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default RecommendationSettings; 