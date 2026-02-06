'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import * as faceapi from "face-api.js";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import { motion } from "framer-motion";
import { Shield, Scan, AlertCircle, CheckCircle2 } from "lucide-react";

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

export default function VerifyIdentityPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [status, setStatus] = useState<"checking" | "scanning" | "verifying" | "success" | "failed">("checking");
    const [error, setError] = useState("");
    const [welcomeName, setWelcomeName] = useState("");

    // Camera & Bio State
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
    const [faceDetected, setFaceDetected] = useState(false);
    const streamRef = useRef<MediaStream | null>(null);

    // 1. Initial Check: Redirect if needed
    useEffect(() => {
        if (!isLoaded) return;
        if (!user) {
            router.push('/sign-in');
            return;
        }

        const checkStatus = async () => {
            try {
                const res = await fetch('/api/users/me');
                const data = await res.json();

                if (!data.onboarded) {
                    router.push('/onboarding');
                    return;
                }

                // Check security status specifically
                const secRes = await fetch('/api/security/status');
                const secData = await secRes.json();

                if (!secData.securitySetupComplete && !secData.hasBiometric) {
                    router.push('/security-setup');
                    return;
                }

                setStatus("scanning");
            } catch (err) {
                console.error("Status check failed", err);
                setError("System error. Please refresh.");
            }
        };

        checkStatus();
    }, [isLoaded, user, router]);

    // 2. Load Models
    useEffect(() => {
        if (status !== 'scanning') return;

        async function loadModels() {
            try {
                await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
                await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
                await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

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
                startCamera();
            } catch (err) {
                console.error("Model Error:", err);
                setError("Failed to load security modules.");
            }
        }
        loadModels();
    }, [status]);

    // 3. Camera Handling
    const startCamera = async () => {
        try {
            if (!navigator.mediaDevices?.getUserMedia) return;
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }
        } catch (err) {
            setError("Camera access required for verification.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    };

    // 4. Detection Loop
    useEffect(() => {
        let animId: number;
        const track = async () => {
            const video = videoRef.current;
            if (faceDetector && video && status === 'scanning' && !video.paused && !video.ended) {
                const now = performance.now();
                const detections = faceDetector.detectForVideo(video, now);
                
                if (detections.detections.length > 0) {
                    setFaceDetected(true);
                    // Draw box
                    const canvas = canvasRef.current;
                    if(canvas) {
                        const ctx = canvas.getContext('2d');
                        if(ctx) {
                           canvas.width = video.videoWidth;
                           canvas.height = video.videoHeight;
                           ctx.clearRect(0,0,canvas.width,canvas.height);
                           ctx.strokeStyle = '#39FF14';
                           ctx.lineWidth = 4;
                           const box = detections.detections[0].boundingBox;
                           if(box) ctx.strokeRect(box.originX, box.originY, box.width, box.height);
                        }
                    }
                } else {
                    setFaceDetected(false);
                    const canvas = canvasRef.current;
                    if(canvas) canvas.getContext('2d')?.clearRect(0,0,canvas.width,canvas.height);
                }
            }
            animId = requestAnimationFrame(track);
        };
        if (status === 'scanning') track();
        return () => cancelAnimationFrame(animId);
    }, [faceDetector, status]);

    // 5. Verify Action
    const handleVerify = async () => {
        if (!videoRef.current || !faceDetected) return;
        setStatus("verifying");
        setError("");

        try {
            // Generate descriptor
            const detections = await faceapi
                .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 }))
                .withFaceLandmarks()
                .withFaceDescriptors();

            if (detections.length === 0) {
                setStatus("scanning");
                setError("Face not clear. Try again.");
                return;
            }

            const descriptor = Array.from(detections[0].descriptor);

            const res = await fetch('/api/security/verify-face', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ descriptor })
            });
            const data = await res.json();

            if (data.verified) {
                setStatus("success");
                setWelcomeName(user?.firstName || "User");
                stopCamera();
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                setStatus("failed");
                setError(data.error || "Identity Verification Failed");
                setTimeout(() => setStatus("scanning"), 2000); // Reset to allow retry
            }

        } catch (err) {
            console.error("Verify Error:", err);
            setStatus("failed");
            setError("Verification error.");
             setTimeout(() => setStatus("scanning"), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
             <div className="absolute top-0 inset-x-0 h-[40vh] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
             
             <div className="max-w-md w-full relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong rounded-[2rem] p-8 text-center border border-surface-border shadow-2xl"
                >
                    {/* Header */}
                    <div className="mb-8">
                        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 relative">
                             {status === 'success' ? (
                                <CheckCircle2 className="w-10 h-10 text-[#39FF14]" />
                             ) : (
                                <Scan className="w-10 h-10 text-primary animate-pulse" />
                             )}
                             {status === 'scanning' && (
                                <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-20"/>
                             )}
                        </div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">
                            {status === 'success' ? `Welcome, ${welcomeName}` : 'Verify Identity'}
                        </h1>
                        <p className="text-foreground/50 text-xs font-bold uppercase tracking-widest mt-2">
                            {status === 'checking' && 'Initializing security protocols...'}
                            {status === 'scanning' && 'Face ID Required for entry'}
                            {status === 'verifying' && 'Analyzing biometric data...'}
                            {status === 'success' && 'Access Granted'}
                            {status === 'failed' && 'Access Denied'}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="relative aspect-square bg-black rounded-2xl overflow-hidden mb-6 border-2 border-surface-border">
                        {status === 'checking' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="animate-spin text-4xl">⚙️</span>
                            </div>
                        )}
                        
                        {(status === 'scanning' || status === 'verifying' || status === 'failed') && (
                            <>
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full transform scale-x-[-1]" />
                                <div className="absolute inset-0 pointer-events-none border-[20px] border-black/50 rounded-2xl"></div>
                            </>
                        )}

                        {status === 'success' && (
                             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-[#39FF14]">
                                 <motion.div 
                                    initial={{ scale: 0 }} 
                                    animate={{ scale: 1 }}
                                    className="text-6xl mb-4"
                                 >
                                     🔓
                                 </motion.div>
                                 <p className="font-mono text-sm">REDIRECTING...</p>
                             </div>
                        )}
                    </div>

                    {/* Actions */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    {status === 'scanning' && (
                        <button
                            onClick={handleVerify}
                            disabled={!faceDetected}
                            className="w-full py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-primary/25 active:scale-95"
                        >
                            {faceDetected ? 'Verify Face ID' : 'Position Face'}
                        </button>
                    )}
                </motion.div>
             </div>
        </div>
    );
}
