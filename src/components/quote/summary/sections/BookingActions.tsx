
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";

interface BookingActionsProps {
  prevStep: () => void;
  sendWhatsApp: () => void;
}

const BookingActions: React.FC<BookingActionsProps> = ({ prevStep, sendWhatsApp }) => {
  return (
    <div className="space-y-8">
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          type="button"
          variant="ghost"
          onClick={prevStep}
          className="flex items-center gap-2 px-8 py-3 border border-border"
        >
          <ArrowLeft className="h-4 w-4" />
          Modifica
        </Button>
        
        <Button
          type="button"
          onClick={sendWhatsApp}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3"
        >
          <MessageCircle className="h-4 w-4" />
          Invia su WhatsApp
        </Button>
      </div>
      
      {/* Footer info */}
      <div className="text-center text-sm text-muted-foreground border border-border/50 p-4">
        <p className="mb-2">
          Il messaggio verrà preparato automaticamente per WhatsApp
        </p>
        <p className="text-xs">
          Nessun impegno fino alla conferma scritta
        </p>
      </div>
    </div>
  );
};

export default BookingActions;
