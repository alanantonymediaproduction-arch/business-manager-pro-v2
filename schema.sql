-- Supabase SQL Schema for Business Manager Pro v2

-- Customers Table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  number TEXT NOT NULL,
  nationality TEXT,
  age INTEGER,
  body_size TEXT,
  behavior TEXT,
  ethnicity_category TEXT CHECK (ethnicity_category IN ('Malayali', 'Others')),
  appointment_date_time TIMESTAMP WITH TIME ZONE,
  is_repeat BOOLEAN DEFAULT false,
  call_notification TEXT CHECK (call_notification IN ('OK', 'Not OK')),
  total_paid_amount NUMERIC DEFAULT 0,
  amount_paid_to_staff NUMERIC DEFAULT 0,
  staff_name TEXT,
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

-- Earnings Table
CREATE TABLE earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  description TEXT,
  linked_staff_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commissions Table
CREATE TABLE commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  description TEXT,
  linked_staff_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix Permission Errors (Disable RLS)
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE earnings DISABLE ROW LEVEL SECURITY;
ALTER TABLE commissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
