'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function HustleQuest() {
    const { items } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [profileCompleted, setProfileCompleted] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Load custom profile status from localStorage
    useEffect(() => {
        const status = localStorage.getItem('lahustle_quest_profile');
        if (status === 'completed') {
            setProfileCompleted(true);
        }
    }, []);

    const toggleProfile = () => {
        const newStatus = !profileCompleted;
        setProfileCompleted(newStatus);
        localStorage.setItem('lahustle_quest_profile', newStatus ? 'completed' : 'pending');
    };

    // Tasks list
    const tasks = [
        { id: 'auth', label: 'Create Student Account', completed: true },
        { id: 'verify', label: 'Campus Domain Verification', completed: true },
        { id: 'cart', label: 'Explore & Add First Item to Cart', completed: items.length > 0 },
        { id: 'profile', label: 'Complete Shop Profile Setup', completed: profileCompleted, action: toggleProfile, isInteractive: true },
    ];

    const completedCount = tasks.filter(t => t.completed).length;
    const progressPercent = Math.round((completedCount / tasks.length) * 100);

    // Auto-collapse / open logic: Open on mount if not 100% complete
    useEffect(() => {
        if (progressPercent < 100) {
            const timer = setTimeout(() => setIsOpen(true), 2500);
            return () => clearTimeout(timer);
        }
    }, [progressPercent]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 left-6 z-[90] max-w-sm w-80 font-sans">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="glass-strong rounded-3xl p-5 border border-primary/20 shadow-[0_15px_50px_rgba(5,150,105,0.2)] text-foreground overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">LaHustle Quest</h4>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Unlock Free First Delivery</p>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-muted-foreground hover:text-foreground p-1 transition-colors text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1 mb-5">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                                <span>Level 1: Recruit</span>
                                <span className="text-primary">{progressPercent}%</span>
                            </div>
                            <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-primary to-accent"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>

                        {/* Task List */}
                        <div className="space-y-3 mb-4">
                            {tasks.map(task => (
                                <div key={task.id} className="flex items-center gap-3">
                                    <button 
                                        disabled={!task.isInteractive}
                                        onClick={task.action}
                                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                            task.completed 
                                                ? 'bg-primary/20 border-primary text-primary font-bold text-xs' 
                                                : task.isInteractive 
                                                    ? 'border-foreground/20 hover:border-primary cursor-pointer' 
                                                    : 'border-foreground/10 text-transparent'
                                        }`}
                                    >
                                        {task.completed ? '✓' : ''}
                                    </button>
                                    <span 
                                        onClick={task.isInteractive ? task.action : undefined}
                                        className={`text-xs font-bold tracking-wide select-none ${
                                            task.completed ? 'line-through text-muted-foreground' : 'text-foreground/85'
                                        } ${task.isInteractive ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                                    >
                                        {task.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Quest Completion Action */}
                        {progressPercent === 100 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-primary/10 border border-primary/20 rounded-2xl p-3 text-center space-y-2"
                            >
                                <p className="text-[10px] font-black uppercase tracking-wider text-primary">🎉 Quest Complete!</p>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Your First Delivery is Free</p>
                                <button 
                                    onClick={() => setIsVisible(false)}
                                    className="w-full py-2 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
                                >
                                    Claim Reward
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    // Floating circular launcher
                    <motion.button
                        key="launcher"
                        layoutId="quest-launcher"
                        onClick={() => setIsOpen(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="glass p-4 rounded-full border border-primary/30 shadow-lg text-primary hover:text-accent transition-colors flex items-center gap-2 font-black text-xs uppercase tracking-widest"
                    >
                        <span>🏆</span>
                        <span>Quest ({progressPercent}%)</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
