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
  };

  const handleTouchMove = (e: React.TouchEvent) => {
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
  };

  return (
    <div className="w-full">
      {/* Image container */}
      <div
        className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentIndex]}
          alt={`${apartmentName} - Foto ${currentIndex + 1}`}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => onImageClick(currentIndex)}
          draggable={false}
        />

        {/* Navigation arrows - desktop only */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white"
              aria-label="Foto precedente"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white"
              aria-label="Foto successiva"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Expand hint */}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/50 backdrop-blur-sm pointer-events-none">
          <Eye className="w-3 h-3 text-white inline mr-1" />
          <span className="text-white text-[10px]">Tocca per ingrandire</span>
        </div>
      </div>

      {/* Dots + Counter */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-1 mt-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`rounded-full transition-all ${
                index === currentIndex
                  ? 'w-4 h-1.5 bg-primary'
                  : 'w-1.5 h-1.5 bg-gray-300'
              }`}
              aria-label={`Foto ${index + 1}`}
            />
          ))}
          <span className="text-[10px] text-gray-400 ml-2">
            {currentIndex + 1}/{images.length}
          </span>
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
  onClose
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
    if (s.includes('wifi')) return <Wifi className="w-3 h-3" />;
    if (s.includes('parcheggio')) return <Car className="w-3 h-3" />;
    if (s.includes('tv')) return <Tv className="w-3 h-3" />;
    if (s.includes('aria') || s.includes('condizionata')) return <Wind className="w-3 h-3" />;
    if (s.includes('veranda') || s.includes('terrazzo')) return <Home className="w-3 h-3" />;
    return <Building className="w-3 h-3" />;
  };

  const handleBookNow = () => {
    onClose();
    navigate('/richiedi-preventivo');
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
        className="relative w-full sm:w-auto sm:max-w-xl sm:mx-4 bg-white rounded-t-xl sm:rounded-xl max-h-[85vh] flex flex-col shadow-2xl"
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
          <div className="p-4 space-y-4">
            {/* Gallery */}
            <ImageGallery
              images={images}
              apartmentName={apartment.name}
              onImageClick={openFullscreen}
            />

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-1 py-2 border-y border-gray-100">
              <div className="text-center py-1">
                <Users className="w-4 h-4 mx-auto text-primary mb-0.5" />
                <p className="text-[10px] sm:text-xs text-gray-600">{apartment.capacity} ospiti</p>
              </div>
              <div className="text-center py-1">
                <Home className="w-4 h-4 mx-auto text-primary mb-0.5" />
                <p className="text-[10px] sm:text-xs text-gray-600">{apartment.bedrooms} camere</p>
              </div>
              <div className="text-center py-1">
                <Building className="w-4 h-4 mx-auto text-primary mb-0.5" />
                <p className="text-[10px] sm:text-xs text-gray-600">{apartment.size}m²</p>
              </div>
              <div className="text-center py-1">
                <Eye className="w-4 h-4 mx-auto text-primary mb-0.5" />
                <p className="text-[10px] sm:text-xs text-gray-600 capitalize truncate">{apartment.view}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-sm mb-1.5">Descrizione</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {apartment.longDescription || apartment.description}
              </p>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold text-sm mb-1.5">Servizi</h3>
              <div className="flex flex-wrap gap-1">
                {apartment.services.map((service, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] sm:text-xs"
                  >
                    {getServiceIcon(service)}
                    <span>{service}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* CIN */}
            {apartment.CIN && (
              <p className="text-[10px] sm:text-xs text-gray-400">
                CIN: {apartment.CIN}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-3 border-t bg-gray-50 sm:bg-white rounded-b-none sm:rounded-b-xl">
          <div className="flex items-center gap-3">
            <span className="text-[10px] sm:text-xs text-gray-500 flex items-center">
              <MapPin className="w-3 h-3 mr-0.5" />
              Piano {apartment.floor}
            </span>
            <Button onClick={handleBookNow} className="flex-1 h-9 sm:h-10 text-sm">
              Richiedi Preventivo
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
