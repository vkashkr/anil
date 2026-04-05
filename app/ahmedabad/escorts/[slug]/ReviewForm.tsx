'use client';

import { useState } from 'react';

interface Props {
  profileId: string;
}

export default function ReviewForm({ profileId }: Props) {
  const [form, setForm] = useState({ name: '', rating: 5, text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <div className="text-center py-6">
        <p className="text-green-400 text-lg font-semibold mb-2">✓ Thank you for your review!</p>
        <p className="text-gray-400 text-sm">Your review has been submitted successfully.</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-pink-400 hover:text-pink-300 text-sm underline"
        >
          Write another review
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!profileId || submitting || form.text.trim().length < 5) return;
        setSubmitting(true);
        try {
          const res = await fetch('/api/profile/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: profileId,
              name: form.name || 'Anonymous',
              rating: form.rating,
              text: form.text,
            }),
          });
          const data = await res.json();
          if (data.success) {
            setForm({ name: '', rating: 5, text: '' });
            setSuccess(true);
          }
        } catch {
          // silent fail
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Name (optional)</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
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
                onClick={() => setForm((p) => ({ ...p, rating: star }))}
                className={`text-2xl transition ${star <= form.rating ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400/50'}`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-400">{form.rating}/5</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Your Review</label>
        <textarea
          value={form.text}
          onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
          placeholder="Share your experience..."
          maxLength={500}
          rows={3}
          required
          minLength={5}
          className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 placeholder-gray-500 resize-none"
        />
        <p className="text-right text-xs text-gray-500 mt-1">{form.text.length}/500</p>
      </div>

      <button
        type="submit"
        disabled={submitting || form.text.trim().length < 5}
        className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-400 hover:to-fuchsia-400 text-white font-semibold rounded-xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
