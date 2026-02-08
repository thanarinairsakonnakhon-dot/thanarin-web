-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Products Table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  type TEXT NOT NULL,
  btu INTEGER NOT NULL,
  price INTEGER NOT NULL,
  inverter BOOLEAN DEFAULT true,
  seer DECIMAL(4, 2),
  features TEXT[] DEFAULT '{}',
  image TEXT,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 2,
  cost INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Out of Stock',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Create Bookings Table
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_type TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  address TEXT,
  location_lat DECIMAL,
  location_lng DECIMAL,
  status TEXT DEFAULT 'Pending', -- Pending, Confirmed, Completed, Cancelled
  technician_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Create Chat Sessions Table
CREATE TABLE chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL, -- Browser session ID
  customer_name TEXT DEFAULT 'Guest',
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  unread_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Create Chat Messages Table
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'user' or 'admin'
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6. Enable RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 7. Create Policies (Public Read / Admin Write)
-- For simplicity in this phase, we allow public read/write. 
-- IN PRODUCTION: Restrict write access to authenticated admin users only.

CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Insert Products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Products" ON products FOR UPDATE USING (true);
CREATE POLICY "Public Delete Products" ON products FOR DELETE USING (true);

CREATE POLICY "Public Read Bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Public Insert Bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Bookings" ON bookings FOR UPDATE USING (true);

CREATE POLICY "Public Read Chat Sessions" ON chat_sessions FOR SELECT USING (true);
CREATE POLICY "Public Insert Chat Sessions" ON chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Chat Sessions" ON chat_sessions FOR UPDATE USING (true);

CREATE POLICY "Public Read Chat Messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Public Insert Chat Messages" ON chat_messages FOR INSERT WITH CHECK (true);

-- 8. Enable Realtime for Chat
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
