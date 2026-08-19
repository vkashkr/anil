'use client';
import React from 'react';

export default function HeroVideo() {
  return (
    <div className="w-full max-w-md mx-auto my-8 px-4 relative z-10">
      <div className="relative group rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(236,72,153,0.3)] border-2 border-pink-500/30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10 pointer-events-none"></div>
        
        <video 
          className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
          controls 
          autoPlay 
          muted 
          loop
          playsInline
          poster="/images/placeholder.svg"
        >
          <source src="/title.mp4" type="video/mp4" />
          <track kind="captions" src="/captions/hero-empty.vtt" srcLang="en" label="English" />
          Your browser does not support the video tag.
        </video>

        {/* Floating badges */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <span className="bg-black/40 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Online Now
          </span>
        </div>

        <div className="absolute bottom-6 left-6 z-20 text-left">
           <h2 className="text-2xl font-bold text-white drop-shadow-md mb-1">
             Aliya, 22
           </h2>
           <p className="text-pink-300 text-sm font-medium flex items-center gap-1">
             <span className="bg-pink-600 text-white text-[10px] px-1.5 rounded">NEW</span>
             Top Rated Model
           </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-4 w-1 h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent z-20 rounded-full"></div>
        <div className="absolute top-1/2 right-4 w-1 h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent z-20 rounded-full"></div>
      </div>
    </div>
  );
}
