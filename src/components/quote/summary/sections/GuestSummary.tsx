
import React from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Baby, UserCheck } from "lucide-react";

interface GuestSummaryProps {
  formValues: FormValues;
}

const GuestSummary: React.FC<GuestSummaryProps> = ({ formValues }) => {
  const adults = formValues.adults || 0;
  const children = formValues.children || 0;
  const totalGuests = adults + children;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Informazioni ospiti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total guests */}
        <div className="text-center p-4 bg-primary/5 rounded-lg">
          <div className="text-2xl font-bold text-primary mb-1">
            {totalGuests}
          </div>
          <div className="text-sm text-muted-foreground">
            Ospiti totali
          </div>
        </div>
        
        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-xl font-semibold text-blue-600 mb-1">
              {adults}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <UserCheck className="h-3 w-3" />
              Adult{adults !== 1 ? 'i' : 'o'}
            </div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-xl font-semibold text-green-600 mb-1">
              {children}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Baby className="h-3 w-3" />
              Bambin{children !== 1 ? 'i' : 'o'}
            </div>
          </div>
        </div>
        
        {/* Children details placeholder - for future implementation */}
        {children > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-800 font-medium mb-1">
              Dettagli bambini
            </div>
            <div className="text-xs text-yellow-700">
              I dettagli specifici sui bambini saranno implementati nel prossimo aggiornamento
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GuestSummary;
