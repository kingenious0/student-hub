'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageCircle,
  Tag,
  Eye,
  Calendar,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { SkeletonDetail } from '@/components/ui/Skeleton'

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
  user: { id: string; name: string | null }
  viewCount: number
  createdAt: string
}

export default function ServiceDetailPage() {
  const { id } = useParams()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    async function fetchService() {
      try {
        const res = await fetch(`/api/services/${id}`)
        const data = await res.json()
        setService(data.service)
      } catch {
        setService(null)
      } finally {
        setLoading(false)
      }
    }
    fetchService()
  }, [id])

  if (loading) {
    return <SkeletonDetail />
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Tag className="w-12 h-12 text-muted-foreground/40" />
        <h2 className="text-xl font-bold">Service not found</h2>
        <Link href="/services" className="text-sm text-primary hover:underline">
          Browse services
        </Link>
      </div>
    )
  }

  const handleCall = () => {
    window.location.href = `tel:${service.contactPhone}`
  }

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi! I'm interested in your service "${service.title}" listed on OMNI.`
    )
    const phone = (service.contactWhatsApp || service.contactPhone).replace(/[^0-9]/g, '')
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-3 space-y-3">
            <div className="relative aspect-[4/3] bg-muted rounded-2xl overflow-hidden">
              {service.images[currentImage] ? (
                <Image
                  src={service.images[currentImage]}
                  alt={service.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                  <Tag className="w-20 h-20" />
                </div>
              )}

              {service.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((p) => Math.max(0, p - 1))}
                    disabled={currentImage === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((p) => Math.min(service.images.length - 1, p + 1))}
                    disabled={currentImage === service.images.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {service.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImage(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === currentImage ? 'bg-white' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {service.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {service.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === currentImage
                        ? 'border-primary'
                        : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <Image
                      src={img}
                      alt=""
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {service.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  {service.viewCount}
                </span>
              </div>
              <h1 className="text-2xl font-black leading-tight">{service.title}</h1>
            </div>

            {/* Price */}
            {service.price ? (
              <div>
                <span className="text-3xl font-black text-primary">
                  ₵{service.price.toFixed(2)}
                </span>
                {service.priceLabel && (
                  <span className="text-sm text-muted-foreground ml-1">
                    {service.priceLabel}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-lg font-bold text-muted-foreground">
                Price Negotiable
              </div>
            )}

            {/* Location */}
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <span className="font-medium">{service.town}, {service.region}</span>
                {service.locationNote && (
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {service.locationNote}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCall}
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3"
              >
                <Phone className="w-4 h-4" />
                Call {service.contactPhone}
              </button>
              <button
                onClick={handleWhatsApp}
                className="w-full h-12 bg-[#25D366] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
            </div>

            {/* Meta */}
            <div className="space-y-2 text-sm text-muted-foreground border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Listed by {service.user.name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(service.createdAt).toLocaleDateString('en-GH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-border pt-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
                About this service
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
