
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare } from "lucide-react";

interface QuoteActionsProps {
  prevStep: () => void;
  downloadQuote: () => void;
  sendWhatsApp: () => void;
}

const QuoteActions: React.FC<QuoteActionsProps> = ({
  prevStep,
  downloadQuote,
  sendWhatsApp
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between pt-3 pb-6">
      <Button type="button" variant="outline" onClick={prevStep}>
        Indietro
      </Button>
      <div className="flex gap-3 flex-col md:flex-row w-full md:w-auto">
        <Button
          type="button"
          className="w-full md:w-auto"
          onClick={downloadQuote}
          variant="secondary"
        >
          <FileText className="mr-2" />
          Scarica preventivo PDF
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
    </div>
  );
};

export default QuoteActions;
