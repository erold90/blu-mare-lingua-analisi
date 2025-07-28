import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type CleaningTaskRow = Database['public']['Tables']['cleaning_tasks']['Row'];
type CleaningTaskInsert = Database['public']['Tables']['cleaning_tasks']['Insert'];

export interface CleaningTask extends CleaningTaskRow {}

export interface NewCleaningTask extends Omit<CleaningTaskInsert, 'id' | 'created_at' | 'updated_at' | 'status'> {
  apartment_id: string;
  task_date: string;
  task_type: string;
  priority: string;
  assignee?: string;
  estimated_duration?: number;
  notes?: string;
}


export const useCleaningManagement = () => {
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carica tutte le task di pulizia
  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('cleaning_tasks')
        .select('*')
        .order('task_date', { ascending: false });

      if (error) throw error;

      setTasks(data as CleaningTask[] || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nel caricamento task';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error loading cleaning tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Crea una nuova task
  const createTask = useCallback(async (newTask: NewCleaningTask): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .insert({
          ...newTask,
          status: 'pending',
          estimated_duration: newTask.estimated_duration || 60
        })
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data as CleaningTask, ...prev]);
      toast.success('Task di pulizia creata con successo');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nella creazione task';
      toast.error(errorMessage);
      console.error('Error creating cleaning task:', err);
      return false;
    }
  }, []);

  // Aggiorna una task esistente
  const updateTask = useCallback(async (id: string, updates: Partial<CleaningTask>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => prev.map(task => task.id === id ? data as CleaningTask : task));
      toast.success('Task aggiornata con successo');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nell\'aggiornamento task';
      toast.error(errorMessage);
      console.error('Error updating cleaning task:', err);
      return false;
    }
  }, []);

  // Elimina una task
  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('cleaning_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Task eliminata con successo');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nell\'eliminazione task';
      toast.error(errorMessage);
      console.error('Error deleting cleaning task:', err);
      return false;
    }
  }, []);

  // Completa una task
  const completeTask = useCallback(async (id: string, actualDuration?: number): Promise<boolean> => {
    return updateTask(id, {
      status: 'completed',
      actual_duration: actualDuration
    });
  }, [updateTask]);

  // Assegna una task a un addetto
  const assignTask = useCallback(async (id: string, assignee: string): Promise<boolean> => {
    return updateTask(id, { assignee });
  }, [updateTask]);

  // Ottieni task per appartamento
  const getTasksByApartment = useCallback((apartmentId: string) => {
    return tasks.filter(task => task.apartment_id === apartmentId);
  }, [tasks]);

  // Ottieni task per data
  const getTasksByDate = useCallback((date: string) => {
    return tasks.filter(task => task.task_date === date);
  }, [tasks]);

  // Ottieni statistiche
  const getStats = useCallback(() => {
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;

    return {
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      urgentTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  }, [tasks]);

  // Carica task all'avvio
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Setup real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('cleaning_tasks_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cleaning_tasks' },
        (payload) => {
          console.log('Cleaning task change:', payload);
          loadTasks(); // Ricarica le task quando ci sono cambiamenti
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTasks]);

  return {
    tasks,
    isLoading,
    error,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    assignTask,
    getTasksByApartment,
    getTasksByDate,
    getStats
  };
};