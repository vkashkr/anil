// Fix #6 — Clean path-based route /stories/entertainment/[slug] replaces ?id= query param
// Fix #8 — generateMetadata with per-story canonical
// Fix #12 — next/image via StoryImg component
// Fix #13 — Typed interfaces, no `any`
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReadingProgress from '../ReadingProgress';
import StoryImg from '../StoryImg';
import AdminEditButton from '../AdminEditButton';

const BASE_URL = 'https://ahmedabad.aliyaescort.com';

/* ─── Types ──────────────────────────────────────────────────── */
interface StoryMeta {
  author: string;
  summary: string;
  hook: string;
  genre: string;
  subGenre: string;
  rating: string;
  language: string;
  readingTimeMinutes: number;
  wordCount: number;
  themes: string[];
  keywords: string[];
  contentWarnings: string[];
  coverImage: string;
  bannerImage: string;
  setting: string;
  tone: string;
  period: string;
  audience: string;
  createdAt: string;
  updatedAt: string;
  published?: boolean;
}

interface StoryImage {
  id: string;
  src: string;
  alt: string;
  caption: string;
  type: string;
  usage: string;
  paragraphId?: string;
  themes: string[];
  width: number;
  height: number;
}

interface Paragraph {
  id: string;
  order: number;
  text: string;
  themes: string[];
  mood: string;
  characterRefs: string[];
  imageRefs: string[];
}

interface Character {
  id: string;
  name: string;
  role: string;
  age: number;
  occupation: string;
  motivation: string;
  wound: string;
  flaw: string;
  arc: string;
}

interface StoryData {
  PK?: string;
  slug?: string;
  title: string;
  metadata: StoryMeta;
  paragraphs: Paragraph[];
  images: StoryImage[];
  characters: Character[];
}

interface StorySummary {
  PK: string;
  slug: string;
  title: string;
}

