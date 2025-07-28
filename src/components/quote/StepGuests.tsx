import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Users, Baby, AlertCircle } from 'lucide-react';
import { QuoteFormData } from '@/hooks/useMultiStepQuote';

interface StepGuestsProps {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
  onNext: () => void;
  getBedsNeeded: () => number;
}

export const StepGuests: React.FC<StepGuestsProps> = ({
  formData,
  updateFormData,
  onNext,
  getBedsNeeded
}) => {
  const handleChildrenChange = (count: number) => {
    const newChildren = Math.max(0, count);
    const newChildrenWithParents = Array(newChildren).fill(false);
    updateFormData({ 
      children: newChildren, 
      childrenWithParents: newChildrenWithParents 
    });
  };

  const handleChildWithParentsChange = (index: number, withParents: boolean) => {
    const newChildrenWithParents = [...formData.childrenWithParents];
    newChildrenWithParents[index] = withParents;
    updateFormData({ childrenWithParents: newChildrenWithParents });
  };

  const canProceed = () => {
    const totalBeds = getBedsNeeded();
    return formData.adults >= 1 && totalBeds <= 23;
  };

  const totalGuests = formData.adults + formData.children;
  const bedsNeeded = getBedsNeeded();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Users className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Quanti ospiti?</h2>
        <p className="text-muted-foreground">
          Inserisci il numero di adulti e bambini per il tuo soggiorno
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Composizione gruppo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Adulti */}
          <div className="space-y-2">
            <Label htmlFor="adults" className="text-lg font-semibold">
              Adulti (obbligatorio)
            </Label>
            <Input
              id="adults"
              type="number"
              min="1"
              max="23"
              value={formData.adults}
              onChange={(e) => updateFormData({ adults: parseInt(e.target.value) || 1 })}
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">
              Minimo 1, massimo 23 adulti
            </p>
          </div>

          {/* Bambini */}
          <div className="space-y-2">
            <Label htmlFor="children" className="text-lg font-semibold">
              Bambini
            </Label>
            <Input
              id="children"
              type="number"
              min="0"
              value={formData.children}
              onChange={(e) => handleChildrenChange(parseInt(e.target.value) || 0)}
              className="text-lg"
            />
          </div>

          {/* Checkbox per ogni bambino */}
          {formData.children > 0 && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Baby className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Dettagli bambini</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Indica per ogni bambino se dorme con i genitori o in culla (non occupa posto letto)
              </p>
              
              {Array.from({ length: formData.children }, (_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Checkbox
                    id={`child-${index}`}
                    checked={formData.childrenWithParents[index] || false}
                    onCheckedChange={(checked) => 
                      handleChildWithParentsChange(index, !!checked)
                    }
                  />
                  <Label htmlFor={`child-${index}`} className="flex-1">
                    Bambino {index + 1} dorme con i genitori/in culla
                  </Label>
                </div>
              ))}
            </div>
          )}

          {/* Riepilogo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalGuests}</div>
              <div className="text-sm text-muted-foreground">Ospiti totali</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{bedsNeeded}</div>
              <div className="text-sm text-muted-foreground">Posti letto</div>
            </div>
            <div className="text-center">
              <Badge 
                variant={bedsNeeded <= 23 ? "default" : "destructive"}
                className="text-sm px-3 py-1"
              >
                {bedsNeeded <= 23 ? "✓ Valido" : "✗ Troppi"}
              </Badge>
            </div>
          </div>

          {bedsNeeded > 23 && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">
                Il numero di posti letto richiesti ({bedsNeeded}) supera la capacità massima (23). 
                Riduci il numero di ospiti o aumenta i bambini che dormono con i genitori.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={onNext}
          disabled={!canProceed()}
          size="lg"
          className="min-w-[200px]"
        >
          Continua
        </Button>
      </div>
    </div>
  );
};