-- Create tracking_links table for public tracking URLs
CREATE TABLE public.tracking_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL,
  tracking_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create mission_tracking table for GPS tracking data
CREATE TABLE public.mission_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL,
  driver_id UUID,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  speed NUMERIC,
  heading NUMERIC,
  battery_level INTEGER,
  signal_strength INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tracking_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for tracking_links
CREATE POLICY "Users can view tracking links for their missions" 
ON public.tracking_links 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.missions 
    WHERE missions.id = tracking_links.mission_id 
    AND (missions.created_by = auth.uid() OR missions.donor_id = auth.uid() OR missions.driver_id = auth.uid())
  )
);

CREATE POLICY "Users can create tracking links for their missions" 
ON public.tracking_links 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.missions 
    WHERE missions.id = tracking_links.mission_id 
    AND (missions.created_by = auth.uid() OR missions.donor_id = auth.uid() OR missions.driver_id = auth.uid())
  )
);

-- Create policies for mission_tracking
CREATE POLICY "Users can view tracking data for their missions" 
ON public.mission_tracking 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.missions 
    WHERE missions.id = mission_tracking.mission_id 
    AND (missions.created_by = auth.uid() OR missions.donor_id = auth.uid() OR missions.driver_id = auth.uid())
  )
);

CREATE POLICY "Drivers can insert tracking data for their missions" 
ON public.mission_tracking 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.missions 
    WHERE missions.id = mission_tracking.mission_id 
    AND missions.driver_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_tracking_links_mission_id ON public.tracking_links(mission_id);
CREATE INDEX idx_tracking_links_token ON public.tracking_links(tracking_token);
CREATE INDEX idx_mission_tracking_mission_id ON public.mission_tracking(mission_id);
CREATE INDEX idx_mission_tracking_created_at ON public.mission_tracking(created_at DESC);