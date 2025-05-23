
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useApartmentManagement } from "@/hooks/apartments/useApartmentManagement";
import { ApartmentImageManager } from "./images/ApartmentImageManager";
import { SiteImageManager } from "./images/SiteImageManager";

const AdminApartments = () => {
  const { apartments } = useApartmentManagement();
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="site-images">
        <TabsList className={`mb-4 ${isMobile ? 'flex w-full overflow-x-auto pb-1 no-scrollbar' : ''}`}>
          <TabsTrigger value="site-images">Immagini Sito</TabsTrigger>
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
        
        <TabsContent value="site-images" className="space-y-6">
          <SiteImageManager />
        </TabsContent>
        
        {apartments.map(apartment => (
          <TabsContent key={apartment.id} value={apartment.id} className="space-y-6">
            <ApartmentImageManager
              apartmentId={apartment.id}
              apartmentName={apartment.name}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminApartments;
