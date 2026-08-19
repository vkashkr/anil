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
    default: "Ahmedabad escorts, Gujarat, India",
    template: "%s",
  },
  description: "Aliya Escort — Ahmedabad's most trusted escort directory since 2020. Browse real, verified independent call girls for incall & outcall across Gujarat. 24/7, no advance payment.",
  keywords: ["ahmedabad escort", "escort service ahmedabad", "call girls in ahmedabad", "ahmedabad call girls", "ahmedabad escort service", "independent call girls ahmedabad", "college girls ahmedabad", "housewife escort ahmedabad", "vip escort service", "russian call girls ahmedabad", "night out girls ahmedabad", "female escort ahmedabad", "local call girls ahmedabad", "escort girls ahmedabad", "cheap escort ahmedabad"],
  alternates: {
    canonical: 'https://www.aliyaescort.com/',
  },
  openGraph: {
    title: "Aliya Escort Ahmedabad | Premium Call Girl Service",
    description: "Aliya Escort — Ahmedabad's most trusted escort directory. Real profiles, verified photos, 24/7 incall & outcall across Gujarat.",
    url: 'https://www.aliyaescort.com/',
    siteName: 'Aliya Escort Ahmedabad',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aliya Escort Ahmedabad | Premium Call Girl Service',
    description: "Ahmedabad's most trusted escort directory. Real profiles, 24/7 incall & outcall, no advance payment.",
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
  "@type": "LocalBusiness",
  "@id": "https://www.aliyaescort.com/#business",
  "name": "Aliya Escort Ahmedabad",
  "image": "https://www.aliyaescort.com/aliya-logo-A-4-improved.svg",
  "description": "Premium call girl and escort agency in Ahmedabad offering independent and high-profile companions.",
  "url": "https://www.aliyaescort.com/",
  "telephone": "+919157204082",
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
  "sameAs": [
    "https://wa.me/919157204082"
  ],
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    }
  ],
  "priceRange": "₹1000 - ₹10000"
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://www.aliyaescort.com/#website',
  'url': 'https://www.aliyaescort.com/',
  'name': 'Aliya Escort Ahmedabad',
  'description': 'Ahmedabad escort service – verified independent call girls 24/7.',
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
        {/* hreflang for Indian English audiences */}
        <link rel="alternate" hrefLang="en-IN" href="https://www.aliyaescort.com/" />
        <link rel="alternate" hrefLang="x-default" href="https://www.aliyaescort.com/" />
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
