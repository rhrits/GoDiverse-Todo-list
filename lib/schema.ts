export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: number
          inserted_at: string
          is_complete: boolean | null
          task: string | null
          user_id: string
          assigned_to: string | null      // NEW: user assigned to this task
          due_date: string | null         // NEW: due date (ISO string)
        }
        Insert: {
          id?: number
          inserted_at?: string
          is_complete?: boolean | null
          task?: string | null
          user_id: string
          assigned_to?: string | null     // NEW
          due_date?: string | null        // NEW
        }
        Update: {
          id?: number
          inserted_at?: string
          is_complete?: boolean | null
          task?: string | null
          user_id?: string
          assigned_to?: string | null     // NEW
          due_date?: string | null        // NEW
        }
      }
      notifications: {                    // NEW: notifications table
        Row: {
          id: number
          recipient_id: string
          sender_id: string
          todo_id: number | null
          message: string | null
          is_read: boolean | null
          created_at: string
        }
        Insert: {
          id?: number
          recipient_id: string
          sender_id: string
          todo_id?: number | null
          message?: string | null
          is_read?: boolean | null
          created_at?: string
        }
        Update: {
          id?: number
          recipient_id?: string
          sender_id?: string
          todo_id?: number | null
          message?: string | null
          is_read?: boolean | null
          created_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}