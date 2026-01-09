import { useEffect, useRef, useState } from 'react';

interface UseImageOptimizationOptions {
  rootMargin?: string;
  threshold?: number;
  priority?: 'high' | 'low';
}

export const useImageOptimization = (
  src: string,
  options: UseImageOptimizationOptions = {}
) => {
  const { rootMargin = '50px', threshold = 0.1, priority = 'low' } = options;
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority === 'high');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority === 'high') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  return {
    imgRef,
    isLoaded,
    isInView,
    shouldLoad,
    imgProps: {
      ref: imgRef,
      src: shouldLoad ? src : undefined,
      loading: (priority === 'high' ? 'eager' : 'lazy') as 'eager' | 'lazy',
      decoding: (priority === 'high' ? 'sync' : 'async') as 'sync' | 'async',
      fetchPriority: priority,
      onLoad: handleLoad,
      onError: handleError,
      style: {
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        willChange: priority === 'high' ? 'transform' : 'auto',
        contentVisibility: priority === 'low' ? 'auto' : 'visible',
      },
    },
  };
};