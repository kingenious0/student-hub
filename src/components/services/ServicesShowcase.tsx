'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Tag, MapPin, ArrowRight } from 'lucide-react'
import { Skeleton, SkeletonServiceCard } from '@/components/ui/Skeleton'

interface Service {
  id: string
  title: string
  price: number | null
  priceLabel: string | null
  images: string[]
  category: string
  town: string
  region: string
  user: { id: string; name: string | null }
}

export default function ServicesShowcase() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/services?limit=3')
      .then((res) => res.json())
      .then((data) => setServices(data.services || []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-l-4 border-primary pl-6">
          <div>
            <span className="text-primary text-[10px] font-black uppercase tracking-[0.5em]">
              Student Services
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
              Skills <span className="text-foreground/20">&amp; Help</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-xl">
              Tutoring, repairs, gigs — get help from fellow students on campus.
            </p>
          </div>
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all flex-shrink-0"
          >
            View All Services
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonServiceCard key={i} />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-[2rem] border border-border">
            <Tag className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-bold mb-1">No services yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Be the first student to offer a service!
            </p>
            <Link
              href="/services/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest"
            >
              List Your Service
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="group bg-surface border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
              >
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  {service.images[0] ? (
                    <Image
                      src={service.images[0]}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                      <Tag className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm leading-tight line-clamp-1">
                      {service.title}
                    </h3>
                    <span className="shrink-0 text-[10px] font-black uppercase text-primary/60 bg-primary/10 px-2 py-0.5 rounded-full">
                      {service.category}
                    </span>
                  </div>
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
                      {service.user.name || 'Student'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
