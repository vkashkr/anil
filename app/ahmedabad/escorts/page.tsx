import Link from 'next/link';
import { getAllProfilesFromDynamoDB } from '@/app/lib/dynamodb';
import { PHONE_TEL, WHATSAPP_URL } from '@/app/lib/constants';

const API_BASE = 'https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com/dvp';

interface ImageEntry {
  filename?: string;
  full_path: string;
  metadata?: { id?: string; name?: string };
}

async function fetchS3ImagesByProfileId(): Promise<Record<string, string[]>> {
  const imagesByid: Record<string, string[]> = {};
  let nextToken: string | null = null;
  do {
    const url = nextToken
      ? `${API_BASE}/view?limit=100&next_token=${encodeURIComponent(nextToken)}`
      : `${API_BASE}/view?limit=100`;
    let res: Response;
    try { res = await fetch(url, { next: { revalidate: 300 } }); } catch { break; }
    if (!res.ok) break;
    const data = await res.json();
    if (!data?.images || !Array.isArray(data.images)) break;
    for (const img of data.images as ImageEntry[]) {
      const id = String(img.metadata?.id || img.filename?.split('/')[0] || '');
      if (!id || !img.full_path) continue;
      if (!imagesByid[id]) imagesByid[id] = [];
      // put profile.jpg first
      if (img.filename?.endsWith('profile.jpg')) {
        imagesByid[id].unshift(img.full_path);
      } else {
        imagesByid[id].push(img.full_path);
      }
    }
    nextToken = data.next_token || null;
  } while (nextToken);
  return imagesByid;
}

const makeSlug = (raw: string) =>
  raw.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function fetchProfiles() {
  try {
    const [dbProfiles, s3Images] = await Promise.all([
      getAllProfilesFromDynamoDB(),
      fetchS3ImagesByProfileId(),
    ]);
    const seenSlug = new Set<string>();
    const seenId = new Set<string>();
    return dbProfiles
      .filter((p) => p.isVisible !== false && p.name && p.name !== '-')
      .map((p) => ({
        ...p,
        images: s3Images[p.id]?.length ? s3Images[p.id] : (p.images ?? []),
      }))
      .filter((p) => {
        if (seenId.has(p.id)) return false;
        seenId.add(p.id);
        const slug = makeSlug(p.seoTitle || p.name);
        if (seenSlug.has(slug)) return false;
        seenSlug.add(slug);
        return true;
      });
  } catch {
    return [];
  }
}

