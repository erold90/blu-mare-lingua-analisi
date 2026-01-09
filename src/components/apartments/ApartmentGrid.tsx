import React, { useState } from "react";
import { motion } from "framer-motion";
import { apartments } from "@/data/apartments";
import ApartmentCard from "./ApartmentCard";
import { ApartmentDetailsModal } from "./ApartmentDetailsModal";

interface ApartmentGridProps {
  apartmentImages: { [key: string]: string[] };
  onApartmentDetailsClick: (apartmentId: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

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
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {apartments.map((apartment) => {
          const images = apartmentImages[apartment.id] || ["/placeholder.svg"];
          const mainImage = images[0] || "/placeholder.svg";

          return (
            <motion.div
              key={apartment.id}
              variants={itemVariants}
            >
              <ApartmentCard
                apartment={apartment}
                mainImage={mainImage}
                onDetailsClick={() => handleApartmentClick(apartment.id)}
              />
            </motion.div>
          );
        })}
      </motion.div>

      <ApartmentDetailsModal
        apartment={selectedApartmentData}
        images={selectedImages}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};
