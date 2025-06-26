
import React from "react";
import { Baby } from "lucide-react";
import { FormValues } from "@/utils/quoteFormSchema";
import ChildrenAgeBreakdown from "./ChildrenAgeBreakdown";
import ChildrenSpecialArrangements from "./ChildrenSpecialArrangements";
import IndividualChildDetails from "./IndividualChildDetails";

interface ChildrenDetailsProps {
  children: number;
  childrenDetails: any[];
  childrenUnder12: number;
  childrenOver12: number;
  childrenWithParents: number;
  childrenInCribs: number;
}

const ChildrenDetails: React.FC<ChildrenDetailsProps> = ({
  children,
  childrenDetails,
  childrenUnder12,
  childrenOver12,
  childrenWithParents,
  childrenInCribs
}) => {
  if (children === 0) return null;

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center gap-2 text-primary font-medium">
        <Baby className="h-4 w-4" />
        <span>Dettagli bambini</span>
      </div>
      
      {/* Show children details if available */}
      {childrenDetails.length > 0 ? (
        <>
          <ChildrenAgeBreakdown 
            childrenUnder12={childrenUnder12}
            childrenOver12={childrenOver12}
          />
          
          <ChildrenSpecialArrangements
            childrenWithParents={childrenWithParents}
            childrenInCribs={childrenInCribs}
          />
          
          <IndividualChildDetails childrenDetails={childrenDetails} />
        </>
      ) : (
        /* Show placeholder if no details available */
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-sm text-yellow-800 font-medium mb-1">
            Dettagli bambini
          </div>
          <div className="text-xs text-yellow-700">
            Completa il primo step per vedere i dettagli specifici sui bambini
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildrenDetails;
