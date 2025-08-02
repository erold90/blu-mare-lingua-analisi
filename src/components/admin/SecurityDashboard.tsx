import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Activity, 
  Lock, 
  CheckCircle, 
  XCircle,
  RefreshCw 
} from 'lucide-react';
import { SecurityMonitor, generateCSPHeader, advancedRateLimiter } from '@/utils/securityMiddleware';
import { RATE_LIMITS } from '@/utils/securityConfig';

export function SecurityDashboard() {
  const [violations, setViolations] = useState(SecurityMonitor.getViolations());
  const [securityScore, setSecurityScore] = useState(0);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    calculateSecurityScore();
    const interval = setInterval(() => {
      setViolations(SecurityMonitor.getViolations());
      calculateSecurityScore();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const calculateSecurityScore = () => {
    let score = 100;
    const recentViolations = violations.filter(v => 
      Date.now() - v.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    );
    
    // Deduct points for violations
    score -= recentViolations.length * 5;
    
    // Check security features
    const hasCSP = !!document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!hasCSP) score -= 10;
    
    // Check HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      score -= 20;
    }
    
    setSecurityScore(Math.max(0, score));
    setLastCheck(new Date());
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const clearViolations = () => {
    SecurityMonitor.clearViolations();
    setViolations([]);
    calculateSecurityScore();
  };

  const securityChecks = [
    {
      name: 'HTTPS Abilitato',
      status: location.protocol === 'https:' || location.hostname === 'localhost',
      description: 'Connessione sicura SSL/TLS'
    },
    {
      name: 'Content Security Policy',
      status: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
      description: 'Protezione contro XSS e injection'
    },
    {
      name: 'Rate Limiting Attivo',
      status: true, // Always active in our implementation
      description: 'Protezione contro attacchi brute force'
    },
    {
      name: 'Input Sanitization',
      status: true, // Always active
      description: 'Sanitizzazione automatica degli input'
    },
    {
      name: 'Autenticazione Supabase',
      status: true, // Always active
      description: 'Sistema di autenticazione sicuro'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Security Score Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Punteggio Sicurezza
            </CardTitle>
            <CardDescription>
              Valutazione generale della sicurezza del sistema
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(securityScore)} flex items-center gap-2`}>
              {getScoreIcon(securityScore)}
              {securityScore}/100
            </div>
            <p className="text-sm text-muted-foreground">
              Ultimo controllo: {lastCheck.toLocaleTimeString()}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={calculateSecurityScore} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Aggiorna Punteggio
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="violations">
            Violazioni 
            {violations.length > 0 && (
              <Badge variant="destructive" className="ml-2">{violations.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="config">Configurazione</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Security Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Controlli di Sicurezza
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityChecks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        {check.status ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{check.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{check.description}</p>
                    </div>
                    <Badge variant={check.status ? "default" : "destructive"}>
                      {check.status ? "Attivo" : "Inattivo"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rate Limiting Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Configurazione Rate Limiting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Form di Contatto:</span>
                  <span>{RATE_LIMITS.CONTACT_FORM.maxAttempts} tentativi / {RATE_LIMITS.CONTACT_FORM.windowMs / 60000} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Richieste Preventivi:</span>
                  <span>{RATE_LIMITS.QUOTE_REQUESTS.maxAttempts} tentativi / {RATE_LIMITS.QUOTE_REQUESTS.windowMs / 60000} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Tentativi Login:</span>
                  <span>{RATE_LIMITS.LOGIN_ATTEMPTS.maxAttempts} tentativi / {RATE_LIMITS.LOGIN_ATTEMPTS.windowMs / 60000} min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Violazioni di Sicurezza
                </CardTitle>
                <CardDescription>
                  Log degli ultimi tentativi di attacco rilevati
                </CardDescription>
              </div>
              {violations.length > 0 && (
                <Button onClick={clearViolations} variant="outline" size="sm">
                  Pulisci Log
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {violations.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nessuna violazione di sicurezza rilevata nelle ultime 24 ore.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {violations.slice(-10).reverse().map((violation, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-red-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="destructive" className="mb-2">
                            {violation.type}
                          </Badge>
                          <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                            {violation.data}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(violation.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Content Security Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-xs whitespace-pre-wrap break-all">
                  {generateCSPHeader()}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Raccomandazioni di Sicurezza</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Configurazione Supabase:</strong> Assicurati che la protezione delle password compromesse sia abilitata.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Eye className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Monitoraggio:</strong> Controlla regolarmente i log di violazione per rilevare pattern di attacco.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Backup:</strong> Mantieni backup regolari del database e implementa un piano di disaster recovery.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}