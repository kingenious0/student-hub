"use client"

import { createContext, useContext, useEffect, ReactNode } from "react"
import { useSecurityCheck } from "@/hooks/useSecurityCheck"

interface SecurityContextType {
  securityStatus: any
  loading: boolean
}

const SecurityContext = createContext<SecurityContextType>({
  securityStatus: null,
  loading: true
})

export function SecurityProvider({ children }: { children: ReactNode }) {
  const { securityStatus, loading } = useSecurityCheck()
  
  return (
    <SecurityContext.Provider value={{ securityStatus, loading }}>
      {children}
    </SecurityContext.Provider>
  )
}

export function useSecurity() {
  return useContext(SecurityContext)
}
