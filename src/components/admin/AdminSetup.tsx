import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';
import { isValidEmail, sanitizeInput } from '@/utils/securityConfig';

/**
 * Admin setup component for initial configuration
 */
export const AdminSetup: React.FC = () => {
  const { adminSettings, updateAdminSettings } = useSettings();
  const [formData, setFormData] = useState({
    username: adminSettings.username,
    password: '',
    confirmPassword: '',
    email: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: sanitizeInput(value)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.username || formData.username.length < 3) {
      toast.error('Il nome utente deve essere di almeno 3 caratteri');
      return false;
    }

    if (!formData.password || formData.password.length < 8) {
      toast.error('La password deve essere di almeno 8 caratteri');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Le password non coincidono');
      return false;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      toast.error('Formato email non valido');
      return false;
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      toast.error('La password deve contenere almeno: una maiuscola, una minuscola, un numero e un carattere speciale');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Update admin settings
      updateAdminSettings({
        username: formData.username,
        password: formData.password,
      });

      toast.success('Configurazione admin completata con successo!');
      
      // Clear sensitive form data
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));

    } catch (error) {
      toast.error('Errore durante la configurazione. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't show setup if admin already configured
  if (adminSettings.password && adminSettings.password.length > 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configurazione Admin</CardTitle>
          <CardDescription>
            Configura le credenziali di accesso per l'area amministrativa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome Utente</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Inserisci nome utente"
                required
                minLength={3}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Inserisci password sicura"
                required
                minLength={8}
                maxLength={128}
              />
              <p className="text-xs text-muted-foreground">
                Almeno 8 caratteri con maiuscole, minuscole, numeri e simboli
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Conferma Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Conferma la password"
                required
                minLength={8}
                maxLength={128}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Opzionale)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@esempio.com"
                maxLength={254}
              />
              <p className="text-xs text-muted-foreground">
                Per il recupero password (facoltativo)
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Configurazione...' : 'Configura Admin'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              🔒 Sicurezza
            </h4>
            <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Le credenziali sono crittografate localmente</li>
              <li>• Usa una password forte e unica</li>
              <li>• Non condividere le credenziali</li>
              <li>• Cambia la password periodicamente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};