"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  User, Mail, Phone, MapPin, Calendar, Shield, Star, Package, 
  ShoppingBag, TrendingUp, Edit2, Camera, Settings, LogOut,
  BadgeCheck, Clock, Heart
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
        
        // Calculate stats
        setStats({
          totalOrders: 0, // Will be fetched from orders API
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    router.push("/sign-in")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Banner */}
      <div className="relative h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-6xl mx-auto flex items-end gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white overflow-hidden shadow-xl">
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt={user.fullName || "Profile"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white text-4xl font-bold">
                    {user.firstName?.[0] || user.emailAddresses[0].emailAddress[0].toUpperCase()}
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition shadow-lg">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  {user.fullName || user.firstName || "User"}
                </h1>
                {userData?.securitySetupComplete && (
                  <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    <BadgeCheck className="w-4 h-4" />
                    Verified
                  </div>
                )}
              </div>
              <p className="text-blue-100">{user.primaryEmailAddress?.emailAddress}</p>
              {userData?.university && (
                <p className="text-blue-100 mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {userData.university}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pb-4">
              <Link href="/settings">
                <button className="px-6 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </Link>
              <Link href="/security-setup">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Security
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Info */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
              >
                <Package className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Orders</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
              >
                <Heart className="w-8 h-8 text-pink-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.favoriteItems}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Favorites</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
              >
                <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">GH₵{stats.totalSpent.toFixed(2)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
              >
                <Star className="w-8 h-8 text-yellow-600 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">4.8</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
              </motion.div>
            </div>

            {/* Account Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{user.primaryEmailAddress?.emailAddress}</p>
                  </div>
                </div>

                {userData?.phoneNumber && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{userData.phoneNumber}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">University</p>
                    <p className="font-medium text-gray-900 dark:text-white">{userData?.university || "Not set"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                    <p className="font-medium text-gray-900 dark:text-white">{stats.memberSince}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Security Status</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {userData?.securitySetupComplete ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Protected
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          Setup Required
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Card */}
            {!userData?.securitySetupComplete && (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  <div>
                    <h3 className="font-semibold text-orange-900 dark:text-orange-200">Complete Security Setup</h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                      Protect your account with face recognition and 2FA
                    </p>
                  </div>
                </div>
                <Link href="/security-setup">
                  <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold">
                    Setup Now
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Right Column - Activity & Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link href="/orders">
                  <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition">
                    <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">My Orders</span>
                  </button>
                </Link>

                <Link href="/favorites">
                  <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition">
                    <Heart className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Favorites</span>
                  </button>
                </Link>

                <Link href="/marketplace">
                  <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition">
                    <ShoppingBag className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Shop</span>
                  </button>
                </Link>

                <Link href="/settings">
                  <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <Settings className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Settings</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">No recent activity</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your activity will appear here</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Role */}
            {userData?.role && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Account Type</h3>
                <p className="text-2xl font-bold">{userData.role}</p>
                {userData.role === "STUDENT" && (
                  <Link href="/apply-vendor">
                    <button className="mt-4 px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition font-semibold">
                      Become a Vendor
                    </button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
