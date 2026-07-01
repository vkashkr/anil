'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resolveAllowedCitySlug } from '@/app/lib/city-slugs';

export default function ClientCityRedirect() {
  const router = useRouter();

  useEffect(() => {
    try {
      const path = window.location.pathname || '/';
      const parts = path.split('/').filter(Boolean);
      const city = parts[0] || '';
      if (!city) return;
      const canonical = resolveAllowedCitySlug(city || '');
      if (!canonical) {
        router.replace('/ahmedabad/escorts');
        return;
      }
      const expected = `/${canonical}/escorts`;
      if (path.toLowerCase() !== expected.toLowerCase()) {
        router.replace(expected);
      }
    } catch (e) {
      // noop
    }
  }, [router]);

  return null;
}
