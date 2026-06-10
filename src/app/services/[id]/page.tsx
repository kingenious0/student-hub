'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  ChevronRight,
  Edit2,
  Trash2,
  X,
  Upload,
  ImagePlus
} from 'lucide-react'
import { SkeletonDetail } from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import { getRegions, getTowns, serviceCategories } from '@/lib/data/ghana-locations'

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
  const router = useRouter()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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

  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Fetch Service details
        const res = await fetch(`/api/services/${id}`)
        const data = await res.json()
        setService(data.service)
        
        if (data.service) {
          setForm({
            title: data.service.title,
            description: data.service.description,
            price: data.service.price ? String(data.service.price) : '',
            priceLabel: data.service.priceLabel || '',
            contactPhone: data.service.contactPhone,
            contactWhatsApp: data.service.contactWhatsApp || '',
            region: data.service.region,
            town: data.service.town,
            locationNote: data.service.locationNote || '',
            category: serviceCategories.includes(data.service.category) ? data.service.category : 'Other',
            customCategory: serviceCategories.includes(data.service.category) ? '' : data.service.category,
          })
          setPreviews(data.service.images || [])
        }

        // Fetch User profile
        const userRes = await fetch('/api/users/me')
        const userData = await userRes.json()
        if (userData && userData.id) {
          setCurrentUser(userData)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [id])

  const handleCall = () => {
    if (!service) return
    window.location.href = `tel:${service.contactPhone}`
  }

  const handleWhatsApp = () => {
    if (!service) return
    const msg = encodeURIComponent(
      `Hi! I'm interested in your service "${service.title}" listed on LaHustle.`
    )
    const phone = (service.contactWhatsApp || service.contactPhone).replace(/[^0-9]/g, '')
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this listing permanently?')
    if (!confirmDelete) return

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success('Listing deleted successfully')
        router.push('/services')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to delete listing')
      }
    } catch {
      toast.error('An error occurred while deleting the listing')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    const remaining = 5 - previews.length
    const toAdd = selected.slice(0, remaining)

    const newFiles = [...files, ...toAdd]
    setFiles(newFiles)

    const newPreviews = toAdd.map((f) => URL.createObjectURL(f))
    setPreviews([...previews, ...newPreviews])

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    const previewToRemove = previews[index]
    
    // If it was a newly selected file blob, remove it from files array
    if (previewToRemove.startsWith('blob:')) {
      const blobIndex = previews.filter((p, idx) => idx < index && p.startsWith('blob:')).length
      setFiles(files.filter((_, idx) => idx !== blobIndex))
    }
    
    setPreviews(previews.filter((_, idx) => idx !== index))
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.description.trim()) { toast.error('Description is required'); return }
    if (!form.contactPhone.trim()) { toast.error('Contact phone is required'); return }
    if (!form.region) { toast.error('Region is required'); return }
    if (!form.town) { toast.error('Town is required'); return }
    const category = form.category === 'Other' ? form.customCategory : form.category
    if (!category?.trim()) { toast.error('Category is required'); return }

    setEditLoading(true)
    try {
      // 1. Upload any new images
      const uploadedUrls = await uploadImages()
      
      // 2. Combine remaining existing images with newly uploaded URLs
      const existingUrls = previews.filter(p => !p.startsWith('blob:'))
      const finalImages = [...existingUrls, ...uploadedUrls]

      const res = await fetch(`/api/services/${id}`, {
        method: 'PATCH',
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
          images: finalImages,
          category: category.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update service listing')

      toast.success('Listing updated successfully!')
      setService(data.service)
      setIsEditing(false)
      setCurrentImage(0)
      setFiles([])
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setEditLoading(false)
    }
  }

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

  const isOwner = currentUser && service.user?.id === currentUser.id
  const towns = form.region ? getTowns(form.region) : []

  if (isEditing) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <button
            onClick={() => setIsEditing(false)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel Editing
          </button>

          <h1 className="text-2xl font-black uppercase tracking-tight mb-8">
            Edit Service Listing
          </h1>

          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Photos */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Photos (up to 5)
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
                {previews.length < 5 && (
                  <label className="aspect-square bg-surface border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 transition-colors">
                    <ImagePlus className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-bold">Add</span>
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
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Professional Coding Services"
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
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your service..."
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
                onChange={(e) => setForm({ ...form, category: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
                  placeholder="Enter your custom category"
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
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, priceLabel: e.target.value })}
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  placeholder="+233 XX XXX XXXX"
                  className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  WhatsApp (optional)
                </label>
                <input
                  type="tel"
                  value={form.contactWhatsApp}
                  onChange={(e) => setForm({ ...form, contactWhatsApp: e.target.value })}
                  placeholder="Same as phone if empty"
                  className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground block">
                Location
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value, town: '' })}
                  className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select Region</option>
                  {getRegions().map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                <select
                  value={form.town}
                  onChange={(e) => setForm({ ...form, town: e.target.value })}
                  disabled={!form.region}
                  className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                >
                  <option value="">Select Town</option>
                  {towns.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={form.locationNote}
                onChange={(e) => setForm({ ...form, locationNote: e.target.value })}
                placeholder="Extra location details (e.g. Hostel name)"
                className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <button
              type="submit"
              disabled={editLoading}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {editLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Top actions */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
          
          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Listing
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-3 space-y-3">
            <div className="relative aspect-[4/3] bg-muted rounded-2xl overflow-hidden border border-border">
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
                {isOwner && (
                  <span className="text-[9px] font-black uppercase bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm ml-auto">
                    Your Listing
                  </span>
                )}
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
                <span>Listed by {isOwner ? 'You' : service.user?.name || 'Anonymous'}</span>
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
