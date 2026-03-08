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
  title: {
    default: "Call Girls in Ahmedabad | Premium Escort Service | Aliya Escort",
    template: "%s | Aliya Escort Ahmedabad",
  },
  description: "Looking for call girls in Ahmedabad? Aliya Escort provides genuine, independent, and high-profile call girls directly to your hotel or home. 100% safe & trusted service.",
  keywords: ["call girls in ahmedabad", "ahmedabad call girls", "escort service ahmedabad", "independent call girls", "college girls ahmedabad", "housewife escort", "vip escort service", "russian call girls", "night out girls", "female escort ahmedabad"],
  alternates: {
    canonical: 'https://www.aliyaescort.com',
  },
  openGraph: {
    title: "Call Girls in Ahmedabad | Aliya Escort Service",
    description: "Book specific verified call girls in Ahmedabad. No advance needed. 24/7 service available.",
    url: 'https://www.aliyaescort.com',
    siteName: 'Aliya Escort Ahmedabad',
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AdultEntertainment", // Or "LocalBusiness" if preferred
  "name": "Aliya Escort Ahmedabad",
  "image": "https://www.aliyaescort.com/aliya-logo-A-4-improved.svg",
  "description": "Premium call girl and escort agency in Ahmedabad offering independent and high-profile companions.",
  "url": "https://www.aliyaescort.com",
  "telephone": "+919974599843",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "SG Highway",
    "addressLocality": "Ahmedabad",
    "addressRegion": "Gujarat",
    "postalCode": "380054",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 23.0225,
    "longitude": 72.5714
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    "opens": "00:00",
    "closes": "23:59"
  },
  "priceRange": "₹1000 - ₹10000"
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <main className="relative z-10 min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
