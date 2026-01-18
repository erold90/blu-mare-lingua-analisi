import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Wifi, Car, Tv, Wind, Building, Home, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Apartment } from '@/data/apartments';
import { useNavigate } from 'react-router-dom';

interface ApartmentDetailsModalProps {
  apartment: Apartment | null;
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (apartmentId: string) => void; // Optional: quando presente, mostra "Seleziona" invece di "Richiedi Preventivo"
}

// Simple swipeable image gallery - no complex carousel
const ImageGallery: React.FC<{
  images: string[];
  apartmentName: string;
  onImageClick: (index: number) => void;
}> = ({ images, apartmentName, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const minSwipeDistance = 50;

  const goTo = (index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  };

  const goNext = () => goTo((currentIndex + 1) % images.length);
  const goPrev = () => goTo((currentIndex - 1 + images.length) % images.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart !== null) {
      const currentX = e.targetTouches[0].clientX;
      const diff = Math.abs(touchStart - currentX);
      if (diff > 10) {
        setIsSwiping(true);
        e.preventDefault(); // Prevent scroll while swiping images
      }
    }
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
  };

  const handleClick = () => {
    if (!isSwiping) {
      onImageClick(currentIndex);
    }
  };

  return (
    <div className="w-full">
      {/* Image container */}
      <div
        className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentIndex]}
          alt={`${apartmentName} - Foto ${currentIndex + 1}`}
          className="w-full h-full object-cover cursor-pointer select-none"
          onClick={handleClick}
          draggable={false}
        />

        {/* Navigation arrows - visible on all devices */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 active:bg-black/50 sm:bg-white/90 sm:shadow-md sm:hover:bg-white"
              aria-label="Foto precedente"
            >
              <ChevronLeft className="w-5 h-5 text-white sm:text-gray-700" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 active:bg-black/50 sm:bg-white/90 sm:shadow-md sm:hover:bg-white"
              aria-label="Foto successiva"
            >
              <ChevronRight className="w-5 h-5 text-white sm:text-gray-700" />
            </button>
          </>
        )}

        {/* Photo counter badge */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
            <span className="text-white text-xs font-medium">{currentIndex + 1}/{images.length}</span>
          </div>
        )}

      </div>

      {/* Simple dot indicators */}
      {images.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
          {images.map((_, index) => (
            <div
              key={index}
              onClick={() => goTo(index)}
              style={{
                width: index === currentIndex ? '12px' : '5px',
                height: '5px',
                borderRadius: '999px',
                backgroundColor: index === currentIndex ? '#1e3a5f' : '#ccc',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Fullscreen Gallery
const FullscreenGallery: React.FC<{
  images: string[];
  initialIndex: number;
  apartmentName: string;
  onClose: () => void;
}> = ({ images, initialIndex, apartmentName, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) goNext();
    else if (distance < -minSwipeDistance) goPrev();
    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, goNext, goPrev]);

  return createPortal(
    <div
      className="fixed inset-0 bg-black z-[9999] flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex-shrink-0 flex justify-between items-center p-3 sm:p-4">
        <span className="text-white text-sm px-3 py-1 bg-white/10 rounded-full">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 active:bg-white/20"
          aria-label="Chiudi"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 min-h-0">
        <img
          src={images[currentIndex]}
          alt={`${apartmentName} - Foto ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
          draggable={false}
        />
      </div>

      {/* Desktop arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
          <button
            onClick={goNext}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        </>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex-shrink-0 p-3 sm:p-4">
          <div className="flex justify-center gap-1.5 sm:gap-2 overflow-x-auto">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-10 h-8 sm:w-14 sm:h-10 rounded overflow-hidden transition-all ${
                  index === currentIndex ? 'ring-2 ring-white' : 'opacity-50'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export const ApartmentDetailsModal: React.FC<ApartmentDetailsModalProps> = ({
  apartment,
  images,
  isOpen,
  onClose,
  onSelect
}) => {
  const navigate = useNavigate();
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !fullscreenOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, fullscreenOpen, onClose]);

  const getServiceIcon = (service: string) => {
    const s = service.toLowerCase();
    if (s.includes('wifi')) return <Wifi className="w-4 h-4" />;
    if (s.includes('parcheggio')) return <Car className="w-4 h-4" />;
    if (s.includes('tv')) return <Tv className="w-4 h-4" />;
    if (s.includes('aria') || s.includes('condizionata')) return <Wind className="w-4 h-4" />;
    if (s.includes('veranda') || s.includes('terrazzo')) return <Home className="w-4 h-4" />;
    return <Building className="w-4 h-4" />;
  };

  const handleBookNow = () => {
    if (onSelect && apartment) {
      // Modalità wizard: seleziona l'appartamento e chiudi
      onSelect(apartment.id);
      onClose();
    } else {
      // Modalità pagina appartamenti: naviga al preventivo
      onClose();
      navigate('/preventivo');
    }
  };

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setFullscreenOpen(true);
  };

  if (!apartment || !isOpen) return null;

  if (fullscreenOpen) {
    return (
      <FullscreenGallery
        images={images}
        initialIndex={fullscreenIndex}
        apartmentName={apartment.name}
        onClose={() => setFullscreenOpen(false)}
      />
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal - Bottom sheet on mobile, centered on desktop */}
      <div
        className="relative w-full sm:w-auto sm:max-w-xl sm:mx-4 bg-white rounded-t-xl sm:rounded-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag indicator - mobile only */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 sm:py-3 border-b">
          <h2 className="text-base sm:text-lg font-serif font-semibold text-primary pr-4 truncate">
            {apartment.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable - only vertical */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain min-h-0">
          <div className="p-4 space-y-4">
            {/* Gallery */}
            <ImageGallery
              images={images}
              apartmentName={apartment.name}
              onImageClick={openFullscreen}
            />

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-1 py-3 border-y border-gray-100">
              <div className="text-center py-1">
                <Users className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-xs sm:text-sm text-gray-600">{apartment.capacity} ospiti</p>
              </div>
              <div className="text-center py-1">
                <Home className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-xs sm:text-sm text-gray-600">{apartment.bedrooms} camere</p>
              </div>
              <div className="text-center py-1">
                <Building className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-xs sm:text-sm text-gray-600">{apartment.size}m²</p>
              </div>
              <div className="text-center py-1">
                <Eye className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-xs sm:text-sm text-gray-600 capitalize truncate">{apartment.view}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-base mb-2">Descrizione</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {apartment.longDescription || apartment.description}
              </p>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold text-base mb-2">Servizi</h3>
              <div className="flex flex-wrap gap-1.5">
                {apartment.services.map((service, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1.5 px-2 py-1 text-xs sm:text-sm"
                  >
                    {getServiceIcon(service)}
                    <span>{service}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* CIN */}
            {apartment.CIN && (
              <p className="text-xs text-gray-400">
                CIN: {apartment.CIN}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-3 border-t bg-gray-50 sm:bg-white rounded-b-none sm:rounded-b-xl">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm text-gray-500 flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              Piano {apartment.floor}
            </span>
            <Button onClick={handleBookNow} className="flex-1 h-10 sm:h-11 text-sm sm:text-base">
              {onSelect ? 'Seleziona Appartamento' : 'Richiedi Preventivo'}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
