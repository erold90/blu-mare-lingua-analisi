
-- Drop existing cleaning_tasks table and recreate with proper structure
DROP TABLE IF EXISTS public.cleaning_tasks CASCADE;

-- Create apartments table if it doesn't exist (ensuring we have the reference)
CREATE TABLE IF NOT EXISTS public.apartments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default apartments if they don't exist
INSERT INTO public.apartments (id, name, capacity) VALUES 
  ('appartamento-1', 'Appartamento 1', 4),
  ('appartamento-2', 'Appartamento 2', 6),
  ('appartamento-3', 'Appartamento 3', 4),
  ('appartamento-4', 'Appartamento 4', 2)
ON CONFLICT (id) DO NOTHING;

-- Create cleaning_tasks table with proper foreign key constraints
CREATE TABLE public.cleaning_tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  apartment_id TEXT NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  task_date DATE NOT NULL,
  task_type TEXT NOT NULL DEFAULT 'checkout',
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  assignee TEXT,
  notes TEXT,
  estimated_duration INTEGER DEFAULT 60,
  actual_duration INTEGER,
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add constraints for valid values
  CONSTRAINT check_task_type CHECK (task_type IN ('checkout', 'maintenance', 'deep_clean', 'inspection')),
  CONSTRAINT check_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  CONSTRAINT check_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT check_estimated_duration CHECK (estimated_duration > 0),
  CONSTRAINT check_actual_duration CHECK (actual_duration IS NULL OR actual_duration > 0)
);

-- Create indexes for better performance
CREATE INDEX idx_cleaning_tasks_apartment_date ON public.cleaning_tasks(apartment_id, task_date);
CREATE INDEX idx_cleaning_tasks_status ON public.cleaning_tasks(status);
CREATE INDEX idx_cleaning_tasks_task_date ON public.cleaning_tasks(task_date);

-- Enable Row Level Security
ALTER TABLE public.cleaning_tasks ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for all operations
CREATE POLICY "Allow all operations on cleaning_tasks" 
  ON public.cleaning_tasks 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_cleaning_tasks_updated_at ON public.cleaning_tasks;
CREATE TRIGGER update_cleaning_tasks_updated_at
  BEFORE UPDATE ON public.cleaning_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure reservations table has proper structure for apartment_ids
-- Update existing reservations if needed to ensure apartment_ids is always an array
UPDATE public.reservations 
SET apartment_ids = '["appartamento-1"]'::jsonb 
WHERE apartment_ids IS NULL OR apartment_ids = '[]'::jsonb;
