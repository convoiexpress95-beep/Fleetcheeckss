-- Create reports table for storing generated reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('complete', 'financial', 'mileage', 'inspection')),
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'available', 'processing')),
  file_url TEXT,
  missions_count INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  total_km DECIMAL(10,2) DEFAULT 0,
  fuel_costs DECIMAL(10,2) DEFAULT 0,
  net_profit DECIMAL(10,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics_data table for storing performance metrics
CREATE TABLE IF NOT EXISTS public.analytics_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  missions_count INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  total_km DECIMAL(10,2) DEFAULT 0,
  fuel_costs DECIMAL(10,2) DEFAULT 0,
  vehicle_costs DECIMAL(10,2) DEFAULT 0,
  other_costs DECIMAL(10,2) DEFAULT 0,
  net_profit DECIMAL(10,2) DEFAULT 0,
  avg_mission_value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS for reports table
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reports
CREATE POLICY "Users can manage their reports" 
ON public.reports 
FOR ALL 
USING (auth.uid() = user_id);

-- Enable RLS for analytics_data table
ALTER TABLE public.analytics_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics_data
CREATE POLICY "Users can manage their analytics data" 
ON public.analytics_data 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports (user_id);
CREATE INDEX IF NOT EXISTS idx_reports_date_range ON public.reports (date_from, date_to);
CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON public.analytics_data (user_id, date);

-- Create function to calculate daily analytics
CREATE OR REPLACE FUNCTION public.calculate_daily_analytics(_user_id UUID, _date DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  missions_data RECORD;
BEGIN
  -- Calculate metrics for the given date
  SELECT 
    COUNT(*) as missions_count,
    COALESCE(SUM(donor_earning + driver_earning), 0) as total_revenue,
    COALESCE(AVG(donor_earning + driver_earning), 0) as avg_mission_value
  INTO missions_data
  FROM missions 
  WHERE (created_by = _user_id OR donor_id = _user_id OR driver_id = _user_id)
    AND DATE(pickup_date) = _date
    AND status = 'completed';

  -- Insert or update analytics data
  INSERT INTO analytics_data (
    user_id, 
    date, 
    missions_count, 
    total_revenue, 
    avg_mission_value,
    net_profit
  )
  VALUES (
    _user_id,
    _date,
    missions_data.missions_count,
    missions_data.total_revenue,
    missions_data.avg_mission_value,
    missions_data.total_revenue -- Simplified calculation
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    missions_count = EXCLUDED.missions_count,
    total_revenue = EXCLUDED.total_revenue,
    avg_mission_value = EXCLUDED.avg_mission_value,
    net_profit = EXCLUDED.net_profit,
    updated_at = now();
END;
$$;

-- Create function to generate report data
CREATE OR REPLACE FUNCTION public.generate_report_data(
  _user_id UUID,
  _report_type TEXT,
  _date_from DATE,
  _date_to DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  report_data JSONB;
  missions_data RECORD;
  analytics_summary RECORD;
BEGIN
  -- Get missions data for the period
  SELECT 
    COUNT(*) as missions_count,
    COALESCE(SUM(donor_earning + driver_earning), 0) as total_revenue,
    COALESCE(AVG(donor_earning + driver_earning), 0) as avg_mission_value,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) as completed_missions
  INTO missions_data
  FROM missions 
  WHERE (created_by = _user_id OR donor_id = _user_id OR driver_id = _user_id)
    AND DATE(pickup_date) >= _date_from 
    AND DATE(pickup_date) <= _date_to;

  -- Get analytics summary
  SELECT 
    COALESCE(SUM(total_revenue), 0) as period_revenue,
    COALESCE(SUM(total_km), 0) as total_km,
    COALESCE(SUM(fuel_costs), 0) as fuel_costs,
    COALESCE(SUM(net_profit), 0) as net_profit
  INTO analytics_summary
  FROM analytics_data
  WHERE user_id = _user_id 
    AND date >= _date_from 
    AND date <= _date_to;

  -- Build report data based on type
  report_data := jsonb_build_object(
    'type', _report_type,
    'period', jsonb_build_object(
      'from', _date_from,
      'to', _date_to
    ),
    'summary', jsonb_build_object(
      'missions_count', missions_data.missions_count,
      'completed_missions', missions_data.completed_missions,
      'total_revenue', COALESCE(analytics_summary.period_revenue, missions_data.total_revenue),
      'avg_mission_value', missions_data.avg_mission_value,
      'total_km', analytics_summary.total_km,
      'fuel_costs', analytics_summary.fuel_costs,
      'net_profit', COALESCE(analytics_summary.net_profit, missions_data.total_revenue)
    )
  );

  RETURN report_data;
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analytics_data_updated_at
  BEFORE UPDATE ON public.analytics_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();