import ProfileMarquee from "./components/ProfileMarquee";
import HeroVideo from "./components/HeroVideo";
import SEOContent from "./components/SEOContent";
import HomeNav from "./components/HomeNav";
import HomeProfileGrid from "./components/HomeProfileGrid";
import { PHONE_TEL, PHONE_DISPLAY, WHATSAPP_URL } from './lib/constants';

const API_BASE = 'https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com/dvp';

export type HomeProfile = {
  id: string;
  name: string;
  age: string | number;
  gender?: string;
  description?: string;
  location?: string;
  seoTitle?: string;
  filename?: string;
  full_path: string;
  metadata?: { [key: string]: string | number | boolean | undefined | null };
};

type RawImage = {
  filename?: string;
  full_path: string;
  metadata?: { [key: string]: string | number | boolean | undefined | null };
};

async function fetchInitialProfiles(): Promise<{
  profilesById: Record<string, HomeProfile[]>;
  nextToken: string | null;
}> {
  try {
    const profilesById: Record<string, HomeProfile[]> = {};
    let cursor: string | null = null;

    // Paginate through ALL S3 objects so no profile is missed regardless of
    // how many images earlier profiles have (S3 sorts keys lexicographically).
    do {
      const url: string = cursor
        ? `${API_BASE}/view?limit=100&next_token=${encodeURIComponent(cursor)}`
        : `${API_BASE}/view?limit=100`;
      const res: Response = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) break;
      const data: { images?: RawImage[]; next_token?: string } = await res.json();
      if (!data?.images || !Array.isArray(data.images)) break;

      for (const img of data.images) {
        const id = String(img.metadata?.id ?? img.filename?.split('/')[0] ?? '');
        const name = String(img.metadata?.name ?? '-');
        if (!id || name === '-') continue;

        const profile: HomeProfile = {
          id,
          name,
          age: img.metadata?.age != null ? (img.metadata.age as string | number) : '-',
          gender: img.metadata?.gender != null ? String(img.metadata.gender) : undefined,
          description: img.metadata?.description != null ? String(img.metadata.description) : undefined,
          location: img.metadata?.location != null ? String(img.metadata.location) : undefined,
          seoTitle: img.metadata?.seoTitle != null ? String(img.metadata.seoTitle) : undefined,
          filename: img.filename,
          full_path: img.full_path,
          metadata: img.metadata || {},
        };

        if (!profilesById[id]) profilesById[id] = [];
        if (img.filename?.endsWith('profile.jpg')) {
          profilesById[id].unshift(profile);
        } else {
          profilesById[id].push(profile);
        }
      }

      cursor = data.next_token || null;
    } while (cursor);

    // Return null nextToken — HomeProfileGrid handles its own pagination client-side
    return { profilesById, nextToken: null };
  } catch {
    return { profilesById: {}, nextToken: null };
  }
}

export default async function Home() {
  const { profilesById, nextToken } = await fetchInitialProfiles();
  const profileCount = Object.keys(profilesById).length;
  const marqueeProfiles = Object.values(profilesById).map(imgs => {
    const { metadata, ...rest } = imgs[0];
    void metadata;
    return rest;
  });

  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans dark:bg-black flex flex-col pb-14 md:pb-0">

      {/* Fixed nav — client (scroll hide, search, mobile menu) */}
      <HomeNav initialProfilesById={profilesById} />

      {/* ── SSR Hero — H1 + description indexed by Google on first byte ── */}
      <div className="w-full bg-gradient-to-br from-black via-fuchsia-950 to-pink-900 pt-28 sm:pt-20 pb-10 px-2 flex flex-col items-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{ background: 'radial-gradient(circle at 80% 10%, rgba(255,0,128,0.10) 0, transparent 70%), radial-gradient(circle at 10% 90%, rgba(255,255,0,0.08) 0, transparent 70%)' }}
        />
        <h1 className="relative z-10 text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-500 to-yellow-300 text-center leading-tight mb-3">
          Ahmedabad Escort &amp; Local Call Girls 👄
        </h1>

        {/* Marquee receives initial server-fetched profiles as props */}
        <ProfileMarquee profiles={marqueeProfiles} />

        <p className="relative z-10 text-lg sm:text-xl text-gray-100 max-w-xl sm:max-w-2xl text-center mb-4 font-medium">
          <span className="bg-black/30 px-3 py-2 rounded-2xl shadow-lg backdrop-blur-sm inline-block">
            Welcome to <span className="font-bold text-pink-300">Aliya Escort Ahmedabad</span> – your trusted directory for{' '}
            <span className="text-fuchsia-300 font-semibold">genuine, independent call girls</span> and{' '}
            <span className="text-yellow-200 font-semibold">premium escort services</span> in Ahmedabad.{' '}
            Book local girls for home or hotel delivery, enjoy{' '}
            <span className="italic text-pink-200">safe, private, and affordable companionship</span>.{' '}
            <span className="text-yellow-300 font-bold">No advance payment</span>,{' '}
            <span className="text-fuchsia-200 font-bold">100% privacy</span>, and{' '}
            <span className="text-pink-200 font-bold">real profiles only</span>.
          </span>
        </p>
        <span className="relative z-10 text-pink-200 font-semibold text-base sm:text-lg bg-black/20 px-4 py-1 rounded-full shadow-md tracking-wide mt-1">
          Ahmedabad&apos;s <span className="text-yellow-200 font-bold">#1 Local Girl Service</span> |{' '}
          <span className="text-fuchsia-200 font-bold">{profileCount || '1000'}+ Verified Profiles</span>
        </span>
      </div>

      <HeroVideo />

      {/* Profile grid + load more + mobile bottom bar — client */}
      <HomeProfileGrid initialProfilesById={profilesById} initialNextToken={nextToken} />

      <SEOContent />

      {/* ── Static Footer ── */}
      <footer id="about" className="mt-12 border-t border-white/10 bg-black/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            <div>
              <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-yellow-300 mb-4">
                Aliya Escort
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Premium escort services in Ahmedabad &amp; Gujarat. Trusted by thousands of satisfied clients since 2020. Real profiles, verified photos, genuine service.
              </p>
              <div className="flex gap-3 mt-4">
                <span className="w-9 h-9 rounded-full bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-300 text-sm hover:bg-pink-600/40 transition cursor-pointer">📷</span>
                <span className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 text-sm hover:bg-blue-600/40 transition cursor-pointer">🐦</span>
                <span className="w-9 h-9 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center text-green-300 text-sm hover:bg-green-600/40 transition cursor-pointer">💬</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">About Us</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">
                Ahmedabad&apos;s most trusted escort agency, providing discreet and professional companionship services.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><span className="text-pink-400">✓</span> 100% Verified Profiles</li>
                <li className="flex items-center gap-2"><span className="text-pink-400">✓</span> Real &amp; Recent Photos</li>
                <li className="flex items-center gap-2"><span className="text-pink-400">✓</span> Complete Privacy Guaranteed</li>
                <li className="flex items-center gap-2"><span className="text-pink-400">✓</span> 24/7 Availability</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="text-gray-400 hover:text-pink-300 transition">Home</a></li>
                <li><a href="/ahmedabad/escorts" className="text-gray-400 hover:text-pink-300 transition">Ahmedabad Escort Service</a></li>
                <li><a href="/ahmedabad/escorts" className="text-gray-400 hover:text-pink-300 transition">VIP Escorts</a></li>
                <li><a href="/ahmedabad/escorts" className="text-gray-400 hover:text-pink-300 transition">New Arrivals</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300 transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300 transition">Terms of Service</a></li>
              </ul>
            </div>

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
