import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://gmwqspggjksarpgcllka.supabase.co';
const defaultAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdtd3FzcGdnamtzYXJwZ2NsbGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTEyMDIsImV4cCI6MjEwMjI4NzIwMn0.4LikxLXS6opTJdheNqB_-DWA2Z9Khc9CkC8MzzV3Fls';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultAnonKey;

export const isSupabaseConfigured = () => {
  return true; // Credentials embedded as default fallback for Vercel
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
