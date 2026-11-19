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
  metadataBase: new URL('https://www.aliyaescort.com'),
  title: {
    default: "Ahmedabad Escort Profiles & Local Listings | Aliya Escort",
    template: "%s",
  },
  description: "Explore Ahmedabad escort profiles, neighborhood listings, contact options, and local profile information. Browse adults-only listings from the Aliya Escort directory.",
  keywords: ["Ahmedabad escort", "Ahmedabad escorts", "escort Ahmedabad", "escort service in Ahmedabad", "call girl Ahmedabad", "Ahmedabad escort service", "call girl in Ahmedabad", "Ahmedabad call girl"],
  alternates: {
    canonical: 'https://www.aliyaescort.com/',
  },
  openGraph: {
    title: "Ahmedabad Escort Profiles & Local Listings",
    description: "Browse Ahmedabad profile listings and local contact information in one clear directory.",
    url: 'https://www.aliyaescort.com/',
    siteName: 'Aliya Escort',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ahmedabad Escort Profiles & Local Listings',
    description: "Browse Ahmedabad profile listings and local contact information on Aliya Escort.",
    site: '@AliyaEscort',
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
  "@type": "Organization",
  "@id": "https://www.aliyaescort.com/#business",
  "name": "Aliya Escort",
  "image": "https://www.aliyaescort.com/aliya-logo-A-4-improved.svg",
  "description": "Adults-only directory for browsing escort and companionship profiles in Ahmedabad, Gujarat.",
  "url": "https://www.aliyaescort.com/",
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
  "sameAs": ["https://wa.me/919974599843"]
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://www.aliyaescort.com/#website',
  'url': 'https://www.aliyaescort.com/',
  'name': 'Aliya Escort',
  'description': 'Ahmedabad escort profile directory and local listings.',
  'potentialAction': {
    '@type': 'SearchAction',
    'target': {
      '@type': 'EntryPoint',
      'urlTemplate': 'https://www.aliyaescort.com/ahmedabad/escorts?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <head>
        {/* Preconnect to external origins for faster LCP */}
        <link rel="preconnect" href="https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com" />
        <link rel="dns-prefetch" href="//4k1gg1dlc3.execute-api.us-east-1.amazonaws.com" />
        {/* Geographic targeting meta tags */}
        <meta name="geo.region" content="IN-GJ" />
        <meta name="geo.placename" content="Ahmedabad" />
        <meta name="geo.position" content="23.0225;72.5714" />
        <meta name="ICBM" content="23.0225, 72.5714" />
        {/* JSON-LD structured data in <head> for optimal crawler discovery */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-black via-fuchsia-950 to-gray-900`}
      >
        <main className="relative z-10 min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
