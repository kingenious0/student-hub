'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import {
  ArrowLeft,
  Loader2,
  Upload,
  X,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Tag,
  ImagePlus
} from 'lucide-react'
import Link from 'next/link'
import { getRegions, getTowns, serviceCategories } from '@/lib/data/ghana-locations'
import { toast } from 'sonner'

const MAX_IMAGES = 5

export default function NewServicePage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewUrlsRef = useRef<string[]>([])

  useEffect(() => {
    const urls = previewUrlsRef.current
    return () => {
      urls.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      })
    }
  }, [])

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    priceLabel: '',
    contactPhone: '',
    contactWhatsApp: '',
    region: '',
    town: '',
    locationNote: '',
    category: '',
    customCategory: '',
  })

  const towns = form.region ? getTowns(form.region) : []

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    const remaining = MAX_IMAGES - files.length
    const toAdd = selected.slice(0, remaining)

    const newFiles = [...files, ...toAdd]
    setFiles(newFiles)

    const newPreviews = toAdd.map((f) => {
      const url = URL.createObjectURL(f)
      previewUrlsRef.current.push(url)
      return url
    })
    setPreviews([...previews, ...newPreviews])

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    const removed = previews[index]
    if (removed?.startsWith('blob:')) {
      URL.revokeObjectURL(removed)
      previewUrlsRef.current = previewUrlsRef.current.filter((u) => u !== removed)
    }
    setFiles(files.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = []
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) urls.push(data.url)
    }
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.description.trim()) { toast.error('Description is required'); return }
    if (!form.contactPhone.trim()) { toast.error('Contact phone is required'); return }
    if (!form.region) { toast.error('Region is required'); return }
    if (!form.town) { toast.error('Town is required'); return }
    const category = form.category === 'Other' ? form.customCategory : form.category
    if (!category?.trim()) { toast.error('Category is required'); return }

    setLoading(true)
    try {
      const images = await uploadImages()

      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: form.price ? parseFloat(form.price) : null,
          priceLabel: form.priceLabel || null,
          contactPhone: form.contactPhone,
          contactWhatsApp: form.contactWhatsApp || null,
          region: form.region,
          town: form.town,
          locationNote: form.locationNote || null,
          images,
          category: category.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create')

      toast.success('Service listed successfully!')
      router.push(`/services/${data.service.id}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>

        <h1 className="text-2xl font-black uppercase tracking-tight mb-8">
          List a Service
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Photos (up to {MAX_IMAGES})
            </label>
            <div className="grid grid-cols-5 gap-2">
              {previews.map((preview, i) => (
                <div
                  key={preview}
                  className="relative aspect-square bg-surface border border-border rounded-lg overflow-hidden group"
                >
                  <img
                    src={preview}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {i === 0 && (
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-[8px] font-black uppercase text-white rounded">
                      Cover
                    </div>
                  )}
                </div>
              ))}
              {files.length < MAX_IMAGES && (
                <label className="aspect-square bg-surface border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 transition-colors">
                  <ImagePlus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-bold">
                    Add
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. Affordable Math Tutoring"
              className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe what you offer, experience, availability..."
              rows={4}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              maxLength={2000}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select a category</option>
              {serviceCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {form.category === 'Other' && (
              <input
                type="text"
                value={form.customCategory}
                onChange={(e) => updateField('customCategory', e.target.value)}
                placeholder="Enter your category"
                className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mt-2"
              />
            )}
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Price (₵)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                placeholder="0.00"
                className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Price Label
              </label>
              <select
                value={form.priceLabel}
                onChange={(e) => updateField('priceLabel', e.target.value)}
                className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">None</option>
                <option value="per hour">Per Hour</option>
                <option value="per session">Per Session</option>
                <option value="fixed">Fixed Price</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">
                <Phone className="w-3 h-3 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={(e) => updateField('contactPhone', e.target.value)}
                placeholder="+233 XX XXX XXXX"
                className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">
                <MessageCircle className="w-3 h-3 inline mr-1" />
                WhatsApp (optional)
              </label>
              <input
                type="tel"
                value={form.contactWhatsApp}
                onChange={(e) => updateField('contactWhatsApp', e.target.value)}
                placeholder="Same as phone if empty"
                className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground block">
              <MapPin className="w-3 h-3 inline mr-1" />
              Location
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={form.region}
                onChange={(e) => { updateField('region', e.target.value); updateField('town', '') }}
                className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select Region</option>
                {getRegions().map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <div className="relative">
                <select
                  value={form.town}
                  onChange={(e) => updateField('town', e.target.value)}
                  disabled={!form.region}
                  className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 appearance-none"
                >
                  <option value="">Select Town</option>
                  {towns.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {form.region && !towns.length && (
                  <input
                    type="text"
                    value={form.town}
                    onChange={(e) => updateField('town', e.target.value)}
                    placeholder="Enter your town"
                    className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                )}
              </div>
            </div>
            <input
              type="text"
              value={form.locationNote}
              onChange={(e) => updateField('locationNote', e.target.value)}
              placeholder="Extra location details (e.g. Near the science block)"
              className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Listing'
            )}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            By publishing, you agree to our Terms of Service. V1 listings are free.
          </p>
        </form>
      </div>
    </div>
  )
}
