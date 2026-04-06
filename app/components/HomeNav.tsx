'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PHONE_TEL, WHATSAPP_URL } from '@/app/lib/constants';

type HomeProfile = {
  id: string | number;
  name: string;
  location?: string;
  seoTitle?: string;
  full_path: string;
  metadata?: { city?: string; [key: string]: unknown };
};

interface HomeNavProps {
  initialProfilesById: Record<string, HomeProfile[]>;
}

export default function HomeNav({ initialProfilesById }: HomeNavProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 80) {
        setNavHidden(true);
        setMobileMenuOpen(false);
      } else {
        setNavHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilteredProfiles = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return Object.entries(initialProfilesById).filter(([, images]) => {
      const p = images[0];
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.metadata?.city && (p.metadata.city as string).toLowerCase().includes(q))
      );
    });
  };

  const navigateToProfile = (name: string, seoTitle?: string) => {
    const rawSlug = seoTitle || name;
    const slug = rawSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    router.push(`/ahmedabad/escorts/${encodeURIComponent(slug)}`);
    setSearchQuery('');
    setSearchFocused(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 pt-2 sm:pt-3 transition-transform duration-300 ${navHidden ? '-translate-y-full md:translate-y-0' : 'translate-y-0'}`}>
      <div className="max-w-6xl mx-auto bg-black/30 backdrop-blur-xl rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 border border-white/10 shadow-2xl">
        {/* Top row */}
        <div className="flex justify-between items-center">
          <a href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-lg sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-yellow-300">Aliya Escort</span>
          </a>

          {/* Desktop search */}
          <div className="flex-1 max-w-xs mx-4 hidden md:block" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchFocused(true); }}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const results = getFilteredProfiles();
                    if (results.length === 1) navigateToProfile(results[0][1][0].name);
                  }
                }}
                placeholder="Search girls..."
                className="w-full bg-white/10 border border-white/15 rounded-full pl-9 pr-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:bg-white/15 transition"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchFocused && searchQuery.trim() && (() => {
                const results = getFilteredProfiles();
                if (results.length === 0) return (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl p-3 text-center text-gray-400 text-sm">No results found</div>
                );
                return (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl max-h-64 overflow-y-auto">
                    {results.slice(0, 8).map(([id, images]) => {
                      const p = images[0];
                      return (
                        <button key={id} onClick={() => navigateToProfile(p.name)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition text-left">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.full_path} alt={p.name} className="w-9 h-9 rounded-full object-cover border border-white/20" />
                          <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                            <p className="text-gray-400 text-xs truncate">{p.location || p.metadata?.city || ''}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-4 text-sm flex-shrink-0">
            <a href="/ahmedabad/escorts" className="text-gray-300 hover:text-pink-300 transition flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Profiles
            </a>
            <a href="/login" className="text-gray-300 hover:text-pink-300 transition flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
              Login
            </a>
            <a href="/login/signup" className="text-gray-300 hover:text-pink-300 transition flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              Register
            </a>
            <a href={PHONE_TEL} className="bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-semibold px-4 py-1.5 rounded-full text-sm hover:from-pink-400 hover:to-fuchsia-400 transition shadow-lg">
              📞 Call Now
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold px-4 py-1.5 rounded-full text-sm hover:from-green-400 hover:to-teal-400 transition shadow-lg">
              💬 WhatsApp
            </a>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setMobileMenuOpen(v => !v)} className="text-gray-300 hover:text-white p-1.5">
              {mobileMenuOpen
                ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="mt-2 md:hidden" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchFocused(true); }}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const results = getFilteredProfiles();
                  if (results.length === 1) navigateToProfile(results[0][1][0].name, results[0][1][0].seoTitle);
                }
              }}
              placeholder="Search girls..."
              className="w-full bg-white/10 border border-white/15 rounded-full pl-9 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:bg-white/15 transition"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchFocused && searchQuery.trim() && (() => {
              const results = getFilteredProfiles();
              if (results.length === 0) return (
                <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl p-3 text-center text-gray-400 text-sm z-50">No results found</div>
              );
              return (
                <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl max-h-64 overflow-y-auto z-50">
                  {results.slice(0, 8).map(([id, images]) => {
                    const p = images[0];
                    return (
                      <button key={id} onClick={() => navigateToProfile(p.name, p.seoTitle)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition text-left">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.full_path} alt={p.name} className="w-9 h-9 rounded-full object-cover border border-white/20" />
                        <div className="min-w-0">
                          <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                          <p className="text-gray-400 text-xs truncate">{p.location || p.metadata?.city || ''}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 pt-2 border-t border-white/10 grid grid-cols-4 gap-2">
            <a href="/ahmedabad/escorts" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-white/10 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="text-gray-300 text-xs">Profiles</span>
            </a>
            <a href="/login" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-white/10 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
              <span className="text-gray-300 text-xs">Login</span>
            </a>
            <a href="/login/signup" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-white/10 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              <span className="text-gray-300 text-xs">Register</span>
            </a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-white/10 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-gray-300 text-xs">About</span>
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
