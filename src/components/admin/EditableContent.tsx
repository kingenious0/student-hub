'use client';

import { useState, createElement, useEffect } from 'react';
import type { JSX } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon, CheckIcon } from 'lucide-react'; // Assuming lucide-react or similar icons exist, or usage generic text

type HtmlTag = keyof JSX.IntrinsicElements & string;

interface EditableContentProps {
    id: string;
    initialContent: string;
    tag?: HtmlTag;
    className?: string;
    multiline?: boolean;
}

export default function EditableContent({
    id,
    initialContent,
    tag = 'div',
    className = "",
    multiline = false
}: EditableContentProps) {
    const { contentOverrides, ghostEditMode, refreshConfig } = useAdmin();
    const [isEditing, setIsEditing] = useState(false);
    const [tempContent, setTempContent] = useState('');
    const [saving, setSaving] = useState(false);

    // Determine what to show: Override > Initial
    const displayContent = contentOverrides?.[id] || initialContent;

    useEffect(() => {
        if (isEditing) {
            setTempContent(displayContent);
        }
    }, [isEditing, displayContent]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/system/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updateKey: id,
                    updateValue: tempContent
                })
            });
            if (res.ok) {
                await refreshConfig(); // Fast sync
                setIsEditing(false);
            } else {
                alert('Save failed');
            }
        } catch (e) {
            console.error(e);
            alert('Save failed');
        } finally {
            setSaving(false);
        }
    };

    if (!ghostEditMode) {
        // Normal render
        return createElement(tag, { className }, displayContent);
    }

    // Ghost Mode Render
    return (
        <>
            {createElement(
                tag,
                {
                    className: `${className} cursor-pointer hover:bg-[#39FF14]/10 outline-2 outline-dashed outline-[#39FF14] relative transition-all`,
                    onClick: (e: any) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsEditing(true);
                    },
                    title: 'Ghost Edit: Click to modify'
                },
                displayContent
            )}

            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-surface border border-surface-border w-full max-w-lg rounded-3xl p-6 shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[#39FF14] font-black uppercase tracking-widest text-xs">
                                    Editing: {id}
                                </h3>
                                <button onClick={() => setIsEditing(false)} className="text-foreground/50 hover:text-foreground">
                                    ❌
                                </button>
                            </div>

                            {multiline ? (
                                <textarea
                                    value={tempContent}
                                    onChange={(e) => setTempContent(e.target.value)}
                                    className="w-full h-40 bg-background border border-surface-border rounded-xl p-4 text-foreground font-bold focus:border-[#39FF14] focus:outline-none resize-none mb-6"
                                    autoFocus
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={tempContent}
                                    onChange={(e) => setTempContent(e.target.value)}
                                    className="w-full bg-background border border-surface-border rounded-xl p-4 text-foreground font-bold focus:border-[#39FF14] focus:outline-none mb-6"
                                    autoFocus
                                />
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-4 bg-surface-border text-foreground font-bold rounded-xl uppercase tracking-widest text-xs hover:bg-surface-border/80"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 py-4 bg-[#39FF14] text-black font-black rounded-xl uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