/* ─── Data fetching ──────────────────────────────────────────── */
async function resolveStoryBySlug(slug: string): Promise<StoryData | null> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // 1. Try slug directly as the story PK/ID
  try {
    const res = await fetch(`${base}/bff/api/stories?id=${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data) return json.data as StoryData;
    }
  } catch {
    // fall through to list-based lookup
  }

  // 2. Fallback: look up the PK via the story list using the slug field
  try {
    const listRes = await fetch(
      `${base}/bff/api/stories/list?page=1&limit=500`,
      { next: { revalidate: 3600 } },
    );
    if (!listRes.ok) return null;
    const listJson = await listRes.json();
    const match: StorySummary | undefined = listJson?.stories?.find(
      (s: StorySummary) => s.slug === slug,
    );
    if (!match) return null;

    const storyRes = await fetch(
      `${base}/bff/api/stories?id=${encodeURIComponent(match.PK)}`,
      { next: { revalidate: 60 } },
    );
    if (!storyRes.ok) return null;
    const storyJson = await storyRes.json();
    return storyJson?.data ?? null;
  } catch {
    return null;
  }
}

/* ─── SEO metadata ───────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await resolveStoryBySlug(slug);
  if (!story) return { title: 'Story Not Found' };

  const url = `${BASE_URL}/stories/entertainment/${slug}`;
  const coverImg = story.images?.find((img) => img.id === story.metadata.coverImage);
  const ogImages = coverImg?.src ? [{ url: coverImg.src, alt: coverImg.alt }] : [];
  return {
    title: story.title,
    description: story.metadata.summary,
    keywords: story.metadata.keywords,
    robots: { index: true, follow: true },
    // Fix #8 — canonical on every story page
    alternates: { canonical: url },
    openGraph: {
      url,
      title: story.title,
      description: story.metadata.hook,
      type: 'article',
      locale: 'hi_IN',
      publishedTime: story.metadata.createdAt,
      tags: story.metadata.themes,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: story.title,
      description: story.metadata.hook,
      images: coverImg?.src ? [coverImg.src] : [],
      site: '@AliyaEscort',
    },
  };
}

/* ─── Mood → accent colour ───────────────────────────────────── */
const moodAccent: Record<string, { border: string; glow: string; badge: string }> = {
  'quiet, heavy': { border: 'border-zinc-500', glow: 'shadow-zinc-900', badge: 'bg-zinc-700 text-zinc-300' },
  'soft, opening': { border: 'border-blue-400', glow: 'shadow-blue-950', badge: 'bg-blue-900/50 text-blue-300' },
  'warm, raw': { border: 'border-amber-400', glow: 'shadow-amber-950', badge: 'bg-amber-900/40 text-amber-300' },
  'intimate, certain': { border: 'border-rose-400', glow: 'shadow-rose-950', badge: 'bg-rose-900/40 text-rose-300' },
  'free, playful, deep': { border: 'border-violet-400', glow: 'shadow-violet-950', badge: 'bg-violet-900/40 text-violet-300' },
  'grounded, quietly triumphant': { border: 'border-emerald-400', glow: 'shadow-emerald-950', badge: 'bg-emerald-900/40 text-emerald-300' },
};
function getMoodStyle(mood: string) {
  return moodAccent[mood] ?? { border: 'border-zinc-600', glow: 'shadow-zinc-900', badge: 'bg-zinc-700 text-zinc-400' };
}

/* ─── Inline *italic* renderer ───────────────────────────────── */
function RenderText({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('*') && part.endsWith('*') ? (
          <em key={i} className="not-italic text-rose-300 font-medium">
            {part.slice(1, -1)}
          </em>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/* ─── Paragraph Image ────────────────────────────────────────── */
function ParagraphImage({ image }: { image: StoryImage }) {
  return (
    <figure className="my-8 rounded-2xl overflow-hidden border border-zinc-800 shadow-xl">
      <div
        className="relative w-full bg-gradient-to-br from-zinc-900 via-rose-950/30 to-zinc-900"
        style={{ aspectRatio: `${image.width}/${image.height}` }}
      >
        <StoryImg
          src={image.src}
          alt={image.alt}
          className="absolute inset-0 w-full h-full object-cover opacity-90"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>
      {image.caption && (
        <figcaption className="px-5 py-3 text-sm text-zinc-400 italic bg-zinc-900/80 border-t border-zinc-800">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ─── Character Card ─────────────────────────────────────────── */
function CharacterCard({ character }: { character: Character }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-6 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-rose-400 mb-1">{character.role}</p>
          <h3 className="text-xl font-bold text-white">{character.name}</h3>
          <p className="text-sm text-zinc-400">
            {character.age} — {character.occupation}
          </p>
        </div>
        <span className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-rose-700 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
          {character.name[0]}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm">
        {[
          { label: 'Wants', value: character.motivation },
          { label: 'Wound', value: character.wound },
          { label: 'Flaw', value: character.flaw },
          { label: 'Arc', value: character.arc },
        ].map(({ label, value }) => (
          <div key={label} className="bg-zinc-800/50 rounded-xl p-3">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-zinc-300 leading-snug">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default async function StorySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await resolveStoryBySlug(slug);
  if (!story) notFound();

  const { metadata: meta, paragraphs, images, characters } = story;
  const imageMap = Object.fromEntries(images.map((img) => [img.id, img]));
  const bannerImage = imageMap[meta.bannerImage];
  const coverImage = imageMap[meta.coverImage];
  const canonicalUrl = `${BASE_URL}/stories/entertainment/${slug}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <ReadingProgress />
      <AdminEditButton slug={story.slug || slug} />

      {/* Hero */}
      <section className="relative min-h-[92vh] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/30 via-zinc-950/50 to-zinc-950">
          {bannerImage && (
            <StoryImg
              src={bannerImage.src}
              alt={bannerImage.alt}
              className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
            />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(244,63,94,0.08)_0%,_transparent_70%)]" />
        </div>

        <div className="absolute top-6 left-6 z-10">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-rose-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto w-full px-6 pb-16 pt-24">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-rose-600 text-white">
              {meta.rating}
            </span>
            <span className="px-3 py-1 rounded-full text-xs uppercase tracking-wide bg-zinc-800 text-zinc-300 border border-zinc-700">
              {meta.genre}
            </span>
            <span className="px-3 py-1 rounded-full text-xs uppercase tracking-wide bg-zinc-800 text-zinc-300 border border-zinc-700">
              {meta.language}
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight tracking-tight mb-4">
            {story.title}
          </h1>
          <p className="text-xl sm:text-2xl text-amber-300 italic font-light leading-relaxed mb-8 border-l-2 border-amber-500 pl-4">
            &ldquo;{meta.hook}&rdquo;
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-400 mb-6">
            <span>{meta.author}</span>
            <span>{meta.readingTimeMinutes} min read</span>
            <span>{meta.wordCount.toLocaleString()} words</span>
            <span>
              {new Date(meta.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {meta.contentWarnings?.length > 0 && (
            <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-2">
                Content Warnings
              </p>
              <div className="flex flex-wrap gap-2">
                {meta.contentWarnings.map((w) => (
                  <span
                    key={w}
                    className="px-2.5 py-1 rounded-full text-xs bg-rose-900/40 text-rose-300 border border-rose-800/50"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Story Body */}
      <main className="max-w-2xl mx-auto px-5 sm:px-6 py-12 space-y-2">
        <div className="mb-10 flex items-start gap-3 rounded-xl bg-zinc-900/60 border border-zinc-800 px-5 py-4 text-sm text-zinc-400">
          <span>
            <span className="text-zinc-300 font-medium">Setting — </span>
            {meta.setting}
          </span>
        </div>

        {paragraphs
          .sort((a, b) => a.order - b.order)
          .map((para) => {
            const style = getMoodStyle(para.mood);
            const paraImgs = (para.imageRefs ?? [])
              .map((ref) => imageMap[ref])
              .filter(Boolean) as StoryImage[];
            return (
              <article key={para.id} className="group">
                <div
                  className={`relative border-l-4 ${style.border} pl-6 py-1 mb-2 transition-all duration-300`}
                >
                  <span className={`inline-block mb-3 px-2.5 py-0.5 rounded-full text-xs ${style.badge}`}>
                    {para.mood}
                  </span>
                  <p className="text-lg sm:text-xl text-zinc-200 leading-[1.85] tracking-wide">
                    <RenderText text={para.text} />
                  </p>
                </div>
                {paraImgs.map((img) => (
                  <ParagraphImage key={img.id} image={img} />
                ))}
                <div className="flex items-center gap-4 my-8 opacity-30">
                  <div className="flex-1 h-px bg-zinc-700" />
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <div className="flex-1 h-px bg-zinc-700" />
                </div>
              </article>
            );
          })}
      </main>

      {/* Characters */}
      {characters?.length > 0 && (
        <section className="max-w-2xl mx-auto px-5 sm:px-6 pb-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-5">Characters</h2>
          <div className="space-y-4">
            {characters.map((char) => (
              <CharacterCard key={char.id} character={char} />
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      <section className="max-w-2xl mx-auto px-5 sm:px-6 pb-20">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-6 py-5 space-y-4">
          {meta.themes?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Themes</p>
              <div className="flex flex-wrap gap-2">
                {meta.themes.map((t) => (
                  <span key={t} className="px-3 py-1 rounded-full text-xs bg-zinc-800 text-zinc-300 border border-zinc-700">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {meta.keywords?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {meta.keywords.map((k) => (
                  <span key={k} className="px-3 py-1 rounded-full text-xs bg-zinc-950 text-zinc-500 border border-zinc-800">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Fix #9 — valid Schema.org Article type */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: story.title,
            description: meta.summary,
            url: canonicalUrl,
            author: { '@type': 'Person', name: meta.author },
            datePublished: meta.createdAt,
            dateModified: meta.updatedAt,
            keywords: meta.keywords?.join(', '),
            inLanguage: meta.language,
            image: coverImage?.src,
          }),
        }}
      />
    </div>
  );
}
