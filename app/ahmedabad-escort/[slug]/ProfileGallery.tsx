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
      <div className="w-full aspect-[3/4] rounded-2xl bg-gray-800 flex items-center justify-center text-gray-500">
        No photos
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
