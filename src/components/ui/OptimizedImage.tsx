import React, { useState, useRef, useEffect } from 'react';
import { imageService } from '@/services/image';

interface OptimizedImageProps {
  filePath: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized image component with:
 * - Responsive srcSet for different screen sizes
 * - WebP format conversion via Supabase
 * - Lazy loading for non-priority images
 * - Fade-in animation on load
 * - Fallback placeholder
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  filePath,
  alt,
  className = '',
  sizes = '(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px',
  priority = false,
  width,
  height,
  objectFit = 'cover',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate optimized URLs for different sizes
  const srcSets = [400, 800, 1200];
  const srcSet = srcSets
    .map(w => `${imageService.getOptimizedImageUrl(filePath, { width: w })} ${w}w`)
    .join(', ');

  // Default src (medium size with WebP)
  const src = imageService.getOptimizedImageUrl(filePath, {
    width: width || 800,
    quality: 80
  });

  // Fallback to original if transformations fail
  const fallbackSrc = imageService.getImageUrl(filePath);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
    // Try fallback
    if (imgRef.current && imgRef.current.src !== fallbackSrc) {
      imgRef.current.src = fallbackSrc;
    }
  };

  return (
    <img
      ref={imgRef}
      src={src}
      srcSet={hasError ? undefined : srcSet}
      sizes={sizes}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{
        objectFit,
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined
      }}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

/**
 * Background image style generator with optimized URL
 */
export const getOptimizedBackgroundStyle = (
  filePath: string,
  options?: { width?: number; quality?: number }
): React.CSSProperties => {
  const { width = 1920, quality = 85 } = options || {};
  const url = imageService.getOptimizedImageUrl(filePath, { width, quality });

  return {
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };
};

export default OptimizedImage;
