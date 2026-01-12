import { supabase } from '@/integrations/supabase/client';
import type { DecisionTemplate, NewDecisionTemplate, UpdateDecisionTemplate } from '@/types/phase2';

// ============================================================================
// TEMPLATES
// ============================================================================

export async function fetchTemplates(teamId?: string, includePublic = true) {
	let query = supabase
		.from('decision_templates')
		.select('*')
		.order('created_at', { ascending: false });

	if (teamId) {
		if (includePublic) {
			query = query.or(`team_id.eq.${teamId},is_public.eq.true`);
		} else {
			query = query.eq('team_id', teamId);
		}
	} else if (includePublic) {
		query = query.eq('is_public', true);
	}

	const { data, error } = await query;
	if (error) throw error;
	return data as DecisionTemplate[];
}

export async function fetchTemplateById(id: string) {
	const { data, error } = await supabase
		.from('decision_templates')
		.select('*')
		.eq('id', id)
		.single();

	if (error) throw error;
	return data as DecisionTemplate;
}

export async function createTemplate(template: NewDecisionTemplate) {
	const { data, error } = await supabase
		.from('decision_templates')
		.insert(template)
		.select()
		.single();

	if (error) throw error;
	return data as DecisionTemplate;
}

export async function updateTemplate(id: string, updates: UpdateDecisionTemplate) {
	const { data, error } = await supabase
		.from('decision_templates')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data as DecisionTemplate;
}

export async function deleteTemplate(id: string) {
	const { error } = await supabase
		.from('decision_templates')
		.delete()
		.eq('id', id);

	if (error) throw error;
}

// Note: increment_template_use_count RPC function doesn't exist in the database.
// If you want to track template usage, you can either:
// 1. Add a use_count column to decision_templates and create the RPC function
// 2. Or track usage via a separate table
// For now, this function is a no-op stub
export async function incrementTemplateUseCount(_id: string) {
	// No-op: RPC function not implemented
	return;
}
