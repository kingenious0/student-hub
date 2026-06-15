'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, ArrowLeft, Clock, ShoppingBag, Shield, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import GoBack from '@/components/navigation/GoBack';
import { motion, AnimatePresence } from 'framer-motion';

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

  const getNotificationIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'ORDER':
      case 'ESCROW':
        return <ShoppingBag className="w-5 h-5 text-primary" />;
      case 'SECURITY':
        return <Shield className="w-5 h-5 text-red-500" />;
      case 'WELCOME':
      case 'SYSTEM':
        return <img src="/icon-192x192.png" className="w-6 h-6 object-contain rounded-lg" alt="LaHustle Brand Logo" />;
      case 'CHAT':
      case 'MESSAGE':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-foreground/60" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vh] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div className="space-y-4">
            <GoBack fallback="/" />
            <div>
              <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">
                Notification <span className="text-primary italic">Center</span>
              </h1>
              <p className="text-xs font-black text-foreground/30 uppercase tracking-[0.3em] mt-2">
                {unreadCount > 0 ? `${unreadCount} unread updates waiting` : 'Your communication inbox is clear'}
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="group relative flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 py-3.5 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest text-foreground transition-all active:scale-95 border border-white/5"
            >
              <CheckCheck className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              Mark All Read
            </button>
          )}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Loading Signals...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-surface/30 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 p-12 shadow-2xl">
            <div className="w-20 h-20 bg-foreground/5 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
              <Bell className="w-8 h-8 text-foreground/30" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">Inbox Empty</h2>
            <p className="text-xs text-foreground/40 font-bold uppercase tracking-wider">No new signals detected at this terminal.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`relative flex gap-6 p-6 rounded-[2rem] border transition-all ${
                    notif.read
                      ? 'bg-surface/35 border-white/5 hover:bg-surface/50'
                      : 'bg-surface/70 border-primary/25 shadow-lg shadow-primary/5 hover:bg-surface/80'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
                    notif.read ? 'bg-foreground/5 border-white/5' : 'bg-primary/10 border-primary/20'
                  }`}>
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className={`text-sm ${notif.read ? 'font-bold text-foreground/70' : 'font-black text-foreground'}`}>
                            {notif.title}
                          </h3>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                          )}
                        </div>
                        {notif.body && (
                          <p className="text-xs text-foreground/50 font-medium leading-relaxed">{notif.body}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
                        <span className="text-[9px] text-foreground/30 font-black uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(notif.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkRead(notif.id)}
                            className="p-2 hover:bg-foreground/5 rounded-xl transition-colors border border-white/5"
                            title="Mark as read"
                          >
                            <CheckCheck className="w-3.5 h-3.5 text-foreground/40 hover:text-primary" />
                          </button>
                        )}
                      </div>
                    </div>

                    {notif.link && (
                      <div className="mt-4">
                        <Link
                          href={notif.link}
                          onClick={() => !notif.read && handleMarkRead(notif.id)}
                          className="inline-flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary/80 transition-colors bg-primary/10 px-4 py-2 rounded-xl border border-primary/10"
                        >
                          View Action
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
