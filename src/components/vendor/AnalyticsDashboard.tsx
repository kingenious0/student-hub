'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Clock, Download } from 'lucide-react';

interface AnalyticsData {
  todayRevenue: number;
  todayOrders: number;
  weekRevenue: number;
  monthRevenue: number;
  prevMonthRevenue: number;
  topProducts: Array<{ title: string; salesCount: number; revenue: number }>;
  peakHours: Array<{ hour: number; count: number }>;
  averageOrderValue: number;
  conversionRate: number;
  periodComparison: number;
}

export default function AnalyticsDashboard() {
  const { getToken } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`/api/vendor/analytics?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      } catch { /* noop */ } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [period]);

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Period', period],
      ['Revenue', data.todayRevenue],
      ['Orders', data.todayOrders],
      ['Avg Order Value', data.averageOrderValue],
      ['vs Previous Period', `${data.periodComparison}%`],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const peakHours = useMemo(() => {
    if (!data?.peakHours) return [];
    return [...data.peakHours].sort((a, b) => b.count - a.count).slice(0, 5);
  }, [data]);

  if (loading) return (
    <Card>
      <CardContent className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </CardContent>
    </Card>
  );

  if (!data) return null;

  const isUp = data.periodComparison >= 0;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-2">
        {(['today', 'week', 'month'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              period === p
                ? 'bg-primary text-black'
                : 'bg-surface border border-surface-border text-foreground/60 hover:text-foreground'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="w-3 h-3 mr-1" /> CSV
        </Button>
      </div>

      {/* Live Revenue Counter */}
      <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 border-none text-white">
        <CardContent className="p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-100 mb-1">
            {period === 'today' ? "Today's Revenue" : period === 'week' ? 'This Week' : 'This Month'}
          </p>
          <div className="text-5xl font-black tracking-tight mb-2">
            ₵{data.todayRevenue.toFixed(2)}
          </div>
          <div className="flex items-center gap-4 text-sm text-emerald-100">
            <span className="flex items-center gap-1">
              {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(data.periodComparison).toFixed(1)}% vs previous {period}
            </span>
            <span>{data.todayOrders} orders</span>
          </div>
        </CardContent>
      </Card>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Avg Order</span>
            </div>
            <p className="text-2xl font-bold">₵{data.averageOrderValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-medium">Total Orders</span>
            </div>
            <p className="text-2xl font-bold">{data.todayOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Peak Hour</span>
            </div>
            <p className="text-2xl font-bold">
              {peakHours[0] ? `${peakHours[0].hour}:00` : '--'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Items/Order</span>
            </div>
            <p className="text-2xl font-bold">--</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{p.title}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{p.salesCount} sold</span>
                    <span className="font-bold">₵{p.revenue.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Peak Hours */}
      {peakHours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-24">
              {peakHours.map((h) => (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{h.count}</span>
                  <div
                    className="w-full bg-primary/20 rounded-t"
                    style={{
                      height: `${Math.max(8, (h.count / Math.max(...peakHours.map(x => x.count))) * 80)}px`,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">{h.hour}:00</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
