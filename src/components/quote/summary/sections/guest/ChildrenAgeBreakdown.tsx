
import React from "react";

interface ChildrenAgeBreakdownProps {
  childrenUnder12: number;
  childrenOver12: number;
}

const ChildrenAgeBreakdown: React.FC<ChildrenAgeBreakdownProps> = ({ 
  childrenUnder12, 
  childrenOver12 
}) => {
  return (
    <div className="bg-blue-50 rounded-lg p-3 space-y-2">
      <div className="text-sm font-medium text-blue-800 mb-2">
        Classificazione per età:
      </div>
      
      {childrenUnder12 > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">• Sotto i 12 anni:</span>
          <span className="font-medium text-green-600">
            {childrenUnder12} (tassa soggiorno gratuita)
          </span>
        </div>
      )}
      
      {childrenOver12 > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">• Sopra i 12 anni:</span>
          <span className="font-medium">{childrenOver12}</span>
        </div>
      )}
    </div>
  );
};

export default ChildrenAgeBreakdown;
