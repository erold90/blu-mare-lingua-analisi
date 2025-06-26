
import React from "react";
import { UserCheck, Baby } from "lucide-react";

interface GuestBreakdownProps {
  adults: number;
  children: number;
}

const GuestBreakdown: React.FC<GuestBreakdownProps> = ({ adults, children }) => {
  return (
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
  );
};

export default GuestBreakdown;
