import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAdminAuth } from './AdminAuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, isLoading, userRole } = useAdminAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Timeout per evitare loading infinito
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('⏰ Auth loading timeout - forcing navigation to login');
        setLoadingTimeout(true);
      }
    }, 5000); // 5 secondi timeout

    return () => clearTimeout(timer);
  }, [isLoading]);

  console.log('🛡️ ProtectedRoute state:', { isAuthenticated, isLoading, userRole, loadingTimeout });

  // Se timeout o non autenticato, redirect al login
  if (loadingTimeout || (!isLoading && !isAuthenticated)) {
    console.log('❌ ProtectedRoute: Redirecting to login (timeout or not authenticated)');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Mostra loading solo se sta ancora caricando (senza timeout)
  if (isLoading && !loadingTimeout) {
    console.log('🔄 ProtectedRoute: Still loading auth...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Verifica accesso...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('✅ ProtectedRoute: Authenticated, rendering children');

  if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <h2 className="text-lg font-semibold mb-2">Accesso Negato</h2>
            <p className="text-sm text-muted-foreground text-center">
              Non hai i permessi necessari per accedere a questa pagina.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};