'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MaintenanceLockdownProps {
    title?: string;
    message?: string;
    feature?: string;
}

export default function MaintenanceLockdown({
    title = "SECTOR LOCKDOWN",
    message = "The LaHustle ecosystem is currently offline for critical core upgrades and infrastructure recalibration.",
    feature
}: MaintenanceLockdownProps) {
    const [currentTime, setCurrentTime] = useState<string>('');
    const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);

    useEffect(() => {
        setCurrentTime(new Date().toISOString());
        const timer = setInterval(() => {
            setCurrentTime(new Date().toISOString());
        }, 1000);

        // Simulate high-fidelity tech telemetry logs mounting in sequence
        const logs = [
            "SYS_CORE: Primary engine halted [SIGNAL_MAINTENANCE]",
            "ESCROW_SHIELD: Secure vaults locked & isolated",
            "FINTECH_GATEWAY: Paystack API listeners standing by",
            "SMS_GATEWAY: Wigal Frog queue in standby status",
            "INTEGRITY_CHECK: 100% secure, core database pools synchronized",
            "GOD_MODE: Override active for authorized administrative clearance"
        ];

        let index = 0;
        const logTimer = setInterval(() => {
            if (index < logs.length) {
                setTelemetryLogs(prev => [...prev, logs[index]]);
                index++;
            } else {
                clearInterval(logTimer);
            }
        }, 600);

        return () => {
            clearInterval(timer);
            clearInterval(logTimer);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-4 relative overflow-hidden select-none">
            {/* Custom Premium CSS Animations */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes scanline-sweep {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100vh); }
                }
                @keyframes glow-pulse {
                    0%, 100% { opacity: 0.03; filter: blur(120px); }
                    50% { opacity: 0.07; filter: blur(140px); }
                }
                .scanline {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: linear-gradient(to bottom, transparent, rgba(57, 255, 20, 0.15), transparent);
                    animation: scanline-sweep 6s linear infinite;
                    pointer-events: none;
                    z-index: 10;
                }
            `}} />

            {/* Matrix Scanline Sweep */}
            <div className="scanline" />

            {/* Deep Glassmorphic Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />

            {/* HSL Jade Depth Lights */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#39FF14] rounded-full opacity-5 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#10B981] rounded-full opacity-[0.03] blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#047857] rounded-full opacity-[0.03] blur-[100px] pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-20 max-w-2xl w-full text-center space-y-8 px-4">
                
                {/* Padlock & Mechanical Ring */}
                <div className="flex justify-center">
                    <div className="relative flex items-center justify-center">
                        {/* Outer Sci-Fi Rotating Mechanical Ring */}
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="w-36 h-36 rounded-full border-2 border-dashed border-[#39FF14]/20 absolute"
                        />
                        {/* Inner Rotating Ring */}
                        <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="w-32 h-32 rounded-full border border-double border-[#39FF14]/30 absolute"
                        />
                        {/* Glow Padlock Ring */}
                        <div className="w-24 h-24 rounded-full bg-black/80 border-2 border-[#39FF14]/40 shadow-[0_0_20px_rgba(57,255,20,0.15)] flex items-center justify-center relative">
                            {/* Animated padlock icon */}
                            <svg className="w-10 h-10 text-[#39FF14]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            {/* Beeping node indicator */}
                            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#39FF14]"></span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Header Information */}
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-red-950/40 border border-red-500/30 rounded-full text-red-400 text-[10px] font-black uppercase tracking-[0.25em] shadow-[0_0_15px_rgba(239,68,68,0.05)] animate-pulse">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                        CRITICAL CORE UPGRADE ACTIVE
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500 leading-tight">
                        {title}
                    </h1>
                    {feature && (
                        <p className="text-[#39FF14] text-xs font-mono font-bold uppercase tracking-[0.4em] animate-pulse">
                            [ {feature} STATUS: OFFLINE ]
                        </p>
                    )}
                </div>

                {/* Subtitle Message */}
                <p className="text-gray-400 font-mono text-sm md:text-base leading-relaxed max-w-lg mx-auto">
                    {message}
                </p>

                {/* High-Fidelity Cyber-Security Telemetry Terminal Console */}
                <div className="w-full bg-black/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl text-left font-mono text-xs">
                    {/* Header Panel */}
                    <div className="px-5 py-3.5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest ml-1.5">Uplink Telemetry Console</span>
                        </div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">NODE_01_SECURE</span>
                    </div>
                    {/* Log Terminal Block */}
                    <div className="p-5 space-y-2 max-h-[160px] overflow-y-auto min-h-[140px] bg-black/40 text-gray-500">
                        <div className="text-gray-600 text-[10px]">LOCAL_TIME: {currentTime || "SYNCING..."}</div>
                        <AnimatePresence>
                            {telemetryLogs.map((log, index) => {
                                const isImportant = log.includes("GOD_MODE") || log.includes("INTEGRITY_CHECK");
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`flex items-start gap-2 ${isImportant ? 'text-[#39FF14]/80' : 'text-gray-400'}`}
                                    >
                                        <span className="text-[#39FF14] select-none">&gt;</span>
                                        <span className="leading-relaxed">{log}</span>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Status-Neutral Offline Standby Badge */}
                <div className="pt-6 border-t border-white/5 flex flex-col items-center gap-4">
                    <div className="px-5 py-3 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-xl flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#39FF14]"></span>
                        </span>
                        <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#39FF14]">
                            STANDBY MODE • UPLINK SECURED
                        </span>
                    </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-6">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] font-mono">
                        LaHustle SECURE ECOSYSTEM • NODE SHIELD v3.2.0
                    </p>
                </div>
            </div>
        </div>
    );
}
