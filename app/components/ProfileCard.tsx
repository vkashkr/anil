'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Profile = {
  id: string | number;
  name: string;
  age: string | number;
  location?: string;
  full_path: string;
};

interface ProfileCardProps {
  id: string;
  images: Profile[];
}

export default function ProfileCard({ id, images }: ProfileCardProps) {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const profile = images[index];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Safe slug generation
  const slug = (profile.name || 'profile').replace(/\s+/g, '-').toLowerCase();

  return (
    <div className="relative bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group transition-transform duration-200 hover:scale-105">
      <div className="relative aspect-[3/4] w-full flex items-center justify-center bg-gray-100">
        {profile.full_path ? (
          <div className="relative w-full h-[440px] flex items-center justify-center">
            <Link 
              href={`/profile/${encodeURIComponent(slug)}`} 
              className="block w-full h-full relative"
            >
              <Image
                key={`${profile.full_path}-${index}`}
                src={profile.full_path}
                alt={profile.name}
                width={340}
                height={700}
                className="object-cover w-full h-full transition-transform transition-opacity duration-500 ease-in-out scale-95 opacity-0 animate-pink-fade-in"
                style={{ borderRadius: '16px 16px 0 0' }}
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.classList.remove('opacity-0');
                  img.classList.add('opacity-100', 'scale-100');
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder.svg';
                }}
              />
            </Link>

            {/* Top-right badge */}
            <div className="absolute top-3 right-3 bg-fuchsia-600 bg-opacity-90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow z-20 pointer-events-none">
              Aliya <span className="ml-1 text-fuchsia-200">♥</span>
            </div>

            {/* Carousel arrows */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-transparent text-gray-900 rounded-full w-9 h-9 flex items-center justify-center shadow-lg z-30 hover:bg-fuchsia-600 hover:text-white transition-colors border border-white"
                  onClick={prevImage}
                  aria-label="Previous image"
                >
                  <span className="text-xl font-bold text-fuchsia-600">{'<'}</span>
                </button>
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent bg-opacity-80 text-gray-900 rounded-full w-9 h-9 flex items-center justify-center shadow-lg z-30 hover:bg-fuchsia-600 hover:text-white transition-colors border border-white"
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  <span className="text-xl font-bold text-fuchsia-600">{'>'}</span>
                </button>
              </>
            )}

            {/* Image count badge */}
            {images.length > 1 && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex items-center gap-1 z-20 pointer-events-none">
                {(() => {
                  const total = images.length;
                  let start = 0;
                  if (total > 3) {
                    if (index === 0) start = 0;
                    else if (index === total - 1) start = total - 3;
                    else start = index - 1;
                  }
                  
                  return Array.from({ length: Math.min(3, total) }, (_, j) => {
                    const i = (total > 3) ? start + j : j;
                    const isSelected = i === index;
                    return (
                      <span
                        key={i}
                        className={`w-4 h-4 flex items-center justify-center rounded-full border border-white/80 ${
                          isSelected ? 'bg-black/90 text-white font-bold scale-110 shadow-lg' : 'bg-black/40 text-white/60'
                        }`}
                        style={{ transition: 'all 0.2s' }}
                      >
                         <span className="text-[10px] font-bold select-none leading-none flex items-center justify-center w-full h-full" style={{fontVariantNumeric:'tabular-nums'}}>
                            {isSelected ? (i + 1) : ''}
                         </span>
                      </span>
                    );
                  });
                })()}
              </div>
            )}

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 w-full flex justify-between items-end px-4 pb-3 z-20 pointer-events-none">
              <div className="flex flex-col items-start">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-0 leading-tight drop-shadow">{profile.name || '-'}</h2>
                <div className="text-gray-200 text-xs sm:text-sm font-medium mt-0.5 drop-shadow flex items-center">
                  <span role="img" aria-label="Location" className="mr-1">📍</span> {profile.location || 'Ahmedabad'}
                </div>
              </div>
              {profile.age && profile.age !== '-' && (
                <div className="bg-pink-600 text-white text-xs font-bold rounded-full px-3 py-1 drop-shadow">
                  {profile.age}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">No Image</div>
        )}
      </div>
    </div>
  );
}