import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DatabaseStatusChecker: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        // Perform a simple query to check the database connection
        await supabase.from('apartments').select('id').limit(1);
        setStatus('connected');
        setError(null);
      } catch (e: any) {
        setStatus('error');
        setError(e.message);
      }
    };

    checkDatabaseStatus();
  }, []);

  return (
    <div>
      {status === 'loading' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Status</AlertTitle>
          <AlertDescription>Checking database connection...</AlertDescription>
        </Alert>
      )}

      {status === 'connected' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Status</AlertTitle>
          <AlertDescription>Database connected and operational</AlertDescription>
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant={status === 'error' ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Status</AlertTitle>
          <AlertDescription>
            {status === 'loading' && "Checking database connection..."}
            {status === 'connected' && "Database connected and operational"}
            {status === 'error' && `Database error: ${error}`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DatabaseStatusChecker;
