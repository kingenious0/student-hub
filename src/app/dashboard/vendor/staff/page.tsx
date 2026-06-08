'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import GoBack from '@/components/navigation/GoBack';
import { UserPlus, Trash2, Shield, ChefHat, CreditCard } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  pin: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  MANAGER: <Shield className="w-4 h-4" />,
  KITCHEN: <ChefHat className="w-4 h-4" />,
  CASHIER: <CreditCard className="w-4 h-4" />,
};

export default function StaffPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<'MANAGER' | 'KITCHEN' | 'CASHIER'>('KITCHEN');
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/vendor/staff', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || []);
      }
    } catch { /* noop */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4 || pin.length > 6) {
      toast.error('PIN must be 4-6 digits');
      return;
    }
    setSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/vendor/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, pin, role }),
      });
      if (res.ok) {
        toast.success(`${name} added as ${role}`);
        setShowForm(false);
        setName('');
        setPin('');
        fetchStaff();
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to add staff');
      }
    } catch { toast.error('Network error'); } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/vendor/staff?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Staff removed');
        fetchStaff();
      }
    } catch { toast.error('Failed to remove'); }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/vendor/staff`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, isActive: active }),
      });
      if (res.ok) fetchStaff();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <GoBack fallback="/dashboard/vendor" />
          <h1 className="text-2xl font-bold tracking-tight mt-2">Staff</h1>
          <p className="text-muted-foreground text-sm">Manage PIN-based staff accounts.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <UserPlus className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Staff Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. John" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">PIN (4-6 digits)</label>
                <Input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} maxLength={6} required placeholder="e.g. 1234" type="password" inputMode="numeric" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</label>
                <div className="flex gap-2 mt-1">
                  {(['MANAGER', 'KITCHEN', 'CASHIER'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        role === r ? 'bg-primary text-black' : 'bg-surface border border-surface-border text-foreground/60'
                      }`}
                    >
                      {ROLE_ICONS[r]}
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Staff'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : staff.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            No staff added yet. Add your first staff member to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {staff.map(m => (
            <Card key={m.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {ROLE_ICONS[m.role]}
                  </div>
                  <div>
                    <p className="font-bold">{m.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px]">{m.role}</Badge>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {m.lastLoginAt ? `Last login: ${new Date(m.lastLoginAt).toLocaleDateString()}` : 'Never logged in'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(m.id, !m.isActive)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      m.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}
                  >
                    {m.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    aria-label="Delete staff"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
