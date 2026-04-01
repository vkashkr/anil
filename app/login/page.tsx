'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleGoogleResponse = useCallback(async (response: any) => {
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(data.message || 'Google sign-in failed');
      }
    } catch {
      setError('Something went wrong with Google sign-in.');
    }
  }, [router, callbackUrl]);

  useEffect(() => {
    if (googleLoaded && window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      const btnEl = document.getElementById('google-login-btn');
      if (btnEl) {
        window.google.accounts.id.renderButton(btnEl, {
          theme: 'filled_black',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'rectangular',
        });
      }
    }
  }, [googleLoaded, handleGoogleResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return;
    setLoading(true);

    try {
      const res = await fetch('/api/auth/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-black to-fuchsia-950">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-300 bg-red-900/30 border border-red-500/30 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-lg hover:from-pink-500 hover:to-fuchsia-500 disabled:opacity-50 transition-all"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="text-gray-500 text-xs">OR</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* Google Sign-In */}
        <div id="google-login-btn" className="flex justify-center"></div>

        <p className="text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <a href="/login/signup" className="text-pink-400 hover:text-pink-300 underline">Sign up</a>
        </p>
      </div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGoogleLoaded(true)}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
