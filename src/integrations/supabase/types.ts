export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          details: Json
          id: string
          ip_address: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          details?: Json
          id?: string
          ip_address?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: Json
          id?: string
          ip_address?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contribution_files: {
        Row: {
          content_type: string
          contribution_id: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          id: string
        }
        Insert: {
          content_type: string
          contribution_id: string
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
        }
        Update: {
          content_type?: string
          contribution_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contribution_files_contribution_id_fkey"
            columns: ["contribution_id"]
            isOneToOne: false
            referencedRelation: "contributions"
            referencedColumns: ["id"]
          },
        ]
      }
      contribution_ratings: {
        Row: {
          contribution_id: string
          created_at: string
          criterion_id: string
          id: string
          rating: number
        }
        Insert: {
          contribution_id: string
          created_at?: string
          criterion_id: string
          id?: string
          rating: number
        }
        Update: {
          contribution_id?: string
          created_at?: string
          criterion_id?: string
          id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "contribution_ratings_contribution_id_fkey"
            columns: ["contribution_id"]
            isOneToOne: false
            referencedRelation: "contributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contribution_ratings_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "proposal_criteria"
            referencedColumns: ["id"]
          },
        ]
      }
      contributions: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          proposal_id: string
          selected_option_id: string | null
          sentiment_score: number | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          proposal_id: string
          selected_option_id?: string | null
          sentiment_score?: number | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          proposal_id?: string
          selected_option_id?: string | null
          sentiment_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "proposal_options"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_data: {
        Row: {
          content: string
          created_at: string
          id: string
          insights: string[] | null
          proposal_id: string
          related_option_ids: string[] | null
          sentiment: number | null
          source_id: string
          source_name: string
          source_type: string
          title: string
          url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          insights?: string[] | null
          proposal_id: string
          related_option_ids?: string[] | null
          sentiment?: number | null
          source_id: string
          source_name: string
          source_type: string
          title: string
          url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          insights?: string[] | null
          proposal_id?: string
          related_option_ids?: string[] | null
          sentiment?: number | null
          source_id?: string
          source_name?: string
          source_type?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      proposal_analysis: {
        Row: {
          analysis_data: Json
          created_at: string
          id: string
          proposal_id: string
          updated_at: string
        }
        Insert: {
          analysis_data: Json
          created_at?: string
          id?: string
          proposal_id: string
          updated_at?: string
        }
        Update: {
          analysis_data?: Json
          created_at?: string
          id?: string
          proposal_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_analysis_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_criteria: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          order_index: number
          proposal_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          order_index: number
          proposal_id: string
          weight: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          proposal_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_criteria_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_options: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_index: number
          proposal_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_index: number
          proposal_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          proposal_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_options_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          id: string
          status: string
          team_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          status?: string
          team_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          status?: string
          team_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          auth_data: Json | null
          created_at: string
          id: string
          is_connected: boolean
          last_sync: string | null
          type: string
          user_id: string
        }
        Insert: {
          auth_data?: Json | null
          created_at?: string
          id?: string
          is_connected?: boolean
          last_sync?: string | null
          type: string
          user_id: string
        }
        Update: {
          auth_data?: Json | null
          created_at?: string
          id?: string
          is_connected?: boolean
          last_sync?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_team_admin: {
        Args: {
          team_id: string
        }
        Returns: boolean
      }
      is_team_member: {
        Args: {
          team_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
