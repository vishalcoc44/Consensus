import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type Proposal = Database['public']['Tables']['proposals']['Row'];
export type ProposalOption = Database['public']['Tables']['proposal_options']['Row'];
export type ProposalCriterion = Database['public']['Tables']['proposal_criteria']['Row'];
export type Contribution = Database['public']['Tables']['contributions']['Row'];

export interface CreateProposalData {
	title: string;
	description: string;
	deadline: string;
	team_id?: string;
	options: {
		title: string;
		description: string;
		order_index: number;
	}[];
	criteria: {
		name: string;
		description: string;
		weight: number;
		order_index: number;
	}[];
}

export const proposalService = {
	async createProposal(data: CreateProposalData) {
		const { data: { session } } = await supabase.auth.getSession();
		if (!session) throw new Error('Not authenticated');

		// 1. Create Proposal
		const { data: proposal, error: proposalError } = await supabase
			.from('proposals')
			.insert({
				title: data.title,
				description: data.description,
				deadline: data.deadline,
				team_id: data.team_id,
				created_by: session.user.id,
				status: 'active'
			})
			.select()
			.single();

		if (proposalError) throw proposalError;
		if (!proposal) throw new Error('Failed to create proposal');

		// 2. Create Options
		if (data.options.length > 0) {
			const optionsToInsert = data.options.map(opt => ({
				proposal_id: proposal.id,
				title: opt.title,
				description: opt.description,
				order_index: opt.order_index
			}));

			const { error: optionsError } = await supabase
				.from('proposal_options')
				.insert(optionsToInsert);

			if (optionsError) throw optionsError;
		}

		// 3. Create Criteria
		if (data.criteria.length > 0) {
			const criteriaToInsert = data.criteria.map(crit => ({
				proposal_id: proposal.id,
				name: crit.name,
				description: crit.description,
				weight: crit.weight,
				order_index: crit.order_index
			}));

			const { error: criteriaError } = await supabase
				.from('proposal_criteria')
				.insert(criteriaToInsert);

			if (criteriaError) throw criteriaError;
		}

		return proposal;
	},

	async getProposals(teamId?: string) {
		let query = supabase
			.from('proposals')
			.select(`
        *,
        proposal_options(count),
        contributions(count)
      `)
			.order('created_at', { ascending: false });

		if (teamId) {
			query = query.eq('team_id', teamId);
		}

		const { data, error } = await query;
		if (error) throw error;
		return data;
	},

	async getProposalById(id: string) {
		const { data, error } = await supabase
			.from('proposals')
			.select(`
        *,
        options:proposal_options(*),
        criteria:proposal_criteria(*),
        contributions(
            *,
            ratings:contribution_ratings(*)
        ),
        analysis:proposal_analysis(*)
      `)
			.eq('id', id)
			.single();


		if (error) throw error;

		// Transform specifically to match expected frontend structure if needed, 
		// but returning raw data + relations is usually best.
		// Ensure options/criteria are arrays to avoid null checks on frontend
		return {
			...data,
			options: data.options || [],
			criteria: data.criteria || []
		};
	},

	async addContribution(
		proposalId: string,
		optionId: string | null,
		comment: string,
		ratings: Record<string, number> = {}
	) {
		const { data: { session } } = await supabase.auth.getSession();
		if (!session) throw new Error('Not authenticated');

		// 1. Insert Contribution
		const { data: contribution, error: contribError } = await supabase
			.from('contributions')
			.insert({
				proposal_id: proposalId,
				user_id: session.user.id,
				selected_option_id: optionId,
				comment: comment
			})
			.select()
			.single();

		if (contribError) throw contribError;

		// 2. Insert Ratings
		// Ensure ratings is an object before calling entries
		const safeRatings = ratings || {};
		const ratingEntries = Object.entries(safeRatings);
		if (ratingEntries.length > 0) {
			const ratingsToInsert = ratingEntries.map(([criterionId, rating]) => ({
				contribution_id: contribution.id,
				criterion_id: criterionId,
				rating: rating
			}));

			const { error: ratingsError } = await supabase
				.from('contribution_ratings')
				.insert(ratingsToInsert);

			if (ratingsError) throw ratingsError;
		}

		return contribution;
	}
};
