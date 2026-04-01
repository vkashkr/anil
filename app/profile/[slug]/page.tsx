import type { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getProfileByNameFromDynamoDB, Profile } from '@/app/lib/dynamodb';
import { PHONE_TEL, PHONE_DISPLAY, WHATSAPP_URL } from '@/app/lib/constants';
import ProfileGallery from './ProfileGallery';
import ReviewForm from './ReviewForm';

const BASE_URL = 'https://ahmedabad.aliyaescort.com';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// cache() deduplicates: generateMetadata and the page component share one fetch per request
const loadProfile = cache(async (slug: string): Promise<Profile | undefined> => {
  const profile = await getProfileByNameFromDynamoDB(slug).catch(() => undefined);
  if (!profile) return undefined;

  // Fetch images from S3 (stored separately from DynamoDB metadata)
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  try {
    const s3Res = await fetch(
      `${base}/bff/api/get-profiles?id=${encodeURIComponent(profile.id)}`,
      { next: { revalidate: 300 } },
    );
    if (s3Res.ok) {
      const s3Data = await s3Res.json();
      if (s3Data.success && s3Data.data?.images) {
        let imgs: { full_path: string }[] = s3Data.data.images;
        if (!Array.isArray(imgs)) imgs = [imgs];
        const s3Images = imgs.map((i) => i.full_path).filter(Boolean);
        if (s3Images.length > 0) profile.images = s3Images;
      }
    }
  } catch {
    // fall through — use DynamoDB images if S3 is unavailable
  }

  return profile;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await loadProfile(slug);
  if (!profile) return { title: 'Profile Not Found' };

  const url = `${BASE_URL}/profile/${slug}`;
  const title =
    profile.seoTitle || `${profile.name} — Call Girl in Ahmedabad | Aliya Escort`;
  const description =
    profile.seoDescription ||
    profile.description?.replace(/<[^>]+>/g, '').slice(0, 160) ||
    `View ${profile.name}'s escort profile in Ahmedabad.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      url,
      title,
      description,
      images: profile.images?.length ? [{ url: profile.images[0] }] : [],
      type: 'profile',
    },
  };
}

export default async function ProfileSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await loadProfile(slug);
  if (!profile) notFound();

  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('auth_token')?.value === 'authenticated';

  const canonicalUrl = `${BASE_URL}/profile/${slug}`;
  const whatsappText = encodeURIComponent(`hello, ${profile.name} I saw your profile on Aliya Escort`);
  const reviews = profile.reviews ?? [];

  // Pull well-known keys out of extraProperties for structured display
  const ep = profile.extraProperties ?? {};
  const STAT_KEYS = ['height', 'weight', 'hair', 'eyes', 'body', 'body_type', 'bodytype', 'nationality', 'ethnicity'];
  const RATE_KEYS = ['rate_1hr', 'rate_2hr', 'rate_night', 'rate_30min', 'rate_overnight', 'incall', 'outcall'];
  const LANG_KEY  = 'languages';

  const stats = STAT_KEYS.map(k => ep[k] ? { key: k, val: ep[k] } : null).filter(Boolean) as { key: string; val: string }[];
  const rates = RATE_KEYS.map(k => ep[k] ? { key: k, val: ep[k] } : null).filter(Boolean) as { key: string; val: string }[];
  const languages = ep[LANG_KEY];
  const knownKeys = new Set([...STAT_KEYS, ...RATE_KEYS, LANG_KEY]);
  const extraTags = Object.entries(ep).filter(([k]) => !knownKeys.has(k));

  // Format label for display
  const fmtKey = (k: string) =>
    k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Last active from updatedAt
  let lastActive = '';
  if (profile.updatedAt) {
    try {
      const d = new Date(profile.updatedAt);
      const diff = Date.now() - d.getTime();
      const days = Math.floor(diff / 86400000);
      lastActive = days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;
    } catch { /* noop */ }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-100 font-sans pb-14 md:pb-0">
      {profile.customCss && (
        <style dangerouslySetInnerHTML={{ __html: profile.customCss }} />
      )}

      {/* Sticky nav + breadcrumb */}
      <nav className="p-4 bg-black/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-pink-400 hover:text-pink-300 transition" title="Home">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
              </svg>
            </Link>
            {/* Available Now pill — right side of nav */}
            <span className="flex items-center gap-1.5 bg-green-500/15 border border-green-500/40 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              Available Now
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1 text-sm text-gray-400">
            <Link href="/" className="hover:text-pink-300 transition">Home</Link>
            {profile.country && <><span className="text-gray-600">›</span><span className="text-gray-300">{profile.country}</span></>}
            {profile.state && <><span className="text-gray-600">›</span><span className="text-gray-300">{profile.state}</span></>}
            {profile.city && <><span className="text-gray-600">›</span><span className="text-gray-300">{profile.city}</span></>}
            {profile.place && <><span className="text-gray-600">›</span><span className="text-pink-300">{profile.place}</span></>}
          </div>
        </div>
      </nav>

      {/* Admin quick actions */}
      {isAdmin && (
        <div className="bg-blue-950/80 border-b border-blue-700/40 px-4 py-2 flex items-center gap-3">
          <span className="text-blue-300 text-xs font-semibold uppercase tracking-widest">Admin</span>
          <Link
            href={`/admin/profile?id=${profile.id}`}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-1.5 px-5 rounded-full shadow transition"
          >
            ✏️ Edit / Manage Profile
          </Link>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* SEO H1 block */}
        <div className="mb-6 bg-gradient-to-r from-black/60 via-fuchsia-950/40 to-black/60 rounded-2xl p-5 border border-white/5">
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-yellow-300 mb-2">
            {profile.seoTitle || `${profile.name} — Call Girl in ${profile.city || profile.location || 'Ahmedabad'}`}
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            {profile.seoDescription ||
              `${profile.name} available in ${profile.place ? profile.place + ', ' : ''}${profile.city || profile.location || 'Ahmedabad'}${profile.state ? ', ' + profile.state : ''}. Genuine, verified profile with real photos.`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: image gallery */}
          <ProfileGallery images={profile.images ?? []} name={profile.name} />

          {/* Right: profile details */}
          <div className="flex flex-col gap-5">

            {/* ── Name + trust badges ── */}
            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-300">
                    {profile.name}
                  </h2>
                  {lastActive && (
                    <p className="text-gray-500 text-xs mt-1">🕐 Last active: {lastActive}</p>
                  )}
                </div>
                {/* Trust badges */}
                <div className="flex flex-col gap-1.5 items-end shrink-0">
                  <span className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    ✓ Verified Profile
                  </span>
                  <span className="flex items-center gap-1 bg-pink-500/15 border border-pink-500/40 text-pink-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    📷 Real Photos
                  </span>
                </div>
              </div>

              {/* Location + quick badges */}
              <div className="flex flex-wrap gap-2">
                {profile.age && (
                  <span className="bg-pink-600/20 text-pink-300 px-3 py-1 rounded-full text-sm font-semibold border border-pink-500/30">
                    {profile.age} yrs
                  </span>
                )}
                {profile.gender && (
                  <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm font-semibold border border-purple-500/30 capitalize">
                    {profile.gender}
                  </span>
                )}
                {(profile.city || profile.location) && (
                  <span className="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-500/30">
                    📍 {profile.city || profile.location}{profile.state ? `, ${profile.state}` : ''}
                  </span>
                )}
                {profile.place && (
                  <span className="bg-teal-600/20 text-teal-300 px-3 py-1 rounded-full text-sm font-semibold border border-teal-500/30">
                    📌 {profile.place}
                  </span>
                )}
                {extraTags.map(([k, v]) => (
                  <span key={k} className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold border border-blue-500/30">
                    <strong className="text-white/70 mr-1">{fmtKey(k)}:</strong>{v}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Contact CTA (visible without scrolling) ── */}
            <div className="bg-gradient-to-br from-green-950/60 to-teal-950/60 p-5 rounded-2xl border border-green-700/30 shadow-xl">
              <p className="text-green-300 text-xs font-semibold uppercase tracking-widest mb-3 text-center">📲 Book Now — 24/7 Available</p>
              <a
                href={PHONE_TEL}
                className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 mb-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Call Now — {PHONE_DISPLAY}</span>
              </a>
              <a
                href={`${WHATSAPP_URL}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:brightness-110 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.29-1.248l-.308-.184-2.87.852.852-2.87-.184-.308A8 8 0 1112 20z"/>
                </svg>
                <span>WhatsApp for Quick Booking</span>
              </a>
              <p className="text-center text-xs text-gray-500 mt-3">* Direct call — no advance required</p>
            </div>

            {/* ── Physical stats table ── */}
            {stats.length > 0 && (
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-pink-400">◆</span> Physical Details
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {profile.age && (
                    <div className="flex justify-between text-sm border-b border-white/5 pb-1.5">
                      <span className="text-gray-400">Age</span>
                      <span className="text-white font-medium">{profile.age} yrs</span>
                    </div>
                  )}
                  {stats.map(({ key, val }) => (
                    <div key={key} className="flex justify-between text-sm border-b border-white/5 pb-1.5">
                      <span className="text-gray-400">{fmtKey(key)}</span>
                      <span className="text-white font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Rates table ── */}
            {rates.length > 0 && (
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-yellow-400">◆</span> Rates
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {rates.map(({ key, val }) => (
                    <div key={key} className="flex justify-between text-sm border-b border-white/5 pb-1.5">
                      <span className="text-gray-400">{fmtKey(key)}</span>
                      <span className="text-yellow-300 font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-500 text-xs mt-3 text-center">* Rates are indicative. Final amount confirmed on call.</p>
              </div>
            )}

            {/* ── Languages ── */}
            {languages && (
              <div className="bg-black/40 px-5 py-4 rounded-2xl border border-white/5 backdrop-blur-sm flex items-center gap-3">
                <span className="text-2xl">🗣️</span>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Languages</p>
                  <p className="text-white text-sm font-medium">{languages}</p>
                </div>
              </div>
            )}

            {/* ── About Me ── */}
            {profile.description && (
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-fuchsia-400">◆</span> About Me
                </h3>
                <div
                  className="text-gray-300 text-sm leading-relaxed prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: profile.description }}
                />
              </div>
            )}

            {/* ── Services ── */}
            {profile.services?.length ? (
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-teal-400">◆</span> Services
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.services.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 bg-pink-900/50 text-pink-200 border border-pink-700/40 px-3 py-1.5 rounded-full text-xs font-medium"
                    >
                      <span className="text-pink-400">✓</span> {s}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Customer reviews */}
        {reviews.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">⭐ Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review, idx) => (
                <div key={idx} className="bg-black/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center text-white font-bold text-sm">
                        {review.name[0]}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{review.name}</p>
                        <p className="text-gray-500 text-xs">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < Number(review.rating) ? 'text-yellow-400' : 'text-gray-600'}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
            {(() => {
              const avg = reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length;
              const rounded = Math.round(avg * 10) / 10;
              const full = Math.round(avg);
              return (
                <div className="mt-8 text-center bg-gradient-to-r from-black/60 via-fuchsia-950/30 to-black/60 rounded-2xl p-6 border border-white/5">
                  <p className="text-gray-400 text-sm mb-1">Overall Rating</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-black text-yellow-400">{rounded}</span>
                    <div className="flex gap-0.5 text-xl">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < full ? 'text-yellow-400' : 'text-gray-600'}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Based on {reviews.length}+ verified reviews</p>
                </div>
              );
            })()}
          </section>
        )}

        {/* Write a review */}
        <section className="mt-10">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4">📝 Write a Review</h3>
            <ReviewForm profileId={profile.id} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-white/10 bg-black/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-yellow-300 mb-4">Aliya Escort</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Premium escort services in Ahmedabad &amp; Gujarat. Trusted by thousands of satisfied clients. Real profiles, verified photos, genuine service.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">About Us</h3>
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
                <li><Link href="/" className="text-gray-400 hover:text-pink-300 transition">Home</Link></li>
                <li><Link href="/stories" className="text-gray-400 hover:text-pink-300 transition">Stories</Link></li>
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
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/10">
            <div className="bg-gradient-to-r from-fuchsia-950/50 via-black/40 to-yellow-950/50 rounded-xl p-4 border border-yellow-500/20 mb-4">
              <p className="text-sm font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-fuchsia-500 mb-2">⚠ 18+ DISCLAIMER</p>
              <p className="text-gray-400 text-xs text-center leading-relaxed max-w-2xl mx-auto">
                This website contains adult content intended exclusively for individuals aged 18 years and above. By entering and using this site, you confirm that you are of legal age in your jurisdiction. All profiles are of consenting adults.
              </p>
            </div>
            <p className="text-gray-500 text-xs text-center">© 2026 Aliya Escort Ahmedabad. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="flex">
          <a href={PHONE_TEL} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white font-bold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Now
          </a>
          <a
            href={`${WHATSAPP_URL}?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.29-1.248l-.308-.184-2.87.852.852-2.87-.184-.308A8 8 0 1112 20z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </div>

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profile.name,
            url: canonicalUrl,
            image: profile.images?.[0],
            description: profile.description?.replace(/<[^>]+>/g, '').slice(0, 300),
            address: {
              '@type': 'PostalAddress',
              addressLocality: profile.city || 'Ahmedabad',
              addressRegion: profile.state || 'Gujarat',
              addressCountry: 'IN',
            },
          }),
        }}
      />
    </div>
  );
}

// keep the old ?name= URL working — silently reuse the same slug route

