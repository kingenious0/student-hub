"use client"

import { useState, useEffect } from "react"
import { useCartStore } from "@/lib/store/cart"
import { useUser, useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useModal } from "@/context/ModalContext"

export function useCartCheckout() {
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCartStore()
  const modal = useModal()
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"delivery" | "pickup">("delivery")
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [manualEmail, setManualEmail] = useState("")
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [tempEmailInput, setTempEmailInput] = useState("")
  const [isHybridAuth, setIsHybridAuth] = useState(false)
  const [hybridClerkId, setHybridClerkId] = useState<string | null>(null)

  // Guest Checkout States
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [guestName, setGuestName] = useState("")
  const [guestPhone, setGuestPhone] = useState("")


  // Coupon Engine States
  const [couponCodeInput, setCouponCodeInput] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; discountAmount: number } | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)

  const [deliveryFeeConfig, setDeliveryFeeConfig] = useState(10)
  const [platformFeeConfig, setPlatformFeeConfig] = useState(2)
  const [paystackPublicKey, setPaystackPublicKey] = useState(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "")

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/system/config")
        const data = await res.json()
        if (data.success) {
          setDeliveryFeeConfig(data.deliveryFee ?? 10.00)
          setPlatformFeeConfig(data.platformFee ?? 2.00)
          if (data.paystackPublicKey) {
            setPaystackPublicKey(data.paystackPublicKey)
          }
        }
      } catch (e) {
        console.error("Failed to fetch fees", e)
      }
    }
    fetchSettings()

    if (typeof window !== "undefined") {
      const isVerified = document.cookie.split("; ").some(c => c.startsWith("LH_IDENTITY_VERIFIED=TRUE"))
      const syncId = document.cookie.split("; ").find(c => c.trim().startsWith("LH_HYBRID_SYNCED="))?.split("=")[1]
      if (isVerified) {
        setIsHybridAuth(true)
        if (syncId) setHybridClerkId(syncId)
      }
    }
  }, [])

  const subtotal = getCartTotal()
  const deliveryFee = items.length > 0 ? (fulfillmentMethod === "delivery" ? deliveryFeeConfig : 0.00) : 0
  const platformFee = items.length > 0 ? platformFeeConfig : 0.00
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0
  const total = Math.max(0, subtotal - discount + deliveryFee + platformFee)

  const handleApplyCoupon = async (code: string) => {
    if (!code.trim()) return
    setIsValidatingCoupon(true)
    setCouponError(null)
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code.trim().toUpperCase())}&subtotal=${subtotal}`)
      const data = await res.json()
      if (data.success) {
        setAppliedCoupon({
          id: data.couponId,
          code: data.code,
          discountAmount: data.discountAmount
        })
        setCouponError(null)
      } else {
        setCouponError(data.error || "Invalid coupon code")
        setAppliedCoupon(null)
      }
    } catch (e) {
      console.error(e)
      setCouponError("Connection error. Try again.")
      setAppliedCoupon(null)
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCodeInput("")
    setCouponError(null)
  }

  const handleCheckout = async (guestData?: { name: string; phone: string }) => {
    if (items.length === 0) return

    if (!isLoaded) {
      modal.alert("Checking authorization session...", "Please Wait");
      return;
    }

    let isGuest = false
    let checkoutGuestInfo = guestData

    if (!user && !isHybridAuth) {
      if (!checkoutGuestInfo) {
        setShowGuestModal(true)
        return
      }
      isGuest = true
    }

    let userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || manualEmail

    if (!userEmail && isHybridAuth && hybridClerkId) {
      try {
        const res = await fetch(`/api/users/me?clerkId=${hybridClerkId}`)
        const data = await res.json()
        if (data.success && data.user?.email) {
          userEmail = data.user.email
          setManualEmail(userEmail)
        }
      } catch (e) {
        console.error("Hybrid Email Fetch Failed", e)
      }
    }

    if (!userEmail && !isGuest) {
      setShowEmailModal(true)
      return
    }

    const PaystackPop = (window as unknown as { PaystackPop: { setup: (options: unknown) => { openIframe: () => void } } }).PaystackPop
    if (!PaystackPop) {
      modal.alert("Payment system loading... Please wait or refresh.", "Paystack Loading")
      return
    }

    setIsCreatingOrder(true)

    try {
      const token = await getToken()
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      }
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers,
        body: JSON.stringify({
          items: items.map(i => ({ id: i.id, quantity: i.quantity, selectedModifiers: i.selectedModifiers || [] })),
          fulfillmentType: fulfillmentMethod === "delivery" ? "DELIVERY" : "PICKUP",
          couponCode: appliedCoupon?.code || null,
          ...(isGuest ? { guestInfo: checkoutGuestInfo } : {})
        })
      })

      const data = await res.json()

      if (data.success) {
        const handler = PaystackPop.setup({
          key: paystackPublicKey,
          email: data.email || userEmail || "guest@LaHustle-marketplace.com",
          amount: Math.ceil(total * 100),
          currency: "GHS",
          ref: data.paystackRef,
          metadata: {
            custom_fields: [
              { display_name: "Order ID", variable_name: "order_id", value: data.paystackRef }
            ]
          },
          callback: function (response: { reference: string }) {
            const verifyPayment = async () => {
              try {
                const vRes = await fetch("/api/payments/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ reference: response.reference })
                })
                const vData = await vRes.json()
                if (vData.success) {
                  clearCart()
                  if (isGuest && checkoutGuestInfo) {
                    window.location.href = `/order-success?ref=${response.reference}&phone=${encodeURIComponent(checkoutGuestInfo.phone)}`
                  } else {
                    window.location.href = "/orders?success=true"
                  }
                } else {
                  modal.alert(`Verification failed: ${vData.error || "Unknown error"}`, "Payment Error", "error")
                  setIsCreatingOrder(false)
                }
              } catch (e) {
                console.error(e)
                modal.alert("Payment verification connection error.", "System Error", "error")
                setIsCreatingOrder(false)
              }
            }
            verifyPayment()
          },
          onClose: function () {
            setIsCreatingOrder(false)
            modal.alert("Payment cancelled.", "Action Aborted", "info")
          }
        })
        handler.openIframe()
      } else {
        modal.alert(`Order Error: ${data.error}`, "Submission Failed", "error")
        setIsCreatingOrder(false)
      }
    } catch (error) {
      console.error("Checkout Error", error)
      modal.alert("System connection failed.", "Network Error", "error")
      setIsCreatingOrder(false)
    }
  }


  return {
    items,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    clearCart,
    fulfillmentMethod,
    setFulfillmentMethod,
    isCreatingOrder,
    manualEmail,
    setManualEmail,
    showEmailModal,
    setShowEmailModal,
    tempEmailInput,
    setTempEmailInput,
    isHybridAuth,
    hybridClerkId,
    deliveryFeeConfig,
    platformFeeConfig,
    paystackPublicKey,
    subtotal,
    deliveryFee,
    platformFee,
    discount,
    total,
    handleCheckout,
    couponCodeInput,
    setCouponCodeInput,
    appliedCoupon,
    couponError,
    isValidatingCoupon,
    handleApplyCoupon,
    handleRemoveCoupon,
    showGuestModal,
    setShowGuestModal,
    guestName,
    setGuestName,
    guestPhone,
    setGuestPhone
  }
}

