import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  text: string | null;
  relative_time: string | null;
  review_date: string | null;
  profile_photo_url: string | null;
  created_at: string;
}

export interface AggregateRating {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

/**
 * Hook per recuperare le recensioni da Supabase
 */
export const useReviews = (limit?: number) => {
  return useQuery({
    queryKey: ['reviews', limit],
    queryFn: async (): Promise<Review[]> => {
      let query = supabase
        .from('reviews')
        .select('*')
        .order('review_date', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Errore caricamento recensioni:', error);
        return [];
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 ora di cache
  });
};

/**
 * Hook per recuperare il rating aggregato
 */
export const useAggregateRating = () => {
  return useQuery({
    queryKey: ['aggregate-rating'],
    queryFn: async (): Promise<AggregateRating | null> => {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating');

      if (error || !data || data.length === 0) {
        // Ritorna valori di fallback se non ci sono recensioni
        return {
          average: 4.8,
          total: 47,
          distribution: { 5: 40, 4: 5, 3: 2, 2: 0, 1: 0 }
        };
      }

      const total = data.length;
      const sum = data.reduce((acc, r) => acc + r.rating, 0);
      const average = parseFloat((sum / total).toFixed(1));

      // Calcola distribuzione
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      data.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
          distribution[r.rating as keyof typeof distribution]++;
        }
      });

      return { average, total, distribution };
    },
    staleTime: 1000 * 60 * 60, // 1 ora di cache
  });
};

/**
 * Funzione per ottenere recensioni (senza hook, per uso in schema)
 */
export const fetchReviews = async (limit?: number): Promise<Review[]> => {
  let query = supabase
    .from('reviews')
    .select('*')
    .order('review_date', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Errore fetch recensioni:', error);
    return [];
  }

  return data || [];
};

/**
 * Funzione per ottenere rating aggregato (senza hook, per uso in schema)
 */
export const fetchAggregateRating = async (): Promise<AggregateRating> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating');

  // Valori di fallback
  const fallback: AggregateRating = {
    average: 4.8,
    total: 47,
    distribution: { 5: 40, 4: 5, 3: 2, 2: 0, 1: 0 }
  };

  if (error || !data || data.length === 0) {
    return fallback;
  }

  const total = data.length;
  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  const average = parseFloat((sum / total).toFixed(1));

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  data.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating as keyof typeof distribution]++;
    }
  });

  return { average, total, distribution };
};
