import React from 'react';
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

  console.log('🛡️ ProtectedRoute state:', { isAuthenticated, isLoading, userRole });

  // Mostra loading mentre verifica l'autenticazione
  if (isLoading) {
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

  if (!isAuthenticated) {
    console.log('❌ ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
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