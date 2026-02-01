"use client"

import { useState, useRef, useEffect } from "react"
import "@tensorflow/tfjs"
import * as faceapi from "face-api.js"
import { FaceDetector, FilesetResolver, Detection } from "@mediapipe/tasks-vision"
import { motion, AnimatePresence } from "framer-motion"
import { X, Camera, Key, AlertCircle, CheckCircle2, Shield, Scan } from "lucide-react"

interface SecurityVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  requireBiometric?: boolean
  require2FA?: boolean
  message?: string
}

export default function SecurityVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  requireBiometric = true,
  require2FA = true,
  message = "Security verification required to continue"
}: SecurityVerificationModalProps) {
  const [step, setStep] = useState<"face" | "2fa" | "complete">("face")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Face verification state
  const [cameraActive, setCameraActive] = useState(false)
  const [faceVerified, setFaceVerified] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  // 2FA verification state
  const [verificationCode, setVerificationCode] = useState("")
  const [code2FAVerified, setCode2FAVerified] = useState(false)

  // MediaPipe State
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null)
  const [isFaceDetected, setIsFaceDetected] = useState(false)

  // Initialize MediaPipe
  useEffect(() => {
    async function initMediaPipe() {
      try {
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
        console.error("MediaPipe Init Failed:", err);
      }
    }
    initMediaPipe();
  }, []);

  // Tracking loop with MediaPipe
  useEffect(() => {
    let animationId: number;
    
    async function track() {
      const video = videoRef.current;
      if (faceDetector && video && cameraActive && !loading && !faceVerified) {
        if (video.readyState >= 3 && video.videoWidth > 0 && video.videoHeight > 0 && !video.paused && !video.ended) {
          try {
            const detections = faceDetector.detectForVideo(video, performance.now());
            if (detections.detections.length > 0) {
              setIsFaceDetected(true);
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
                    if (box) {
                      ctx.strokeRect(box.originX, box.originY, box.width, box.height);
                    }
                  }
                }
              }
            } else {
              setIsFaceDetected(false);
              const ctx = canvasRef.current?.getContext("2d");
              if (ctx) ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            }
          } catch (err) {
            console.error("MediaPipe Track Error:", err);
          }
        }
      }
      animationId = requestAnimationFrame(track);
    }

    if (cameraActive) track();
    return () => cancelAnimationFrame(animationId);
  }, [faceDetector, cameraActive, loading, faceVerified]);

  // Start camera for face verification
  const startCamera = async () => {
    try {
      setError("")
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera access is restricted. Please ensure you are using a secure connection (HTTPS) or localhost.")
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions.")
      console.error(err)
    }
  }

  // Verify face
  const verifyFace = async () => {
    if (!videoRef.current) return
    
    setLoading(true)
    setError("")
    
    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptors()
      
      if (detections.length === 0) {
        setError("No face detected. Please try again.")
        setLoading(false)
        return
      }
      
      if (detections.length > 1) {
        setError("Multiple faces detected. Only one person should be visible.")
        setLoading(false)
        return
      }
      
      const faceDescriptor = Array.from(detections[0].descriptor)
      
      // Verify with backend
      const response = await fetch("/api/security/verify-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faceDescriptor })
      })
      
      const data = await response.json()
      
      if (response.ok && data.verified) {
        setFaceVerified(true)
        stopCamera()
        
        if (require2FA) {
          setStep("2fa")
        } else {
          setStep("complete")
          onSuccess()
        }
      } else {
        setError(data.message || "Face verification failed. Please try again.")
      }
    } catch (err) {
      setError("Verification failed. Please try again.")
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
        body: JSON.stringify({ token: verificationCode })
      })
      
      const data = await response.json()
      
      if (response.ok && data.verified) {
        setCode2FAVerified(true)
        setStep("complete")
        onSuccess()
      } else {
        setError("Invalid code. Please try again.")
      }
    } catch (err) {
      setError("Verification failed. Please try again.")
      console.error(err)
    }
    
    setLoading(false)
  }

  // Cleanup
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Skip biometric if not required
  useEffect(() => {
    if (isOpen && !requireBiometric && require2FA) {
      setStep("2fa")
    }
  }, [isOpen, requireBiometric, require2FA])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Security Verification</h2>
            </div>
            <p className="text-blue-100">{message}</p>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-4">
            {step === "face" && requireBiometric && (
              <div className="space-y-4">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold text-lg mb-2">Face Verification</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please position your face in the camera frame
                  </p>
                </div>
                
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
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
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={startCamera}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                      >
                        Activate Camera
                      </button>
                    </div>
                  )}
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                
                {cameraActive && (
                  <button
                    onClick={verifyFace}
                    disabled={loading || !isFaceDetected}
                    className={`w-full px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all ${
                      isFaceDetected 
                        ? "bg-primary text-primary-foreground omni-glow scale-100" 
                        : "bg-gray-100 text-gray-400 scale-95"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                       {loading ? (
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       ) : isFaceDetected ? (
                         <Scan className="w-5 h-5" />
                       ) : (
                         <Camera className="w-5 h-5" />
                       )}
                       <span>{loading ? "Decrypting Face Data..." : isFaceDetected ? "Authorize Identity" : "Align Face to Scan"}</span>
                    </div>
                  </button>
                )}
              </div>
            )}
            
            {step === "2fa" && require2FA && (
              <div className="space-y-4">
                <div className="text-center">
                  <Key className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold text-lg mb-2">2FA Verification</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
                
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full px-4 py-3 border rounded-lg text-center text-2xl font-mono tracking-widest"
                  autoFocus
                />
                
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                
                <button
                  onClick={verify2FA}
                  disabled={verificationCode.length !== 6 || loading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </div>
            )}
            
            {step === "complete" && (
              <div className="text-center py-6">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold text-lg mb-2">Verification Successful</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You have been securely authenticated
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
