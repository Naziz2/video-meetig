/*
  # Complete Database Schema for Video Meeting App
  
  This file contains the complete database schema for the video meeting application,
  including all tables, relationships, policies, and indexes.
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE: Stores detailed user profile information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  bio TEXT,
  profile_slug TEXT UNIQUE,
  avatar_url TEXT,
  visibility TEXT CHECK (visibility IN ('public', 'private')) DEFAULT 'private',
  social_links JSONB DEFAULT '[]'::jsonb,
  theme TEXT DEFAULT 'dark',
  email_notifications BOOLEAN DEFAULT TRUE,
  meeting_reminders BOOLEAN DEFAULT TRUE,
  sound_effects BOOLEAN DEFAULT TRUE,
  reduced_motion BOOLEAN DEFAULT FALSE,
  font_size TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEETINGS TABLE: Stores meeting information and scheduling
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  room_id TEXT,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  participants TEXT[] DEFAULT '{}',
  recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  is_private BOOLEAN DEFAULT FALSE,
  meeting_link TEXT,
  password TEXT,
  waiting_room_enabled BOOLEAN DEFAULT TRUE,
  recording_enabled BOOLEAN DEFAULT FALSE,
  transcription_enabled BOOLEAN DEFAULT FALSE,
  max_participants INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSCRIPTS TABLE: Stores meeting transcriptions
CREATE TABLE IF NOT EXISTS transcripts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  text TEXT NOT NULL,
  speaker TEXT NOT NULL,
  speaker_id UUID REFERENCES auth.users(id),
  room_id TEXT NOT NULL,
  confidence FLOAT,
  language TEXT DEFAULT 'en',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RECORDINGS TABLE: Stores information about meeting recordings
CREATE TABLE IF NOT EXISTS recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL,
  recorder_id UUID REFERENCES auth.users(id),
  file_url TEXT NOT NULL,
  file_size BIGINT,
  duration INTEGER, -- in seconds
  format TEXT DEFAULT 'mp4',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- JOIN REQUESTS TABLE: Manages waiting room and join requests
CREATE TABLE IF NOT EXISTS join_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTACTS TABLE: Manages user contacts for easy meeting invitations
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name TEXT,
  contact_email TEXT,
  contact_type TEXT DEFAULT 'personal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, contact_id)
);

-- ROOM CREATORS TABLE: Tracks which users created which rooms
CREATE TABLE IF NOT EXISTS room_creators (
  room_id TEXT PRIMARY KEY,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_creators ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
  
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- MEETINGS POLICIES
CREATE POLICY "Users can view meetings they host or participate in"
  ON meetings FOR SELECT USING (auth.uid() = host_id OR auth.uid()::text = ANY(participants));
  
CREATE POLICY "Users can insert their own meetings"
  ON meetings FOR INSERT WITH CHECK (auth.uid() = host_id);
  
CREATE POLICY "Users can update meetings they host"
  ON meetings FOR UPDATE USING (auth.uid() = host_id);
  
CREATE POLICY "Users can delete meetings they host"
  ON meetings FOR DELETE USING (auth.uid() = host_id);

-- TRANSCRIPTS POLICIES
CREATE POLICY "Anyone can read transcripts"
  ON transcripts FOR SELECT TO authenticated USING (true);
  
CREATE POLICY "Anyone can insert transcripts"
  ON transcripts FOR INSERT TO authenticated WITH CHECK (true);

-- RECORDINGS POLICIES
CREATE POLICY "Users can view recordings they created or from meetings they participated in"
  ON recordings FOR SELECT USING (
    auth.uid() = recorder_id OR 
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = recordings.meeting_id 
      AND (meetings.host_id = auth.uid() OR auth.uid()::text = ANY(meetings.participants))
    )
  );
  
CREATE POLICY "Users can insert recordings for meetings they participate in"
  ON recordings FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = recordings.meeting_id 
      AND (meetings.host_id = auth.uid() OR auth.uid()::text = ANY(meetings.participants))
    )
  );

-- JOIN REQUESTS POLICIES
CREATE POLICY "Room hosts can view join requests"
  ON join_requests FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_creators
      WHERE room_creators.room_id = join_requests.room_id
      AND room_creators.creator_id = auth.uid()
    )
  );
  
CREATE POLICY "Users can insert their own join requests"
  ON join_requests FOR INSERT WITH CHECK (user_id = auth.uid());
  
CREATE POLICY "Room hosts can update join request status"
  ON join_requests FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM room_creators
      WHERE room_creators.room_id = join_requests.room_id
      AND room_creators.creator_id = auth.uid()
    )
  );

-- CONTACTS POLICIES
CREATE POLICY "Users can view their own contacts"
  ON contacts FOR SELECT USING (user_id = auth.uid());
  
CREATE POLICY "Users can insert their own contacts"
  ON contacts FOR INSERT WITH CHECK (user_id = auth.uid());
  
CREATE POLICY "Users can update their own contacts"
  ON contacts FOR UPDATE USING (user_id = auth.uid());
  
CREATE POLICY "Users can delete their own contacts"
  ON contacts FOR DELETE USING (user_id = auth.uid());

-- ROOM CREATORS POLICIES
CREATE POLICY "Anyone can view room creators"
  ON room_creators FOR SELECT USING (true);
  
CREATE POLICY "Users can insert rooms they create"
  ON room_creators FOR INSERT WITH CHECK (creator_id = auth.uid());

-- Optimize query performance with indexes
CREATE INDEX IF NOT EXISTS idx_profiles_visibility ON profiles(visibility);
CREATE INDEX IF NOT EXISTS idx_meetings_host_id ON meetings(host_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_transcripts_room_id ON transcripts(room_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_meeting_id ON transcripts(meeting_id);
CREATE INDEX IF NOT EXISTS idx_recordings_meeting_id ON recordings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_room_id ON join_requests(room_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON join_requests(status);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
  
CREATE TRIGGER set_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
