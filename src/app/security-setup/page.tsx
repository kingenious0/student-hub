"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import * as faceapi from "face-api.js"
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision"
import { motion, AnimatePresence } from "framer-motion"
import QRCode from "qrcode"

// Comprehensive Monkey Patch for face-api.js compatibility with modern TFJS (v4+)
if (typeof window !== 'undefined' && tf.Tensor) {
    const proto = tf.Tensor.prototype as any;
    
    // Core utility mappings
    const patch = (name: string, fn: Function) => {
        if (!proto[name]) proto[name] = fn;
    };

    // basic ops
    patch('toFloat', function() { return this.cast('float32'); });
    patch('cast', function(dtype: any) { return tf.cast(this, dtype); });
    
    // shape ops
    patch('as4D', function(a:number, b:number, c:number, d:number) { return tf.reshape(this, [a, b, c, d]); });
    patch('as3D', function(a:number, b:number, c:number) { return tf.reshape(this, [a, b, c]); });
    patch('as2D', function(a:number, b:number) { return tf.reshape(this, [a, b]); });
    patch('as1D', function() { return tf.reshape(this, [this.size]); });
    patch('reshape', function(shape: number[]) { return tf.reshape(this, shape); });
    patch('expandDims', function(axis: number) { return tf.expandDims(this, axis); });
    patch('squeeze', function(axis?: number[]) { return tf.squeeze(this, axis); });
    patch('broadcastTo', function(shape: number[]) { return tf.broadcastTo(this, shape); });
    patch('transpose', function(perm?: number[]) { return tf.transpose(this, perm); });

    // math ops
    patch('div', function(x: any) { return tf.div(this, x); });
    patch('mul', function(x: any) { return tf.mul(this, x); });
    patch('add', function(x: any) { return tf.add(this, x); });
    patch('sub', function(x: any) { return tf.sub(this, x); });
    patch('pow', function(x: any) { return tf.pow(this, x); });
    patch('sqrt', function() { return tf.sqrt(this); });
    patch('square', function() { return tf.square(this); });
    patch('abs', function() { return tf.abs(this); });
    
    // reduction ops
    patch('mean', function(axis?: any, keep?: boolean) { return tf.mean(this, axis, keep); });
    patch('sum', function(axis?: any, keep?: boolean) { return tf.sum(this, axis, keep); });
    patch('max', function(axis?: any, keep?: boolean) { return tf.max(this, axis, keep); });
    patch('min', function(axis?: any, keep?: boolean) { return tf.min(this, axis, keep); });
    
    // activation/other ops
    patch('relu', function() { return tf.relu(this); });
    patch('sigmoid', function() { return tf.sigmoid(this); });
    patch('softmax', function(axis?: number) { return tf.softmax(this, axis); });
    patch('slice', function(begin: any, size: any) { return tf.slice(this, begin, size); });
    patch('concat', function(others: any, axis: number) { return tf.concat([this, ...others], axis); });
}
import { Shield, Camera, Lock, Key, CheckCircle2, AlertCircle, Fingerprint, Smartphone, Scan } from "lucide-react"
import GoBack from "@/components/navigation/GoBack"
import { useModal } from "@/context/ModalContext"
import { toast } from "sonner"

