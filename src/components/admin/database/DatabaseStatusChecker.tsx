
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// This component is now empty and won't show any notifications
const DatabaseStatusChecker: React.FC = () => {
  // Removed all database status checking and notifications
  return null;
};

export default DatabaseStatusChecker;
