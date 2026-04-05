import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h2 className="text-4xl font-bold mb-4 text-fuchsia-500">Page Not Found</h2>
      <p className="mb-8 text-gray-300">Could not find requested resource</p>
      <Link 
        href="/"
        className="px-6 py-3 bg-fuchsia-600 rounded-full font-bold hover:bg-fuchsia-700 transition"
      >
        Return Home
      </Link>
    </div>
  );
}
