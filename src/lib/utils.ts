import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://res.cloudinary.com')) {
    return url.replace(/^http:\/\/res\.cloudinary\.com/, 'https://res.cloudinary.com');
  }
  return url;
}

