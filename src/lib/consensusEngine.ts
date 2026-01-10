
/**
 * Consensus Engine & AI Recommendation Logic
 * 
 * This library provides statistical analysis for voting data to determine:
 * 1. Consensus Score: How much agreement there is (0-100)
 * 2. Controversy Score: How polarized the voting is
 * 3. Recommended Option: The scientifically "best" option based on weighted criteria
 */

export interface Rating {
	criterionId: string;
	value: number; // 1-5 or similar scale
	weight?: number; // Importance of this criterion (1-10)
}

export interface Contribution {
	id: string;
	selectedOptionId: string | null;
	ratings?: Rating[];
	sentimentScore?: number; // -1 to 1 derived from NLP
}

export interface Option {
	id: string;
	title: string;
}

export interface AnalysisResult {
	consensusScore: number;
	controversyScore: number;
	recommendedOptionId: string | null;
	recommendationConfidence: number; // 0-100
	insights: string[];
	rankedOptions: Array<{
		id: string;
		title: string;
		supportScore: number;
		sentimentScore: number;
		criteriaScores: Record<string, number>;
		weightedCriteriaScore: number;
		totalScore: number;
	}>;
}

/**
 * Calculates the Standard Deviation of a set of numbers.
 * Lower SD = Higher Consensus.
 */
function calculateStandardDeviation(values: number[]): number {
	if (values.length === 0) return 0;
	const mean = values.reduce((a, b) => a + b, 0) / values.length;
	const squareDiffs = values.map(value => Math.pow(value - mean, 2));
	const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
	return Math.sqrt(avgSquareDiff);
}

/**
 * Calculates a Consensus Score (0-100).
 * 100 = Perfect Agreement (all votes identical).
 * 0 = Maximum Disagreement (polarized).
 */
export function calculateConsensusScore(values: number[], maxRange: number = 5): number {
	if (values.length < 2) return 100; // Single data point is technically consensus

	const sd = calculateStandardDeviation(values);
	// Max possible SD for a range [0, max] is max/2.
	// We invert this: (1 - (sd / (maxRange/2))) * 100
	// Safe clamp to 0-100
	const normalizedSD = Math.min(sd / (maxRange / 2), 1);
	return Math.round((1 - normalizedSD) * 100);
}

/**
 * Determines the "Best" option based on a weighted multi-objective optimization.
 * Factors:
 * - Popularity (Vote Count)
 * - Quality (Criteria Ratings)
 * - Sentiment (Comment Sentiment)
 */
