'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
const S3_BUCKET_URL = 'https://www.aliyaescort.com';
const S3_STORY_PREFIX = 'images/story';

/** Strip data-URL prefix and return raw base64 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ─── Types ────────────────────────────────────────────────────────── */
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

interface StoryMetadata {
  author: string;
  createdAt: string;
  updatedAt: string;
  language: string;
  genre: string;
  subGenre: string;
  audience: string;
  rating: string;
  contentWarnings: string[];
  themes: string[];
  tone: string;
  setting: string;
  period: string;
  summary: string;
  hook: string;
  readingTimeMinutes: number;
  wordCount: number;
  keywords: string[];
  published: boolean;
  featured: boolean;
  coverImage: string;
  bannerImage: string;
}

interface StoryData {
  id: string;
  slug: string;
  title: string;
  metadata: StoryMetadata;
  characters: Character[];
  paragraphs: Paragraph[];
  images: StoryImage[];
}

/* ─── Tab type ─────────────────────────────────────────────────────── */
type Tab = 'info' | 'paragraphs' | 'images' | 'characters' | 'json';

interface PendingUpload {
  file: File;
  previewUrl: string;
  s3Key: string;
}

/* ─── S3 Browser Modal ──────────────────────────────────────────────── */
function S3BrowserModal({
  onPick,
  onClose,
}: {
  onPick: (url: string) => void;
  onClose: () => void;
}) {
  const [prefix, setPrefix] = useState(S3_STORY_PREFIX);
  const [images, setImages] = useState<{ filename: string; full_path: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (p: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/bff/api/get-profiles?id=${encodeURIComponent(p)}`);
      const json = await res.json();
      setImages(json?.data?.images ?? []);
    } catch {
      setError('Failed to load S3 images');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(prefix); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <h2 className="text-base font-bold text-white">Browse S3 Bucket</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Prefix search */}
        <div className="px-5 py-3 border-b border-gray-700 flex gap-2">
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(prefix)}
            placeholder="S3 prefix (e.g. story/)"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button
            onClick={() => load(prefix)}
            disabled={loading}
            className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white text-sm rounded-lg disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Browse'}
          </button>
        </div>

        {/* Image grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && <p className="text-red-400 text-sm text-center py-4">{error}</p>}
          {!loading && images.length === 0 && !error && (
            <p className="text-gray-500 text-sm text-center py-8">No images found for prefix &quot;{prefix}&quot;</p>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img) => (
              <button
                key={img.filename}
                onClick={() => onPick(img.full_path)}
                className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-700 hover:border-rose-500 transition-colors bg-gray-800"
                title={img.filename}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.full_path}
                  alt={img.filename}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/70 text-xs text-gray-300 px-1.5 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.filename.split('/').pop()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Slug → story-id map (extend as more stories are added) ────────── */
const SLUG_TO_ID: Record<string, string> = {
  'puri-raat-sapne-mein': 'story-002',
};

/* ─── Helper: textarea auto-grow ──────────────────────────────────── */
function AutoTextarea({
  value,
  onChange,
  className = '',
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-y ${className}`}
    />
  );
}

/* ─── Helper: tag list editor ─────────────────────────────────────── */
function TagEditor({
  label,
  tags,
  onChange,
}: {
  label: string;
  tags: string[];
  onChange: (t: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setDraft('');
  };
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 bg-rose-900/40 text-rose-300 text-xs px-2 py-0.5 rounded-full"
          >
            {t}
            <button
              type="button"
              onClick={() => onChange(tags.filter((x) => x !== t))}
              className="hover:text-white leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Add tag & press Enter"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
        >
          Add
        </button>
      </div>
    </div>
  );
}

