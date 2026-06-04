'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import dynamic from 'next/dynamic';

const KDSView = dynamic(() => import('@/components/vendor/KDSView'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface StaffSession {
  staffId: string;
  staffName: string;
  role: string;
  vendorId: string;
  shopName: string;
  loggedInAt: number;
}

export default function KDSPage() {
  const router = useRouter();
  const { user } = useUser();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [staffSession, setStaffSession] = useState<StaffSession | null>(null);

  useEffect(() => {
    if (!user) return;

    const raw = localStorage.getItem('kds_staff_session');
    if (raw) {
      try {
        setStaffSession(JSON.parse(raw));
      } catch { /* ignore */ }
    }

    fetch('/api/vendor/tier')
      .then(r => r.json())
      .then(d => {
        if (d.tier === 'GOODS') {
          router.replace('/dashboard/vendor');
        } else {
          setAllowed(true);
        }
      })
      .catch(() => setAllowed(true));
  }, [user, router]);

  if (allowed === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <KDSView staffSession={staffSession} />;
}
