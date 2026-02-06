"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"
import QRCode from "qrcode"

import { Shield, Lock, Key, CheckCircle2, AlertCircle, Fingerprint, Smartphone, Scan, MousePointer2 } from "lucide-react"
import { useModal } from "@/context/ModalContext"
import { toast } from "sonner"
import { startRegistration } from "@simplewebauthn/browser"

export default function SecuritySetupPage() {
  const { user, isLoaded } = useUser()
  const modal = useModal()
  const router = useRouter()
  
  // State Management
  const [step, setStep] = useState<"intro" | "select-method" | "passkey" | "pin" | "2fa" | "complete">("intro")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Passkey State
  const [passkeySupported, setPasskeySupported] = useState(true)
  const [passkeyComplete, setPasskeyComplete] = useState(false)
  
  // PIN State
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [pinComplete, setPinComplete] = useState(false)
  
  // 2FA State
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [secret, setSecret] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [twoFASetup, setTwoFASetup] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  // Check for WebAuthn support
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPasskeySupported(!!window.PublicKeyCredential)
    }
  }, [])

  // Passkey Registration Flow
  const setupPasskey = async () => {
    setLoading(true)
    setError("")
    
    try {
      // 1. Get options from server
      const optionsRes = await fetch("/api/security/passkey/register-options")
      const options = await optionsRes.json()
      
      if (options.error) throw new Error(options.error)
      
      // 2. Start biometric registration on device
      const regResponse = await startRegistration(options)
      
      // 3. Verify with server
      const verifyRes = await fetch("/api/security/passkey/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regResponse),
      })
      
      const verification = await verifyRes.json()
      
      if (verification.verified) {
        setPasskeyComplete(true)
        toast.success("Biometric enrollment successful")
        setStep("2fa")
      } else {
        throw new Error(verification.error || "Verification failed")
      }
    } catch (err: any) {
      console.error("Passkey Error:", err)
      setError(err.message || "Credential registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Master PIN Flow
  const setupPin = async () => {
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits")
      return
    }
    if (pin !== confirmPin) {
      setError("PINs do not match")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/security/save-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, clerkId: user?.id }),
      })
      
      if (res.ok) {
        setPinComplete(true)
        toast.success("Security PIN synchronized")
        setStep("2fa")
      } else {
        setError("Failed to save PIN protocol")
      }
    } catch (err) {
      setError("Network protocol failure")
    } finally {
      setLoading(false)
    }
  }

  // Setup 2FA
  const setup2FA = async () => {
    setLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/security/setup-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user?.id })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSecret(data.secret)
        setBackupCodes(data.backupCodes)
        
        // Generate QR code
        const qrUrl = await QRCode.toDataURL(data.otpauthUrl)
        setQrCodeUrl(qrUrl)
      } else {
        setError(data.error || "Failed to setup 2FA")
      }
    } catch (err) {
      setError("Failed to setup 2FA. Please try again.")
      console.error(err)
    }
    
    setLoading(false)
  }

  // Verify 2FA code
  const verify2FA = async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit code")
      return
    }
    
    setLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/security/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user?.id,
          token: verificationCode
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.verified) {
        setTwoFASetup(true)
        setStep("complete")
      } else {
        setError("Invalid code. Please try again.")
      }
    } catch (err) {
      setError("Verification failed. Please try again.")
      console.error(err)
    }
    
    setLoading(false)
  }

  // Complete setup
  const completeSetup = async () => {
    try {
      // Call API to set the OMNI_IDENTITY_VERIFIED cookie
      await fetch('/api/security/complete', { method: 'POST' });
      
      // Force a hard navigation to ensure middleware picks up the new cookie
      window.location.href = '/'; 
    } catch (error) {
      console.error("Failed to complete setup:", error);
      toast.error("Failed to finalize security protocols. Please try again.");
    }
  }

  // Render steps
  const renderStep = () => {
    switch (step) {
      case "intro":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Omni Vault Protection</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Replace passwords with secure device biometrics
              </p>
            </div>
            <div className="grid gap-4 max-w-md mx-auto text-left">
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-surface-border">
                <Fingerprint className="w-6 h-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1 italic">Biometric Identity</h3>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 uppercase tracking-tight">
                    Use your phone's fingerprint or FaceID. Biometric data never leaves your device.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-surface-border">
                <Lock className="w-6 h-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1 italic">90-Strong Encryption</h3>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 uppercase tracking-tight">
                    Endpoints are secured using hardware-level cryptographic keys.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setStep("select-method")}
              className="px-12 py-4 bg-primary text-black rounded-2xl hover:scale-105 active:scale-95 transition-all font-black uppercase tracking-[0.2em] text-xs shadow-xl"
            >
              Initialize Setup →
            </button>
          </motion.div>
        )
      
      case "select-method":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <h2 className="text-2xl font-black uppercase tracking-tighter">Select Verification Protocol</h2>
            {!passkeySupported && (
               <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-500 text-[10px] font-bold uppercase tracking-widest mb-4">
                  ⚠️ This browser does not support Biometric APIs
               </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              <button
                disabled={!passkeySupported}
                onClick={() => setStep("passkey")}
                className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 group ${
                  passkeySupported ? 'border-surface-border bg-surface hover:border-primary/50' : 'opacity-50 grayscale border-dashed'
                }`}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Fingerprint className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <span className="block font-black uppercase italic text-sm">Fingerprint</span>
                  <span className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest">Recommended for Mobile</span>
                </div>
              </button>

              <button
                onClick={() => setStep("pin")}
                className="p-8 rounded-3xl border-2 border-surface-border bg-surface hover:border-blue-500/50 transition-all flex flex-col items-center gap-4 group"
              >
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Lock className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-center">
                  <span className="block font-black uppercase italic text-sm">Master PIN</span>
                  <span className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest">Recommended for Desktop</span>
                </div>
              </button>
            </div>
          </motion.div>
        )

      case "passkey":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Scan className="w-12 h-12 text-primary" />
            </div>
            <div className="max-w-xs mx-auto">
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Biometric Enrollment</h2>
              <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest leading-loose">
                Prepare your device fingerprint or face scanner. You will be prompted by your browser to create a secure credential.
              </p>
            </div>
            
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-widest">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={setupPasskey}
                disabled={loading}
                className="px-12 py-4 bg-primary text-black rounded-2xl transition-all font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_30px_var(--primary-glow)] disabled:opacity-50"
              >
                {loading ? "Waiting for Device..." : "Activate Biometrics →"}
              </button>
              <button onClick={() => setStep("select-method")} className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/20 hover:text-foreground transition-colors">
                Back to Protocol Selection
              </button>
            </div>
          </motion.div>
        )

      case "pin":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
              <Key className="w-12 h-12 text-blue-500" />
            </div>
            <div className="max-w-xs mx-auto">
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Master PIN Protocol</h2>
              <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
                Set a secure PIN for secondary verification on desktop devices.
              </p>
            </div>

            <div className="space-y-4 max-w-sm mx-auto">
              <div>
                <input
                  type="password"
                  placeholder="ENTER NEW PIN"
                  className="w-full bg-surface border-2 border-surface-border rounded-xl px-4 py-4 text-center text-3xl font-black tracking-[1em] focus:border-blue-500 outline-none"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="CONFIRM PIN"
                  className="w-full bg-surface border-2 border-surface-border rounded-xl px-4 py-4 text-center text-3xl font-black tracking-[1em] focus:border-blue-500 outline-none"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </div>
            </div>
            
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-widest">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={setupPin}
                disabled={loading || pin.length < 4}
                className="px-12 py-4 bg-blue-600 text-white rounded-2xl transition-all font-black uppercase tracking-[0.2em] text-xs shadow-xl disabled:opacity-50"
              >
                {loading ? "Encrypting..." : "Lock In PIN →"}
              </button>
              <button onClick={() => setStep("select-method")} className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/20 hover:text-foreground transition-colors">
                Back to Selection
              </button>
            </div>
          </motion.div>
        )
      
      case "2fa":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 max-w-lg mx-auto"
          >
            <div className="text-center">
              <Smartphone className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Authenticator App</h2>
              <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest leading-loose">
                Scan this code with Google Authenticator or Authy.
              </p>
            </div>
            
            {!qrCodeUrl ? (
              <button
                onClick={setup2FA}
                disabled={loading}
                className="w-full px-8 py-4 bg-surface border-2 border-surface-border text-foreground rounded-2xl hover:border-primary transition-all font-black uppercase tracking-widest text-xs disabled:opacity-50"
              >
                {loading ? "Generating Payload..." : "Request 2FA Key"}
              </button>
            ) : (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-[2rem] border-2 border-surface-border dark:bg-black">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto w-64 h-64 mix-blend-multiply dark:mix-blend-normal" />
                  <div className="mt-4 p-3 bg-surface rounded-xl font-mono text-[10px] text-center break-all text-foreground/40 uppercase tracking-tighter">
                    BACKUP KEY: {secret}
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000 000"
                    className="w-full px-4 py-6 bg-surface border-2 border-surface-border rounded-2xl text-center text-4xl font-black tracking-[0.5em] focus:border-primary outline-none"
                  />
                  {!verificationCode && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-foreground/10 text-xs font-black uppercase tracking-[0.4em]">Verification Code</div>}
                </div>
                
                {backupCodes.length > 0 && (
                  <div className="bg-orange-500/5 p-6 rounded-2xl border border-orange-500/20">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Protocol Recovery Keys
                    </h3>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                      {backupCodes.map((code, i) => (
                        <div key={i} className="bg-surface p-2 rounded-lg text-center font-black text-foreground/60 border border-surface-border">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-widest">
                    {error}
                  </div>
                )}
                
                <button
                  onClick={verify2FA}
                  disabled={verificationCode.length !== 6 || loading}
                  className="w-full px-8 py-5 bg-primary text-black rounded-2xl transition-all font-black uppercase tracking-[0.2em] text-xs shadow-xl disabled:opacity-50"
                >
                  {loading ? "Authenticating..." : "Authorize Identity →"}
                </button>
              </div>
            )}
          </motion.div>
        )
      
      case "complete":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <div className="w-24 h-24 bg-[#39FF14]/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(57,255,20,0.2)]">
              <CheckCircle2 className="w-12 h-12 text-[#39FF14]" />
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">Vault Locked</h2>
              <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest italic">
                Your campus identity is now cryptographically secured.
              </p>
            </div>
            <div className="grid gap-3 max-w-sm mx-auto">
              <div className="flex items-center gap-3 p-4 bg-surface rounded-2xl border border-surface-border">
                <CheckCircle2 className="w-5 h-5 text-[#39FF14]" />
                <span className="text-[10px] font-black uppercase tracking-widest">{passkeyComplete ? 'Hardware Biometric Active' : 'Master PIN Active'}</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-surface rounded-2xl border border-surface-border">
                <CheckCircle2 className="w-5 h-5 text-[#39FF14]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Two-Factor Encryption Active</span>
              </div>
            </div>
            <button
              onClick={completeSetup}
              className="px-12 py-5 bg-primary text-black rounded-2xl transition-all font-black uppercase tracking-[0.2em] text-xs shadow-lg hover:scale-105 active:scale-95"
            >
              Enter Marketplace →
            </button>
          </motion.div>
        )
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Premium Header Decoration */}
      <div className="absolute top-0 inset-x-0 h-[40vh] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Protocol</span>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Security Setup</h1>
        </div>

        {/* Progress System - Premium Desktop & Stacked Mobile */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-2 mb-4">
            <StepIndicator 
              current={step === "intro"} 
              done={["biometric", "2fa", "complete"].includes(step)} 
              num="1" 
              label="Intro" 
            />
            <div className="hidden sm:block w-12 h-0.5 bg-surface-border" />
            <StepIndicator 
              current={step === "biometric"} 
              done={["2fa", "complete"].includes(step)} 
              num="2" 
              label="Biometric" 
            />
            <div className="hidden sm:block w-12 h-0.5 bg-surface-border" />
            <StepIndicator 
              current={step === "2fa"} 
              done={step === "complete"} 
              num="3" 
              label="Auth" 
            />
          </div>
        </div>
        
        {/* Main Content Container - Glassmorphism */}
        <div className="glass-strong rounded-[2.5rem] p-6 sm:p-12 shadow-2xl border border-surface-border hover:border-primary/20 transition-all duration-500 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 blur-3xl rounded-full" />
          
          <AnimatePresence mode="wait">
            <div key={step} className="w-full">
              {renderStep()}
            </div>
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center">
            <p className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.5em]">
              🔒 Encrypted with End-to-End OMNI Security Protocol
            </p>
        </div>
      </div>
    </div>
  )
}

function StepIndicator({ current, done, num, label }: { current: boolean; done: boolean; num: string; label: string }) {
  return (
    <div className="flex items-center gap-3 bg-surface/50 px-4 py-2 rounded-2xl border border-surface-border">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black transition-all ${
        done ? "bg-[#39FF14] text-black" : 
        current ? "bg-primary text-primary-foreground omni-glow" : 
        "bg-surface-hover text-foreground/20"
      }`}>
        {done ? "✓" : num}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${
        current || done ? "text-foreground" : "text-foreground/20"
      }`}>
        {label}
      </span>
    </div>
  )
}
