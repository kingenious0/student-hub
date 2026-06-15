'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { SignedIn, useUser } from '@clerk/nextjs'
import Image from 'next/image'
import {
  Search,
  MapPin,
  Tag,
  Plus,
  SlidersHorizontal,
  FolderLock
} from 'lucide-react'
import { getRegions, getTowns, serviceCategories } from '@/lib/data/ghana-locations'
import { SkeletonGrid } from '@/components/ui/Skeleton'

interface Service {
  id: string
  title: string
  description: string
  price: number | null
  priceLabel: string | null
  contactPhone: string
  contactWhatsApp: string | null
  region: string
  town: string
  locationNote: string | null
  images: string[]
  category: string
  status: string
  user: { id: string; name: string | null }
  viewCount: number
  createdAt: string
}

export default function ServicesPage() {
  const { user: clerkUser } = useUser()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [region, setRegion] = useState('')
  const [town, setTown] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [viewTab, setViewTab] = useState<'all' | 'my'>('all')

  const towns = region ? getTowns(region) : []

  useEffect(() => {
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setCurrentUser(data)
        }
      })
      .catch(err => console.error('Failed to fetch user me profile:', err))
  }, [])

  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      if (region) params.set('region', region)
      if (town) params.set('town', town)

      const res = await fetch(`/api/services?${params.toString()}`)
      const data = await res.json()
      setServices(data.services || [])
    } catch {
      setServices([])
    } finally {
      setLoading(false)
    }
  }, [search, category, region, town])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const clearFilters = () => {
    setCategory('')
    setRegion('')
    setTown('')
    setSearch('')
  }

  const hasFilters = category || region || town || search

  // Filter services on the client side if "My Services" is selected
  const displayedServices = viewTab === 'my'
    ? services.filter(s => currentUser && s.user.id === currentUser.id)
    : services

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Services</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Find student services near you
            </p>
          </div>
          <SignedIn>
            <Link
              href="/services/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" />
              List a Service
            </Link>
          </SignedIn>
        </div>

        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 h-11 rounded-xl border text-sm font-bold transition-colors ${
              showFilters || hasFilters
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-surface border-border hover:border-primary/50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && (
              <span className="w-2 h-2 rounded-full bg-current" />
            )}
          </button>
        </div>

        {/* View Tabs */}
        {currentUser && (
          <div className="flex gap-2 p-1 bg-surface border border-border rounded-xl mb-6 max-w-xs">
            <button
              onClick={() => setViewTab('all')}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                viewTab === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Services
            </button>
            <button
              onClick={() => setViewTab('my')}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                viewTab === 'my'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              My Services
            </button>
          </div>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-surface border border-border rounded-xl p-4 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Filters</h3>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Categories</option>
                {serviceCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Region */}
              <select
                value={region}
                onChange={(e) => { setRegion(e.target.value); setTown('') }}
                className="h-10 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Regions</option>
                {getRegions().map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {/* Town */}
              <select
                value={town}
                onChange={(e) => setTown(e.target.value)}
                disabled={!region}
                className="h-10 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              >
                <option value="">All Towns</option>
                {towns.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <SkeletonGrid count={8} />
        ) : displayedServices.length === 0 ? (
          <div className="text-center py-20 bg-surface/30 rounded-2xl border border-white/5 p-12">
            <FolderLock className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-bold mb-1">No services found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {viewTab === 'my' 
                ? "You haven't listed any services yet." 
                : hasFilters ? 'Try adjusting your filters' : 'Be the first to list a service!'}
            </p>
            {(!hasFilters || viewTab === 'my') && (
              <SignedIn>
                <Link
                  href="/services/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest"
                >
                  <Plus className="w-4 h-4" />
                  List a Service
                </Link>
              </SignedIn>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedServices.map((service) => {
              const isOwner = currentUser && service.user?.id === currentUser.id
              return (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className={`group bg-surface border rounded-xl overflow-hidden hover:shadow-lg transition-all relative ${
                    isOwner
                      ? 'border-emerald-500/50 shadow-md shadow-emerald-500/5 bg-emerald-500/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    {isOwner && (
                      <span className="absolute top-2 left-2 z-10 text-[8px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                        Your Listing
                      </span>
                    )}
                    {service.images[0] ? (
                      <Image
                        src={service.images[0]}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                        <Tag className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm leading-tight line-clamp-1">
                        {service.title}
                      </h3>
                      <span className="shrink-0 text-[10px] font-black uppercase text-primary/60 bg-primary/10 px-2 py-0.5 rounded-full">
                        {service.category}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {service.town}, {service.region}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {service.price ? (
                        <span className="font-black text-sm">
                          ₵{service.price.toFixed(2)}
                          {service.priceLabel && (
                            <span className="text-xs text-muted-foreground font-normal">
                              {' '}{service.priceLabel}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">
                          Price Negotiable
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {isOwner ? 'You' : service.user?.name || 'Student'}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
