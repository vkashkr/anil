import type { Metadata } from 'next'
import Link from 'next/link'

/* ─── Types ────────────────────────────────────────────────────── */
interface StoryMeta {
  genre: string
  subGenre: string
  rating: string
  language: string
  summary: string
  hook: string
  readingTimeMinutes: number
  wordCount: number
  themes: string[]
  coverImage: string
  published?: boolean
  featured?: boolean
  createdAt: string
}

interface StoryImage {
  id: string
  src: string
  alt: string
  width: number
  height: number
}

interface StorySummary {
  PK?: string
  id?: string
  slug: string
  title: string
  metadata: StoryMeta
  images: StoryImage[]
}

interface StoryListResponse {
  success: boolean
  stories: StorySummary[]
  page: number
  limit: number
  total: number
  totalPages: number
}

const PAGE_SIZE = 5

/* ─── Story URL builder ────────────────────────────────────────── */
function storyUrl(story: StorySummary): string {
  const pk = story.PK ?? story.id ?? story.slug
  return `/stories/entertainment?title=${encodeURIComponent(story.title)}&id=${encodeURIComponent(pk)}`
}

/* ─── SEO ───────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'Stories — Dark Romance & Literary Drama',
  description:
    'Read original Hinglish short stories exploring desire, loneliness, and self-discovery. Sensual, melancholic, and beautifully written.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Stories — Dark Romance & Literary Drama',
    description:
      'Read original Hinglish short stories exploring desire, loneliness, and self-discovery.',
    type: 'website',
  },
}


async function fetchStories(page: number): Promise<StoryListResponse> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const res = await fetch(
    `${base}/bff/api/stories/list?page=${page}&limit=${PAGE_SIZE}`,
    { next: { revalidate: 60 } },
  )
  if (!res.ok) {
    return { success: false, stories: [], page, limit: PAGE_SIZE, total: 0, totalPages: 0 }
  }
  return res.json()
}

/* ─── Story Card ────────────────────────────────────────────────── */
function StoryCard({ story }: { story: StorySummary }) {
  const meta = story.metadata
  const coverImg = story.images?.find((i) => i.id === meta.coverImage)
  const url = storyUrl(story)

  return (
    <Link
      href={url}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:border-rose-700/60 hover:bg-zinc-900 transition-all duration-300 shadow-lg hover:shadow-rose-950/40 hover:shadow-xl"
    >
      {/* Cover image */}
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-zinc-900">
        {coverImg?.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImg.src}
            alt={coverImg.alt ?? story.title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
            <svg
              className="w-14 h-14 text-zinc-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-rose-600 text-white shadow">
            {meta.rating}
          </span>
          {meta.featured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 border border-amber-500/40 text-amber-300">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 space-y-3">
        {/* Genre */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="uppercase tracking-widest">{meta.genre}</span>
          <span>·</span>
          <span>{meta.language}</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-black text-white leading-snug group-hover:text-rose-300 transition-colors">
          {story.title}
        </h2>

        {/* Hook */}
        <p className="text-sm text-amber-300/80 italic leading-relaxed border-l-2 border-amber-600/40 pl-3">
          &ldquo;{meta.hook}&rdquo;
        </p>

        {/* Summary */}
        <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
          {meta.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 mt-auto">
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {meta.readingTimeMinutes} min read
            </span>
            <span>{(meta.wordCount ?? 0).toLocaleString()} words</span>
          </div>
          <span className="text-xs text-rose-400 font-medium group-hover:underline">
            Read →
          </span>
        </div>

        {/* Themes */}
        {meta.themes?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {meta.themes.slice(0, 4).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-400 border border-zinc-700"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const currentPage = Math.max(1, Number(params.page) || 1)
  const { stories, total, totalPages } = await fetchStories(currentPage)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="max-w-5xl mx-auto px-5 sm:px-8 pt-16 pb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-rose-400 transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Home
        </Link>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
            Original Stories
          </p>
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight">
            Stories
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
            Hinglish dark romance. Desire, loneliness, and the quiet courage it takes to feel something real.
          </p>
        </div>

        {/* Stats strip */}
        <div className="flex gap-6 mt-8 text-sm text-zinc-500">
          <span>
            <span className="text-white font-semibold">{total}</span>{' '}
            {total === 1 ? 'story' : 'stories'}
          </span>
          <span className="text-zinc-700">·</span>
          <span>
            Page <span className="text-white font-semibold">{currentPage}</span> of{' '}
            <span className="text-white font-semibold">{totalPages}</span>
          </span>
          <span className="text-zinc-700">·</span>
          <span>Adult · 18+</span>
        </div>
      </header>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-10" />
      </div>

      {/* Grid */}
      <main className="max-w-5xl mx-auto px-5 sm:px-8 pb-24">
        {stories.length === 0 ? (
          <div className="text-center py-24 text-zinc-600">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-sm">No stories published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <StoryCard key={story.PK ?? story.id ?? story.slug} story={story} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-4 mt-12" aria-label="Pagination">
            {currentPage > 1 ? (
              <Link
                href={`/stories?page=${currentPage - 1}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-rose-700 hover:text-white transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Link>
            ) : (
              <span className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-zinc-600 text-sm font-medium cursor-not-allowed">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </span>
            )}

            <span className="text-sm text-zinc-400">
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link
                href={`/stories?page=${currentPage + 1}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-rose-700 hover:text-white transition-colors text-sm font-medium"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <span className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-zinc-600 text-sm font-medium cursor-not-allowed">
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </nav>
        )}
      </main>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Stories — Dark Romance & Literary Drama',
            description:
              'Original Hinglish short stories exploring desire, loneliness, and self-discovery.',
            url: 'https://ahmedabad.aliyaescort.com/stories',
            hasPart: stories.map((s) => ({
              '@type': 'Article',
              headline: s.title,
              url: `https://ahmedabad.aliyaescort.com${storyUrl(s)}`,
            })),
          }),
        }}
      />
    </div>
  )
}
