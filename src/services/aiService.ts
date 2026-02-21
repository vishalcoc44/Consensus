import { supabase } from '@/integrations/supabase/client';
import type { AIInsight, NewAIInsight, InsightType } from '@/types/phase3';

// ============================================================================
// AI INSIGHTS
// ============================================================================

/**
 * Transform raw DB insight to include UI-friendly fields
 */
function transformInsight(raw: any): AIInsight {
	return {
		...raw,
		// Add UI-friendly aliases
		description: raw.content?.description || raw.content?.summary || raw.title,
		confidence: raw.confidence_score ? Math.round(raw.confidence_score * 100) : null,
	};
}

/**
 * Fetch insights for a proposal
 */
export async function fetchInsights(proposalId: string, type?: InsightType) {
	let query = supabase
		.from('ai_insights')
		.select('*')
		.eq('proposal_id', proposalId)
		.order('generated_at', { ascending: false });

	if (type) {
		query = query.eq('insight_type', type);
	}

	const { data, error } = await query;
	if (error) throw error;
	return (data || []).map(transformInsight) as AIInsight[];
}

/**
 * Fetch insights for all proposals in a team
 * Used by the AI Insights dashboard page
 */
export async function fetchInsightsByTeam(teamId: string, type?: InsightType) {
	// Query ai_insights by joining through proposals to filter by team_id
	let query = supabase
		.from('ai_insights')
		.select(`
			*,
			proposals!inner(team_id)
		`)
		.eq('proposals.team_id', teamId)
		.order('generated_at', { ascending: false });

	if (type) {
		query = query.eq('insight_type', type);
	}

	const { data, error } = await query;
	if (error) throw error;

	// Transform and add team_id to each insight
	return (data || []).map((row: any) => ({
		...transformInsight(row),
		team_id: teamId,
	})) as AIInsight[];
}

/**
 * Generate a new AI insight for the team or proposal
 * Calls the `generate-insights` Edge Function
 */
export async function generateInsight(
	teamId: string,
	proposalId: string | null,
	insightType: InsightType
): Promise<AIInsight | null> {
	try {
		// If no proposalId is provided, we might need a way to support team-level insights
		// For now, if proposalId is missing, we'll fetch the latest proposal for the team to analyze
		let targetProposalId = proposalId;

		if (!targetProposalId) {
			const { data: latestProposal } = await supabase
				.from('proposals')
				.select('id')
				.eq('team_id', teamId)
				.order('created_at', { ascending: false })
				.limit(1)
				.single();

			if (latestProposal) {
				targetProposalId = latestProposal.id;
			} else {
				throw new Error("No proposals found for this team to analyze.");
			}
		}

		console.log('Generating insight...', { targetProposalId, insightType });

		const { data, error } = await supabase.functions.invoke('generate-insights', {
			body: {
				proposalId: targetProposalId,
				insightType: insightType
			},
		});

		if (error) {
			console.error('Edge Function Error:', error);
			throw error;
		}

		// The edge function returns the raw inserted record. Transform it.
		return transformInsight(data);
	} catch (error) {
		console.error('Failed to generate insight:', error);
		throw error;
	}
}

// ... existing deleteInsight ...
// ... existing fetchInsightById ...
// ... existing createInsight ...
// ... existing deleteExpiredInsights ...

/**
 * Generate multiple insights for a proposal (batch)
 * This works by calling the unified generateInsight for specific types if needed, 
 * or we can rely on the robust single generation.
 * For backward compatibility with the existing simple `generateInsights` call:
 */
export async function generateInsights(proposalId: string) {
	// Generate a general insight
	return generateInsight('ignored-team-id', proposalId, 'pattern_analysis');
}

/**
 * Analyze sentiment for a proposal
 */
export async function analyzeSentiment(proposalId: string) {
	const insights = await fetchInsights(proposalId, 'sentiment');

	// Return most recent sentiment, or generate if none exist
	if (insights.length > 0) {
		return insights[0];
	}

	// Trigger generation
	await generateInsights(proposalId);
	const newInsights = await fetchInsights(proposalId, 'sentiment');
	return newInsights[0] || null;
}

/**
 * Predict outcome for a proposal
 */
export async function predictOutcome(proposalId: string) {
	const insights = await fetchInsights(proposalId, 'prediction');

	if (insights.length > 0) {
		return insights[0];
	}

	await generateInsights(proposalId);
	const newInsights = await fetchInsights(proposalId, 'prediction');
	return newInsights[0] || null;
}

/**
 * Detect bias in a proposal
 */
export async function detectBias(proposalId: string) {
	const insights = await fetchInsights(proposalId, 'bias');

	if (insights.length > 0) {
		return insights[0];
	}

	await generateInsights(proposalId);
	const newInsights = await fetchInsights(proposalId, 'bias');
	return newInsights[0] || null;
}

/**
 * Get suggestions for a proposal
 */
export async function getSuggestions(proposalId: string) {
	return fetchInsights(proposalId, 'suggestion');
}

/**
 * Check if insights are stale and need regeneration
 */
export async function areInsightsStale(proposalId: string, maxAgeHours: number = 24): Promise<boolean> {
	const insights = await fetchInsights(proposalId);

	if (insights.length === 0) return true;

	const latestInsight = insights[0];
	const generatedAt = new Date(latestInsight.generated_at);
	const now = new Date();
	const ageHours = (now.getTime() - generatedAt.getTime()) / (1000 * 60 * 60);

	return ageHours > maxAgeHours;
}

/**
 * Refresh insights if stale
 */
export async function refreshInsightsIfStale(proposalId: string) {
	const isStale = await areInsightsStale(proposalId);

	if (isStale) {
		await generateInsights(proposalId);
	}
}
