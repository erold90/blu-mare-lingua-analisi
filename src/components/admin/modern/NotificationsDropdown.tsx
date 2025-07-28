import React from 'react';
import { Bell, Calendar, Sparkles, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AdminNotification, useAdminNotifications } from '@/hooks/useAdminNotifications';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const getNotificationIcon = (type: AdminNotification['type']) => {
  switch (type) {
    case 'reservation':
      return <Calendar className="h-4 w-4" />;
    case 'cleaning':
      return <Sparkles className="h-4 w-4" />;
    case 'quote':
      return <FileText className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: AdminNotification['priority']) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

interface NotificationItemProps {
  notification: AdminNotification;
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  return (
    <div 
      className={`p-3 border rounded-lg transition-colors ${
        notification.read 
          ? 'bg-gray-50 border-gray-200' 
          : 'bg-white border-blue-200 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {notification.title}
            </h4>
            {!notification.read && (
              <Badge variant="secondary" className="h-2 w-2 p-0 bg-blue-600" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(notification.timestamp, { 
                addSuffix: true, 
                locale: it 
              })}
            </span>
            
            {!notification.read && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={() => onMarkAsRead(notification.id)}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Segna come letto
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationsDropdown() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    refreshNotifications 
  } = useAdminNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="relative text-slate-600 hover:text-slate-900 hover:bg-slate-50"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifiche</h3>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={refreshNotifications}
                disabled={loading}
              >
                <Clock className="h-3 w-3 mr-1" />
                Aggiorna
              </Button>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={markAllAsRead}
                >
                  Segna tutte come lette
                </Button>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <p className="text-xs text-gray-600 mt-1">
              {unreadCount} notifiche non lette
            </p>
          )}
        </div>

        <ScrollArea className="max-h-96">
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-6">
                <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Nessuna notifica</p>
                <p className="text-xs text-gray-400 mt-1">
                  Tutte le attività sono sotto controllo
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))
            )}
          </div>
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3 text-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Visualizza tutte le notifiche
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}