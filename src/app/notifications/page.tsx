'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, ArrowLeft, Clock } from 'lucide-react';
import GoBack from '@/components/navigation/GoBack';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications/list');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const handleMarkRead = async (id: string) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 pb-32">
      <div className="bg-surface/50 backdrop-blur-md border-b border-surface-border sticky top-16 z-20">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <GoBack fallback="/" />
              <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">
                Notifications
              </h1>
              <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All clear'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl font-black text-[11px] uppercase tracking-wider hover:bg-primary/20 transition-all"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark All Read
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 mt-12 md:mt-16">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-surface rounded-3xl border border-dashed border-surface-border">
            <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center mb-6">
              <Bell className="w-10 h-10 text-foreground/20" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">No Notifications</h2>
            <p className="text-sm text-foreground/40 font-bold">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`relative flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                  notif.read
                    ? 'bg-surface border-surface-border'
                    : 'bg-surface border-primary/30 shadow-md shadow-primary/5'
                }`}
              >
                {!notif.read && (
                  <div className="absolute top-5 left-5 w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                )}
                <div className={`flex-1 min-w-0 ${!notif.read ? 'pl-4' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-sm ${notif.read ? 'font-bold text-foreground/60' : 'font-black text-foreground'}`}>
                        {notif.title}
                      </p>
                      {notif.body && (
                        <p className="text-xs text-foreground/50 font-bold mt-1 line-clamp-2">{notif.body}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-foreground/30 font-bold whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="p-1.5 hover:bg-foreground/5 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <CheckCheck className="w-4 h-4 text-foreground/30" />
                        </button>
                      )}
                    </div>
                  </div>
                  {notif.link && (
                    <Link
                      href={notif.link}
                      onClick={() => !notif.read && handleMarkRead(notif.id)}
                      className="inline-flex items-center gap-1 mt-3 text-[11px] font-black text-primary uppercase tracking-wider hover:underline"
                    >
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
