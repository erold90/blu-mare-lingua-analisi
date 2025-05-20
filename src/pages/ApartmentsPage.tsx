
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Bed, Home, ArrowRight, ArrowLeft } from "lucide-react";

type Apartment = {
  id: number;
  name: string;
  image: string;
  bedrooms: number;
  beds: number;
  floor: string;
  description: string;
  features: string[];
  gallery: string[];
};

// Dati degli appartamenti basati su www.villamareblu.it
const apartments: Apartment[] = [
  {
    id: 1,
    name: "Genn'e Mari",
    image: "https://www.villamareblu.it/wp-content/uploads/2024/01/salone-piano-terra-scaled.jpg",
    bedrooms: 2,
    beds: 4,
    floor: "Piano Terra",
    description: "Ampio e luminoso appartamento al piano terra con terrazza vista mare e accesso diretto al giardino. L'appartamento dispone di due camere da letto, un bagno e un soggiorno con angolo cottura.",
    features: [
      "Soggiorno con angolo cottura completamente attrezzato",
      "Camera matrimoniale",
      "Camera con due letti singoli",
      "Bagno con doccia",
      "Aria condizionata",
      "TV a schermo piatto",
      "Terrazza vista mare",
      "Accesso diretto al giardino",
      "Wi-Fi gratuito"
    ],
    gallery: [
      "https://www.villamareblu.it/wp-content/uploads/2024/01/salone-piano-terra-scaled.jpg",
      "https://www.villamareblu.it/wp-content/uploads/2024/01/cucina-piano-terra-scaled.jpg",
      "https://www.villamareblu.it/wp-content/uploads/2024/01/camera-matrimoniale-piano-terra-scaled.jpg",
      "https://www.villamareblu.it/wp-content/uploads/2024/01/bagno-piano-terra-scaled.jpg",
      "https://www.villamareblu.it/wp-content/uploads/2024/01/scale-esterno-scaled.jpg"
    ]
  },
  {
    id: 2,
    name: "Cann'e Sisa",
    image: "https://www.villamareblu.it/wp-content/uploads/2024/01/casa-daniela-soggiorno-1-scaled.jpg",
    bedrooms: 1,
    beds: 3,
    floor: "Piano Terra",
    description: "Confortevole appartamento al piano terra con spazio esterno privato. Ideale per coppie o piccole famiglie, offre una camera da letto, un divano letto nel soggiorno e un bagno.",
    features: [
      "Soggiorno con divano letto e angolo cottura",
      "Camera matrimoniale",
      "Bagno con doccia",
      "Aria condizionata",
      "TV a schermo piatto",
      "Spazio esterno privato",
      "Wi-Fi gratuito"
    ],
    gallery: [
      "https://www.villamareblu.it/wp-content/uploads/2024/01/casa-daniela-soggiorno-1-scaled.jpg",
      "https://www.villamareblu.it/wp-content/uploads/2024/01/camera-daniela-scaled.jpg",
      "https://www.villamareblu.it/wp-content/uploads/2024/01/casa-daniela-soggiorno-2-scaled.jpg",
      "https://www.villamareblu.it/wp-content/uploads/2024/01/bagno-daniela-scaled.jpg"
    ]
  },
  {
    id: 3,
    name: "Simius",
    image: "https://www.villamareblu.it/wp-content/uploads/2024/01/salone-primo-piano-scaled.jpg",
    bedrooms: 2,
    beds: 5,
    floor: "Primo Piano",
    description: "Spazioso appartamento al primo piano con terrazza panoramica vista mare. Dispone di due camere da letto, un ampio soggiorno con divano letto e un bagno.",
    features: [
      "Ampio soggiorno con divano letto",
      "Cucina completamente attrezzata",
      "Camera matrimoniale",
      "Camera con due letti singoli",
      "Bagno con doccia",
      "Aria condizionata",
      "TV a schermo piatto",
      "Terrazza panoramica vista mare",
      "Wi-Fi gratuito"
    ],
    gallery: [
      "https://www.villamareblu.it/wp-content/uploads/2024/01/salone-primo-piano-scaled.jpg",
      "https://www.villamareblu.it/wp-content/uploads/2024/01/cucina-primo-piano-scaled.jpg",
      "https://www.villamareblu.it/wp-content/uploads/2024/01/camera-matrimoniale-primo-piano-scaled.jpg",
      "https://www.villamareblu.it/wp-content/uploads/2024/01/terrazzo-primo-piano-scaled.jpg",
      "https://www.villamareblu.it/wp-content/uploads/2024/01/bagno-primo-piano-scaled.jpg"
    ]
  },
  {
    id: 4,
    name: "Solanas",
    image: "https://www.villamareblu.it/wp-content/uploads/2024/01/esterno5-scaled.jpg",
    bedrooms: 3,
    beds: 6,
    floor: "Primo Piano",
    description: "Lussuoso appartamento al primo piano con ampia terrazza e vista panoramica sul mare. Ideale per gruppi o famiglie numerose, dispone di tre camere da letto e due bagni.",
    features: [
      "Soggiorno spazioso con area pranzo",
      "Cucina completamente attrezzata",
      "Camera matrimoniale principale",
      "Due camere con letti singoli",
      "Due bagni con doccia",
      "Aria condizionata",
      "TV a schermo piatto",
      "Ampia terrazza panoramica",
      "Wi-Fi gratuito"
    ],
    gallery: [
      "https://www.villamareblu.it/wp-content/uploads/2024/01/esterno5-scaled.jpg",
      "https://www.villamareblu.it/wp-content/uploads/2024/01/vista-mare-scaled.jpg",
      "https://www.villamareblu.it/wp-content/uploads/2024/01/esterno2-scaled.jpg",
      "https://www.villamareblu.it/wp-content/uploads/2024/01/esterno3-scaled.jpg",
      "https://www.villamareblu.it/wp-content/uploads/2024/01/esterno4-scaled.jpg"
    ]
  }
];

