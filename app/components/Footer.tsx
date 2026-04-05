'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  // Hide footer on admin pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/upload') || pathname?.startsWith('/login') || pathname?.startsWith('/Ahmedabad/escorts')) {
    return null;
  }

  return (
    <>
      {/* Toggle button - shows when footer is hidden */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed bottom-4 right-4 z-30 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-yellow-400 text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-all duration-200 animate-pulse"
          aria-label="Show footer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}

      {/* Footer */}
      {isVisible && (
        <footer className="w-full z-20 fixed left-0 bottom-0 bg-black/80 backdrop-blur-lg border-t border-fuchsia-700/40 shadow-2xl flex flex-col items-center py-1 px-2 transition-all duration-300">
          {/* Hide button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-1 right-2 text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Hide footer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className="flex gap-3">
            <a href="tel:+919974599843" className="call-btn call font-bold text-sm px-4 py-0.5 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-yellow-400 text-white shadow-lg hover:scale-105 hover:from-yellow-400 hover:to-pink-500 transition-all duration-200">Call Now</a>
            <a href="https://wa.me/919974599843?text=Hello, %20Aliya%20Escort%20 Ahmedabad" className="call-btn whatsapp font-bold text-sm px-4 py-0.5 rounded-full bg-gradient-to-r from-green-400 via-fuchsia-500 to-pink-400 text-white shadow-lg hover:scale-105 hover:from-pink-400 hover:to-green-400 transition-all duration-200">WhatsApp</a>
          </div>
          <div className="text-xs md:text-sm text-gray-200 text-center font-normal">
            <span className="inline-flex items-center gap-2 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-fuchsia-500 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
              18+ DISCLAIMER:
            </span>
            <span className="ml-2 text-gray-200 font-medium">This website offers adult services intended for individuals 18 years and older.</span>
          </div>
        </footer>
      )}
    </>
  );
}
