
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";
import { IntegrationType, IntegrationData } from "../_shared/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FetchIntegrationRequest {
  integrationType: IntegrationType;
  proposalId: string;
  query: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request parameters
    const { integrationType, proposalId, query } = await req.json() as FetchIntegrationRequest;

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

    // Mock different types of responses based on integration type
    // In a real app, this would call the actual integration APIs
    let integrationData: IntegrationData[] = [];

    switch (integrationType) {
      case "slack": {
        integrationData = generateSlackData(proposalId, query, proposal.title);
        break;
      }
      case "teams": {
        integrationData = generateTeamsData(proposalId, query, proposal.title);
        break;
      }
      case "trello": {
        integrationData = generateTrelloData(proposalId, query, proposal.title);
        break;
      }
      case "asana": {
        integrationData = generateAsanaData(proposalId, query, proposal.title);
        break;
      }
      case "news": {
        integrationData = generateNewsData(proposalId, query, proposal.title);
        break;
      }
      case "market": {
        integrationData = generateMarketData(proposalId, query, proposal.title);
        break;
      }
      default:
        throw new Error(`Unsupported integration type: ${integrationType}`);
    }

    // Save the integration data to the database
    for (const item of integrationData) {
      const { error: saveError } = await supabase.from("integration_data").insert({
        proposal_id: proposalId,
        source_id: item.sourceId,
        source_name: item.sourceName,
        source_type: item.sourceType,
        title: item.title,
        content: item.content,
        url: item.url,
        sentiment: item.sentiment,
        related_option_ids: item.relatedOptionIds,
        insights: item.insights,
      });

      if (saveError) {
        console.error(`Error saving integration data: ${saveError.message}`);
      }
    }

    // Return the integration data
    return new Response(JSON.stringify(integrationData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in fetch-integration-data function:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper functions to generate mock data
function generateSlackData(proposalId: string, query: string, proposalTitle: string): IntegrationData[] {
  return [
    {
      id: crypto.randomUUID(),
      sourceId: "slack",
      sourceName: "Slack",
      sourceType: "slack",
      proposalId,
      title: `Discussion about ${query} in #general`,
      content: `Team members discussed the options for ${proposalTitle}. Majority seem to favor the downtown location due to accessibility, though concerns about cost were raised.`,
      url: "https://slack.com/archives/C01234ABCDE/p1234567890123456",
      sentiment: 0.65,
      createdAt: new Date().toISOString(),
      insights: ["60% favor downtown location", "Main concern is cost", "Accessibility is a key factor"]
    },
    {
      id: crypto.randomUUID(),
      sourceId: "slack",
      sourceName: "Slack",
      sourceType: "slack",
      proposalId,
      title: `${query} cost analysis in #finance`,
      content: `Finance team shared a detailed cost breakdown for all location options. Suburban option appears to be 30% more cost-effective in the long term.`,
      url: "https://slack.com/archives/C09876ZYXWV/p0987654321098765",
      sentiment: 0.48,
      createdAt: new Date().toISOString(),
      insights: ["Suburban location is 30% cheaper", "Long-term savings significant", "Initial setup costs higher for downtown"]
    }
  ];
}

function generateTeamsData(proposalId: string, query: string, proposalTitle: string): IntegrationData[] {
  return [
    {
      id: crypto.randomUUID(),
      sourceId: "teams",
      sourceName: "Microsoft Teams",
      sourceType: "teams",
      proposalId,
      title: `Meeting notes: ${proposalTitle}`,
      content: `Leadership team discussed the ${query} options during weekly meeting. Hybrid solution was proposed as a compromise between cost and accessibility needs.`,
      url: "https://teams.microsoft.com/l/message/19:12345@thread.tacv2/1623456789?groupId=12345",
      sentiment: 0.72,
      createdAt: new Date().toISOString(),
      insights: ["Hybrid solution gaining traction", "Leadership leans toward compromise", "Both cost and accessibility considered important"]
    }
  ];
}

function generateTrelloData(proposalId: string, query: string, proposalTitle: string): IntegrationData[] {
  return [
    {
      id: crypto.randomUUID(),
      sourceId: "trello",
      sourceName: "Trello",
      sourceType: "trello",
      proposalId,
      title: `Location evaluation board`,
      content: `Cards for the ${query} options show that the downtown office has 5 positive comments and 2 negative, while suburban has 3 positive and 4 negative comments.`,
      url: "https://trello.com/c/abc123def/42-location-evaluation",
      sentiment: 0.58,
      createdAt: new Date().toISOString(),
      insights: ["Downtown location has more positive feedback", "Suburban location has more negative comments", "Team engagement higher for downtown option"]
    }
  ];
}

function generateAsanaData(proposalId: string, query: string, proposalTitle: string): IntegrationData[] {
  return [
    {
      id: crypto.randomUUID(),
      sourceId: "asana",
      sourceName: "Asana",
      sourceType: "asana",
      proposalId,
      title: `${proposalTitle} budget tasks`,
      content: `Cost estimates for ${query} have been updated. Downtown: $4,500/month, Suburban: $2,800/month, Hybrid: $3,200/month plus technology costs.`,
      url: "https://app.asana.com/0/12345/67890",
      sentiment: 0.45,
      createdAt: new Date().toISOString(),
      insights: ["Suburban option 38% cheaper than downtown", "Hybrid solution in middle price range", "Technology costs factored into hybrid solution"]
    }
  ];
}

function generateNewsData(proposalId: string, query: string, proposalTitle: string): IntegrationData[] {
  return [
    {
      id: crypto.randomUUID(),
      sourceId: "news",
      sourceName: "News API",
      sourceType: "news",
      proposalId,
      title: `Commercial real estate trends for ${query}`,
      content: `Recent articles indicate downtown office prices decreasing by 15% in the next quarter, while suburban locations remain stable. This may impact the cost analysis for ${proposalTitle}.`,
      url: "https://news-source.com/commercial-real-estate-trends-2023",
      sentiment: 0.62,
      createdAt: new Date().toISOString(),
      insights: ["Downtown prices expected to decrease", "Suburban prices stable", "Market favors downtown investment now"]
    }
  ];
}

function generateMarketData(proposalId: string, query: string, proposalTitle: string): IntegrationData[] {
  return [
    {
      id: crypto.randomUUID(),
      sourceId: "market",
      sourceName: "Market Data",
      sourceType: "market",
      proposalId,
      title: `Industry trends on ${query}`,
      content: `Market analysis shows 67% of similar companies in the industry are adopting hybrid work models combining downtown offices with remote work options.`,
      url: "https://market-data.com/industry-trends/office-space-2023",
      sentiment: 0.78,
      createdAt: new Date().toISOString(),
      insights: ["Industry trend favors hybrid models", "67% of peer companies use hybrid approach", "Full remote work declining in popularity"]
    }
  ];
}
