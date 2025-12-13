import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';

export default function SecurityPolicyPage() {
  return (
    <>
      <SEOHead 
        title="Politica di Sicurezza - Villa MareBlu"
        description="Informazioni sulla sicurezza e protezione dei dati di Villa MareBlu"
        canonicalUrl="/security-policy"
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Shield className="h-16 w-16 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">Politica di Sicurezza</h1>
              <p className="text-xl text-muted-foreground">
                La tua sicurezza e privacy sono la nostra priorità
              </p>
            </div>

            {/* Security Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Panoramica della Sicurezza
                </CardTitle>
                <CardDescription>
                  Villa MareBlu implementa le migliori pratiche di sicurezza per proteggere i tuoi dati
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <Lock className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">Crittografia SSL</h3>
                    <p className="text-sm text-muted-foreground">
                      Tutti i dati sono trasmessi con crittografia TLS 1.3
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Shield className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">Protezione XSS</h3>
                    <p className="text-sm text-muted-foreground">
                      Content Security Policy e sanitizzazione input
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Eye className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">Monitoraggio</h3>
                    <p className="text-sm text-muted-foreground">
                      Rilevamento automatico di tentativi di attacco
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card>
              <CardHeader>
                <CardTitle>Protezione dei Dati</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Crittografia dei Dati</h4>
                      <p className="text-sm text-muted-foreground">
                        Tutti i dati sensibili sono crittografati sia in transito che a riposo utilizzando algoritmi AES-256.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Accesso Limitato</h4>
                      <p className="text-sm text-muted-foreground">
                        Solo il personale autorizzato ha accesso ai dati, con autenticazione multi-fattore.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Backup Sicuri</h4>
                      <p className="text-sm text-muted-foreground">
                        Backup automatici crittografati con conservazione geograficamente distribuita.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Measures */}
            <Card>
              <CardHeader>
                <CardTitle>Misure di Sicurezza Implementate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Sicurezza Frontend
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Attivo</Badge>
                        <span className="text-sm">Content Security Policy (CSP)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Attivo</Badge>
                        <span className="text-sm">Sanitizzazione Input Anti-XSS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Attivo</Badge>
                        <span className="text-sm">Rate Limiting Form</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Attivo</Badge>
                        <span className="text-sm">Validazione Client-Side</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Sicurezza Backend
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Attivo</Badge>
                        <span className="text-sm">Autenticazione Supabase</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Attivo</Badge>
                        <span className="text-sm">Row Level Security (RLS)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Attivo</Badge>
                        <span className="text-sm">Controllo Accessi API</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Attivo</Badge>
                        <span className="text-sm">Monitoring Security Events</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Incident Response */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Gestione degli Incidenti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  In caso di sospetta violazione della sicurezza, seguiamo un protocollo di risposta agli incidenti:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Rilevamento e Analisi</h4>
                      <p className="text-sm text-muted-foreground">
                        Identificazione immediata dell'incidente attraverso sistemi di monitoraggio automatici.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Contenimento</h4>
                      <p className="text-sm text-muted-foreground">
                        Isolamento della minaccia per prevenire ulteriori danni.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Notifica</h4>
                      <p className="text-sm text-muted-foreground">
                        Comunicazione tempestiva agli utenti interessati e alle autorità competenti.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">Ripristino e Miglioramento</h4>
                      <p className="text-sm text-muted-foreground">
                        Ripristino dei servizi e implementazione di misure preventive aggiuntive.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Segnalazione Problemi di Sicurezza</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Se riscontri problemi di sicurezza o vulnerabilità, ti preghiamo di contattarci immediatamente:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Email:</span>
                    <span>security@villamareblu.it</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Telefono:</span>
                    <span>+39 379 0038730 (emergenze)</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Rispettiamo la divulgazione responsabile e riconosciamo i contributi della community di sicurezza.
                </p>
              </CardContent>
            </Card>

            {/* Last Updated */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Ultima modifica: {new Date().toLocaleDateString('it-IT', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}