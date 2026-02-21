
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proposalId, parameters } = await req.json() as RecommendationRequest;

    // Default weights
    const weights = {
      supportWeight: parameters?.supportWeight ?? 0.4,
      sentimentWeight: parameters?.sentimentWeight ?? 0.2,
      criteriaWeight: parameters?.criteriaWeight ?? 0.3,
      historicalWeight: parameters?.historicalWeight ?? 0.1,
    };

    // 1. Initialize Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Initialize Gemini
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemma-3-27b" });

    // 3. Fetch all context data
    const [
      { data: proposal },
      { data: options },
      { data: criteria },
      { data: contributions }
    ] = await Promise.all([
      supabase.from("proposals").select("*").eq("id", proposalId).single(),
      supabase.from("proposal_options").select("*").eq("proposal_id", proposalId),
      supabase.from("proposal_criteria").select("*").eq("proposal_id", proposalId),
      supabase.from("contributions").select("*, contribution_ratings(*)").eq("proposal_id", proposalId)
    ]);

    if (!proposal || !options) throw new Error("Proposal data not found");

    // 4. Calculate Heuristic Scores (Needed for Charts)
    const optionScores = options.map((option: any) => {
      // Support Score
      const totalVotes = contributions?.length || 0;
      const optionVotes = contributions?.filter((c: any) => c.selected_option_id === option.id).length || 0;
      const supportScore = totalVotes > 0 ? optionVotes / totalVotes : 0;

      // Sentiment Score
      const optionContributions = contributions?.filter((c: any) => c.selected_option_id === option.id) || [];
      const totalSentiment = optionContributions.reduce((sum: number, c: any) => sum + (c.sentiment_score || 0), 0);
      const sentimentScore = optionContributions.length > 0 ? totalSentiment / optionContributions.length : 0;

      // Criteria Scores
      const criteriaScores: Record<string, number> = {};
      criteria?.forEach((criterion: any) => {
        let totalRating = 0;
        let ratingCount = 0;
        optionContributions.forEach((contribution: any) => {
          const rating = contribution.contribution_ratings?.find((r: any) => r.criterion_id === criterion.id);
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

    // Rank Options
    const rankedOptions = optionScores.map((option: any) => {
      const totalCriteriaWeight = criteria?.reduce((sum: number, c: any) => sum + c.weight, 0) || 1;
      let weightedCriteriaScore = 0;

      criteria?.forEach((criterion: any) => {
        const criterionWeight = criterion.weight / totalCriteriaWeight;
        weightedCriteriaScore += (option.criteriaScores[criterion.id] || 0) * criterionWeight;
      });
      weightedCriteriaScore = weightedCriteriaScore / 5; // Normalize 0-1

      const totalScore =
        weights.supportWeight * option.supportScore +
        weights.sentimentWeight * option.sentimentScore +
        weights.criteriaWeight * weightedCriteriaScore +
        weights.historicalWeight * 0.5;

      return {
        ...option,
        weightedCriteriaScore,
        totalScore: totalScore * 100 // Scale to 0-100 for display
      };
    }).sort((a: any, b: any) => b.totalScore - a.totalScore);


    // 5. Construct Prompt with Calculated Data
    const prompt = `
      Act as an expert AI Mediator and Decision Analyst.
      Analyze the following proposal, calculated scores, and voting data to provide recommendations, consensus analysis, and mediation insights.

      PROPOSAL: ${proposal.title}
      DESCRIPTION: ${proposal.description}

      CALCULATED SCORES (0-100):
      ${rankedOptions.map((o: any) => `- ${o.title}: ${o.totalScore.toFixed(1)} (Support: ${(o.supportScore * 100).toFixed(0)}%, Sentiment: ${(o.sentimentScore * 100).toFixed(0)}%)`).join('\n')}

      OPTIONS:
      ${options.map((o: any) => `- ID ${o.id}: ${o.title} (${o.description || ''})`).join('\n')}

      CRITERIA:
      ${criteria?.map((c: any) => `- ${c.name} (Weight: ${c.weight})`).join('\n') || 'None'}

      COMMENTS:
      ${contributions?.map((c: any) => c.comment ? `- "${c.comment}" (Sentiment: ${c.sentiment_score})` : '').filter(Boolean).join('\n')}

      TASK:
      Generate a JSON response with the following structure:
      {
        "recommendation": {
          "optionId": "id of the best option",
          "confidence": 0-100,
          "reasoning": "broad explanation citing specific data points"
        },
        "consensus": {
          "score": 0-100 (overall agreement level),
          "analysis": "summary of the group dynamic",
          "broadSupportIds": ["list of option IDs with >50% support"],
          "contentiousOptionIds": ["list of option IDs effectively splitting the vote"],
          "suggestedCompromises": [
            {
               "title": "Title for a compromise",
               "description": "Description of the compromise blending top options",
               "reasoning": "Why this bridges the gap",
               "targetIssue": "The specific conflict being resolved",
               "estimatedApproval": 0-100
            }
          ],
          "proposedNewOptions": [
            {
               "title": "Title for a completely new creative option",
               "description": "Description of the new direction",
               "baseOptions": ["ids of options this draws inspiration from"],
               "estimatedApproval": 0-100
            }
          ]
        },
        "mediator": {
          "devilsAdvocate": "Critique of the recommended option to prevent groupthink. Be provocative but constructive.",
          "biasCheck": "Note on any detected bias (e.g. sunk cost, emotional, recency bias). If none, say 'No significant bias detected.'"
        }
      }
      
      Return ONLY valid JSON.
    `;

    // 6. Generate Content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean code fences if present
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const geminiAnalysis = JSON.parse(jsonStr);

    // 7. Merge Results
    const finalAnalysis = {
      ...geminiAnalysis,
      rankedOptions, // Include the calculated scores for UI charts
      parameters: weights
    };

    // 8. Save to Database
    const { error: saveError } = await supabase
      .from("proposal_analysis")
      .upsert({
        proposal_id: proposalId,
        analysis_data: finalAnalysis,
        updated_at: new Date().toISOString(),
      }, { onConflict: "proposal_id" });

    if (saveError) throw saveError;

    return new Response(JSON.stringify(finalAnalysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
