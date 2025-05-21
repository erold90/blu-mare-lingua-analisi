
import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from "@hello-pangea/dnd";
import { toast } from "sonner";
import { apartments as apartmentsData, Apartment } from "@/data/apartments";
import { Plus, X, Move, CheckCircle, Image as ImageIcon, Edit, Camera, Bed, Home } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { v4 as uuidv4 } from 'uuid';

const AdminApartments = () => {
  const [apartments, setApartments] = useState<Apartment[]>(() => {
    const savedApartments = localStorage.getItem("apartments");
    if (savedApartments) {
      try {
        return JSON.parse(savedApartments);
      } catch (error) {
        console.error("Failed to parse saved apartments:", error);
        return apartmentsData;
      }
    }
    return apartmentsData;
  });
  
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);
  const [editedApartment, setEditedApartment] = useState<Apartment | null>(null);
  const [apartmentImages, setApartmentImages] = useState<{ [key: string]: string[] }>({});
  const [coverImage, setCoverImage] = useState<{ [key: string]: number }>({});
  const [activeSection, setActiveSection] = useState<string>("details");
  const isMobile = useIsMobile();
  
  // Load saved images and cover image indices from localStorage on component mount
  useEffect(() => {
    const loadImagesFromStorage = () => {
      const savedImages = localStorage.getItem("apartmentImages");
      const savedCovers = localStorage.getItem("apartmentCovers");
      
      if (savedImages) {
        try {
          const parsedImages = JSON.parse(savedImages);
          console.log("Loaded images from storage:", parsedImages);
          setApartmentImages(parsedImages);
        } catch (error) {
          console.error("Failed to parse saved apartment images:", error);
        }
      }
      
      if (savedCovers) {
        try {
          const parsedCovers = JSON.parse(savedCovers);
          console.log("Loaded cover indices from storage:", parsedCovers);
          setCoverImage(parsedCovers);
        } catch (error) {
          console.error("Failed to parse saved cover image indices:", error);
        }
      }
    };

    loadImagesFromStorage();
  }, []);
  
  // Save apartments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("apartments", JSON.stringify(apartments));
    
    // Update each apartment's images array with the cover image
    const updatedApartments = apartments.map(apt => {
      const images = apartmentImages[apt.id] || [];
      const coverIdx = coverImage[apt.id] ?? 0;
      
      return {
        ...apt,
        images: images.length > 0 ? [images[coverIdx !== -1 ? coverIdx : 0], ...images] : ["placeholder.svg"]
      };
    });
    
    localStorage.setItem("apartments", JSON.stringify(updatedApartments));
  }, [apartments, apartmentImages, coverImage]);
  
  // Save images and cover image indices to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("apartmentImages", JSON.stringify(apartmentImages));
    localStorage.setItem("apartmentCovers", JSON.stringify(coverImage));
    
    // Also update the gallery images in localStorage for the GalleryPage
    const allImages: string[] = [];
    Object.values(apartmentImages).forEach(images => {
      allImages.push(...images);
    });
    
    localStorage.setItem("galleryImages", JSON.stringify(allImages));
    
    // Dispatch a custom event to notify other components that images have been updated
    const event = new CustomEvent("apartmentImagesUpdated");
    window.dispatchEvent(event);
  }, [apartmentImages, coverImage]);
  
  // Initialize selected apartment
  useEffect(() => {
    if (apartments.length > 0) {
      if (!selectedApartment) {
        setSelectedApartment(apartments[0]);
        setSelectedApartmentId(apartments[0].id);
      }
    }
  }, [apartments, selectedApartment]);
  
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedApartment) return;
    
    const items = Array.from(apartmentImages[selectedApartment.id] || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setApartmentImages({
      ...apartmentImages,
      [selectedApartment.id]: items
    });
    
    // If the cover image was moved, update its index
    if (coverImage[selectedApartment.id] === result.source.index) {
      setCoverImage({
        ...coverImage,
        [selectedApartment.id]: result.destination.index
      });
    }
    
    toast.success("Ordine immagini aggiornato");
  };
  
  const handleImageUpload = (apartmentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // In a real app, you would upload the files to a server and get back URLs
    // For this demo, we'll use local file URLs
    const newImages: string[] = [];
    
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const objectURL = URL.createObjectURL(file);
      
      // Create a unique identifier for this image
      const imageId = `apartment_${apartmentId}_${uuidv4()}`;
      
      // Store the image with its metadata
      const imageWithMetadata = objectURL;
      newImages.push(imageWithMetadata);
    }
    
    setApartmentImages(prev => {
      const updatedImages = [...(prev[apartmentId] || []), ...newImages];
      return { ...prev, [apartmentId]: updatedImages };
    });
    
    // Set the first image as cover if no cover is set
    if (coverImage[apartmentId] === undefined && newImages.length > 0) {
      setCoverImage(prev => ({
        ...prev,
        [apartmentId]: 0
      }));
    }
    
    toast.success(`${newImages.length} immagini caricate`);
  };
  
  const removeImage = (apartmentId: string, index: number) => {
    setApartmentImages(prev => {
      const updatedImages = [...(prev[apartmentId] || [])];
      updatedImages.splice(index, 1);
      
      // Adjust cover image index if needed
      if (coverImage[apartmentId] === index) {
        // If we removed the cover image, set the first image as cover or clear it
        setCoverImage(prevCover => ({
          ...prevCover,
          [apartmentId]: updatedImages.length > 0 ? 0 : -1
        }));
      } else if (coverImage[apartmentId] > index) {
        // If we removed an image before the cover, adjust the index
        setCoverImage(prevCover => ({
          ...prevCover,
          [apartmentId]: prevCover[apartmentId] - 1
        }));
      }
      
      return { ...prev, [apartmentId]: updatedImages };
    });
    
    toast.success("Immagine rimossa");
  };
  
  const setCoverImageIndex = (apartmentId: string, index: number) => {
    setCoverImage(prev => ({
      ...prev,
      [apartmentId]: index
    }));
    
    // Update the apartment's main image in the apartments list
    if (apartmentImages[apartmentId] && apartmentImages[apartmentId][index]) {
      const coverImageUrl = apartmentImages[apartmentId][index];
      
      setApartments(prevApartments => 
        prevApartments.map(apt => 
          apt.id === apartmentId ? { ...apt, images: [coverImageUrl, ...apt.images] } : apt
        )
      );
    }
    
    toast.success("Immagine di copertina impostata");
  };
  
  const handleEditApartment = () => {
    if (!editedApartment) return;
    
    const updatedApartments = apartments.map(apt => 
      apt.id === editedApartment.id ? editedApartment : apt
    );
    
    setApartments(updatedApartments);
    setEditedApartment(null);
    toast.success("Appartamento aggiornato");
  };
  
  const renderApartmentImages = (apartmentId: string) => {
    const images = apartmentImages[apartmentId] || [];
    
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Immagini ({images.length})</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => document.getElementById(`file-upload-${apartmentId}`)?.click()}
              className="flex items-center"
            >
              <Camera className="h-4 w-4 mr-2" /> Aggiungi
            </Button>
            <Input 
              id={`file-upload-${apartmentId}`}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(apartmentId, e)}
            />
          </div>
        </div>
        
        {images.length > 0 ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="apartment-images" direction={isMobile ? "vertical" : "horizontal"}>
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                >
                  {images.map((imageUrl, index) => (
                    <Draggable key={`${apartmentId}-${index}`} draggableId={`${apartmentId}-${index}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`relative rounded-md overflow-hidden border ${
                            coverImage[apartmentId] === index ? 'ring-2 ring-primary' : ''
                          }`}
                        >
                          <div className="aspect-square relative">
                            <img 
                              src={imageUrl} 
                              alt={`Apartment ${index+1}`}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                console.error(`Failed to load image: ${imageUrl}`);
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                          </div>
                          <div className="absolute top-1 right-1 flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 bg-white/80 hover:bg-white"
                              onClick={() => removeImage(apartmentId, index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 bg-white/80 hover:bg-white"
                              onClick={() => setCoverImageIndex(apartmentId, index)}
                            >
                              <CheckCircle className={`h-3 w-3 ${coverImage[apartmentId] === index ? 'text-primary' : ''}`} />
                            </Button>
                            <div
                              {...provided.dragHandleProps}
                              className="h-6 w-6 flex items-center justify-center bg-white/80 hover:bg-white rounded-sm cursor-move"
                            >
                              <Move className="h-3 w-3" />
                            </div>
                          </div>
                          {coverImage[apartmentId] === index && (
                            <Badge className="absolute bottom-1 left-1">Cover</Badge>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="text-center py-6 border border-dashed rounded-lg">
            <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground mt-2">
              Nessuna immagine caricata
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => document.getElementById(`file-upload-${apartmentId}`)?.click()}
            >
              <Camera className="h-4 w-4 mr-2" /> Carica immagini
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  // New function to render apartment details in a more mobile-friendly format
  const renderApartmentDetails = (apartment: Apartment) => {
    return (
      <>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Capacità</span>
            </div>
            <p className="text-lg">{apartment.capacity} persone</p>
          </div>
          
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Piano</span>
            </div>
            <p className="text-lg">{apartment.floor}</p>
          </div>
          
          <div className="col-span-2 sm:col-span-1">
            <span className="text-sm font-medium">Vista</span>
            <p className="text-lg">{apartment.view}</p>
          </div>
          
          <div className="col-span-2 sm:col-span-1">
            <span className="text-sm font-medium">Dimensione</span>
            <p className="text-lg">{apartment.size} m²</p>
          </div>
          
          <div className="col-span-2 sm:col-span-1">
            <span className="text-sm font-medium">Prezzo base</span>
            <p className="text-lg">{apartment.price}€ / notte</p>
          </div>
          
          <div className="col-span-2 sm:col-span-1">
            <span className="text-sm font-medium">Camere</span>
            <p className="text-lg">{apartment.bedrooms || 1}</p>
          </div>
          
          <div className="col-span-2 sm:col-span-1">
            <span className="text-sm font-medium">Posti letto</span>
            <p className="text-lg">{apartment.beds || apartment.capacity}</p>
          </div>
          
          <div className="col-span-2 sm:col-span-1">
            <span className="text-sm font-medium">Servizi</span>
            <p className="text-lg">{apartment.services?.length || 0} servizi</p>
          </div>
          
          {apartment.CIN && (
            <div className="col-span-2">
              <span className="text-sm font-medium">CIN</span>
              <p className="text-lg break-all">{apartment.CIN}</p>
            </div>
          )}
        </div>
      </>
    );
  };
  
  return (
    <div className="space-y-4">
      {isMobile ? (
        <div className="mb-4">
          {/* Fix: Wrap TabsList in Tabs */}
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
            <Card className="mt-4">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">{selectedApartment.name}</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditedApartment(selectedApartment)}
                      className="flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-2" /> Modifica
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modifica {selectedApartment.name}</DialogTitle>
                    </DialogHeader>
                    
                    {editedApartment && (
                      <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Nome</Label>
                          <Input
                            id="name"
                            value={editedApartment.name}
                            onChange={(e) => setEditedApartment({
                              ...editedApartment,
                              name: e.target.value
                            })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Descrizione breve</Label>
                          <Input
                            id="description"
                            value={editedApartment.description}
                            onChange={(e) => setEditedApartment({
                              ...editedApartment,
                              description: e.target.value
                            })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="longDescription">Descrizione completa</Label>
                          <Textarea
                            id="longDescription"
                            rows={5}
                            value={editedApartment.longDescription || ''}
                            onChange={(e) => setEditedApartment({
                              ...editedApartment,
                              longDescription: e.target.value
                            })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="capacity">Capacità</Label>
                            <Input
                              id="capacity"
                              type="number"
                              min="1"
                              value={editedApartment.capacity}
                              onChange={(e) => setEditedApartment({
                                ...editedApartment,
                                capacity: parseInt(e.target.value)
                              })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="floor">Piano</Label>
                            <Input
                              id="floor"
                              value={editedApartment.floor}
                              onChange={(e) => setEditedApartment({
                                ...editedApartment,
                                floor: e.target.value
                              })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="size">Dimensioni (m²)</Label>
                            <Input
                              id="size"
                              type="number"
                              min="1"
                              value={editedApartment.size}
                              onChange={(e) => setEditedApartment({
                                ...editedApartment,
                                size: parseInt(e.target.value)
                              })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="price">Prezzo base</Label>
                            <Input
                              id="price"
                              type="number"
                              min="1"
                              value={editedApartment.price}
                              onChange={(e) => setEditedApartment({
                                ...editedApartment,
                                price: parseInt(e.target.value)
                              })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="bedrooms">Camere da letto</Label>
                            <Input
                              id="bedrooms"
                              type="number"
                              min="1"
                              value={editedApartment.bedrooms || 1}
                              onChange={(e) => setEditedApartment({
                                ...editedApartment,
                                bedrooms: parseInt(e.target.value)
                              })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="beds">Posti letto</Label>
                            <Input
                              id="beds"
                              type="number"
                              min="1"
                              value={editedApartment.beds || editedApartment.capacity}
                              onChange={(e) => setEditedApartment({
                                ...editedApartment,
                                beds: parseInt(e.target.value)
                              })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="cleaningFee">Costo pulizie</Label>
                            <Input
                              id="cleaningFee"
                              type="number"
                              min="0"
                              value={editedApartment.cleaningFee || 50}
                              onChange={(e) => setEditedApartment({
                                ...editedApartment,
                                cleaningFee: parseInt(e.target.value)
                              })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="view">Vista</Label>
                            <Input
                              id="view"
                              value={editedApartment.view}
                              onChange={(e) => setEditedApartment({
                                ...editedApartment,
                                view: e.target.value
                              })}
                            />
                          </div>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label>Servizi e caratteristiche</Label>
                          <div className="flex flex-wrap gap-4 pt-1">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="hasVeranda" 
                                checked={editedApartment.hasVeranda || false}
                                onCheckedChange={(checked) => setEditedApartment({
                                  ...editedApartment,
                                  hasVeranda: !!checked
                                })}
                              />
                              <Label htmlFor="hasVeranda">Veranda</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="hasTerrace" 
                                checked={editedApartment.hasTerrace || false}
                                onCheckedChange={(checked) => setEditedApartment({
                                  ...editedApartment,
                                  hasTerrace: !!checked
                                })}
                              />
                              <Label htmlFor="hasTerrace">Terrazzo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="hasAirConditioning" 
                                checked={editedApartment.hasAirConditioning || false}
                                onCheckedChange={(checked) => setEditedApartment({
                                  ...editedApartment,
                                  hasAirConditioning: !!checked
                                })}
                              />
                              <Label htmlFor="hasAirConditioning">Aria Condizionata</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                      <DialogClose asChild>
                        <Button variant="outline" className="flex-1">Annulla</Button>
                      </DialogClose>
                      <Button onClick={handleEditApartment} className="flex-1">Salva modifiche</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Accordion type="single" collapsible className="w-full" defaultValue="details">
                  <AccordionItem value="details">
                    <AccordionTrigger className="py-2">
                      Dettagli appartamento
                    </AccordionTrigger>
                    <AccordionContent>
                      {renderApartmentDetails(selectedApartment)}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="description">
                    <AccordionTrigger className="py-2">
                      Descrizione
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p>{selectedApartment.description}</p>
                        {selectedApartment.longDescription && (
                          <div>
                            <p className="font-medium mt-2">Descrizione completa</p>
                            <p className="text-muted-foreground">{selectedApartment.longDescription}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="images">
                    <AccordionTrigger className="py-2">
                      Immagini
                    </AccordionTrigger>
                    <AccordionContent>
                      {renderApartmentImages(selectedApartment.id)}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Desktop view - no changes needed here
        <Tabs defaultValue={apartments[0]?.id || "default"}>
          <TabsList className="mb-4">
            {apartments.map(apartment => (
              <TabsTrigger 
                key={apartment.id}
                value={apartment.id}
                onClick={() => setSelectedApartment(apartment)}
              >
                {apartment.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {apartments.map(apartment => (
            <TabsContent key={apartment.id} value={apartment.id} className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{apartment.name}</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setEditedApartment(apartment)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifica dettagli
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modifica {apartment.name}</DialogTitle>
                      </DialogHeader>
                      
                      {editedApartment && (
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                              id="name"
                              value={editedApartment.name}
                              onChange={(e) => setEditedApartment({
                                ...editedApartment,
                                name: e.target.value
                              })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="description">Descrizione breve</Label>
                            <Input
                              id="description"
                              value={editedApartment.description}
                              onChange={(e) => setEditedApartment({
                                ...editedApartment,
                                description: e.target.value
                              })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="longDescription">Descrizione completa</Label>
                            <Textarea
                              id="longDescription"
                              rows={5}
                              value={editedApartment.longDescription || ''}
                              onChange={(e) => setEditedApartment({
                                ...editedApartment,
                                longDescription: e.target.value
                              })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="capacity">Capacità</Label>
                              <Input
                                id="capacity"
                                type="number"
                                min="1"
                                value={editedApartment.capacity}
                                onChange={(e) => setEditedApartment({
                                  ...editedApartment,
                                  capacity: parseInt(e.target.value)
                                })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="floor">Piano</Label>
                              <Input
                                id="floor"
                                value={editedApartment.floor}
                                onChange={(e) => setEditedApartment({
                                  ...editedApartment,
                                  floor: e.target.value
                                })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="size">Dimensioni (m²)</Label>
                              <Input
                                id="size"
                                type="number"
                                min="1"
                                value={editedApartment.size}
                                onChange={(e) => setEditedApartment({
                                  ...editedApartment,
                                  size: parseInt(e.target.value)
                                })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="price">Prezzo base</Label>
                              <Input
                                id="price"
                                type="number"
                                min="1"
                                value={editedApartment.price}
                                onChange={(e) => setEditedApartment({
                                  ...editedApartment,
                                  price: parseInt(e.target.value)
                                })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="bedrooms">Camere da letto</Label>
                              <Input
                                id="bedrooms"
                                type="number"
                                min="1"
                                value={editedApartment.bedrooms || 1}
                                onChange={(e) => setEditedApartment({
                                  ...editedApartment,
                                  bedrooms: parseInt(e.target.value)
                                })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="beds">Posti letto</Label>
                              <Input
                                id="beds"
                                type="number"
                                min="1"
                                value={editedApartment.beds || editedApartment.capacity}
                                onChange={(e) => setEditedApartment({
                                  ...editedApartment,
                                  beds: parseInt(e.target.value)
                                })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="cleaningFee">Costo pulizie</Label>
                              <Input
                                id="cleaningFee"
                                type="number"
                                min="0"
                                value={editedApartment.cleaningFee || 50}
                                onChange={(e) => setEditedApartment({
                                  ...editedApartment,
                                  cleaningFee: parseInt(e.target.value)
                                })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="view">Vista</Label>
                              <Input
                                id="view"
                                value={editedApartment.view}
                                onChange={(e) => setEditedApartment({
                                  ...editedApartment,
                                  view: e.target.value
                                })}
                              />
                            </div>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label>Servizi e caratteristiche</Label>
                            <div className="flex flex-wrap gap-4 pt-1">
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id="hasVeranda" 
                                  checked={editedApartment.hasVeranda || false}
                                  onCheckedChange={(checked) => setEditedApartment({
                                    ...editedApartment,
                                    hasVeranda: !!checked
                                  })}
                                />
                                <Label htmlFor="hasVeranda">Veranda</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id="hasTerrace" 
                                  checked={editedApartment.hasTerrace || false}
                                  onCheckedChange={(checked) => setEditedApartment({
                                    ...editedApartment,
                                    hasTerrace: !!checked
                                  })}
                                />
                                <Label htmlFor="hasTerrace">Terrazzo</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id="hasAirConditioning" 
                                  checked={editedApartment.hasAirConditioning || false}
                                  onCheckedChange={(checked) => setEditedApartment({
                                    ...editedApartment,
                                    hasAirConditioning: !!checked
                                  })}
                                />
                                <Label htmlFor="hasAirConditioning">Aria Condizionata</Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Annulla</Button>
                        </DialogClose>
                        <Button onClick={handleEditApartment}>Salva modifiche</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Dettagli appartamento</h3>
                      <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <dt className="text-sm font-normal text-muted-foreground">Capacità</dt>
                          <dd>{apartment.capacity} persone</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-normal text-muted-foreground">Piano</dt>
                          <dd>{apartment.floor}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-normal text-muted-foreground">Vista</dt>
                          <dd>{apartment.view}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-normal text-muted-foreground">Dimensione</dt>
                          <dd>{apartment.size} m²</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-normal text-muted-foreground">Prezzo base</dt>
                          <dd>{apartment.price}€ / notte</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-normal text-muted-foreground">CIN</dt>
                          <dd>{apartment.CIN || 'Non specificato'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-normal text-muted-foreground">Camere</dt>
                          <dd>{apartment.bedrooms || 1}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-normal text-muted-foreground">Posti letto</dt>
                          <dd>{apartment.beds || apartment.capacity}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-normal text-muted-foreground">Servizi</dt>
                          <dd>{apartment.services?.length || 0} servizi</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Descrizione</h3>
                      <p className="text-sm text-muted-foreground">{apartment.description}</p>
                      {apartment.longDescription && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium">Descrizione completa</h4>
                          <p className="text-sm text-muted-foreground mt-1">{apartment.longDescription}</p>
                        </div>
                      )}
                    </div>
                    
                    {renderApartmentImages(apartment.id)}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default AdminApartments;

