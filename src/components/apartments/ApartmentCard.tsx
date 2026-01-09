import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Home, Eye } from 'lucide-react';

interface ApartmentCardProps {
  apartment: {
    id: string;
    name: string;
    description?: string;
    capacity: number;
    bedrooms?: number;
    view?: string;
  };
  mainImage?: string;
  onDetailsClick?: () => void;
}

const ApartmentCard = memo(function ApartmentCard({ apartment, mainImage, onDetailsClick }: ApartmentCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card
        className="group h-full cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-2xl bg-card transition-shadow duration-300"
        onClick={onDetailsClick}
      >
        {mainImage && (
          <div className="relative h-64 overflow-hidden">
            <motion.img
              src={mainImage}
              alt={apartment.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                contentVisibility: 'auto',
                containIntrinsicSize: '300px 256px'
              }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />

            {/* Elegant overlay badge */}
            <motion.div
              className="absolute top-4 left-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20">
                <Users className="w-3 h-3 mr-1" />
                {apartment.capacity} ospiti
              </Badge>
            </motion.div>

            {/* View details indicator */}
            <motion.div
              className="absolute bottom-4 right-4"
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-white text-sm font-medium bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                Scopri
              </span>
            </motion.div>
          </div>
        )}

        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-serif font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
              {apartment.name}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {apartment.description || 'Descrizione non disponibile'}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {apartment.bedrooms && (
                <div className="flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  <span>{apartment.bedrooms} camere</span>
                </div>
              )}
              {apartment.view && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span className="capitalize">{apartment.view}</span>
                </div>
              )}
            </div>
          </div>

          <motion.div
            className="pt-2 border-t border-border"
            initial={{ opacity: 0.6 }}
            whileHover={{ opacity: 1 }}
          >
            <p className="text-xs text-center text-muted-foreground uppercase tracking-wide font-medium group-hover:text-primary transition-colors duration-300">
              Clicca per dettagli
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default ApartmentCard;
