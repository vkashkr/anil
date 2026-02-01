import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";

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
        <Footer />
      </body>
    </html>
  );
}
