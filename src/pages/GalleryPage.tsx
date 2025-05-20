
import * as React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const GalleryPage = () => {
  // Array di URL di immagini di esempio
  const images = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1574643156929-51fa098b0394?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1564013434775-f71db0030976?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ];

  const categories = [
    "Tutte", "Interni", "Esterni", "Vista Mare", "Piscina"
  ];

  const [selectedCategory, setSelectedCategory] = React.useState("Tutte");
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  return (
    <div className="container px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Galleria</h1>
      
      {/* Categorie filtro */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-2 rounded-full text-sm ${
              selectedCategory === category 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary hover:bg-secondary/80"
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Griglia immagini */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-[1.02]"
            onClick={() => setSelectedImage(image)}
          >
            <AspectRatio ratio={4/3}>
              <img 
                src={image} 
                alt={`Villa Mare Blu - Immagine ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          </div>
        ))}
      </div>
      
      {/* Modal visualizzazione immagine */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <button 
              className="absolute top-4 right-4 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              ✕
            </button>
            <img 
              src={selectedImage} 
              alt="Immagine ingrandita" 
              className="max-h-[90vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
