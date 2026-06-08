'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, UploadCloud, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
    value: (File | string)[];
    onChange: (files: (File | string)[]) => void;
    maxFiles?: number;
    disabled?: boolean;
}

export const ImageUploader = ({ value = [], onChange, maxFiles = 10, disabled }: ImageUploaderProps) => {
    const previews = useMemo(() => {
        return value.map(item => {
            if (typeof item === 'string') return item;
            return URL.createObjectURL(item);
        });
    }, [value]);

    useEffect(() => {
        return () => {
            previews.forEach((url, i) => {
                if (typeof value[i] !== 'string') {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [previews, value]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = [...value, ...acceptedFiles].slice(0, maxFiles);
        onChange(newFiles);
    }, [value, onChange, maxFiles]);

    const onRemove = (index: number) => {
        const newValue = [...value];
        newValue.splice(index, 1);
        onChange(newValue);
    };

    const onSetCover = (index: number) => {
        if (index === 0) return;
        const newValue = [...value];
        const item = newValue[index];
        newValue.splice(index, 1);
        newValue.unshift(item);
        onChange(newValue);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: maxFiles - value.length,
        disabled: disabled || value.length >= maxFiles
    });

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer flex flex-col items-center justify-center text-center",
                    isDragActive ? "border-primary bg-primary/5" : "border-zinc-200 dark:border-zinc-800 hover:border-primary/50",
                    (disabled || value.length >= maxFiles) && "opacity-50 cursor-not-allowed"
                )}
                style={value.length >= maxFiles ? { display: 'none' } : undefined}
            >
                <input {...getInputProps()} />
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                    <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold uppercase tracking-wide">
                    {isDragActive ? 'Drop images here' : 'Click or Drag images'}
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                    Supports JPG, PNG, WEBP. Max {maxFiles} images.
                </p>
            </div>

            {value.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {value.map((item, index) => (
                        <div key={`${previews[index]}-${index}`} className="group relative aspect-square bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                            <img
                                src={previews[index] || ''}
                                alt="Product preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '';
                                    (e.target as HTMLImageElement).classList.add('hidden');
                                }}
                            />
                            {(!previews[index]) && (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                                    <UploadCloud className="w-8 h-8" />
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => onSetCover(index)}
                                    className={cn(
                                        "p-2 rounded-full backdrop-blur-md transition-colors",
                                        index === 0 ? "bg-yellow-400 text-black" : "bg-white/20 text-white hover:bg-white/40"
                                    )}
                                    title="Set as Cover"
                                >
                                    <Star className="w-4 h-4" fill={index === 0 ? "currentColor" : "none"} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onRemove(index)}
                                    className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors"
                                    title="Remove"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {index === 0 && (
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur text-[10px] font-black uppercase text-white rounded-md tracking-wider">
                                    Cover
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
