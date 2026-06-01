# Business Manager Pro v2 (BackupPlanPro) — Project Documentation
---

## 1. Project Overview & Architecture

**Business Manager Pro v2** is a multi-tenant business management and dashboard application built specifically for scheduling, staff tracking, financial logging, and customer relationship management. 

### Technology Stack
- **Frontend Framework**: Next.js 16 (Turbopack) using React 19 and Tailwind CSS.
- **Database Backend**: Supabase PostgreSQL with active Row Level Security (RLS) for complete data isolation.
- **Deployment & Hosting**: Vercel (for frontend/API routes) and Supabase (for database/auth).

---

## 2. Live Links & Repositories

| Item | URL |
|---|---|
| **Production URL** | [https://prodaddy-business-manager.vercel.app](https://prodaddy-business-manager.vercel.app) |
| **Alternative URL** | [https://prodaddy-business-manager-fi3bfq72r.vercel.app](https://prodaddy-business-manager-fi3bfq72r.vercel.app) |
| **GitHub Repository** | `https://github.com/alanantonymediaproduction-arch/business-manager-pro-v2.git` |

---

## 3. Project Credentials & Environment Configuration

### Supabase Database Credentials
These credentials are used by the Next.js app to connect to your Supabase instance:
- **Supabase URL**: `https://iwzcjfmaetxvditminun.supabase.co`
- **Supabase Anon / Publishable Key**: `sb_publishable_EXJp3M9Exin6aBEmqHpTLw_Jz3uwPSv`

### GitHub Authentication (Configured in local repository remote)
- **GitHub Username/Token Remote**: `https://[YOUR_GITHUB_TOKEN]@github.com/alanantonymediaproduction-arch/business-manager-pro-v2.git`

### Local `.env.local` Configuration File
Create this file in the root of the project to run it locally:
```env
NEXT_PUBLIC_SUPABASE_URL="https://iwzcjfmaetxvditminun.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_EXJp3M9Exin6aBEmqHpTLw_Jz3uwPSv"
```

---

## 4. Local Development Setup

To run the project on your local machine, follow these steps:

1. **Navigate to project folder**:
   ```bash
   cd "/Users/alanantony/Documents/ALAN NEW WEB"
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```
4. **Open in browser**: Go to [http://localhost:3000](http://localhost:3000).

---

## 5. Database Schema & RLS Setup

The database uses PostgreSQL with Row Level Security (RLS) to ensure that **each user's data is private and never mixed**.

### Schema Setup Script (`schema.sql`)
Copy and paste this script into the **SQL Editor** of your Supabase Dashboard and click **Run** to set up the database tables and RLS policies correctly:

```sql
-- Supabase SQL Schema for BackupPlanPro
-- ALL DATA IS PRIVATE PER USER (user_id isolation)

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  custom_persona_name TEXT DEFAULT 'Deepa',
  admin_pin TEXT DEFAULT '1234',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
  service_status TEXT DEFAULT 'Active' CHECK (service_status IN ('Pending', 'In Progress', 'Scheduled', 'Completed', 'Active')),
  service_channel TEXT DEFAULT 'Physical',
  last_contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  follow_up_agreed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_records (
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

CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  nationality TEXT,
  role TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS online_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  session_time TEXT,
  payment_method TEXT CHECK (payment_method IN ('Cash', 'Bank Account', 'Google Pay')),
  service_type TEXT CHECK (service_type IN ('Video Call', 'Audio Call', 'Photos + Audio', 'Video Clips + Audio')),
  service_status TEXT DEFAULT 'Active' CHECK (service_status IN ('Pending', 'In Progress', 'Scheduled', 'Completed', 'Active')),
  last_contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  follow_up_agreed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_services ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Customers
CREATE POLICY "Users can view their own customers" ON customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own customers" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own customers" ON customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own customers" ON customers FOR DELETE USING (auth.uid() = user_id);

-- Financial Records
CREATE POLICY "Users can view their own financial records" ON financial_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own financial records" ON financial_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own financial records" ON financial_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own financial records" ON financial_records FOR DELETE USING (auth.uid() = user_id);

-- Staff
CREATE POLICY "Users can view their own staff" ON staff FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own staff" ON staff FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own staff" ON staff FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own staff" ON staff FOR DELETE USING (auth.uid() = user_id);

-- Online Services
CREATE POLICY "Users can view their own online services" ON online_services FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own online services" ON online_services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own online services" ON online_services FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own online services" ON online_services FOR DELETE USING (auth.uid() = user_id);
```

---

## 6. Key Feature Configurations

### 1. Isolated "Deepa" Persona logic
- In **Staff Profiles** page:
  - Top summary cards ("Team Total Earnings", "Team Total Commission", "Today's Commissions") exclude stats belonging to the staff member named `"Deepa"`.
  - Deepa's individual box remains fully visible inside the grid, displaying her personal performance metrics.
  
### 2. Online Services (INR / ₹) Formatting
- The virtual services section is isolated to display and calculate in **INR (₹)**.
- Metric cards changed to **Total Earnings** and **Avg per Session** displaying in **₹** (INR).
- Session list items display prices with the **₹** symbol.
- Physical dashboard metrics remain formatted in local **AED** currency.

---

## 7. Hosting & Deployment Guide (Vercel)

If you need to manually configure or deploy this project to another Vercel account:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```
2. **Link Project**:
   ```bash
   vercel link
   ```
   Select your scope, specify project name `prodaddy-business-manager`, and link it.
3. **Configure Environment Variables**:
   Go to your Vercel Dashboard -> Project Settings -> Environment Variables. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://iwzcjfmaetxvditminun.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_EXJp3M9Exin6aBEmqHpTLw_Jz3uwPSv`
4. **Deploy**:
   ```bash
   vercel --prod
   ```
