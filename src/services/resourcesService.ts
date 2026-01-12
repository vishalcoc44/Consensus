import { supabase } from '@/integrations/supabase/client';
import type { Resource, NewResource, UpdateResource } from '@/types/phase2';

// ============================================================================
// RESOURCES
// ============================================================================

export async function fetchResources(teamId: string, proposalId?: string) {
	let query = supabase
		.from('resources')
		.select('*')
		.eq('team_id', teamId)
		.order('created_at', { ascending: false });

	if (proposalId) {
		query = query.eq('proposal_id', proposalId);
	}

	const { data, error } = await query;
	if (error) throw error;
	return data as Resource[];
}

export async function fetchResourceById(id: string) {
	const { data, error } = await supabase
		.from('resources')
		.select('*')
		.eq('id', id)
		.single();

	if (error) throw error;
	return data as Resource;
}

export async function createResource(resource: NewResource) {
	const { data, error } = await supabase
		.from('resources')
		.insert(resource)
		.select()
		.single();

	if (error) throw error;
	return data as Resource;
}

export async function updateResource(id: string, updates: UpdateResource) {
	const { data, error } = await supabase
		.from('resources')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data as Resource;
}

export async function deleteResource(id: string) {
	const { error } = await supabase
		.from('resources')
		.delete()
		.eq('id', id);

	if (error) throw error;
}
