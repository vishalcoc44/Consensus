import { supabase } from '@/integrations/supabase/client';
import type {
	MeetingRoom,
	MeetingParticipant,
	NewMeetingRoom,
	UpdateMeetingRoom,
	NewMeetingParticipant,
} from '@/types/phase3';

// ============================================================================
// MEETING ROOMS
// ============================================================================

/**
 * Fetch meetings for a team
 */
export async function fetchMeetings(teamId: string, status?: 'scheduled' | 'live' | 'ended') {
	let query = supabase
		.from('meeting_rooms')
		.select('*')
		.eq('team_id', teamId)
		.order('scheduled_start', { ascending: false });

	if (status) {
		query = query.eq('status', status);
	}

	const { data, error } = await query;
	if (error) throw error;
	return data as MeetingRoom[];
}

/**
 * Fetch a single meeting by ID
 */
export async function fetchMeetingById(id: string) {
	const { data, error } = await supabase
		.from('meeting_rooms')
		.select('*')
		.eq('id', id)
		.single();

	if (error) throw error;
	return data as MeetingRoom;
}

/**
 * Create a new meeting
 */
export async function createMeeting(meeting: NewMeetingRoom) {
	const { data, error } = await supabase
		.from('meeting_rooms')
		.insert(meeting)
		.select()
		.single();

	if (error) throw error;
	return data as MeetingRoom;
}

/**
 * Update a meeting
 */
export async function updateMeeting(id: string, updates: UpdateMeetingRoom) {
	const { data, error } = await supabase
		.from('meeting_rooms')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data as MeetingRoom;
}

/**
 * Start a meeting (change status to live)
 */
export async function startMeeting(id: string) {
	return updateMeeting(id, {
		status: 'live',
		actual_start: new Date().toISOString(),
	});
}

/**
 * End a meeting
 */
export async function endMeeting(id: string) {
	return updateMeeting(id, {
		status: 'ended',
		actual_end: new Date().toISOString(),
	});
}

/**
 * Delete a meeting
 */
export async function deleteMeeting(id: string) {
	const { error } = await supabase
		.from('meeting_rooms')
		.delete()
		.eq('id', id);

	if (error) throw error;
}

// ============================================================================
// MEETING PARTICIPANTS
// ============================================================================

/**
 * Fetch participants for a meeting
 */
export async function fetchParticipants(meetingId: string) {
	const { data, error } = await supabase
		.from('meeting_participants')
		.select('*')
		.eq('meeting_id', meetingId)
		.order('joined_at', { ascending: true });

	if (error) throw error;
	return data as MeetingParticipant[];
}

/**
 * Join a meeting
 */
export async function joinMeeting(meetingId: string, userId: string) {
	const participant: NewMeetingParticipant = {
		meeting_id: meetingId,
		user_id: userId,
	};

	const { data, error } = await supabase
		.from('meeting_participants')
		.insert(participant)
		.select()
		.single();

	if (error) throw error;
	return data as MeetingParticipant;
}

/**
 * Leave a meeting
 */
export async function leaveMeeting(meetingId: string, userId: string) {
	const { error } = await supabase
		.from('meeting_participants')
		.update({
			is_active: false,
			left_at: new Date().toISOString(),
		})
		.eq('meeting_id', meetingId)
		.eq('user_id', userId);

	if (error) throw error;
}

/**
 * Check if user is in meeting
 */
export async function isUserInMeeting(meetingId: string, userId: string): Promise<boolean> {
	const { data, error } = await supabase
		.from('meeting_participants')
		.select('id')
		.eq('meeting_id', meetingId)
		.eq('user_id', userId)
		.eq('is_active', true)
		.maybeSingle();

	if (error) throw error;
	return data !== null;
}

/**
 * Subscribe to meeting participant changes (real-time)
 */
export function subscribeToParticipants(
	meetingId: string,
	callback: (participants: MeetingParticipant[]) => void
) {
	const channel = supabase
		.channel(`meeting_${meetingId}`)
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'meeting_participants',
				filter: `meeting_id=eq.${meetingId}`,
			},
			async () => {
				const participants = await fetchParticipants(meetingId);
				callback(participants);
			}
		)
		.subscribe();

	return () => {
		supabase.removeChannel(channel);
	};
}

/**
 * Get active participants count
 */
export async function getActiveParticipantsCount(meetingId: string): Promise<number> {
	const { count, error } = await supabase
		.from('meeting_participants')
		.select('*', { count: 'exact', head: true })
		.eq('meeting_id', meetingId)
		.eq('is_active', true);

	if (error) throw error;
	return count || 0;
}
