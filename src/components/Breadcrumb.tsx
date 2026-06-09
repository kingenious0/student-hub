'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items?: BreadcrumbItem[];
    customItems?: BreadcrumbItem[];
}

export default function Breadcrumb({ items, customItems }: BreadcrumbProps) {
    const pathname = usePathname();

    // Generate breadcrumbs from pathname if no custom items provided
    const generateBreadcrumbs = (): BreadcrumbItem[] => {
        if (customItems) return customItems;
        if (items) return items;

        const paths = pathname?.split('/').filter(Boolean) || [];
        const breadcrumbs: BreadcrumbItem[] = [
            { label: 'LaHustle', href: '/marketplace' }
        ];

        let currentPath = '';
        paths.forEach((path, index) => {
            currentPath += `/${path}`;
            const label = path
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            breadcrumbs.push({
                label,
                href: index === paths.length - 1 ? undefined : currentPath
            });
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    return (
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6">
            {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                    {crumb.href ? (
                        <Link
                            href={crumb.href}
                            className="text-foreground/40 hover:text-primary transition-colors"
                        >
                            {crumb.label}
                        </Link>
                    ) : (
                        <span className="text-primary">{crumb.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 && (
                        <span className="text-foreground/20">/</span>
                    )}
                </div>
            ))}
        </nav>
    );
}
