import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Sparkles } from "lucide-react";

// Componente semplificato temporaneo per pulizie
export const AdminCleaningManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestione Pulizie</h1>
        <p className="text-muted-foreground">
          Sistema di gestione delle pulizie e manutenzioni
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Sistema Pulizie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CalendarCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sistema in Sviluppo</h3>
            <p className="text-muted-foreground">
              Il sistema di gestione pulizie sarà disponibile a breve con funzionalità complete per:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-1 text-sm text-muted-foreground">
              <li>Programmazione automatica task di pulizia</li>
              <li>Assegnazione personale</li>
              <li>Tracking tempi e completamento</li>
              <li>Integrazione con prenotazioni</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};