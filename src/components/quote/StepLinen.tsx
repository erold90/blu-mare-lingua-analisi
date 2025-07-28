import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bed, Euro, Info } from 'lucide-react';
import { QuoteFormData } from '@/hooks/useMultiStepQuote';

interface StepLinenProps {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  getBedsNeeded: () => number;
}

export const StepLinen: React.FC<StepLinenProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  getBedsNeeded
}) => {
  const bedsNeeded = getBedsNeeded();
  const linenCost = bedsNeeded * 15;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Bed className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Biancheria da letto e bagno</h2>
        <p className="text-muted-foreground">
          Servizio opzionale per il massimo comfort
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Servizio biancheria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Checkbox principale */}
          <div className="flex items-center space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="request_linen"
              checked={formData.requestLinen}
              onCheckedChange={(checked) => updateFormData({ requestLinen: !!checked })}
            />
            <Label htmlFor="request_linen" className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Richiedere biancheria da letto e bagno</div>
                  <div className="text-sm text-muted-foreground">
                    Lenzuola, federe, asciugamani per tutti gli ospiti
                  </div>
                </div>
                <Badge variant="outline" className="ml-4">
                  <Euro className="h-3 w-3 mr-1" />
                  €15/persona
                </Badge>
              </div>
            </Label>
          </div>

          {/* Dettaglio calcolo */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">Calcolo costo</h4>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Ospiti che occupano posto letto:</span>
                <span className="font-semibold">{bedsNeeded}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo per persona:</span>
                <span className="font-semibold">€15</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>Totale biancheria:</span>
                <span>€{linenCost}</span>
              </div>
            </div>
          </div>

          {/* Cosa include */}
          <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              Il servizio include
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Set completo lenzuola per ogni letto</li>
              <li>• Federe per tutti i cuscini</li>
              <li>• Asciugamani da bagno grandi</li>
              <li>• Asciugamani da viso</li>
              <li>• Tappetini bagno</li>
              <li>• Biancheria di qualità, pulita e stirata</li>
            </ul>
          </div>

          {/* Informazioni aggiuntive */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              Nota importante
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              I bambini che dormono con i genitori o in culla non sono inclusi nel calcolo 
              del costo biancheria, in quanto non occupano un posto letto separato.
            </p>
          </div>

          {/* Riepilogo costo */}
          {formData.requestLinen && (
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">€{linenCost}</div>
              <div className="text-sm text-muted-foreground">
                Costo biancheria totale
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {bedsNeeded} ospiti × €15
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
        <Button onClick={onNext} size="lg" className="min-w-[200px]">
          Continua
        </Button>
      </div>
    </div>
  );
};