export function analyzeConsensus(
	options: Option[],
	contributions: Contribution[]
): AnalysisResult {
	if (options.length === 0 || contributions.length === 0) {
		return {
			consensusScore: 0,
			controversyScore: 0,
			recommendedOptionId: null,
			recommendationConfidence: 0,
			insights: ['Insufficient data to generate analysis.'],
			rankedOptions: []
		};
	}

	const resultScores = new Map<string, number>();
	const optionVotes = new Map<string, number>();

	// 1. Gather all ratings across all contributions to calculate global consensus
	// If we rely on generic "support" (option selection), we treat that as nominal data.
	// If we have criteria ratings, we use those for precise consensus.

	const allRatings: number[] = [];

	options.forEach(opt => {
		const optContributions = contributions.filter(c => c.selectedOptionId === opt.id);
		optionVotes.set(opt.id, optContributions.length);

		// Calculate Option Score
		// Base Score = Vote Count * 10
		// Quality Boost = Avg Rating * 20 (if ratings exist)
		// Sentiment Boost = Avg Sentiment * 10

		let qualityScore = 0;
		let sentimentBoost = 0;

		if (optContributions.length > 0) {
			// Quality
			const ratings = optContributions.flatMap(c => c.ratings?.map(r => r.value) || []);
			if (ratings.length > 0) {
				const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
				// Normalize 1-5 to 0-1
				qualityScore = (avgRating / 5) * 50; // max 50 pts
				allRatings.push(...ratings);
			}

			// Sentiment
			const sentiments = optContributions
				.map(c => c.sentimentScore)
				.filter((s): s is number => s !== undefined && s !== null);

			if (sentiments.length > 0) {
				const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
				// Map -1..1 to 0..1 -> (-1+1)/2 = 0, (1+1)/2 = 1.
				// Actually let's just add raw sentiment points (-10 to +10)
				sentimentBoost = avgSentiment * 25;
			}
		}

		// Total Score Calculation
		// We weigh votes heavily as they are the ultimate "decision" unit in this context
		const voteScore = (optContributions.length / contributions.length) * 100;

		const finalScore = voteScore + qualityScore + sentimentBoost;
		resultScores.set(opt.id, finalScore);
	});

	// Find Winner
	const sortedOptions = [...resultScores.entries()].sort((a, b) => b[1] - a[1]);
	const winner = sortedOptions[0];
	const runnerUp = sortedOptions[1];



	const voteCounts = Array.from(optionVotes.values());
	const maxVotes = Math.max(...voteCounts, 1); // Avoid div/0
	const totalVotes = contributions.length;

	// Map detailed ranked options for UI
	const rankedOptions = sortedOptions.map(([optId, totalScore]) => {
		const opt = options.find(o => o.id === optId);
		const voteCount = optionVotes.get(optId) || 0;

		// Retrieve internal partial scores for display if needed, or just normalize total
		// For now, we'll approximate the sub-scores based on our known weights from before
		const percentage = totalVotes > 0 ? (voteCount / totalVotes) : 0;

		return {
			id: optId,
			title: opt?.title || 'Unknown',
			supportScore: percentage, // 0-1
			sentimentScore: 0.5, // Placeholder or real if we track it per option again
			criteriaScores: {},
			weightedCriteriaScore: 0,
			totalScore: Math.min(100, Math.round(totalScore))
		};
	});

	// Recommendation Confidence
	// If winner is far ahead of runner up -> High Confidence
	let confidence = 0;
	if (winner && runnerUp) {
		const diff = winner[1] - runnerUp[1];
		confidence = Math.min(100, (diff / winner[1]) * 100 * 2); // Amplify diff
	} else if (winner) {
		confidence = 80; // Only one option exists/voted for
	} else {
		confidence = 0;
	}

	// Calculate Global Consensus Score
	// If we have ratings, use those. If not, use vote distribution entropy?
	// Let's use vote distribution for simplicity if no ratings.
	// "Consensus" here means "How much do people agree on the WINNER?"
	// Actually, standard interpretation: Low spread = High Consensus.
	// If everyone voted for X, Consensus is 100.

	let consensusScore = 0;

	// Using Vote Distribution for Consensus Measurement (Standard deviation of vote shares)
	// Ideally, if 90% vote A, 10% vote B -> High Consensus
	// If 50% vote A, 50% vote B -> Low Consensus (High Disagreement)



	// Herfindahl-Hirschman Index (HHI) variant for consensus?
	// Let's stick to simple "Majority Dominance" for now.
	// % of votes for the winner
	const winnerVotes = optionVotes.get(winner?.[0] || '') || 0;
	const winnerPercentage = totalVotes > 0 ? (winnerVotes / totalVotes) : 0;

	consensusScore = Math.round(winnerPercentage * 100);

	// Generate Insights
	const insights: string[] = [];
	if (winner) {
		const winnerName = options.find(o => o.id === winner[0])?.title;
		insights.push(`Strongest support detected for **${winnerName}**.`);
	}

	if (consensusScore < 50) {
		insights.push("Low consensus detected. Consider facilitating more discussion to bridge gaps.");
	} else if (consensusScore > 80) {
		insights.push("High consensus achieved. Team is aligned.");
	}

	return {
		consensusScore,
		controversyScore: 100 - consensusScore, // Inverse for now
		recommendedOptionId: winner ? winner[0] : null,
		recommendationConfidence: Math.round(confidence),
		insights,
		rankedOptions
	};
}
