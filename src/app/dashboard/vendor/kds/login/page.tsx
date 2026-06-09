'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ChefHat, ArrowLeft, AlertCircle } from 'lucide-react';

export default function KDSLoginPage() {
  const router = useRouter();
  const { user } = useUser();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleDigit = (d: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + d);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleSubmit = async () => {
    if (pin.length < 4) {
      setError('PIN must be 4-6 digits');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/vendor/staff/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const session = {
          staffId: data.staff.id,
          staffName: data.staff.name,
          role: data.staff.role,
          vendorId: data.vendor.id,
          shopName: data.vendor.shopName,
          loggedInAt: Date.now(),
        };
        localStorage.setItem('kds_staff_session', JSON.stringify(session));
        router.push('/dashboard/vendor/kds');
      } else {
        setError(data.error || 'Invalid PIN');
        setPin('');
      }
    } catch {
      setError('Connection error. Try again.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const dots = [0, 1, 2, 3, 4, 5];
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 select-none">
      {/* Header */}
      <div className="w-full max-w-md mb-8">
        <Link
          href="/dashboard/vendor"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center">
          <ChefHat className="w-8 h-8 text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">KITCHEN</h1>
          {user && (
            <p className="text-xs text-zinc-500">
              {user.fullName || 'Vendor'}
            </p>
          )}
        </div>
      </div>

      {/* PIN Display */}
      <div className="mb-8">
        <p className="text-center text-xs text-zinc-500 uppercase tracking-widest font-bold mb-4">
          Staff PIN
        </p>
        <div className="flex gap-4 justify-center">
          {dots.map((i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full border-2 transition-all duration-150 ${
                pin[i]
                  ? 'bg-emerald-400 border-emerald-400 scale-110'
                  : 'border-zinc-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 mb-6 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Keypad */}
      <div className="w-full max-w-xs">
        {keys.map((row, ri) => (
          <div key={ri} className="flex gap-3 mb-3">
            {row.map((k) => (
              <button
                key={k}
                onClick={() => handleDigit(k)}
                disabled={pin.length >= 6 || loading}
                className="flex-1 aspect-square bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 disabled:opacity-30 rounded-2xl text-3xl font-bold text-white transition-all"
              >
                {k}
              </button>
            ))}
          </div>
        ))}
        <div className="flex gap-3">
          <button
            onClick={handleClear}
            disabled={pin.length === 0 || loading}
            className="flex-1 py-5 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 disabled:opacity-30 rounded-2xl text-sm font-bold text-zinc-400 transition-all"
          >
            Clear
          </button>
          <button
            onClick={() => handleDigit('0')}
            disabled={pin.length >= 6 || loading}
            className="flex-1 aspect-square bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 disabled:opacity-30 rounded-2xl text-3xl font-bold text-white transition-all"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            disabled={pin.length === 0 || loading}
            className="flex-1 py-5 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 disabled:opacity-30 rounded-2xl text-sm font-bold text-zinc-400 transition-all"
          >
            ⌫
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={pin.length < 4 || loading}
        className="mt-8 w-full max-w-xs py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-2xl font-black text-lg tracking-wider transition-all active:scale-[0.98] disabled:active:scale-100"
      >
        {loading ? 'Verifying...' : 'Enter Kitchen'}
      </button>

      <p className="mt-6 text-[10px] text-zinc-600 text-center max-w-xs leading-relaxed">
        Enter your 4-6 digit staff PIN to access the Kitchen Display System.
        Ask your manager if you don't have one.
      </p>
    </div>
  );
}
