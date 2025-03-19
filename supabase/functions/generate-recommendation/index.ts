
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecommendationRequest {
  proposalId: string;
  parameters?: {
    supportWeight: number;
    sentimentWeight: number;
    criteriaWeight: number;
    historicalWeight: number;
  };
}

interface Option {
  id: string;
  title: string;
  supportScore: number;
  sentimentScore: number;
  criteriaScores: Record<string, number>;
}

interface Criterion {
  id: string;
  name: string;
  weight: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the proposal ID from the request
    const { proposalId, parameters } = await req.json() as RecommendationRequest;

    // Default weights if not provided
    const weights = {
      supportWeight: parameters?.supportWeight ?? 0.4,
      sentimentWeight: parameters?.sentimentWeight ?? 0.2,
      criteriaWeight: parameters?.criteriaWeight ?? 0.3,
      historicalWeight: parameters?.historicalWeight ?? 0.1,
    };

    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the proposal details
    const { data: proposal, error: proposalError } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", proposalId)
      .single();

    if (proposalError) {
      throw new Error(`Error fetching proposal: ${proposalError.message}`);
    }

    // Get the options for this proposal
    const { data: options, error: optionsError } = await supabase
      .from("proposal_options")
      .select("*")
      .eq("proposal_id", proposalId)
      .order("order_index");

    if (optionsError) {
      throw new Error(`Error fetching options: ${optionsError.message}`);
    }

    // Get the criteria for this proposal
    const { data: criteria, error: criteriaError } = await supabase
      .from("proposal_criteria")
      .select("*")
      .eq("proposal_id", proposalId)
      .order("order_index");

    if (criteriaError) {
      throw new Error(`Error fetching criteria: ${criteriaError.message}`);
    }

    // Get all contributions for this proposal
    const { data: contributions, error: contributionsError } = await supabase
      .from("contributions")
      .select(`
        *,
        contribution_ratings(*)
      `)
      .eq("proposal_id", proposalId);

    if (contributionsError) {
      throw new Error(`Error fetching contributions: ${contributionsError.message}`);
    }

    // Calculate scores for each option
    const optionScores = options.map(option => {
      // Calculate support score (percentage of votes)
      const totalVotes = contributions.length;
      const optionVotes = contributions.filter(c => c.selected_option_id === option.id).length;
      const supportScore = totalVotes > 0 ? optionVotes / totalVotes : 0;

      // Calculate sentiment score (average sentiment for this option)
      const optionContributions = contributions.filter(c => c.selected_option_id === option.id);
      const totalSentiment = optionContributions.reduce((sum, c) => sum + (c.sentiment_score || 0), 0);
      const sentimentScore = optionContributions.length > 0 ? totalSentiment / optionContributions.length : 0;

      // Calculate criteria scores
      const criteriaScores: Record<string, number> = {};
      
      criteria.forEach(criterion => {
        let totalRating = 0;
        let ratingCount = 0;
        
        optionContributions.forEach(contribution => {
          const rating = contribution.contribution_ratings?.find(r => r.criterion_id === criterion.id);
          if (rating) {
            totalRating += rating.rating;
            ratingCount++;
          }
        });
        
        criteriaScores[criterion.id] = ratingCount > 0 ? totalRating / ratingCount : 0;
      });

      return {
        id: option.id,
        title: option.title,
        supportScore,
        sentimentScore,
        criteriaScores,
      };
    });

    // Apply the machine learning model (random forest simulation)
    // In a real implementation, this would use an actual ML model
    const rankedOptions = optionScores.map(option => {
      // Calculate the weighted criteria score
      const totalCriteriaWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
      let weightedCriteriaScore = 0;
      
      criteria.forEach(criterion => {
        const criterionWeight = criterion.weight / totalCriteriaWeight;
        weightedCriteriaScore += (option.criteriaScores[criterion.id] || 0) * criterionWeight;
      });
      
      // Normalize to 0-1 scale
      weightedCriteriaScore = weightedCriteriaScore / 5; // Ratings are 1-5
      
      // Calculate the total score using the weights
      const totalScore = 
        weights.supportWeight * option.supportScore +
        weights.sentimentWeight * option.sentimentScore +
        weights.criteriaWeight * weightedCriteriaScore +
        weights.historicalWeight * 0.5; // Placeholder for historical data (0.5 is neutral)
      
      return {
        ...option,
        weightedCriteriaScore,
        totalScore,
      };
    }).sort((a, b) => b.totalScore - a.totalScore);

    // Generate explanation for the top recommendation
    let explanation = "";
    const topOption = rankedOptions[0];
    
    if (topOption) {
      const supportPercent = Math.round(topOption.supportScore * 100);
      const sentimentPercent = Math.round(topOption.sentimentScore * 100);
      
      // Find the highest rated criteria for this option
      const topCriteriaId = Object.entries(topOption.criteriaScores)
        .sort(([, a], [, b]) => b - a)[0]?.[0];
      
      const topCriterion = criteria.find(c => c.id === topCriteriaId);
      
      explanation = `"${topOption.title}" is recommended because it has ${supportPercent}% support`;
      
      if (topCriterion) {
        explanation += `, aligns well with the "${topCriterion.name}" criterion`;
      }
      
      if (sentimentPercent > 50) {
        explanation += `, and has positive sentiment (${sentimentPercent}%)`;
      }
      
      explanation += `. This option received the highest overall score of ${topOption.totalScore.toFixed(2)}.`;
    }

    // Generate the confidence score (0-100)
    // In a real implementation, this would be based on model certainty
    const confidenceScore = rankedOptions.length > 1 
      ? Math.min(100, Math.round(((rankedOptions[0].totalScore - rankedOptions[1].totalScore) / rankedOptions[0].totalScore) * 200) + 50)
      : 50;

    // Create the recommendation result
    const recommendation = {
      proposalId,
      recommendedOptionId: rankedOptions[0]?.id,
      recommendedOptionTitle: rankedOptions[0]?.title,
      confidenceScore,
      explanation,
      rankedOptions,
      generatedAt: new Date().toISOString(),
      parameters: weights,
    };

    // Save the recommendation to the database
    const { error: saveError } = await supabase
      .from("proposal_analysis")
      .upsert({
        proposal_id: proposalId,
        analysis_data: {
          recommendation,
          optionScores: rankedOptions,
        },
        updated_at: new Date().toISOString(),
      }, { onConflict: "proposal_id" });

    if (saveError) {
      throw new Error(`Error saving recommendation: ${saveError.message}`);
    }

    // Return the recommendation
    return new Response(JSON.stringify(recommendation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error generating recommendation:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
