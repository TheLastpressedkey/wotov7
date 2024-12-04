-- Add archived column to events table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'events' AND column_name = 'archived') THEN
        ALTER TABLE events ADD COLUMN archived BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END $$;

-- Create index for faster filtering if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                  WHERE indexname = 'idx_events_date_archived') THEN
        CREATE INDEX idx_events_date_archived ON events(date, archived);
    END IF;
END $$;

-- Update or create policies for events table
DROP POLICY IF EXISTS "Enable read access for all users" ON events;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON events;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON events;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON events;

CREATE POLICY "Enable read access for all users" ON events 
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON events 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON events 
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON events 
  FOR DELETE USING (auth.role() = 'authenticated');