'use client';

import dynamic from 'next/dynamic';

const KDSView = dynamic(() => import('@/components/vendor/KDSView'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function KDSPage() {
  return <KDSView />;
}
