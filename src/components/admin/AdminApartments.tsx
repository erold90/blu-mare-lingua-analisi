
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useApartmentManagement } from "@/hooks/apartments/useApartmentManagement";
import { MobileApartmentView } from "./apartments/MobileApartmentView";
import { DesktopApartmentView } from "./apartments/DesktopApartmentView";

const AdminApartments = () => {
  const {
    apartments,
    selectedApartment,
    selectedApartmentId,
    setSelectedApartment,
    setSelectedApartmentId,
    apartmentImages,
    coverImage,
    updateApartmentImages,
    updateCoverImage,
    updateApartment
  } = useApartmentManagement();
  
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
      {isMobile ? (
        <div className="mb-4">
          <Tabs 
            value={selectedApartmentId || (apartments.length > 0 ? apartments[0].id : "")} 
            onValueChange={(value) => {
              setSelectedApartmentId(value);
              const apt = apartments.find(a => a.id === value);
              if (apt) setSelectedApartment(apt);
            }}
          >
            <TabsList className="flex w-full overflow-x-auto pb-1 no-scrollbar">
              {apartments.map(apartment => (
                <TabsTrigger 
                  key={apartment.id}
                  value={apartment.id}
                  className="flex-shrink-0 whitespace-nowrap px-3"
                >
                  {apartment.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          {selectedApartment && (
            <MobileApartmentView 
              apartment={selectedApartment}
              onApartmentUpdate={updateApartment}
              apartmentImages={apartmentImages[selectedApartment.id] || []}
              coverImageIndex={coverImage[selectedApartment.id]}
              onImagesChange={updateApartmentImages}
              onCoverImageChange={updateCoverImage}
            />
          )}
        </div>
      ) : (
        <DesktopApartmentView 
          apartments={apartments}
          selectedApartment={selectedApartment}
          onApartmentSelect={setSelectedApartment}
          onApartmentUpdate={updateApartment}
          apartmentImages={apartmentImages}
          coverImage={coverImage}
          onImagesChange={updateApartmentImages}
          onCoverImageChange={updateCoverImage}
        />
      )}
    </div>
  );
};

export default AdminApartments;
