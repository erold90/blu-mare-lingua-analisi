import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Heart, Euro } from 'lucide-react';
import { QuoteFormData } from '@/hooks/useMultiStepQuote';

interface StepPetsProps {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const apartmentNames = {
  "appartamento-1": "Appartamento 1",
  "appartamento-2": "Appartamento 2", 
  "appartamento-3": "Appartamento 3",
  "appartamento-4": "Appartamento 4"
};

export const StepPets: React.FC<StepPetsProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrev
}) => {
  const handlePetsChange = (hasPets: boolean) => {
    updateFormData({ 
      hasPets,
      petApartment: hasPets && formData.selectedApartments.length === 1 
        ? formData.selectedApartments[0] 
        : undefined 
    });
  };

  const canProceed = () => {
    if (!formData.hasPets) return true;
    if (formData.selectedApartments.length === 1) return true;
    return !!formData.petApartment;
  };

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
                  <div className="font-semibold">Viaggio con un animale domestico</div>
                  <div className="text-sm text-muted-foreground">
                    Cani, gatti e altri animali domestici sono benvenuti
                  </div>
                </div>
                <Badge variant="outline" className="ml-4">
                  <Euro className="h-3 w-3 mr-1" />
                  €50
                </Badge>
              </div>
            </Label>
          </div>

          {/* Selezione appartamento se più di uno selezionato */}
          {formData.hasPets && formData.selectedApartments.length > 1 && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <Label className="text-lg font-semibold">
                In quale appartamento alloggerà l'animale?
              </Label>
              <p className="text-sm text-muted-foreground">
                Il costo di €50 si applica all'appartamento selezionato
              </p>
              
              <Select 
                value={formData.petApartment} 
                onValueChange={(value) => updateFormData({ petApartment: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona appartamento" />
                </SelectTrigger>
                <SelectContent>
                  {formData.selectedApartments.map(aptId => (
                    <SelectItem key={aptId} value={aptId}>
                      {apartmentNames[aptId as keyof typeof apartmentNames]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Informazioni */}
          <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              Informazioni importanti
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Costo: €50 per appartamento con animale</li>
              <li>• Gli animali devono essere sempre controllati</li>
              <li>• È richiesta la pulizia extra in caso di danni</li>
              <li>• Portare guinzaglio, ciotole e cuccia propri</li>
              <li>• Accesso alle aree comuni con supervisione</li>
            </ul>
          </div>

          {/* Riepilogo costi */}
          {formData.hasPets && (
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">€50</div>
              <div className="text-sm text-muted-foreground">
                Costo animale domestico
                {formData.selectedApartments.length > 1 && formData.petApartment && (
                  <div className="mt-1">
                    per {apartmentNames[formData.petApartment as keyof typeof apartmentNames]}
                  </div>
                )}
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