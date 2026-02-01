'use client';
import React from 'react';
import Image from 'next/image';

type Profile = {
  id: string | number;
  name: string;
  full_path: string;
  [key: string]: any;
};

export default function ProfileMarquee({ profiles }: { profiles: Profile[] }) {
  if (!profiles || profiles.length === 0) return null;

  // Ensure we have enough items for a smooth loop by duplicating sufficient times
  // If we have few items, we need more duplicates to fill the screen width + buffer
  const minItems = 20;
  let displayProfiles = [...profiles];
  while (displayProfiles.length < minItems && profiles.length > 0) {
    displayProfiles = [...displayProfiles, ...profiles];
  }
  // Double it for the loop effect (0% to -50%)
  const duplicatedProfiles = [...displayProfiles, ...displayProfiles];

  return (
    <div className="w-full overflow-hidden bg-black/20 py-6 mb-6 border-y border-fuchsia-500/20 backdrop-blur-sm">
       <div className="relative w-full">
          <div className="animate-marquee flex gap-4 px-2">
             {duplicatedProfiles.map((profile, index) => (
                <div 
                  key={`${profile.id}-marquee-${index}`} 
                  className="relative w-36 h-36 sm:w-48 sm:h-48 flex-shrink-0 rounded-xl overflow-hidden border-2 border-fuchsia-500/30 shadow-[0_0_15px_rgba(232,74,212,0.3)] group cursor-pointer hover:border-yellow-400 transition-all duration-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.5)] transform hover:-translate-y-1"
                >
                   <Image 
                      src={profile.full_path} 
                      alt={profile.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png'; }}
                      sizes="(max-width: 640px) 144px, 122px"
                   />
                   {/* Shine effect */}
                   <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-[shine_1s_ease-in-out]" style={{ transform: 'skewX(-20deg)' }}></div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}