/* ─── Main component ───────────────────────────────────────────────── */
export default function StoryEditPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [story, setStory] = useState<StoryData | null>(null);
  const [tab, setTab] = useState<Tab>('info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [jsonError, setJsonError] = useState('');
  const [rawJson, setRawJson] = useState('');

  // Image upload
  const [pendingUploads, setPendingUploads] = useState<Record<number, PendingUpload>>({});
  const [s3BrowserOpen, setS3BrowserOpen] = useState(false);
  const [s3BrowserForIdx, setS3BrowserForIdx] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  /* ── Auth guard ── */
  useEffect(() => {
    if (localStorage.getItem('admin_auth_ui_flag') !== 'true') {
      router.replace('/admin/login');
    }
  }, [router]);

  /* ── Load story ── */
  useEffect(() => {
    const storyId = SLUG_TO_ID[slug];
    if (!storyId) {
      setLoading(false);
      return;
    }

    fetch(`/bff/api/stories?id=${encodeURIComponent(storyId)}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res?.data) throw new Error('Story not found in DynamoDB');
        setStory(structuredClone(res.data as StoryData));
        setRawJson(JSON.stringify(res.data, null, 2));
      })
      .catch((err: Error) => {
        setSaveMsg({ ok: false, text: err.message ?? 'Failed to load story' });
      })
      .finally(() => setLoading(false));
  }, [slug]);

  /* ── Keep raw JSON in sync when tab switches to json ── */
  useEffect(() => {
    if (tab === 'json' && story) {
      setRawJson(JSON.stringify(story, null, 2));
      setJsonError('');
    }
  }, [tab, story]);

  /* ── Save (with S3 upload for pending local files) ── */
  const handleSave = useCallback(async () => {
    if (!story) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      let payload: StoryData = tab === 'json' ? JSON.parse(rawJson) : { ...story };

      // 1. Upload any pending local images to S3
      const pendingEntries = Object.entries(pendingUploads);
      if (pendingEntries.length > 0) {
        setSaveMsg({ ok: true, text: `Uploading ${pendingEntries.length} image(s)…` });
        const updatedImages = [...payload.images];
        for (const [idxStr, pending] of pendingEntries) {
          const idx = Number(idxStr);
          const base64 = await fileToBase64(pending.file);
          await fetch('/bff/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64, filename: pending.s3Key, metadata: {} }),
          });
          const s3Url = `${S3_BUCKET_URL}/${pending.s3Key}`;
          updatedImages[idx] = { ...updatedImages[idx], src: s3Url };
        }
        payload = { ...payload, images: updatedImages };
        setStory(payload);
        setPendingUploads({});
        setSaveMsg(null);
      }

      // 2. Save story to DynamoDB
      const res = await fetch('/bff/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSaveMsg({ ok: true, text: 'Story saved successfully!' });
        if (tab === 'json') setStory(payload);
      } else {
        setSaveMsg({ ok: false, text: data.error ?? 'Save failed' });
      }
    } catch (err) {
      setSaveMsg({ ok: false, text: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 4000);
    }
  }, [story, tab, rawJson, pendingUploads]);

  /* ── Paragraph helpers ── */
  const updateParagraph = (idx: number, field: keyof Paragraph, value: unknown) => {
    setStory((prev) => {
      if (!prev) return prev;
      const paras = [...prev.paragraphs];
      paras[idx] = { ...paras[idx], [field]: value };
      return { ...prev, paragraphs: paras };
    });
  };

  const addParagraph = () => {
    setStory((prev) => {
      if (!prev) return prev;
      const newId = `p${prev.paragraphs.length + 1}`;
      const newPara: Paragraph = {
        id: newId,
        order: prev.paragraphs.length + 1,
        text: '',
        themes: [],
        mood: '',
        characterRefs: [],
        imageRefs: [],
      };
      return { ...prev, paragraphs: [...prev.paragraphs, newPara] };
    });
  };

  const removeParagraph = (idx: number) => {
    setStory((prev) => {
      if (!prev) return prev;
      const paras = prev.paragraphs.filter((_, i) => i !== idx).map((p, i) => ({ ...p, order: i + 1 }));
      return { ...prev, paragraphs: paras };
    });
  };

  /* ── Image helpers ── */
  const updateImage = (idx: number, field: keyof StoryImage, value: unknown) => {
    setStory((prev) => {
      if (!prev) return prev;
      const imgs = [...prev.images];
      imgs[idx] = { ...imgs[idx], [field]: value };
      return { ...prev, images: imgs };
    });
  };

  /* ── Character helpers ── */
  const updateCharacter = (idx: number, field: keyof Character, value: unknown) => {
    setStory((prev) => {
      if (!prev) return prev;
      const chars = [...prev.characters];
      chars[idx] = { ...chars[idx], [field]: value };
      return { ...prev, characters: chars };
    });
  };

  /* ── Field helper for metadata ── */
  const setMeta = (field: keyof StoryMetadata, value: unknown) => {
    setStory((prev) => prev ? { ...prev, metadata: { ...prev.metadata, [field]: value } } : prev);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse text-sm">Loading story…</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Story not found for slug: <code className="text-rose-400">{slug}</code></p>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-white underline">Go back</button>
      </div>
    );
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'info',       label: 'Story Info' },
    { id: 'paragraphs', label: `Paragraphs (${story.paragraphs.length})` },
    { id: 'images',     label: `Images (${story.images.length})` },
    { id: 'characters', label: `Characters (${story.characters.length})` },
    { id: 'json',       label: 'Raw JSON' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
            title="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Edit Story</h1>
            <p className="text-xs text-gray-400 font-mono">{story.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${saveMsg.ok ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300'}`}>
              {saveMsg.text}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-fuchsia-600 hover:from-rose-500 hover:to-fuchsia-500 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-all"
          >
            {saving ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      {/* ── Tabs ── */}
      <nav className="bg-gray-900 border-b border-white/10 px-4 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id
                ? 'border-rose-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* ── Content ── */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* ══ INFO TAB ══ */}
        {tab === 'info' && (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
              <input
                type="text"
                value={story.title}
                onChange={(e) => setStory((p) => p ? { ...p, title: e.target.value } : p)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Slug (read-only) */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Slug (read-only)</label>
              <input
                type="text"
                value={story.slug}
                readOnly
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-400 text-sm cursor-not-allowed"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Summary</label>
              <AutoTextarea rows={4} value={story.metadata.summary} onChange={(v) => setMeta('summary', v)} />
            </div>

            {/* Hook */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Hook</label>
              <AutoTextarea rows={2} value={story.metadata.hook} onChange={(v) => setMeta('hook', v)} />
            </div>

            {/* Two-col grid for short fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  ['Genre',     'genre'],
                  ['Sub-genre', 'subGenre'],
                  ['Tone',      'tone'],
                  ['Setting',   'setting'],
                  ['Period',    'period'],
                  ['Language',  'language'],
                  ['Audience',  'audience'],
                  ['Rating',    'rating'],
                  ['Author',    'author'],
                ] as [string, keyof StoryMetadata][]
              ).map(([label, field]) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
                  <input
                    type="text"
                    value={story.metadata[field] as string}
                    onChange={(e) => setMeta(field, e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Reading Time (min)</label>
                <input
                  type="number"
                  value={story.metadata.readingTimeMinutes}
                  onChange={(e) => setMeta('readingTimeMinutes', Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Word Count</label>
                <input
                  type="number"
                  value={story.metadata.wordCount}
                  onChange={(e) => setMeta('wordCount', Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Tags */}
            <TagEditor label="Themes" tags={story.metadata.themes} onChange={(v) => setMeta('themes', v)} />
            <TagEditor label="Keywords" tags={story.metadata.keywords} onChange={(v) => setMeta('keywords', v)} />
            <TagEditor label="Content Warnings" tags={story.metadata.contentWarnings} onChange={(v) => setMeta('contentWarnings', v)} />

            {/* Flags */}
            <div className="flex gap-6">
              {(['published', 'featured'] as (keyof StoryMetadata)[]).map((flag) => (
                <label key={flag} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={story.metadata[flag] as boolean}
                    onChange={(e) => setMeta(flag, e.target.checked)}
                    className="w-4 h-4 accent-rose-500"
                  />
                  <span className="text-sm text-gray-300 capitalize">{flag}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ══ PARAGRAPHS TAB ══ */}
        {tab === 'paragraphs' && (
          <div className="space-y-6">
            {story.paragraphs.map((para, idx) => (
              <div key={para.id} className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-500">
                    #{para.order} · <span className="text-rose-400">{para.id}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeParagraph(idx)}
                    className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Text</label>
                  <AutoTextarea
                    rows={5}
                    value={para.text}
                    onChange={(v) => updateParagraph(idx, 'text', v)}
                  />
                  <p className="text-xs text-gray-600 mt-1">Use *text* for italic.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Mood</label>
                    <input
                      type="text"
                      value={para.mood}
                      onChange={(e) => updateParagraph(idx, 'mood', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Image Refs (comma-sep)</label>
                    <input
                      type="text"
                      value={para.imageRefs.join(', ')}
                      onChange={(e) =>
                        updateParagraph(idx, 'imageRefs', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <TagEditor
                  label="Themes"
                  tags={para.themes}
                  onChange={(v) => updateParagraph(idx, 'themes', v)}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addParagraph}
              className="w-full py-3 border-2 border-dashed border-gray-700 hover:border-rose-600 text-gray-500 hover:text-rose-400 rounded-xl text-sm transition-colors"
            >
              + Add Paragraph
            </button>
          </div>
        )}

        {/* ══ IMAGES TAB ══ */}
        {tab === 'images' && (
          <div className="space-y-6">
            {story.images.map((img, idx) => {
              const pending = pendingUploads[idx];
              const previewSrc = pending?.previewUrl ?? img.src;
              const isS3 = img.src.startsWith('http');

              return (
                <div key={img.id} className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
                  {/* Header row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-mono text-rose-400">{img.id}</span>
                    <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded">{img.usage}</span>
                    {img.paragraphId && (
                      <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded">→ {img.paragraphId}</span>
                    )}
                    {pending && (
                      <span className="text-xs text-amber-400 bg-amber-900/30 border border-amber-700/40 px-2 py-0.5 rounded-full">
                        ⏳ Pending upload
                      </span>
                    )}
                    {isS3 && !pending && (
                      <span className="text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-700/40 px-2 py-0.5 rounded-full">
                        ☁ S3
                      </span>
                    )}
                  </div>

                  {/* Preview + upload controls */}
                  <div className="flex gap-4 items-start">
                    {/* Thumbnail preview */}
                    <div className="flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden border border-gray-700 bg-gray-800 flex items-center justify-center">
                      {previewSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewSrc}
                          alt={img.alt}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }}
                        />
                      ) : (
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>

                    {/* Upload action buttons */}
                    <div className="flex flex-col gap-2">
                      {/* Hidden file input */}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => { fileInputRefs.current[idx] = el; }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const ext = file.name.split('.').pop() ?? 'jpg';
                          const s3Key = `${S3_STORY_PREFIX}/${slug}/${img.id}.${ext}`;
                          const previewUrl = URL.createObjectURL(file);
                          setPendingUploads((prev) => ({ ...prev, [idx]: { file, previewUrl, s3Key } }));
                          // Reset input so same file can be re-selected
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[idx]?.click()}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload from Local
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setS3BrowserForIdx(idx);
                          setS3BrowserOpen(true);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                        Pick from S3
                      </button>
                      {pending && (
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(pending.previewUrl);
                            setPendingUploads((prev) => { const n = { ...prev }; delete n[idx]; return n; });
                          }}
                          className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                        >
                          ✕ Cancel upload
                        </button>
                      )}
                      {pending && (
                        <p className="text-xs text-gray-500 max-w-[160px] truncate" title={pending.s3Key}>
                          → {pending.s3Key}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Src field */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-400 mb-1">Src path / URL</label>
                      <input
                        type="text"
                        value={img.src}
                        onChange={(e) => updateImage(idx, 'src', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
                      <select
                        value={img.type}
                        onChange={(e) => updateImage(idx, 'type', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        {['cover', 'banner', 'scene', 'mood', 'character', 'inline'].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Alt text</label>
                      <input
                        type="text"
                        value={img.alt}
                        onChange={(e) => updateImage(idx, 'alt', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Caption</label>
                      <input
                        type="text"
                        value={img.caption}
                        onChange={(e) => updateImage(idx, 'caption', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Width (px)</label>
                      <input
                        type="number"
                        value={img.width}
                        onChange={(e) => updateImage(idx, 'width', Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Height (px)</label>
                      <input
                        type="number"
                        value={img.height}
                        onChange={(e) => updateImage(idx, 'height', Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <TagEditor
                    label="Themes"
                    tags={img.themes}
                    onChange={(v) => updateImage(idx, 'themes', v)}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* ══ S3 BROWSER MODAL ══ */}
        {s3BrowserOpen && s3BrowserForIdx !== null && (
          <S3BrowserModal
            onPick={(url) => {
              updateImage(s3BrowserForIdx, 'src', url);
              // Clear any pending local upload for this slot
              setPendingUploads((prev) => {
                const n = { ...prev };
                if (n[s3BrowserForIdx]) {
                  URL.revokeObjectURL(n[s3BrowserForIdx].previewUrl);
                  delete n[s3BrowserForIdx];
                }
                return n;
              });
              setS3BrowserOpen(false);
              setS3BrowserForIdx(null);
            }}
            onClose={() => {
              setS3BrowserOpen(false);
              setS3BrowserForIdx(null);
            }}
          />
        )}

        {/* ══ CHARACTERS TAB ══ */}
        {tab === 'characters' && (
          <div className="space-y-6">
            {story.characters.map((char, idx) => (
              <div key={char.id} className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-rose-400">{char.id}</span>
                  <span className="text-xs text-gray-400">{char.role}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(
                    [
                      ['Name',       'name'],
                      ['Role',       'role'],
                      ['Occupation', 'occupation'],
                    ] as [string, keyof Character][]
                  ).map(([label, field]) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
                      <input
                        type="text"
                        value={char[field] as string}
                        onChange={(e) => updateCharacter(idx, field, e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Age</label>
                    <input
                      type="number"
                      value={char.age}
                      onChange={(e) => updateCharacter(idx, 'age', Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {(
                  [
                    ['Motivation', 'motivation'],
                    ['Wound',      'wound'],
                    ['Flaw',       'flaw'],
                    ['Arc',        'arc'],
                  ] as [string, keyof Character][]
                ).map(([label, field]) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
                    <AutoTextarea
                      rows={2}
                      value={char[field] as string}
                      onChange={(v) => updateCharacter(idx, field, v)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ══ JSON TAB ══ */}
        {tab === 'json' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Edit the raw JSON directly. Changes here will be saved as-is.</p>
            {jsonError && (
              <div className="text-xs text-red-400 bg-red-900/20 border border-red-700/30 px-3 py-2 rounded-lg">
                {jsonError}
              </div>
            )}
            <textarea
              value={rawJson}
              onChange={(e) => {
                setRawJson(e.target.value);
                try {
                  JSON.parse(e.target.value);
                  setJsonError('');
                } catch (err) {
                  setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
                }
              }}
              rows={40}
              spellCheck={false}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-xs text-green-300 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500 resize-y"
            />
          </div>
        )}
      </main>
    </div>
  );
}
