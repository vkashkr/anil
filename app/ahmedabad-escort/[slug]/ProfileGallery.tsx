'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Props {
  images: string[];
  name: string;
}

export default function ProfileGallery({ images, name }: Props) {
  const [selected, setSelected] = useState(images[0] ?? null);

  if (!images.length) {
    return (
      <div className="w-full aspect-[3/4] rounded-2xl bg-gray-900 border border-white/10 flex flex-col items-center justify-center gap-3 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm font-semibold text-gray-400">Contact for photos</p>
        <p className="text-xs text-gray-600 text-center px-6">Photos shared privately on request via call or WhatsApp</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
        {selected && (
          <Image
            src={selected}
            alt={`${name} — photo`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            unoptimized
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto py-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(img)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                selected === img
                  ? 'border-pink-500 ring-2 ring-pink-500/50'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