export default function SecuritySetupPage() {
  const { user, isLoaded } = useUser()
  const modal = useModal()
  const router = useRouter()
  
  // State Management
  const [step, setStep] = useState<"intro" | "biometric" | "2fa" | "complete">("intro")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Biometric State
  const [cameraActive, setCameraActive] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [biometricSetup, setBiometricSetup] = useState(false)
  const [faceDescriptors, setFaceDescriptors] = useState<Float32Array[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  // MediaPipe State
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null)
  
  // 2FA State
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [secret, setSecret] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [twoFASetup, setTwoFASetup] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  // Load Face-API models
  useEffect(() => {
    async function loadModels() {
      const MODEL_URL = "/models"
      try {
        // Init FaceAPI (for descriptor generation only)
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        
        // Init MediaPipe (for fast real-time loop)
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/models/face_detector.tflite",
            delegate: "GPU"
          },
          runningMode: "VIDEO"
        });
        setFaceDetector(detector);
      } catch (err) {
        console.error("Model loading failed:", err)
      }
    }
    loadModels()
  }, [])

  // Request camera permission and start face detection
  const startCamera = async () => {
    try {
      setError("")
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera access is restricted. Please ensure you are using a secure connection (HTTPS) or localhost.")
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions to continue.")
      console.error("Camera error:", err)
    }
  }

  // Tracking loop with MediaPipe
  useEffect(() => {
    let animationId: number;
    
    async function track() {
      const video = videoRef.current;
      if (faceDetector && video && cameraActive && !loading && step === "biometric") {
        if (video.readyState >= 3 && video.videoWidth > 0 && video.videoHeight > 0 && !video.paused && !video.ended) {
          try {
            const detections = faceDetector.detectForVideo(video, performance.now());
            if (detections.detections.length > 0) {
              setFaceDetected(true);
              const canvas = canvasRef.current;
              if (canvas) {
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  ctx.strokeStyle = "#39FF14";
                  ctx.lineWidth = 4;
                  ctx.lineJoin = "round";
                  for (const det of detections.detections) {
                    const box = det.boundingBox;
                    if (box) ctx.strokeRect(box.originX, box.originY, box.width, box.height);
                  }
                }
              }
            } else {
              setFaceDetected(false);
              const ctx = canvasRef.current?.getContext("2d");
              if (ctx) ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            }
          } catch (err) {
             console.error("MediaPipe Detection Error:", err);
          }
        }
      }
      animationId = requestAnimationFrame(track);
    }

    if (cameraActive) track();
    return () => cancelAnimationFrame(animationId);
  }, [faceDetector, cameraActive, loading, step]);

  // Capture face biometric data
  const captureBiometric = async () => {
    if (!videoRef.current) return
    
    setLoading(true)
    setError("")
    
    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptors()
      
      if (detections.length === 0) {
        setError("No face detected. Please ensure your face is clearly visible.")
        setLoading(false)
        return
      }
      
      if (detections.length > 1) {
        setError("Multiple faces detected. Please ensure only your face is visible.")
        setLoading(false)
        return
      }
      
      // Collect multiple descriptors for better accuracy
      const descriptors = [...faceDescriptors, detections[0].descriptor]
      setFaceDescriptors(descriptors)
      
      if (descriptors.length >= 3) {
        // Save biometric data to database
        const response = await fetch("/api/security/save-biometric", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            faceDescriptor: Array.from(descriptors[0]), // Use the first one as reference
            clerkId: user?.id
          })
        })
        
        if (response.ok) {
          setBiometricSetup(true)
          stopCamera()
          setStep("2fa")
        } else {
          setError("Failed to save biometric data. Please try again.")
        }
      } else {
        setError(`Face captured ${descriptors.length}/3. Please capture from different angles.`)
      }
    } catch (err) {
      setError("Failed to capture biometric data. Please try again.")
      console.error(err)
    }
    
    setLoading(false)
  }

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
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
              <h2 className="text-3xl font-bold mb-2">Security First</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Protect your account with multi-layer security
              </p>
            </div>
            <div className="grid gap-4 max-w-md mx-auto text-left">
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Fingerprint className="w-6 h-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Biometric Face Recognition</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Scan your face for secure login verification
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Key className="w-6 h-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add an extra layer with time-based codes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Lock className="w-6 h-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Continuous Verification</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Required for all sensitive actions
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setStep("biometric")}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Begin Security Setup
            </button>
          </motion.div>
        )
      
      case "biometric":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold mb-2">Face Recognition Setup</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Position your face in the frame. We'll capture 3 angles for accuracy.
              </p>
            </div>
            
            <div className="relative max-w-2xl mx-auto">
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                />
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <button
                      onClick={startCamera}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      <Camera className="w-5 h-5 inline mr-2" />
                      Activate Camera
                    </button>
                  </div>
                )}
              </div>
              
              {faceDetected && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Face Detected
                </div>
              )}
              
              {faceDescriptors.length > 0 && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                  Captured: {faceDescriptors.length}/3
                </div>
              )}
            </div>
            
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
            
            {cameraActive && (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={captureBiometric}
                  disabled={!faceDetected || loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Capturing..." : `Capture Face ${faceDescriptors.length > 0 ? `(${faceDescriptors.length}/3)` : ""}`}
                </button>
                <button
                  onClick={stopCamera}
                  className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            )}
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
              <Key className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold mb-2">Two-Factor Authentication</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Add an authenticator app for additional security
              </p>
            </div>
            
            {!qrCodeUrl ? (
              <button
                onClick={setup2FA}
                disabled={loading}
                className="w-full px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate 2FA Setup"}
              </button>
            ) : (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border-2 border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Scan this QR code with Google Authenticator, Authy, or similar app:
                  </p>
                  <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto w-64 h-64" />
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-900 rounded font-mono text-sm text-center break-all">
                    {secret}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Enter 6-digit code from your authenticator app:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full px-4 py-3 border rounded-lg text-center text-2xl font-mono tracking-widest"
                  />
                </div>
                
                {backupCodes.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h3 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-200">
                      ⚠️ Save These Backup Codes
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                      Store these codes securely. You can use them if you lose access to your authenticator.
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                      {backupCodes.map((code, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-2 rounded text-center">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}
                
                <button
                  onClick={verify2FA}
                  disabled={verificationCode.length !== 6 || loading}
                  className="w-full px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify & Complete"}
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
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Security Setup Complete!</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your account is now protected with multi-layer security
              </p>
            </div>
            <div className="grid gap-3 max-w-md mx-auto">
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Face Recognition Enabled</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Two-Factor Authentication Active</span>
              </div>
            </div>
            <button
              onClick={completeSetup}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Continue to Dashboard
            </button>
          </motion.div>
        )
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

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
        <div className="flex items-center justify-between mb-12">
          <GoBack />
          <div className="text-right">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Protocol</span>
            <h1 className="text-xl font-black text-foreground uppercase tracking-tighter">Security Setup</h1>
          </div>
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
