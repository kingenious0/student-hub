'use client';

import { X } from 'lucide-react';

interface FilterPill {
  label: string;
  onRemove: () => void;
}

interface FilterPillsProps {
  pills: FilterPill[];
  onClearAll?: () => void;
}

export default function FilterPills({ pills, onClearAll }: FilterPillsProps) {
  if (pills.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
      {pills.map((pill, index) => (
        <button
          key={index}
          onClick={pill.onRemove}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-wider text-primary whitespace-nowrap hover:bg-primary/20 transition-colors shrink-0"
        >
          {pill.label}
          <X className="w-3 h-3" />
        </button>
      ))}
      {onClearAll && pills.length > 1 && (
        <button
          onClick={onClearAll}
          className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-foreground/40 hover:text-foreground transition-colors whitespace-nowrap shrink-0"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
