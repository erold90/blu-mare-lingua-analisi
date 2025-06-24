
import React from "react";
import { CreditCard, Home, Shield } from "lucide-react";

interface PaymentBreakdownProps {
  pricesAreValid: boolean;
  deposit: number;
  totalToPay: number;
}

const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({ pricesAreValid, deposit, totalToPay }) => {
  if (!pricesAreValid) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 text-primary font-medium mb-3">
        <CreditCard className="h-4 w-4" />
        <span className="text-sm">Modalità di pagamento</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Alla prenotazione (30%)</span>
          </div>
          <span className="font-semibold text-primary">{deposit}€</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">All'arrivo (saldo)</span>
          </div>
          <span className="font-semibold">{totalToPay - deposit}€</span>
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Cauzione (restituibile)</span>
            </div>
            <span className="font-semibold">200€</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentBreakdown;
