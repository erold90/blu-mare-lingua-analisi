import React from 'react';
import { useReviews, useAggregateRating } from '@/hooks/useReviews';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

// Calcola tempo relativo dinamico dalla data
const getRelativeTime = (reviewDate: string | null, fallbackText: string | null): string => {
  if (reviewDate) {
    try {
      const date = new Date(reviewDate);
      if (!isNaN(date.getTime())) {
        return formatDistanceToNow(date, { addSuffix: true, locale: it });
      }
    } catch {
      // Se la data non è valida, usa il fallback
    }
  }
  return fallbackText || '';
};

// Limite recensioni da mostrare in homepage (per performance)
const MAX_HOMEPAGE_REVIEWS = 15;

const ReviewsSection: React.FC = () => {
  // Carica solo le recensioni necessarie per la homepage + il rating aggregato
  const { data: reviews, isLoading } = useReviews(MAX_HOMEPAGE_REVIEWS);
  const { data: aggregateRating } = useAggregateRating();

  // Recensioni da mostrare (già limitate dalla query)
  const allReviews = reviews || [];
  // Conteggio totale dal rating aggregato (include TUTTE le recensioni nel DB)
  const totalReviews = aggregateRating?.total || allReviews.length;

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 bg-muted rounded w-64 mb-4"></div>
            <div className="h-4 bg-muted rounded w-48"></div>
          </div>
        </div>
      </section>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30 overflow-hidden max-w-full">
      <div className="container mx-auto px-4 overflow-hidden max-w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Cosa Dicono i Nostri Ospiti
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Leggi le recensioni verificate di chi ha soggiornato a Villa MareBlu
          </p>

          {/* Aggregate Rating */}
          {aggregateRating && (
            <div className="flex items-center justify-center gap-3 bg-white rounded-full px-6 py-3 shadow-sm w-fit mx-auto">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(aggregateRating.average)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-lg">{aggregateRating.average}</span>
              <span className="text-muted-foreground">
                su 5 ({totalReviews} recensioni Google)
              </span>
            </div>
          )}
        </div>

        {/* Reviews Carousel */}
        <div className="relative w-full overflow-hidden">
          <div
            className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent px-4"
            style={{
              scrollbarWidth: 'thin',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {allReviews.map((review, index) => (
              <Card
                key={review.id || index}
                className="bg-white hover:shadow-lg transition-shadow duration-300 flex-shrink-0 w-[calc(100vw-3rem)] max-w-[320px] sm:w-[300px] md:w-[340px] snap-start"
              >
                <CardContent className="p-6 flex flex-col h-full min-h-[200px]">
                  {/* Quote Icon */}
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />

                  {/* Review Text */}
                  {review.text && review.text.trim().length > 0 ? (
                    <p className="text-muted-foreground mb-4 line-clamp-4 flex-grow">
                      "{review.text}"
                    </p>
                  ) : (
                    <p className="text-muted-foreground/50 mb-4 flex-grow italic">
                      Valutazione senza commento
                    </p>
                  )}

                  {/* Author & Rating */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t">
                    <div>
                      <p className="font-semibold">{review.author_name}</p>
                      {(review.review_date || review.relative_time) && (
                        <p className="text-sm text-muted-foreground">
                          {getRelativeTime(review.review_date, review.relative_time)}
                        </p>
                      )}
                    </div>
                    {renderStars(review.rating)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Scroll Indicator */}
          {allReviews.length > 3 && (
            <div className="flex justify-center mt-4 gap-2">
              <span className="text-sm text-muted-foreground">
                ← Scorri per vedere le recensioni ({allReviews.length} di {totalReviews}) →
              </span>
            </div>
          )}
        </div>

        {/* Google Attribution */}
        <div className="text-center mt-8">
          <a
            href="https://maps.app.goo.gl/cNK7sWsr9BWbTsjY6"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Vedi tutte le recensioni su Google
          </a>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
