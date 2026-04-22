
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ftjnqctwfkijhvxuhrgl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0am5xY3R3Zmtpamh2eHVocmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTI1NzQsImV4cCI6MjA4NTM2ODU3NH0._lMzegSotOZoPxyIpvevUB1aoAE6b3yc56W2EORVkO4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  console.log("Checking for HAPAZ/PAPAZ in Supabase...");
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .or('Target_Word.eq.HAPAZ,Target_Word.eq.PAPAZ,Dist_1.eq.HAPAZ,Dist_1.eq.PAPAZ,Dist_2.eq.HAPAZ,Dist_2.eq.PAPAZ,Dist_3.eq.HAPAZ,Dist_3.eq.PAPAZ');

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  console.log("Found rows:", JSON.stringify(data, null, 2));
}

checkData();
