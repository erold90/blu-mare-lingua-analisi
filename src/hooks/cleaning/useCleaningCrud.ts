
import { useState } from "react";
import { CleaningTask } from "../useCleaningManagement";
import { supabaseService } from "@/services/supabaseService";
import { toast } from "sonner";
import { saveCleaningTasks } from "./cleaningStorage";

export const useCleaningCrud = (
  cleaningTasks: CleaningTask[],
  setCleaningTasks: React.Dispatch<React.SetStateAction<CleaningTask[]>>,
  apartments: any[]
) => {
  const addTask = async (task: Omit<CleaningTask, "id" | "createdAt" | "updatedAt">) => {
    try {
      console.log("Adding new cleaning task:", task);
      
      const newTask = {
        id: crypto.randomUUID(),
        apartment_id: task.apartmentId,
        task_date: task.taskDate,
        task_type: task.taskType,
        status: task.status === "inProgress" ? "in_progress" : task.status,
        priority: task.priority,
        assignee: task.assignee,
        notes: task.notes,
        estimated_duration: task.estimatedDuration,
        actual_duration: task.actualDuration,
        device_id: task.deviceId || crypto.randomUUID()
      };
      
      await supabaseService.cleaningTasks.create(newTask);
      
      const localTask: CleaningTask = {
        id: newTask.id,
        apartmentId: newTask.apartment_id,
        apartmentName: apartments.find(apt => apt.id === newTask.apartment_id)?.name || 'Appartamento sconosciuto',
        taskDate: newTask.task_date,
        taskType: newTask.task_type as CleaningTask["taskType"],
        status: (newTask.status === "in_progress" ? "inProgress" : newTask.status) as CleaningTask["status"],
        priority: newTask.priority as CleaningTask["priority"],
        assignee: newTask.assignee || undefined,
        notes: newTask.notes || undefined,
        estimatedDuration: newTask.estimated_duration,
        actualDuration: newTask.actual_duration || undefined,
        deviceId: newTask.device_id || undefined
      };
      
      setCleaningTasks(prev => [...prev, localTask]);
      saveCleaningTasks([...cleaningTasks, localTask]);
      
      toast.success("Attività di pulizia aggiunta con successo");
    } catch (error) {
      console.error("Errore nell'aggiunta dell'attività:", error);
      toast.error("Errore nell'aggiungere l'attività di pulizia");
    }
  };

  const updateTaskStatus = async (id: string, status: CleaningTask["status"]) => {
    try {
      const task = cleaningTasks.find(t => t.id === id);
      if (!task) return;

      const supabaseTask = {
        apartment_id: task.apartmentId,
        task_date: task.taskDate,
        task_type: task.taskType,
        status: status === "inProgress" ? "in_progress" : status,
        priority: task.priority,
        assignee: task.assignee,
        notes: task.notes,
        estimated_duration: task.estimatedDuration,
        actual_duration: task.actualDuration,
        device_id: task.deviceId || crypto.randomUUID()
      };
      
      await supabaseService.cleaningTasks.update(id, supabaseTask);
      
      setCleaningTasks(prev => 
        prev.map(task => task.id === id ? { ...task, status } : task)
      );
      
      const updatedTasks = cleaningTasks.map(task => task.id === id ? { ...task, status } : task);
      saveCleaningTasks(updatedTasks);
      
      toast.success("Stato attività aggiornato");
    } catch (error) {
      console.error("Errore nell'aggiornamento dello stato:", error);
      toast.error("Errore nell'aggiornare lo stato dell'attività");
    }
  };

  const updateTaskNotes = async (id: string, notes: string) => {
    try {
      const task = cleaningTasks.find(t => t.id === id);
      if (!task) return;

      const supabaseTask = {
        apartment_id: task.apartmentId,
        task_date: task.taskDate,
        task_type: task.taskType,
        status: task.status === "inProgress" ? "in_progress" : task.status,
        priority: task.priority,
        assignee: task.assignee,
        notes: notes,
        estimated_duration: task.estimatedDuration,
        actual_duration: task.actualDuration,
        device_id: task.deviceId || crypto.randomUUID()
      };
      
      await supabaseService.cleaningTasks.update(id, supabaseTask);
      
      setCleaningTasks(prev => 
        prev.map(task => task.id === id ? { ...task, notes } : task)
      );
      
      const updatedTasks = cleaningTasks.map(task => task.id === id ? { ...task, notes } : task);
      saveCleaningTasks(updatedTasks);
      
      toast.success("Note aggiornate");
    } catch (error) {
      console.error("Errore nell'aggiornamento delle note:", error);
      toast.error("Errore nell'aggiornare le note");
    }
  };

  const updateTaskAssignment = async (id: string, assignedTo: string) => {
    try {
      const task = cleaningTasks.find(t => t.id === id);
      if (!task) return;

      const supabaseTask = {
        apartment_id: task.apartmentId,
        task_date: task.taskDate,
        task_type: task.taskType,
        status: task.status === "inProgress" ? "in_progress" : task.status,
        priority: task.priority,
        assignee: assignedTo,
        notes: task.notes,
        estimated_duration: task.estimatedDuration,
        actual_duration: task.actualDuration,
        device_id: task.deviceId || crypto.randomUUID()
      };
      
      await supabaseService.cleaningTasks.update(id, supabaseTask);
      
      setCleaningTasks(prev => 
        prev.map(task => task.id === id ? { ...task, assignee: assignedTo } : task)
      );
      
      const updatedTasks = cleaningTasks.map(task => task.id === id ? { ...task, assignee: assignedTo } : task);
      saveCleaningTasks(updatedTasks);
      
      toast.success("Assegnazione aggiornata");
    } catch (error) {
      console.error("Errore nell'aggiornamento dell'assegnazione:", error);
      toast.error("Errore nell'aggiornare l'assegnazione");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await supabaseService.cleaningTasks.delete(id);
      
      setCleaningTasks(prev => prev.filter(task => task.id !== id));
      
      const updatedTasks = cleaningTasks.filter(task => task.id !== id);
      saveCleaningTasks(updatedTasks);
      
      toast.success("Attività eliminata");
    } catch (error) {
      console.error("Errore nell'eliminazione dell'attività:", error);
      toast.error("Errore nell'eliminare l'attività");
    }
  };

  return {
    addTask,
    updateTaskStatus,
    updateTaskNotes,
    updateTaskAssignment,
    deleteTask
  };
};
