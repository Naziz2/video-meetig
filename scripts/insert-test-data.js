// Script to insert test data into Supabase tables
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

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

// Generate random dates
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Get current date and future date
const now = new Date();
const futureDate = new Date();
futureDate.setDate(now.getDate() + 30);

// Generate a random room ID
const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 10);
};

// Test data for meetings
const testMeetings = [
  {
    id: uuidv4(),
    title: 'Weekly Team Standup',
    description: 'Regular team sync to discuss progress and blockers',
    start_time: getRandomDate(now, futureDate).toISOString(),
    end_time: getRandomDate(now, futureDate).toISOString(),
    room_id: generateRoomId(),
    // Note: host_id will be set after we get a user
    participants: [],
    recurring: true,
    recurrence_pattern: 'WEEKLY',
    status: 'scheduled',
    is_private: false,
    meeting_link: `https://meeting.app/${generateRoomId()}`,
    password: 'test123',
    waiting_room_enabled: true,
    recording_enabled: true,
    transcription_enabled: true,
    max_participants: 10
  },
  {
    id: uuidv4(),
    title: 'Project Kickoff Meeting',
    description: 'Initial discussion for the new video conferencing feature',
    start_time: getRandomDate(now, futureDate).toISOString(),
    end_time: getRandomDate(now, futureDate).toISOString(),
    room_id: generateRoomId(),
    // Note: host_id will be set after we get a user
    participants: [],
    recurring: false,
    status: 'scheduled',
    is_private: true,
    meeting_link: `https://meeting.app/${generateRoomId()}`,
    password: 'kickoff2025',
    waiting_room_enabled: true,
    recording_enabled: true,
    transcription_enabled: false,
    max_participants: 20
  }
];

// Test data for recordings
const testRecordings = [
  {
    id: uuidv4(),
    // meeting_id will be set after meetings are inserted
    room_id: '',
    // recorder_id will be set after we get a user
    file_url: 'https://storage.example.com/recordings/test-recording-1.mp4',
    file_size: 15000000,
    duration: 1800,
    format: 'mp4'
  },
  {
    id: uuidv4(),
    // meeting_id will be set after meetings are inserted
    room_id: '',
    // recorder_id will be set after we get a user
    file_url: 'https://storage.example.com/recordings/test-recording-2.mp4',
    file_size: 25000000,
    duration: 3600,
    format: 'mp4'
  }
];

// Test data for transcripts
const testTranscripts = [
  {
    text: 'Hello everyone, welcome to our weekly standup meeting.',
    speaker: 'John Doe',
    // speaker_id will be set after we get a user
    room_id: '',
    confidence: 0.95,
    language: 'en',
  },
  {
    text: 'I\'ve been working on the recording feature and it\'s almost complete.',
    speaker: 'Jane Smith',
    // speaker_id will be set after we get a user
    room_id: '',
    confidence: 0.92,
    language: 'en',
  }
];

// Create a test user or sign in if exists
async function createOrSignInTestUser() {
  console.log(`Attempting to sign in as ${TEST_EMAIL}...`);
  
  // Try to sign in first
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  
  // If sign in fails, try to create the user
  if (signInError) {
    console.log(`Sign in failed: ${signInError.message}`);
    console.log(`Creating new test user: ${TEST_EMAIL}...`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: {
        data: {
          name: 'Test User'
        }
      }
    });
    
    if (signUpError) {
      console.error(`❌ Error creating test user: ${signUpError.message}`);
      return null;
    }
    
    console.log('✅ Test user created successfully');
    return signUpData.user;
  }
  
  console.log('✅ Signed in as test user');
  return signInData.user;
}

