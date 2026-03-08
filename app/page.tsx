'use client';
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import ProfileMarquee from "./components/ProfileMarquee";
import HeroVideo from "./components/HeroVideo";
import ProfileCard from "./components/ProfileCard";
import SEOContent from "./components/SEOContent";
import { PHONE_TEL, PHONE_DISPLAY, WHATSAPP_URL } from './lib/constants';

type Profile = {
  id: string | number;
  name: string;
  age: string | number;
  gender?: string;
  description?: string;
  location?: string;
  filename?: string;
  full_path: string;
  metadata?: any;
};

export default function Home() {
  const router = useRouter();
  const [profilesById, setProfilesById] = useState<{ [id: string]: Profile[] }>({});
  const [loading, setLoading] = useState(true);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const getFilteredProfiles = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return Object.entries(profilesById).filter(([, images]) => {
      const p = images[0];
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.metadata?.city && p.metadata.city.toLowerCase().includes(q)) ||
        (p.metadata?.place && p.metadata.place.toLowerCase().includes(q))
      );
    });
  };

  const navigateToProfile = (id: string, name: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`profile_id_${name}`, id);
    }
    router.push(`/profile?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`);
    setSearchQuery('');
    setSearchFocused(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProfiles = async (token?: string | null) => {
    try {
       const url = token ? `/bff/api/profiles?limit=100&next_token=${encodeURIComponent(token)}` : '/bff/api/profiles?limit=100';
       const res = await fetch(url);
       const data = await res.json();
       
       if (data && data.success && data.data) {
          const rawImages = data.data.images || [];
          const newNextToken = data.data.next_token || null;
          
          setNextToken(newNextToken);
          
          // Process Data
          const mapped = rawImages.map((img: any) => ({
            id: (img.metadata && img.metadata.id) || (img.filename ? img.filename.split('/')[0] : img.filename),
            name: img.metadata?.name || "-",
            age: img.metadata?.age || "-",
            gender: img.metadata?.gender,
            description: img.metadata?.description,
            location: img.metadata?.location,
            filename: img.filename,
            full_path: img.full_path,
            metadata: img.metadata || {},
          }));

          const grouped: { [id: string]: Profile[] } = {};
          const metaById: { [id: string]: any } = {};
          
          mapped.forEach((profile: Profile) => {
            if (!grouped[profile.id]) grouped[profile.id] = [];
            grouped[profile.id].push(profile);
            if (profile.filename && profile.filename.endsWith('profile.jpg')) {
              metaById[profile.id] = profile.metadata;
            }
          });

          // Consolidate metadata across the group (current batch)
          Object.entries(grouped).forEach(([id, images]) => {
            if (metaById[id]) {
              grouped[id] = images.map(img => ({ ...img, ...metaById[id] }));
            }
          });

          setProfilesById(prev => {
             const combined = { ...prev };
             
             Object.entries(grouped).forEach(([id, newImages]) => {
                 if (combined[id]) {
                     // Merge new images with existing
                     const existing = combined[id];
                     const existingPaths = new Set(existing.map(p => p.full_path));
                     const validNew = newImages.filter(img => !existingPaths.has(img.full_path));
                     
                     let allImages = [...existing, ...validNew];

                     // Find best metadata source (prefer existing if valid, else new)
                     const metaSource = allImages.find(img => img.name && img.name !== "-") 
                                     || allImages.find(img => img.metadata && Object.keys(img.metadata).length > 0);

                     if (metaSource) {
                         // Apply metadata to all images in the group to ensure consistency
                         const { name, age, gender, description, location, metadata } = metaSource;
                         allImages = allImages.map(img => ({
                             ...img,
                             name: name !== "-" ? name : img.name,
                             age: age !== "-" ? age : img.age,
                             gender: gender || img.gender,
                             description: description || img.description,
                             location: location || img.location,
                             metadata: metadata || img.metadata
                         }));
                     }
                     combined[id] = allImages;
                 } else {
                     combined[id] = newImages;
                 }
             });
             return combined;
          });
       }
    } catch (error) {
       console.error("Error fetching profiles:", error);
    } finally {
       setLoading(false);
       setLoadingMore(false);
    }
  };

  useEffect(() => {
    // Initial Load
    fetchProfiles(null);
  }, []);

  const handleLoadMore = () => {
    if (nextToken && !loadingMore) {
        setLoadingMore(true);
        fetchProfiles(nextToken);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans dark:bg-black flex flex-col">
      {/* Floating Nav Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center bg-black/30 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/10 shadow-2xl">
          <a href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-yellow-300">Aliya Escort</span>
          </a>
          <div className="flex-1 max-w-xs mx-4 hidden sm:block" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const results = getFilteredProfiles();
                    if (results.length === 1) {
                      navigateToProfile(results[0][0], results[0][1][0].name);
                    }
                  }
                }}
                placeholder="Search girls..."
                className="w-full bg-white/10 border border-white/15 rounded-full pl-9 pr-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:bg-white/15 transition"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {/* Search Dropdown */}
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
                        <button
                          key={id}
                          onClick={() => navigateToProfile(id, p.name)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition text-left"
                        >
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
          <div className="flex items-center gap-4 text-sm flex-shrink-0">
            <a href="#profiles" className="text-gray-300 hover:text-pink-300 transition hidden sm:inline">Profiles</a>
            <a href={PHONE_TEL} className="bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-semibold px-4 py-1.5 rounded-full text-sm hover:from-pink-400 hover:to-fuchsia-400 transition shadow-lg">
              📞 Call Now
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold px-4 py-1.5 rounded-full text-sm hover:from-green-400 hover:to-teal-400 transition shadow-lg">
              💬 WhatsApp
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="w-full bg-gradient-to-br from-black via-fuchsia-950 to-pink-900 pt-20 pb-10 px-2 flex flex-col items-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0" style={{background: 'radial-gradient(circle at 80% 10%, rgba(255,0,128,0.10) 0, transparent 70%), radial-gradient(circle at 10% 90%, rgba(255,255,0,0.08) 0, transparent 70%)'}}></div>
        <h1 className="relative z-10 text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-500 to-yellow-300 text-center leading-tight drop-shadow-pink animate-pulse mb-3">
          Ahmedabad Escort & Local Call Girls <span className="inline-block animate-bounce">👄</span>
        </h1>
        {/* Marquee with improved data handling */}
      <ProfileMarquee profiles={Object.values(profilesById).map(p => p[0])} />

        <p className="relative z-10 text-lg sm:text-xl text-gray-100 max-w-xl sm:max-w-2xl text-center mb-4 font-medium">
          <span className="bg-black/30 px-3 py-2 rounded-2xl shadow-lg backdrop-blur-sm inline-block">
            Welcome to <span className="font-bold text-pink-300">Aliya Escort Ahmedabad</span> – your trusted directory for <span className="text-fuchsia-300 font-semibold">genuine, independent call girls</span> and <span className="text-yellow-200 font-semibold">premium escort services</span> in Ahmedabad.<br className="hidden sm:block"/> Book local girls for home or hotel delivery, enjoy <span className="italic text-pink-200">safe, private, and affordable companionship</span>. <span className="text-yellow-300 font-bold">No advance payment</span>, <span className="text-fuchsia-200 font-bold">100% privacy</span>, and <span className="text-pink-200 font-bold">real profiles only</span>.
          </span>
        </p>
        <span className="relative z-10 text-pink-200 font-semibold text-base sm:text-lg bg-black/20 px-4 py-1 rounded-full shadow-md tracking-wide animate-pulse mt-1">
          Ahmedabad’s <span className="text-yellow-200 font-bold">#1 Local Girl Service</span> | <span className="text-fuchsia-200 font-bold">1000+ Verified Profiles</span>
        </span>
      </div>
      
      <HeroVideo />

      
      {/* Grid Section */}
      <div id="profiles" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-4 px-2">
        {loading && Object.keys(profilesById).length === 0 ? (
          <div className="col-span-full flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <>
            {(searchQuery.trim() ? getFilteredProfiles() : Object.entries(profilesById))
              .map(([id, images]) => (
              <ProfileCard key={id} id={id} images={images} />
            ))}
          </>
        )}
      </div>

      {/* Pagination Load More */}
      {nextToken && (
        <div className="flex justify-center py-8">
           <button 
             onClick={handleLoadMore} 
             disabled={loadingMore}
             className="bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
           >
             {loadingMore ? (
               <>
                 <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
                 Loading...
               </>
             ) : (
               <>
                 Load More Girls <span className="text-xl">💃</span>
               </>
             )}
           </button>
        </div>
      )}

      <SEOContent />

      <footer className="mt-12 border-t border-white/10 bg-black/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand */}
            <div>
              <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-yellow-300 mb-4">
                Aliya Escort
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Premium escort services in Ahmedabad & Gujarat. Trusted by thousands of satisfied clients since 2020. Real profiles, verified photos, genuine service.
              </p>
              <div className="flex gap-3 mt-4">
                <span className="w-9 h-9 rounded-full bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-300 text-sm hover:bg-pink-600/40 transition cursor-pointer">📷</span>
                <span className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 text-sm hover:bg-blue-600/40 transition cursor-pointer">🐦</span>
                <span className="w-9 h-9 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center text-green-300 text-sm hover:bg-green-600/40 transition cursor-pointer">💬</span>
              </div>
            </div>

            {/* About Us */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">About Us</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">
                Ahmedabad&apos;s most trusted escort agency, providing discreet and professional companionship services.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><span className="text-pink-400">✓</span> 100% Verified Profiles</li>
                <li className="flex items-center gap-2"><span className="text-pink-400">✓</span> Real & Recent Photos</li>
                <li className="flex items-center gap-2"><span className="text-pink-400">✓</span> Complete Privacy Guaranteed</li>
                <li className="flex items-center gap-2"><span className="text-pink-400">✓</span> 24/7 Availability</li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-pink-300 transition">Home</a></li>
                <li><a href="#profiles" className="text-gray-400 hover:text-pink-300 transition">All Profiles</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300 transition">VIP Escorts</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300 transition">New Arrivals</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300 transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300 transition">Terms of Service</a></li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">📞</span>
                  <div>
                    <p className="text-white font-semibold">Phone</p>
                    <a href={PHONE_TEL} className="hover:text-pink-300 transition">{PHONE_DISPLAY}</a>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">💬</span>
                  <div>
                    <p className="text-white font-semibold">WhatsApp</p>
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-pink-300 transition">Chat with us</a>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">📍</span>
                  <div>
                    <p className="text-white font-semibold">Location</p>
                    <p>Ahmedabad, Gujarat, India</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">🕐</span>
                  <div>
                    <p className="text-white font-semibold">Available</p>
                    <p>24 Hours / 7 Days</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-10 pt-6 border-t border-white/10">
            <div className="bg-gradient-to-r from-fuchsia-950/50 via-black/40 to-yellow-950/50 rounded-xl p-4 border border-yellow-500/20 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
                <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-fuchsia-500">18+ DISCLAIMER</span>
              </div>
              <p className="text-gray-400 text-xs text-center leading-relaxed max-w-2xl mx-auto">
                This website contains adult content intended exclusively for individuals aged 18 years and above. By entering and using this site, you confirm that you are of legal age in your jurisdiction. All profiles are of consenting adults. We are committed to protecting your privacy — personal data is never shared with third parties. All services are subject to mutual consent between adults. The management is not responsible for any misrepresentation by individual service providers.
              </p>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <p className="text-gray-500 text-xs text-center md:text-left">
                © 2026 Aliya Escort Ahmedabad. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <a href="#" className="hover:text-pink-300 transition">Privacy Policy</a>
                <span className="text-gray-700">|</span>
                <a href="#" className="hover:text-pink-300 transition">Terms of Service</a>
                <span className="text-gray-700">|</span>
                <a href="#" className="hover:text-pink-300 transition">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
