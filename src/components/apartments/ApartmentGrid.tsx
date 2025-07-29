
import React, { useState } from "react";
import { apartments } from "@/data/apartments";
import ApartmentCard from "./ApartmentCard";
import { ApartmentDetailsModal } from "./ApartmentDetailsModal";

interface ApartmentGridProps {
  apartmentImages: { [key: string]: string[] };
  onApartmentDetailsClick: (apartmentId: string) => void;
}

export const ApartmentGrid: React.FC<ApartmentGridProps> = ({
  apartmentImages,
  onApartmentDetailsClick
}) => {
  const [selectedApartment, setSelectedApartment] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApartmentClick = (apartmentId: string) => {
    setSelectedApartment(apartmentId);
    setIsModalOpen(true);
    onApartmentDetailsClick(apartmentId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApartment(null);
  };

  const selectedApartmentData = selectedApartment 
    ? apartments.find(apt => apt.id === selectedApartment) 
    : null;

  const selectedImages = selectedApartment 
    ? apartmentImages[selectedApartment] || ["/placeholder.svg"]
    : [];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
        {apartments.map((apartment, index) => {
          const images = apartmentImages[apartment.id] || ["/placeholder.svg"];
          const mainImage = images[0] || "/placeholder.svg";
          
          return (
            <div 
              key={apartment.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <ApartmentCard
                apartment={apartment}
                mainImage={mainImage}
                onDetailsClick={() => handleApartmentClick(apartment.id)}
              />
            </div>
          );
        })}
      </div>

      <ApartmentDetailsModal
        apartment={selectedApartmentData}
        images={selectedImages}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};
