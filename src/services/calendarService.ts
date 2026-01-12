import { supabase } from '@/integrations/supabase/client';
import type { DecisionEvent, NewDecisionEvent, UpdateDecisionEvent } from '@/types/phase3';

// ============================================================================
// DECISION CALENDAR - EVENTS
// ============================================================================

/**
 * Fetch events for a team within a date range
 */
export async function fetchEvents(
	teamId: string,
	startDate?: string,
	endDate?: string
) {
	let query = supabase
		.from('decision_events')
		.select('*')
		.eq('team_id', teamId)
		.order('event_date', { ascending: true });

	if (startDate) {
		query = query.gte('event_date', startDate);
	}
	if (endDate) {
		query = query.lte('event_date', endDate);
	}

	const { data, error } = await query;
	if (error) throw error;
	return data as DecisionEvent[];
}

/**
 * Fetch events for a specific proposal
 */
export async function fetchEventsByProposal(proposalId: string) {
	const { data, error } = await supabase
		.from('decision_events')
		.select('*')
		.eq('proposal_id', proposalId)
		.order('event_date', { ascending: true });

	if (error) throw error;
	return data as DecisionEvent[];
}

/**
 * Fetch a single event by ID
 */
export async function fetchEventById(id: string) {
	const { data, error } = await supabase
		.from('decision_events')
		.select('*')
		.eq('id', id)
		.single();

	if (error) throw error;
	return data as DecisionEvent;
}

/**
 * Create a new calendar event
 */
export async function createEvent(event: NewDecisionEvent) {
	const { data, error } = await supabase
		.from('decision_events')
		.insert(event)
		.select()
		.single();

	if (error) throw error;
	return data as DecisionEvent;
}

/**
 * Update an existing event
 */
export async function updateEvent(id: string, updates: UpdateDecisionEvent) {
	const { data, error } = await supabase
		.from('decision_events')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data as DecisionEvent;
}

/**
 * Mark an event as completed
 */
export async function markEventComplete(id: string) {
	return updateEvent(id, { is_completed: true });
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string) {
	const { error } = await supabase
		.from('decision_events')
		.delete()
		.eq('id', id);

	if (error) throw error;
}

/**
 * Fetch upcoming events (next 30 days)
 */
export async function fetchUpcomingEvents(teamId: string, days: number = 30) {
	const today = new Date().toISOString();
	const futureDate = new Date();
	futureDate.setDate(futureDate.getDate() + days);

	return fetchEvents(teamId, today, futureDate.toISOString());
}

/**
 * Fetch overdue events
 */
export async function fetchOverdueEvents(teamId: string) {
	const now = new Date().toISOString();

	const { data, error } = await supabase
		.from('decision_events')
		.select('*')
		.eq('team_id', teamId)
		.eq('is_completed', false)
		.lt('event_date', now)
		.order('event_date', { ascending: false });

	if (error) throw error;
	return data as DecisionEvent[];
}
