'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminEditButton({ slug }: { slug: string }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isAdminFlag = localStorage.getItem('admin_auth_ui_flag');
    if (isAdminFlag === 'true') {
      setIsAdmin(true);
    }
  }, []);

  if (!isAdmin) return null;

  return (
    <button
      onClick={() => router.push(`/admin/stories/edit/${encodeURIComponent(slug)}`)}
      className="fixed bottom-4 right-4 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-full shadow-lg z-50 flex items-center gap-2 transition-transform hover:scale-105"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      Edit Story
    </button>
  );
}
