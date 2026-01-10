import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { analyzeConsensus } from '@/lib/consensusEngine';

export interface AnalyticsData {
	optionSupport: Array<{
		id: string;
		option: string;
		votes: number;
		percentage: number;
		sentiment: number;
		score: number;
	}>;
	sentimentAnalysis: {
		positive: number;
		neutral: number;
		negative: number;
		averageSentiment: number;
	};
	keyThemes: Array<{
		theme: string;
		keywords: string[];
		occurrences: number;
	}>;
	trendData: Array<{
		date: string;
		consensusScore: number;
		sentimentScore: number;
	}>;
	criteriaAnalysis: Array<{
		id: string;
		name: string;
		averageRating: number;
		importance: number;
	}>;
	recommendedOption: string;
	recommendationConfidence: number;
	// New Advanced Metrics
	consensusScore: number;
	participationStats: {
		totalMembers: number;
		votedCount: number;
		turnoutPercentage: number;
	};
	criteriaByOption: Record<string, Record<string, number>>; // optionId -> criterionId -> averageRating
}

export const useRealtimeAnalytics = (proposalId: string | undefined) => {
	const [data, setData] = useState<AnalyticsData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!proposalId) return;

		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				console.log(`Fetching realtime analytics for proposal: ${proposalId}`);

				// Fetch proposal, options, criteria, contributions (with ratings), and existing analysis
				// Also fetch team members count if available
				// Fetch proposal first to get team_id
				const { data: proposal, error: propError } = await supabase
					.from('proposals')
					.select('team_id')
					.eq('id', proposalId)
					.single();

				if (propError) throw propError;

				// Fetch options, criteria, contributions (with ratings), and existing analysis in parallel
				const [optsRes, criteriaRes, contribRes, analysisRes, teamRes] = await Promise.all([
					supabase.from('proposal_options').select('*').eq('proposal_id', proposalId).order('order_index'),
					supabase.from('proposal_criteria').select('*').eq('proposal_id', proposalId).order('order_index'),
					supabase.from('contributions').select('*, contribution_ratings(*)').eq('proposal_id', proposalId),
					supabase.from('proposal_analysis').select('*').eq('proposal_id', proposalId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
					proposal?.team_id
						? supabase.from('team_members').select('*', { count: 'exact', head: true }).eq('team_id', proposal.team_id)
						: Promise.resolve({ count: 0, error: null })
				]);

				if (optsRes.error) throw optsRes.error;
				if (criteriaRes.error) throw criteriaRes.error;
				if (contribRes.error) throw contribRes.error;

				const options = optsRes.data || [];
				const criteria = criteriaRes.data || [];
				const contributions = contribRes.data || [];
				// analysisRes.data might be null if no analysis exists
				const existingAnalysis = analysisRes.data?.analysis_data as Partial<AnalyticsData> || {};
				const totalTeamMembers = teamRes.count || 0;

				// --- Calculate Realtime Metrics using Consensus Engine ---

				// Map to Engine Types
				const engineOptions = options.map(o => ({ id: o.id, title: o.title }));
				const engineContributions = contributions.map(c => ({
					id: c.id,
					selectedOptionId: c.selected_option_id,
					sentimentScore: c.sentiment_score,
					ratings: c.contribution_ratings?.map((r: any) => ({
						criterionId: r.criterion_id,
						value: r.rating
					}))
				}));

				// Run Analysis
				const analysis = analyzeConsensus(engineOptions, engineContributions);

				// 1. Option Support
				const totalVotes = contributions.filter(c => c.selected_option_id).length;
				const optionSupport = options.map(opt => {
					const relevantContributions = contributions.filter(c => c.selected_option_id === opt.id);
					const votes = relevantContributions.length;

					// Calculate option specific sentiment if available, else somewhat neutral/positive default for now
					// Real sentiment comes from NLP, here we can average the 'sentiment_score' column if populated
					const avgSentiment = relevantContributions.length > 0
						? relevantContributions.reduce((sum, c) => sum + (c.sentiment_score ?? 0), 0) / relevantContributions.length
						: 0;

					// Fallback sentiment logic if sentiment_score is mostly null (common in dev)
					// We can assume if they voted for it, they like it (mildly positive)
					const displayedSentiment = avgSentiment || 0.7;

					return {
						id: opt.id,
						option: opt.title,
						votes: votes,
						percentage: totalVotes ? Math.round((votes / totalVotes) * 100) : 0,
						sentiment: displayedSentiment,
						score: Math.min(100, (votes * 10) + (displayedSentiment * 20)) // Simple score algo
					};
				}).sort((a, b) => b.votes - a.votes);

				// 2. Sentiment Analysis (Aggregate from contributions)
				const sentiments = contributions
					.map(c => c.sentiment_score)
					.filter((s): s is number => s !== null);

				let sentimentAnalysis;

				if (sentiments.length > 0) {
					const avg = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
					sentimentAnalysis = {
						positive: sentiments.filter(s => s >= 0.6).length,
						neutral: sentiments.filter(s => s > 0.4 && s < 0.6).length,
						negative: sentiments.filter(s => s <= 0.4).length,
						averageSentiment: avg
					};
				} else {
					// Fallback if no sentiment scores are present (e.g. no NLP engine running)
					// We can try to infer vaguely from ratings? Or just zero it out.
					// Let's use ratings as a proxy if available
					let inferredSentiments: number[] = [];
					contributions.forEach(c => {
						if (c.contribution_ratings && c.contribution_ratings.length > 0) {
							// Avg rating 1-5 maps to 0-1
							const avgRating = c.contribution_ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / c.contribution_ratings.length;
							inferredSentiments.push(avgRating / 5);
						}
					});

					if (inferredSentiments.length > 0) {
						const avg = inferredSentiments.reduce((a, b) => a + b, 0) / inferredSentiments.length;
						sentimentAnalysis = {
							positive: inferredSentiments.filter(s => s >= 0.6).length,
							neutral: inferredSentiments.filter(s => s > 0.4 && s < 0.6).length,
							negative: inferredSentiments.filter(s => s <= 0.4).length,
							averageSentiment: avg
						};
					} else {
						// True fallback - show empty state or relying on mock is bad, return zeros
						sentimentAnalysis = {
							positive: 0,
							neutral: 0,
							negative: 0,
							averageSentiment: 0
						};
					}
				}

				// 3. Trend Data
				// Group contributions by date
				const trendsMap = new Map<string, { count: number, sentimentSum: number, votes: number }>();
				contributions.forEach(c => {
					const date = new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
					const curr = trendsMap.get(date) || { count: 0, sentimentSum: 0, votes: 0 };

					// Use sentiment or rating proxy
					let score = c.sentiment_score ?? 0.5;
					if (c.sentiment_score === null && c.contribution_ratings?.length) {
						score = (c.contribution_ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / c.contribution_ratings.length) / 5;
					}

					trendsMap.set(date, {
						count: curr.count + 1,
						sentimentSum: curr.sentimentSum + score,
						votes: curr.votes + (c.selected_option_id ? 1 : 0)
					});
				});

				const trendData = Array.from(trendsMap.entries())
					.map(([date, val]) => ({
						date,
						consensusScore: Math.min(100, val.votes * 10),
						sentimentScore: Math.round((val.sentimentSum / val.count) * 100)
					}))
					.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

				// Fill with existing if empty (e.g. no contributions yet)
				const finalTrendData = trendData.length > 0 ? trendData : (existingAnalysis.trendData || []);

				// 4. Criteria Analysis (Real Calculation)
				// Data structure: criteria[] has global definitions. contributions[].contribution_ratings[] has values.
				const criteriaMap = new Map<string, { totalRating: number, count: number, weight: number, name: string }>();
				// optionId -> criterionId -> {total, count}
				const criteriaByOptionMap: Record<string, Record<string, { total: number, count: number }>> = {};

				// Initialize map with all criteria to ensure we show everything even if no votes
				criteria.forEach(crit => {
					criteriaMap.set(crit.id, {
						totalRating: 0,
						count: 0,
						weight: crit.weight,
						name: crit.name
					});
				});

				contributions.forEach(c => {
					if (c.selected_option_id && !criteriaByOptionMap[c.selected_option_id]) {
						criteriaByOptionMap[c.selected_option_id] = {};
					}

					if (c.contribution_ratings) {
						c.contribution_ratings.forEach((r: any) => {
							const crit = criteriaMap.get(r.criterion_id);
							if (crit) {
								crit.totalRating += r.rating;
								crit.count += 1;
							}

							// Per Option Stats
							if (c.selected_option_id) {
								if (!criteriaByOptionMap[c.selected_option_id][r.criterion_id]) {
									criteriaByOptionMap[c.selected_option_id][r.criterion_id] = { total: 0, count: 0 };
								}
								criteriaByOptionMap[c.selected_option_id][r.criterion_id].total += r.rating;
								criteriaByOptionMap[c.selected_option_id][r.criterion_id].count += 1;
							}
						});
					}
				});

				const criteriaAnalysis = Array.from(criteriaMap.entries()).map(([id, c]) => ({
					id,
					name: c.name,
					averageRating: c.count > 0 ? c.totalRating / c.count : 0,
					importance: c.weight
				}));

				// Flatten Criteria By Option
				const criteriaByOption: Record<string, Record<string, number>> = {};
				Object.entries(criteriaByOptionMap).forEach(([optId, critData]) => {
					criteriaByOption[optId] = {};
					Object.entries(critData).forEach(([critId, stats]) => {
						criteriaByOption[optId][critId] = stats.count > 0 ? stats.total / stats.count : 0;
					});
				});

				// 5. Themes (Still rely on AI analysis backend as this is NLP)


				// 6. Recommended Option
				const recommendedOption = analysis.recommendedOptionId
					? (options.find(o => o.id === analysis.recommendedOptionId)?.title || 'None')
					: 'None';
				const recommendationConfidence = analysis.recommendationConfidence;

				// 7. Themes
				// Use engine insights if no existing themes from backend AI
				const keyThemes = (existingAnalysis.keyThemes && existingAnalysis.keyThemes.length > 0)
					? existingAnalysis.keyThemes
					: analysis.insights.map((insight, i) => ({
						theme: "Key Insight",
						keywords: [insight],
						occurrences: 1
					}));

				// 8. Participation Stats
				const uniqueVoters = new Set(contributions.map(c => c.user_id)).size;
				const participationStats = {
					totalMembers: totalTeamMembers,
					votedCount: uniqueVoters,
					turnoutPercentage: totalTeamMembers > 0
						? Math.round((uniqueVoters / totalTeamMembers) * 100)
						: 0
				};

				setData({
					optionSupport,
					sentimentAnalysis,
					keyThemes,
					trendData: finalTrendData,
					criteriaAnalysis,
					recommendedOption,
					recommendationConfidence,
					consensusScore: analysis.consensusScore,
					participationStats,
					criteriaByOption
				});

			} catch (err: any) {
				console.error("Error fetching analytics:", err);
				setError(err.message || "Failed to load analytics");
			} finally {
				setLoading(false);
			}
		};

		fetchData();

		// Subscribe to realtime changes on contributions
		const channel = supabase.channel('analytics-realtime')
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'contributions',
				filter: `proposal_id=eq.${proposalId}`
			}, (payload) => {
				console.log("Realtime update received:", payload);
				fetchData(); // Refetch on change
			})
			.subscribe();

		return () => { supabase.removeChannel(channel); };

	}, [proposalId]);

	return { data, loading, error };
};
