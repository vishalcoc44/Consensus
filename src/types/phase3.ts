// Phase 3 Database Types
// Auto-generated from Supabase schema

// ============================================================================
// DECISION CALENDAR
// ============================================================================
export interface DecisionEvent {
	id: string;
	proposal_id: string | null; // null for team-level events
	team_id: string;
	event_type: 'deadline' | 'milestone' | 'review';
	title: string;
	description: string | null;
	event_date: string; // TIMESTAMPTZ
	is_completed: boolean;
	created_by: string | null;
	created_at: string;
	updated_at: string;
}

export type NewDecisionEvent = Omit<DecisionEvent, 'id' | 'created_at' | 'updated_at'>;
// Note: proposal_id can be null for team-level events
export type UpdateDecisionEvent = Partial<Omit<DecisionEvent, 'id' | 'proposal_id' | 'team_id' | 'created_at'>>;

// ============================================================================
// GOALS & OKRs
// ============================================================================
export interface Objective {
	id: string;
	team_id: string;
	title: string;
	description: string | null;
	owner_id: string | null;
	parent_objective_id: string | null;
	status: 'active' | 'completed' | 'archived';
	progress: number; // 0-100
	start_date: string | null; // DATE
	target_date: string | null; // DATE
	created_at: string;
	updated_at: string;
}

export interface KeyResult {
	id: string;
	objective_id: string;
	title: string;
	description: string | null;
	metric_type: 'percentage' | 'number' | 'boolean' | null;
	target_value: number | null;
	current_value: number;
	unit: string | null; // '$', '%', 'users', etc.
	proposal_id: string | null;
	created_at: string;
	updated_at: string;
}

export type NewObjective = Omit<Objective, 'id' | 'created_at' | 'updated_at' | 'progress'>;
export type UpdateObjective = Partial<Omit<Objective, 'id' | 'team_id' | 'created_at'>>;

export type NewKeyResult = Omit<KeyResult, 'id' | 'created_at' | 'updated_at' | 'current_value'>;
export type UpdateKeyResult = Partial<Omit<KeyResult, 'id' | 'objective_id' | 'created_at'>>;

// ============================================================================
// MEETING ROOMS
// ============================================================================
export interface MeetingRoom {
	id: string;
	team_id: string;
	proposal_id: string | null;
	title: string;
	description: string | null;
	status: 'scheduled' | 'active' | 'live' | 'ended' | 'completed' | 'cancelled';
	scheduled_start: string | null; // TIMESTAMPTZ
	scheduled_end: string | null; // TIMESTAMPTZ
	scheduled_time?: string | null; // Alias for scheduled_start (UI compatibility)
	actual_start: string | null; // TIMESTAMPTZ
	actual_end: string | null; // TIMESTAMPTZ
	host_id: string | null;
	max_participants: number;
	meeting_link: string | null; // External meeting link (Google Meet, Zoom, etc.)
	participants?: string[]; // Populated from meeting_participants join
	jitsi_room_name?: string | null; // Auto-generated room name for Jitsi Meet
	created_at: string;
	updated_at: string;
}

// Meeting chat message
export interface MeetingMessage {
	id: string;
	meeting_id: string;
	user_id: string;
	content: string;
	created_at: string;
}

export interface MeetingParticipant {
	id: string;
	meeting_id: string;
	user_id: string;
	joined_at: string;
	left_at: string | null;
	is_active: boolean;
}

export type NewMeetingRoom = Omit<MeetingRoom, 'id' | 'created_at' | 'updated_at' | 'actual_start' | 'actual_end' | 'participants' | 'scheduled_time'>;
export type UpdateMeetingRoom = Partial<Omit<MeetingRoom, 'id' | 'team_id' | 'created_at'>>;

export type NewMeetingParticipant = Omit<MeetingParticipant, 'id' | 'joined_at' | 'left_at' | 'is_active'>;

// ============================================================================
// AI INSIGHTS
// ============================================================================
export type InsightType =
	| 'sentiment'
	| 'prediction'
	| 'bias'
	| 'suggestion'
	| 'consensus_prediction'
	| 'bias_detection'
	| 'pattern_analysis'
	| 'recommendations';

export interface AIInsight {
	id: string;
	proposal_id: string;
	team_id?: string; // Populated via proposal join for team-based queries
	insight_type: InsightType;
	title: string;
	description?: string; // UI alias - can be derived from content or title
	content: any; // JSONB - structured insight data
	confidence?: number; // UI alias for confidence_score (0-100 scale)
	confidence_score: number | null; // 0-1 scale (DB)
	generated_at: string;
	expires_at: string | null;
	created_at: string;
}

export type NewAIInsight = Omit<AIInsight, 'id' | 'generated_at' | 'created_at' | 'team_id' | 'description' | 'confidence'>;

// Specific insight content types
export interface SentimentInsight {
	overall_sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
	sentiment_scores: {
		positive: number;
		negative: number;
		neutral: number;
	};
	key_themes: string[];
	emotional_tone: string;
}

export interface PredictionInsight {
	predicted_outcome: string;
	probability: number;
	contributing_factors: Array<{
		factor: string;
		impact: number;
		explanation: string;
	}>;
	risks: string[];
	opportunities: string[];
}

export interface BiasInsight {
	bias_type: string;
	severity: 'low' | 'medium' | 'high';
	description: string;
	affected_areas: string[];
	mitigation_suggestions: string[];
}

export interface SuggestionInsight {
	suggestion_type: 'improvement' | 'alternative' | 'consideration';
	description: string;
	rationale: string;
	implementation_steps?: string[];
	potential_impact: string;
}
