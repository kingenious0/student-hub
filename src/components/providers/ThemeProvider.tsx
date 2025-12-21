
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'standard' | 'omni';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('omni');

    useEffect(() => {
        const savedTheme = localStorage.getItem('omni-theme') as Theme;
        if (savedTheme) {
            setTimeout(() => setTheme(savedTheme), 0);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            document.documentElement.setAttribute('data-theme', 'omni');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'omni' ? 'standard' : 'omni';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('omni-theme', newTheme);
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
