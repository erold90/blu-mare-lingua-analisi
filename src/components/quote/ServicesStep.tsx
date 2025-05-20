
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Plus, Minus } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  FormField, 
  FormItem, 
  FormControl,
  FormMessage 
} from "@/components/ui/form";
import { FormValues } from "@/utils/quoteFormSchema";

interface ServicesStepProps {
  form: UseFormReturn<FormValues>;
  prevStep: () => void;
  nextStep: () => void;
}

const ServicesStep: React.FC<ServicesStepProps> = ({ form, prevStep, nextStep }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Servizi extra</CardTitle>
        <CardDescription>Personalizza il tuo soggiorno con servizi aggiuntivi</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Opzioni biancheria */}
        <FormField
          control={form.control}
          name="linenOption"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <Label>Biancheria da letto e bagno</Label>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="linen-standard" />
                    <Label htmlFor="linen-standard" className="cursor-pointer">
                      Standard - Un cambio incluso (gratuito)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="extra" id="linen-extra" />
                    <Label htmlFor="linen-extra" className="cursor-pointer">
                      Extra - Un cambio biancheria aggiuntivo (+30€)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="deluxe" id="linen-deluxe" />
                    <Label htmlFor="linen-deluxe" className="cursor-pointer">
                      Deluxe - Cambi biancheria frequenti (+60€)
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Animali domestici */}
        <FormField
          control={form.control}
          name="hasPets"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                    id="has-pets"
                  />
                </FormControl>
                <Label htmlFor="has-pets" className="cursor-pointer">
                  Viaggerò con animali domestici
                </Label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Dettagli animali domestici (se presenti) */}
        {form.watch("hasPets") && (
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-medium">Dettagli animali domestici</h3>
            
            <div className="space-y-2">
              <Label htmlFor="pets-count">Numero di animali</Label>
              <div className="flex items-center space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => {
                    const current = form.getValues("petsCount") || 0;
                    if (current > 0) form.setValue("petsCount", current - 1);
                  }}
                  disabled={(form.getValues("petsCount") || 0) <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="pets-count"
                  type="number"
                  className="w-20 text-center"
                  {...form.register("petsCount", { valueAsNumber: true })}
                  readOnly
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => {
                    const current = form.getValues("petsCount") || 0;
                    form.setValue("petsCount", current + 1);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="petSize"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <Label>Taglia dell'animale</Label>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="small" id="pet-small" />
                        <Label htmlFor="pet-small" className="cursor-pointer">
                          Piccola (fino a 10kg) - 5€ al giorno per animale
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="pet-medium" />
                        <Label htmlFor="pet-medium" className="cursor-pointer">
                          Media (10-25kg) - 10€ al giorno per animale
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large" id="pet-large" />
                        <Label htmlFor="pet-large" className="cursor-pointer">
                          Grande (oltre 25kg) - 15€ al giorno per animale
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>Indietro</Button>
        <Button type="button" onClick={nextStep}>Avanti</Button>
      </CardFooter>
    </Card>
  );
};

export default ServicesStep;
