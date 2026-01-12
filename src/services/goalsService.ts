import { supabase } from '@/integrations/supabase/client';
import type {
	Objective,
	KeyResult,
	NewObjective,
	UpdateObjective,
	NewKeyResult,
	UpdateKeyResult,
} from '@/types/phase3';

// ============================================================================
// OBJECTIVES
// ============================================================================

/**
 * Fetch objectives for a team
 */
export async function fetchObjectives(teamId: string, status?: 'active' | 'completed' | 'archived') {
	let query = supabase
		.from('objectives')
		.select('*')
		.eq('team_id', teamId)
		.order('created_at', { ascending: false });

	if (status) {
		query = query.eq('status', status);
	}

	const { data, error } = await query;
	if (error) throw error;
	return data as Objective[];
}

/**
 * Fetch a single objective by ID
 */
export async function fetchObjectiveById(id: string) {
	const { data, error } = await supabase
		.from('objectives')
		.select('*')
		.eq('id', id)
		.single();

	if (error) throw error;
	return data as Objective;
}

/**
 * Create a new objective
 */
export async function createObjective(objective: NewObjective) {
	const { data, error } = await supabase
		.from('objectives')
		.insert(objective)
		.select()
		.single();

	if (error) throw error;
	return data as Objective;
}

/**
 * Update an existing objective
 */
export async function updateObjective(id: string, updates: UpdateObjective) {
	const { data, error } = await supabase
		.from('objectives')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data as Objective;
}

/**
 * Delete an objective
 */
export async function deleteObjective(id: string) {
	const { error } = await supabase
		.from('objectives')
		.delete()
		.eq('id', id);

	if (error) throw error;
}

// ============================================================================
// KEY RESULTS
// ============================================================================

/**
 * Fetch key results for an objective
 */
export async function fetchKeyResults(objectiveId: string) {
	const { data, error } = await supabase
		.from('key_results')
		.select('*')
		.eq('objective_id', objectiveId)
		.order('created_at', { ascending: true });

	if (error) throw error;
	return data as KeyResult[];
}

/**
 * Create a new key result
 */
export async function createKeyResult(keyResult: NewKeyResult) {
	const { data, error } = await supabase
		.from('key_results')
		.insert(keyResult)
		.select()
		.single();

	if (error) throw error;
	return data as KeyResult;
}

/**
 * Update a key result
 */
export async function updateKeyResult(id: string, updates: UpdateKeyResult) {
	const { data, error } = await supabase
		.from('key_results')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data as KeyResult;
}

/**
 * Update key result progress
 */
export async function updateKeyResultProgress(id: string, currentValue: number) {
	return updateKeyResult(id, { current_value: currentValue });
}

/**
 * Delete a key result
 */
export async function deleteKeyResult(id: string) {
	const { error } = await supabase
		.from('key_results')
		.delete()
		.eq('id', id);

	if (error) throw error;
}

/**
 * Calculate objective progress based on key results
 */
export async function calculateObjectiveProgress(objectiveId: string): Promise<number> {
	const keyResults = await fetchKeyResults(objectiveId);

	if (keyResults.length === 0) return 0;

	const totalProgress = keyResults.reduce((sum, kr) => {
		if (kr.metric_type === 'percentage') {
			return sum + (kr.current_value || 0);
		} else if (kr.metric_type === 'number' && kr.target_value) {
			const progress = (kr.current_value / kr.target_value) * 100;
			return sum + Math.min(progress, 100);
		} else if (kr.metric_type === 'boolean') {
			return sum + (kr.current_value ? 100 : 0);
		}
		return sum;
	}, 0);

	return Math.round(totalProgress / keyResults.length);
}

/**
 * Fetch objectives with their key results
 */
export async function fetchObjectivesWithKeyResults(teamId: string) {
	const objectives = await fetchObjectives(teamId);

	const objectivesWithKRs = await Promise.all(
		objectives.map(async (objective) => ({
			...objective,
			key_results: await fetchKeyResults(objective.id),
		}))
	);

	return objectivesWithKRs;
}
