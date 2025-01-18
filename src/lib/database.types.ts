export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      code_snippets: {
        Row: {
          id: string
          code: string
          title: string | null
          user_id: string
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          title?: string | null
          user_id: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          title?: string | null
          user_id?: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}