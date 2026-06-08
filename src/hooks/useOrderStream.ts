'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface OrderItem {
  product: { title: string; imageUrl: string | null };
  quantity: number;
  price: number;
  modifierSnapshot?: Array<{ name: string; groupName: string; priceDiff: number }>;
}

interface Order {
  id: string;
  amount: number;
  status: string;
  items: OrderItem[];
  student: { name: string; email: string; phoneNumber: string | null };
  pickupCode: string | null;
  createdAt: string;
}

interface UseOrderStreamOptions {
  onNewOrder?: (order: Order) => void;
  onOrderUpdate?: (order: Order) => void;
  playSound?: boolean;
}

export function useOrderStream(options: UseOrderStreamOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryRef = useRef(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const callbackRef = useRef(options);
  callbackRef.current = options;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource('/api/vendor/orders/stream');
    eventSourceRef.current = es;

    es.addEventListener('connected', () => {
      setConnected(true);
      setError(null);
      retryRef.current = 0;
    });

    es.addEventListener('new_order', (e) => {
      try {
        const newOrders: Order[] = JSON.parse(e.data);
        setOrders(prev => {
          const existingIds = new Set(prev.map(o => o.id));
          const unique = newOrders.filter(o => !existingIds.has(o.id));
          if (unique.length > 0 && callbackRef.current.onNewOrder) {
            callbackRef.current.onNewOrder(unique[0]);
          }
          return [...unique, ...prev];
        });
      } catch { /* ignore parse errors */ }
    });

    es.addEventListener('order_update', (e) => {
      try {
        const updates: Order[] = JSON.parse(e.data);
        setOrders(prev => {
          const map = new Map(prev.map(o => [o.id, o]));
          for (const u of updates) {
            const existing = map.get(u.id);
            if (existing && existing.status !== u.status && callbackRef.current.onOrderUpdate) {
              callbackRef.current.onOrderUpdate(u);
            }
            map.set(u.id, u);
          }
          return Array.from(map.values());
        });
      } catch { /* ignore parse errors */ }
    });

    es.addEventListener('heartbeat', () => { retryRef.current = 0; });

    es.onerror = () => {
      setConnected(false);
      es.close();
      eventSourceRef.current = null;
      retryRef.current++;
      const delay = Math.min(1000 * Math.pow(2, retryRef.current), 15000);
      setTimeout(connect, delay);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  return { orders, setOrders, connected, error };
}
