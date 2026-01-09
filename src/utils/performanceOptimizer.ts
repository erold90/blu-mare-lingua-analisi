// Performance optimization utilities

// Debounce function for scroll events
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for high-frequency events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Preload critical images
export const preloadCriticalImages = (imageUrls: string[]) => {
  imageUrls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.fetchPriority = 'high';
    document.head.appendChild(link);
  });
};

// Optimize images with intersection observer
export const createImageObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  return new IntersectionObserver(callback, {
    rootMargin: '50px 0px',
    threshold: 0.1,
  });
};

// Reduce paint and layout thrashing
export const optimizeAnimations = () => {
  // Force hardware acceleration for smooth transitions
  const style = document.createElement('style');
  style.textContent = `
    .gpu-layer {
      will-change: transform;
      transform: translateZ(0);
      backface-visibility: hidden;
      perspective: 1000px;
    }
    
    .optimize-paint {
      contain: layout style paint;
    }
    
    .reduce-layout-shift {
      content-visibility: auto;
      contain-intrinsic-size: 300px 200px;
    }
  `;
  document.head.appendChild(style);
};

// Critical resource loading strategy
export const loadCriticalResources = () => {
  // Preload fonts
  const fontPreload = document.createElement('link');
  fontPreload.rel = 'preload';
  fontPreload.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap';
  fontPreload.as = 'style';
  fontPreload.onload = () => {
    fontPreload.rel = 'stylesheet';
  };
  document.head.appendChild(fontPreload);
};

// Memory optimization
export const cleanupResources = () => {
  // Remove unused images from DOM
  const images = document.querySelectorAll('img[data-cleanup="true"]');
  images.forEach((img) => {
    if (img instanceof HTMLImageElement) {
      img.src = '';
      img.srcset = '';
    }
  });
};

// Service worker registration for caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
    } catch (error) {
    }
  }
};

// Optimize bundle loading - disabled in production as paths are different
export const optimizeBundleLoading = () => {
  // In production, Vite handles chunk preloading automatically
  // No manual preloading needed
};

// Initialize all optimizations
export const initPerformanceOptimizations = () => {
  // Register Service Worker immediately for caching
  registerServiceWorker();

  // Run optimizations after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeAnimations();
      loadCriticalResources();
      optimizeBundleLoading();
    });
  } else {
    optimizeAnimations();
    loadCriticalResources();
    optimizeBundleLoading();
  }
};