// Insert test data into Supabase
async function insertTestData() {
  console.log('=== Inserting Test Data into Supabase ===\n');
  
  try {
    // First, create or sign in as test user
    const user = await createOrSignInTestUser();
    
    if (!user) {
      console.error('❌ Failed to authenticate. Cannot insert test data.');
      process.exit(1);
    }
    
    const userId = user.id;
    console.log(`Using user ID: ${userId}`);
    
    // Check if user has a profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', profileError.message);
    }
    
    if (!profileData) {
      console.log('Creating test profile...');
      
      // Create a test profile
      const { data: newProfile, error: profileInsertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: 'Test User',
          email: TEST_EMAIL,
          bio: 'This is a test user for development purposes',
          theme: 'dark',
          visibility: 'public'
        })
        .select();
        
      if (profileInsertError) {
        console.error('❌ Error creating profile:', profileInsertError.message);
      } else {
        console.log('✅ Test profile created');
      }
    } else {
      console.log('✅ Using existing profile');
    }
    
    // Insert test meetings
    console.log('\nInserting test meetings...');
    
    // Update meetings with the user ID
    testMeetings.forEach(meeting => {
      meeting.host_id = userId;
      meeting.participants = [userId];
    });
    
    const { data: meetingsData, error: meetingsError } = await supabase
      .from('meetings')
      .insert(testMeetings)
      .select();
      
    if (meetingsError) {
      console.error('❌ Error inserting meetings:', meetingsError.message);
    } else {
      console.log(`✅ ${meetingsData.length} test meetings inserted`);
      
      // Update recordings with meeting IDs and room IDs
      testRecordings[0].meeting_id = meetingsData[0].id;
      testRecordings[0].room_id = meetingsData[0].room_id;
      testRecordings[0].recorder_id = userId;
      
      testRecordings[1].meeting_id = meetingsData[1].id;
      testRecordings[1].room_id = meetingsData[1].room_id;
      testRecordings[1].recorder_id = userId;
      
      // Insert test recordings
      console.log('\nInserting test recordings...');
      
      const { data: recordingsData, error: recordingsError } = await supabase
        .from('recordings')
        .insert(testRecordings)
        .select();
        
      if (recordingsError) {
        console.error('❌ Error inserting recordings:', recordingsError.message);
      } else {
        console.log(`✅ ${recordingsData.length} test recordings inserted`);
      }
      
      // Update transcripts with meeting IDs and room IDs
      testTranscripts[0].speaker_id = userId;
      testTranscripts[0].room_id = meetingsData[0].room_id;
      testTranscripts[0].meeting_id = meetingsData[0].id;
      
      testTranscripts[1].speaker_id = userId;
      testTranscripts[1].room_id = meetingsData[0].room_id;
      testTranscripts[1].meeting_id = meetingsData[0].id;
      
      // Insert test transcripts
      console.log('\nInserting test transcripts...');
      
      const { data: transcriptsData, error: transcriptsError } = await supabase
        .from('transcripts')
        .insert(testTranscripts)
        .select();
        
      if (transcriptsError) {
        console.error('❌ Error inserting transcripts:', transcriptsError.message);
      } else {
        console.log(`✅ ${transcriptsData.length} test transcripts inserted`);
      }
      
      // Insert test room creator
      console.log('\nInserting test room creator...');
      
      const { data: roomCreatorData, error: roomCreatorError } = await supabase
        .from('room_creators')
        .insert({
          room_id: meetingsData[0].room_id,
          creator_id: userId
        })
        .select();
        
      if (roomCreatorError) {
        console.error('❌ Error inserting room creator:', roomCreatorError.message);
      } else {
        console.log('✅ Test room creator inserted');
      }
      
      // Insert test join request
      console.log('\nInserting test join request...');
      
      const { data: joinRequestData, error: joinRequestError } = await supabase
        .from('join_requests')
        .insert({
          room_id: meetingsData[0].room_id,
          user_id: userId,
          user_name: 'Test Participant',
          status: 'pending'
        })
        .select();
        
      if (joinRequestError) {
        console.error('❌ Error inserting join request:', joinRequestError.message);
      } else {
        console.log('✅ Test join request inserted');
      }
    }
    
    console.log('\n=== Test Data Insertion Complete ===');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message || error);
    process.exit(1);
  }
}

// Run the insertion
insertTestData();
