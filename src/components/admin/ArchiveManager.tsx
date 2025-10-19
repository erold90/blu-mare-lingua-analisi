import React, { useState } from 'react';
import { Archive, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function ArchiveManager() {
  const [year, setYear] = useState<string>('2025');
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchive = async () => {
    if (!year || parseInt(year) < 2000 || parseInt(year) > 2100) {
      toast.error('Inserisci un anno valido');
      return;
    }

    setIsArchiving(true);

    try {
      // Call the database function to archive reservations
      const { data, error } = await supabase.rpc('archive_reservations_by_year', {
        target_year: parseInt(year)
      });

      if (error) throw error;

      const count = data as number;
      
      if (count === 0) {
        toast.info(`Nessuna prenotazione trovata per l'anno ${year}`);
      } else {
        toast.success(`${count} prenotazioni del ${year} archiviate con successo! Le statistiche sui ricavi sono state preservate.`);
      }
    } catch (error) {
      console.error('Error archiving reservations:', error);
      toast.error('Errore durante l\'archiviazione delle prenotazioni');
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Archiviazione Prenotazioni
        </CardTitle>
        <CardDescription>
          Archivia le prenotazioni di un anno specifico per mantenere il database ordinato
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-2">
              <p className="font-medium">Come funziona l'archiviazione:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Le prenotazioni vengono spostate nella tabella di archivio</li>
                <li>Non verranno più visualizzate nella lista prenotazioni attive</li>
                <li><strong className="text-foreground">Le statistiche e i ricavi rimangono disponibili</strong></li>
                <li>Puoi sempre consultare l'archivio storico</li>
                <li>L'operazione è reversibile (puoi ripristinare dall'archivio)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Anno da Archiviare</label>
          <Input
            type="number"
            min="2000"
            max="2100"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2025"
            className="max-w-[200px]"
          />
          <p className="text-xs text-muted-foreground">
            Inserisci l'anno delle prenotazioni che vuoi archiviare (es: 2025)
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              disabled={isArchiving}
            >
              <Archive className="h-4 w-4 mr-2" />
              {isArchiving ? 'Archiviazione in corso...' : `Archivia Anno ${year}`}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma Archiviazione</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  Stai per archiviare tutte le prenotazioni dell'anno <strong>{year}</strong>.
                </p>
                <p className="text-primary font-medium">
                  ✓ I dati sui ricavi e le statistiche saranno preservati
                </p>
                <p>
                  Le prenotazioni non saranno più visibili nella lista attiva ma rimarranno consultabili nell'archivio storico.
                </p>
                <p className="font-medium">
                  Vuoi procedere?
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={handleArchive}>
                Archivia
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
