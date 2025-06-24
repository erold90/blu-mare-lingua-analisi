
import React from "react";

interface PaymentBreakdownProps {
  pricesAreValid: boolean;
  deposit: number;
  totalToPay: number;
}

const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({ pricesAreValid, deposit, totalToPay }) => {
  if (!pricesAreValid) return null;

  return (
    <div className="space-y-2 mt-3 p-3 bg-gray-50 rounded">
      <div className="text-xs font-medium text-muted-foreground mb-2">Modalità di pagamento:</div>
      
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">📅 Alla prenotazione (30%):</span>
        <span className="font-medium text-primary">{deposit}€</span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">🏠 All'arrivo (saldo):</span>
        <span className="font-medium">{totalToPay - deposit}€</span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">🛡️ Cauzione (restituibile):</span>
        <span className="font-medium">200€</span>
      </div>
    </div>
  );
};

export default PaymentBreakdown;
