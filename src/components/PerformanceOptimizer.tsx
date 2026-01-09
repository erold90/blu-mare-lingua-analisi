import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { initPerformanceOptimizations } from '@/utils/performanceOptimizer';

const PerformanceOptimizer = () => {
  useEffect(() => {
    // Initialize all performance optimizations
    initPerformanceOptimizations();
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = '/fonts/inter.woff2'; // Adjust based on your font files
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);

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
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, []);

  return (
    <Helmet>
      {/* DNS prefetch for external domains */}
      <link rel="dns-prefetch" href="//fgeeeivbmfrwrieyzhel.supabase.co" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      
      {/* Preconnect to critical origins */}
      <link rel="preconnect" href="https://fgeeeivbmfrwrieyzhel.supabase.co" />
      
      {/* Resource hints for better performance */}
      <meta httpEquiv="x-dns-prefetch-control" content="on" />
      
      {/* Optimize viewport for mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      
      {/* Critical CSS inlining hint */}
      <meta name="critical-css" content="true" />
      
      {/* Browser hints */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="msapplication-tap-highlight" content="no" />
    </Helmet>
  );
};

export default PerformanceOptimizer;