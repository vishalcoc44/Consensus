// Database types for Templates and Resources features
// Auto-generated from Supabase schema

export interface DecisionTemplate {
	id: string;
	title: string;
	description: string | null;
	category: 'hiring' | 'budget' | 'strategy' | 'product' | 'vendor' | 'other' | null;
	framework: 'swot' | 'six-hats' | 'pros-cons' | 'weighted-criteria' | null;
	criteria: any | null; // JSONB - array of criterion objects
	options: any | null; // JSONB - array of option objects
	created_by: string | null;
	team_id: string | null;
	is_public: boolean;
	use_count: number;
	created_at: string;
	updated_at: string;
}

export interface Resource {
	id: string;
	title: string;
	description: string | null;
	file_url: string | null;
	file_type: 'pdf' | 'doc' | 'image' | 'link' | 'video' | 'audio' | 'spreadsheet' | 'code' | 'archive' | 'presentation' | null;
	file_size: number | null;
	tags: string[] | null;
	team_id: string;
	proposal_id: string | null;
	uploaded_by: string | null;
	created_at: string;
	updated_at: string;
}

// Insert types for creating new records
export type NewDecisionTemplate = Omit<DecisionTemplate, 'id' | 'created_at' | 'updated_at' | 'use_count'>;
export type NewResource = Omit<Resource, 'id' | 'created_at' | 'updated_at'>;

// Update types for partial updates
export type UpdateDecisionTemplate = Partial<Omit<DecisionTemplate, 'id' | 'created_at'>>;
export type UpdateResource = Partial<Omit<Resource, 'id' | 'created_at' | 'team_id'>>;
