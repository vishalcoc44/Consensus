import { createClient } from '@supabase/supabase-js';
import { serve } from "std/server";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Placeholder for sentiment analysis - in a real-world scenario, you'd use a proper library.
const analyzeSentiment = (text: string): number => {
  if (!text) return 0.5; // Neutral default
  const positiveWords = ['good', 'great', 'excellent', 'love', 'support', 'agree'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'oppose', 'disagree'];
  const words = text.toLowerCase().split(/\s+/);
  
  let score = 0.5;
  const wordCount = words.length;
  if (wordCount === 0) return score;

  let sentimentMatches = 0;
  words.forEach(word => {
    if (positiveWords.includes(word)) {
      sentimentMatches++;
      score += 1 / wordCount;
    }
    if (negativeWords.includes(word)) {
      sentimentMatches++;
      score -= 1 / wordCount;
    }
  });

  return Math.max(0, Math.min(1, score)); // Clamp between 0 and 1
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { decision_id } = await req.json();
    if (!decision_id) {
      throw new Error("`decision_id` is required.");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new Response(JSON.stringify({ error: 'User not authenticated.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
        });
    }

    // 1. Fetch all necessary data
    const { data: decision, error: decisionError } = await supabase
      .from('decisions')
      .select('*, decision_options(*), decision_criteria(*)')
      .eq('id', decision_id)
      .single();

    if (decisionError) throw decisionError;

    const { data: inputs, error: inputsError } = await supabase
      .from('decision_inputs')
      .select('*')
      .eq('decision_id', decision_id);

    if (inputsError) throw inputsError;

    // Fetch recommendation settings for the user
    const { data: settingsData, error: settingsError } = await supabase
      .from('recommendation_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
 
    // Use fetched settings or fall back to defaults
    const settings = {
      supportWeight: settingsData?.support_weight ?? 0.5,
      criteriaWeight: settingsData?.criteria_weight ?? 0.3,
      sentimentWeight: settingsData?.sentiment_weight ?? 0.1,
      historicalDataWeight: settingsData?.historical_data_weight ?? 0.1,
    };

    // 2. Calculate scores for each option
    const optionScores = decision.decision_options.map(option => {
      const votes = inputs.filter(i => i.selected_option_id === option.id);
      const supportScore = inputs.length > 0 ? votes.length / inputs.length : 0;

      let criteriaScore = 0;
      if (decision.decision_criteria.length > 0) {
        let totalWeight = 0;
        let weightedSum = 0;
        decision.decision_criteria.forEach(criterion => {
          const criterionId = criterion.id; // The UUID of the criterion
          const weight = criterion.weight || 1; // Default weight if not set
          
          let sumOfRatingsForCriterion = 0;
          let countOfRatingsForCriterion = 0;
          
          inputs.forEach(input => {
            if (input.ratings && typeof input.ratings === 'object' && input.ratings[criterionId] !== undefined) {
              sumOfRatingsForCriterion += input.ratings[criterionId];
              countOfRatingsForCriterion++;
            }
          });
          
          if (countOfRatingsForCriterion > 0) {
            const avgRating = sumOfRatingsForCriterion / countOfRatingsForCriterion;
            weightedSum += (avgRating / 5) * weight; // Assuming rating is out of 5
            totalWeight += weight;
          }
        });
        
        criteriaScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
      }

      let sentimentScore = 0.5; // Default neutral
      const comments = votes.map(v => v.comment).filter(Boolean);
      if(comments.length > 0) {
          const totalSentiment = comments.reduce((acc, comment) => acc + analyzeSentiment(comment), 0);
          sentimentScore = totalSentiment / comments.length;
      }

      // TODO: Incorporate historical data
      const historicalSuccessRate = 0.5; // Placeholder

      const finalScore = (supportScore * settings.supportWeight) +
                         (criteriaScore * settings.criteriaWeight) +
                         (sentimentScore * settings.sentimentWeight) +
                         (historicalSuccessRate * settings.historicalDataWeight);

      return {
        option_id: option.id,
        option_text: option.option_text,
        scores: {
          support: supportScore,
          criteria: criteriaScore,
          sentiment: sentimentScore,
          historical: historicalSuccessRate,
          final: finalScore,
        }
      };
    });

    // 3. Find the best option
    const recommendation = optionScores.reduce((prev, current) => (prev.scores.final > current.scores.final) ? prev : current);

    // 4. Save the recommendation to the database
    const { data: savedRecommendation, error: saveError } = await supabase
      .from('recommendations')
      .insert({
        decision_id: decision.id,
        recommended_option_id: recommendation.option_id,
        recommended_option_text: recommendation.option_text,
        confidence_score: recommendation.scores.final,
        explanation: `Recommended based on a final score of ${(recommendation.scores.final * 100).toFixed(0)}%.`,
        details: recommendation.scores,
      })
      .select()
      .single();

    if (saveError) throw saveError;

    return new Response(JSON.stringify({ recommendation: savedRecommendation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}); 