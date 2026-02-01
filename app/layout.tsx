import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aliya escort",
  description: "Local girls for escort services in Ahmedabad, Gujarat. Contact us for companionship and adult services.",
  icons: {
    icon: '/aliya-logo-A-4-improved.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-black via-fuchsia-950 to-gray-900`}
      >
        <header className="w-full z-20 relative flex flex-col items-center justify-center py-6 px-2 bg-black/70 backdrop-blur-lg border-b border-fuchsia-700/40 shadow-lg">
          <div className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-500 to-yellow-300 text-3xl md:text-4xl drop-shadow-pink animate-pulse tracking-wide select-none">
            Aliya-Escort
          </div>
        </header>
        <main className="relative z-10 min-h-[80vh] flex flex-col">
          {children}
        </main>
        <footer className="w-full z-20 fixed left-0 bottom-0 bg-black/80 backdrop-blur-lg border-t border-fuchsia-700/40 shadow-2xl flex flex-col items-center py-4 px-2">
          <div className="flex gap-4 mb-1">
            <a href="tel:+919974599843" className="call-btn call font-bold text-lg px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-yellow-400 text-white shadow-lg hover:scale-105 hover:from-yellow-400 hover:to-pink-500 transition-all duration-200">Call Now</a>
            <a href="https://wa.me/919974599843?text=Hello, %20Aliya%20Escort%20 Ahmedabad" className="call-btn whatsapp font-bold text-lg px-6 py-2 rounded-full bg-gradient-to-r from-green-400 via-fuchsia-500 to-pink-400 text-white shadow-lg hover:scale-105 hover:from-pink-400 hover:to-green-400 transition-all duration-200">WhatsApp</a>
          </div>
          <div className="text-xs md:text-sm text-gray-200 text-center font-normal mt-1">
            <span className="inline-flex items-center gap-2 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-fuchsia-500 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
              18+ DISCLAIMER:
            </span>
            <span className="ml-2 text-gray-200 font-medium">This website offers adult services intended for individuals 18 years and older.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
