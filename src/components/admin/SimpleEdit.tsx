'use client';

import { useState, useEffect, createElement } from 'react';
import type { JSX } from 'react';
import EditModal from './EditModal';
import { useAdmin } from '@/context/AdminContext';

interface SimpleEditProps {
    id: string;
    text: string;
    tag?: HtmlTag;
    className?: string;
}

type HtmlTag = keyof JSX.IntrinsicElements & string;

export default function SimpleEdit({ id, text, tag = 'div', className = '' }: SimpleEditProps) {
    const { contentOverrides, refreshConfig, superAccess } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Use override from database if exists, otherwise use default text
    const displayText = contentOverrides[id] !== undefined ? contentOverrides[id] : text;

    const handleSave = async (newText: string) => {
        try {
            // Save to database via centralized System Config
            const response = await fetch('/api/system/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ updateKey: id, updateValue: newText })
            });

            if (response.ok) {
                // Refresh config to get updated content for ALL users
                await refreshConfig();

                // Show success notification
                const notification = document.createElement('div');
                notification.className = 'fixed top-4 right-4 z-[10000] bg-[#39FF14] text-black font-black px-6 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top';
                notification.innerHTML = '✅ Global Update Live!<br/><span class="text-xs">Synced to all devices instantly.</span>';
                document.body.appendChild(notification);

                setTimeout(() => {
                    notification.remove();
                }, 3000);
            } else {
                const err = await response.text();
                alert(`❌ Failed to save: ${err}`);
                console.error('Save failed:', err);
            }
        } catch (error) {
            console.error('[SimpleEdit] Save error:', error);
            alert('❌ Connection error. Could not save.');
        }
    };

    if (!superAccess) {
        return createElement(tag, { className }, displayText);
    }

    // GOD MODE: Make it editable!
    return (
        <>
            {createElement(
                tag,
                {
                    className: `${className} cursor-pointer hover:ring-4 hover:ring-[#39FF14]/50 hover:bg-[#39FF14]/5 transition-all rounded-lg relative group`,
                    onClick: () => setIsModalOpen(true),
                    title: '🔥 GOD MODE: Click to edit!'
                },
                <>
                    {displayText}
                    <span className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#39FF14] text-black text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                        EDIT
                    </span>
                </>
            )}

            <EditModal
                isOpen={isModalOpen}
                currentText={String(displayText)}
                onSave={handleSave}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
