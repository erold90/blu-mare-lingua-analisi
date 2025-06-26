
import React from "react";
import { Heart, BedDouble } from "lucide-react";

interface ChildrenSpecialArrangementsProps {
  childrenWithParents: number;
  childrenInCribs: number;
}

const ChildrenSpecialArrangements: React.FC<ChildrenSpecialArrangementsProps> = ({
  childrenWithParents,
  childrenInCribs
}) => {
  if (childrenWithParents === 0 && childrenInCribs === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2">
      <div className="text-sm font-medium text-amber-800 mb-2">
        Sistemazioni speciali:
      </div>
      
      {childrenWithParents > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Heart className="h-3 w-3" />
            Dormono con i genitori:
          </span>
          <span className="font-medium text-blue-600">
            {childrenWithParents} (non occupano posto letto)
          </span>
        </div>
      )}
      
      {childrenInCribs > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <BedDouble className="h-3 w-3" />
            Dormono in culla:
          </span>
          <span className="font-medium text-green-600">
            {childrenInCribs} (servizio gratuito)
          </span>
        </div>
      )}
    </div>
  );
};

export default ChildrenSpecialArrangements;
