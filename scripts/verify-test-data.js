// Script to verify test data in Supabase tables
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { config } from 'dotenv';

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Supabase URL or Anon Key not found in environment variables');
  process.exit(1);
}

// Create supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test user credentials
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Test123!';

// Verify test data in Supabase
async function verifyTestData() {
  console.log('=== Verifying Test Data in Supabase ===\n');
  
  try {
    // Sign in as test user
    console.log(`Signing in as ${TEST_EMAIL}...`);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    
    if (signInError) {
      console.error(`❌ Sign in failed: ${signInError.message}`);
      process.exit(1);
    }
    
    console.log('✅ Signed in successfully');
    const userId = signInData.user.id;
    
    // Check profile data
    console.log('\nVerifying profile data...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);
      
    if (profileError) {
      console.error(`❌ Error fetching profile: ${profileError.message}`);
    } else if (profileData && profileData.length > 0) {
      console.log('✅ Profile data verified:');
      console.log(JSON.stringify(profileData[0], null, 2));
    } else {
      console.log('❌ No profile data found');
    }
    
    // Check meetings data
    console.log('\nVerifying meetings data...');
    const { data: meetingsData, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .eq('host_id', userId);
      
    if (meetingsError) {
      console.error(`❌ Error fetching meetings: ${meetingsError.message}`);
    } else if (meetingsData && meetingsData.length > 0) {
      console.log(`✅ Found ${meetingsData.length} meetings`);
      meetingsData.forEach((meeting, index) => {
        console.log(`\nMeeting ${index + 1}:`);
        console.log(`Title: ${meeting.title}`);
        console.log(`Description: ${meeting.description}`);
        console.log(`Room ID: ${meeting.room_id}`);
        console.log(`Status: ${meeting.status}`);
      });
    } else {
      console.log('❌ No meetings data found');
    }
    
    // Check recordings data
    console.log('\nVerifying recordings data...');
    const { data: recordingsData, error: recordingsError } = await supabase
      .from('recordings')
      .select('*')
      .eq('recorder_id', userId);
      
    if (recordingsError) {
      console.error(`❌ Error fetching recordings: ${recordingsError.message}`);
    } else if (recordingsData && recordingsData.length > 0) {
      console.log(`✅ Found ${recordingsData.length} recordings`);
      recordingsData.forEach((recording, index) => {
        console.log(`\nRecording ${index + 1}:`);
        console.log(`File URL: ${recording.file_url}`);
        console.log(`Duration: ${recording.duration} seconds`);
        console.log(`Format: ${recording.format}`);
      });
    } else {
      console.log('❌ No recordings data found');
    }
    
    // Check transcripts data
    console.log('\nVerifying transcripts data...');
    const { data: transcriptsData, error: transcriptsError } = await supabase
      .from('transcripts')
      .select('*')
      .eq('speaker_id', userId);
      
    if (transcriptsError) {
      console.error(`❌ Error fetching transcripts: ${transcriptsError.message}`);
    } else if (transcriptsData && transcriptsData.length > 0) {
      console.log(`✅ Found ${transcriptsData.length} transcripts`);
      transcriptsData.forEach((transcript, index) => {
        console.log(`\nTranscript ${index + 1}:`);
        console.log(`Text: ${transcript.text}`);
        console.log(`Speaker: ${transcript.speaker}`);
        console.log(`Confidence: ${transcript.confidence}`);
      });
    } else {
      console.log('❌ No transcripts data found');
    }
    
    console.log('\n=== Verification Complete ===');
    
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message || error}`);
    process.exit(1);
  }
}

// Run the verification
verifyTestData();
