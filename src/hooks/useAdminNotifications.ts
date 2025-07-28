import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { addDays, isToday, isTomorrow, format } from 'date-fns';

export interface AdminNotification {
  id: string;
  type: 'reservation' | 'cleaning' | 'quote' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  read: boolean;
  data?: any;
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const notifications: AdminNotification[] = [];
      const today = new Date();
      const tomorrow = addDays(today, 1);

      // Check for today's arrivals
      const { data: todayArrivals } = await supabase
        .from('reservations')
        .select('*')
        .eq('start_date', format(today, 'yyyy-MM-dd'));

      if (todayArrivals?.length) {
        notifications.push({
          id: 'today-arrivals',
          type: 'reservation',
          title: `${todayArrivals.length} arrivi oggi`,
          message: `Ci sono ${todayArrivals.length} prenotazioni in arrivo oggi`,
          priority: 'high',
          timestamp: today,
          read: false,
          data: todayArrivals
        });
      }

      // Check for tomorrow's arrivals
      const { data: tomorrowArrivals } = await supabase
        .from('reservations')
        .select('*')
        .eq('start_date', format(tomorrow, 'yyyy-MM-dd'));

      if (tomorrowArrivals?.length) {
        notifications.push({
          id: 'tomorrow-arrivals',
          type: 'reservation',
          title: `${tomorrowArrivals.length} arrivi domani`,
          message: `Ci sono ${tomorrowArrivals.length} prenotazioni in arrivo domani`,
          priority: 'medium',
          timestamp: today,
          read: false,
          data: tomorrowArrivals
        });
      }

      // Check for pending cleaning tasks
      const { data: pendingCleaning } = await supabase
        .from('cleaning_tasks')
        .select('*')
        .eq('status', 'pending')
        .lte('task_date', format(today, 'yyyy-MM-dd'));

      if (pendingCleaning?.length) {
        notifications.push({
          id: 'pending-cleaning',
          type: 'cleaning',
          title: `${pendingCleaning.length} pulizie in sospeso`,
          message: `Ci sono ${pendingCleaning.length} pulizie non completate`,
          priority: 'medium',
          timestamp: today,
          read: false,
          data: pendingCleaning
        });
      }

      // Check for recent incomplete quotes
      const { data: incompleteQuotes } = await supabase
        .from('quote_logs')
        .select('*')
        .eq('completed', false)
        .gte('updated_at', format(addDays(today, -7), 'yyyy-MM-dd'));

      if (incompleteQuotes?.length) {
        notifications.push({
          id: 'incomplete-quotes',
          type: 'quote',
          title: `${incompleteQuotes.length} preventivi incompleti`,
          message: `Ci sono ${incompleteQuotes.length} preventivi non completati questa settimana`,
          priority: 'low',
          timestamp: today,
          read: false,
          data: incompleteQuotes
        });
      }

      // Check for today's departures
      const { data: todayDepartures } = await supabase
        .from('reservations')
        .select('*')
        .eq('end_date', format(today, 'yyyy-MM-dd'));

      if (todayDepartures?.length) {
        notifications.push({
          id: 'today-departures',
          type: 'reservation',
          title: `${todayDepartures.length} partenze oggi`,
          message: `Ci sono ${todayDepartures.length} check-out previsti oggi`,
          priority: 'medium',
          timestamp: today,
          read: false,
          data: todayDepartures
        });
      }

      setNotifications(notifications.sort((a, b) => 
        b.priority === 'high' ? 1 : a.priority === 'high' ? -1 : 0
      ));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };
}