-- Supabase SQL Schema for BackupPlanPro

-- ==========================================
-- 1. CLEANUP PREVIOUS TABLES (If they exist)
-- ==========================================
DROP TABLE IF EXISTS online_services CASCADE;
DROP TABLE IF EXISTS financial_records CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS earnings CASCADE;
DROP TABLE IF EXISTS commissions CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- ==========================================
-- 2. CREATE NEW MULTI-TENANT ARCHITECTURE
-- ==========================================

-- User Profiles (Linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  custom_persona_name TEXT DEFAULT 'Deepa',
  admin_pin TEXT DEFAULT '1234',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers Table (Shared Pool)
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  number TEXT NOT NULL,
  nationality TEXT,
  age INTEGER,
  room_number TEXT,
  body_size TEXT CHECK (body_size IN ('Big', 'Normal', 'Small')),
  behavior TEXT CHECK (behavior IN ('Bad', 'Good', 'Very Good')),
  meeting_duration TEXT CHECK (meeting_duration IN ('1 Hour', '2 Hours', '3 Hours', '4 Hours', 'More Than 5 Hours')),
  appointment_date_time TIMESTAMP WITH TIME ZONE,
  is_repeat BOOLEAN DEFAULT false,
  is_mallu BOOLEAN DEFAULT false,
  repeat_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Records Table (Private Silos)
CREATE TABLE financial_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('Earning', 'Commission', 'Expense')) NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  staff_name TEXT,
  is_special_persona BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Table
CREATE TABLE staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  nationality TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Online Services Table (Private per user)
CREATE TABLE online_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  session_time TEXT,
  payment_method TEXT CHECK (payment_method IN ('Cash', 'Bank Account', 'Google Pay')),
  service_type TEXT CHECK (service_type IN ('Video Call', 'Audio Call', 'Photos + Audio', 'Video Clips + Audio')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_services ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. APPLY SECURITY POLICIES
-- ==========================================

-- Shared Customer Pool Policies
CREATE POLICY "Enable read access for all authenticated users" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON customers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON customers FOR DELETE USING (auth.role() = 'authenticated');

-- Private Financial Silos Policies
CREATE POLICY "Users can view their own financial records" ON financial_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own financial records" ON financial_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own financial records" ON financial_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own financial records" ON financial_records FOR DELETE USING (auth.uid() = user_id);

-- Profile Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Staff Policies (Shared)
CREATE POLICY "Enable read access for all authenticated users on staff" ON staff FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users on staff" ON staff FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users on staff" ON staff FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users on staff" ON staff FOR DELETE USING (auth.role() = 'authenticated');

-- Online Services Policies (Private per user)
CREATE POLICY "Users can view their own online services" ON online_services FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own online services" ON online_services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own online services" ON online_services FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own online services" ON online_services FOR DELETE USING (auth.uid() = user_id);
