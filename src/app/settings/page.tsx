'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, User, Bell, Palette, Lock, Key, Smartphone, Save, ArrowLeft, Mail, ShoppingBag, Megaphone, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Settings Page - Enhanced with real functionality
 * - Account settings with save capability
 * - Security with 2FA/Biometric integration
 * - Notifications preferences
 * - Appearance customization
 */

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'notifications' | 'appearance'>('account');
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [securityStatus, setSecurityStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Form states
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
        setFormData({
          name: data.name || user?.fullName || '',
          university: data.university || '',
          phoneNumber: data.phoneNumber || '',
          notifications: {
            emailNotifications: true,
            orderUpdates: true,
            newReleases: true,
            marketingEmails: false,
            securityAlerts: true
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
        alert('Settings saved successfully!');
        await fetchUserData();
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          {/* Header */}
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-800 dark:to-black p-6 shadow-xl">
            <div>
              <Link href="/profile" className="flex items-center gap-2 text-gray-300 hover:text-white mb-2 transition">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Profile</span>
              </Link>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="mt-1 text-gray-300">Manage your account preferences</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.fullName}</p>
                <p className="text-xs text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              {user?.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="h-12 w-12 rounded-full border-2 border-white/20"
                />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2 sticky top-8">
              {
              [
                { id: 'account', label: 'Account', icon: User },
                { id: 'security', label: 'Security', icon: Shield },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'appearance', label: 'Appearance', icon: Palette },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full rounded-lg px-4 py-3 text-left font-medium transition-all flex items-center gap-3 ${
                      activeTab === item.id
                        ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-sm"
            >
              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Update your basic account information</p>
                  </div>

                  <div className="space-y-5">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={user?.primaryEmailAddress?.emailAddress || ''}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white"
                        disabled
                      />
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Email is managed through your authentication provider</p>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>

                    {/* University */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">University</label>
                      <select
                        value={formData.university}
                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select your university</option>
                        <option value="KNUST">KNUST</option>
                        <option value="UG">University of Ghana</option>
                        <option value="UCC">University of Cape Coast</option>
                        <option value="UENR">UE</option>
                        <option value="UDS">UDS</option>
                        <option value="UEW">UEW</option>
                        <option value="AAMUSTED">AAMUSTED</option>
                        <option value="UMAT">UMAT</option>
                        <option value="UHAS">UHAS</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+233123456789"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage your account security and authentication</p>
                  </div>

                  <div className="space-y-4">
                    {/* Security Status Overview */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">Security Status</h3>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="flex items-center gap-2">
                              {securityStatus?.has2FA ? (
                                <>
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="text-sm text-gray-700 dark:text-gray-300">2FA Enabled</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                  <span className="text-sm text-gray-700 dark:text-gray-300">2FA Disabled</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {securityStatus?.hasBiometric ? (
                                <>
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="text-sm text-gray-700 dark:text-gray-300">Biometric Active</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                  <span className="text-sm text-gray-700 dark:text-gray-300">Biometric Inactive</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {securityStatus?.has2FA 
                                ? 'Your account is protected with 2FA' 
                                : 'Add an extra layer of security to your account'}
                            </p>
                          </div>
                        </div>
                        <Link href="/security-setup">
                          <button className={`px-4 py-2 rounded-lg font-medium transition ${
                            securityStatus?.has2FA
                              ? 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}>
                            {securityStatus?.has2FA ? 'Manage' : 'Enable 2FA'}
                          </button>
                        </Link>
                      </div>
                    </div>

                    {/* Face Recognition */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Face Recognition</h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {securityStatus?.hasBiometric
                                ? 'Biometric authentication is active'
                                : 'Set up face recognition for secure login'}
                            </p>
                          </div>
                        </div>
                        <Link href="/security-setup">
                          <button className={`px-4 py-2 rounded-lg font-medium transition ${
                            securityStatus?.hasBiometric
                              ? 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}>
                            {securityStatus?.hasBiometric ? 'Manage' : 'Setup Face ID'}
                          </button>
                        </Link>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <Key className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Password</h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              Change your password to keep your account secure
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 font-medium transition">
                          Change Password
                        </button>
                      </div>
                    </div>

                    {/* Last Security Check */}
                    {securityStatus?.lastSecurityCheck && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Last security verification:{' '}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(securityStatus.lastSecurityCheck).toLocaleDateString()}
                          </span>
                        </p>
                        {securityStatus.needsVerification && (
                          <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                            ⚠️ Security re-verification recommended
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Choose what notifications you receive</p>
                  </div>

                  <div className="space-y-4">
                    {
                    [
                      { 
                        key: 'emailNotifications',
                        title: 'Email Notifications', 
                        description: 'Receive email updates about your account',
                        icon: Mail 
                      },
                      { 
                        key: 'orderUpdates',
                        title: 'Order Updates', 
                        description: 'Get notified when your order status changes',
                        icon: Bell 
                      },
                      { 
                        key: 'newReleases',
                        title: 'New Releases', 
                        description: 'Alerts when new products are added to marketplace',
                        icon: ShoppingBag 
                      },
                      { 
                        key: 'marketingEmails',
                        title: 'Marketing & Promotions', 
                        description: 'Promotional offers, deals, and campus news',
                        icon: Megaphone 
                      },
                      { 
                        key: 'securityAlerts',
                        title: 'Security Alerts', 
                        description: 'Important security notifications (recommended)',
                        icon: Shield 
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.key} className="flex items-start justify-between rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-6 hover:shadow-md transition">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                            </div>
                          </div>
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input 
                              type="checkbox" 
                              className="peer sr-only" 
                              checked={formData.notifications[item.key as keyof typeof formData.notifications]}
                              onChange={(e) => setFormData({
                                ...formData,
                                notifications: {
                                  ...formData.notifications,
                                  [item.key]: e.target.checked
                                }
                              })}
                            />
                            <div className="peer h-6 w-11 rounded-full bg-gray-300 dark:bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Preferences
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Customize how Student Hub looks to you</p>
                  </div>

                  <div className="space-y-6">
                    {/* Theme Selection */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Theme Preference</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Select your preferred color scheme</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {
                        [
                          { name: 'Light', icon: '☀️', description: 'Light theme' },
                          { name: 'Dark', icon: '🌙', description: 'Dark theme' },
                          { name: 'System', icon: '💻', description: 'Match system' }
                        ].map((theme) => (
                          <button
                            key={theme.name}
                            className="flex flex-col items-center gap-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-6 text-sm font-medium hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition group"
                          >
                            <span className="text-3xl">{theme.icon}</span>
                            <div className="text-center">
                              <div className="font-semibold text-gray-900 dark:text-white">{theme.name}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{theme.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Accent Color</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Choose your primary accent color</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-4">
                        {
                        [
                          { name: 'Blue', color: 'bg-blue-600', hover: 'hover:ring-blue-600' },
                          { name: 'Purple', color: 'bg-purple-600', hover: 'hover:ring-purple-600' },
                          { name: 'Green', color: 'bg-green-600', hover: 'hover:ring-green-600' },
                          { name: 'Red', color: 'bg-red-600', hover: 'hover:ring-red-600' },
                          { name: 'Orange', color: 'bg-orange-600', hover: 'hover:ring-orange-600' },
                          { name: 'Pink', color: 'bg-pink-600', hover: 'hover:ring-pink-600' },
                          { name: 'Teal', color: 'bg-teal-600', hover: 'hover:ring-teal-600' },
                          { name: 'Indigo', color: 'bg-indigo-600', hover: 'hover:ring-indigo-600' },
                        ].map((colorOption) => (
                          <button
                            key={colorOption.name}
                            className={`group relative h-14 w-14 rounded-full ${colorOption.color} ${colorOption.hover} hover:scale-110 transition-all duration-200 hover:ring-4 ring-offset-2 dark:ring-offset-gray-700 flex items-center justify-center`}
                            title={colorOption.name}
                          >
                            <span className="opacity-0 group-hover:opacity-100 absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap transition-opacity">
                              {colorOption.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Display Options */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Display Options</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Customize your viewing experience</p>
                        </div>
                      </div>
                      <div className="space-y-4 mt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Compact Mode</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Reduce spacing for more content</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input type="checkbox" className="peer sr-only" />
                            <div className="peer h-6 w-11 rounded-full bg-gray-300 dark:bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Animations</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Enable smooth page transitions</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input type="checkbox" className="peer sr-only" defaultChecked />
                            <div className="peer h-6 w-11 rounded-full bg-gray-300 dark:bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 flex gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
                <button 
                  onClick={() => router.push('/profile')}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2.5 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
