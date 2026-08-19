import type { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getProfileBySeoTitleFromDynamoDB, Profile } from '@/app/lib/dynamodb';
import { PHONE_TEL, PHONE_DISPLAY, WHATSAPP_URL } from '@/app/lib/constants';
import { formatCityName, getProfileCitySlug, makeSlug, resolveAllowedCitySlug } from '@/app/lib/city-slugs';
import ProfileGallery from '@/app/ahmedabad/escorts/[slug]/ProfileGallery';
import ReviewForm from '@/app/ahmedabad/escorts/[slug]/ReviewForm';

export const revalidate = 0;

const BASE_URL = 'https://www.aliyaescort.com';

interface PageProps {
  params: Promise<{ city: string; slug: string }>;
}

const sanitizeProfileHtml = (html?: string) => {
  if (!html) return '';
  return String(html)
    .replace(/<\s*\/?\s*(script|style|iframe|object|embed|meta|link|title)[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*(["']).*?\1/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript:/gi, '');
};

const sanitizeInlineCss = (css?: string) => {
  if (!css) return '';
  return String(css)
    .replace(/<\/?style[^>]*>/gi, '')
    .replace(/<\/?script[^>]*>/gi, '')
    .replace(/<\/?iframe[^>]*>/gi, '');
};

const loadProfile = cache(async (slug: string): Promise<Profile | undefined> => {
  const cleanSlug = decodeURIComponent(String(slug || '')).replace(/-independent-escort$/i, '');
  const profile = await getProfileBySeoTitleFromDynamoDB(cleanSlug).catch(() => undefined);
  if (!profile) return undefined;

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  try {
    const s3Res = await fetch(`${base}/bff/api/get-profiles?id=${encodeURIComponent(profile.id)}`, {
      cache: 'no-store',
    });
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
    // Keep DynamoDB images as fallback.
  }

  return profile;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city, slug } = await params;
  const citySlug = resolveAllowedCitySlug(city || 'ahmedabad');
  if (!citySlug) return { title: 'Profile Not Found', robots: { index: false, follow: false } };
  const cityDisplay = formatCityName(citySlug);
  const profile = await loadProfile(slug);
  if (!profile) return { title: 'Profile Not Found' };

  // A profile only lives at its real city's URL — don't generate doorway
  // metadata (duplicate content) for an unrelated city.
  const realCity = getProfileCitySlug(profile);
  if (realCity && realCity !== citySlug) {
    return { title: 'Profile Not Found', robots: { index: false, follow: false } };
  }

  const canonicalProfileSlug = makeSlug(profile.seoTitle || profile.name);
  const url = `${BASE_URL}/${citySlug}/escorts/${canonicalProfileSlug}`;
  const title = profile.seoTitle || `${profile.name} - Call Girl in ${cityDisplay} | Aliya Escort`;
  const description =
    profile.seoDescription ||
    profile.description?.replace(/<[^>]+>/g, '').slice(0, 160) ||
    `Meet ${profile.name}${profile.age ? `, age ${profile.age}` : ''} - verified independent escort in ${cityDisplay}. Real photos, 24/7 availability.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
      images: profile.images?.length ? [{ url: profile.images[0] }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: profile.images?.length ? [profile.images[0]] : [],
      site: '@AliyaEscort',
    },
    robots: { index: true, follow: true },
  };
}

export default async function CityProfilePage({ params }: PageProps) {
  const { city, slug } = await params;
  const requestedCitySlug = makeSlug(city || 'ahmedabad');
  const citySlug = resolveAllowedCitySlug(city || 'ahmedabad');
  if (!citySlug) notFound();
  if (requestedCitySlug !== citySlug) {
    redirect(`/${citySlug}/escorts/${encodeURIComponent(slug)}`);
  }
  const cityDisplay = formatCityName(citySlug);
  const profile = await loadProfile(slug);

  if (!profile) notFound();

  // A profile only lives at its real city's URL — redirect instead of
  // rendering duplicate/doorway content under an unrelated city.
  const realCity = getProfileCitySlug(profile);
  if (realCity && realCity !== citySlug) {
    redirect(`/${realCity}/escorts/${slug}`);
  }

  const canonicalProfileSlug = makeSlug(profile.seoTitle || profile.name);
  const decodedSlug = decodeURIComponent(String(slug || '')).trim();
  const requestedSlug = makeSlug(decodedSlug.replace(/-independent-escort$/i, ''));
  if (!requestedSlug || requestedSlug !== canonicalProfileSlug || decodedSlug !== requestedSlug) {
    redirect(`/${citySlug}/escorts/${canonicalProfileSlug}`);
  }

  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('auth_token')?.value === 'authenticated';
  const canonicalUrl = `${BASE_URL}/${citySlug}/escorts/${canonicalProfileSlug}`;
  const whatsappText = encodeURIComponent(`hello, ${profile.name} I saw your profile on Aliya Escort`);
  const safeDescriptionHtml = sanitizeProfileHtml(profile.description);
  const safeCustomCss = sanitizeInlineCss(profile.customCss);
  const reviews = profile.reviews ?? [];
  const displayLocation = cityDisplay;
  const displayState = citySlug === 'hyderabad' ? 'Telangana' : profile.state || 'Gujarat';
  const ep = profile.extraProperties ?? {};
  const languages = ep.languages || ep.language || '';
  const height = ep.height || '';
  const weight = ep.weight || '';
  const bodyType = ep.body_type || ep.bodytype || ep.body || '';
  const nationality = ep.nationality || '';
  const rates = [
    { label: '1 Hour', value: ep.rate_1hr },
    { label: '2 Hours', value: ep.rate_2hr },
    { label: 'Night', value: ep.rate_night || ep.rate_overnight },
    { label: 'Incall', value: ep.incall },
    { label: 'Outcall', value: ep.outcall },
  ].filter((r) => r.value);
  const lastUpdatedText = profile.updatedAt
    ? new Date(profile.updatedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: canonicalUrl,
    image: profile.images?.[0] ?? undefined,
    description: profile.seoDescription || safeDescriptionHtml.replace(/<[^>]+>/g, '').slice(0, 160),
    address: {
      '@type': 'PostalAddress',
      addressLocality: displayLocation,
      addressRegion: displayState,
      addressCountry: 'IN',
    },
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-100 pb-14 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      {safeCustomCss && <style dangerouslySetInnerHTML={{ __html: safeCustomCss }} />}

      <nav className="p-4 bg-black/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-gray-300">
          <Link href="/" className="hover:text-pink-300">Home</Link>
          <span className="text-gray-600">/</span>
          <Link href={`/${citySlug}/escorts`} className="hover:text-pink-300">{cityDisplay} Escorts</Link>
          <span className="text-gray-600">/</span>
          <span className="text-pink-300 truncate">{profile.name}</span>
        </div>
      </nav>

      {isAdmin && (
        <div className="bg-blue-950/80 border-b border-blue-700/40 px-4 py-2 flex items-center gap-3">
          <span className="text-blue-300 text-xs font-semibold uppercase tracking-widest">Admin</span>
          <Link href={`/admin/profile?id=${profile.id}`} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-1.5 px-5 rounded-full transition">
            Edit Profile
          </Link>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <section className="mb-6 rounded-3xl border border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-950/35 via-zinc-900 to-cyan-950/30 p-5 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                {profile.seoTitle || `${profile.name} - Escort in ${cityDisplay}`}
              </h1>
              <p className="mt-2 text-sm text-gray-300">
                Premium independent profile with direct booking in {displayLocation}, {displayState}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">Verified Profile</span>
              <span className="rounded-full border border-pink-500/40 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-300">Real Photos</span>
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">24/7 Available</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProfileGallery images={profile.images ?? []} name={profile.name} />

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Name</p>
                <p className="mt-1 text-base font-bold text-white line-clamp-1">{profile.name}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Age</p>
                <p className="mt-1 text-base font-bold text-white">{profile.age || '21+'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4 col-span-2">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Location</p>
                <p className="mt-1 text-base font-bold text-white">{displayLocation}</p>
                <p className="text-xs text-gray-400">{displayState}, India</p>
              </div>
            </div>

            <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-950/60 to-teal-950/60 p-5">
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-green-300">Book Instantly</p>
              <a href={PHONE_TEL} className="mb-3 flex items-center justify-center rounded-xl bg-green-600 py-3 text-base font-bold text-white transition hover:bg-green-500">
                Call Now - {PHONE_DISPLAY}
              </a>
              <a
                href={`${WHATSAPP_URL}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-xl bg-teal-600 py-3 text-base font-bold text-white transition hover:bg-teal-500"
              >
                WhatsApp Booking
              </a>
              {lastUpdatedText && (
                <p className="mt-3 text-center text-xs text-gray-300">Last updated: {lastUpdatedText}</p>
              )}
            </div>

            {(height || weight || bodyType || languages || nationality) && (
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <h2 className="mb-3 text-lg font-bold text-white">Modern Profile Details</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {height && <p className="text-gray-300"><span className="text-gray-500">Height:</span> <span className="text-white font-semibold">{height}</span></p>}
                  {weight && <p className="text-gray-300"><span className="text-gray-500">Weight:</span> <span className="text-white font-semibold">{weight}</span></p>}
                  {bodyType && <p className="text-gray-300"><span className="text-gray-500">Body Type:</span> <span className="text-white font-semibold">{bodyType}</span></p>}
                  {nationality && <p className="text-gray-300"><span className="text-gray-500">Nationality:</span> <span className="text-white font-semibold">{nationality}</span></p>}
                  {languages && <p className="col-span-2 text-gray-300"><span className="text-gray-500">Languages:</span> <span className="text-white font-semibold">{languages}</span></p>}
                </div>
              </div>
            )}

            {profile.services?.length ? (
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <h2 className="mb-3 text-lg font-bold text-white">Services</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.services.slice(0, 12).map((service) => (
                    <span key={service} className="rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold text-fuchsia-200">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {rates.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <h2 className="mb-3 text-lg font-bold text-white">Rates</h2>
                <div className="space-y-2">
                  {rates.map((rate) => (
                    <div key={rate.label} className="flex items-center justify-between rounded-lg border border-white/10 bg-zinc-900/70 px-3 py-2 text-sm">
                      <span className="text-gray-400">{rate.label}</span>
                      <span className="font-semibold text-yellow-300">{rate.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {safeDescriptionHtml && (
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <h2 className="mb-3 text-lg font-bold text-white">About</h2>
                <div className="text-sm leading-relaxed text-gray-300" dangerouslySetInnerHTML={{ __html: safeDescriptionHtml }} />
              </div>
            )}
          </div>
        </div>

        <section className="mt-10">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Write a Review</h3>
            <ReviewForm profileId={profile.id} />
          </div>
        </section>

        {reviews.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review, idx) => (
                <div key={`${review.name}-${idx}`} className="bg-black/40 border border-white/10 rounded-xl p-4">
                  <p className="text-white font-semibold text-sm">{review.name}</p>
                  <p className="text-yellow-400 text-sm">{'★'.repeat(Math.max(1, Math.min(5, Number(review.rating) || 0)))}</p>
                  <p className="text-gray-300 text-sm mt-2">{review.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
