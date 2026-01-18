import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Star, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  author_name: string;
  rating: number;
  text: string | null;
  relative_time: string | null;
  review_date: string | null;
  created_at: string;
}

interface ReviewFormData {
  author_name: string;
  rating: number;
  text: string;
  review_date: string;
}

const getEmptyForm = (): ReviewFormData => ({
  author_name: '',
  rating: 5,
  text: '',
  review_date: new Date().toISOString().split('T')[0],
});

// Componente stelle interattive (fuori dal componente principale)
const StarRating = ({
  rating,
  onChange,
  interactive = false
}: {
  rating: number;
  onChange?: (r: number) => void;
  interactive?: boolean;
}) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-5 w-5 ${
          star <= rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
        onClick={() => interactive && onChange?.(star)}
      />
    ))}
  </div>
);

const REVIEWS_PER_PAGE = 20;

export function ReviewsManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>(getEmptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reviews
  const { data: reviews, isLoading, refetch } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
  });

  // Calculate aggregate
  const aggregateRating = reviews?.length
    ? {
        average: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
        total: reviews.length,
      }
    : { average: '0', total: 0 };

  // Pagination
  const totalPages = Math.ceil((reviews?.length || 0) / REVIEWS_PER_PAGE);
  const paginatedReviews = reviews?.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  // Add review mutation
  const addMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const { error } = await supabase.from('reviews').insert({
        author_name: data.author_name,
        rating: data.rating,
        text: data.text || null,
        review_date: data.review_date ? new Date(data.review_date).toISOString() : new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['aggregate-rating'] });
      setIsAddDialogOpen(false);
      setFormData(getEmptyForm());
      toast({
        title: 'Recensione aggiunta',
        description: 'La recensione è stata aggiunta con successo.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Errore',
        description: 'Impossibile aggiungere la recensione.',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Update review mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ReviewFormData }) => {
      const { error } = await supabase
        .from('reviews')
        .update({
          author_name: data.author_name,
          rating: data.rating,
          text: data.text || null,
          review_date: data.review_date ? new Date(data.review_date).toISOString() : null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['aggregate-rating'] });
      setIsEditDialogOpen(false);
      setEditingId(null);
      setFormData(getEmptyForm());
      toast({
        title: 'Recensione aggiornata',
        description: 'La recensione è stata modificata con successo.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Errore',
        description: 'Impossibile modificare la recensione.',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Delete review mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['aggregate-rating'] });
      toast({
        title: 'Recensione eliminata',
        description: 'La recensione è stata eliminata con successo.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare la recensione.',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setFormData({
      author_name: review.author_name,
      rating: review.rating,
      text: review.text || '',
      review_date: review.review_date ? review.review_date.split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenAddDialog = () => {
    setFormData(getEmptyForm());
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rating Medio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{aggregateRating.average}</span>
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Totale Recensioni</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{aggregateRating.total}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Azioni</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={handleOpenAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nuova
            </Button>

            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Aggiorna
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Recensione</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-author">Nome Autore *</Label>
              <Input
                id="add-author"
                value={formData.author_name}
                onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                placeholder="es. Mario"
                autoComplete="off"
              />
            </div>

            <div>
              <Label>Valutazione *</Label>
              <div className="mt-2">
                <StarRating
                  rating={formData.rating}
                  interactive
                  onChange={(r) => setFormData(prev => ({ ...prev, rating: r }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="add-text">Testo Recensione</Label>
              <Textarea
                id="add-text"
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Scrivi il testo della recensione..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="add-date">Data Recensione</Label>
              <Input
                id="add-date"
                type="date"
                value={formData.review_date}
                onChange={(e) => setFormData(prev => ({ ...prev, review_date: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Il tempo relativo (es. "5 mesi fa") viene calcolato automaticamente
              </p>
            </div>

            <Button
              onClick={() => addMutation.mutate(formData)}
              disabled={!formData.author_name || addMutation.isPending}
              className="w-full"
            >
              {addMutation.isPending ? 'Salvataggio...' : 'Aggiungi Recensione'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Recensione</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-author">Nome Autore *</Label>
              <Input
                id="edit-author"
                value={formData.author_name}
                onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                placeholder="es. Mario"
                autoComplete="off"
              />
            </div>

            <div>
              <Label>Valutazione *</Label>
              <div className="mt-2">
                <StarRating
                  rating={formData.rating}
                  interactive
                  onChange={(r) => setFormData(prev => ({ ...prev, rating: r }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-text">Testo Recensione</Label>
              <Textarea
                id="edit-text"
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Scrivi il testo della recensione..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="edit-date">Data Recensione</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.review_date}
                onChange={(e) => setFormData(prev => ({ ...prev, review_date: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Il tempo relativo (es. "5 mesi fa") viene calcolato automaticamente
              </p>
            </div>

            <Button
              onClick={() => editingId && updateMutation.mutate({ id: editingId, data: formData })}
              disabled={!formData.author_name || updateMutation.isPending}
              className="w-full"
            >
              {updateMutation.isPending ? 'Salvataggio...' : 'Salva Modifiche'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reviews List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista Recensioni</CardTitle>
          {totalPages > 1 && (
            <span className="text-sm text-muted-foreground">
              Pagina {currentPage} di {totalPages}
            </span>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : reviews?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nessuna recensione presente. Clicca "Nuova" per aggiungerne una.
            </p>
          ) : (
            <div className="space-y-4">
              {paginatedReviews?.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{review.author_name}</span>
                      <StarRating rating={review.rating} />
                      {review.relative_time && (
                        <Badge variant="secondary" className="text-xs">
                          {review.relative_time}
                        </Badge>
                      )}
                    </div>
                    {review.text ? (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        "{review.text}"
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground/50 mt-1 italic">
                        Nessun commento
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(review)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminare questa recensione?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Stai per eliminare la recensione di "{review.author_name}".
                            Questa azione non può essere annullata.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(review.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Elimina
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Precedente
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Successiva →
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
