'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ModalType = 'ALERT' | 'CONFIRM' | 'PROMPT' | 'CUSTOM';

interface ModalOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    placeholder?: string;
    danger?: boolean; // For destructive actions
    input?: boolean;
    defaultValue?: string;
    variant?: 'success' | 'error' | 'info' | 'warning' | 'default';
}

interface ModalContextType {
    show: (options: ModalOptions) => Promise<boolean | string | null>;
    alert: (message: string, title?: string, variant?: ModalOptions['variant']) => Promise<void>;
    confirm: (message: string, title?: string, danger?: boolean) => Promise<boolean>;
    prompt: (message: string, title?: string, placeholder?: string, defaultValue?: string) => Promise<string | null>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<ModalOptions & { type: ModalType }>({
        message: '',
        type: 'ALERT',
        variant: 'default'
    });
    const [inputValue, setInputValue] = useState('');
    const [resolvePromise, setResolvePromise] = useState<(value: boolean | string | null) => void>(() => { });

    const show = (options: ModalOptions): Promise<boolean | string | null> => {
        return new Promise((resolve) => {
            setConfig({
                ...options,
                type: options.input ? 'PROMPT' : (options.cancelText ? 'CONFIRM' : 'ALERT'),
                variant: options.variant || (options.danger ? 'error' : 'default')
            });
            setInputValue(options.defaultValue || '');
            setResolvePromise(() => resolve);
            setIsOpen(true);
        });
    };

    const alert = async (message: string, title: string = 'Protocol Notice', variant: ModalOptions['variant'] = 'default') => {
        await show({ message, title, confirmText: 'Acknowledge', variant });
    };

    const confirm = async (message: string, title: string = 'Verification Required', danger: boolean = false) => {
        const result = await show({
            message,
            title,
            confirmText: danger ? 'Execute' : 'Confirm',
            cancelText: 'Abort',
            danger,
            variant: danger ? 'error' : 'default'
        });
        return result === true;
    };

    const prompt = async (message: string, title: string = 'Data Required', placeholder: string = '', defaultValue: string = '') => {
        const result = await show({
            message,
            title,
            input: true,
            confirmText: 'Submit',
            cancelText: 'Cancel',
            placeholder,
            defaultValue
        });
        return typeof result === 'string' ? result : null;
    };

    const handleConfirm = () => {
        setIsOpen(false);
        if (config.type === 'PROMPT') {
            resolvePromise(inputValue);
        } else {
            resolvePromise(true);
        }
    };

    const handleCancel = () => {
        setIsOpen(false);
        if (config.type === 'PROMPT') {
            resolvePromise(null);
        } else {
            resolvePromise(false);
        }
    };

    const getIcon = () => {
        switch (config.variant) {
            case 'success': return <CheckCircle2 className="w-12 h-12 text-primary animate-pulse-glow" />;
            case 'error': return <XCircle className="w-12 h-12 text-red-500 animate-bounce" />;
            case 'info': return <Info className="w-12 h-12 text-blue-400" />;
            case 'warning': return <AlertCircle className="w-12 h-12 text-yellow-500 animate-pulse" />;
            default: return <AlertCircle className="w-12 h-12 text-primary/50" />;
        }
    };

    return (
        <ModalContext.Provider value={{ show, alert, confirm, prompt }}>
            {children}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] bg-black/65 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
                        onClick={handleCancel}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={`w-full max-w-[360px] sm:max-w-[390px] glass-strong rounded-[2rem] border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ${config.variant === 'error' ? 'border-red-500/30' : 'border-primary/20'
                                }`}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Visual Header */}
                            <div className="pt-8 pb-4 flex flex-col items-center gap-4 relative px-6">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
                                <div className="relative z-10 bg-white/5 p-3 rounded-2xl border border-white/10 shadow-2xl">
                                    <div className="scale-90">{getIcon()}</div>
                                </div>
                                <div className="text-center relative z-10">
                                    <h3 className="text-sm sm:text-md font-black uppercase tracking-[0.2em] text-white mb-1.5 px-2">
                                        {config.title}
                                    </h3>
                                    <div className="w-10 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full" />
                                </div>
                            </div>

                            {/* Message */}
                            <div className="px-6 sm:px-8 pb-6 pt-2">
                                <p className="text-white/60 text-center font-bold text-xs uppercase tracking-wider leading-relaxed">
                                    {config.message}
                                </p>

                                {config.type === 'PROMPT' && (
                                    <div className="mt-6 relative group">
                                        <div className="absolute -inset-1 bg-primary/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder={config.placeholder}
                                            className="relative w-full bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-white font-black uppercase text-xs tracking-widest placeholder:text-white/20 focus:border-primary/50 focus:outline-none transition-all"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="p-3 bg-white/[0.02] border-t border-white/5 flex gap-3">
                                {config.cancelText && (
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5 hover:border-white/10"
                                    >
                                        {config.cancelText}
                                    </button>
                                )}
                                <button
                                    onClick={handleConfirm}
                                    className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.25em] transition-all omni-glow active:scale-95 ${config.variant === 'error'
                                            ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.35)]'
                                            : 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-glow))]'
                                        }`}
                                >
                                    {config.confirmText || 'Acknowledge'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ModalContext.Provider>
    );
}
