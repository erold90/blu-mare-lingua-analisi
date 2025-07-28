-- Fase 5: Tabelle per notifiche real-time e monitoring
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
  read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Notification policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Performance metrics policies (admin only)
CREATE POLICY "Admin can manage performance metrics" ON public.performance_metrics
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Triggers
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cleaning_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;