"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Lock, Key, CheckCircle2, AlertCircle, Fingerprint, Scan, MousePointer2 } from "lucide-react"
import { startAuthentication } from "@simplewebauthn/browser"
import { toast } from "sonner"

export default function VerifyIdentityPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [status, setStatus] = useState<"checking" | "select-method" | "passkey" | "pin" | "verifying" | "success" | "failed">("checking")
  const [error, setError] = useState("")
  const [welcomeName, setWelcomeName] = useState("")
  
  // Method Availability
  const [hasPasskey, setHasPasskey] = useState(false)
  const [hasPin, setHasPin] = useState(false)
  
  // PIN State
  const [pin, setPin] = useState("")

  // 1. Initial Check: Fetch Security Status
  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.push('/sign-in')
      return
    }

    const checkSecurityStatus = async () => {
      try {
        const res = await fetch(`/api/security/status?t=${Date.now()}`)
        
        if (res.status === 401) {
          console.error('[SECURITY] Server report 401 Unauthorized. Redirecting to sign-in.')
          window.location.href = '/sign-in'
          return
        }

        const data = await res.json()

        if (res.status === 404 || data.error === 'User not found') {
          console.warn('[SECURITY] User not found in database. Redirecting to onboarding.')
          router.push('/onboarding')
          return
        }

        if (data.error) throw new Error(data.error)

        setHasPasskey(data.hasPasskey)
        setHasPin(!!data.securityPin)

        if (!data.securitySetupComplete && !data.hasPasskey && !data.securityPin) {
          router.push('/security-setup')
          return
        }

        setStatus("select-method")
      } catch (err) {
        console.error("Status check failed", err)
        setError("Security module offline. Please retry.")
      }
    }

    checkSecurityStatus()
  }, [isLoaded, user, router])

  // 2. Passkey Authentication
  const handlePasskeyAuth = async () => {
    setStatus("passkey")
    setError("")
    
    try {
      // 1. Get options from server
      const optionsRes = await fetch("/api/security/passkey/authenticate-options")
      const options = await optionsRes.json()
      
      if (options.error) throw new Error(options.error)
      
      // 2. Start biometric authentication
      const authResponse = await startAuthentication(options)
      
      // 3. Verify with server
      const verifyRes = await fetch("/api/security/passkey/authenticate-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authResponse),
      })
      
      const verification = await verifyRes.json()
      
      if (verification.verified) {
        handleSuccess()
      } else {
        throw new Error(verification.error || "Verification failed")
      }
    } catch (err: any) {
      console.error("Passkey Error:", err)
      setError(err.message || "Credential verification failed.")
      setStatus("select-method")
    }
  }

  // 3. PIN Authentication
  const handlePinAuth = async () => {
    if (pin.length < 4) return
    setStatus("verifying")
    setError("")

    try {
      const res = await fetch("/api/security/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      })
      
      const data = await res.json()
      
      if (data.verified) {
        handleSuccess()
      } else {
        setError(data.error || "Invalid PIN protocol")
        setStatus("pin")
      }
    } catch (err) {
      setError("Network protocol failure")
      setStatus("pin")
    }
  }

  const handleSuccess = () => {
    setStatus("success")
    setWelcomeName(user?.firstName || "User")
    toast.success("Identity Verified")
    setTimeout(() => {
      window.location.href = '/'
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Ambience */}
      <div className="absolute top-0 inset-x-0 h-[40vh] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      
      <div className="max-w-md w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-[3rem] p-10 text-center border border-surface-border shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative"
        >
          {/* Scanning Line Background Effect */}
          <AnimatePresence>
            {(status === 'passkey' || status === 'verifying') && (
              <motion.div 
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-primary/30 shadow-[0_0_20px_var(--primary-glow)] pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="mb-10">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-3xl flex items-center justify-center mb-6 relative group">
              <div className="absolute inset-0 border-2 border-primary/20 rounded-3xl group-hover:border-primary/40 transition-colors" />
              {status === 'success' ? (
                <CheckCircle2 className="w-12 h-12 text-[#39FF14]" />
              ) : (
                <Shield className="w-12 h-12 text-primary animate-pulse" />
              )}
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">
              {status === 'success' ? `Welcome Back` : 'Omni Secure'}
            </h1>
            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-[0.3em] mt-3 italic">
              {status === 'checking' && 'Initializing Vault Access...'}
              {status === 'select-method' && 'Identity verification required'}
              {status === 'passkey' && 'Waiting for hardware biometric...'}
              {status === 'pin' && 'Enter Master PIN Protocol'}
              {status === 'verifying' && 'Decrypting credentials...'}
              {status === 'success' && `Hand-off to ${welcomeName}`}
              {status === 'failed' && 'Protocol rejected'}
            </p>
          </div>

          {/* Verification Content */}
          <div className="space-y-4">
            {status === 'select-method' && (
              <div className="grid gap-3">
                {hasPasskey && (
                  <button
                    onClick={handlePasskeyAuth}
                    className="p-6 rounded-3xl border-2 border-surface-border bg-surface/50 hover:bg-surface hover:border-primary transition-all flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Fingerprint className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <span className="block font-black uppercase italic text-xs">Biometric ID</span>
                      <span className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest">Use device fingerprint</span>
                    </div>
                  </button>
                )}
                
                {hasPin && (
                  <button
                    onClick={() => setStatus("pin")}
                    className="p-6 rounded-3xl border-2 border-surface-border bg-surface/50 hover:bg-surface hover:border-blue-500 transition-all flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Lock className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <span className="block font-black uppercase italic text-xs">Master PIN</span>
                      <span className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest">Manual sequence entry</span>
                    </div>
                  </button>
                )}
              </div>
            )}

            {status === 'pin' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="relative">
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="000 000"
                    className="w-full px-4 py-8 bg-surface/50 border-2 border-surface-border rounded-3xl text-center text-5xl font-black tracking-[0.5em] focus:border-blue-500 outline-none transition-all"
                    autoFocus
                  />
                  {!pin && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-foreground/10 text-xs font-black uppercase tracking-[0.4em]">Sequence Code</div>}
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setStatus("select-method")}
                    className="flex-1 py-4 bg-surface text-foreground/40 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-surface-border hover:text-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePinAuth}
                    disabled={pin.length < 4}
                    className="flex-[2] py-4 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    Confirm →
                  </button>
                </div>
              </motion.div>
            )}

            {status === 'passkey' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center gap-6"
              >
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center animate-bounce">
                  <Scan className="w-8 h-8 text-primary" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Awaiting Hardware Scan</p>
                <button
                  onClick={() => setStatus("select-method")}
                  className="mt-4 text-[8px] font-black uppercase tracking-[0.2em] text-foreground/30 hover:text-foreground transition-colors"
                >
                  Change Protocol
                </button>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                className="py-10"
              >
                <div className="text-[#39FF14] space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Identity_Confirmed</div>
                  <div className="font-mono text-[8px] text-[#39FF14]/50">REDIRECTING_TO_MARKETPLACE_V4.2.1</div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer HUD */}
          <div className="mt-12 flex justify-between items-center font-mono text-[7px] text-foreground/20 italic font-black uppercase tracking-widest">
            <span>Auth_Server: v2.0.4</span>
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full animate-pulse" />
              Connection_Encrypted
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

