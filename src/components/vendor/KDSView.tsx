'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useOrderStream } from '@/hooks/useOrderStream';
import { playKDSAlert } from '@/lib/audio/playChime';
import { toast } from 'sonner';
import { Bell, Clock, CheckCircle, ChefHat, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import Link from 'next/link';

interface KDSOrder {
  id: string;
  amount: number;
  status: string;
  items: Array<{
    product: { title: string; imageUrl: string | null };
    quantity: number;
    price: number;
    modifierSnapshot?: Array<{ name: string; groupName: string; priceDiff: number }>;
  }>;
  student: { name: string; phoneNumber: string | null };
  createdAt: string;
  elapsed?: number;
}

const formatElapsed = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

interface StaffSession {
  staffId: string;
  staffName: string;
  role: string;
  vendorId: string;
  shopName: string;
  loggedInAt: number;
}

export default function KDSView({ staffSession }: { staffSession?: StaffSession | null }) {
  const { getToken } = useAuth();
  const { orders, connected } = useOrderStream({
    onNewOrder: () => playKDSAlert(),
    playSound: true,
  });
  const [fullscreen, setFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState<Record<string, number>>({});

  const activeOrders = orders.filter(o =>
    ['PAID', 'PREPARING', 'READY'].includes(o.status)
  );

  useEffect(() => {
    if (!fullscreen) return;
    const handler = () => {
      if (!document.fullscreenElement) setFullscreen(false);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [fullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const handleAccept = async (orderId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/vendor/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'PREPARING' }),
      });
      if (res.ok) toast.success('Order accepted — start preparing!');
      else toast.error('Failed to accept order');
    } catch { toast.error('Network error'); }
  };

  const handleReady = async (orderId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/vendor/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'READY' }),
      });
      if (res.ok) toast.success('Marked as ready!');
      else toast.error('Failed to update');
    } catch { toast.error('Network error'); }
  };

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const next: Record<string, number> = {};
      for (const o of orders) {
        next[o.id] = Math.floor((now - new Date(o.createdAt).getTime()) / 1000);
      }
      setElapsed(next);
    }, 1000);
    return () => clearInterval(timer);
  }, [orders]);

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-[9999] bg-black' : ''}`}>
      <div className={`min-h-screen bg-black text-white ${fullscreen ? '' : 'p-4'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between mb-6 ${fullscreen ? 'p-4 bg-zinc-950 border-b border-zinc-800' : ''}`}>
          <div className="flex items-center gap-4">
            {!fullscreen && (
              <Link href="/dashboard/vendor" className="text-zinc-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-emerald-400" />
                KITCHEN
                {staffSession && (
                  <span className="text-[10px] bg-zinc-800 text-emerald-400 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    {staffSession.staffName}
                  </span>
                )}
              </h1>
              <p className="text-xs text-zinc-500 font-mono">
                {connected ? '● LIVE' : '○ RECONNECTING...'} · {activeOrders.length} active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {staffSession && (
              <span className="hidden md:inline text-[9px] text-zinc-600 uppercase tracking-wider font-bold">
                {staffSession.role}
              </span>
            )}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Order Grid */}
        <div className={`grid grid-cols-1 ${fullscreen ? 'md:grid-cols-3 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
          {activeOrders.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-zinc-600">
              <Bell className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-xl font-black tracking-tight">NO ACTIVE ORDERS</p>
              <p className="text-sm">Waiting for incoming orders...</p>
            </div>
          )}

          {/* Paid — New Orders */}
          {orders.filter(o => o.status === 'PAID').map(order => {
            const time = elapsed[order.id] || 0;
            const urgent = time > 600;
            return (
              <div
                key={order.id}
                className={`relative bg-zinc-900 border-2 rounded-2xl p-6 ${
                  urgent ? 'border-red-500 animate-pulse' : 'border-emerald-500/30'
                }`}
              >
                {urgent && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    OVERDUE
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black font-mono">{formatElapsed(time)}</span>
                  <span className="text-[10px] font-mono text-zinc-500">#{order.id.slice(0, 8)}</span>
                </div>
                <div className="space-y-3 mb-6">
                  {order.items.map((item, i) => (
                    <div key={i} className="border-b border-zinc-800 pb-2 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-lg font-bold">{item.quantity}x </span>
                          <span className="text-lg">{item.product.title}</span>
                        </div>
                        <span className="text-sm text-zinc-400">₵{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      {item.modifierSnapshot && item.modifierSnapshot.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.modifierSnapshot.map((mod, mi) => (
                            <span key={mi} className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
                              {mod.groupName}: {mod.name}{mod.priceDiff > 0 ? ` (+₵${mod.priceDiff})` : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-zinc-400 mb-4">
                  <span>{order.student.name}</span>
                  {order.student.phoneNumber && (
                    <a href={`tel:${order.student.phoneNumber}`} className="text-emerald-400 hover:underline text-xs">
                      {order.student.phoneNumber}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleAccept(order.id)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm tracking-wider transition-all active:scale-[0.98]"
                >
                  ACCEPT ORDER
                </button>
              </div>
            );
          })}

          {/* Preparing — In Progress */}
          {orders.filter(o => o.status === 'PREPARING').map(order => {
            const time = elapsed[order.id] || 0;
            return (
              <div
                key={order.id}
                className="bg-zinc-900 border-2 border-yellow-500/30 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-3xl font-black font-mono">{formatElapsed(time)}</span>
                  <span className="text-[10px] font-mono text-zinc-500 ml-auto">#{order.id.slice(0, 8)}</span>
                </div>
                <div className="space-y-3 mb-6">
                  {order.items.map((item, i) => (
                    <div key={i} className="border-b border-zinc-800 pb-2 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-lg font-bold">{item.quantity}x </span>
                          <span className="text-lg">{item.product.title}</span>
                        </div>
                        <span className="text-sm text-zinc-400">₵{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleReady(order.id)}
                  className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-black text-sm tracking-wider transition-all active:scale-[0.98]"
                >
                  <CheckCircle className="w-4 h-4 inline mr-2" /> MARK READY
                </button>
              </div>
            );
          })}

          {/* Ready — For Pickup */}
          {orders.filter(o => o.status === 'READY').map(order => (
            <div
              key={order.id}
              className="bg-zinc-900 border-2 border-blue-500/30 rounded-2xl p-6 opacity-80"
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <span className="font-black text-blue-400 text-sm tracking-wider uppercase">Ready</span>
                <span className="text-[10px] font-mono text-zinc-500 ml-auto">#{order.id.slice(0, 8)}</span>
              </div>
              <div className="space-y-3 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span><span className="font-bold">{item.quantity}x </span>{item.product.title}</span>
                  </div>
                ))}
              </div>
              <div className="text-center py-3 bg-zinc-800 rounded-xl">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Pickup Code</p>
                <p className="text-2xl font-black font-mono tracking-widest">{order.pickupCode || '----'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
