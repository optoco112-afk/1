import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Database = {
  public: {
    Tables: {
      staff: {
        Row: {
          id: string;
          name: string;
          username: string;
          password: string;
          role: 'admin' | 'staff' | 'artist';
          permissions: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          username: string;
          password: string;
          role: 'admin' | 'staff' | 'artist';
          permissions: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          username?: string;
          password?: string;
          role?: 'admin' | 'staff' | 'artist';
          permissions?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          reservation_number: number;
          first_name: string;
          last_name: string;
          phone: string;
          appointment_date: string;
          appointment_time: string;
          total_price: number;
          deposit_paid: number;
          is_paid: boolean;
          deposit_paid_status: boolean;
          rest_paid_status: boolean;
          design_images: string[];
          notes: string | null;
          artist_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reservation_number?: number;
          first_name: string;
          last_name: string;
          phone: string;
          appointment_date: string;
          appointment_time: string;
          total_price: number;
          deposit_paid: number;
          is_paid?: boolean;
          deposit_paid_status?: boolean;
          rest_paid_status?: boolean;
          design_images?: string[];
          notes?: string | null;
          artist_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reservation_number?: number;
          first_name?: string;
          last_name?: string;
          phone?: string;
          appointment_date?: string;
          appointment_time?: string;
          total_price?: number;
          deposit_paid?: number;
          is_paid?: boolean;
          deposit_paid_status?: boolean;
          rest_paid_status?: boolean;
          design_images?: string[];
          notes?: string | null;
          artist_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};