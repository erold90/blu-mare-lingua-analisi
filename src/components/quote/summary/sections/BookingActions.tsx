
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";

interface BookingActionsProps {
  prevStep: () => void;
  sendWhatsApp: () => void;
}

const BookingActions: React.FC<BookingActionsProps> = ({ prevStep, sendWhatsApp }) => {
  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="flex items-center gap-2 px-8 py-3"
          size="lg"
        >
          <ArrowLeft className="h-4 w-4" />
          Modifica dettagli
        </Button>
        
        <Button
          type="button"
          onClick={sendWhatsApp}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-8 py-3"
          size="lg"
        >
          <MessageCircle className="h-4 w-4" />
          Invia richiesta WhatsApp
        </Button>
      </div>
      
      {/* Footer info */}
      <div className="text-center text-sm text-muted-foreground bg-gray-50 rounded-lg p-4">
        <p className="font-medium mb-1">
          📱 Cliccando "Invia richiesta WhatsApp" si aprirà WhatsApp con il messaggio già preparato
        </p>
        <p>
          ✅ Non sarai impegnato ad alcuna prenotazione fino alla conferma scritta
        </p>
      </div>
    </div>
  );
};

export default BookingActions;
