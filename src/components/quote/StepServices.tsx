import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PawPrint, Bed, Euro, Sparkles, AlertTriangle } from 'lucide-react';
import { QuoteFormData } from '@/hooks/useMultiStepQuote';

interface StepServicesProps {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  getBedsNeeded: () => number;
}

export default function StepServices({
  formData,
  updateFormData,
  onNext,
  onPrev,
  getBedsNeeded
}: StepServicesProps) {
  const bedsNeeded = getBedsNeeded();
  const [showLinenConfirmDialog, setShowLinenConfirmDialog] = useState(false);

  // Calcolo costi
  const petCost = formData.hasPets ? (formData.petCount || 1) * 50 : 0;
  const linenCost = formData.requestLinen ? bedsNeeded * 15 : 0;
  const totalServicesCost = petCost + linenCost;

  // Gestione checkbox biancheria con conferma
  const handleLinenChange = (checked: boolean) => {
    if (checked) {
      // Se seleziona, aggiorna direttamente
      updateFormData({ requestLinen: true });
    } else {
      // Se deseleziona, mostra dialog di conferma
      setShowLinenConfirmDialog(true);
    }
  };

  const confirmRemoveLinen = () => {
    updateFormData({ requestLinen: false });
    setShowLinenConfirmDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Servizi Extra</h2>
        <p className="text-muted-foreground">
          Seleziona i servizi aggiuntivi opzionali
        </p>
      </div>

      {/* Card Animali */}
      <Card className="max-w-2xl mx-auto hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PawPrint className="h-5 w-5" />
            Animali Domestici
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="hasPets"
              checked={formData.hasPets}
              onCheckedChange={(checked) =>
                updateFormData({
                  hasPets: checked as boolean,
                  petCount: checked ? 1 : 0
                })
              }
            />
            <div className="flex-1">
              <label htmlFor="hasPets" className="font-medium cursor-pointer block">
                Sì, porto animali domestici
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Supplemento €50 per animale
              </p>
            </div>
          </div>

          {formData.hasPets && (
            <div className="ml-7 p-4 bg-muted rounded-lg space-y-3 animate-in slide-in-from-top-2 duration-200">
              <label className="text-sm font-medium block">
                Quanti animali?
              </label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateFormData({
                    petCount: Math.max(1, (formData.petCount || 1) - 1)
                  })}
                  className="h-10 w-10 sm:h-12 sm:w-12"
                  disabled={(formData.petCount || 1) <= 1}
                >
                  -
                </Button>
                <span className="text-2xl font-bold w-12 text-center">
                  {formData.petCount || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateFormData({
                    petCount: (formData.petCount || 1) + 1
                  })}
                  className="h-10 w-10 sm:h-12 sm:w-12"
                  disabled={(formData.petCount || 1) >= 10}
                >
                  +
                </Button>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                <Euro className="h-3 w-3" />
                Costo: €{petCost}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Biancheria */}
      <Card className="max-w-2xl mx-auto hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Biancheria da Letto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="requestLinen"
              checked={formData.requestLinen}
              onCheckedChange={(checked) => handleLinenChange(checked as boolean)}
            />
            <div className="flex-1">
              <label htmlFor="requestLinen" className="font-medium cursor-pointer block">
                Sì, richiedo biancheria da letto
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Supplemento €15 per persona
              </p>
            </div>
          </div>

          {formData.requestLinen && (
            <div className="ml-7 p-4 bg-muted rounded-lg space-y-2 animate-in slide-in-from-top-2 duration-200">
              <p className="text-sm">
                Per <span className="font-bold">{bedsNeeded}</span> {bedsNeeded === 1 ? 'posto letto' : 'posti letto'}
              </p>
              <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                <Euro className="h-3 w-3" />
                Costo: €{linenCost}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totale Servizi */}
      {totalServicesCost > 0 && (
        <Card className="max-w-2xl mx-auto border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Totale Servizi Extra:</span>
              <Badge className="text-lg py-1 px-3">
                €{totalServicesCost}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info opzionale */}
      {totalServicesCost === 0 && (
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Nessun servizio extra selezionato. Puoi procedere al riepilogo.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onPrev} size="lg">
          Indietro
        </Button>
        <Button onClick={onNext} size="lg" className="min-w-[200px]">
          Continua al Riepilogo
        </Button>
      </div>

      {/* Modal conferma rimozione biancheria */}
      <AlertDialog open={showLinenConfirmDialog} onOpenChange={setShowLinenConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Conferma rimozione biancheria
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-3">
              <p>
                Senza il servizio biancheria dovrai portare <strong>da casa</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Lenzuola per tutti i letti</li>
                <li>Federe per i cuscini</li>
                <li>Asciugamani (viso e doccia)</li>
              </ul>
              <p className="text-amber-600 font-medium">
                Sei sicuro di voler procedere senza biancheria?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveLinen}>
              Confermo, porto la mia
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
