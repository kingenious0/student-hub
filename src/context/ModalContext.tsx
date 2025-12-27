'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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
}

interface ModalContextType {
    show: (options: ModalOptions) => Promise<boolean | string | null>;
    alert: (message: string, title?: string) => Promise<void>;
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
        type: 'ALERT'
    });
    const [inputValue, setInputValue] = useState('');
    const [resolvePromise, setResolvePromise] = useState<(value: boolean | string | null) => void>(() => { });

    const show = (options: ModalOptions): Promise<boolean | string | null> => {
        return new Promise((resolve) => {
            setConfig({
                ...options,
                type: options.input ? 'PROMPT' : (options.cancelText ? 'CONFIRM' : 'ALERT')
            });
            setInputValue(options.defaultValue || '');
            setResolvePromise(() => resolve);
            setIsOpen(true);
        });
    };

    const alert = async (message: string, title: string = 'Notice') => {
        await show({ message, title, confirmText: 'OK' });
    };

    const confirm = async (message: string, title: string = 'Confirm Action', danger: boolean = false) => {
        const result = await show({
            message,
            title,
            confirmText: danger ? 'Confirm' : 'Yes',
            cancelText: 'Cancel',
            danger
        });
        return result === true;
    };

    const prompt = async (message: string, title: string = 'Input Required', placeholder: string = '', defaultValue: string = '') => {
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

    return (
        <ModalContext.Provider value={{ show, alert, confirm, prompt }}>
            {children}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-[100000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4`}
                        onClick={handleCancel} // Backdrop click cancels
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className={`w-full max-w-md bg-zinc-900 border ${config.danger ? 'border-red-500/50' : 'border-zinc-700'} rounded-2xl shadow-2xl overflow-hidden`}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className={`px-6 py-4 bg-zinc-950/50 border-b border-zinc-800 flex justify-between items-center`}>
                                <h3 className={`font-black uppercase tracking-wider ${config.danger ? 'text-red-500' : 'text-white'}`}>
                                    {config.title}
                                </h3>
                                {/* Close X */}
                                <button onClick={handleCancel} className="text-zinc-500 hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                <p className="text-zinc-300 font-medium leading-relaxed">
                                    {config.message}
                                </p>

                                {config.type === 'PROMPT' && (
                                    <div className="mt-4">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder={config.placeholder}
                                            className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="bg-zinc-900 px-6 py-4 flex justify-end gap-3 border-t border-white/5">
                                {config.cancelText && (
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 rounded-lg font-bold text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition-colors uppercase tracking-wide"
                                    >
                                        {config.cancelText}
                                    </button>
                                )}
                                <button
                                    onClick={handleConfirm}
                                    className={`px-6 py-2 rounded-lg font-bold text-sm text-white shadow-lg transition-transform active:scale-95 uppercase tracking-wide ${config.danger
                                            ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                                            : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
                                        }`}
                                >
                                    {config.confirmText || 'OK'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ModalContext.Provider>
    );
}
