// Terminal script to test Supabase connection
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
  console.log('Please make sure your .env file contains:');
  console.log('VITE_SUPABASE_URL=your-supabase-url');
  console.log('VITE_SUPABASE_ANON_KEY=your-supabase-anon-key');
  process.exit(1);
}

// Create supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// List of all tables in the database based on the complete schema
const tables = [
  'profiles',
  'meetings',
  'transcripts',
  'recordings',
  'join_requests',
  'contacts',
  'room_creators',
  'speech_messages', // This was in our original list but not in the schema
  'messages',        // This was in our original list but not in the schema
  'avatars'          // This was in our original list but not in the schema
];

// Test connection to Supabase
async function testConnection() {
  console.log('=== Supabase Connection Test ===\n');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Supabase Key: ${supabaseAnonKey ? '✅ Set' : '❌ Not set'}\n`);

  try {
    // Test basic connection
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error(`❌ Connection failed: ${error.message}`);
      process.exit(1);
    }
    
    console.log('✅ Successfully connected to Supabase\n');
    
    // Test each table
    console.log('=== Table Connection Tests ===\n');
    
    const tableResults = {};
    const successCount = { count: 0 };
    const failCount = { count: 0 };
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true });
        
        if (error) {
          console.error(`❌ ${table}: Failed - ${error.message}`);
          tableResults[table] = { success: false, error: error.message };
          failCount.count++;
        } else {
          console.log(`✅ ${table}: Connected successfully`);
          tableResults[table] = { success: true };
          successCount.count++;
        }
      } catch (error) {
        console.error(`❌ ${table}: Failed - ${error.message || 'Unknown error'}`);
        tableResults[table] = { success: false, error: error.message || 'Unknown error' };
        failCount.count++;
      }
    }
    
    console.log('\n=== Test Summary ===');
    console.log(`Total tables tested: ${tables.length}`);
    console.log(`Successful connections: ${successCount.count}`);
    console.log(`Failed connections: ${failCount.count}`);
    
    // Check schema structure
    if (successCount.count > 0) {
      console.log('\n=== Schema Structure Check ===');
      await checkSchemaStructure();
    }
    
    console.log('\n=== Test Complete ===');
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message || error}`);
    process.exit(1);
  }
}

// Check schema structure for a few key tables
async function checkSchemaStructure() {
  try {
    // Check profiles table structure
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (profilesError) {
      console.error(`❌ Could not check profiles schema: ${profilesError.message}`);
    } else if (profilesData && profilesData.length > 0) {
      const profileColumns = Object.keys(profilesData[0]);
      console.log('✅ Profiles table structure verified with columns:', profileColumns.join(', '));
    } else {
      console.log('ℹ️ Profiles table exists but is empty');
    }
    
    // Check meetings table structure
    const { data: meetingsData, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .limit(1);
      
    if (meetingsError) {
      console.error(`❌ Could not check meetings schema: ${meetingsError.message}`);
    } else if (meetingsData && meetingsData.length > 0) {
      const meetingColumns = Object.keys(meetingsData[0]);
      console.log('✅ Meetings table structure verified with columns:', meetingColumns.join(', '));
    } else {
      console.log('ℹ️ Meetings table exists but is empty');
    }
    
    // Check recordings table structure
    const { data: recordingsData, error: recordingsError } = await supabase
      .from('recordings')
      .select('*')
      .limit(1);
      
    if (recordingsError) {
      console.error(`❌ Could not check recordings schema: ${recordingsError.message}`);
    } else if (recordingsData && recordingsData.length > 0) {
      const recordingColumns = Object.keys(recordingsData[0]);
      console.log('✅ Recordings table structure verified with columns:', recordingColumns.join(', '));
    } else {
      console.log('ℹ️ Recordings table exists but is empty');
    }
  } catch (error) {
    console.error(`❌ Error checking schema structure: ${error.message || error}`);
  }
}

// Run the test
testConnection();
