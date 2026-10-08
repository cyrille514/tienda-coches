// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nuhubizsvumyespdvzef.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51aHViaXpzdnVteWVzcGR2emVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1OTc5NTQsImV4cCI6MjEwNTE3Mzk1NH0.dTfaobPOhLzN2K0-7gvP7uhY8Evb0ENc3Xft0yGqi8Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);