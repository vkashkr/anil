'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const makeSlug = (raw: string) =>
  String(raw)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export default function ClientCityRedirect() {
  const router = useRouter();

  useEffect(() => {
    try {
      const path = window.location.pathname || '/';
      const parts = path.split('/').filter(Boolean);
      const city = parts[0] || '';
      if (!city) return;
      const canonical = makeSlug(city || '');
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
