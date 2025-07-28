import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';

export const LoginForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Inserisci username e password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prima ottieni l'email dall'username (senza validare la password qui)
      const { data: userLookup, error: lookupError } = await supabase
        .rpc('login_with_username', {
          username_input: formData.username,
          password_input: '' // Password non necessaria per la lookup
        });

      if (lookupError || !userLookup || userLookup.length === 0) {
        throw new Error('Username non trovato');
      }

      const userEmail = userLookup[0].email;

      // Usa l'email per il login Supabase (qui viene validata la password)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: formData.password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Username o password non validi');
        }
        throw error;
      }

      if (data.user) {
        toast.success('Accesso effettuato con successo');
        navigate('/area-riservata/dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante l\'accesso';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Area Riservata</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Accedi al sistema di gestione
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Inserisci il tuo username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Inserisci la tua password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accesso in corso...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Accedi
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};