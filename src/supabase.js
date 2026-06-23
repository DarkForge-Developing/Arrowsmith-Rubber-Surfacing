import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://gvlxecszqgvbqrqqkpit.supabase.co"

const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2bHhlY3N6cWd2YnFycXFrcGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyOTE4NzEsImV4cCI6MjA5NDg2Nzg3MX0.e4-TJyHzv3_pz_t-M3s4lhQpr8dle_unDSNBkGQKHjg"

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)