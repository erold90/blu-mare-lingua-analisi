import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Users, Baby, AlertCircle, Plus, Minus } from 'lucide-react';
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
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6 sm:mb-8">
        <Users className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Quanti ospiti?</h2>
        <p className="text-sm sm:text-base text-muted-foreground px-4">
          Inserisci il numero di adulti e bambini
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            Composizione gruppo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 sm:space-y-6">
          {/* Adulti */}
          <div className="space-y-2">
            <Label className="text-base sm:text-lg font-semibold">
              Adulti (obbligatorio)
            </Label>
            <div className="flex items-center justify-center gap-6 sm:gap-4 p-4 border rounded-lg">
              <Button
                variant="outline"
                onClick={() => updateFormData({ adults: Math.max(1, formData.adults - 1) })}
                disabled={formData.adults <= 1}
                className="h-12 w-12 sm:h-10 sm:w-10 p-0 text-lg touch-manipulation"
              >
                <Minus className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
              <div className="text-3xl sm:text-2xl font-bold min-w-[60px] text-center tabular-nums">
                {formData.adults}
              </div>
              <Button
                variant="outline"
                onClick={() => updateFormData({ adults: Math.min(23, formData.adults + 1) })}
                disabled={formData.adults >= 23}
                className="h-12 w-12 sm:h-10 sm:w-10 p-0 text-lg touch-manipulation"
              >
                <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Minimo 1, massimo 23 adulti
            </p>
          </div>

          {/* Bambini */}
          <div className="space-y-2">
            <Label className="text-base sm:text-lg font-semibold">
              Bambini
            </Label>
            <div className="flex items-center justify-center gap-6 sm:gap-4 p-4 border rounded-lg">
              <Button
                variant="outline"
                onClick={() => handleChildrenChange(formData.children - 1)}
                disabled={formData.children <= 0}
                className="h-12 w-12 sm:h-10 sm:w-10 p-0 text-lg touch-manipulation"
              >
                <Minus className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
              <div className="text-3xl sm:text-2xl font-bold min-w-[60px] text-center tabular-nums">
                {formData.children}
              </div>
              <Button
                variant="outline"
                onClick={() => handleChildrenChange(formData.children + 1)}
                className="h-12 w-12 sm:h-10 sm:w-10 p-0 text-lg touch-manipulation"
              >
                <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
            </div>
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
                <div key={index} className="flex items-center space-x-2 p-2 border rounded-lg">
                  <Checkbox
                    id={`child-${index}`}
                    checked={formData.childrenWithParents[index] || false}
                    onCheckedChange={(checked) =>
                      handleChildWithParentsChange(index, !!checked)
                    }
                  />
                  <Label htmlFor={`child-${index}`} className="flex-1 text-sm cursor-pointer">
                    Bambino {index + 1} con genitori/culla
                  </Label>
                </div>
              ))}
            </div>
          )}

          {/* Riepilogo */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary tabular-nums">{totalGuests}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Ospiti</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary tabular-nums">{bedsNeeded}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Posti letto</div>
            </div>
            <div className="text-center flex items-center justify-center">
              <Badge
                variant={bedsNeeded <= 23 ? "default" : "destructive"}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1"
              >
                {bedsNeeded <= 23 ? "✓ OK" : "✗ Troppi"}
              </Badge>
            </div>
          </div>

          {bedsNeeded > 23 && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-destructive">
                Posti letto richiesti ({bedsNeeded}) superiori alla capacità massima (23).
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sticky bottom button on mobile */}
      <div className="flex justify-center pb-4 sm:pb-0">
        <Button
          onClick={onNext}
          disabled={!canProceed()}
          size="lg"
          className="w-full sm:w-auto sm:min-w-[200px] h-12 sm:h-11 text-base touch-manipulation"
        >
          Continua
        </Button>
      </div>
    </div>
  );
};