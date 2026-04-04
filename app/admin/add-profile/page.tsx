'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result as string;
      resolve(r.split(',')[1] ?? r);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AddProfilePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    id: '',
    name: '',
    age: '',
    gender: 'female',
    city: 'Ahmedabad',
    place: '',
    location: 'Ahmedabad',
    description: '',
  });

  useEffect(() => {
    setForm(prev => ({ ...prev, id: crypto.randomUUID() }));
  }, []);

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [extraPhotos, setExtraPhotos] = useState<File[]>([]);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const extraPhotosRef = useRef<HTMLInputElement>(null);

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleProfilePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePhoto(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
  };

  const handleExtraPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setExtraPhotos(files);
    setExtraPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removeExtra = (idx: number) => {
    setExtraPhotos(prev => prev.filter((_, i) => i !== idx));
    setExtraPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) return setError('Name is required.');
    if (!form.age) return setError('Age is required.');
    if (!profilePhoto) return setError('Profile photo is required.');

    setSubmitting(true);
    try {
      const metadata = {
        id: form.id,
        name: form.name.trim(),
        age: form.age,
        gender: form.gender,
        city: form.city,
        place: form.place,
        location: form.location || form.city,
        description: form.description,
      };

      // Build payload array: profile photo first (filename = profile.jpg), then extras
      const payload = [];

      const profileB64 = await fileToBase64(profilePhoto);
      payload.push({
        image: profileB64,
        filename: 'profile.jpg',  // must end with profile.jpg so it's the primary image
        metadata,
      });

      for (const file of extraPhotos) {
        const b64 = await fileToBase64(file);
        payload.push({
          image: b64,
          filename: file.name,
          metadata,
        });
      }

      const res = await fetch('/bff/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      const ok = Array.isArray(data)
        ? data.every((d: { success?: boolean }) => d.success !== false)
        : data.success;

      if (!ok) {
        setError(data.error || 'Upload failed.');
        return;
      }

      // Fetch real S3 image URLs for this profile
      const imgRes = await fetch(`/bff/api/get-profiles?id=${encodeURIComponent(form.id)}`);
      const imgData = await imgRes.json();
      const uploadedImages: { full_path: string }[] =
        imgData?.data?.images ?? (Array.isArray(imgData?.data) ? imgData.data : []);
      const imagePaths = uploadedImages.map((i) => i.full_path).filter(Boolean);

      // Save profile to DynamoDB and publish HTML to S3
      const profilePayload = {
        id: form.id,
        name: form.name.trim(),
        age: form.age,
        gender: form.gender,
        country: 'India',
        state: 'Gujarat',
        district: '',
        city: form.city,
        place: form.place,
        location: form.location || form.city,
        description: form.description,
        services: [] as string[],
        images: imagePaths,
        isVisible: true,
        updatedAt: new Date().toISOString(),
      };

      const saveRes = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', profile: profilePayload }),
      });
      const saveData = await saveRes.json();
      if (!saveData.success) {
        setError('Images uploaded but profile save failed: ' + (saveData.message || 'unknown error'));
        return;
      }

      // Revalidate cached pages so the new profile appears immediately
      await fetch('/api/admin/revalidate', { method: 'POST' }).catch(() => {});
      setSuccess('Profile created and published! Redirecting to editor…');
      setTimeout(() => router.push(`/admin/profile?id=${form.id}`), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-fuchsia-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-yellow-300">
              Add New Profile
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Create a new escort profile and upload photos</p>
          </div>
          <button
            onClick={() => router.push('/admin/profile')}
            className="text-gray-400 hover:text-white text-sm border border-white/10 px-3 py-1.5 rounded-lg transition"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info Card */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Basic Info</h2>

            {/* ID row */}
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Profile ID</label>
                <input
                  type="text"
                  value={form.id}
                  onChange={e => set('id', e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => set('id', crypto.randomUUID())}
                className="px-3 py-2 text-xs bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition whitespace-nowrap"
              >
                New UUID
              </button>
            </div>

            {/* Name + Age */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name <span className="text-pink-400">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Age <span className="text-pink-400">*</span></label>
                <input
                  type="number"
                  value={form.age}
                  onChange={e => set('age', e.target.value)}
                  placeholder="22"
                  min="18"
                  max="60"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  required
                />
              </div>
            </div>

            {/* Gender + City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={e => set('gender', e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="transgender">Transgender</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => { set('city', e.target.value); set('location', e.target.value); }}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                />
              </div>
            </div>

            {/* Place / Area */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Area / Locality</label>
              <input
                type="text"
                value={form.place}
                onChange={e => set('place', e.target.value)}
                placeholder="e.g. Satellite, Vastrapur"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={3}
                placeholder="Short bio for the profile…"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
              />
            </div>
          </div>

          {/* Photos Card */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Photos</h2>

            {/* Profile photo */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">
                Profile Photo <span className="text-pink-400">*</span>
                <span className="text-gray-600 ml-1">(displayed as main card photo)</span>
              </label>
              <input
                ref={profilePhotoRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePhoto}
                className="hidden"
              />
              {profilePhotoPreview ? (
                <div className="flex items-center gap-4">
                  <img
                    src={profilePhotoPreview}
                    alt="Profile preview"
                    className="w-24 h-24 object-cover rounded-xl border border-pink-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => profilePhotoRef.current?.click()}
                    className="text-xs text-gray-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => profilePhotoRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/15 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-500 hover:border-pink-500/40 hover:text-gray-300 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">Click to select profile photo</span>
                </button>
              )}
            </div>

            {/* Extra photos */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">
                Additional Photos
                <span className="text-gray-600 ml-1">(optional — gallery images)</span>
              </label>
              <input
                ref={extraPhotosRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleExtraPhotos}
                className="hidden"
              />
              {extraPreviews.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    {extraPreviews.map((src, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={src}
                          alt={`extra ${i}`}
                          className="w-20 h-20 object-cover rounded-lg border border-white/10"
                        />
                        <button
                          type="button"
                          onClick={() => removeExtra(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => extraPhotosRef.current?.click()}
                    className="text-xs text-gray-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition"
                  >
                    + Add more
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => extraPhotosRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/10 rounded-xl py-5 flex flex-col items-center gap-1 text-gray-600 hover:border-white/20 hover:text-gray-400 transition"
                >
                  <span className="text-sm">+ Add gallery photos</span>
                </button>
              )}
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="p-3 text-sm text-red-300 bg-red-900/30 border border-red-500/30 rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-green-300 bg-green-900/30 border border-green-500/30 rounded-xl">
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white font-bold text-sm hover:from-pink-500 hover:to-fuchsia-500 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Uploading & Publishing…
              </>
            ) : (
              'Create & Publish Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
