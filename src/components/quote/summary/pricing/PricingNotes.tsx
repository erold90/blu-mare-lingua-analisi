
import React from "react";

interface PricingNotesProps {
  pricesAreValid: boolean;
}

const PricingNotes: React.FC<PricingNotesProps> = ({ pricesAreValid }) => {
  if (pricesAreValid) return null;

  return (
    <div className="text-xs text-muted-foreground mt-2 p-2 bg-gray-50 rounded">
      <strong>Nota:</strong> I prezzi verranno calcolati in base alle tariffe configurate nell'area riservata. 
      Contattaci per un preventivo dettagliato.
    </div>
  );
};

export default PricingNotes;
