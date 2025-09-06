-- Add new fields to missions table for enhanced functionality
ALTER TABLE public.missions 
ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
ADD COLUMN IF NOT EXISTS vehicle_brand TEXT,
ADD COLUMN IF NOT EXISTS vehicle_model TEXT,
ADD COLUMN IF NOT EXISTS vehicle_year INTEGER,
ADD COLUMN IF NOT EXISTS license_plate TEXT,
ADD COLUMN IF NOT EXISTS pickup_contact_name TEXT,
ADD COLUMN IF NOT EXISTS pickup_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS pickup_contact_email TEXT,
ADD COLUMN IF NOT EXISTS delivery_contact_name TEXT,
ADD COLUMN IF NOT EXISTS delivery_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS delivery_contact_email TEXT,
ADD COLUMN IF NOT EXISTS donor_earning DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS driver_earning DECIMAL(10,2) DEFAULT 0;