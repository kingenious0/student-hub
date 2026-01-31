"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"

interface SecurityStatus {
  has2FA: boolean
  hasBiometric: boolean
  securitySetupComplete: boolean
  needsVerification: boolean
  daysSinceCheck: number
}

export function useSecurityCheck() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSecurity = async () => {
      if (!isLoaded) return
      
      // Skip security check for public routes
      const publicRoutes = ["/", "/sign-in", "/sign-up", "/security-setup"]
      if (publicRoutes.some(route => pathname.startsWith(route))) {
        setLoading(false)
        return
      }
      
      if (!user) {
        router.push("/sign-in")
        return
      }
      
      try {
        const response = await fetch("/api/security/status")
        
        if (response.ok) {
          const data: SecurityStatus = await response.json()
          setSecurityStatus(data)
          
          // Redirect to security setup if not complete
          if (!data.securitySetupComplete) {
            router.push("/security-setup")
            return
          }
          
          // Warn if verification needed (but don't block)
          if (data.needsVerification) {
            console.warn("Security verification recommended")
          }
        }
      } catch (error) {
        console.error("Failed to check security status:", error)
      }
      
      setLoading(false)
    }
    
    checkSecurity()
  }, [user, isLoaded, pathname, router])

  return { securityStatus, loading }
}
