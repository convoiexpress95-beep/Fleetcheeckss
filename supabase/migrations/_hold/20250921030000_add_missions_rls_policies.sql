-- Add RLS policies for missions table
begin;

-- Enable RLS on missions table if not already enabled
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view all missions" ON public.missions;
DROP POLICY IF EXISTS "Users can create missions" ON public.missions; 
DROP POLICY IF EXISTS "Users can update their missions" ON public.missions;
DROP POLICY IF EXISTS "Users can delete their missions" ON public.missions;

-- Policy for SELECT: Users can view all missions
CREATE POLICY "Users can view all missions" 
ON public.missions FOR SELECT 
TO authenticated 
USING (true);

-- Policy for INSERT: Authenticated users can create missions
CREATE POLICY "Users can create missions" 
ON public.missions FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by::uuid);

-- Policy for UPDATE: Users can update missions they created
CREATE POLICY "Users can update their missions" 
ON public.missions FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by::uuid)
WITH CHECK (auth.uid() = created_by::uuid);

-- Policy for DELETE: Users can delete missions they created
CREATE POLICY "Users can delete their missions" 
ON public.missions FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by::uuid);

commit;