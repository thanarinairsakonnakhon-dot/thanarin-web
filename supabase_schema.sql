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

-- 4. Enable RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Public Read / Admin Write)
-- For simplicity in this phase, we allow public read/write. 
-- IN PRODUCTION: Restrict write access to authenticated admin users only.

CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Insert Products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Products" ON products FOR UPDATE USING (true);
CREATE POLICY "Public Delete Products" ON products FOR DELETE USING (true);

CREATE POLICY "Public Read Bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Public Insert Bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Bookings" ON bookings FOR UPDATE USING (true);
