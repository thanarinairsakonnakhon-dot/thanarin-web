-- 1. Create Hero Slides Table (for homepage slider)
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  button_text TEXT DEFAULT 'ดูเพิ่มเติม',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS for hero_slides
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Hero Slides" ON hero_slides FOR SELECT USING (true);
CREATE POLICY "Public Insert Hero Slides" ON hero_slides FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Hero Slides" ON hero_slides FOR UPDATE USING (true);
CREATE POLICY "Public Delete Hero Slides" ON hero_slides FOR DELETE USING (true);


-- 2. Create Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL, -- Browser session ID
  customer_name TEXT DEFAULT 'Guest',
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  unread_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Create Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'user' or 'admin'
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS for chat tables
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Chat Sessions" ON chat_sessions FOR SELECT USING (true);
CREATE POLICY "Public Insert Chat Sessions" ON chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Chat Sessions" ON chat_sessions FOR UPDATE USING (true);

CREATE POLICY "Public Read Chat Messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Public Insert Chat Messages" ON chat_messages FOR INSERT WITH CHECK (true);

-- Enable Realtime for Chat
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
