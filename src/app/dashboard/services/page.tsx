'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus,
  Loader2,
  MapPin,
  Trash2,
  Eye,
  Tag,
  ArrowLeft,
  ExternalLink,
  AlertCircle
} from 'lucide-react'

interface Service {
  id: string
  title: string
  price: number | null
  priceLabel: string | null
  region: string
  town: string
  images: string[]
  category: string
  status: string
  viewCount: number
  createdAt: string
}

export default function MyServicesPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
      return
    }
    if (!isLoaded) return

    async function fetchMyServices() {
      try {
        const res = await fetch('/api/services/my')
        const data = await res.json()
        setServices(data.services || [])
      } catch {
        setServices([])
      } finally {
        setLoading(false)
      }
    }
    fetchMyServices()
  }, [isLoaded, user, router])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service listing permanently?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setServices((prev) => prev.filter((s) => s.id !== id))
    } catch {
      alert('Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Dashboard
            </Link>
            <h1 className="text-2xl font-black uppercase tracking-tight">
              My Services
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your service listings
            </p>
          </div>
          <Link
            href="/services/new"
            className="inline-flex items-center gap-2 px-4 h-10 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Listing
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-2xl">
            <Tag className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-bold mb-1">No services yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              List your first service to get started
            </p>
            <Link
              href="/services/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" />
              List a Service
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl hover:shadow-sm transition-all"
              >
                {/* Thumb */}
                <div className="w-16 h-16 shrink-0 rounded-lg bg-muted overflow-hidden">
                  {service.images[0] ? (
                    <Image
                      src={service.images[0]}
                      alt={service.title}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <Tag className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm truncate">{service.title}</h3>
                    <span className="text-[10px] font-black uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded-full shrink-0">
                      {service.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {service.town}, {service.region}
                    </span>
                    {service.price && (
                      <span className="font-bold">
                        ₵{service.price.toFixed(2)}
                        {service.priceLabel && ` /${service.priceLabel}`}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {service.viewCount}
                    </span>
                    <span className={`text-[10px] font-black uppercase ${
                      service.status === 'ACTIVE' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/services/${service.id}`}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(service.id)}
                    disabled={deleting === service.id}
                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleting === service.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
