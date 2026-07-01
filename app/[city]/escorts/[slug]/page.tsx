import type { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getProfileBySeoTitleFromDynamoDB, Profile } from '@/app/lib/dynamodb';
import { PHONE_TEL, PHONE_DISPLAY, WHATSAPP_URL } from '@/app/lib/constants';
import ProfileGallery from '@/app/ahmedabad/escorts/[slug]/ProfileGallery';
import ReviewForm from '@/app/ahmedabad/escorts/[slug]/ReviewForm';

export const revalidate = 0;

const BASE_URL = 'https://www.aliyaescort.com';

interface PageProps {
  params: Promise<{ city: string; slug: string }>;
}

const makeSlug = (raw: string) =>
  String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const formatCityName = (raw: string) =>
  String(raw || '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ');

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
  const citySlug = makeSlug(city || 'ahmedabad');
  const cityDisplay = formatCityName(citySlug);
  const profile = await loadProfile(slug);
  if (!profile) return { title: 'Profile Not Found' };

  const url = `${BASE_URL}/${citySlug}/escorts/${encodeURIComponent(slug)}`;
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
  const citySlug = makeSlug(city || 'ahmedabad');
  const cityDisplay = formatCityName(citySlug);
  const profile = await loadProfile(slug);

  if (!profile) notFound();

  const canonicalProfileSlug = `${makeSlug(profile.seoTitle || profile.name)}-independent-escort`;
  const requestedSlug = makeSlug(decodeURIComponent(slug || '').replace(/-independent-escort$/i, ''));
  const canonicalRequestedSlug = makeSlug(canonicalProfileSlug.replace(/-independent-escort$/i, ''));
  if (requestedSlug && requestedSlug !== canonicalRequestedSlug) {
    redirect(`/${citySlug}/escorts/${canonicalProfileSlug}`);
  }

  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('auth_token')?.value === 'authenticated';
  const canonicalUrl = `${BASE_URL}/${citySlug}/escorts/${canonicalProfileSlug}`;
  const whatsappText = encodeURIComponent(`hello, ${profile.name} I saw your profile on Aliya Escort`);
  const safeDescriptionHtml = sanitizeProfileHtml(profile.description);
  const safeCustomCss = sanitizeInlineCss(profile.customCss);
  const reviews = profile.reviews ?? [];

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: canonicalUrl,
    image: profile.images?.[0] ?? undefined,
    description: profile.seoDescription || safeDescriptionHtml.replace(/<[^>]+>/g, '').slice(0, 160),
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.city || cityDisplay,
      addressRegion: profile.state || 'India',
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
        <h1 className="text-2xl md:text-3xl font-extrabold mb-5">
          {profile.seoTitle || `${profile.name} - Escort in ${cityDisplay}`}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProfileGallery images={profile.images ?? []} name={profile.name} />

          <div className="space-y-5">
            <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
              <p className="text-gray-300 text-sm mb-2">Name: <span className="text-white font-semibold">{profile.name}</span></p>
              {profile.age && <p className="text-gray-300 text-sm mb-2">Age: <span className="text-white font-semibold">{profile.age}</span></p>}
              <p className="text-gray-300 text-sm">Location: <span className="text-white font-semibold">{profile.city || profile.location || cityDisplay}</span></p>
            </div>

            <div className="bg-gradient-to-br from-green-950/60 to-teal-950/60 p-5 rounded-2xl border border-green-700/30">
              <a href={PHONE_TEL} className="flex items-center justify-center w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl mb-3 transition">
                Call Now - {PHONE_DISPLAY}
              </a>
              <a
                href={`${WHATSAPP_URL}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl transition"
              >
                WhatsApp Booking
              </a>
            </div>

            {safeDescriptionHtml && (
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                <h2 className="text-lg font-bold mb-3">About</h2>
                <div className="text-gray-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: safeDescriptionHtml }} />
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
