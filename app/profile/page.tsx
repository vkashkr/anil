'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PHONE_TEL, PHONE_DISPLAY, WHATSAPP_URL, PHONE_NUMBER } from '@/app/lib/constants';

interface ProfileData {
  filename?: string;
  full_path?: string;
  metadata?: any;
  // DynamoDB Fields
  id: string;
  name?: string;
  age?: string | number;
  gender?: string;
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  place?: string;
  location?: string;
  description?: string;
  images?: string[];
  services?: string[];
  customCss?: string;
  seoTitle?: string;
  seoDescription?: string;
  extraProperties?: Record<string, string>;
}

// Helper component to wrap the profile content
function ProfileContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');
  const queryName = searchParams.get('name');
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [id, setId] = useState<string | null>(queryId);
  const [reviews, setReviews] = useState<{ name: string; rating: number; text: string; date: string }[]>([]);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id && queryName && typeof window !== 'undefined') {
      // First try localStorage (fast path for returning visitors)
      const storedId = localStorage.getItem(`profile_id_${queryName}`);
      if (storedId) {
        setId(storedId);
      } else {
        // Fallback: resolve name → id via API (works for Google bot and direct links)
        setLoading(true);
        fetch(`/api/profile?name=${encodeURIComponent(queryName)}`)
          .then(r => r.json())
          .then(data => {
            if (data.success && data.profile?.id) {
              localStorage.setItem(`profile_id_${queryName}`, data.profile.id);
              setId(data.profile.id);
            } else {
              setError('Profile not found.');
              setLoading(false);
            }
          })
          .catch(() => {
            setError('Failed to load profile. Please try again.');
            setLoading(false);
          });
      }
    } else if (!id && !queryName) {
      setError('No profile identifier provided');
      setLoading(false);
    }
  }, [queryId, queryName]);

  useEffect(() => {
    // Check if user is admin - using localStorage to avoid network calls
    if (typeof window !== 'undefined' && localStorage.getItem("admin_auth_ui_flag") === "true") {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    // Fetch static reviews and DynamoDB user reviews in parallel
    Promise.all([
      fetch('/data/customer.json').then(r => r.json()).catch(() => []),
      fetch(`/api/profile?id=${encodeURIComponent(id)}`).then(r => r.json()).catch(() => ({ success: false }))
    ]).then(([staticAll, dynRes]) => {
      // Deterministic seed from profile id for static reviews
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
      }
      const seed = Math.abs(hash);
      let s = seed;
      const rand = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      const count = Math.floor(rand() * 6) + 5;
      const shuffled = [...staticAll].sort(() => rand() - 0.5);
      const staticPicked = shuffled.slice(0, count);

      // Get user-submitted reviews from DynamoDB
      const userReviews: { name: string; rating: number; text: string; date: string }[] =
        (dynRes.success && dynRes.profile?.reviews) ? dynRes.profile.reviews : [];

      // Combine DynamoDB + static reviews (max 7), sort by date latest first
      const remaining = Math.max(0, 7 - userReviews.length);
      const combined = [...userReviews.slice(0, 7), ...staticPicked.slice(0, remaining)];
      combined.sort((a, b) => {
        const da = new Date(a.date).getTime() || 0;
        const db = new Date(b.date).getTime() || 0;
        return db - da;
      });
      setReviews(combined);
    });
  }, [id]);

  useEffect(() => {
    if (!id) {
       return;
    }

    async function fetchProfile() {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const CACHE_KEY = `profile_detail_v1_${id}`;
      const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

      // Try load from cache (skip on localhost)
      if (!isLocal) {
        try {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
            const { timestamp, data } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
              setProfile(data);
              if (data.images && data.images.length > 0) setSelectedImage(data.images[0]);
              setLoading(false);
              return;
            }
          }
        } catch (e) { }
      }

      try {
        // Fetch from DynamoDB (Metadata)
        const dynRes = await fetch(`/api/profile?id=${encodeURIComponent(id!)}`); // Use state id
        let dynData_profile = null;
        if (dynRes.ok) {
           const data = await dynRes.json();
           if (data.success && data.profile) {
                dynData_profile = data.profile;
           }
        }

        // Fetch from S3 (Images) - Always fetch to get latest images
        const s3Res = await fetch(`/bff/api/get-profiles?id=${encodeURIComponent(id!)}`);
        const s3Data = await s3Res.json();
        let s3Images: string[] = [];

        if (s3Data.success && s3Data.data && s3Data.data.images) {
            let imgs = s3Data.data.images;
            if (!Array.isArray(imgs)) imgs = [imgs];
            s3Images = imgs.map((i: any) => i.full_path);
        }

        let finalProfile: any = null;

        if (dynData_profile) {
            // Merge: Use DynamoDB metadata, but prefer S3 images if available
            finalProfile = { ...dynData_profile };
            if (s3Images.length > 0) {
                finalProfile.images = s3Images;
            }
            // Ensure images array exists
            if (!finalProfile.images) finalProfile.images = [];
        } else if (s3Images.length > 0) {
            // Fallback: If no DynamoDB profile, try to build from S3 data (Legacy/Fallback)
            finalProfile = {
                id: id!,
                name: queryName || 'Aliya', // Fallback name
                age: '23', // Fallback age
                gender: 'female',
                description: 'Ahmedabad Escort Service - Contact for Booking and Inquiries.',
                location: 'Ahmedabad',
                images: s3Images,
            };
        }

        if (finalProfile) {
            setProfile(finalProfile);
            if (finalProfile.images && finalProfile.images.length > 0) {
                setSelectedImage(finalProfile.images[0]);
            }
            // Save Cache (skip on localhost)
            if (!isLocal) {
              try {
                  localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: finalProfile }));
              } catch(e) {}
            }
        } else {
             setError('Profile not found');
        }

      } catch (err) {
        console.error(err);
        setError('An error occurred while fetching profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-gray-300 mb-8">{error || 'Profile not found'}</p>
        <Link href="/" className="px-6 py-2 bg-pink-600 rounded-full hover:bg-pink-700 transition">
          Back to Home
        </Link>
      </div>
    );
  }

  // Use the profile state
  const { name, age, gender, description, location } = profile;
  const images = profile.images || [];

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-100 font-sans pb-14 md:pb-12">
      {/* Dynamic Style Injection */}
      {profile.customCss && (
          <style dangerouslySetInnerHTML={{ __html: profile.customCss }} />
      )}
      
      {/* Header / Nav */}
      <nav className="p-4 bg-black/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-pink-400 hover:text-pink-300 transition" title="Home">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
              </svg>
            </Link>
          </div>
          {/* Breadcrumb: Country > State > City > Place */}
          <div className="flex flex-wrap items-center gap-1 text-sm text-gray-400">
            <Link href="/" className="hover:text-pink-300 transition">Home</Link>
            {profile.country && (
              <><span className="text-gray-600">&rsaquo;</span><span className="text-gray-300">{profile.country}</span></>
            )}
            {profile.state && (
              <><span className="text-gray-600">&rsaquo;</span><span className="text-gray-300">{profile.state}</span></>
            )}
            {profile.city && (
              <><span className="text-gray-600">&rsaquo;</span><span className="text-gray-300">{profile.city}</span></>
            )}
            {profile.place && (
              <><span className="text-gray-600">&rsaquo;</span><span className="text-pink-300">{profile.place}</span></>
            )}
          </div>
        </div>
      </nav>

      {/* Admin Quick Actions — top bar */}
      {isAdmin && (
        <div className="bg-blue-950/80 border-b border-blue-700/40 px-4 py-2 flex items-center gap-3">
          <span className="text-blue-300 text-xs font-semibold uppercase tracking-widest">Admin</span>
          <Link
            href={`/admin/profile?id=${id}`}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-1.5 px-5 rounded-full shadow transition"
          >
            ✏️ Edit / Manage Profile
          </Link>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* SEO Section above images */}
        <div className="mb-6 bg-gradient-to-r from-black/60 via-fuchsia-950/40 to-black/60 rounded-2xl p-5 border border-white/5">
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-yellow-300 mb-2">
            {profile.seoTitle || `${name || 'Escort'} - Call Girl in ${profile.city || profile.location || 'Ahmedabad'}`}
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            {profile.seoDescription || `${name || 'Independent escort'} available in ${profile.place ? profile.place + ', ' : ''}${profile.city || profile.location || 'Ahmedabad'}${profile.state ? ', ' + profile.state : ''}. Genuine, verified profile with real photos. Book now for premium escort services.`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={name || 'Profile Image'}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-2 custom-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img ? 'border-pink-500 ring-2 ring-pink-500/50' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col gap-6">
            <div className="bg-black/40 p-6 md:p-8 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl">
              <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-300 mb-2">
                {name || 'Unknown'}
              </h2>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {age && (
                  <span className="bg-pink-600/20 text-pink-300 px-3 py-1 rounded-full text-sm font-semibold border border-pink-500/30">
                    {age} Years Old
                  </span>
                )}
                {(profile.city || location) && (
                  <span className="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-500/30">
                    📍 {profile.city || location}{profile.state ? `, ${profile.state}` : ''}{profile.country ? `, ${profile.country}` : ''}
                  </span>
                )}
                {profile.place && (
                  <span className="bg-teal-600/20 text-teal-300 px-3 py-1 rounded-full text-sm font-semibold border border-teal-500/30">
                    📌 {profile.place}
                  </span>
                )}
                {profile.district && (
                  <span className="bg-indigo-600/20 text-indigo-300 px-3 py-1 rounded-full text-sm font-semibold border border-indigo-500/30">
                    {profile.district}
                  </span>
                )}
                {gender && (
                  <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm font-semibold border border-purple-500/30 capitalize">
                    {gender}
                  </span>
                )}
                {/* Extra Properties */}
                {profile.extraProperties && Object.entries(profile.extraProperties).map(([key, value]) => (
                   <span key={key} className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold border border-blue-500/30">
                     <strong className="text-white/80 mr-1">{key}:</strong> {value}
                   </span>
                ))}
              </div>

              <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">About Me</h2>
                <div className="whitespace-pre-line text-gray-200 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: description || 'No description available.' }} />
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
                <a 
                  href={PHONE_TEL} 
                  className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                >
                  <span className="text-2xl">📞</span>
                  <span>Call Now for Booking</span>
                </a>
                <a 
                  href={`${WHATSAPP_URL}?text=${encodeURIComponent(`hello, ${name || 'Aliya'} I saw your profile on Aliya Escort`)}`}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-3 w-full mt-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                >
                  <span className="text-2xl">💬</span>
                  <span>WhatsApp Me</span>
                </a>
                <p className="text-center text-xs text-gray-500 mt-4">
                  * you can directly call for the service.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews & Ratings */}
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
          {/* Overall Rating */}
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

          {/* Add Review Form */}
          <div className="mt-10 bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4">📝 Write a Review</h3>
            {reviewSuccess ? (
              <div className="text-center py-6">
                <p className="text-green-400 text-lg font-semibold mb-2">✓ Thank you for your review!</p>
                <p className="text-gray-400 text-sm">Your review has been submitted successfully.</p>
                <button onClick={() => setReviewSuccess(false)} className="mt-4 text-pink-400 hover:text-pink-300 text-sm underline">Write another review</button>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!id || submittingReview) return;
                if (reviewForm.text.trim().length < 5) return;
                setSubmittingReview(true);
                try {
                  const res = await fetch('/api/profile/review', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, name: reviewForm.name || 'Anonymous', rating: reviewForm.rating, text: reviewForm.text }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    const newReview = data.review || { name: reviewForm.name || 'Anonymous', rating: reviewForm.rating, text: reviewForm.text, date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) };
                    setReviews(prev => [newReview, ...prev].slice(0, 7));
                    setReviewForm({ name: '', rating: 5, text: '' });
                    setReviewSuccess(true);
                  }
                } catch {} finally { setSubmittingReview(false); }
              }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Name (optional)</label>
                    <input
                      type="text"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Anonymous"
                      maxLength={50}
                      className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Rating</label>
                    <div className="flex gap-1 items-center h-[38px]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm(p => ({ ...p, rating: star }))}
                          className={`text-2xl transition ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400/50'}`}
                        >★</button>
                      ))}
                      <span className="ml-2 text-sm text-gray-400">{reviewForm.rating}/5</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Your Review</label>
                  <textarea
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm(p => ({ ...p, text: e.target.value }))}
                    placeholder="Share your experience..."
                    maxLength={500}
                    rows={3}
                    required
                    minLength={5}
                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 placeholder-gray-500 resize-none"
                  />
                  <p className="text-right text-xs text-gray-500 mt-1">{reviewForm.text.length}/500</p>
                </div>
                <button
                  type="submit"
                  disabled={submittingReview || reviewForm.text.trim().length < 5}
                  className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-400 hover:to-fuchsia-400 text-white font-semibold rounded-xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </section>
        )}
      </main>

      {/* Footer Sections */}
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
                We are Ahmedabad&apos;s most trusted escort agency, providing discreet and professional companionship services.
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
                <li><Link href="/" className="text-gray-400 hover:text-pink-300 transition">Home</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300 transition">All Profiles</a></li>
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

      {/* Mobile sticky bottom bar — Call & WhatsApp */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="flex">
          <a href={PHONE_TEL} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white font-bold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            Call Now
          </a>
          <a href={`${WHATSAPP_URL}?text=${encodeURIComponent(`hello, ${name || 'Aliya'} I saw your profile on Aliya Escort`)}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.29-1.248l-.308-.184-2.87.852.852-2.87-.184-.308A8 8 0 1112 20z"/></svg>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
