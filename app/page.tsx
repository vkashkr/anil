'use client';
import React, { useEffect, useState } from "react";
import ProfileMarquee from "./components/ProfileMarquee";
import HeroVideo from "./components/HeroVideo";
import ProfileCard from "./components/ProfileCard";
import SEOContent from "./components/SEOContent";

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
  const [profilesById, setProfilesById] = useState<{ [id: string]: Profile[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/bff/api/profiles", {})
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.images) {
          // Map raw data to Profile type
          const mapped = data.data.images.map((img: any) => ({
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

          // Group by id and identify metadata source
          const grouped: { [id: string]: Profile[] } = {};
          const metaById: { [id: string]: any } = {};
          
          mapped.forEach((profile: Profile) => {
            if (!grouped[profile.id]) grouped[profile.id] = [];
            grouped[profile.id].push(profile);
            
            // Prioritize metadata from 'profile.jpg' if available
            if (profile.filename && profile.filename.endsWith('profile.jpg')) {
              metaById[profile.id] = profile.metadata;
            }
          });

          // Consolidate metadata across the group
          Object.entries(grouped).forEach(([id, images]) => {
            if (metaById[id]) {
              grouped[id] = images.map(img => ({ ...img, ...metaById[id] }));
            }
          });
          
          setProfilesById(grouped);
        }
        setLoading(false);
      })
      .catch((error) => { 
        console.error("Error fetching profiles:", error); 
        setLoading(false); 
      });
  }, []);

  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans dark:bg-black flex flex-col">
      {/* Header Section */}
      <div className="w-full bg-gradient-to-br from-black via-fuchsia-950 to-pink-900 py-10 px-2 flex flex-col items-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0" style={{background: 'radial-gradient(circle at 80% 10%, rgba(255,0,128,0.10) 0, transparent 70%), radial-gradient(circle at 10% 90%, rgba(255,255,0,0.08) 0, transparent 70%)'}}></div>
        <h1 className="relative z-10 text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-500 to-yellow-300 text-center leading-tight drop-shadow-pink animate-pulse mb-3">
          Ahmedabad Escort & Local Call Girls <span className="inline-block animate-bounce">👄</span>
        </h1>
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

      {/* Marquee with improved data handling */}
      <ProfileMarquee profiles={Object.values(profilesById).map(p => p[0])} />

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-4 px-2">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          Object.entries(profilesById).map(([id, images]) => (
            <ProfileCard key={id} id={id} images={images} />
          ))
        )}
      </div>

      <SEOContent />

      {/* Disclaimer Section */}
      <div className="w-full flex flex-col items-center mt-8 py-8 px-2 relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-fuchsia-900/80 via-black/80 to-yellow-900/70 border border-yellow-400/30 backdrop-blur-lg mx-auto max-w-7xl mb-8">
        <div className="absolute inset-0 pointer-events-none z-0" style={{background: 'radial-gradient(circle at 80% 10%, rgba(255,0,128,0.10) 0, transparent 70%), radial-gradient(circle at 10% 90%, rgba(255,255,0,0.10) 0, transparent 70%)'}}></div>
        <h4 className="relative z-10 text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-fuchsia-500 animate-pulse mb-2 text-center tracking-wider drop-shadow-pink flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-pink-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
          18+ DISCLAIMER
        </h4>
        <p className="relative z-10 text-center max-w-xl sm:max-w-2xl text-base sm:text-lg text-yellow-100 font-medium bg-black/30 px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm border border-pink-400/20">
          This website offers <span className="font-bold text-pink-300">adult services</span> intended for individuals <span className="font-bold text-yellow-300">18 years and older</span>.<br className="hidden sm:block"/> All bookings and services are strictly for adults. <span className="text-pink-200 font-semibold">Privacy</span> and <span className="text-yellow-200 font-semibold">discretion</span> are our top priorities.<br className="hidden sm:block"/> If you are seeking <span className="font-bold text-fuchsia-300">Aliya escort female services in Ahmedabad</span>, contact us directly. The base fee applies to all services and reservations. By using this site, you confirm you are of legal age and agree to our privacy policy.
        </p>
      </div>

      <footer className="w-full bg-gray-900 text-gray-100 py-6 text-center mt-auto border-t border-gray-800">
        <div>Copyright © 2026 Aliya Escort Ahmedabad | Local Girl Directory</div>
      </footer>
    </div>
  );
}
