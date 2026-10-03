import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't crash the whole app — the UI will still render and show a clear
  // error the moment it tries to load data, which is easier to debug than
  // a blank white screen.
  console.error(
    "Missing Supabase environment variables. Copy .env.example to .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see README.md)."
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
