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
          property_name: string;
          registration_number: string;
          pdf_url: string | null;
          risk_score: number;
          status: 'pending' | 'processing' | 'completed' | 'error';
          created_at: string;
          updated_at: string;
          client_id: string | null;
          client_name: string | null;
        };
        Insert: {
          id?: string;
          property_name: string;
          registration_number: string;
          pdf_url?: string | null;
          risk_score?: number;
          status?: 'pending' | 'processing' | 'completed' | 'error';
          created_at?: string;
          updated_at?: string;
          client_id?: string | null;
          client_name?: string | null;
        };
        Update: {
          id?: string;
          property_name?: string;
          registration_number?: string;
          pdf_url?: string | null;
          risk_score?: number;
          status?: 'pending' | 'processing' | 'completed' | 'error';
          created_at?: string;
          updated_at?: string;
          client_id?: string | null;
          client_name?: string | null;
        };
      };
      analysis_details: {
        Row: {
          id: string;
          analysis_id: string;
          extracted_data: Json | null;
          alerts: Json | null;
          chain_of_title: Json | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          extracted_data?: Json | null;
          alerts?: Json | null;
          chain_of_title?: Json | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          analysis_id?: string;
          extracted_data?: Json | null;
          alerts?: Json | null;
          chain_of_title?: Json | null;
          notes?: string | null;
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
