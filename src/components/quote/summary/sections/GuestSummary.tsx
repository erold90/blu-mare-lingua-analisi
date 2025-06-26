
import React from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Import the new focused components
import GuestTotals from "./guest/GuestTotals";
import GuestBreakdown from "./guest/GuestBreakdown";
import ChildrenDetails from "./guest/ChildrenDetails";
import BedRequirementsSummary from "./guest/BedRequirementsSummary";
import MobileGuestSummary from "./guest/MobileGuestSummary";

interface GuestSummaryProps {
  formValues: FormValues;
}

const GuestSummary: React.FC<GuestSummaryProps> = ({ formValues }) => {
  const isMobile = useIsMobile();
  
  console.log("🔍 GuestSummary: Form values received", formValues);
  console.log("🔍 GuestSummary: Children details", formValues.childrenDetails);
  console.log("🔍 GuestSummary: Children array", formValues.childrenArray);
  
  // Use mobile version on small screens
  if (isMobile) {
    return <MobileGuestSummary formValues={formValues} />;
  }
  
  const adults = formValues.adults || 0;
  const children = formValues.children || 0;
  const totalGuests = adults + children;
  
  // Check both childrenDetails and childrenArray for children data
  const childrenDetails = formValues.childrenDetails || formValues.childrenArray || [];
  console.log("🔍 GuestSummary: Final children details", childrenDetails);

  // Calculate children statistics
  const childrenUnder12 = childrenDetails.filter(child => child?.isUnder12).length;
  const childrenOver12 = children - childrenUnder12;
  const childrenWithParents = childrenDetails.filter(child => child?.sleepsWithParents).length;
  const childrenInCribs = childrenDetails.filter(child => child?.sleepsInCrib).length;

  // Calculate effective bed requirements
  const childrenNotOccupyingBed = childrenWithParents + childrenInCribs;
  const effectiveGuestsForBeds = totalGuests - childrenNotOccupyingBed;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Informazioni ospiti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <GuestTotals totalGuests={totalGuests} />
        
        <GuestBreakdown adults={adults} children={children} />
        
        <ChildrenDetails
          children={children}
          childrenDetails={childrenDetails}
          childrenUnder12={childrenUnder12}
          childrenOver12={childrenOver12}
          childrenWithParents={childrenWithParents}
          childrenInCribs={childrenInCribs}
        />
        
        <BedRequirementsSummary
          effectiveGuestsForBeds={effectiveGuestsForBeds}
          childrenUnder12={childrenUnder12}
          childrenNotOccupyingBed={childrenNotOccupyingBed}
        />
      </CardContent>
    </Card>
  );
};

export default GuestSummary;
