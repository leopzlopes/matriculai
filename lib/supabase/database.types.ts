export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      analyses: {
        Row: {
          id: string;
          user_id: string;
          property_name: string;
          registration_number: string;
          pdf_url: string | null;
          risk_score: number;
          status: 'pending' | 'processing' | 'completed' | 'error';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_name: string;
          registration_number: string;
          pdf_url?: string | null;
          risk_score?: number;
          status?: 'pending' | 'processing' | 'completed' | 'error';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          property_name?: string;
          registration_number?: string;
          pdf_url?: string | null;
          risk_score?: number;
          status?: 'pending' | 'processing' | 'completed' | 'error';
          created_at?: string;
          updated_at?: string;
        };
      };
      analysis_data: {
        Row: {
          id: string;
          analysis_id: string;
          tab_name: string;
          content: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          tab_name: string;
          content: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          analysis_id?: string;
          tab_name?: string;
          content?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      analysis_status: 'pending' | 'processing' | 'completed' | 'error';
    };
  };
}
