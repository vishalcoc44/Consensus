
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";
import { IntegrationData } from "../_shared/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeIntegrationRequest {
  data: IntegrationData[];
  proposalId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request parameters
    const { data, proposalId } = await req.json() as AnalyzeIntegrationRequest;
    
    console.log(`Processing analyze-integration-data request with ${data.length} items for proposal ${proposalId}`);

    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get proposal options to correlate data
    const { data: options, error: optionsError } = await supabase
      .from("proposal_options")
      .select("*")
      .eq("proposal_id", proposalId);

    if (optionsError) {
      console.error(`Error fetching options: ${optionsError.message}`);
      throw new Error(`Error fetching options: ${optionsError.message}`);
    }

    // Simple analysis: associate data with options and extract insights
    // In a real app, this would use NLP/AI to analyze the content
    const analyzedData = data.map(item => {
      // Assign random related options (in a real app, this would be based on content analysis)
      const relatedOptionIds = options
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * options.length) + 1)
        .map(opt => opt.id);

      // Generate insights based on content
      // In a real app, this would use AI to extract meaningful insights
      let generatedInsights = item.insights || [];
      if (!generatedInsights.length) {
        const sentimentWord = item.sentiment && item.sentiment > 0.6 
          ? "positive" 
          : item.sentiment && item.sentiment < 0.4 
            ? "negative" 
            : "neutral";
            
        generatedInsights = [
          `Overall ${sentimentWord} sentiment about this topic`,
          `Relevant to ${relatedOptionIds.length} options under consideration`,
          `Source: ${item.sourceName}`
        ];
      }

      // Update the integration data record with the new insights
      supabase.from("integration_data")
        .update({
          related_option_ids: relatedOptionIds,
          insights: generatedInsights
        })
        .eq("id", item.id)
        .then(({ error }) => {
          if (error) {
            console.error(`Error updating integration data: ${error.message}`);
          }
        });

      return {
        ...item,
        relatedOptionIds,
        insights: generatedInsights
      };
    });

    // Return the analyzed data
    return new Response(JSON.stringify(analyzedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-integration-data function:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
