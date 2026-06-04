'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export function useFilterUrlParam(name: string, defaultValue: string = '') {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const value = searchParams.get(name) || defaultValue;

  const setValue = useCallback(
    (newValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!newValue || newValue === defaultValue) {
        params.delete(name);
      } else {
        params.set(name, newValue);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname, name, defaultValue]
  );

  return [value, setValue] as const;
}

export function useFilterUrlBool(name: string, defaultValue: boolean = false) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const value = searchParams.get(name) === 'true' || defaultValue;

  const setValue = useCallback(
    (newValue: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!newValue || newValue === defaultValue) {
        params.delete(name);
      } else {
        params.set(name, 'true');
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname, name, defaultValue]
  );

  return [value, setValue] as const;
}
