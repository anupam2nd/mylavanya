
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tbhqwnlzjsmuhqufwzhb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiaHF3bmx6anNtdWhxdWZ3emhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU5NTk4NTksImV4cCI6MjAzMTUzNTg1OX0.Pb5q6q0O9NruxJ8afLkB8DrBTuWRFKke6HeYeUYPERE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
