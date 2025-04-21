-- Create meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    room_id TEXT,
    host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    participants TEXT[] DEFAULT '{}',
    recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT,
    status TEXT DEFAULT 'scheduled',
    is_private BOOLEAN DEFAULT FALSE,
    meeting_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view meetings they host or are participants in
CREATE POLICY "Users can view their own meetings" 
    ON public.meetings 
    FOR SELECT
    USING (
        auth.uid() = host_id OR 
        auth.uid()::text = ANY(participants)
    );

-- Policy to allow users to insert their own meetings
CREATE POLICY "Users can insert their own meetings" 
    ON public.meetings 
    FOR INSERT
    WITH CHECK (
        auth.uid() = host_id
    );

-- Policy to allow users to update their own meetings
CREATE POLICY "Users can update their own meetings" 
    ON public.meetings 
    FOR UPDATE
    USING (
        auth.uid() = host_id
    );

-- Policy to allow users to delete their own meetings
CREATE POLICY "Users can delete their own meetings" 
    ON public.meetings 
    FOR DELETE
    USING (
        auth.uid() = host_id
    );

-- Grant access to authenticated users
GRANT ALL ON public.meetings TO authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