export default async function AhmedabadEscortPage() {
  const profiles = await fetchProfiles();

  const BASE_URL = 'https://www.aliyaescort.com';

  // ── JSON-LD: BreadcrumbList ──────────────────────────────────────────────
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Ahmedabad Escort', item: `${BASE_URL}/ahmedabad/escorts` },
    ],
  };

  // ── JSON-LD: ItemList (profile listings) ────────────────────────────────
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Ahmedabad Escort Profiles',
    url: `${BASE_URL}/ahmedabad/escorts`,
    numberOfItems: profiles.length,
    itemListElement: profiles.slice(0, 50).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE_URL}/ahmedabad/escorts/${encodeURIComponent(makeSlug(p.seoTitle || p.name))}`,
      name: p.name,
    })),
  };

  // ── JSON-LD: FAQPage ────────────────────────────────────────────────────
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Are you searching for ahmedabad escorts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'I have real profiles that provide you escort service in Ahmedabad, Gujrat, India',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I book an ahmedabad escort?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Browse our verified profiles, click "View Profile & Contact", then call or WhatsApp directly. No advance payment required — pay only on arrival.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are the ahmedabad escort profiles real and verified?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. All profiles on Aliya Escort Ahmedabad are genuine, independent adults with verified photos. No fake or stock images.',
        },
      },
      {
        '@type': 'Question',
        name: 'What areas in Ahmedabad do escorts service?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Escort service is available across all major areas including SG Highway, Satellite, Vastrapur, Prahlad Nagar, Bodakdev, Navrangpura, Ellisbridge, CG Road, Maninagar, and all 5-star hotels in Ahmedabad.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is incall and outcall available in Ahmedabad?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Both incall (at the escort\'s location) and outcall (hotel or home delivery) services are available 24/7 in Ahmedabad.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the rate for call girls in Ahmedabad?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Rates vary by profile. Contact directly via call or WhatsApp for current rates. No hidden charges.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-gray-100 font-sans pb-14 md:pb-0">

      {/* ── JSON-LD ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ── Sticky Nav ── */}
      <nav className="sticky top-0 z-50 bg-black/70 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-pink-400 hover:text-pink-300 transition shrink-0" title="Home">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
            </svg>
          </Link>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Link href="/" className="hover:text-pink-300 transition">Home</Link>
            <span className="text-gray-600">›</span>
            <span className="text-pink-300 font-semibold">Ahmedabad Escort</span>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-black via-fuchsia-950/80 to-pink-950/60 px-4 pt-9 pb-7 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-300 to-yellow-300 mb-2">
          Ahmedabad Escort Service
        </h1>
        <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto mb-1">
          Escorts in Ahmedabad, Gujarat, India
        </p>
        <p className="text-gray-300 text-sm max-w-xl mx-auto mb-5">
          We have{' '}
          <span className="text-pink-300 font-bold">{profiles.length} verified profiles</span>{' '}
          available in Ahmedabad. Independent call girls, 24/7 — incall &amp; outcall, no advance payment.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <a
            href={PHONE_TEL}
            className="bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-bold px-6 py-2.5 rounded-full text-sm shadow-lg hover:from-pink-400 hover:to-fuchsia-400 transition"
          >
            📞 Call Now
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold px-6 py-2.5 rounded-full text-sm shadow-lg hover:from-green-400 hover:to-teal-400 transition"
          >
            💬 WhatsApp
          </a>
        </div>

        {/* ── Services chips (keyword density) ── */}
        <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
          {[
            'Girlfriend Experience',
            'Hotel Outcall',
            'Home Delivery',
            'Incall Service',
            'College Girls',
            'Housewife Escorts',
            'VIP Escort',
            'Independent Girls',
            '24/7 Available',
            'No Advance',
          ].map((s) => (
            <span key={s} className="bg-white/5 border border-white/10 text-gray-400 text-[11px] px-3 py-1 rounded-full">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* ── Listing ── */}
      <div className="max-w-5xl mx-auto px-3 py-5 space-y-4">
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500 gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-lg font-semibold">No profiles found</p>
            <Link href="/" className="text-pink-400 hover:text-pink-300 underline text-sm">Back to Home</Link>
          </div>
        ) : (
          profiles.map((p, profileIndex) => {
            const profileSlug = makeSlug(p.seoTitle || p.name);
            const profileUrl = `/ahmedabad/escorts/${encodeURIComponent(profileSlug)}`;
            const mainImage = p.images[0] || null;
            const thumbs = p.images.slice(1, 4); // up to 3 extra thumbnails
            // First card's main image is likely the LCP — never lazy-load it
            const isFirst = profileIndex === 0;

            return (
              <article
                key={p.id}
                className="flex gap-0 rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-pink-500/30 transition-all shadow-lg"
              >
                {/* ── Left: main photo + thumbs ── */}
                <div className="flex flex-col shrink-0 w-[130px] sm:w-[180px] md:w-[210px]">
                  {/* Main photo */}
                  <Link href={profileUrl} className="block relative overflow-hidden" style={{ height: '210px' }}>
                    {mainImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mainImage}
                        alt={`${p.name} escort in Ahmedabad`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading={isFirst ? 'eager' : 'lazy'}
                        fetchPriority={isFirst ? 'high' : 'auto'}
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex flex-col items-center justify-center gap-1 text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] text-center px-1">Contact for photos</span>
                      </div>
                    )}
                    {/* Verified badge */}
                    <div className="absolute top-2 left-2 bg-fuchsia-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-tight">
                      ✔ Aliya
                    </div>
                  </Link>

                  {/* Thumbnail strip */}
                  {thumbs.length > 0 && (
                    <div className="flex overflow-hidden border-t border-white/5">
                      {thumbs.map((src, i) => (
                        <Link key={i} href={profileUrl} className="flex-1 overflow-hidden" style={{ height: '52px' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={`${p.name} photo ${i + 2}`}
                            className="w-full h-full object-cover hover:brightness-110 transition border-r border-white/5 last:border-0"
                            loading="lazy"
                          />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Right: details ── */}
                <div className="flex flex-col flex-1 p-3 sm:p-4 min-w-0">
                  {/* Name */}
                  <h2 className="text-base sm:text-lg font-bold text-white leading-snug mb-1.5">
                    <Link href={profileUrl} className="hover:text-pink-300 transition line-clamp-2">
                      {p.name}
                    </Link>
                  </h2>

                  {/* Tags row */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {p.age && (
                      <span className="bg-pink-600/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        {p.age} yrs
                      </span>
                    )}
                    <span className="bg-zinc-800 text-gray-300 text-[11px] px-2 py-0.5 rounded-full border border-white/10">
                      📍 {p.location || 'Ahmedabad'}
                    </span>
                    <span className="bg-zinc-800 text-gray-300 text-[11px] px-2 py-0.5 rounded-full border border-white/10">
                      India
                    </span>
                    <span className="bg-emerald-700/60 text-emerald-300 text-[11px] px-2 py-0.5 rounded-full border border-emerald-600/30">
                      🟢 Available
                    </span>
                  </div>

                  {/* Photo count */}
                  {p.images.length > 0 && (
                    <p className="text-gray-500 text-xs mb-2">
                      {p.images.length} photo{p.images.length !== 1 ? 's' : ''}
                    </p>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-2">
                    <Link
                      href={profileUrl}
                      className="flex-1 text-center bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-500 hover:to-fuchsia-500 text-white font-semibold text-xs sm:text-sm px-3 py-2 rounded-xl transition shadow"
                    >
                      View Profile &amp; Contact
                    </Link>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white font-semibold text-xs sm:text-sm px-3 py-2 rounded-xl transition"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* ── Area Coverage ── */}
      <div className="max-w-5xl mx-auto px-4 py-6 border-t border-white/5">
        <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Escort Service Available In
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            'SG Highway', 'Satellite', 'Vastrapur', 'Prahlad Nagar', 'Bodakdev',
            'Navrangpura', 'Ellisbridge', 'CG Road', 'Maninagar', 'Gota',
            'Chandkheda', 'Motera', 'Bopal', 'South Bopal', 'Thaltej',
            'Ambawadi', 'Paldi', 'Vejalpur', 'Iscon', 'Science City',
          ].map((area) => (
            <span key={area} className="bg-zinc-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-white/5 hover:border-pink-500/30 transition">
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="max-w-3xl mx-auto px-4 py-6 border-t border-white/5">
        <h2 className="text-lg font-bold text-white mb-4">
          Frequently Asked Questions — Ahmedabad Escort Service
        </h2>
        <div className="space-y-3">
          {[
            {
              q: 'How do I book an Ahmedabad escort?',
              a: 'Browse our verified profiles, click "View Profile & Contact", then call or WhatsApp directly. No advance payment required — pay only on arrival.',
            },
            {
              q: 'Are the profiles real and verified?',
              a: 'Yes. All profiles on Aliya Escort Ahmedabad are genuine, independent adults with verified photos. No fake or stock images.',
            },
            {
              q: 'Is incall and outcall service available?',
              a: 'Both incall (at the escort\'s location) and outcall (hotel or home delivery) services are available 24/7 across Ahmedabad.',
            },
            {
              q: 'Which areas in Ahmedabad are covered?',
              a: 'We cover SG Highway, Satellite, Vastrapur, Prahlad Nagar, Bodakdev, Navrangpura, Ellisbridge, CG Road, Maninagar, and all major 5-star hotels in Ahmedabad.',
            },
            {
              q: 'What is the rate for call girls in Ahmedabad?',
              a: 'Rates vary by profile. Contact directly via call or WhatsApp for current rates. No hidden charges, no advance.',
            },
          ].map(({ q, a }) => (
            <details key={q} className="group bg-zinc-900 rounded-xl border border-white/5 hover:border-pink-500/20 transition overflow-hidden">
              <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none select-none text-sm font-semibold text-gray-200 group-open:text-pink-300">
                {q}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* ── SEO Footer ── */}
      <div className="max-w-3xl mx-auto px-4 py-8 text-center border-t border-white/5">
        <h2 className="text-sm font-semibold text-gray-500 mb-2">About Ahmedabad Escort Service</h2>
        <p className="text-gray-500 text-xs leading-relaxed">
          Aliya Escort Ahmedabad is India&#39;s trusted directory for verified independent escort profiles in Ahmedabad, Gujarat.
          Browse genuine call girls available 24/7 — no advance payment, real photos, incall &amp; outcall.
          Service available across SG Highway, Satellite, Vastrapur, Prahlad Nagar, Bodakdev &amp; all areas of Ahmedabad.
          All adults. All consensual. Comply with local laws.
        </p>
      </div>
    </div>
  );
}
