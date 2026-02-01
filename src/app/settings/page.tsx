'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, User, Bell, Palette, Lock, Key, Smartphone, Save, ArrowLeft, Mail, ShoppingBag, Megaphone, Eye, ChevronRight, Fingerprint, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import GoBack from '@/components/navigation/GoBack';
import { useModal } from '@/context/ModalContext';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const modal = useModal();
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'notifications' | 'appearance'>('account');
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [securityStatus, setSecurityStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    university: '',
    phoneNumber: '',
    notifications: {
      emailNotifications: true,
      orderUpdates: true,
      newReleases: true,
      marketingEmails: false,
      securityAlerts: true
    }
  });

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserData();
      fetchSecurityStatus();
    }
  }, [isLoaded, user]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        const notifs = data.notificationSettings || {};
        setFormData({
          name: data.name || user?.fullName || '',
          university: data.university || 'KNUST',
          phoneNumber: data.phoneNumber || '',
          notifications: {
            emailNotifications: notifs.emailNotifications ?? true,
            orderUpdates: notifs.orderUpdates ?? true,
            newReleases: notifs.newReleases ?? true,
            marketingEmails: notifs.marketingEmails ?? false,
            securityAlerts: notifs.securityAlerts ?? true
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityStatus = async () => {
    try {
      const response = await fetch('/api/security/status');
      if (response.ok) {
        const data = await response.json();
        setSecurityStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch security status:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/users/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Settings synchronized with OMNI Cloud');
        // No need to fetch immediately if we want to avoid flicker/reset
        // But updating cached data is good
        const data = await response.json();
        if (data.user) setUserData(data.user);
      } else {
        toast.error('Failed to synchronize settings');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Uplink error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleColorChange = (color: string) => {
    document.documentElement.style.setProperty('--primary', color);
    // Generate a glow color (approximate)
    const glow = color.replace('rgb', 'rgba').replace(')', ', 0.4)');
    document.documentElement.style.setProperty('--primary-glow', glow);
    localStorage.setItem('omni-theme-color', color);
    toast.success(`Visual Matrix Updated to ${color}`);
  };

  useEffect(() => {
    const savedColor = localStorage.getItem('omni-theme-color');
    if (savedColor) {
      document.documentElement.style.setProperty('--primary', savedColor);
      const glow = savedColor.replace('rgb', 'rgba').replace(')', ', 0.4)');
      document.documentElement.style.setProperty('--primary-glow', glow);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-surface-hover border border-white/5 flex items-center justify-center text-4xl overflow-hidden relative group">
                    {user?.imageUrl ? <img src={user.imageUrl} className="w-full h-full object-cover" /> : '👤'}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                        <CameraIcon className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">Account Profile</h2>
                    <p className="text-xs text-foreground/40 font-black uppercase tracking-widest">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-2">Operator Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-surface-hover border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:border-primary/50 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-2">Secure Phone Link</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
                  <input 
                    type="tel" 
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full bg-surface-hover border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:border-primary/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-2">University Sector</label>
                <div className="relative">
                    <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
                    <select 
                        value={formData.university}
                        onChange={(e) => setFormData({...formData, university: e.target.value})}
                        className="w-full bg-surface-hover border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:border-primary/50 outline-none transition-all appearance-none"
                    >
                        <option value="KNUST">KNUST</option>
                        <option value="UG">University of Ghana</option>
                        <option value="UCC">University of Cape Coast</option>
                        <option value="UENR">UENR</option>
                        <option value="UDS">UDS</option>
                        <option value="UEW">UEW</option>
                        <option value="UPSA">UPSA</option>
                    </select>
                </div>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">Security Protocols</h2>
              <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest">Hardening your account access</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <SecurityCard 
                icon={<Fingerprint className="w-6 h-6" />}
                title="Biometric Matrix"
                desc="Fast authentication using Face ID or system biometrics"
                status={securityStatus?.biometricEnabled ? 'ACTIVE' : 'NOT LINKED'}
                active={securityStatus?.biometricEnabled}
                onClick={() => router.push('/security-setup')}
              />
              <SecurityCard 
                icon={<Lock className="w-6 h-6" />}
                title="Two-Factor Link"
                desc="Time-based OTP verification for high-risk operations"
                status={securityStatus?.twoFactorEnabled ? 'ACTIVE' : 'NOT LINKED'}
                active={securityStatus?.twoFactorEnabled}
                onClick={() => router.push('/security-setup')}
              />
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">Communication Grid</h2>
              <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest">Configure signal reception</p>
            </div>

            <div className="space-y-4">
               <GridToggle 
                  title="Mission Updates"
                  desc="Real-time alerts for active orders and delivery status"
                  active={formData.notifications.orderUpdates}
                  onChange={(v) => setFormData({...formData, notifications: {...formData.notifications, orderUpdates: v}})}
               />
               <GridToggle 
                  title="Marketplace Incursions"
                  desc="Notifications for new products and flash sales"
                  active={formData.notifications.newReleases}
                  onChange={(v) => setFormData({...formData, notifications: {...formData.notifications, newReleases: v}})}
               />
               <GridToggle 
                  title="Security Hardening"
                  desc="Alerts for new logins or biometric resets"
                  active={formData.notifications.securityAlerts}
                  onChange={(v) => setFormData({...formData, notifications: {...formData.notifications, securityAlerts: v}})}
               />
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-8">
             <div>
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">Visual Core</h2>
              <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest">Theming and accent overrides</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {['#39FF14', '#FF4B2B', '#7928CA', '#0070F3', '#00DFD8', '#FFD700', '#FF00FF'].map(color => (
                 <button 
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className="aspect-square rounded-3xl border-2 border-white/5 hover:border-primary transition-all flex items-center justify-center p-2 relative group"
                    style={{ background: `${color}10` }}
                 >
                    <div className="w-full h-full rounded-2xl" style={{ border: `2px solid ${color}`, background: color }} />
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </button>
               ))}
            </div>
          </div>
        );
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
            <RefreshCcw className="w-12 h-12 text-primary animate-spin" />
            <p className="text-xs font-black uppercase tracking-[0.4em] animate-pulse">Initializing Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 pb-20 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div className="space-y-4">
            <GoBack fallback="/" />
            <div>
              <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">
                System <span className="text-primary italic">Settings</span>
              </h1>
              <p className="text-xs font-black text-foreground/30 uppercase tracking-[0.3em] mt-2">
                Configuration Terminal • v1.0.4
              </p>
            </div>
          </div>
          
          <button 
                onClick={handleSave}
                disabled={isSaving}
                className="group relative flex items-center justify-center gap-3 bg-primary py-4 px-10 rounded-2xl font-black text-xs uppercase tracking-widest text-primary-foreground omni-glow transition-all active:scale-95 disabled:opacity-50"
            >
                {isSaving ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        <Save className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        Synchronize Settings
                    </>
                )}
            </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Tab Scroller / Desktop Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide sticky top-24">
              <NavTab 
                active={activeTab === 'account'} 
                onClick={() => setActiveTab('account')} 
                icon={<User className="w-5 h-5" />} 
                label="Account" 
              />
              <NavTab 
                active={activeTab === 'security'} 
                onClick={() => setActiveTab('security')} 
                icon={<Lock className="w-5 h-5" />} 
                label="Security" 
              />
              <NavTab 
                active={activeTab === 'notifications'} 
                onClick={() => setActiveTab('notifications')} 
                icon={<Bell className="w-5 h-5" />} 
                label="Alerts" 
              />
              <NavTab 
                active={activeTab === 'appearance'} 
                onClick={() => setActiveTab('appearance')} 
                icon={<Palette className="w-5 h-5" />} 
                label="Visuals" 
              />
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="bg-surface/50 backdrop-blur-3xl rounded-[2.5rem] p-6 sm:p-12 border border-white/5 shadow-2xl min-h-[600px] flex flex-col"
              >
                <div className="flex-1">
                    {renderContent()}
                </div>
                
                {/* Visual Feedback Footer */}
                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Uplink active • Last synced: {new Date().toLocaleTimeString()}
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => router.push('/')}
                            className="text-[10px] font-black text-foreground/40 uppercase tracking-widest hover:text-foreground transition-colors"
                        >
                            Exit Without Saving
                        </button>
                    </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap min-w-fit lg:w-full relative group overflow-hidden ${
        active 
          ? 'bg-primary text-primary-foreground omni-glow shadow-xl shadow-primary/20' 
          : 'text-foreground/40 hover:bg-white/5 hover:text-foreground'
      }`}
    >
      <span className={`transition-transform duration-500 ${active ? 'scale-110 rotate-3' : 'group-hover:scale-110'}`}>{icon}</span>
      {label}
      {active && <ChevronRight className="hidden lg:block w-4 h-4 ml-auto opacity-50" />}
      {active && <motion.div layoutId="tab-glow" className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full" />}
    </button>
  );
}

function SecurityCard({ icon, title, desc, status, active, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group"
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center scale-95 group-hover:scale-100 transition-transform ${active ? 'bg-primary/20 text-primary' : 'bg-white/5 text-foreground/40'}`}>
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-black text-sm uppercase tracking-tight">{title}</h3>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${active ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-foreground/20'}`}>
                        {status}
                    </span>
                </div>
                <p className="text-xs text-foreground/40 font-medium">{desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-foreground/20 group-hover:text-primary transition-colors" />
        </button>
    );
}

function GridToggle({ title, desc, active, onChange }: any) {
    return (
        <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5">
            <div className="flex-1">
                <h3 className="font-black text-sm uppercase tracking-tight mb-1">{title}</h3>
                <p className="text-xs text-foreground/40 font-medium">{desc}</p>
            </div>
            <button 
                onClick={() => onChange(!active)}
                className={`w-12 h-6 rounded-full p-1 transition-colors relative ${active ? 'bg-primary' : 'bg-white/10'}`}
            >
                <motion.div 
                    animate={{ x: active ? 24 : 0 }}
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                />
            </button>
        </div>
    );
}

function CameraIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
    );
}
