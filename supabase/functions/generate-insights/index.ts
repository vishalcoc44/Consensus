
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
	if (req.method === "OPTIONS") {
		return new Response(null, { headers: corsHeaders });
	}

	try {
		const { proposalId, insightType = 'pattern_analysis' } = await req.json();

		const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
		const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
		const supabase = createClient(supabaseUrl, supabaseKey);

		const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

		if (!geminiApiKey) {
			// Return helpful mock if no API key
			const mockInsight = {
				proposal_id: proposalId,
				insight_type: insightType,
				title: "Configure AI for Insights",
				content: {
					summary: "Add GEMINI_API_KEY to Supabase secrets to enable real AI analysis. Get key from https://aistudio.google.com/app/apikey"
				},
				confidence_score: 0.5,
				generated_at: new Date().toISOString()
			};

			const { data, error } = await supabase
				.from("ai_insights")
				.insert(mockInsight)
				.select()
				.single();

			if (error) throw error;

			return new Response(JSON.stringify(data), {
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		// Initialize AI
		const genAI = new GoogleGenerativeAI(geminiApiKey);
		const model = genAI.getGenerativeModel({ model: "gemma-3-27b" });

		// Fetch COMPREHENSIVE data
		const [
			{ data: proposal },
			{ data: options },
			{ data: criteria },
			{ data: contributions },
			{ data: team },
			{ data: historicalProposals },
		] = await Promise.all([
			// Current proposal
			supabase.from("proposals").select("*").eq("id", proposalId).single(),

			// Proposal options
			supabase.from("proposal_options").select("*").eq("proposal_id", proposalId),

			// Evaluation criteria
			supabase.from("proposal_criteria").select("*").eq("proposal_id", proposalId),

			// Contributions with ratings
			supabase.from("contributions")
				.select(`
          *,
          contribution_ratings(*)
        `)
				.eq("proposal_id", proposalId),

			// Team member info (if proposal has team_id)
			supabase.from("proposals")
				.select("team_id")
				.eq("id", proposalId)
				.single()
				.then(async ({ data: p }) => {
					if (!p?.team_id) return { data: null };
					return supabase.from("team_members")
						.select("user_id, role, joined_at")
						.eq("team_id", p.team_id);
				}),

			// Historical proposals from same team
			supabase.from("proposals")
				.select("team_id")
				.eq("id", proposalId)
				.single()
				.then(async ({ data: p }) => {
					if (!p?.team_id) return { data: [] };
					return supabase.from("proposals")
						.select("id, title, status, created_at, closed_at")
						.eq("team_id", p.team_id)
						.neq("id", proposalId)
						.order("created_at", { ascending: false })
						.limit(5);
				}),
		]);

		if (!proposal) throw new Error("Proposal not found");

		// Build comprehensive context
		const now = new Date();
		const proposalAge = proposal.created_at
			? Math.floor((now.getTime() - new Date(proposal.created_at).getTime()) / (1000 * 60 * 60 * 24))
			: 0;

		// Calculate metrics
		const totalVotes = contributions?.length || 0;
		const commentCount = contributions?.filter((c: any) => c.comment).length || 0;
		const avgSentiment = totalVotes > 0
			? contributions?.reduce((sum: number, c: any) => sum + (c.sentiment_score || 0), 0) / totalVotes
			: 0;

		// Temporal patterns
		const votesOverTime = contributions?.reduce((acc: any, c: any) => {
			if (!c.created_at) return acc;
			const day = new Date(c.created_at).toISOString().split('T')[0];
			acc[day] = (acc[day] || 0) + 1;
			return acc;
		}, {});

		// Option scores with criteria ratings
		const optionScores = options?.map((option: any) => {
			const optionContribs = contributions?.filter((c: any) => c.selected_option_id === option.id) || [];
			const voteCount = optionContribs.length;
			const avgSentiment = voteCount > 0
				? optionContribs.reduce((sum: number, c: any) => sum + (c.sentiment_score || 0), 0) / voteCount
				: 0;

			// Criteria ratings for this option
			const criteriaScores = criteria?.map((criterion: any) => {
				const ratings = optionContribs
					.flatMap((c: any) => c.contribution_ratings || [])
					.filter((r: any) => r.criterion_id === criterion.id);

				const avgRating = ratings.length > 0
					? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
					: 0;

				return {
					criterion: criterion.name,
					weight: criterion.weight,
					avgRating: avgRating.toFixed(2),
					ratingCount: ratings.length
				};
			}) || [];

			return {
				title: option.title,
				votes: voteCount,
				percentage: totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0,
				avgSentiment: avgSentiment.toFixed(2),
				criteriaScores
			};
		}) || [];

		// Build comprehensive prompt
		const contextPrompt = `
COMPREHENSIVE PROPOSAL ANALYSIS

PROPOSAL DETAILS:
- Title: ${proposal.title}
- Description: ${proposal.description || 'None'}
- Status: ${proposal.status}
- Age: ${proposalAge} days
- Decision Mode: ${proposal.decision_mode || 'simple_majority'}

VOTING OPTIONS (${options?.length || 0}):
${optionScores.map((o: any) =>
			`- ${o.title}: ${o.votes} votes (${o.percentage}%), Sentiment: ${o.avgSentiment}/5
   Criteria Scores: ${o.criteriaScores.map((c: any) => `${c.criterion}=${c.avgRating}/5 (weight:${c.weight})`).join(', ')}`
		).join('\n')}

PARTICIPATION METRICS:
- Total Votes: ${totalVotes}
- Comments: ${commentCount}
- Average Sentiment: ${avgSentiment.toFixed(2)}/5
- Team Size: ${team?.length || 'Unknown'}

EVALUATION CRITERIA (${criteria?.length || 0}):
${criteria?.map((c: any) => `- ${c.name} (Weight: ${c.weight}): ${c.description || 'N/A'}`).join('\n') || 'None defined'}

TEMPORAL PATTERNS:
${Object.entries(votesOverTime || {}).map(([date, count]) => `- ${date}: ${count} votes`).join('\n')}

HISTORICAL CONTEXT:
${historicalProposals?.data?.map((p: any) =>
			`- "${p.title}" (${p.status}, ${p.closed_at ? 'Closed' : 'Active'})`
		).join('\n') || 'No previous proposals'}

USER PARTICIPATION:
${team?.map((m: any) => `- ${m.role} (joined: ${m.joined_at})`).join('\n') || 'Team info not available'}

TASK: Provide a ${insightType} analysis.

Return ONLY valid JSON with this structure (no markdown):
{
  "title": "Brief insight title",
  "content": {
    "summary": "2-3 sentence comprehensive analysis based on ALL the data above"
  },
  "confidence_score": 0.85
}`;

		const result = await model.generateContent(contextPrompt);
		const text = result.response.text().trim();

		let cleanText = text.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

		let aiResult;
		try {
			aiResult = JSON.parse(cleanText);
		} catch (e) {
			aiResult = {
				title: "AI Analysis",
				content: { summary: text.substring(0, 300) },
				confidence_score: 0.7
			};
		}

		const { data, error } = await supabase
			.from("ai_insights")
			.insert({
				proposal_id: proposalId,
				insight_type: insightType,
				title: aiResult.title || "AI Insight",
				content: aiResult.content || { summary: "Analysis complete" },
				confidence_score: aiResult.confidence_score || 0.8,
				generated_at: new Date().toISOString()
			})
			.select()
			.single();

		if (error) throw error;

		return new Response(JSON.stringify(data), {
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});

	} catch (error) {
		console.error("Error:", error);
		return new Response(JSON.stringify({
			error: (error as Error).message
		}), {
			status: 500,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	}
});