const ApartmentGallery = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-md mt-4">
      <div className="absolute inset-0">
        <img 
          src={images[currentIndex]} 
          alt={`Immagine ${currentIndex + 1}`} 
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
        {images.map((_, idx) => (
          <button 
            key={idx}
            className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Vai all'immagine ${idx + 1}`}
          />
        ))}
      </div>
      <button
        onClick={prevImage}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full"
        aria-label="Immagine precedente"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <button
        onClick={nextImage}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full"
        aria-label="Immagine successiva"
      >
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
};

const ApartmentModal = ({ apartment }: { apartment: Apartment }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          Dettagli
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">{apartment.name}</DialogTitle>
          <DialogDescription>{apartment.description}</DialogDescription>
        </DialogHeader>
        
        <ApartmentGallery images={apartment.gallery} />
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Caratteristiche</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            {apartment.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex justify-center mt-6">
          <Button asChild>
            <Link to="/preventivo">Richiedi Disponibilità</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ApartmentsPage = () => {
  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">I Nostri Appartamenti</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Scopri i nostri confortevoli appartamenti, tutti con vista sul mare e accesso privato. 
          Ogni appartamento è completamente attrezzato per garantirti un soggiorno perfetto.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {apartments.map((apartment) => (
          <Card key={apartment.id} className="overflow-hidden h-full flex flex-col">
            <div className="aspect-[4/3] relative">
              <img 
                src={apartment.image} 
                alt={apartment.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{apartment.name}</CardTitle>
              <CardDescription>{apartment.floor}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  <span>{apartment.bedrooms} {apartment.bedrooms === 1 ? 'camera' : 'camere'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-primary" />
                  <span>{apartment.beds} {apartment.beds === 1 ? 'posto letto' : 'posti letto'}</span>
                </div>
              </div>
              <p className="text-muted-foreground line-clamp-3">
                {apartment.description}
              </p>
            </CardContent>
            <CardFooter>
              <ApartmentModal apartment={apartment} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ApartmentsPage;
