-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- Create policies for events table
CREATE POLICY "Enable read access for all users" ON events FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON events FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for volunteers table
CREATE POLICY "Enable read access for all users" ON volunteers FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON volunteers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for token holders" ON volunteers FOR UPDATE USING (true);

-- Create function to increment participants
CREATE OR REPLACE FUNCTION increment_participants(event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET current_participants = current_participants + 1
  WHERE id = event_id
  AND current_participants < max_participants;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found or maximum participants reached';
  END IF;
END;
$$;

-- Create function to decrement participants
CREATE OR REPLACE FUNCTION decrement_participants(event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET current_participants = GREATEST(current_participants - 1, 0)
  WHERE id = event_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found';
  END IF;
END;
$$;

-- Add trigger to automatically generate token for volunteers
CREATE OR REPLACE FUNCTION generate_volunteer_token()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.token IS NULL THEN
    NEW.token := encode(gen_random_bytes(12), 'hex');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_volunteer_token
  BEFORE INSERT ON volunteers
  FOR EACH ROW
  EXECUTE FUNCTION generate_volunteer_token();

-- Add trigger to automatically set registration_date for volunteers
CREATE OR REPLACE FUNCTION set_volunteer_registration_date()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.registration_date IS NULL THEN
    NEW.registration_date := NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_volunteer_registration_date
  BEFORE INSERT ON volunteers
  FOR EACH ROW
  EXECUTE FUNCTION set_volunteer_registration_date();