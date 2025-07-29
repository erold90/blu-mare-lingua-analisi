import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Euro, Plus, Minus } from 'lucide-react';
import { QuoteFormData } from '@/hooks/useMultiStepQuote';

interface StepPetsProps {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const StepPets: React.FC<StepPetsProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrev
}) => {
  const handlePetsChange = (hasPets: boolean) => {
    updateFormData({ 
      hasPets,
      petCount: hasPets ? (formData.petCount || 1) : 0
    });
  };

  const handlePetCountChange = (count: number) => {
    if (count >= 0) {
      updateFormData({ petCount: count });
    }
  };

  const canProceed = () => {
    if (!formData.hasPets) return true;
    return (formData.petCount || 0) > 0;
  };

  const totalPetCost = (formData.petCount || 0) * 50;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Viaggi con animali domestici?</h2>
        <p className="text-muted-foreground">
          I nostri amici a quattro zampe sono i benvenuti
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Animali domestici
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Checkbox principale */}
          <div className="flex items-center space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="has_pets"
              checked={formData.hasPets}
              onCheckedChange={handlePetsChange}
            />
            <Label htmlFor="has_pets" className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Viaggio con animali domestici</div>
                  <div className="text-sm text-muted-foreground">
                    Cani, gatti e altri animali domestici sono benvenuti
                  </div>
                </div>
                <Badge variant="outline" className="ml-4">
                  <Euro className="h-3 w-3 mr-1" />
                  €50 cad.
                </Badge>
              </div>
            </Label>
          </div>

          {/* Contatore animali */}
          {formData.hasPets && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <Label className="text-lg font-semibold">
                Quanti animali domestici porti?
              </Label>
              <p className="text-sm text-muted-foreground">
                Il costo è di €50 per ogni animale domestico
              </p>
              
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handlePetCountChange((formData.petCount || 1) - 1)}
                  disabled={(formData.petCount || 1) <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.petCount || 1}
                  onChange={(e) => handlePetCountChange(parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handlePetCountChange((formData.petCount || 1) + 1)}
                  disabled={(formData.petCount || 1) >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Informazioni */}
          <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              Informazioni importanti
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Costo: €50 per ogni animale domestico</li>
              <li>• Gli animali devono essere sempre controllati</li>
              <li>• È richiesta la pulizia extra in caso di danni</li>
              <li>• Portare guinzaglio, ciotole e cuccia propri</li>
              <li>• Accesso alle aree comuni con supervisione</li>
            </ul>
          </div>

          {/* Riepilogo costi */}
          {formData.hasPets && (
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">€{totalPetCost}</div>
              <div className="text-sm text-muted-foreground">
                Costo per {formData.petCount || 1} animale{(formData.petCount || 1) > 1 ? 'i' : ''} domestico{(formData.petCount || 1) > 1 ? 'i' : ''}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onPrev} size="lg">
          Indietro
        </Button>
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