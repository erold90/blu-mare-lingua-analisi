import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { initPerformanceOptimizations } from '@/utils/performanceOptimizer';

const PerformanceOptimizer = () => {
  useEffect(() => {
    // Initialize all performance optimizations
    initPerformanceOptimizations();

    // Enable passive listeners for better scroll performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Helmet>
      {/* Preconnect to critical origins - fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Preconnect to Supabase */}
      <link rel="preconnect" href="https://fgeeeivbmfrwrieyzhel.supabase.co" />

      {/* Preconnect to ImageKit CDN */}
      <link rel="preconnect" href="https://ik.imagekit.io" />

      {/* Resource hints for better performance */}
      <meta httpEquiv="x-dns-prefetch-control" content="on" />

      {/* Optimize viewport for mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

      {/* Browser hints */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="msapplication-tap-highlight" content="no" />
    </Helmet>
  );
};

export default PerformanceOptimizer;