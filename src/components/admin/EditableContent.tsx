'use client';

import { useState, createElement } from 'react';

interface EditableContentProps {
    id: string;
    initialContent: string;
    tag?: keyof JSX.IntrinsicElements;
    className?: string;
}

export default function EditableContent({
    id,
    initialContent,
    tag = 'div',
    className = ""
}: EditableContentProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(initialContent);

    // Check if GOD MODE is enabled
    const isGodMode = typeof window !== 'undefined' &&
        localStorage.getItem('OMNI_GOD_MODE_UNLOCKED') === 'true';

    if (!isGodMode) {
        // Not in god mode, just render normally
        return createElement(tag, { className }, content);
    }

    // GOD MODE ACTIVE - Make it editable!

    if (isEditing) {
        // Show input field
        return (
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        setIsEditing(false);
                        alert('✅ Saved! (localStorage only for now)');
                    } else if (e.key === 'Escape') {
                        setContent(initialContent);
                        setIsEditing(false);
                    }
                }}
                onBlur={() => setIsEditing(false)}
                className={`${className} border-4 border-green-500 bg-green-500/10 animate-pulse`}
                autoFocus
            />
        );
    }

    // Normal display with edit hint
    return createElement(
        tag,
        {
            className: `${className} cursor-pointer hover:bg-green-500/10 hover:ring-4 hover:ring-green-500/30 transition-all`,
            onClick: () => setIsEditing(true),
            title: '🔥 GOD MODE: Click to edit!'
        },
        content
    );
}
