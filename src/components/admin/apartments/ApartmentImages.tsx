
import * as React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ImageIcon } from "lucide-react";

interface ApartmentImagesProps {
  apartmentId: string;
  images: string[];
  coverImageIndex: number | undefined;
  onImagesChange: (apartmentId: string, images: string[]) => void;
  onCoverImageChange: (apartmentId: string, index: number) => void;
}

export const ApartmentImages: React.FC<ApartmentImagesProps> = ({
  apartmentId,
  images,
  coverImageIndex,
}) => {
  // Fixed directory path for apartment images
  const imagePaths = Array.from({ length: 5 }, (_, i) => 
    `/images/apartments/${apartmentId}/image${i+1}.jpg`
  );
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Immagini</h3>
      </div>
      
      {imagePaths.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {imagePaths.map((path, index) => (
            <div
              key={index}
              className={`relative rounded-md overflow-hidden border ${
                coverImageIndex === index ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="aspect-square relative">
                <img 
                  src={path} 
                  alt={`Appartamento ${index+1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    console.error(`Failed to load image: ${path}`);
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
              {coverImageIndex === index && (
                <Badge className="absolute bottom-1 left-1">Cover</Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 border border-dashed rounded-lg">
          <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground mt-2">
            Carica manualmente le immagini nella cartella /public/images/apartments/{apartmentId}/
          </p>
        </div>
      )}
      <p className="text-sm text-muted-foreground mt-4">
        Per gestire le immagini dell'appartamento, caricare manualmente i file nella cartella /public/images/apartments/{apartmentId}/
      </p>
    </div>
  );
};
