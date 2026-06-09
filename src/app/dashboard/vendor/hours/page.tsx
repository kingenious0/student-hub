'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import GoBack from '@/components/navigation/GoBack';
import { Clock, Sun, Moon, Sunrise, Sunset } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DaySchedule {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const DEFAULT_HOURS: DaySchedule[] = DAYS.map((_, i) => ({
  dayOfWeek: i,
  isOpen: i !== 0,
  openTime: '08:00',
  closeTime: '22:00',
}));

export default function HoursPage() {
  const { getToken } = useAuth();
  const [hours, setHours] = useState<DaySchedule[]>(DEFAULT_HOURS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadHours = async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/vendor/hours', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.hours && data.hours.length > 0) {
            setHours(data.hours);
          }
        }
      } catch { /* keep defaults */ } finally {
        setLoading(false);
      }
    };
    loadHours();
  }, []);

  const updateDay = (idx: number, partial: Partial<DaySchedule>) => {
    setHours(prev => prev.map((d, i) => i === idx ? { ...d, ...partial } : d));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/vendor/hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ hours }),
      });
      if (res.ok) toast.success('Operating hours saved');
      else toast.error('Failed to save');
    } catch { toast.error('Network error'); } finally {
      setSaving(false);
    }
  };

  const now = new Date();
  const currentDay = now.getDay();
  const today = hours[currentDay];
  const isOpenNow = today?.isOpen && today?.openTime && today?.closeTime &&
    now.getHours() >= parseInt(today.openTime.split(':')[0]) &&
    now.getHours() < parseInt(today.closeTime.split(':')[0]);

  if (loading) return (
    <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
  );

  return (
    <div className="space-y-8">
      <div>
        <GoBack fallback="/dashboard/vendor" />
        <h1 className="text-2xl font-bold tracking-tight mt-2">Operating Hours</h1>
        <p className="text-muted-foreground text-sm">Set when your shop is open for orders.</p>
      </div>

      {/* Status Card */}
      <Card className={`border-2 ${isOpenNow ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <div>
              <p className="font-bold text-lg">{isOpenNow ? 'Open Now' : 'Closed Now'}</p>
              <p className="text-sm text-muted-foreground">
                {today?.isOpen
                  ? `Today: ${today.openTime} — ${today.closeTime}`
                  : 'Today: Closed'}
              </p>
            </div>
          </div>
          <Clock className="w-8 h-8 text-muted-foreground/30" />
        </CardContent>
      </Card>

      {/* Day-by-day Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hours.map((day, i) => (
            <div key={i} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
              i === currentDay ? 'bg-primary/5 border border-primary/10' : ''
            }`}>
              <div className="w-16 flex-shrink-0">
                <Switch
                  checked={day.isOpen}
                  onCheckedChange={v => updateDay(i, { isOpen: v })}
                  aria-label={`Toggle ${DAYS[i]}`}
                />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{DAYS[i]}</p>
              </div>
              {day.isOpen ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Sunrise className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                    <input
                      type="time"
                      value={day.openTime}
                      onChange={e => updateDay(i, { openTime: e.target.value })}
                      className="w-28 bg-surface border border-surface-border rounded-lg px-8 py-2 text-xs font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                  <span className="text-muted-foreground">—</span>
                  <div className="relative">
                    <Sunset className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                    <input
                      type="time"
                      value={day.closeTime}
                      onChange={e => updateDay(i, { closeTime: e.target.value })}
                      className="w-28 bg-surface border border-surface-border rounded-lg px-8 py-2 text-xs font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground font-medium">Closed</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Schedule'}
      </Button>
    </div>
  );
}
