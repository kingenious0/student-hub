
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'standard' | 'lahustle';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('standard');

    useEffect(() => {
        const savedTheme = localStorage.getItem('lahustle-theme') as Theme;
        if (savedTheme) {
            setTimeout(() => setTheme(savedTheme), 0);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            document.documentElement.setAttribute('data-theme', 'standard');
        }

        // Apply custom accent color
        const savedColor = localStorage.getItem('lahustle-theme-color');
        if (savedColor) {
            document.documentElement.style.setProperty('--primary', savedColor);
            const glow = savedColor.replace('rgb', 'rgba').replace(')', ', 0.4)');
            document.documentElement.style.setProperty('--primary-glow', glow);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'lahustle' ? 'standard' : 'lahustle';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('lahustle-theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
