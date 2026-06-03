"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  User, Mail, Phone, MapPin, Calendar, Shield, Star, Package,
  ShoppingBag, TrendingUp, Edit2, Camera, Settings, LogOut,
  BadgeCheck, Clock, Heart, ChevronRight
} from "lucide-react"
import { motion } from "framer-motion"

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteItems: 0,
    memberSince: ""
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserData()
    }
  }, [isLoaded, user])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/users/me")
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
        setStats({
          totalOrders: 0,
          totalSpent: 0,
          favoriteItems: 0,
          memberSince: new Date(data.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
          })
        })
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    router.push("/sign-in")
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Banner */}
      <div className="relative bg-surface border-b border-surface-border">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
          <div className="flex items-end gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl border-2 border-surface-border bg-surface overflow-hidden shadow-lg">
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt={user.fullName || "Profile"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary text-4xl font-black">
                    {user.firstName?.[0] || user.emailAddresses[0].emailAddress[0].toUpperCase()}
                  </div>
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 w-9 h-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-90 transition shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground">
                  {user.fullName || user.firstName || "User"}
                </h1>
                {userData?.securitySetupComplete && (
                  <span className="flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-primary/20">
                    <BadgeCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground/60 font-bold">{user.primaryEmailAddress?.emailAddress}</p>
              {userData?.university && (
                <p className="text-xs text-foreground/40 font-bold mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {userData.university}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pb-2">
              <Link href="/settings">
                <button className="px-5 py-2.5 bg-surface text-foreground rounded-xl border border-surface-border font-black text-[10px] uppercase tracking-widest hover:bg-foreground/5 transition flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
              </Link>
              <Link href="/security-setup">
                <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  Security
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Info */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface rounded-2xl p-5 border border-surface-border"
              >
                <Package className="w-6 h-6 text-primary mb-3" />
                <p className="text-2xl font-black text-foreground">{stats.totalOrders}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mt-1">Orders</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-surface rounded-2xl p-5 border border-surface-border"
              >
                <Heart className="w-6 h-6 text-primary mb-3" />
                <p className="text-2xl font-black text-foreground">{stats.favoriteItems}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mt-1">Favorites</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-surface rounded-2xl p-5 border border-surface-border"
              >
                <TrendingUp className="w-6 h-6 text-primary mb-3" />
                <p className="text-2xl font-black text-foreground">GH₵{stats.totalSpent.toFixed(2)}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mt-1">Spent</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-surface rounded-2xl p-5 border border-surface-border"
              >
                <Star className="w-6 h-6 text-primary mb-3" />
                <p className="text-2xl font-black text-foreground">4.8</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mt-1">Rating</p>
              </motion.div>
            </div>

            {/* Account Info Card */}
            <div className="bg-surface rounded-2xl p-6 border border-surface-border">
              <h3 className="text-base font-black uppercase tracking-tight text-foreground mb-5 flex items-center gap-2">
                <User className="w-4 h-4 text-foreground/60" />
                Account Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-foreground/40 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Email</p>
                    <p className="text-sm font-bold text-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                  </div>
                </div>

                {userData?.phoneNumber && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-foreground/40 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Phone</p>
                      <p className="text-sm font-bold text-foreground">{userData.phoneNumber}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-foreground/40 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Campus</p>
                    <p className="text-sm font-bold text-foreground">{userData?.university || "Not set"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-foreground/40 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Member Since</p>
                    <p className="text-sm font-bold text-foreground">{stats.memberSince}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-foreground/40 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Security</p>
                    <p className="text-sm font-bold text-foreground flex items-center gap-2">
                      {userData?.securitySetupComplete ? (
                        <>
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                          Protected
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-destructive rounded-full"></span>
                          Setup Required
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Warning */}
            {!userData?.securitySetupComplete && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Shield className="w-5 h-5 text-destructive" />
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-destructive">Secure Your Account</h3>
                    <p className="text-xs font-bold text-destructive/70 mt-1">
                      Face recognition & 2FA not enabled
                    </p>
                  </div>
                </div>
                <Link href="/security-setup">
                  <button className="w-full py-3 bg-destructive text-destructive-foreground rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition">
                    Setup Now
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Right Column - Activity & Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-surface rounded-2xl p-6 border border-surface-border">
              <h3 className="text-base font-black uppercase tracking-tight text-foreground mb-5">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link href="/orders">
                  <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface border border-surface-border hover:border-primary/30 transition">
                    <Package className="w-6 h-6 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Orders</span>
                  </button>
                </Link>

                <Link href="/wishlist">
                  <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface border border-surface-border hover:border-primary/30 transition">
                    <Heart className="w-6 h-6 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Wishlist</span>
                  </button>
                </Link>

                <Link href="/">
                  <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface border border-surface-border hover:border-primary/30 transition">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Shop</span>
                  </button>
                </Link>

                <Link href="/settings">
                  <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface border border-surface-border hover:border-primary/30 transition">
                    <Settings className="w-6 h-6 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Settings</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-surface rounded-2xl p-6 border border-surface-border">
              <h3 className="text-base font-black uppercase tracking-tight text-foreground mb-5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-foreground/60" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-foreground/5 rounded-xl">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">No recent activity</p>
                    <p className="text-xs text-foreground/50 font-bold mt-1">Your purchases will appear here</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Role */}
            {userData?.role && (
              <div className="bg-surface border border-primary/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Account Type</p>
                  <p className="text-2xl font-black uppercase tracking-tight text-foreground">{userData.role}</p>
                  {userData.role === "STUDENT" && (
                    <Link href="/apply-vendor">
                      <button className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition">
                        Become a Vendor
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Sign Out */}
            <div className="text-center pt-4">
              <button
                onClick={() => router.push("/sign-out")}
                className="px-6 py-3 text-foreground/40 hover:text-destructive font-black text-[10px] uppercase tracking-widest transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
