export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          name: string
          email: string | null
          profile_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          player1_id: string
          player2_id: string
          player1_score: number
          player2_score: number
          winner_id: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player1_id: string
          player2_id: string
          player1_score?: number
          player2_score?: number
          winner_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player1_id?: string
          player2_id?: string
          player1_score?: number
          player2_score?: number
          winner_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          description: string | null
          google_meet_link: string | null
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          google_meet_link?: string | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          google_meet_link?: string | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tournament_players: {
        Row: {
          tournament_id: string
          player_id: string
        }
        Insert: {
          tournament_id: string
          player_id: string
        }
        Update: {
          tournament_id?: string
          player_id?: string
        }
      }
      player_stats: {
        Row: {
          player_id: string
          matches_played: number
          matches_won: number
          total_points_scored: number
          created_at: string
          updated_at: string
        }
        Insert: {
          player_id: string
          matches_played?: number
          matches_won?: number
          total_points_scored?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          player_id?: string
          matches_played?: number
          matches_won?: number
          total_points_scored?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

