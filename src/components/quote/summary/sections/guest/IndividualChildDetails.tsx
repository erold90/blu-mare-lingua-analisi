
import React from "react";
import { UserCheck, Heart, BedDouble } from "lucide-react";

interface ChildDetails {
  isUnder12?: boolean;
  sleepsWithParents?: boolean;
  sleepsInCrib?: boolean;
}

interface IndividualChildDetailsProps {
  childrenDetails: ChildDetails[];
}

const IndividualChildDetails: React.FC<IndividualChildDetailsProps> = ({ childrenDetails }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-3">
      <div className="text-sm font-medium text-gray-800 mb-2">
        Dettaglio per bambino:
      </div>
      
      {childrenDetails.map((child, index) => (
        <div key={index} className="border-l-2 border-primary/30 pl-3 py-1">
          <div className="font-medium text-sm text-gray-700 mb-1">
            Bambino {index + 1}:
          </div>
          <div className="text-xs space-y-1">
            {/* Age */}
            <div className={`flex items-center gap-1 ${child?.isUnder12 ? 'text-green-600' : 'text-gray-600'}`}>
              <UserCheck className="h-3 w-3" />
              {child?.isUnder12 ? 'Sotto i 12 anni (tassa gratuita)' : 'Sopra i 12 anni'}
            </div>
            
            {/* Sleep arrangement */}
            {child?.sleepsWithParents && (
              <div className="flex items-center gap-1 text-blue-600">
                <Heart className="h-3 w-3" />
                Dorme con i genitori
              </div>
            )}
            
            {child?.sleepsInCrib && (
              <div className="flex items-center gap-1 text-green-600">
                <BedDouble className="h-3 w-3" />
                Dorme in culla (gratuita)
              </div>
            )}
            
            {!child?.sleepsWithParents && !child?.sleepsInCrib && (
              <div className="flex items-center gap-1 text-gray-600">
                <BedDouble className="h-3 w-3" />
                Posto letto singolo
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IndividualChildDetails;
