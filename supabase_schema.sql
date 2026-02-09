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

-- 8. Create Stock Logs Table for Inventory Tracking
CREATE TABLE stock_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'IN' or 'OUT'
  quantity INTEGER NOT NULL,
  reason TEXT,
  cost_per_unit INTEGER DEFAULT 0,
  previous_stock INTEGER DEFAULT 0,
  new_stock INTEGER DEFAULT 0,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE stock_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Stock Logs" ON stock_logs FOR SELECT USING (true);
CREATE POLICY "Public Insert Stock Logs" ON stock_logs FOR INSERT WITH CHECK (true);

-- 9. Create Reviews Table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_avatar TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  review_text TEXT NOT NULL,
  service_type TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public Insert Reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Reviews" ON reviews FOR UPDATE USING (true);
CREATE POLICY "Public Delete Reviews" ON reviews FOR DELETE USING (true);

-- 10. Create Promotions Table
CREATE TABLE promotions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  discount_text TEXT,
  image_url TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Promotions" ON promotions FOR SELECT USING (true);
CREATE POLICY "Public Insert Promotions" ON promotions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Promotions" ON promotions FOR UPDATE USING (true);
CREATE POLICY "Public Delete Promotions" ON promotions FOR DELETE USING (true);

-- 11. Create Site Settings Table (for editable homepage content)
CREATE TABLE site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'text', -- text, html, number, json
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Site Settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public Insert Site Settings" ON site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Site Settings" ON site_settings FOR UPDATE USING (true);

-- Insert default settings
INSERT INTO site_settings (setting_key, setting_value, setting_type) VALUES
('hero_title', 'ความเย็นที่... เหนือระดับ', 'text'),
('hero_subtitle', 'ติดตั้งใจถึงบ้าน หมดห่วงการันตีคุณภาพ พร้อมราคาที่ถูกใจ และบริการที่ประทับใจ', 'text'),
('phone_number', '086-238-7571', 'text'),
('line_id', '@thanarinair', 'text'),
('address', '335/1 ม.3 ต.เชียงเครือ อ.เมือง จ.สกลนคร', 'text');

-- 12. Enable Realtime for Chat
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- 13. Create Hero Slides Table (for homepage slider)
CREATE TABLE hero_slides (
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

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Hero Slides" ON hero_slides FOR SELECT USING (true);
CREATE POLICY "Public Insert Hero Slides" ON hero_slides FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Hero Slides" ON hero_slides FOR UPDATE USING (true);
CREATE POLICY "Public Delete Hero Slides" ON hero_slides FOR DELETE USING (true);

-- 14. Create Portfolios Table (for project showcase)
CREATE TABLE portfolios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Residential',
  image_url TEXT,
  size TEXT DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Portfolios" ON portfolios FOR SELECT USING (true);
CREATE POLICY "Public Insert Portfolios" ON portfolios FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Portfolios" ON portfolios FOR UPDATE USING (true);
CREATE POLICY "Public Delete Portfolios" ON portfolios FOR DELETE USING (true);

-- 15. Create Portfolio Images Table (for gallery)
CREATE TABLE portfolio_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Portfolio Images" ON portfolio_images FOR SELECT USING (true);
CREATE POLICY "Public Insert Portfolio Images" ON portfolio_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Portfolio Images" ON portfolio_images FOR UPDATE USING (true);
CREATE POLICY "Public Delete Portfolio Images" ON portfolio_images FOR DELETE USING (true);

-- 16. Create AC Brands Table
CREATE TABLE ac_brands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  color TEXT DEFAULT '#0A84FF',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE ac_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read AC Brands" ON ac_brands FOR SELECT USING (true);
CREATE POLICY "Public Insert AC Brands" ON ac_brands FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update AC Brands" ON ac_brands FOR UPDATE USING (true);
CREATE POLICY "Public Delete AC Brands" ON ac_brands FOR DELETE USING (true);

-- 17. Create AC Series Table
CREATE TABLE ac_series (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_id UUID REFERENCES ac_brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE ac_series ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read AC Series" ON ac_series FOR SELECT USING (true);
CREATE POLICY "Public Insert AC Series" ON ac_series FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update AC Series" ON ac_series FOR UPDATE USING (true);
CREATE POLICY "Public Delete AC Series" ON ac_series FOR DELETE USING (true);

-- 18. Create AC Models Table (price list)
CREATE TABLE ac_models (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  series_id UUID REFERENCES ac_series(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  btu TEXT,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE ac_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read AC Models" ON ac_models FOR SELECT USING (true);
CREATE POLICY "Public Insert AC Models" ON ac_models FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update AC Models" ON ac_models FOR UPDATE USING (true);
CREATE POLICY "Public Delete AC Models" ON ac_models FOR DELETE USING (true);


