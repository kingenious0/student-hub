'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditModalProps {
    isOpen: boolean;
    currentText: string;
    onSave: (newText: string) => void;
    onClose: () => void;
}

export default function EditModal({ isOpen, currentText, onSave, onClose }: EditModalProps) {
    const [text, setText] = useState(currentText);

    useEffect(() => {
        setText(currentText);
    }, [currentText]);

    const handleSave = () => {
        if (text.trim()) {
            onSave(text);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    >
                        <div className="bg-surface border-2 border-[#39FF14] rounded-3xl p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(57,255,20,0.3)]">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-[#39FF14]/20 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">✏️</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
                                        God Mode Edit
                                    </h2>
                                    <p className="text-foreground/40 text-xs uppercase tracking-widest font-bold">
                                        Live Content Editor
                                    </p>
                                </div>
                            </div>

                            {/* Input */}
                            <div className="mb-6">
                                <label className="block text-foreground/60 text-xs uppercase tracking-widest font-bold mb-2">
                                    Edit Content
                                </label>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.metaKey) {
                                            handleSave();
                                        } else if (e.key === 'Escape') {
                                            onClose();
                                        }
                                    }}
                                    className="w-full bg-background border-2 border-surface-border focus:border-[#39FF14] rounded-xl p-4 text-foreground font-mono text-lg resize-none focus:outline-none transition-colors"
                                    rows={4}
                                    autoFocus
                                    placeholder="Enter your content..."
                                />
                                <p className="text-foreground/30 text-xs mt-2">
                                    Press <kbd className="px-2 py-1 bg-surface-border rounded text-[10px]">⌘ Enter</kbd> to save or <kbd className="px-2 py-1 bg-surface-border rounded text-[10px]">Esc</kbd> to cancel
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-[#39FF14] hover:bg-[#2de100] text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] active:scale-95"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-6 bg-surface-border hover:bg-red-500/20 text-foreground/60 hover:text-red-500 font-black uppercase tracking-widest py-4 rounded-xl transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>

                            {/* Note */}
                            <div className="mt-6 p-4 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-xl">
                                <p className="text-foreground/60 text-xs">
                                    💡 <span className="font-bold text-[#39FF14]">Pro Tip:</span> Changes are saved to your browser. To make them permanent for all users, contact your dev team to sync to database.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
