/*
  # Create transcripts table

  1. New Tables
    - `transcripts`
      - `id` (bigint, primary key)
      - `text` (text)
      - `speaker` (text)
      - `room_id` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `transcripts` table
    - Add policy for authenticated users to read and insert transcripts
*/

CREATE TABLE IF NOT EXISTS transcripts (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  text text NOT NULL,
  speaker text NOT NULL,
  room_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read transcripts"
  ON transcripts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert transcripts"
  ON transcripts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_transcripts_room_id ON transcripts(room_id);