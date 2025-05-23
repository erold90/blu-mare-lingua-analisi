
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useApartmentManagement } from "@/hooks/apartments/useApartmentManagement";
import { ApartmentImageManager } from "./images/ApartmentImageManager";

const AdminApartments = () => {
  const { apartments } = useApartmentManagement();
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue={apartments[0]?.id || "no-apartments"}>
        <TabsList className={`mb-4 ${isMobile ? 'flex w-full overflow-x-auto pb-1 no-scrollbar' : ''}`}>
          {apartments.map(apartment => (
            <TabsTrigger 
              key={apartment.id}
              value={apartment.id}
              className={isMobile ? "flex-shrink-0 whitespace-nowrap px-3" : ""}
            >
              {apartment.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {apartments.map(apartment => (
          <TabsContent key={apartment.id} value={apartment.id} className="space-y-6">
            <ApartmentImageManager
              apartmentId={apartment.id}
              apartmentName={apartment.name}
            />
          </TabsContent>
        ))}
        
        {apartments.length === 0 && (
          <TabsContent value="no-apartments" className="space-y-6">
            <div className="text-center py-8 text-muted-foreground">
              Nessun appartamento configurato
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AdminApartments;
