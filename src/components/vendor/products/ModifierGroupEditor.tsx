'use client';

import { Plus, Trash, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ModifierOption {
  id?: string;
  name: string;
  priceDiff: number;
  isDefault: boolean;
}

interface ModifierGroup {
  id?: string;
  name: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  modifiers: ModifierOption[];
}

interface Props {
  value: ModifierGroup[];
  onChange: (groups: ModifierGroup[]) => void;
  disabled?: boolean;
}

export default function ModifierGroupEditor({ value, onChange, disabled }: Props) {
  const groups = value || [];

  const addGroup = () => {
    onChange([...groups, { name: '', isRequired: false, minSelect: 0, maxSelect: 1, modifiers: [] }]);
  };

  const removeGroup = (i: number) => {
    onChange(groups.filter((_, idx) => idx !== i));
  };

  const updateGroup = (i: number, field: keyof ModifierGroup, val: any) => {
    const updated = groups.map((g, idx) => (idx === i ? { ...g, [field]: val } : g));
    onChange(updated);
  };

  const addModifier = (groupIdx: number) => {
    const updated = groups.map((g, idx) =>
      idx === groupIdx
        ? { ...g, modifiers: [...g.modifiers, { name: '', priceDiff: 0, isDefault: false }] }
        : g
    );
    onChange(updated);
  };

  const removeModifier = (groupIdx: number, modIdx: number) => {
    const updated = groups.map((g, idx) =>
      idx === groupIdx
        ? { ...g, modifiers: g.modifiers.filter((_, mi) => mi !== modIdx) }
        : g
    );
    onChange(updated);
  };

  const updateModifier = (groupIdx: number, modIdx: number, field: keyof ModifierOption, val: any) => {
    const updated = groups.map((g, idx) =>
      idx === groupIdx
        ? {
            ...g,
            modifiers: g.modifiers.map((m, mi) =>
              mi === modIdx ? { ...m, [field]: field === 'priceDiff' ? parseFloat(val) || 0 : val } : m
            ),
          }
        : g
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-semibold">Modifier Groups</Label>
          <p className="text-xs text-muted-foreground">Let customers customize with add-ons, sides, sizes, etc.</p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addGroup} disabled={disabled}>
          <Plus className="w-4 h-4 mr-1" /> Add Group
        </Button>
      </div>

      {groups.length === 0 && (
        <div className="p-6 border-2 border-dashed rounded-xl text-center text-sm text-muted-foreground bg-muted/30">
          No modifier groups yet. Click &quot;Add Group&quot; to let customers customize their order (e.g. Extra Cheese, Sides, Drink Size).
        </div>
      )}

      {groups.map((group, gi) => (
        <div key={gi} className="border rounded-xl p-4 space-y-4 bg-background">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Label>Group Name</Label>
              <Input
                placeholder="e.g. Extra Toppings, Sides, Drink Size"
                value={group.name}
                onChange={(e) => updateGroup(gi, 'name', e.target.value)}
                disabled={disabled}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-6 text-destructive hover:text-destructive shrink-0"
              onClick={() => removeGroup(gi)}
              disabled={disabled}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={group.isRequired}
                onChange={(e) => updateGroup(gi, 'isRequired', e.target.checked)}
                disabled={disabled}
                className="rounded border-input"
              />
              Required
            </label>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Min:</label>
              <Input
                type="number"
                className="w-16 h-8 text-xs"
                value={group.minSelect}
                onChange={(e) => updateGroup(gi, 'minSelect', parseInt(e.target.value) || 0)}
                disabled={disabled}
                min={0}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Max:</label>
              <Input
                type="number"
                className="w-16 h-8 text-xs"
                value={group.maxSelect}
                onChange={(e) => updateGroup(gi, 'maxSelect', parseInt(e.target.value) || 0)}
                disabled={disabled}
                min={0}
              />
            </div>
          </div>

          {/* Modifier Options */}
          <div className="space-y-2 pl-4 border-l-2 border-muted">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Options</span>
              <Button type="button" size="sm" variant="ghost" onClick={() => addModifier(gi)} disabled={disabled}>
                <Plus className="w-3 h-3 mr-1" /> Add Option
              </Button>
            </div>
            {group.modifiers.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No options added yet.</p>
            )}
            {group.modifiers.map((mod, mi) => (
              <div key={mi} className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Option name"
                  value={mod.name}
                  onChange={(e) => updateModifier(gi, mi, 'name', e.target.value)}
                  disabled={disabled}
                  className="flex-1"
                />
                <div className="relative w-24">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₵</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={mod.priceDiff}
                    onChange={(e) => updateModifier(gi, mi, 'priceDiff', e.target.value)}
                    disabled={disabled}
                    className="pl-6 text-xs"
                  />
                </div>
                <label className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <input
                    type="radio"
                    name={`default-${gi}`}
                    checked={mod.isDefault}
                    onChange={() => {
                      const updated = groups.map((g, idx) =>
                        idx === gi
                          ? {
                              ...g,
                              modifiers: g.modifiers.map((m, mii) =>
                                mii === mi ? { ...m, isDefault: true } : { ...m, isDefault: false }
                              ),
                            }
                          : g
                      );
                      onChange(updated);
                    }}
                    disabled={disabled}
                  />
                  Default
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                  onClick={() => removeModifier(gi, mi)}
                  disabled={disabled}
                >
                  <Trash className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
