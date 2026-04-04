'use client';
import React, { useState } from 'react';
import ProfileCard from '@/app/components/ProfileCard';
import { PHONE_TEL, WHATSAPP_URL } from '@/app/lib/constants';

type HomeProfile = {
  id: string | number;
  name: string;
  age: string | number;
  gender?: string;
  description?: string;
  location?: string;
  filename?: string;
  full_path: string;
  metadata?: Record<string, unknown>;
};

interface HomeProfileGridProps {
  initialProfilesById: Record<string, HomeProfile[]>;
  initialNextToken: string | null;
}

export default function HomeProfileGrid({ initialProfilesById, initialNextToken }: HomeProfileGridProps) {
  const [profilesById, setProfilesById] = useState<Record<string, HomeProfile[]>>(initialProfilesById);
  const [nextToken, setNextToken] = useState<string | null>(initialNextToken);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchMore = async (token: string) => {
    try {
      const res = await fetch(`/bff/api/profiles?limit=100&next_token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (!data?.success || !data.data) return;

      const rawImages = data.data.images || [];
      setNextToken(data.data.next_token || null);

      const mapped: HomeProfile[] = rawImages.map((img: Record<string, unknown> & { metadata?: Record<string, unknown>; filename?: string; full_path: string }) => ({
        id: String((img.metadata?.id) || (img.filename ? (img.filename as string).split('/')[0] : '')),
        name: (img.metadata?.name as string) || '-',
        age: (img.metadata?.age as string | number) || '-',
        gender: img.metadata?.gender as string | undefined,
        description: img.metadata?.description as string | undefined,
        location: img.metadata?.location as string | undefined,
        filename: img.filename,
        full_path: img.full_path,
        metadata: (img.metadata as Record<string, unknown>) || {},
      }));

      const grouped: Record<string, HomeProfile[]> = {};
      const metaById: Record<string, Record<string, unknown>> = {};

      mapped.forEach((profile) => {
        if (!grouped[profile.id as string]) grouped[profile.id as string] = [];
        grouped[profile.id as string].push(profile);
        if (profile.filename?.endsWith('profile.jpg')) {
          metaById[profile.id as string] = profile.metadata || {};
        }
      });

      setProfilesById(prev => {
        const combined = { ...prev };
        Object.entries(grouped).forEach(([id, newImages]) => {
          if (combined[id]) {
            const existing = combined[id];
            const existingPaths = new Set(existing.map(p => p.full_path));
            const merged = [...existing, ...newImages.filter(img => !existingPaths.has(img.full_path))];
            combined[id] = merged;
          } else {
            combined[id] = newImages;
          }
        });
        return combined;
      });
    } catch (error) {
      console.error('Error loading more profiles:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (nextToken && !loadingMore) {
      setLoadingMore(true);
      fetchMore(nextToken);
    }
  };

  return (
    <>
      {/* Profile Grid */}
      <div id="profiles" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-4 px-2">
        {Object.entries(profilesById).map(([id, images]) => (
          <ProfileCard key={id} id={id} images={images} />
        ))}
      </div>

      {/* Load More */}
      {nextToken && (
        <div className="flex justify-center py-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>Load More Girls <span className="text-xl">💃</span></>
            )}
          </button>
        </div>
      )}

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="flex">
          <a href={PHONE_TEL} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white font-bold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            Call Now
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.29-1.248l-.308-.184-2.87.852.852-2.87-.184-.308A8 8 0 1112 20z"/></svg>
            WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
