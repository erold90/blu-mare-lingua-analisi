
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface QuoteActionsProps {
  prevStep: () => void;
  sendWhatsApp: () => void;
}

const QuoteActions: React.FC<QuoteActionsProps> = ({
  prevStep,
  sendWhatsApp
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between pt-3 pb-6">
      <Button type="button" variant="outline" onClick={prevStep}>
        Indietro
      </Button>
      <Button
        type="button"
        className="w-full md:w-auto"
        onClick={sendWhatsApp}
      >
        <MessageSquare className="mr-2" />
        Invia preventivo via WhatsApp
      </Button>
    </div>
  );
};

export default QuoteActions;
